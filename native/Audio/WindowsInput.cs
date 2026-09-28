using System;
using System.Linq;
using NAudio.Wave;
using NAudio.CoreAudioApi;

namespace GuitarSuite
{
    // Converts interleaved float capture packets to bounded mono processing blocks.
    // Storage and the consumer delegate are owned for the entire capture session.
    sealed class CaptureBlocks
    {
        readonly float[] samples;
        readonly int channels, channel;
        readonly Action<float[], int> consume;
        int used;
        public CaptureBlocks(int channels, int channel, int frames, Action<float[], int> consume)
        {
            if (channels < 1 || channel < 0 || channel >= channels || frames < 1)
                throw new ArgumentException("Invalid Windows input channel or block size.");
            this.channels = channels;
            this.channel = channel;
            this.consume = consume;
            samples = new float[frames];
        }
        public void Push(byte[] bytes, int count)
        {
            if (count < 0 || count > bytes.Length || count % (channels * 4) != 0)
                throw new ArgumentException("Incomplete Windows audio packet.");
            for (int offset = 0; offset < count; offset += channels * 4)
            {
                float value = BitConverter.ToSingle(bytes, offset + channel * 4);
                samples[used++] = Single.IsNaN(value) || Single.IsInfinity(value) ? 0 : value;
                if (used == samples.Length)
                {
                    consume(samples, used);
                    used = 0;
                }
            }
        }
    }

    sealed class WindowsInput : IDisposable
    {
        public const int BlockFrames = 128;
        MMDevice device;
        WasapiCapture capture;
        CaptureBlocks blocks;
        bool stopping;
        public volatile string Error;
        public static object[] List()
        {
            using (var devices = new MMDeviceEnumerator()) return devices
                .EnumerateAudioEndPoints(DataFlow.Capture, NAudio.CoreAudioApi.DeviceState.Active)
                .Select(d =>
                        {
                            using (d) using (var client = d.AudioClient) return (
                                object) new { id = d.ID, name = d.FriendlyName,
                                              channels = client.MixFormat.Channels };
                        })
                .ToArray();
        }
        public WindowsInput(string id, int channel, int rate, Action<float[], int> consume)
        {
            try
            {
                using (var devices = new MMDeviceEnumerator()) device = devices.GetDevice(id);
                if (device.State != NAudio.CoreAudioApi.DeviceState.Active)
                    throw new Exception("The selected Windows input is disconnected.");
                // Shared mode lets Windows negotiate hardware formats and sample rates.
                // Float conversion happens in WASAPI, before our channel extraction.
                capture = new WasapiCapture(device, true, 10);
                int channels = capture.WaveFormat.Channels;
                blocks = new CaptureBlocks(channels, channel, BlockFrames, consume);
                capture.WaveFormat = WaveFormat.CreateIeeeFloatWaveFormat(rate, channels);
                capture.DataAvailable += OnData;
                capture.RecordingStopped += OnStopped;
            }
            catch
            {
                Dispose();
                throw;
            }
        }
        void OnData(object sender, WaveInEventArgs e)
        {
            if (stopping || Error != null)
                return;
            try
            {
                blocks.Push(e.Buffer, e.BytesRecorded);
            }
            catch (Exception ex)
            {
                Error = "Windows input: " + ex.Message;
            }
        }
        void OnStopped(object sender, StoppedEventArgs e)
        {
            if (!stopping)
                Error =
                    "Windows input stopped. Check the device and microphone privacy permissions, then restart audio. " +
                    (e.Exception == null ? "" : e.Exception.Message);
        }
        public void Start()
        {
            capture.StartRecording();
        }
        public void Dispose()
        {
            stopping = true;
            if (capture != null)
            {
                capture.DataAvailable -= OnData;
                capture.RecordingStopped -= OnStopped;
                // Dispose joins the capture thread before the engine releases its graph.
                capture.Dispose();
                capture = null;
            }
            if (device != null)
            {
                device.Dispose();
                device = null;
            }
        }
    }
}
