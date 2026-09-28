using System;
using System.Linq;
using System.Runtime.InteropServices;
namespace GuitarSuite
{
    // Owns stereo effect/capture processing and bypass transitions. Keep allocation out of
    // processing.
    sealed class StereoProcessor : IDisposable
    {
        public readonly Block Block;
        public readonly float[] Buffer = new float[4096], Right = new float[4096];
        public int[] Sources;
        public StereoDelay[] Align;
        public int Latency, TotalLatency;
        sealed class ControlSnapshot
        {
            public DeviceState State;
            public double[] Values;
            public double InputGain = 1, OutputGain = 1;
        }
        volatile ControlSnapshot controls;
        public CaptureLevels Calibration
        {
            get {
                return calibration;
            }
        }
        readonly CaptureLevels calibration = new CaptureLevels();
        double inputCalibration = 1, outputCalibration = 1;
        readonly double calibrationBlend;
        public void Update(DeviceState state, int tempo, double? reference = null)
        {
            controls = new ControlSnapshot {
                State = state, Values = effect != IntPtr.Zero ? Effective(state, tempo) : null,
                InputGain = Block.key == "cab" ? 1 : calibration.InputGain(reference),
                OutputGain = Block.key == "nampedal" ? calibration.OutputGain(reference) : 1
            };
        }
        readonly Processor left, right;
        readonly int rate;
        readonly float[] dryL = new float[4096], dryR = new float[4096], scratch = new float[4096];
        readonly StereoDelay dryDelay;
        IntPtr effect, modelL, modelR;
        double wet;
        ControlSnapshot applied;
        public StereoProcessor(Block b, DeviceState state, int sampleRate, string assets,
                               int maxFrames = 4096)
        {
            Block = b;
            rate = sampleRate;
            calibrationBlend = 1 - Math.Exp(-1.0 / (rate * .01));
            wet = state.on ? 1 : 0;
            try
            {
                if (b.key.StartsWith("fx-"))
                {
                    effect = Effects.fx_load(b.key.Substring(3), rate);
                    if (effect == IntPtr.Zero)
                        throw new Exception("Could not load effect " + b.key);
                    Latency = Effects.fx_latency(effect);
                }
                else
                {
                    left = new Processor(b, state, rate, assets, false, maxFrames);
                    right = new Processor(b, state, rate, assets, false, maxFrames);
                    if (!String.IsNullOrEmpty(b.assetId))
                    {
                        if (!DeviceLibrary.SafeAsset(b.assetId))
                            throw new Exception("Invalid model reference.");
                        string path = System.IO.Path.Combine(assets, b.assetId);
                        modelL = Nam.gs_load(path, rate, maxFrames);
                        if (modelL == IntPtr.Zero)
                            throw new Exception(Nam.Error);
                        calibration = CaptureLevels.FromModel(modelL);
                        modelR = Nam.gs_load(path, rate, maxFrames);
                        if (modelR == IntPtr.Zero)
                            throw new Exception(Nam.Error);
                    }
                }
                dryDelay = new StereoDelay(Latency);
                Update(state, 112);
                if (effect != IntPtr.Zero)
                    Apply(controls);
            }
            catch
            {
                Dispose();
                throw;
            }
        }
        double[] Effective(DeviceState s, int tempo)
        {
            var p = (double[])s.values.Clone();
            if (s.sync > 0 && (Block.key == "fx-SurgeDelay" || Block.key == "fx-DiffuseDelay"))
            {
                double[] beats = { 0, .25, .5, .75, 1, 1.5, 2, 4 };
                double seconds =
                    60.0 / Math.Max(40, Math.Min(240, tempo)) * beats[Math.Min(7, s.sync)];
                p[0] = Math.Min(2000, seconds * 1000);
                if (Block.key == "fx-SurgeDelay")
                    p[1] = p[0];
            }
            return p;
        }
        void Apply(ControlSnapshot next)
        {
            if (Object.ReferenceEquals(next, applied))
                return;
            var p = next.Values;
            if (Effects.fx_set(effect, p, p.Length) == 0)
                throw new Exception("Invalid effect parameters for " + Block.key);
            applied = next;
        }
        public void Process(int count)
        {
            var snapshot = controls;
            var s = snapshot.State;
            Array.Clear(dryL, 0, count);
            Array.Clear(dryR, 0, count);
            dryDelay.Add(Buffer, Right, dryL, dryR, count);
            // Once the bypass fade has settled, do not execute a captured model at all.
            // This also prevents an inactive capture from producing an audio-thread fault.
            if (modelL != IntPtr.Zero && !s.on && wet < .000001)
            {
                wet = 0;
                Array.Copy(dryL, Buffer, count);
                Array.Copy(dryR, Right, count);
                return;
            }
            if (effect != IntPtr.Zero)
            {
                Apply(snapshot);
                if (Effects.fx_process(effect, Buffer, Right, count) == 0)
                    throw new Exception("Effect returned invalid audio: " + Block.key);
            }
            else
            {
                if (modelL != IntPtr.Zero)
                {
                    double gain = Block.key == "cab" ? 1 : Math.Pow(10, s.values[0] / 20);
                    for (int i = 0; i < count; i++)
                    {
                        inputCalibration +=
                            (snapshot.InputGain - inputCalibration) * calibrationBlend;
                        Buffer[i] *= (float)(gain * inputCalibration);
                        Right[i] *= (float)(gain * inputCalibration);
                    }
                    if (Nam.gs_process_stereo(modelL, Buffer, Buffer, scratch, count) == 0 ||
                        Nam.gs_process_stereo(modelR, Right, scratch, Right, count) == 0)
                        throw new Exception("Model returned invalid audio.");
                    for (int i = 0; i < count; i++)
                    {
                        outputCalibration +=
                            (snapshot.OutputGain - outputCalibration) * calibrationBlend;
                        Buffer[i] *= (float)outputCalibration;
                        Right[i] *= (float)outputCalibration;
                    }
                }
                left.Settings = s;
                right.Settings = s;
                Array.Copy(Buffer, left.Buffer, count);
                Array.Copy(Right, right.Buffer, count);
                left.Process(count);
                right.Process(count);
                Array.Copy(left.Buffer, Buffer, count);
                Array.Copy(right.Buffer, Right, count);
            }
            // Legacy processors are always wet inside this stereo wrapper.
            double blend = 1 - Math.Exp(-1.0 / (rate * .005)), target = s.on ? 1 : 0;
            for (int i = 0; i < count; i++)
            {
                wet += blend * (target - wet);
                Buffer[i] = Limit(dryL[i] * (1 - wet) + Buffer[i] * wet);
                Right[i] = Limit(dryR[i] * (1 - wet) + Right[i] * wet);
            }
        }
        static float Limit(double x)
        {
            if (Double.IsNaN(x) || Double.IsInfinity(x))
                throw new Exception("Non-finite audio.");
            // Internal floating-point audio may exceed full scale legitimately.
            // A later cab/output trim can restore headroom; clipping here permanently
            // changes captures before that attenuation. LiveProvider guards the output.
            return (float)x;
        }
        public void Dispose()
        {
            if (effect != IntPtr.Zero)
            {
                Effects.fx_free(effect);
                effect = IntPtr.Zero;
            }
            if (modelL != IntPtr.Zero)
            {
                Nam.gs_free(modelL);
                modelL = IntPtr.Zero;
            }
            if (modelR != IntPtr.Zero)
            {
                Nam.gs_free(modelR);
                modelR = IntPtr.Zero;
            }
            if (left != null)
                left.Dispose();
            if (right != null)
                right.Dispose();
        }
    }
}
