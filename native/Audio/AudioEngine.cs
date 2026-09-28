using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Owns the ASIO session. Graph edits must not reset the selected audio driver.
    sealed class AudioEngine : IDisposable
    {
        float masterDb = -12;
        readonly InputTrim inputTrim = new InputTrim();
        int sampleRate = 48000;
        public void SetInput(double db)
        {
            inputTrim.Set(db);
        }
        IntPtr tuner;
        public volatile bool TunerEnabled, TunerMute;
        public volatile float TunerHz, TunerConfidence;
        public void Tune(bool enabled, bool mute)
        {
            TunerEnabled = enabled;
            TunerMute = mute;
            SetMaster(masterDb);
            if (!enabled)
            {
                TunerHz = 0;
                TunerConfidence = 0;
            }
        }
        public void SetMaster(double db)
        {
            if (Double.IsNaN(db) || Double.IsInfinity(db))
                throw new Exception("Invalid master volume.");
            masterDb = (float)Math.Max(-30, Math.Min(12, db));
            if (provider != null)
                provider.Gain = TunerEnabled && TunerMute ? 0 : (float)Math.Pow(10, masterDb / 20);
        }
        public float OutputPeak
        {
            get {
                return provider == null ? 0 : provider.Peak;
            }
        }
        public bool TakeClip()
        {
            if (provider == null)
                return false;
            bool clipped = provider.Clipped;
            provider.Clipped = false;
            return clipped;
        }
        SeparateOutput separate;
        readonly byte[] outputBytes = new byte[32768];
        public object[] CalibrationInfo
        {
            get {
                return graph == null ? new object[0] : graph.CalibrationInfo;
            }
        }
        public string OutputName
        {
            get {
                return separate == null ? "ASIO output" : separate.Name;
            }
        }
        public int OutputDropouts
        {
            get {
                return separate == null ? 0 : separate.Queue.Underruns + separate.Queue.Overflows;
            }
        }
        public string OutputError
        {
            get {
                return separate == null ? null : separate.Error;
            }
        }
        AsioOut asio;
        LiveGraph graph;
        LiveProvider provider;
        readonly float[] input = new float[4096];
        public volatile string Error;
        public bool Running
        {
            get {
                return asio != null && asio.PlaybackState == PlaybackState.Playing;
            }
        }
        public int BufferSize;
        public float Peak;
        public void Start(string driver, int channel, int output, int rate, Patch patch,
                          string assets, string outputDevice = "", int outputLatency = 10,
                          bool exclusive = false)
        {
            Stop();
            sampleRate = rate;
            inputTrim.Reset();
            try
            {
                tuner = Effects.tuner_load(rate);
                if (tuner == IntPtr.Zero)
                    throw new Exception("Tuner could not initialise.");
                asio = new AsioOut(driver);
                asio.DriverResetRequest += OnDriverReset;
                if (channel < 0 || channel >= asio.DriverInputChannelCount ||
                    (String.IsNullOrEmpty(outputDevice) &&
                     (output < 0 || output + 1 >= asio.DriverOutputChannelCount)))
                    throw new Exception("Choose a valid guitar input and stereo output pair.");
                if (!asio.IsSampleRateSupported(rate))
                    throw new Exception("This driver does not support the selected sample rate.");
                asio.InputChannelOffset = channel;
                asio.ChannelOffset = String.IsNullOrEmpty(outputDevice) ? output : 0;
                provider = new LiveProvider(rate);
                SetMaster(masterDb);
                asio.AudioAvailable += OnAudio;
                asio.InitRecordAndPlayback(String.IsNullOrEmpty(outputDevice) ? provider : null, 1,
                                           rate);
                if (asio.FramesPerBuffer > 4096)
                    throw new Exception(
                        "Use a buffer of 4096 samples or less in the driver panel.");
                BufferSize = asio.FramesPerBuffer;
                graph = new LiveGraph(patch, rate, assets, BufferSize);
                if (!String.IsNullOrEmpty(outputDevice))
                {
                    if (outputLatency != 5 && outputLatency != 10 && outputLatency != 20)
                        throw new Exception("Choose a supported output buffer.");
                    separate = new SeparateOutput(outputDevice, rate, outputLatency, exclusive);
                }
                Error = null;
                Overruns = 0;
                CallbackLoad = 0;
                Stats.Reset();
                if (separate != null)
                    separate.Play();
                asio.Play();
            }
            catch
            {
                Stop();
                throw;
            }
        }
        void OnDriverReset(object sender, EventArgs e)
        {
            Error =
                "The ASIO driver requested a reset. Audio has been muted. Stop and restart audio " +
                "after checking the driver buffer and sample rate.";
        }
        public void Replace(Patch patch)
        {
            if (graph != null)
                graph.Replace(patch);
        }
        public volatile float CallbackLoad;
        public int Overruns;
        public readonly AudioStats Stats = new AudioStats();
        void OnAudio(object sender, AsioAudioAvailableEventArgs e)
        {
            long started = System.Diagnostics.Stopwatch.GetTimestamp();
            try
            {
                if (Error != null)
                {
                    provider.Count = 0;
                    return;
                }
                if (e.SamplesPerBuffer != BufferSize)
                    throw new Exception(
                        "The ASIO buffer changed. Stop and restart audio to prepare " +
                        "the models for the new size.");
                e.GetAsInterleavedSamples(input);
                Stats.Input(input, e.SamplesPerBuffer);
                if (TunerEnabled)
                {
                    Effects.tuner_process(tuner, input, e.SamplesPerBuffer);
                    TunerHz = Effects.tuner_hz(tuner);
                    TunerConfidence = Effects.tuner_confidence(tuner);
                }
                Peak = inputTrim.Process(input, e.SamplesPerBuffer, sampleRate);
                graph.Render(input, e.SamplesPerBuffer);
                provider.RightSamples = graph.Right;
                provider.Samples = graph.Left;
                provider.Count = e.SamplesPerBuffer;
                if (separate != null)
                {
                    provider.Read(outputBytes, 0, e.SamplesPerBuffer * 8);
                    separate.Queue.Push(outputBytes, e.SamplesPerBuffer);
                }
            }
            catch (Exception ex)
            {
                Error = ex.Message;
                provider.Count = 0;
                Array.Clear(provider.Samples, 0, provider.Samples.Length);
                if (provider.RightSamples != null)
                    Array.Clear(provider.RightSamples, 0, provider.RightSamples.Length);
            }
            finally
            {
                double seconds = (double)(System.Diagnostics.Stopwatch.GetTimestamp() - started) /
                                 System.Diagnostics.Stopwatch.Frequency;
                CallbackLoad = (float)(seconds * sampleRate / e.SamplesPerBuffer);
                Stats.Load(CallbackLoad);
                if (CallbackLoad > 1)
                    System.Threading.Interlocked.Increment(ref Overruns);
            }
        }
        public void Update(Patch p)
        {
            if (graph != null)
                graph.Update(p);
        }
        public void Stop()
        {
            if (asio != null)
            {
                asio.AudioAvailable -= OnAudio;
                asio.DriverResetRequest -= OnDriverReset;
                asio.Stop();
                asio.Dispose();
                asio = null;
            }
            if (separate != null)
            {
                separate.Dispose();
                separate = null;
            }
            if (graph != null)
            {
                graph.Dispose();
                graph = null;
            }
            if (tuner != IntPtr.Zero)
            {
                Effects.tuner_free(tuner);
                tuner = IntPtr.Zero;
            }
            TunerHz = 0;
            TunerConfidence = 0;
            Peak = 0;
        }
        public void Dispose()
        {
            Stop();
        }
    }
}
