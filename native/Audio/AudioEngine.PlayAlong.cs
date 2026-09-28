using System;
namespace GuitarSuite
{
    sealed partial class AudioEngine
    {
        PlayAlongInput playAlong;
        int playbackGeneration;
        string playbackEndpoint = "", backingError = "";
        public void StartPlayAlong(string source, double db, bool muted, bool confirmedSeparate)
        {
            if (!Running)
                throw new Exception("Start guitar audio in Audio setup first.");
            PlayAlongInput.ValidateRoute(source, playbackEndpoint, confirmedSeparate);
            StopPlayAlong();
            backingError = "";
            var next = new PlayAlongInput(source, sampleRate, BufferSize, db, muted);
            playAlong = next;
            provider.Backing = next.Mixer;
        }
        public void SetPlayAlongLevel(double db, bool muted)
        {
            if (playAlong != null)
                playAlong.SetLevel(db, muted);
        }
        public void StopPlayAlong()
        {
            backingError = "";
            if (playAlong == null)
                return;
            var previous = playAlong;
            playAlong = null;
            previous.Dispose();
            // The provider retains only the managed mixer, which fades to zero.
            // It has no capture handles; live guitar processing continues normally.
        }
        public object PlayAlongStatus()
        {
            if (playAlong != null && playAlong.Error != null)
            {
                string error = playAlong.Error;
                StopPlayAlong();
                backingError = error;
            }
            return new { type = "playAlongStatus",
                         running = playAlong != null,
                         audioRunning = Running,
                         sessionId = playbackGeneration,
                         sourceName = playAlong == null ? "" : playAlong.Name,
                         peak = playAlong == null ? 0 : playAlong.Mixer.Peak,
                         drops = playAlong == null ? 0 : playAlong.DroppedPackets,
                         muted = playAlong != null && playAlong.Mixer.Muted,
                         outputDevice = playbackEndpoint,
                         error = backingError };
        }
    }
}
