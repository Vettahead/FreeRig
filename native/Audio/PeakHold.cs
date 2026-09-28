using System.Threading;
namespace GuitarSuite
{
    // One callback publishes peaks; the slower UI consumes them without losing
    // short overloads between meter messages. No locks or callback allocations.
    sealed class PeakHold
    {
        float value;
        public void Add(float peak)
        {
            float before;
            do
            {
                before = value;
                if (peak <= before)
                    return;
            } while (Interlocked.CompareExchange(ref value, peak, before) != before);
        }
        public float Take()
        {
            return Interlocked.Exchange(ref value, 0);
        }
    }
}
