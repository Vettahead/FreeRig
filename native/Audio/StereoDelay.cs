using System;
using System.Linq;
using System.Runtime.InteropServices;
namespace GuitarSuite
{
    // Preallocated delay storage used for latency alignment between signal paths.
    sealed class StereoDelay
    {
        readonly float[] l, r;
        int at;
        public StereoDelay(int samples)
        {
            l = new float[samples];
            r = new float[samples];
        }
        public void Add(float[] fromL, float[] fromR, float[] toL, float[] toR, int count)
        {
            if (l.Length == 0)
            {
                for (int i = 0; i < count; i++)
                {
                    toL[i] += fromL[i];
                    toR[i] += fromR[i];
                }
                return;
            }
            for (int i = 0; i < count; i++)
            {
                toL[i] += l[at];
                toR[i] += r[at];
                l[at] = fromL[i];
                r[at] = fromR[i];
                at = (at + 1) % l.Length;
            }
        }
    }
}
