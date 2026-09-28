#include "effects.h"
#include "vendor/signalsmith/signalsmith-stretch.h"

namespace
{
    struct PitchShift : Effect
    {
        signalsmith::stretch::SignalsmithStretch<float> shift{42};
        float wetL[4096]{}, wetR[4096]{};
        std::vector<float> dryL, dryR;
        int cursor = 0, delay;
        float mix = 1;
        PitchShift(int rate)
        {
            shift.presetCheaper(2, float(rate));
            delay = shift.inputLatency() + shift.outputLatency();
            dryL.resize(delay + 1);
            dryR.resize(delay + 1);
            params = {{"Interval", "semitones", -24, 24, 12},
                      {"Fine", "cents", -50, 50, 0},
                      {"Mix", "%", 0, 100, 100}};
            shift.setTransposeSemitones(12);
        }
        float interval = 12, fine = 0;
        void set(int i, float v) override
        {
            if (i == 0)
                interval = v;
            if (i == 1)
                fine = v;
            if (i == 2)
                mix = v / 100;
            shift.setTransposeSemitones(interval + fine / 100);
        }
        int latency() const override
        {
            return delay;
        }
        void process(float *l, float *r, int n) override
        {
            const float *input[]{l, r};
            float *output[]{wetL, wetR};
            shift.process(input, n, output, n);
            for (int i = 0; i < n; ++i)
            {
                dryL[cursor] = l[i];
                dryR[cursor] = r[i];
                int read = (cursor + 1) % int(dryL.size());
                l[i] = dryL[read] * (1 - mix) + wetL[i] * mix;
                r[i] = dryR[read] * (1 - mix) + wetR[i] * mix;
                cursor = read;
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makePitchShift(int rate)
{
    return std::make_unique<PitchShift>(rate);
}
