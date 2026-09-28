using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Owns graph handover. Prepare replacement graphs outside the audio callback.
    sealed class LiveGraph : IDisposable
    {
        readonly object gate = new object();
        Graph graph;
        readonly int rate, maxFrames;
        readonly string assets;
        public readonly float[] Left = new float[4096], Right = new float[4096];
        int transition;
        float lastL, lastR, fromL, fromR;
        bool faulted;
        public LiveGraph(Patch patch, int rate, string assets, int maxFrames = 4096)
        {
            this.rate = rate;
            this.assets = assets;
            this.maxFrames = maxFrames;
            Replace(patch);
        }
        public void Replace(Patch patch)
        {
            Graph next = new Graph(patch, rate, assets, maxFrames);
            // Prepare with the actual driver block size: NAM's working matrices scale with
            // this limit. Oversizing to 4096 makes tiny callbacks needlessly expensive.
            // Warm in bounded chunks without buffering or delaying the live signal.
            try
            {
                var silence = new float[maxFrames];
                for (int remaining = 4096; remaining > 0;)
                {
                    int count = Math.Min(remaining, maxFrames);
                    next.Run(silence, count);
                    remaining -= count;
                }
            }
            catch
            {
                next.Dispose();
                throw;
            }
            Graph old;
            lock (gate)
            {
                old = graph;
                graph = next;
                fromL = lastL;
                fromR = lastR;
                transition = Math.Max(1, rate / 100);
                faulted = false;
            }
            if (old != null)
                old.Dispose();
        }
        public object[] CalibrationInfo
        {
            get {
                lock (gate)
                {
                    return graph == null ? new object[0] : graph.CalibrationInfo;
                }
            }
        }
        public void Update(Patch patch)
        {
            lock (gate)
            {
                if (graph != null)
                    graph.Update(patch);
            }
        }
        public void Render(float[] input, int count)
        {
            lock (gate)
            {
                if (graph == null || faulted)
                {
                    Array.Clear(Left, 0, count);
                    Array.Clear(Right, 0, count);
                    return;
                }
                try
                {
                    float[] l = graph.Run(input, count);
                    for (int i = 0; i < count; i++)
                    {
                        float mix =
                            transition > 0 ? 1 - (float)transition / Math.Max(1, rate / 100) : 1;
                        Left[i] = fromL * (1 - mix) + l[i] * mix;
                        Right[i] = fromR * (1 - mix) + graph.Right[i] * mix;
                        if (transition > 0)
                            transition--;
                    }
                    lastL = Left[count - 1];
                    lastR = Right[count - 1];
                }
                catch
                {
                    faulted = true;
                    Array.Clear(Left, 0, count);
                    Array.Clear(Right, 0, count);
                    lastL = lastR = 0;
                    throw;
                }
            }
        }
        public void Dispose()
        {
            Graph old;
            lock (gate)
            {
                old = graph;
                graph = null;
                faulted = true;
            }
            if (old != null)
                old.Dispose();
        }
    }
}
