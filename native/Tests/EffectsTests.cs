using System;
using System.Linq;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;
using System.Diagnostics;
namespace GuitarSuite
{
    static class EffectsTests
    {
        sealed class Entry
        {
            public string key;
            public object[][] @params;
            public int latency;
        }
        sealed class Preset
        {
            public string name;
            public double[] values;
        }
        sealed class PresetDevice
        {
            public string key;
            public Preset[] presets;
        }
        static void Check(bool ok, string message)
        {
            if (!ok)
                throw new Exception(message);
        }
        public static void Run(List<string> lines)
        {
            foreach (int rate in new[] { 44100, 48000, 96000 })
                foreach (double frequency in new[] { 41.203, 73.416, 82.407, 110, 146.832, 195.998,
                                                     246.942, 329.628, 659.255 })
                {
                    IntPtr t = Effects.tuner_load(rate);
                    Check(t != IntPtr.Zero, "Tuner initialise");
                    try
                    {
                        var input = new float[128];
                        for (int b = 0; b < rate * 2 / 128; b++)
                        {
                            for (int i = 0; i < 128; i++)
                            {
                                double phase = 2 * Math.PI * frequency * (b * 128 + i) / rate;
                                input[i] =
                                    (float)(.14 * Math.Sin(phase) + .07 * Math.Sin(2 * phase) +
                                            .03 * Math.Sin(3 * phase));
                            }
                            Effects.tuner_process(t, input, 128);
                        }
                        double hz = Effects.tuner_hz(t);
                        Check(hz > 0 && Math.Abs(1200 * Math.Log(hz / frequency, 2)) < 3,
                              "Tuner accuracy: " + rate + " / " + frequency + " detected " + hz);
                        Array.Clear(input, 0, 128);
                        for (int b = 0; b < rate / 128; b++)
                            Effects.tuner_process(t, input, 128);
                        Check(Effects.tuner_hz(t) == 0, "Tuner silence retains note");
                    }
                    finally
                    {
                        Effects.tuner_free(t);
                    }
                }
            lines.Add(
                "PASS: Cycfi Q tuner, 27 rich-harmonic guitar/bass pitch cases at 44.1/48/96 " +
                "kHz within 3 cents, silence clears note.");
            var entries = new JavaScriptSerializer().Deserialize<Entry[]>(
                Marshal.PtrToStringAnsi(Effects.fx_catalogue()));
            // Exercise the shipped starting settings, including usable gate thresholds.
            var startingPresets = new JavaScriptSerializer().Deserialize<PresetDevice[]>(
                System.IO.File.ReadAllText(System.IO.Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory, "effect-presets.json")));
            foreach (int rate in new[] { 44100, 48000, 96000 })
                foreach (var e in entries)
                {
                    IntPtr fx = Effects.fx_load(e.key, rate);
                    Check(fx != IntPtr.Zero, "Effect load " + e.key);
                    try
                    {
                        var p = startingPresets.First(d => d.key == e.key).presets[0].values;
                        Check(Effects.fx_set(fx, p, p.Length) == 1, "Effect defaults " + e.key);
                        var l = new float[128];
                        var r = new float[128];
                        double energy = 0, difference = 0;
                        for (int b = 0; b < rate * 2 / 128; b++)
                        {
                            for (int i = 0; i < 128; i++)
                            {
                                l[i] = b < rate / 128
                                           ? (float)(.08 * Math.Sin(2 * Math.PI * 220 *
                                                                    (b * 128 + i) / rate))
                                           : 0;
                                r[i] = b < rate / 128
                                           ? (float)(.04 * Math.Sin(2 * Math.PI * 330 *
                                                                    (b * 128 + i) / rate))
                                           : 0;
                            }
                            Check(Effects.fx_process(fx, l, r, 128) == 1, "Non-finite " + e.key);
                            for (int i = 0; i < 128; i++)
                            {
                                energy += Math.Abs(l[i]) + Math.Abs(r[i]);
                                difference += Math.Abs(l[i] - r[i]);
                                Check(Math.Abs(l[i]) < 8 && Math.Abs(r[i]) < 8,
                                      "Unbounded effect " + e.key);
                            }
                        }
                        Check(energy > .01, "Silent effect " + e.key);
                        Check(difference > .01, "Collapsed stereo " + e.key);
                        var invalid = p.Length == 0 ? new[] { Double.NaN } : (double[])p.Clone();
                        invalid[0] = Double.NaN;
                        Check(Effects.fx_set(fx, invalid, invalid.Length) == 0,
                              "Non-finite parameter accepted");
                    }
                    finally
                    {
                        Effects.fx_free(fx);
                    }
                }
            lines.Add("PASS: " + entries.Length +
                      (" effects, stereo asymmetry, finite bounded output, tail processing and " +
                       "invalid parameter rejection at 44.1/48/96 kHz."));
            foreach (var key in new[] { "CloudSeed", "EchoKing", "PhotonVibe", "TriPhase",
                                        "GraphicEQ", "Wah", "EnvelopeFilter", "GrainCloud",
                                        "ReverseEcho", "PhraseLooper", "Vocoder" })
                foreach (int rate in new[] { 44100, 48000, 96000 })
                {
                    var entry = entries.First(e => e.key == key);
                    var controls = new DeviceState {
                        on = false,
                        values = entry.@params.Select(a => Convert.ToDouble(a[3])).ToArray()
                    };
                    var rig = new Patch {
                        scene = 0, tempo = 120,
                        blocks = new[] { new Block { id = "newfx", key = "fx-" + key } },
                        connections =
                            new[] { new[] { "input", "newfx" }, new[] { "newfx", "output" } },
                        scenes =
                            Enumerable.Range(0, 4)
                                .Select(i => new Dictionary<string, DeviceState> { { "newfx",
                                                                                     controls } })
                                .ToArray()
                    };
                    using (var graph = new Graph(rig, rate, ""))
                    {
                        var input = Enumerable.Range(0, 32)
                                        .Select(i => (float)(.06 * Math.Sin(i * .17)))
                                        .ToArray();
                        for (int cycle = 0; cycle < 4; cycle++)
                        {
                            controls = new DeviceState {
                                on = cycle % 2 == 0,
                                values = entry.@params.Select(a => Convert.ToDouble(a[3])).ToArray()
                            };
                            rig.scenes[0]["newfx"] = controls;
                            graph.Update(rig);
                            float[] result = null;
                            for (int b = 0; b < rate / 32; b++)
                            {
                                result = graph.Run(input, 32);
                                Check(result.Take(32).All(x => !Single.IsNaN(x) &&
                                                               !Single.IsInfinity(x) &&
                                                               Math.Abs(x) < 8),
                                      "Imported effect toggle fault " + key);
                            }
                            if (!controls.on)
                                Check(
                                    result.Take(32).Select((x, i) => Math.Abs(x - input[i])).Max() <
                                        .00001,
                                    "Imported bypass not dry " + key);
                        }
                    }
                }
            lines.Add("PASS: eleven effects, repeated graph bypass/re-engage at 32 samples " +
                      "and 44.1/48/96 kHz; bypass restores dry input.");
            var presets = new JavaScriptSerializer().Deserialize<PresetDevice[]>(
                System.IO.File.ReadAllText(System.IO.Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory, "effect-presets.json")));
            foreach (int rate in new[] { 44100, 48000, 96000 })
                foreach (var device in presets)
                    foreach (var preset in device.presets)
                    {
                        var fx = Effects.fx_load(device.key, rate);
                        Check(fx != IntPtr.Zero, "Preset load");
                        try
                        {
                            Check(Effects.fx_set(fx, preset.values, preset.values.Length) == 1,
                                  "Invalid preset " + device.key + " " + preset.name);
                            var l = new float[4096];
                            var r = new float[4096];
                            int at = 0;
                            foreach (int size in new[] { 1, 17, 32, 64, 127, 256, 1024, 4096, 128 })
                            {
                                for (int i = 0; i < size; i++)
                                {
                                    l[i] = (float)(.08 *
                                                   Math.Sin(2 * Math.PI * 196 * (at + i) / rate));
                                    r[i] = (float)(.04 *
                                                   Math.Sin(2 * Math.PI * 330 * (at + i) / rate));
                                }
                                at += size;
                                Check(Effects.fx_process(fx, l, r, size) == 1,
                                      "Preset/buffer failed " + device.key + " " + preset.name);
                                Check(l.Take(size).All(x => Math.Abs(x) < 8) &&
                                          r.Take(size).All(x => Math.Abs(x) < 8),
                                      "Preset overload " + device.key);
                            }
                        }
                        finally
                        {
                            Effects.fx_free(fx);
                        }
                    }
            lines.Add("PASS: " + presets.Sum(d => d.presets.Length) +
                      (" factory presets at 44.1/48/96 kHz, host blocks " +
                       "1/17/64/127/256/1024/4096/128, finite bounded stereo output."));
            var provider =
                new LiveProvider(48000) { Samples = new float[128], RightSamples = new float[128],
                                          Count = 128, Gain = 1 };
            provider.Samples[0] = .2f;
            provider.RightSamples[0] = -.1f;
            var bytes = new byte[1024];
            provider.Read(bytes, 0, 1024);
            Check(BitConverter.ToSingle(bytes, 0) > 0 && BitConverter.ToSingle(bytes, 4) < 0,
                  "Stereo output lost");
            var ph = entries.First(e => e.key == "SurgePhaser");
            var settings = new DeviceState {
                on = false, values = ph.@params.Select(a => Convert.ToDouble(a[3])).ToArray()
            };
            var patch = new Patch {
                scene = 0, tempo = 120,
                blocks = new[] { new Block { id = "p", key = "fx-SurgePhaser" } },
                connections = new[] { new[] { "input", "p" }, new[] { "p", "output" },
                                      new[] { "input", "output" } },
                scenes = Enumerable.Range(0, 4)
                             .Select(i => new Dictionary<string, DeviceState> { { "p", settings } })
                             .ToArray()
            };
            using (var graph = new Graph(patch, 48000, ""))
            {
                var impulse = new float[128];
                impulse[0] = .2f;
                var output = graph.Run(impulse, 128);
                Check(Math.Abs(output[16] - .4f) < .00001 && output.Take(16).All(x => x == 0),
                      "Parallel bypass latency not aligned");
            }
            lines.Add("PASS: independent output channels and delayed dry/bypass paths aligned at " +
                      "parallel joins.");
            var delayState = new DeviceState { on = true, sync = 3,
                                               values = new double[] { 380, 0, 0, 0, 100 } };
            patch.blocks = new[] { new Block { id = "p", key = "fx-DiffuseDelay" } };
            patch.connections = new[] { new[] { "input", "p" }, new[] { "p", "output" } };
            patch.scenes =
                Enumerable.Range(0, 4)
                    .Select(i => new Dictionary<string, DeviceState> { { "p", delayState } })
                    .ToArray();
            using (var graph = new Graph(patch, 48000, ""))
            {
                var impulse = new float[128];
                int arrival = -1;
                for (int b = 0; b < 180; b++)
                {
                    Array.Clear(impulse, 0, 128);
                    if (b == 0)
                        impulse[0] = .2f;
                    var output = graph.Run(impulse, 128);
                    for (int i = 0; i < 128; i++)
                        if (arrival < 0 && Math.Abs(output[i]) > .1)
                            arrival = b * 128 + i;
                }
                Check(arrival == 18000, "Dotted eighth sync expected 375 ms, got " + arrival);
            }
            lines.Add(
                "PASS: tempo-synced dotted eighth produces its first repeat at 375 ms at 120 BPM.");
            string stereoPath =
                System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "test-stereo-ir.wav");
            using (var writer = new NAudio.Wave.WaveFileWriter(
                       stereoPath, NAudio.Wave.WaveFormat.CreateIeeeFloatWaveFormat(48000, 2)))
            {
                writer.WriteSample(.5f);
                writer.WriteSample(-.25f);
                for (int i = 1; i < 128; i++)
                {
                    writer.WriteSample(0);
                    writer.WriteSample(0);
                }
            }
            var ir = Nam.gs_load(stereoPath, 48000, 4096);
            Check(ir != IntPtr.Zero, "Stereo IR load");
            try
            {
                var x = new float[128];
                x[0] = 1;
                var l = new float[128];
                var r = new float[128];
                Check(Nam.gs_process_stereo(ir, x, l, r, 128) == 1 &&
                          Math.Abs(l[0] - .5f) < .0001 && Math.Abs(r[0] + .25f) < .0001,
                      "Stereo IR channels were collapsed");
            }
            finally
            {
                Nam.gs_free(ir);
            }
            lines.Add("PASS: stereo cabinet IR preserves distinct left/right responses.");
            var keys =
                new[] { "SurgeDelay", "DragonHall", "StereoChorus", "Spring", "SurgePhaser" };
            var handles = keys.Select(k => Effects.fx_load(k, 48000)).ToArray();
            try
            {
                var l = new float[128];
                var r = new float[128];
                var watch = Stopwatch.StartNew();
                for (int b = 0; b < 1000; b++)
                {
                    for (int i = 0; i < 128; i++)
                        l[i] = r[i] =
                            (float)(.1 * Math.Sin(2 * Math.PI * 220 * (b * 128 + i) / 48000));
                    foreach (var h in handles)
                        Check(Effects.fx_process(h, l, r, 128) == 1, "Chain failed");
                }
                watch.Stop();
                lines.Add("PASS: five-effect stereo chain processed 2667 ms audio in " +
                          watch.ElapsedMilliseconds + " ms (offline, not an ASIO guarantee).");
            }
            finally
            {
                foreach (var h in handles)
                    Effects.fx_free(h);
            }
        }
    }
}
