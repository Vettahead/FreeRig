using System;
using System.Collections.Generic;

namespace GuitarSuite
{
    static class OutputLimiterTests
    {
        static void Check(bool condition, string message)
        {
            if (!condition)
                throw new Exception(message);
        }
        public static void Run(List<string> lines)
        {
            foreach (int rate in new[] { 44100, 48000, 96000 })
            {
                var unity = new OutputLimiter(rate);
                float left = .4f, right = -.2f;
                unity.Process(ref left, ref right);
                Check(left == .4f && right == -.2f, "Limiter altered safe audio or added latency.");
                float[] reference = null;
                foreach (int frames in new[] { 1, 32, 64, 128, 4096 })
                {
                    var limiter = new OutputLimiter(rate);
                    var output = new float[rate * 2];
                    double dot = 0, sourceEnergy = 0, outputEnergy = 0, clippedEnergy = 0;
                    double clippedDot = 0;
                    long allocated = GC.GetAllocatedBytesForCurrentThread();
                    for (int at = 0; at < output.Length; at += frames)
                        for (int i = at; i < Math.Min(at + frames, output.Length); i++)
                        {
                            float input = (float)(3 * Math.Sin(2 * Math.PI * 997 * i / rate));
                            left = input;
                            right = -.5f * input;
                            limiter.Process(ref left, ref right);
                            output[i] = left;
                            Check(Math.Abs(left) <= OutputLimiter.Ceiling && right == -.5f * left,
                                  "Limiter lost ceiling or stereo balance.");
                            if (i < rate)
                                continue;
                            double clipped = Math.Max(-.95, Math.Min(.95, input));
                            dot += left * input;
                            sourceEnergy += input * input;
                            outputEnergy += left * left;
                            clippedDot += clipped * input;
                            clippedEnergy += clipped * clipped;
                        }
                    Check(GC.GetAllocatedBytesForCurrentThread() == allocated,
                          "Limiter allocated during processing.");
                    double error = Math.Max(0, 1 - dot * dot / (sourceEnergy * outputEnergy));
                    double oldError = 1 - clippedDot * clippedDot / (sourceEnergy * clippedEnergy);
                    Check(error < .001 && error < oldError / 100,
                          "Hot sine distortion was not reduced relative to hard clipping.");
                    if (reference != null)
                        for (int i = 0; i < output.Length; i++)
                            Check(output[i] == reference[i],
                                  "Limiter depends on buffer boundaries.");
                    reference = output;
                    for (int i = 0; i < rate; i++)
                    {
                        left = .2f;
                        right = .1f;
                        limiter.Process(ref left, ref right);
                    }
                    Check(Math.Abs(left - .2f) < .00001, "Limiter did not recover after overload.");
                }
            }
            lines.Add(
                "PASS: output limiter safe-signal unity/no added latency, stereo link, zero allocation, hot-sine distortion reduction, buffer independence and release at 44.1/48/96 kHz and 1/32/64/128/4096 frames.");
        }
    }
}
