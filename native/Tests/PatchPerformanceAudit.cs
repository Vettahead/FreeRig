using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
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
        [DllImport("kernel32.dll")]
        static extern IntPtr GetCurrentThread();
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool QueryThreadCycleTime(IntPtr thread, out ulong cycles);
        static ulong Cycles()
        {
            ulong value;
            if (!QueryThreadCycleTime(GetCurrentThread(), out value))
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
            return value;
        }
        // Cycles are relative work evidence, NOT a convertible duration. Preserve pairing before
        // sorting.
        static void Summary(List<string> lines, string name, long[] ticks, ulong[] cycles,
                            int frames, int rate)
        {
            double deadline = (double)frames / rate * Stopwatch.Frequency;
            int misses = ticks.Count(t => t > deadline);
            var sorted = ticks.OrderBy(t => t).ToArray();
            lines.Add(String.Format(System.Globalization.CultureInfo.InvariantCulture,
                                    "{0}: median {1:F1}%; p99 {2:F1}%; max {3:F1}%; missed {4}/{5}",
                                    name, sorted[ticks.Length / 2] / deadline * 100,
                                    sorted[(ticks.Length - 1) * 99 / 100] / deadline * 100,
                                    sorted[ticks.Length - 1] / deadline * 100, misses,
                                    ticks.Length));
            foreach (bool silent in new[] { false, true })
            {
                var indices = Enumerable.Range(0, ticks.Length)
                                  .Where(i => (i * frames % (rate * 3) >= rate * 3 / 2) == silent)
                                  .ToArray();
                if (indices.Length == 0)
                    continue;
                var durations = indices.Select(i => ticks[i]).OrderBy(t => t).ToArray();
                var work = indices.Select(i => cycles[i]).OrderBy(c => c).ToArray();
                double medianCycles = work[work.Length / 2];
                lines.Add(String.Format(
                    System.Globalization.CultureInfo.InvariantCulture,
                    "  {0} input: median {1:F1}%; p99 {2:F1}%; median thread cycles {3:F0}",
                    silent ? "Silent" : "Signal", durations[durations.Length / 2] / deadline * 100,
                    durations[(durations.Length - 1) * 99 / 100] / deadline * 100, medianCycles));
                foreach (int i in indices.OrderByDescending(i => ticks[i]).Take(3))
                    lines.Add(String.Format(
                        System.Globalization.CultureInfo.InvariantCulture,
                        "    block {0}: wall {1:F1}%; cycles {2}; work/phase-median {3:F2}x", i,
                        ticks[i] / deadline * 100, cycles[i],
                        medianCycles == 0 ? 0 : cycles[i] / medianCycles));
            }
        }
        public static void TestSummary(List<string> report)
        {
            var lines = new List<string>();
            var ticks = new long[] { 10, 1000, 20, 30, 40, 50 };
            var cycles = new ulong[] { 100, 101, 100, 100, 100, 100 };
            Summary(lines, "fixture", ticks, cycles, 1, 2);
            if (ticks[1] != 1000 ||
                !lines.Any(l => l.Contains("block 1:") && l.Contains("cycles 101")) ||
                !lines.Any(l => l.Contains("Silent input")))
                throw new Exception(
                    "Offline timing summary lost paired wall/work samples or silent classification.");
            report.Add(
                "PASS: offline timing summaries preserve wall/cycle pairing and distinguish source silence.");
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
                    var cycles = new ulong[blocks];
                    using (var live = new LiveGraph(patch, rate, assets, frames))
                    {
                        var provider = new LiveProvider(rate);
                        long allocated = GC.GetAllocatedBytesForCurrentThread();
                        int collections = GC.CollectionCount(0);
                        for (int b = -rate / frames; b < blocks; b++)
                        {
                            Signal(source, Math.Max(0, b) * frames, rate);
                            ulong workStarted = Cycles();
                            long started = Stopwatch.GetTimestamp();
                            live.Render(source, frames);
                            provider.Samples = live.Left;
                            provider.RightSamples = live.Right;
                            provider.Count = frames;
                            provider.Read(bytes, 0, bytes.Length);
                            long elapsed = Stopwatch.GetTimestamp() - started;
                            ulong work = Cycles() - workStarted;
                            if (b >= 0)
                            {
                                ticks[b] = elapsed;
                                cycles[b] = work;
                            }
                        }
                        long bytesAllocated = GC.GetAllocatedBytesForCurrentThread() - allocated;
                        lines.Add(
                            "Full loop allocation including warm-up: " + bytesAllocated +
                            " bytes; gen0 collections: " + (GC.CollectionCount(0) - collections));
                    }
                    Summary(lines, "Graph plus final stereo output", ticks, cycles, frames, rate);
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
                        var stageCycles = processors.Select(p => new ulong[blocks]).ToArray();
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
                                ulong workStarted = Cycles();
                                long started = Stopwatch.GetTimestamp();
                                p.Process(frames);
                                long elapsed = Stopwatch.GetTimestamp() - started;
                                ulong work = Cycles() - workStarted;
                                if (b >= 0)
                                {
                                    stageTicks[n][b] = elapsed;
                                    stageCycles[n][b] = work;
                                }
                            }
                        }
                        for (int n = 0; n < processors.Count; n++)
                            Summary(lines,
                                    ordered[n].id + " " + (ordered[n].assetName ?? ordered[n].key) +
                                        " (" +
                                        (patch.scenes[patch.scene][ordered[n].id].on ? "on"
                                                                                     : "bypassed") +
                                        ")",
                                    stageTicks[n], stageCycles[n], frames, rate);
                    }
                    finally
                    {
                        foreach (var p in processors)
                            p.Dispose();
                    }
                }
                lines.Add(
                    "Warmed synthetic signal/silence; stopwatch includes OS pre-emption. Stage and full-chain runs are separate; percentiles cannot be added. No live driver timing or round-trip latency measured.");
                lines.Add(
                    "Thread cycles are relative work, not milliseconds; frequency/core migration and counter overhead limit interpretation. Large wall spikes with ordinary cycles suggest time off-thread, not a proven driver/process cause. Silent input can retain effect tails. Instrumentation exists only in this offline command.");
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
