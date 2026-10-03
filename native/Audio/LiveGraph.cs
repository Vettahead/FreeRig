using System;
using System.Threading;

namespace GuitarSuite
{
    // One audio reader; control operations are serialised separately. The reader
    // announces its graph before use so retirement can wait on the CONTROL thread.
    sealed class LiveGraph : IDisposable
    {
        readonly object controlGate = new object();
        Graph graph, rendering, lastRendered, faulted;
        readonly int rate, maxFrames;
        readonly string assets;
        public readonly float[] Left = new float[4096], Right = new float[4096];
        int transition;
        float lastL, lastR, fromL, fromR;
        public LiveGraph(Patch patch, int rate, string assets, int maxFrames = 4096)
        {
            this.rate = rate;
            this.assets = assets;
            this.maxFrames = maxFrames;
            Replace(patch);
        }
        public void Replace(Patch patch)
        {
            lock (controlGate)
            {
                Graph next = new Graph(patch, rate, assets, maxFrames);
                // Prepare at the actual driver block size, outside the callback.
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
                Retire(Interlocked.Exchange(ref graph, next));
            }
        }
        void Retire(Graph old)
        {
            if (old == null)
                return;
            // Full fences pair with Render's announcement/recheck. A reader that
            // announces too late sees the changed pointer and never uses old.
            while (
                Object.ReferenceEquals(Interlocked.CompareExchange(ref rendering, null, null), old))
                Thread.Yield();
            old.Dispose();
        }
        public object[] CalibrationInfo
        {
            get {
                lock (controlGate) return graph == null ? new object[0] : graph.CalibrationInfo;
            }
        }
        public void Update(Patch patch)
        {
            lock (controlGate)
            {
                if (graph != null)
                    graph.Update(patch);
            }
        }
        public void Render(float[] input, int count)
        {
            Graph current;
            do
            {
                current = Interlocked.CompareExchange(ref graph, null, null);
                Interlocked.Exchange(ref rendering, current);
            } while (!Object.ReferenceEquals(current,
                                             Interlocked.CompareExchange(ref graph, null, null)));
            try
            {
                if (current == null || Object.ReferenceEquals(current, faulted))
                {
                    Array.Clear(Left, 0, count);
                    Array.Clear(Right, 0, count);
                    return;
                }
                // Transition state belongs exclusively to the audio reader.
                if (!Object.ReferenceEquals(current, lastRendered))
                {
                    lastRendered = current;
                    fromL = lastL;
                    fromR = lastR;
                    transition = Math.Max(1, rate / 100);
                }
                try
                {
                    float[] l = current.Run(input, count);
                    for (int i = 0; i < count; i++)
                    {
                        float mix =
                            transition > 0 ? 1 - (float)transition / Math.Max(1, rate / 100) : 1;
                        Left[i] = fromL * (1 - mix) + l[i] * mix;
                        Right[i] = fromR * (1 - mix) + current.Right[i] * mix;
                        if (transition > 0)
                            transition--;
                    }
                    lastL = Left[count - 1];
                    lastR = Right[count - 1];
                }
                catch
                {
                    faulted = current;
                    Array.Clear(Left, 0, count);
                    Array.Clear(Right, 0, count);
                    lastL = lastR = 0;
                    throw;
                }
            }
            finally
            {
                Interlocked.Exchange(ref rendering, null);
            }
        }
        public void Dispose()
        {
            lock (controlGate) Retire(Interlocked.Exchange(ref graph, null));
        }
    }
}
