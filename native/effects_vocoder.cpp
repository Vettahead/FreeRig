#include "effects.h"
#include "effects_filters.h"
#include <array>

namespace
{
    // Sixteen analysis/carrier bands. Guitar supplies the envelopes; a bandlimited
    // saw supplies the carrier. No input means no sustained synthesiser output.
    struct Vocoder : Effect
    {
        struct Band
        {
            freerig::SVF analysis[2], carrier[2];
            double envelope[2]{};
        };
        std::array<Band, 16> bands;
        double rate, phase = 0, hz = 110, formant = 1, release = .08, mix = .7;
        Vocoder(int sr) : rate(sr)
        {
            params = {{"Carrier", "Hz", 40, 1000, 110},
                      {"Formant", "ratio", .5f, 2, 1},
                      {"Release", "ms", 20, 500, 80},
                      {"Mix", "%", 0, 100, 70}};
        }
        void set(int i, float v) override
        {
            if (i == 0)
                hz = v;
            if (i == 1)
                formant = v;
            if (i == 2)
                release = v * .001;
            if (i == 3)
                mix = v / 100;
        }
        void process(float *l, float *r, int n) override
        {
            std::array<double, 16> analysisG, carrierG;
            for (int b = 0; b < 16; ++b)
            {
                double frequency = 110 * std::pow(60.0, b / 15.0);
                analysisG[b] = std::tan(freerig::pi * std::min(frequency, rate * .4) / rate);
                carrierG[b] =
                    std::tan(freerig::pi * std::min(frequency * formant, rate * .4) / rate);
            }
            double step = hz / rate, attack = 1 - std::exp(-1 / (.002 * rate)),
                   decay = 1 - std::exp(-1 / (release * rate));
            for (int i = 0; i < n; ++i)
            {
                double carrier = 2 * phase - 1;
                if (phase < step)
                {
                    double t = phase / step;
                    carrier -= t + t - t * t - 1;
                }
                else if (phase > 1 - step)
                {
                    double t = (phase - 1) / step;
                    carrier -= t * t + t + t + 1;
                }
                phase += step;
                if (phase >= 1)
                    phase -= 1;
                double output[2]{}, input[]{l[i], r[i]};
                for (int b = 0; b < 16; ++b)
                    for (int ch = 0; ch < 2; ++ch)
                    {
                        auto &band = bands[b];
                        double magnitude =
                            std::abs(band.analysis[ch].band(input[ch], analysisG[b], .3));
                        band.envelope[ch] += (magnitude > band.envelope[ch] ? attack : decay) *
                                             (magnitude - band.envelope[ch]);
                        output[ch] +=
                            band.carrier[ch].band(carrier, carrierG[b], .3) * band.envelope[ch] * 5;
                    }
                l[i] = float(input[0] * (1 - mix) + output[0] * mix);
                r[i] = float(input[1] * (1 - mix) + output[1] * mix);
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeVocoder(int rate)
{
    return std::make_unique<Vocoder>(rate);
}
