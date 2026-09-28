using System;
using System.Collections.Generic;
using System.Threading;
namespace GuitarSuite
{
    static class PlayAlongTests
    {
        static void Check(bool condition, string message)
        {
            if (!condition)
                throw new Exception(message);
        }
        public static void Run(List<string> lines)
        {
            bool blocked = false;
            try
            {
                PlayAlongInput.ValidateRoute("same", "same", true);
            }
            catch
            {
                blocked = true;
            }
            Check(blocked, "Backing feedback route accepted.");
            blocked = false;
            try
            {
                PlayAlongInput.ValidateRoute("source", "", false);
            }
            catch
            {
                blocked = true;
            }
            Check(blocked, "ASIO backing route needs separate-device confirmation.");
            PlayAlongInput.ValidateRoute("source", "output", false);
            PlayAlongInput.ValidateRoute("source", "", true);
            ConcurrentQueue();
            ClockDrift(lines);
            // Music peaks must survive resampling before the user's backing attenuation.
            var peaks = new ClockedOutput(48000, 30, false);
            var full = new float[4800];
            for (int i = 0; i < full.Length; i++)
                full[i] = .99f;
            var peakBytes = new byte[full.Length * 4];
            Buffer.BlockCopy(full, 0, peakBytes, 0, peakBytes.Length);
            peaks.Push(peakBytes, 2400);
            var peakOutput = new byte[512 * 8];
            peaks.Read(peakOutput, 0, peakOutput.Length);
            Check(BitConverter.ToSingle(peakOutput, peakOutput.Length - 8) > .98f,
                  "Backing peaks clipped before backing volume.");
            foreach (int rate in new[] { 44100, 48000, 96000 })
                foreach (int frames in new[] { 32, 64, 128, 4096 })
                {
                    var empty = new BackingMixer(rate);
                    var dry = new LiveProvider(rate) { Count = frames, Gain = 1 };
                    var mix = new LiveProvider(rate) { Count = frames, Gain = 1, Backing = empty };
                    var a = new byte[frames * 8];
                    var b = new byte[frames * 8];
                    for (int i = 0; i < frames; i++)
                        dry.Samples[i] = mix.Samples[i] = .2f;
                    for (int n = 0; n < 10; n++)
                    {
                        dry.Read(a, 0, a.Length);
                        mix.Read(b, 0, b.Length);
                        for (int i = 0; i < a.Length; i++)
                            Check(a[i] == b[i], "Empty backing changed/delayed guitar.");
                    }
                    var music = new float[frames * 2];
                    for (int i = 0; i < frames; i++)
                    {
                        music[i * 2] = .4f;
                        music[i * 2 + 1] = -.4f;
                    }
                    empty.Gain = 1;
                    for (int n = 0; n < rate / frames; n++)
                    {
                        Check(empty.Queue.Write(music, frames), "Backing queue overflow.");
                        mix.Read(b, 0, b.Length);
                    }
                    Check(Math.Abs(BitConverter.ToSingle(b, 0) - .6f) < .001 &&
                              Math.Abs(BitConverter.ToSingle(b, 4) + .2f) < .001,
                          "Backing stereo or summing order wrong.");
                    empty.Muted = true;
                    for (int n = 0; n < rate / frames; n++)
                    {
                        empty.Queue.Write(music, frames);
                        mix.Read(b, 0, b.Length);
                    }
                    Check(empty.Queue.Count == 0, "Muted backing stopped draining.");
                    Check(Math.Abs(BitConverter.ToSingle(b, 0) - .2f) < .001,
                          "Backing mute also muted guitar.");
                    empty.Muted = false;
                    for (int i = 0; i < music.Length; i++)
                        music[i] = 2;
                    for (int n = 0; n < rate / frames; n++)
                    {
                        empty.Queue.Write(music, frames);
                        mix.Read(b, 0, b.Length);
                    }
                    Check(mix.Clipped && BitConverter.ToSingle(b, 0) <= .95f,
                          "Combined mix bypassed output ceiling.");
                    // Starvation must yield silence from backing immediately, not repeat music.
                    mix.Read(b, 0, b.Length);
                    Check(Math.Abs(BitConverter.ToSingle(b, 0) - .2f) < .001,
                          "Backing starvation repeated old audio.");
                }
            lines.Add(
                "PASS: play-along stereo sum, independent smoothed mute, master ceiling, silence on starvation and bit-identical guitar with empty backing at 44.1/48/96 kHz and 32/64/128/4096 frames.");
            lines.Add(
                "PASS: concurrent lock-free backing FIFO wrap/ordering and feedback-route validation. No live loopback capture exercised.");
        }
        static void ClockDrift(List<string> lines)
        {
            foreach (int rate in new[] { 44100, 48000, 96000 })
                foreach (double drift in new[] { -.0005, 0, .0005 })
                {
                    int packetFrames = rate / 100;
                    var source = new ClockedOutput(rate, 30, false);
                    var ready = new StereoFifo(rate);
                    var input = new float[packetFrames * 2];
                    for (int i = 0; i < packetFrames; i++)
                    {
                        input[i * 2] = .2f;
                        input[i * 2 + 1] = -.3f;
                    }
                    var packet = new byte[input.Length * 4];
                    Buffer.BlockCopy(input, 0, packet, 0, packet.Length);
                    var workerBytes = new byte[256 * 8];
                    var workerSamples = new float[512];
                    var output = new float[64];
                    double pending = 0, energy = 0;
                    for (int at = 0; at < rate * 30; at += 32)
                    {
                        pending += 32 * (1 + drift);
                        while (pending >= packetFrames)
                        {
                            source.Push(packet, packetFrames);
                            pending -= packetFrames;
                        }
                        while (ready.Count < rate / 50)
                        {
                            source.Read(workerBytes, 0, workerBytes.Length);
                            Buffer.BlockCopy(workerBytes, 0, workerSamples, 0, workerBytes.Length);
                            Check(ready.Write(workerSamples, 256),
                                  "Backing worker queue overflow.");
                        }
                        Check(ready.Read(output, 32) == 32, "Backing worker missed ready frames.");
                        for (int i = 0; i < 32; i++)
                        {
                            energy += Math.Abs(output[i * 2]);
                            Check(Math.Abs(output[i * 2 + 1] + output[i * 2] * 1.5) < .0001,
                                  "Backing clock correction lost stereo.");
                        }
                    }
                    Check(energy > rate && source.Underruns == 0 && source.Overflows == 0 &&
                              source.BufferedFrames < rate / 10,
                          "Backing drift correction lost audio or became unbounded.");
                    source.DiscardPending();
                    source.Read(workerBytes, 0, workerBytes.Length);
                    Check(Array.TrueForAll(workerBytes, value => value == 0),
                          "Paused backing replayed old music.");
                }
            lines.Add(
                "PASS: nine 30-second backing clock simulations at 44.1/48/96 kHz and +/-500 ppm, 10 ms packets, 256-frame worker and 32-frame guitar consumer; bounded queues, zero drops and pause flush.");
        }
        static void ConcurrentQueue()
        {
            var queue = new StereoFifo(1024);
            Exception failure = null;
            var producer = new Thread(() =>
                                      {
                                          try
                                          {
                                              var samples = new float[128];
                                              for (int at = 0; at < 64000; at += 64)
                                              {
                                                  for (int i = 0; i < 64; i++)
                                                  {
                                                      samples[i * 2] = at + i;
                                                      samples[i * 2 + 1] = -(at + i);
                                                  }
                                                  while (!queue.Write(samples, 64))
                                                      Thread.Yield();
                                              }
                                          }
                                          catch (Exception ex)
                                          {
                                              failure = ex;
                                          }
                                      }) { IsBackground = true };
            producer.Start();
            var output = new float[62];
            int received = 0;
            var timer = System.Diagnostics.Stopwatch.StartNew();
            while (received < 64000 && timer.ElapsedMilliseconds < 5000)
            {
                int got = queue.Read(output, 31);
                for (int i = 0; i < got; i++)
                {
                    Check(output[i * 2] == received && output[i * 2 + 1] == -received,
                          "Concurrent backing order corrupted.");
                    received++;
                }
                if (got == 0)
                    Thread.Yield();
            }
            Check(received == 64000 && producer.Join(1000) && failure == null,
                  "Backing queue concurrency timed out.");
        }
    }
}
