using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NAudio.Dsp;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;

namespace GuitarSuite
{
    // Developer-only comparison of optional pedal -> NAM -> IR graph processing
    // against separate processor calls and explicit cuts. Never opens audio hardware.
    static class CaptureChainAudit
    {
        sealed class EffectEntry
        {
            public string key;
            public object[][] @params;
        }
        public static int Run(string model, string cabinet, string drive = null)
        {
            var lines = new List<string>();
            string folder = Path.GetDirectoryName(model);
            bool capturedPedal =
                drive != null && drive.EndsWith(".nam", StringComparison.OrdinalIgnoreCase);
            try
            {
                if (folder != Path.GetDirectoryName(cabinet))
                    throw new Exception("Audit model and IR must be in the same folder.");
                foreach (int frames in new[] { 32, 64, 128 })
                {
                    var patch = new Patch {
                        blocks = new[] { new Block { id = "a", key = "amp",
                                                     assetId = Path.GetFileName(model) },
                                         new Block { id = "c", key = "cab",
                                                     assetId = Path.GetFileName(cabinet) } },
                        connections = new[] { new[] { "input", "a" }, new[] { "a", "c" },
                                              new[] { "c", "output" } },
                        scenes =
                            Enumerable.Range(0, 4)
                                .Select(i => new Dictionary<string, DeviceState> {
                                    { "a", new DeviceState { on = true,
                                                             values = new[] { 0.0, 0, 0, 0, 0 } } },
                                    { "c", new DeviceState { on = true,
                                                             values = new[] { 80.0, 8000, 0 } } }
                                })
                                .ToArray()
                    };
                    double[] pedalValues = null;
                    if (drive != null)
                    {
                        if (capturedPedal)
                        {
                            if (!DeviceLibrary.SafeAsset(drive))
                                throw new Exception(
                                    "Pass a pedal filename in the same library folder.");
                            pedalValues = new[] { 0.0, 0.0 };
                        }
                        else
                        {
                            var entry = new JavaScriptSerializer()
                                            .Deserialize<EffectEntry[]>(
                                                Marshal.PtrToStringAnsi(Effects.fx_catalogue()))
                                            .First(e => e.key == drive);
                            // Minimum drive tests the reported case. Preserve the circuit's normal
                            // level/tone settings; this is not an automatic loudness compensation.
                            pedalValues =
                                entry.@params
                                    .Select(p => Convert.ToDouble((string)p[0] == "Drive" ||
                                                                          (string)p[0] == "Fuzz"
                                                                      ? p[1]
                                                                      : p[3]))
                                    .ToArray();
                        }
                        patch.blocks =
                            (new[] { new Block { id = "d",
                                                 key = capturedPedal ? "nampedal" : "fx-" + drive,
                                                 assetId = capturedPedal ? drive : null } })
                                .Concat(patch.blocks)
                                .ToArray();
                        patch.connections = new[] { new[] { "input", "d" }, new[] { "d", "a" },
                                                    new[] { "a", "c" }, new[] { "c", "output" } };
                        foreach (var scene in patch.scenes)
                            scene["d"] = new DeviceState { on = true, values = pedalValues };
                    }
                    IntPtr amp = IntPtr.Zero, cab = IntPtr.Zero, pedal = IntPtr.Zero;
                    try
                    {
                        if (drive != null)
                        {
                            pedal = capturedPedal
                                        ? Nam.gs_load(Path.Combine(folder, drive), 48000, frames)
                                        : Effects.fx_load(drive, 48000);
                            if (pedal == IntPtr.Zero ||
                                (!capturedPedal &&
                                 Effects.fx_set(pedal, pedalValues, pedalValues.Length) == 0))
                                throw new Exception("Audit drive could not load.");
                        }
                        amp = Nam.gs_load(model, 48000, frames);
                        cab = Nam.gs_load(cabinet, 48000, frames);
                        if (amp == IntPtr.Zero || cab == IntPtr.Zero)
                            throw new Exception(Nam.Error);
                        using (var graph = new Graph(patch, 48000, folder, frames))
                        {
                            var source = new float[frames];
                            var raw = new float[frames];
                            var l = new float[frames];
                            var r = new float[frames];
                            var driven = new float[frames];
                            var drivenRight = new float[frames];
                            var hpL = BiQuadFilter.HighPassFilter(48000, 80, .707f);
                            var hpR = BiQuadFilter.HighPassFilter(48000, 80, .707f);
                            var lpL = BiQuadFilter.LowPassFilter(48000, 8000, .707f);
                            var lpR = BiQuadFilter.LowPassFilter(48000, 8000, .707f);
                            double difference = 0, ampPeak = 0, cabPeak = 0;
                            for (int at = 0; at < 96000; at += frames)
                            {
                                for (int i = 0; i < frames; i++)
                                {
                                    double t = (at + i) / 48000.0;
                                    source[i] = t < 1
                                                    ? (float)(.12 * Math.Exp(-t / .4) *
                                                              (Math.Sin(2 * Math.PI * 82.41 * t) +
                                                               Math.Sin(2 * Math.PI * 123.47 * t) +
                                                               Math.Sin(2 * Math.PI * 164.81 * t)))
                                                    : 0;
                                }
                                Array.Copy(source, driven, frames);
                                Array.Copy(source, drivenRight, frames);
                                if (pedal != IntPtr.Zero &&
                                    (capturedPedal ? Nam.gs_process(pedal, source, driven, frames)
                                                   : Effects.fx_process(pedal, driven, drivenRight,
                                                                        frames)) == 0)
                                    throw new Exception("Reference drive returned invalid audio.");
                                if (Nam.gs_process(amp, driven, raw, frames) == 0 ||
                                    Nam.gs_process_stereo(cab, raw, l, r, frames) == 0)
                                    throw new Exception("Reference chain returned invalid audio.");
                                var actual = graph.Run(source, frames);
                                for (int i = 0; i < frames; i++)
                                {
                                    float expectedL = lpL.Transform(hpL.Transform(l[i]));
                                    float expectedR = lpR.Transform(hpR.Transform(r[i]));
                                    ampPeak = Math.Max(ampPeak, Math.Abs(raw[i]));
                                    cabPeak = Math.Max(cabPeak, Math.Max(Math.Abs(expectedL),
                                                                         Math.Abs(expectedR)));
                                    difference = Math.Max(
                                        difference, Math.Max(Math.Abs(actual[i] - expectedL),
                                                             Math.Abs(graph.Right[i] - expectedR)));
                                }
                            }
                            if (difference > .00002)
                                throw new Exception("Graph differs from reference chain: " +
                                                    difference);
                            lines.Add(String.Format(
                                System.Globalization.CultureInfo.InvariantCulture,
                                "PASS: {0} frames; max difference {1:G4}; NAM peak {2:F6}; post-IR peak {3:F6} (unity device/master gain, synthetic chord).",
                                frames, difference, ampPeak, cabPeak));
                        }
                    }
                    finally
                    {
                        if (pedal != IntPtr.Zero)
                        {
                            if (capturedPedal)
                                Nam.gs_free(pedal);
                            else
                                Effects.fx_free(pedal);
                        }
                        if (amp != IntPtr.Zero)
                            Nam.gs_free(amp);
                        if (cab != IntPtr.Zero)
                            Nam.gs_free(cab);
                    }
                }
                lines.Add(
                    "Offline only. Does not reproduce the user's hardware gain, current patch controls or monitoring chain.");
            }
            catch (Exception e)
            {
                lines.Add("FAIL: " + e);
            }
            File.WriteAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
                                            drive == null ? "capture-chain-audit.txt"
                                                          : "drive-chain-" + drive + "-audit.txt"),
                               lines);
            return lines.Any(s => s.StartsWith("FAIL")) ? 1 : 0;
        }
    }
}
