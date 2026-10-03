using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;

namespace GuitarSuite
{
    static class CallbackIsolationTests
    {
        public static void Run(List<string> lines)
        {
            SteadyRenderAllocation();
            foreach (int rate in new[] { 44100, 48000, 96000 })
                foreach (int frames in new[] { 32, 64, 128 })
                {
                    var patch =
                        new Patch { blocks = new Block[0],
                                    connections = new[] { new[] { "input", "output" } },
                                    scenes = Enumerable.Range(0, 4)
                                                 .Select(i => new Dictionary<string, DeviceState>())
                                                 .ToArray() };
                    using (var live = new LiveGraph(patch, rate, "", frames))
                    {
                        var input = Enumerable.Repeat(.1f, frames).ToArray();
                        for (int i = 0; i < rate / frames; i++)
                            live.Render(input, frames);
                        var gate = typeof(LiveGraph)
                                       .GetField("controlGate",
                                                 BindingFlags.Instance | BindingFlags.NonPublic)
                                       .GetValue(live);
                        Exception failure = null;
                        using (var finished = new ManualResetEvent(false))
                        {
                            var reader = new Thread(() =>
                                                    {
                                                        try
                                                        {
                                                            live.Render(input, frames);
                                                        }
                                                        catch (Exception e)
                                                        {
                                                            failure = e;
                                                        }
                                                        finally
                                                        {
                                                            finished.Set();
                                                        }
                                                    });
                            bool completed;
                            // Hold the control lock deliberately: rendering must proceed.
                            lock (gate)
                            {
                                reader.Start();
                                completed = finished.WaitOne(2000);
                            }
                            reader.Join();
                            if (!completed || failure != null ||
                                live.Left.Take(frames).Any(x => Math.Abs(x - .1f) > 1e-6))
                                throw new Exception(
                                    "Audio callback waited for control work or changed unity audio.",
                                    failure);
                        }
                        Exception renderFailure = null;
                        int rendered = 0;
                        using (var stop = new ManualResetEvent(false)) using (
                            var started = new ManualResetEvent(false))
                        {
                            var reader = new Thread(() =>
                                                    {
                                                        try
                                                        {
                                                            while (!stop.WaitOne(0))
                                                            {
                                                                live.Render(input, frames);
                                                                Interlocked.Increment(ref rendered);
                                                                started.Set();
                                                            }
                                                        }
                                                        catch (Exception e)
                                                        {
                                                            renderFailure = e;
                                                        }
                                                    });
                            reader.Start();
                            try
                            {
                                if (!started.WaitOne(2000))
                                    throw new Exception("Render worker did not start.");
                                for (int i = 0; i < 100; i++)
                                {
                                    live.Replace(patch);
                                    live.Update(patch);
                                }
                                live.Dispose();
                            }
                            finally
                            {
                                stop.Set();
                                reader.Join();
                            }
                        }
                        if (renderFailure != null || rendered == 0)
                            throw new Exception("Concurrent graph retirement failed.",
                                                renderFailure);
                    }
                }
            ScenePublication();
            lines.Add(
                "PASS: callback independent of held control lock; 100 concurrent swaps, updates and disposal at 44.1/48/96 kHz and 32/64/128 frames.");
        }
        static void SteadyRenderAllocation()
        {
            foreach (int frames in new[] { 32, 64, 128 })
            {
                var patch = new Patch {
                    blocks = new[] { new Block { id = "a", key = "amp" },
                                     new Block { id = "c", key = "cab" } },
                    connections = new[] { new[] { "input", "a" }, new[] { "a", "c" },
                                          new[] { "c", "output" } },
                    scenes =
                        Enumerable.Range(0, 4)
                            .Select(i => new Dictionary<string, DeviceState> {
                                { "a",
                                  new DeviceState { on = true,
                                                    values = new[] { 0.0, 0.0, 0.0, 0.0, -6.0 } } },
                                { "c", new DeviceState { on = true,
                                                         values = new[] { 80.0, 8000.0, -3.0 } } }
                            })
                            .ToArray()
                };
                using (var live = new LiveGraph(patch, 48000, "", frames))
                {
                    var input = Enumerable.Repeat(.1f, frames).ToArray();
                    var bytes = new byte[frames * 8];
                    var provider = new LiveProvider(
                        48000) { Samples = live.Left, RightSamples = live.Right, Count = frames };
                    for (int i = 0; i < 1000; i++)
                    {
                        live.Render(input, frames);
                        provider.Read(bytes, 0, bytes.Length);
                    }
                    long before = GC.GetAllocatedBytesForCurrentThread();
                    for (int i = 0; i < 1000; i++)
                    {
                        live.Render(input, frames);
                        provider.Read(bytes, 0, bytes.Length);
                    }
                    long allocated = GC.GetAllocatedBytesForCurrentThread() - before;
                    if (allocated != 0)
                        throw new Exception("Unchanged amp/cab rendering allocated " + allocated +
                                            " bytes.");
                }
            }
        }
        static void ScenePublication()
        {
            var patch = new Patch {
                blocks = new[] { new Block { id = "a", key = "nampedal" },
                                 new Block { id = "b", key = "nampedal" } },
                connections =
                    new[] { new[] { "input", "a" }, new[] { "a", "b" }, new[] { "b", "output" } },
                scenes =
                    Enumerable.Range(0, 4)
                        .Select(i => new Dictionary<string, DeviceState> {
                            { "a", new DeviceState { on = true,
                                                     values = new[] { 0.0, i % 2 == 0 ? 12.0
                                                                                      : -12.0 } } },
                            { "b", new DeviceState { on = true,
                                                     values = new[] { 0.0, i % 2 == 0 ? -12.0
                                                                                      : 12.0 } } }
                        })
                        .ToArray()
            };
            using (var live = new LiveGraph(patch, 48000, "", 32)) using (
                var stop = new ManualResetEvent(false)) using (var started =
                                                                   new ManualResetEvent(false))
            {
                var input = Enumerable.Repeat(.1f, 32).ToArray();
                for (int i = 0; i < 100; i++)
                    live.Render(input, 32);
                Exception failure = null;
                var reader = new Thread(
                    () =>
                    {
                        try
                        {
                            while (!stop.WaitOne(0))
                            {
                                live.Render(input, 32);
                                if (live.Left.Take(32).Any(x => Math.Abs(x - .1f) > 1e-6))
                                    throw new Exception(
                                        "Callback combined controls from different scenes.");
                                started.Set();
                            }
                        }
                        catch (Exception e)
                        {
                            failure = e;
                        }
                    });
                reader.Start();
                try
                {
                    if (!started.WaitOne(2000))
                        throw new Exception("Scene reader did not start.");
                    for (int i = 0; i < 10000; i++)
                    {
                        patch.scene = i % 4;
                        live.Update(patch);
                    }
                }
                finally
                {
                    stop.Set();
                    reader.Join();
                }
                if (failure != null)
                    throw failure;
            }
        }
    }
}
