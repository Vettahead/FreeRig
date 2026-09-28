using System;
using System.Threading;

namespace GuitarSuite
{
    // One worker writes stereo frames; one output callback reads them. Each side
    // owns its index and publishes it only after copying. No callback locks/waits.
    sealed class StereoFifo
    {
        readonly float[] samples;
        readonly int capacity;
        long written, read;
        public StereoFifo(int frames)
        {
            capacity = frames;
            samples = new float[frames * 2];
        }
        public int Count
        {
            get {
                return (int)(Volatile.Read(ref written) - Volatile.Read(ref read));
            }
        }
        public bool Write(float[] input, int frames)
        {
            long end = written;
            if (frames > capacity - (end - Volatile.Read(ref read)))
                return false;
            for (int i = 0; i < frames; i++)
            {
                int at = (int)((end + i) % capacity) * 2;
                samples[at] = input[i * 2];
                samples[at + 1] = input[i * 2 + 1];
            }
            Volatile.Write(ref written, end + frames);
            return true;
        }
        public int Read(float[] output, int frames)
        {
            long start = read;
            int available = (int)Math.Min(frames, Volatile.Read(ref written) - start);
            for (int i = 0; i < available; i++)
            {
                int at = (int)((start + i) % capacity) * 2;
                output[i * 2] = samples[at];
                output[i * 2 + 1] = samples[at + 1];
            }
            Array.Clear(output, available * 2, (frames - available) * 2);
            Volatile.Write(ref read, start + available);
            return available;
        }
    }

    // Pure managed mixer state can outlive the capture session while Stop fades
    // to silence. Always drain when muted, so unmute never replays old music.
    sealed class BackingMixer
    {
        public readonly StereoFifo Queue;
        public volatile float Gain = .25f, Peak;
        public volatile bool Muted;
        float current;
        readonly float blend;
        public BackingMixer(int rate)
        {
            Queue = new StereoFifo(rate);
            blend = (float)(1 - Math.Exp(-1.0 / (rate * .005)));
        }
        public void Read(float[] output, int frames)
        {
            Queue.Read(output, frames);
            float target = Muted ? 0 : Gain, peak = 0;
            for (int i = 0; i < frames; i++)
            {
                current += (target - current) * blend;
                for (int c = 0; c < 2; c++)
                {
                    float value = output[i * 2 + c];
                    value = Single.IsNaN(value) || Single.IsInfinity(value) ? 0 : value * current;
                    output[i * 2 + c] = value;
                    peak = Math.Max(peak, Math.Abs(value));
                }
            }
            Peak = peak;
        }
    }
}
