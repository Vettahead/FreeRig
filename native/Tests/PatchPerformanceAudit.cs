using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web.Script.Serialization;

namespace GuitarSuite
{
    // Offline serial-patch cost audit. No driver, recording, or asset mutation.
    static class PatchPerformanceAudit
    {
        sealed class Export
        {
            public Patch rig;
        }
        static void Summary(List<string> lines, string name, long[] ticks, int frames, int rate)
        {
            double deadline = (double)frames / rate * Stopwatch.Frequency;
            int misses = ticks.Count(t => t > deadline);
            Array.Sort(ticks);
            lines.Add(String.Format(System.Globalization.CultureInfo.InvariantCulture,
                                    "{0}: median {1:F1}%; p99 {2:F1}%; max {3:F1}%; missed {4}/{5}",
                                    name, ticks[ticks.Length / 2] / deadline * 100,
                                    ticks[(ticks.Length - 1) * 99 / 100] / deadline * 100,
                                    ticks[ticks.Length - 1] / deadline * 100, misses,
                                    ticks.Length));
        }
        static void Signal(float[] samples, int at, int rate)
        {
            for (int i = 0; i < samples.Length; i++)
            {
                double t = (at + i) / (double)rate;
                samples[i] = t % 3 < 1.5 ? (float)(.08 * (Math.Sin(t * 2 * Math.PI * 82.41) +
                                                          Math.Sin(t * 2 * Math.PI * 164.81)))
                                         : 0;
            }
        }
        public static int Run(string path, string assets)
        {
            var lines = new List<string>();
            try
            {
                string json = File.ReadAllText(path);
                foreach (int frames in new[] { 32, 64, 128 })
                {
                    const int rate = 48000;
                    var patch = new JavaScriptSerializer { MaxJsonLength = 4000000 }
                                    .Deserialize<Export>(json)
                                    .rig;
                    var ordered = new List<Block>();
                    string at = "input";
                    while (at != "output")
                    {
                        at = patch.connections.Single(e => e[0] == at)[1];
                        if (at == "output")
                            break;
                        if (ordered.Any(b => b.id == at))
                            throw new Exception("Cycle in serial audit.");
                        ordered.Add(patch.blocks.Single(b => b.id == at));
                    }
                    if (ordered.Count != patch.blocks.Length ||
                        patch.connections.Length != ordered.Count + 1)
                        throw new Exception("Performance stage audit requires a serial patch.");
                    lines.Add("48 kHz / " + frames + " frames / saved scene " + patch.scene);
                    int blocks = rate * 6 / frames;
                    var source = new float[frames];
                    var bytes = new byte[frames * 8];
                    var ticks = new long[blocks];
                    using (var live = new LiveGraph(patch, rate, assets, frames))
                    {
                        var provider = new LiveProvider(rate);
                        long allocated = GC.GetAllocatedBytesForCurrentThread();
                        int collections = GC.CollectionCount(0);
                        for (int b = -rate / frames; b < blocks; b++)
                        {
                            Signal(source, Math.Max(0, b) * frames, rate);
                            long started = Stopwatch.GetTimestamp();
                            live.Render(source, frames);
                            provider.Samples = live.Left;
                            provider.RightSamples = live.Right;
                            provider.Count = frames;
                            provider.Read(bytes, 0, bytes.Length);
                            long elapsed = Stopwatch.GetTimestamp() - started;
                            if (b >= 0)
                                ticks[b] = elapsed;
                        }
                        long bytesAllocated = GC.GetAllocatedBytesForCurrentThread() - allocated;
                        lines.Add(
                            "Full loop allocation including warm-up: " + bytesAllocated +
                            " bytes; gen0 collections: " + (GC.CollectionCount(0) - collections));
                    }
                    Summary(lines, "Graph plus final stereo output", ticks, frames, rate);
                    var processors = new List<StereoProcessor>();
                    try
                    {
                        foreach (var block in ordered)
                        {
                            var p = new StereoProcessor(block, patch.scenes[patch.scene][block.id],
                                                        rate, assets, frames);
                            p.Update(patch.scenes[patch.scene][block.id], patch.tempo,
                                     patch.calibrationDbU);
                            processors.Add(p);
                        }
                        var stageTicks = processors.Select(p => new long[blocks]).ToArray();
                        for (int b = -rate / frames; b < blocks; b++)
                        {
                            Signal(source, Math.Max(0, b) * frames, rate);
                            for (int n = 0; n < processors.Count; n++)
                            {
                                var p = processors[n];
                                Array.Copy(n == 0 ? source : processors[n - 1].Buffer, p.Buffer,
                                           frames);
                                Array.Copy(n == 0 ? source : processors[n - 1].Right, p.Right,
                                           frames);
                                long started = Stopwatch.GetTimestamp();
                                p.Process(frames);
                                long elapsed = Stopwatch.GetTimestamp() - started;
                                if (b >= 0)
                                    stageTicks[n][b] = elapsed;
                            }
                        }
                        for (int n = 0; n < processors.Count; n++)
                            Summary(lines,
                                    ordered[n].id + " " + (ordered[n].assetName ?? ordered[n].key) +
                                        " (" +
                                        (patch.scenes[patch.scene][ordered[n].id].on ? "on"
                                                                                     : "bypassed") +
                                        ")",
                                    stageTicks[n], frames, rate);
                    }
                    finally
                    {
                        foreach (var p in processors)
                            p.Dispose();
                    }
                }
                lines.Add(
                    "Warmed synthetic signal/silence; stopwatch includes OS pre-emption. Stage and full-chain runs are separate; percentiles cannot be added. No live driver timing or round-trip latency measured.");
            }
            catch (Exception e)
            {
                lines.Add("FAIL: " + e);
            }
            File.WriteAllLines(
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "patch-performance-audit.txt"),
                lines);
            return lines.Any(l => l.StartsWith("FAIL:")) ? 1 : 0;
        }
    }
}
