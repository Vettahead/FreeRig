using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Smooths input gain; this changes the level driving the capture, not its trained weights.
    sealed class InputTrim
    {
        volatile float target = 1;
        float gain = 1;
        public void Set(double db)
        {
            if (Double.IsNaN(db) || Double.IsInfinity(db))
                throw new Exception("Invalid input trim.");
            target = (float)Math.Pow(10, Math.Max(-24, Math.Min(24, db)) / 20);
        }
        public void Reset()
        {
            gain = target;
        }
        public float Process(float[] input, int count, int rate)
        {
            double blend = 1 - Math.Exp(-1.0 / (rate * .01));
            float peak = 0, next = target;
            for (int i = 0; i < count; i++)
            {
                gain += (float)((next - gain) * blend);
                input[i] *= gain;
                peak = Math.Max(peak, Math.Abs(input[i]));
            }
            return peak;
        }
    }
}
