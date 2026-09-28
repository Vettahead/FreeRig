// ConcreteConfig keeps the Surge DSP independent of its synthesizer UI.
#include "effects.h"
#include "sst/basic-blocks/simd/setup.h"
#include "sst/effects/ConcreteConfig.h"
#include "sst/effects/Delay.h"
#include "sst/effects/FloatyDelay.h"
#include "sst/effects/Reverb2.h"
#include "sst/effects/Phaser.h"
#include "sst/effects/Flanger.h"
#include "sst/effects/RotarySpeaker.h"
using Config = sst::effects::core::ConcreteConfig;
template <class FX> struct SurgeEffect : Effect
{
    Config::GlobalStorage global;
    Config::EffectStorage storage;
    FX fx;
    std::vector<int> conversions;
    alignas(16) float left[16] = {}, right[16] = {}, outL[16] = {}, outR[16] = {};
    int cursor = 0;
    SurgeEffect(int rate) : global(rate), fx(&global, &storage, nullptr)
    {
        for (int i = 0; i < FX::numParams; i++)
        {
            auto p = fx.paramAt(i);
            FxParam out{p.name, "", p.minVal, p.maxVal, p.defaultVal};
            int kind = 0;
            if (p.name == "Decay Time")
            {
                kind = 5;
                out.unit = "s";
                out.min = .1f;
                out.max = 32;
                out.initial = 4;
            }
            else if (p.name == "Time" || p.name == "Pre-Delay")
            {
                kind = 1;
                out.unit = "ms";
                out.min = p.name == "Time" ? 20 : 4;
                out.max = p.name == "Time" ? 2000 : 200;
                out.initial = p.name == "Time" ? 450 : 25;
            }
            else if (p.name == "Left" || p.name == "Right")
            {
                kind = 1;
                out.unit = "ms";
                out.min = 10;
                out.max = 2000;
                out.initial = 380;
            }
            else if (p.name == "Rate" || p.name == "Horn Rate")
            {
                kind = 2;
                out.unit = "Hz";
                out.min = .02f;
                out.max = 12;
                out.initial = .5f;
            }
            else if (p.name == "Low Cut" || p.name == "High Cut" || p.name == "Cutoff")
            {
                kind = 3;
                out.unit = "Hz";
                out.min = 20;
                out.max = 18000;
                out.initial = p.name == "Low Cut" ? 80 : 8000;
            }
            else if (p.name == "Width" && p.maxVal > 1)
            {
                out.unit = "dB";
            }
            else if (p.maxVal <= 2 && p.minVal >= -1 && p.name != "" && p.name != "Rotor Rate")
            {
                kind = 4;
                out.unit = "%";
                out.min *= 100;
                out.max *= 100;
                out.initial *= 100;
            }
            if (p.name == "Feedback" && out.min == 0)
                out.initial = 25;
            if (p.name == "Depth" || p.name == "Doppler" || p.name == "Tremolo" ||
                p.name == "Stereo")
                out.initial = 40;
            if (p.name == "Mix")
                out.initial = 30;
            if (p.name == "Rotor Rate")
                out.initial = .7f;
            conversions.push_back(kind);
            params.push_back(out);
            set(i, out.initial);
        }
        fx.initialize();
    }
    void set(int i, float v) override
    {
        switch (conversions[i])
        {
        case 1:
            v = std::log2(v / 1000);
            break;
        case 2:
            v = std::log2(v);
            break;
        case 3:
            v = 12 * std::log2(v / 440);
            break;
        case 4:
            v /= 100;
            break;
        case 5:
            v = std::log2(v);
            break;
        }
        fx.paramStorage[i] = v;
    }
    // The one-block FIFO supports any host buffer length without losing samples.
    int latency() const override
    {
        return 16;
    }
    void process(float *l, float *r, int n) override
    {
        for (int i = 0; i < n; i++)
        {
            left[cursor] = l[i];
            right[cursor] = r[i];
            l[i] = outL[cursor];
            r[i] = outR[cursor];
            if (++cursor == 16)
            {
                fx.processBlock(left, right);
                std::copy(left, left + 16, outL);
                std::copy(right, right + 16, outR);
                cursor = 0;
            }
        }
    }
};
std::unique_ptr<Effect> makeSurge(const std::string &key, int rate)
{
    if (key == "SurgeFloaty")
        return std::make_unique<SurgeEffect<sst::effects::floatydelay::FloatyDelay<Config>>>(rate);
    if (key == "SurgeReverb")
        return std::make_unique<SurgeEffect<sst::effects::reverb2::Reverb2<Config>>>(rate);
    if (key == "SurgeDelay")
        return std::make_unique<SurgeEffect<sst::effects::delay::Delay<Config>>>(rate);
    if (key == "SurgePhaser")
        return std::make_unique<SurgeEffect<sst::effects::phaser::Phaser<Config>>>(rate);
    if (key == "SurgeFlanger")
        return std::make_unique<SurgeEffect<sst::effects::flanger::Flanger<Config>>>(rate);
    if (key == "SurgeRotary")
        return std::make_unique<SurgeEffect<sst::effects::rotaryspeaker::RotarySpeaker<Config>>>(
            rate);
    return {};
}
