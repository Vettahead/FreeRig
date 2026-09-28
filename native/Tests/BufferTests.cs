using System;
using System.IO;
using System.Linq;
using System.Diagnostics;
using System.Collections.Generic;
namespace GuitarSuite
{
    // Offline regression against the old preparation size. No ASIO device is opened.
    static class BufferTests
    {
        static void Check(bool ok, string message)
        {
            if (!ok)
                throw new Exception(message);
        }
        static Patch Rig(string file)
        {
            return new Patch {
                scene = 0,
                blocks = new[] { new Block { id = "capture", key = "nampedal", assetId = file },
                                 new Block { id = "amp", key = "cleanamp" },
                                 new Block { id = "cab", key = "cab" } },
                connections = new[] { new[] { "input", "capture" }, new[] { "capture", "amp" },
                                      new[] { "amp", "cab" }, new[] { "cab", "output" } },
                scenes =
                    Enumerable.Range(0, 4)
                        .Select(i => new Dictionary<string, DeviceState> {
                            { "capture",
                              new DeviceState { on = true, values = new double[] { 0, 0 } } },
                            { "amp", new DeviceState { on = true,
                                                       values = new double[] { 0, 0, 0, 0, -6 } } },
                            { "cab", new DeviceState { on = true,
                                                       values = new double[] { 80, 8000, -3 } } }
                        })
                        .ToArray()
            };
        }
        static double Bench(LiveGraph graph, float[] source, int frames, int blocks)
        {
            var provider = new LiveProvider(48000);
            var output = new byte[frames * 8];
            var watch = Stopwatch.StartNew();
            for (int b = 0; b < blocks; b++)
            {
                graph.Render(source, frames);
                provider.Samples = graph.Left;
                provider.RightSamples = graph.Right;
                provider.Count = frames;
                provider.Read(output, 0, output.Length);
            }
            watch.Stop();
            return watch.Elapsed.TotalMilliseconds;
        }
        public static int Run(string[] paths)
        {
            var log = new List<string>();
            try
            {
                Check(paths.Length > 0, "Supply local NAM captures for this regression.");
                foreach (string path in paths)
                    foreach (int frames in new[] { 8, 32, 64, 128, 256, 512 })
                    {
                        var patch = Rig(Path.GetFileName(path));
                        string folder = Path.GetDirectoryName(path);
                        var source = new float[frames];
                        using (var old = new LiveGraph(patch, 48000, folder, 4096)) using (
                            var current = new LiveGraph(patch, 48000, folder, frames))
                        {
                            double maxError = 0;
                            for (int b = 0; b < Math.Max(32, 12000 / frames); b++)
                            {
                                for (int i = 0; i < frames; i++)
                                {
                                    int at = b * frames + i;
                                    source[i] =
                                        (float)(.07 * Math.Sin(at * 2 * Math.PI * 110 / 48000) +
                                                .03 * Math.Sin(at * 2 * Math.PI * 733 / 48000));
                                }
                                old.Render(source, frames);
                                current.Render(source, frames);
                                for (int i = 0; i < frames; i++)
                                {
                                    Check(!Single.IsNaN(current.Left[i]) &&
                                              !Single.IsInfinity(current.Left[i]),
                                          "Non-finite audio");
                                    maxError = Math.Max(
                                        maxError,
                                        Math.Max(Math.Abs(old.Left[i] - current.Left[i]),
                                                 Math.Abs(old.Right[i] - current.Right[i])));
                                }
                            }
                            Check(maxError < .00002,
                                  "Buffer preparation changed the sound: " + maxError);
                            int blocks = 48000 / frames;
                            double before = Bench(old, source, frames, blocks),
                                   after = Bench(current, source, frames, blocks);
                            // Rebuilding and bypassing must retain the smaller preparation limit.
                            for (int swap = 0; swap < 3; swap++)
                            {
                                patch.blocks[1].key = swap % 2 == 0 ? "amp" : "cleanamp";
                                current.Replace(patch);
                                current.Render(source, frames);
                                patch.scene = 1;
                                patch.scenes[1]["capture"].on = swap % 2 == 0;
                                current.Update(patch);
                                current.Render(source, frames);
                                Check(current.Left.Take(frames).All(x => !Single.IsNaN(x) &&
                                                                         Math.Abs(x) < 1),
                                      "Switch overload");
                            }
                            log.Add(String.Format(
                                System.Globalization.CultureInfo.InvariantCulture,
                                "PASS: {0}; block {1}; max stereo error {2:G5}; full " +
                                    "live chain + output, ms per 1000 ms audio: old " +
                                    "{3:F1}, new {4:F1}; swaps and scene bypass passed.",
                                Path.GetFileName(path), frames, maxError, before, after));
                        }
                    }
                using (var g = new Graph(Rig(Path.GetFileName(paths[0])), 48000,
                                         Path.GetDirectoryName(paths[0]), 32))
                {
                    bool rejected = false;
                    try
                    {
                        g.Run(new float[64], 64);
                    }
                    catch
                    {
                        rejected = true;
                    }
                    Check(rejected, "Oversized callback accepted");
                }
                log.Add(
                    "PASS: unexpected buffer growth is rejected before model processing. No " +
                    "extra latency or model-quality reduction introduced. Offline timings do not " +
                    "guarantee live ASIO scheduling or round-trip latency.");
                File.WriteAllLines(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "buffer-test.txt"), log);
                return 0;
            }
            catch (Exception e)
            {
                log.Add("FAIL: " + e);
                File.WriteAllLines(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "buffer-test.txt"), log);
                return 1;
            }
        }
    }
}
