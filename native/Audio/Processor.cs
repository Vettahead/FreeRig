using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Legacy built-in processing and mono capture ownership. Preserve DSP arithmetic when
    // reorganising code. Factory amp voicings and saturation adapted from Amplitron (MIT), Sudip
    // Mondal. The shipping notices include the original licence and exact upstream revision.
    sealed class Processor : IDisposable
    {
        public readonly Block Block;
        public volatile DeviceState Settings;
        public readonly float[] Buffer = new float[4096];
        public int[] Sources;
        readonly int rate;
        readonly float[] dry = new float[4096];
        readonly float[] delay;
        readonly float[][] tanks;
        readonly int[] tankAt = new int[4];
        int at;
        double phase, env, dc, wet = 1, tone, low;
        IntPtr model;
        float[] namInput = new float[4096];
        BiQuadFilter bass, mid, treble, hp, lp;
        double[] previous;
        readonly bool standalone, capture;
        public Processor(Block b, DeviceState s, int sampleRate, string assetFolder,
                         bool standalone = true, int maxFrames = 4096)
        {
            this.standalone = standalone;
            capture = !String.IsNullOrEmpty(b.assetId);
            Block = b;
            Settings = s;
            wet = !standalone || s.on ? 1 : 0;
            rate = sampleRate;
            delay = new float[rate * 2];
            tanks = new float [4][];
            int[] lengths = { 1499, 1601, 1747, 1867 };
            for (int i = 0; i < 4; i++)
                tanks[i] = new float[(int)(lengths[i] * rate / 44100.0)];
            if (standalone && capture)
            {
                if (Path.GetFileName(b.assetId) != b.assetId ||
                    !(b.assetId.EndsWith(".nam") || b.assetId.EndsWith(".wav")))
                    throw new Exception("Invalid model reference.");
                string path = Path.Combine(assetFolder, b.assetId);
                if (!File.Exists(path))
                    throw new Exception("Missing model for " + b.key + ". Import the file again.");
                model = Nam.gs_load(path, rate, maxFrames);
                if (model == IntPtr.Zero)
                    throw new Exception(Nam.Error);
            }
            Filters(s.values);
        }
        static double Db(double x)
        {
            return Math.Pow(10, x / 20);
        }
        static double Clamp(double v, double a, double b)
        {
            return Math.Max(a, Math.Min(b, v));
        }
        void Filters(double[] p)
        {
            previous = (double[])p.Clone();
            if (Block.key != "amp" && Block.key != "cleanamp" && Block.key != "cab")
                return;
            bool clean = Block.key == "cleanamp";
            bass = BiQuadFilter.LowShelf(rate, clean ? 200 : 180, .8f,
                                         (float)((capture ? 0
                                                  : clean ? 3
                                                          : -1) +
                                                 p[1]));
            mid = BiQuadFilter.PeakingEQ(rate, clean ? 800 : 650, 1f,
                                         (float)((capture ? 0
                                                  : clean ? -2
                                                          : 4) +
                                                 p[2]));
            treble = BiQuadFilter.HighShelf(rate, clean ? 3500 : 3000, .7f,
                                            (float)((capture ? 0
                                                     : clean ? 2.5
                                                             : 1.5) +
                                                    (p.Length > 3 ? p[3] : 0)));
            hp = BiQuadFilter.HighPassFilter(rate, (float)(Block.key == "cab" ? p[0] : 30), .707f);
            lp = BiQuadFilter.LowPassFilter(
                rate, (float)Math.Min(rate * .45, Block.key == "cab" ? p[1] : 12000), .707f);
            previous = (double[])p.Clone();
        }
        public void Process(int count)
        {
            DeviceState state = Settings;
            double[] p = state.values;
            // Coefficient changes are bounded to block boundaries. Device state is published
            // atomically by the UI, never mutated underneath this callback.
            if ((Block.key == "amp" || Block.key == "cleanamp" || Block.key == "cab") &&
                !ParametersEqual(previous, p))
                Filters(p);
            Array.Copy(Buffer, dry, count);
            if (model != IntPtr.Zero)
            {
                double gain = Block.key == "cab" ? 1 : Db(p[0]);
                for (int i = 0; i < count; i++)
                    namInput[i] = (float)(Buffer[i] * gain);
                if (Nam.gs_process(model, namInput, Buffer, count) == 0)
                    throw new Exception("The loaded model returned invalid audio.");
            }
            double target = !standalone || state.on ? 1 : 0,
                   blend = 1 - Math.Exp(-1.0 / (rate * .005));
            for (int i = 0; i < count; i++)
            {
                double x = Buffer[i], original = dry[i];
                switch (Block.key)
                {
                case "amp":
                case "cleanamp":
                    if (!capture)
                    {
                        bool clean = Block.key == "cleanamp";
                        double abs = Math.Abs(x);
                        env +=
                            (abs > env ? (clean ? .01 : .05) : (clean ? .005 : .008)) * (abs - env);
                        x *= Db(p[0]) * (clean ? 1.2 : 3.5) *
                             (1 - (clean ? 0 : .15) * Clamp(env, 0, 1));
                    }
                    x = treble.Transform(mid.Transform(bass.Transform((float)x)));
                    if (!capture)
                    {
                        bool clean = Block.key == "cleanamp";
                        double soft =
                            x > 0 ? 1 - Math.Exp(-x) : (-1 + Math.Exp(x)) * (clean ? 1 : .8);
                        double mix = clean ? 0 : .15;
                        x = soft * (1 - mix) + Clamp(x, -1, 1) * mix;
                        dc += .005 * (x - dc);
                        x = (x - dc) * (clean ? .85 : .7);
                    }
                    x *= Db(p[4]);
                    break;
                case "cab":
                    x = lp.Transform(hp.Transform((float)x)) * Db(p[2]);
                    break;
                case "nampedal":
                    x *= Db(!capture ? p[0] + p[1] : p[1]);
                    break;
                case "drive":
                    x = Math.Tanh(x * (1 + p[0] * 3));
                    tone += (.015 + p[1] * .025) * (x - tone);
                    x = tone * Db(p[2]) * .55;
                    break;
                case "gate":
                    double magnitude = Math.Abs(x);
                    env += (magnitude > env ? .02 : 1 - Math.Exp(-1.0 / (rate * p[1] / 1000))) *
                           (magnitude - env);
                    x *= Clamp(env / Math.Max(1e-8, Db(p[0])), 0, 1);
                    break;
                case "compressor":
                    double level = Math.Max(1e-8, Math.Abs(x));
                    env += (level > env ? 1 - Math.Exp(-1.0 / (rate * p[2] / 1000))
                                        : 1 - Math.Exp(-1.0 / (rate * .1))) *
                           (level - env);
                    double db = 20 * Math.Log10(Math.Max(1e-8, env));
                    if (db > p[0])
                        x *= Db((p[0] + (db - p[0]) / p[1]) - db);
                    break;
                case "delay":
                    int span = Math.Max(1, Math.Min(delay.Length - 1, (int)(p[0] * rate / 1000)));
                    double echo = delay[(at - span + delay.Length) % delay.Length];
                    delay[at] = (float)Math.Tanh(x + echo * p[1] / 100);
                    at = (at + 1) % delay.Length;
                    x = x * (1 - p[2] / 100) + echo * p[2] / 100;
                    break;
                case "chorus":
                    phase += 2 * Math.PI * p[0] / rate;
                    if (phase > Math.PI * 2)
                        phase -= Math.PI * 2;
                    double pos = at - rate * (.015 + .005 * p[1] / 100 * Math.Sin(phase));
                    if (pos < 0)
                        pos += delay.Length;
                    int index = (int)pos;
                    double frac = pos - index;
                    double shifted =
                        delay[index] * (1 - frac) + delay[(index + 1) % delay.Length] * frac;
                    delay[at] = (float)x;
                    at = (at + 1) % delay.Length;
                    x = x * (1 - p[2] / 100) + shifted * p[2] / 100;
                    break;
                case "reverb":
                    double sum = 0;
                    for (int k = 0; k < 4; k++)
                    {
                        double tail = tanks[k][tankAt[k]],
                               feedback =
                                   Math.Pow(.001, tanks[k].Length / (rate * Math.Max(.2, p[0])));
                        tanks[k][tankAt[k]] = (float)Math.Tanh(x + tail * feedback);
                        sum += tail;
                        tankAt[k] = (tankAt[k] + 1) % tanks[k].Length;
                    }
                    low += (.02 + p[1] * .04) * (sum * .25 - low);
                    x = x * (1 - p[2] / 100) + low * p[2] / 100;
                    break;
                }
                wet += blend * (target - wet);
                double result = original * (1 - wet) + x * wet;
                // Preserve finite floating-point headroom for downstream gain/cab stages.
                // Only the device's intentional distortion and final output may clip.
                Buffer[i] = (float)(Double.IsNaN(result) || Double.IsInfinity(result) ? 0 : result);
            }
        }
        // .NET Framework's enumerable SequenceEqual creates array enumerators.
        // This check runs twice per stereo device per callback, even at unchanged EQ.
        static bool ParametersEqual(double[] a, double[] b)
        {
            if (a.Length != b.Length)
                return false;
            for (int i = 0; i < a.Length; i++)
                if (!a[i].Equals(b[i]))
                    return false;
            return true;
        }
        public void Dispose()
        {
            if (model != IntPtr.Zero)
            {
                Nam.gs_free(model);
                model = IntPtr.Zero;
            }
        }
    }
}
