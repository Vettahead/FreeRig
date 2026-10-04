using System;

namespace GuitarSuite
{
    // Final stereo peak protection, after master gain. Instant attack needs no
    // look-ahead delay; an 80 ms release avoids flattening each hot waveform peak.
    // One gain for both channels preserves stereo balance. Heavy overload still
    // changes dynamics; this is protection, not automatic loudness normalisation.
    sealed class OutputLimiter
    {
        public const float Ceiling = .95f;
        readonly double release;
        double gain = 1;
        public OutputLimiter(int sampleRate)
        {
            release = 1 - Math.Exp(-1.0 / (sampleRate * .080));
        }
        public void Process(ref float left, ref float right)
        {
            double peak = Math.Max(Math.Abs(left), Math.Abs(right));
            double required = peak > Ceiling ? Ceiling / peak : 1;
            gain = Math.Min(required, gain + (1 - gain) * release);
            left = (float)(left * gain);
            right = (float)(right * gain);
        }
    }
}
