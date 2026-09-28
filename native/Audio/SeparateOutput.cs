using System;
using System.Collections.Generic;
using NAudio.CoreAudioApi;
using NAudio.Dsp;
using NAudio.Wave;
namespace GuitarSuite
{
    sealed class OutputDeviceInfo
    {
        public string id, name;
    }
    static class OutputDevices
    {
        public static OutputDeviceInfo[] List()
        {
            var result = new List<OutputDeviceInfo>();
            using (var devices =
                       new MMDeviceEnumerator()) foreach (var device in devices
                                                              .EnumerateAudioEndPoints(
                                                                  DataFlow.Render,
                                                                  NAudio.CoreAudioApi.DeviceState
                                                                      .Active))
            {
                using (device)
                    result.Add(new OutputDeviceInfo { id = device.ID, name = device.FriendlyName });
            }
            return result.ToArray();
        }
    }
    // The two USB interfaces have independent clocks. Keep a bounded stereo FIFO
    // and make small, smoothed rate corrections in the OUTPUT thread using WDL sinc.
    // ASIO only copies ready audio into the FIFO; it never waits for Windows playback.
    sealed class ClockedOutput : IWaveProvider
    {
        readonly object gate = new object();
        readonly float[] ring, output;
        readonly int rate, capacity, baseTarget;
        int head, count;
        bool primed;
        double correction;
        float fade;
        readonly WdlResampler resampler = new WdlResampler();
        public int Underruns, Overflows;
        public int BufferedFrames
        {
            get {
                lock (gate) return count;
            }
        }
        public WaveFormat WaveFormat { get; private set; }
        public ClockedOutput(int rate, int targetMs)
        {
            this.rate = rate;
            capacity = rate / 2;
            ring = new float[capacity * 2];
            output = new float[rate * 2];
            baseTarget = rate * targetMs / 1000;
            WaveFormat = WaveFormat.CreateIeeeFloatWaveFormat(rate, 2);
            resampler.SetMode(false, 0, true, 64, 32);
            resampler.SetFeedMode(false);
            resampler.SetRates(rate, rate);
        }
        public void Push(byte[] bytes, int frames)
        {
            lock (gate)
            {
                if (frames > capacity - count)
                {
                    Overflows++;
                    return;
                }
                int tail = (head + count) % capacity, first = Math.Min(frames, capacity - tail);
                Buffer.BlockCopy(bytes, 0, ring, tail * 8, first * 8);
                if (first < frames)
                    Buffer.BlockCopy(bytes, first * 8, ring, 0, (frames - first) * 8);
                count += frames;
            }
        }
        public int Read(byte[] bytes, int offset, int byteCount)
        {
            int frames = byteCount / 8;
            if (byteCount % 8 != 0 || frames > rate)
                throw new ArgumentException("Invalid output block size.");
            int target = Math.Max(baseTarget, frames * 2 + 128);
            int available = BufferedFrames;
            if (!primed)
            {
                if (available < target)
                {
                    Array.Clear(bytes, offset, byteCount);
                    return byteCount;
                }
                primed = true;
                fade = 0;
                resampler.Reset();
            }
            // Limit to +/-0.2%, enough for ordinary device clock drift without pitch jumps.
            double desired =
                Math.Max(-.002, Math.Min(.002, (available - target) / (double)rate * .1));
            correction += (desired - correction) * Math.Min(1, frames / (double)rate * 2);
            resampler.SetRates(rate * (1 + correction), rate);
            float[] input;
            int inputOffset;
            int need = resampler.ResamplePrepare(frames, 2, out input, out inputOffset);
            lock (gate)
            {
                if (count < need)
                {
                    Underruns++;
                    primed = false;
                    Array.Clear(bytes, offset, byteCount);
                    return byteCount;
                }
                int first = Math.Min(need, capacity - head);
                Array.Copy(ring, head * 2, input, inputOffset, first * 2);
                if (first < need)
                    Array.Copy(ring, 0, input, inputOffset + first * 2, (need - first) * 2);
                head = (head + need) % capacity;
                count -= need;
            }
            int got = resampler.ResampleOut(output, 0, need, frames, 2);
            if (got < frames)
                Array.Clear(output, got * 2, (frames - got) * 2);
            for (int i = 0; i < frames; i++)
            {
                fade = Math.Min(1, fade + 1f / (rate * .005f));
                for (int c = 0; c < 2; c++)
                    output[i * 2 + c] = Math.Max(-.95f, Math.Min(.95f, output[i * 2 + c] * fade));
            }
            Buffer.BlockCopy(output, 0, bytes, offset, byteCount);
            return byteCount;
        }
    }
    sealed class SeparateOutput : IDisposable
    {
        readonly MMDevice device;
        readonly WasapiOut player;
        public readonly ClockedOutput Queue;
        public readonly string Name;
        public string Details
        {
            get {
                return player.OutputWaveFormat.ToString();
            }
        }
        public volatile string Error;
        bool stopping;
        public SeparateOutput(string id, int rate, int latencyMs, bool exclusive)
        {
            try
            {
                using (var devices = new MMDeviceEnumerator()) device = devices.GetDevice(id);
                if (device.State != NAudio.CoreAudioApi.DeviceState.Active)
                    throw new Exception("The selected output is disconnected.");
                Name = device.FriendlyName;
                Queue = new ClockedOutput(rate, latencyMs * 2);
                player = new WasapiOut(device,
                                       exclusive ? AudioClientShareMode.Exclusive
                                                 : AudioClientShareMode.Shared,
                                       true, latencyMs);
                player.Init(Queue);
                player.PlaybackStopped += OnStopped;
            }
            catch
            {
                Dispose();
                throw;
            }
        }
        void OnStopped(object sender, StoppedEventArgs e)
        {
            if (!stopping)
                Error = e.Exception == null ? "The separate output stopped. Restart audio."
                                            : "Output device stopped: " + e.Exception.Message;
        }
        public void Play()
        {
            player.Play();
        }
        public void Dispose()
        {
            stopping = true;
            if (player != null)
            {
                player.PlaybackStopped -= OnStopped;
                player.Stop();
                player.Dispose();
            }
            if (device != null)
                device.Dispose();
        }
    }
}
