#include "effects.h"
#include "effects_filters.h"

namespace
{
    struct Wah : Effect
    {
        bool envelope;
        double rate, level = 0, position = .4, desired = .4, sensitivity = 4, q = 3, mix = 1;
        freerig::SVF filters[2];
        Wah(int sr, bool automatic) : envelope(automatic), rate(sr)
        {
            params = {{automatic ? "Sensitivity" : "Position", "%", 0, 100, 40},
                      {"Resonance", "Q", .5f, 8, 3},
                      {"Mix", "%", 0, 100, 100}};
        }
        void set(int i, float v) override
        {
            if (i == 0)
            {
                desired = v / 100;
                sensitivity = .5 + v * .12;
            }
            if (i == 1)
                q = v;
            if (i == 2)
                mix = v / 100;
        }
        void process(float *l, float *r, int n) override
        {
            const double smoothing = 1 - std::exp(-1 / (.01 * rate));
            for (int i = 0; i < n; ++i)
            {
                const double peak = std::max(std::abs(l[i]), std::abs(r[i]));
                level += (1 - std::exp(-1 / ((peak > level ? .003 : .09) * rate))) * (peak - level);
                position +=
                    smoothing *
                    ((envelope ? std::clamp(level * sensitivity, 0.0, 1.0) : desired) - position);
                const double cutoff = std::min(350 * std::pow(7.0, position), rate * .4);
                const double g = std::tan(freerig::pi * cutoff / rate);
                l[i] = float(l[i] * (1 - mix) + filters[0].band(l[i], g, 1 / q) * mix * 2);
                r[i] = float(r[i] * (1 - mix) + filters[1].band(r[i], g, 1 / q) * mix * 2);
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeWah(int rate)
{
    return std::make_unique<Wah>(rate, false);
}
std::unique_ptr<Effect> makeEnvelopeFilter(int rate)
{
    return std::make_unique<Wah>(rate, true);
}
