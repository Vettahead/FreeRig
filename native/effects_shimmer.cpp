// An original octave-hall combination, not a model of a branded reverb pedal.
// Pitch shifting lives exclusively in the wet path, so dry guitar stays immediate.
#include "effects.h"
#include "vendor/signalsmith/signalsmith-stretch.h"
struct ShimmerEffect : Effect
{
    signalsmith::stretch::SignalsmithStretch<float> shift{42};
    std::unique_ptr<Effect> hall;
    float pitchedL[4096] = {}, pitchedR[4096] = {}, dryL[4096] = {}, dryR[4096] = {};
    float shimmer = .45f, mix = .3f;
    ShimmerEffect(int rate) : hall(makeDragonHall(rate))
    {
        shift.presetDefault(2, float(rate));
        shift.setTransposeSemitones(12);
        params = {{"Decay", "s", .2f, 10, 6},
                  {"Shimmer", "%", 0, 100, 45},
                  {"High cut", "Hz", 1000, 16000, 7000},
                  {"Mix", "%", 0, 100, 30},
                  {"Pitch", "semitones", -12, 24, 12}};
        hall->set(3, 100);
        for (int i = 0; i < 5; i++)
            set(i, params[i].initial);
    }
    void set(int i, float v) override
    {
        if (i == 0)
            hall->set(0, v);
        if (i == 1)
            shimmer = v / 100;
        if (i == 2)
            hall->set(2, v);
        if (i == 3)
            mix = v / 100;
        if (i == 4)
            shift.setTransposeSemitones(v);
    }
    void process(float *l, float *r, int n) override
    {
        std::copy(l, l + n, dryL);
        std::copy(r, r + n, dryR);
        const float *input[] = {l, r};
        float *output[] = {pitchedL, pitchedR};
        shift.process(input, n, output, n);
        for (int i = 0; i < n; i++)
        {
            l[i] = dryL[i] * (1 - shimmer) + pitchedL[i] * shimmer;
            r[i] = dryR[i] * (1 - shimmer) + pitchedR[i] * shimmer;
        }
        hall->process(l, r, n);
        for (int i = 0; i < n; i++)
        {
            l[i] = dryL[i] * (1 - mix) + l[i] * mix;
            r[i] = dryR[i] * (1 - mix) + r[i] * mix;
        }
    }
};
std::unique_ptr<Effect> makeShimmer(int rate)
{
    return std::make_unique<ShimmerEffect>(rate);
}
