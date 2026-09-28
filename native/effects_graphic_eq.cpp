#include "effects.h"
#include "effects_filters.h"
#include <array>

namespace
{
    // Ten octave-spaced peak sections. Flat settings are exactly unity; output
    // trim is separate so cutting/boosting bands never secretly normalises tone.
    struct GraphicEQ : Effect
    {
        const double rate;
        const std::array<double, 10> frequencies{31.25, 62.5, 125,  250,  500,
                                                 1000,  2000, 4000, 8000, 16000};
        std::array<freerig::Biquad, 10> left, right;
        std::array<float, 11> target{}, current{};
        int clock = 0;
        double gain = 1;
        GraphicEQ(int sr) : rate(sr)
        {
            for (const char *name : {"31 Hz", "63 Hz", "125 Hz", "250 Hz", "500 Hz", "1 kHz",
                                     "2 kHz", "4 kHz", "8 kHz", "16 kHz"})
                params.push_back({name, "dB", -12, 12, 0});
            params.push_back({"Output", "dB", -24, 12, 0});
        }
        void set(int i, float value) override
        {
            target[i] = value;
        }
        void process(float *l, float *r, int n) override
        {
            for (int i = 0; i < n; ++i)
            {
                if (clock++ % 32 == 0)
                {
                    const float blend = float(1 - std::exp(-32 / (.01 * rate)));
                    for (int band = 0; band < 10; ++band)
                    {
                        current[band] += blend * (target[band] - current[band]);
                        left[band].peak(frequencies[band], 1.4, current[band], rate);
                        right[band].peak(frequencies[band], 1.4, current[band], rate);
                    }
                    current[10] += blend * (target[10] - current[10]);
                    gain = std::pow(10.0, current[10] / 20);
                    clock = 1;
                }
                double a = l[i], b = r[i];
                for (int band = 0; band < 10; ++band)
                {
                    a = left[band].tick(a);
                    b = right[band].tick(b);
                }
                l[i] = float(a * gain);
                r[i] = float(b * gain);
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeGraphicEQ(int rate)
{
    return std::make_unique<GraphicEQ>(rate);
}
