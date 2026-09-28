// ChowCentaur circuit port (BSD-3-Clause, Jatin Chowdhury 2020).
// Original component/filter source and port notes: vendor/centaur.
#include "effects_rate96.h"
#include "effects_filters.h"
#include "vendor/centaur/PreAmpStage.cpp"
#include "vendor/centaur/FeedForward2.cpp"
#include "vendor/centaur/ClippingStage.h"
namespace GainStageSpace
{
    ClippingWDF::ClippingWDF(double rate) : C9(1e-6, rate), C10(1e-6, rate)
    {
        reset();
    }
    void ClippingWDF::reset()
    {
        Vbias.setVoltage(0);
    }
} // namespace GainStageSpace
namespace
{
    struct CircuitChannel
    {
        GainStageSpace::PreAmpWDF pre{96000};
        GainStageSpace::FeedForward2WDF feed{96000};
        GainStageSpace::ClippingWDF clip{96000};
        freerig::Biquad input, amp, sum, tone, output;
        static void first(freerig::Biquad &f, double bs0, double bs1, double as0, double as1,
                          double k = 192000)
        {
            double a0 = as0 * k + as1;
            f.b0 = (bs0 * k + bs1) / a0;
            f.b1 = (-bs0 * k + bs1) / a0;
            f.b2 = f.a2 = 0;
            f.a1 = (-as0 * k + as1) / a0;
        }
        CircuitChannel()
        {
            first(input, .1e-6 * 1e6, 0, .1e-6 * 1010000, 1);
            first(sum, 0, 392000, 820e-12 * 392000, 1);
        }
        void controls(double gain, double treble, double level)
        {
            pre.setGain(float(std::max(gain, 1e-8)));
            feed.setGain(float(gain));
            double r = (1 - gain) * 100000 + 2000;
            double a0 = 82e-9 * 390e-12 * r * 15000 * 422000;
            double a1 = 82e-9 * r * 15000 + 390e-12 * 422000 * (r + 15000), a2 = r + 15000;
            double b0 = a0, b1 = 82e-9 * 15000 * 422000 + a1, b2 = 422000 + a2;
            // Match the original pole-frequency warp: real poles use ordinary bilinear conversion.
            double discriminant = a1 * a1 - 4 * a0 * a2;
            double wc = discriminant < 0 ? std::sqrt(-discriminant) / (2 * a0) : 0;
            double k = wc == 0 ? 192000 : wc / std::tan(wc / 192000),
                   den = a0 * k * k + a1 * k + a2;
            amp.b0 = (b0 * k * k + b1 * k + b2) / den;
            amp.b1 = 2 * (b2 - b0 * k * k) / den;
            amp.b2 = (b0 * k * k - b1 * k + b2) / den;
            amp.a1 = 2 * (a2 - a0 * k * k) / den;
            amp.a2 = (a0 * k * k - a1 * k + a2) / den;
            double g1 = 1e-5, g2 = 1 / (1800 + (1 - treble) * 10000),
                   g3 = 1 / (4700 + treble * 10000), c = 3.9e-9;
            wc = g1 / c;
            k = wc / std::tan(wc / 192000);
            first(tone, c * (g1 + g2), g1 * (g2 + g3), c * (g3 - g1), -g1 * (g2 + g3), k);
            tone.b0 /= tone.a1;
            tone.b1 /= tone.a1;
            tone.a1 = 1 / tone.a1;
            double r1 = 560 + (1 - level) * 10000, r2 = level * 10000 + 1;
            first(output, 4.7e-6 * r2, 0, 4.7e-6 * (r1 + r2), 1);
        }
        float tick(float x)
        {
            float dry = float(input.tick(x));
            float preamp = pre.processSample(dry), forward1 = pre.getFF1();
            float clipped = clip.processSample(float(std::clamp(amp.tick(preamp), -4.5, 4.5)));
            double summed = sum.tick(clipped + forward1 + feed.processSample(dry));
            return float(output.tick(tone.tick(std::clamp(summed, -13.1, 11.7))));
        }
    };
    struct Centaur : Effect
    {
        CircuitChannel left, right;
        float target[3]{.2f, .5f, .5f}, current[3]{.2f, .5f, .5f};
        int clock = 0;
        Centaur()
        {
            params = {
                {"Gain", "%", 0, 100, 20}, {"Treble", "%", 0, 100, 50}, {"Level", "%", 0, 100, 50}};
            left.controls(.2, .5, .5);
            right.controls(.2, .5, .5);
        }
        void set(int i, float v) override
        {
            target[i] = v / 100;
        }
        void process(float *l, float *r, int n) override
        {
            for (int i = 0; i < n; ++i)
            {
                if (clock++ == 32)
                {
                    clock = 0;
                    for (int p = 0; p < 3; ++p)
                        current[p] += .0066445f * (target[p] - current[p]);
                    left.controls(current[0], current[1], current[2]);
                    right.controls(current[0], current[1], current[2]);
                }
                l[i] = left.tick(l[i]);
                r[i] = right.tick(r[i]);
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeCentaur(int rate)
{
    return std::make_unique<Rate96Effect>(std::make_unique<Centaur>(), rate);
}
