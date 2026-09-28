using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Supplies output samples and smooths output gain to avoid abrupt level changes.
    sealed class LiveProvider : IWaveProvider
    {
        public float[] Samples = new float[4096], RightSamples;
        public int Count;
        public WaveFormat WaveFormat { get; private set; }
        public volatile BackingMixer Backing;
        readonly float[] backingSamples = new float[8192];
        readonly float[] interleaved = new float[8192];
        public LiveProvider(int rate)
        {
            WaveFormat = WaveFormat.CreateIeeeFloatWaveFormat(rate, 2);
        }
        // Keep output gain independent of amp drive; ramp changes to avoid clicks.
        public volatile float Gain = .25f, Peak;
        public volatile bool Clipped;
        float currentGain = .25f;
        public int Read(byte[] target, int offset, int bytes)
        {
            int frames = bytes / 8;
            // Snapshot the managed mixer once; stopping capture never invalidates it.
            var backing = Backing;
            if (backing != null)
                backing.Read(backingSamples, frames);
            float peak = 0;
            bool clipped = false;
            float targetGain = Gain;
            double blend = 1 - Math.Exp(-1.0 / (WaveFormat.SampleRate * .01));
            for (int i = 0; i < frames; i++)
            {
                currentGain += (float)((targetGain - currentGain) * blend);
                float v =
                    ((i < Count ? Samples[i] : 0) + (backing == null ? 0 : backingSamples[i * 2])) *
                    currentGain;
                if (Single.IsNaN(v) || Single.IsInfinity(v))
                    v = 0;
                clipped |= Math.Abs(v) > .95f;
                v = Math.Max(-.95f, Math.Min(.95f, v));
                peak = Math.Max(peak, Math.Abs(v));
                interleaved[i * 2] = v;
                float r = ((i < Count ? (RightSamples ?? Samples)[i] : 0) +
                           (backing == null ? 0 : backingSamples[i * 2 + 1])) *
                          currentGain;
                if (Single.IsNaN(r) || Single.IsInfinity(r))
                    r = 0;
                clipped |= Math.Abs(r) > .95f;
                r = Math.Max(-.95f, Math.Min(.95f, r));
                peak = Math.Max(peak, Math.Abs(r));
                interleaved[i * 2 + 1] = r;
            }
            Peak = peak;
            Clipped |= clipped;
            Buffer.BlockCopy(interleaved, 0, target, offset, bytes);
            return bytes;
        }
    }
}
