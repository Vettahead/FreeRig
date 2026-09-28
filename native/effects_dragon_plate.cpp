// Dragonfly adapter: fixed size/predelay avoid allocating on the audio thread.
#include "effects.h"
#include "vendor/dragonfly/plate/DistrhoPluginInfo.h"
#include "vendor/dragonfly/plate/DSP.hpp"
struct DragonPlateEffect : Effect
{
    DragonPlate dsp;
    float mix = .25f;
    DragonPlateEffect(int rate) : dsp(rate)
    {
        params = {{"Decay", "s", .2f, 10, 2.5f},
                  {"Width", "%", 50, 150, 100},
                  {"High cut", "Hz", 1000, 16000, 8000},
                  {"Mix", "%", 0, 100, 25}};
        dsp.setParameterValue(paramDry, 0);
        dsp.setParameterValue(paramWet, 100);
        for (int i = 0; i < 4; i++)
            set(i, params[i].initial);
        float l[16] = {}, r[16] = {};
        process(l, r, 16);
        dsp.mute();
    }
    void set(int i, float v) override
    {
        if (i == 0)
            dsp.setParameterValue(paramDecay, v);
        if (i == 1)
            dsp.setParameterValue(paramWidth, v);
        if (i == 2)
            dsp.setParameterValue(paramHighCut, v);
        if (i == 3)
            mix = v / 100;
    }
    void process(float *l, float *r, int n) override
    {
        float a[4096], b[4096];
        const float *in[] = {l, r};
        float *out[] = {a, b};
        dsp.run(in, out, n);
        for (int i = 0; i < n; i++)
        {
            l[i] = l[i] * (1 - mix) + a[i] * mix;
            r[i] = r[i] * (1 - mix) + b[i] * mix;
        }
    }
};
std::unique_ptr<Effect> makeDragonPlate(int rate)
{
    return std::make_unique<DragonPlateEffect>(rate);
}