using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace GuitarSuite
{
    // An intentionally hot, exactly linear capture reveals hidden inter-stage
    // saturation. Later attenuation must recover the waveform, not a clipped copy.
    static class CaptureHeadroomTests
    {
        public static void Run(List<string> lines)
        {
            string folder = Path.Combine(Path.GetTempPath(), "FreeRig-headroom-" + Guid.NewGuid());
            Directory.CreateDirectory(folder);
            try
            {
                foreach (int rate in new[] { 44100, 48000, 96000 })
                {
                    string file = "hot.nam";
                    File.WriteAllText(
                        Path.Combine(folder, file),
                        "{\"version\":\"0.5.4\",\"architecture\":\"Linear\",\"config\":{\"receptive_field\":1,\"bias\":false},\"weights\":[100],\"sample_rate\":" +
                            rate + "}");
                    foreach (int frames in new[] { 32, 64, 128 })
                    {
                        var patch = new Patch {
                            blocks =
                                new[] { new Block { id = "capture", key = "amp", assetId = file },
                                        new Block { id = "trim", key = "nampedal" } },
                            connections =
                                new[] { new[] { "input", "capture" }, new[] { "capture", "trim" },
                                        new[] { "trim", "output" } },
                            scenes =
                                Enumerable.Range(0, 4)
                                    .Select(i => new Dictionary<string, DeviceState> {
                                        { "capture",
                                          new DeviceState { on = true,
                                                            values = new[] { 0.0, 0, 0, 0, 0 } } },
                                        { "trim", new DeviceState { on = true,
                                                                    values = new[] { 0.0, -30 } } }
                                    })
                                    .ToArray()
                        };
                        using (var graph = new Graph(patch, rate, folder, frames))
                        {
                            var input = new float[frames];
                            for (int block = 0; block < 40; block++)
                            {
                                for (int i = 0; i < frames; i++)
                                    input[i] = (float)(.3 * Math.Sin(2 * Math.PI * 997 *
                                                                     (block * frames + i) / rate));
                                var output = graph.Run(input, frames);
                                for (int i = 0; i < frames; i++)
                                    if (Math.Abs(output[i] - input[i] * 100 * Math.Pow(10, -1.5)) >
                                        .00001)
                                        throw new Exception(
                                            "Capture was clipped before downstream attenuation.");
                            }
                            patch.scenes[0]["capture"].on = false;
                            graph.Update(patch);
                            for (int n = 0; n < rate / frames; n++)
                                graph.Run(input, frames);
                            var bypass = graph.Run(input, frames);
                            for (int i = 0; i < frames; i++)
                                if (Math.Abs(bypass[i] - input[i] * Math.Pow(10, -1.5)) > .00001)
                                    throw new Exception(
                                        "Hot capture bypass did not settle to dry input.");
                        }
                    }
                }
                lines.Add(
                    "PASS: 100x NAM capture preserves floating-point headroom through downstream -30 dB trim and bypass at 44.1/48/96 kHz and 32/64/128 frames.");
            }
            finally
            {
                File.Delete(Path.Combine(folder, "hot.nam"));
                Directory.Delete(folder);
            }
        }
    }
}
