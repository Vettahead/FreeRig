using System;
using System.Threading;
using NAudio.CoreAudioApi;
using NAudio.Wave;

namespace GuitarSuite
{
    // Short polling packets avoid depending on loopback event signalling when
    // the source app is idle. NAudio/Windows convert the shared mix to stereo float.
    sealed class MusicLoopbackCapture : WasapiCapture
    {
        public MusicLoopbackCapture(MMDevice device) : base(device, false, 10)
        {
        }
        protected override AudioClientStreamFlags GetAudioClientStreamFlags()
        {
            return base.GetAudioClientStreamFlags() | AudioClientStreamFlags.Loopback;
        }
    }

    sealed class PlayAlongInput : IDisposable
    {
        MMDevice device;
        MusicLoopbackCapture capture;
        Thread worker;
        volatile bool stopping;
        readonly ClockedOutput clock;
        readonly StereoFifo incoming;
        readonly float[] captured = new float[8192], incomingSamples = new float[2048];
        readonly byte[] incomingBytes = new byte[8192];
        long lastPacket;
        bool idleReset;
        readonly int target;
        readonly byte[] bytes = new byte[256 * 8];
        readonly float[] samples = new float[256 * 2];
        public readonly BackingMixer Mixer;
        public readonly string Name;
        public volatile string Error;
        public int DroppedPackets;

        public static void ValidateRoute(string source, string output, bool confirmedSeparate)
        {
            if (String.IsNullOrEmpty(source))
                throw new Exception("Choose the device playing your backing track.");
            if (String.Equals(source, output, StringComparison.OrdinalIgnoreCase))
                throw new Exception(
                    "Choose a different source from FreeRig's output to prevent feedback.");
            // ASIO driver names do not identify Windows endpoint IDs reliably.
            if (String.IsNullOrEmpty(output) && !confirmedSeparate)
                throw new Exception(
                    "Confirm that the backing source is a different device from your ASIO output.");
        }
        public PlayAlongInput(string id, int rate, int outputBlock, double db, bool muted)
        {
            Mixer = new BackingMixer(rate);
            SetLevel(db, muted);
            clock = new ClockedOutput(rate, 30, false);
            incoming = new StereoFifo(rate / 2);
            target = Math.Max(rate / 50, outputBlock * 2);
            try
            {
                using (var devices = new MMDeviceEnumerator()) device = devices.GetDevice(id);
                if (device.State != NAudio.CoreAudioApi.DeviceState.Active ||
                    device.DataFlow != DataFlow.Render)
                    throw new Exception("The selected backing playback device is unavailable.");
                Name = device.FriendlyName;
                capture = new MusicLoopbackCapture(device);
                capture.WaveFormat = WaveFormat.CreateIeeeFloatWaveFormat(rate, 2);
                capture.DataAvailable += OnData;
                capture.RecordingStopped += OnStopped;
                worker = new Thread(Pump) { IsBackground = true, Name = "FreeRig backing audio" };
                capture.StartRecording();
                worker.Start();
            }
            catch
            {
                Dispose();
                throw;
            }
        }
        public void SetLevel(double db, bool muted)
        {
            if (Double.IsNaN(db) || Double.IsInfinity(db) || db < -60 || db > 0)
                throw new Exception("Backing level must be between -60 and 0 dB.");
            Mixer.Gain = (float)Math.Pow(10, db / 20);
            Mixer.Muted = muted;
        }
        void OnData(object sender, WaveInEventArgs e)
        {
            if (stopping || Error != null)
                return;
            try
            {
                if (e.BytesRecorded % 8 != 0)
                    throw new Exception("Incomplete stereo loopback packet.");
                // Only copy/validate here. The capture callback never waits on
                // the resampler or the guitar callback.
                for (int offset = 0; offset < e.BytesRecorded;)
                {
                    int frames = Math.Min(4096, (e.BytesRecorded - offset) / 8);
                    Buffer.BlockCopy(e.Buffer, offset, captured, 0, frames * 8);
                    for (int i = 0; i < frames * 2; i++)
                        if (Single.IsNaN(captured[i]) || Single.IsInfinity(captured[i]))
                            captured[i] = 0;
                    if (!incoming.Write(captured, frames))
                        Interlocked.Increment(ref DroppedPackets);
                    offset += frames * 8;
                }
                if (e.BytesRecorded > 0)
                    Interlocked.Exchange(ref lastPacket,
                                         System.Diagnostics.Stopwatch.GetTimestamp());
            }
            catch (Exception ex)
            {
                Error = "Backing capture: " + ex.Message;
            }
        }
        void OnStopped(object sender, StoppedEventArgs e)
        {
            if (!stopping)
                Error = "Backing source stopped or disconnected. " +
                        (e.Exception == null ? "" : e.Exception.Message);
        }
        void Pump()
        {
            try
            {
                while (!stopping && Error == null)
                {
                    int available = incoming.Count;
                    while (available > 0 && !stopping)
                    {
                        int got = incoming.Read(incomingSamples, Math.Min(1024, available));
                        Buffer.BlockCopy(incomingSamples, 0, incomingBytes, 0, got * 8);
                        clock.Push(incomingBytes, got);
                        available = incoming.Count;
                    }
                    long packet = Interlocked.Read(ref lastPacket);
                    bool idle =
                        packet == 0 || (System.Diagnostics.Stopwatch.GetTimestamp() - packet) >
                                           System.Diagnostics.Stopwatch.Frequency / 5;
                    if (idle && !idleReset)
                        clock.DiscardPending();
                    idleReset = idle;
                    if (Mixer.Queue.Count < target)
                    {
                        // Locks, sinc resampling and allocation inside WDL stay on
                        // this worker. The guitar callback only reads ready frames.
                        clock.Read(bytes, 0, bytes.Length);
                        Buffer.BlockCopy(bytes, 0, samples, 0, bytes.Length);
                        Mixer.Queue.Write(samples, 256);
                    }
                    else
                        Thread.Sleep(1);
                }
            }
            catch (Exception ex)
            {
                Error = "Backing playback: " + ex.Message;
            }
        }
        public void Dispose()
        {
            stopping = true;
            Mixer.Muted = true;
            if (capture != null)
            {
                capture.DataAvailable -= OnData;
                capture.RecordingStopped -= OnStopped;
                capture.Dispose();
                capture = null;
            }
            if (worker != null && worker.IsAlive)
                worker.Join();
            if (device != null)
            {
                device.Dispose();
                device = null;
            }
        }
    }
}
