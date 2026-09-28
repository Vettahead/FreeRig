// Surge/ChowDSP spring processor, GPL-3.0-or-later. Host glue only here.
#include "effects.h"
#include <array>
#include <vector>
#include <cmath>
#include <algorithm>
#include <cstring>
#include <cassert>
#include "sst/basic-blocks/simd/setup.h"
#include "sst/basic-blocks/simd/wrap_simd_f32x4.h"
#define BLOCK_SIZE 16
inline float vSum(SIMD_M128 v)
{
    alignas(16) float a[4];
    SIMD_MM(store_ps)(a, v);
    return a[0] + a[1] + a[2] + a[3];
}
inline double dB_to_linear(double d)
{
    return std::pow(10., d / 20);
}
#include "vendor/surge-spring/SpringReverbProc.cpp"
#include "vendor/shared/StateVariableFilter.cpp"
struct SpringEffect : Effect
{
    chowdsp::SpringReverbProc fx;
    chowdsp::SpringReverbProc::Params p;
    float mix = .25f;
    int at = 0;
    alignas(16) float l[16] = {}, r[16] = {}, outL[16] = {}, outR[16] = {};
    SpringEffect(int rate)
    {
        params = {{"Size", "%", 0, 100, 50},        {"Decay", "%", 0, 100, 50},
                  {"Reflections", "%", 0, 100, 70}, {"Spin", "%", 0, 100, 50},
                  {"Damping", "%", 0, 100, 50},     {"Chaos", "%", 0, 100, 0},
                  {"Mix", "%", 0, 100, 25}};
        fx.prepare(rate, 16);
        for (int i = 0; i < 7; i++)
            set(i, params[i].initial);
    }
    void set(int i, float v) override
    {
        v /= 100;
        switch (i)
        {
        case 0:
            p.size = v;
            break;
        case 1:
            p.decay = v;
            break;
        case 2:
            p.reflections = v;
            break;
        case 3:
            p.spin = v;
            break;
        case 4:
            p.damping = v;
            break;
        case 5:
            p.chaos = v;
            break;
        case 6:
            mix = v;
        }
    }
    int latency() const override
    {
        return 16;
    }
    void process(float *left, float *right, int n) override
    {
        for (int i = 0; i < n; i++)
        {
            l[at] = left[i];
            r[at] = right[i];
            left[i] = outL[at];
            right[i] = outR[at];
            if (++at == 16)
            {
                float dryL[16], dryR[16];
                std::copy(l, l + 16, dryL);
                std::copy(r, r + 16, dryR);
                fx.setParams(p, 16);
                fx.processBlock(l, r, 16);
                for (int j = 0; j < 16; j++)
                {
                    outL[j] = dryL[j] * (1 - mix) + l[j] * mix;
                    outR[j] = dryR[j] * (1 - mix) + r[j] * mix;
                }
                at = 0;
            }
        }
    }
};
std::unique_ptr<Effect> makeSpring(int rate)
{
    return std::make_unique<SpringEffect>(rate);
}
