// Guitarix Faust circuit processors, with independent L/R instances and the
// original Zita resampler. All circuits run at 96 kHz, including at 44.1 kHz I/O.
#include "effects.h"
#include <cstdint>
#include "vendor/guitarix/gx_pluginlv2.h"
#include "vendor/guitarix/gx_resampler.h"
#include "vendor/guitarix/gx_resampler.cc"
#include "vendor/guitarix/resampler.cc"
#include "vendor/guitarix/resampler-table.cc"
#define FAUSTFLOAT float
#define N_(x) x
#define always_inline
#define __rt_data
#define __rt_func
template <class T> T mydsp_faustpower2_f(T x)
{
    return x * x;
}
template <class T> T mydsp_faustpower3_f(T x)
{
    return x * x * x;
}
template <class T> T mydsp_faustpower4_f(T x)
{
    return x * x * x * x;
}
namespace bossds1
{
    enum PortIndex
    {
        LEVEL,
        TONE,
        DRIVE
    };
} // namespace bossds1
namespace mxrdist
{
    enum PortIndex
    {
        VOLUME,
        DRIVE
    };
} // namespace mxrdist
namespace fuzzface
{
    enum PortIndex
    {
        FUZZ,
        LEVEL
    };
} // namespace fuzzface
namespace muff
{
    enum PortIndex
    {
        TONE,
        VOLUME
    };
} // namespace muff
namespace scream
{
    enum PortIndex
    {
        SCREAM
    };
} // namespace scream
namespace softclip
{
    enum PortIndex
    {
        FUZZ
    };
} // namespace softclip
#include "vendor/guitarix/bossds1.cc"
#include "vendor/guitarix/mxrdist.cc"
#include "vendor/guitarix/fuzzface.cc"
#include "vendor/guitarix/muff.cc"
#include "vendor/guitarix/scream.cc"
#include "vendor/guitarix/softclip.cc"
struct GuitarixEffect : Effect
{
    PluginLV2 *left, *right;
    std::vector<float> values;
    gx_resample::FixedRateResampler upL, upR;
    std::vector<float> bufL, bufR;
    int delay = 0;
    GuitarixEffect(plug factory, int rate, std::vector<FxParam> p)
        : left(factory()), right(factory()), bufL(50000), bufR(50000)
    {
        params = p;
        values.resize(p.size());
        for (int i = 0; i < (int)p.size(); i++)
        {
            values[i] = p[i].initial;
            left->connect_ports(i, &values[i], left);
            right->connect_ports(i, &values[i], right);
        }
        left->set_samplerate(96000, left);
        right->set_samplerate(96000, right);
        if (upL.setup(rate, 96000) || upR.setup(rate, 96000))
            throw std::runtime_error("Pedal resampler failed");
        // Measure the adapter delay at this exact ratio; no hardware audio is used.
        gx_resample::FixedRateResampler probe;
        probe.setup(rate, 96000);
        float in[512] = {}, out[512] = {};
        in[0] = 1;
        std::vector<float> high(probe.max_out_count(512));
        probe.up(512, in, high.data());
        probe.down(high.data(), out);
        float peak = 0;
        for (int i = 0; i < 512; i++)
            if (std::abs(out[i]) > peak)
            {
                peak = std::abs(out[i]);
                delay = i;
            }
    }
    ~GuitarixEffect()
    {
        left->delete_instance(left);
        right->delete_instance(right);
    }
    int latency() const override
    {
        return delay;
    }
    void set(int i, float v) override
    {
        values[i] = v;
    }
    void process(float *l, float *r, int count) override
    {
        int n = upL.up(count, l, bufL.data()), m = upR.up(count, r, bufR.data());
        left->mono_audio(n, bufL.data(), bufL.data(), left);
        right->mono_audio(m, bufR.data(), bufR.data(), right);
        upL.down(bufL.data(), l);
        upR.down(bufR.data(), r);
    }
};
std::unique_ptr<Effect> makeGuitarix(const std::string &key, int rate)
{
    if (key == "GXOrange")
        return std::make_unique<GuitarixEffect>(bossds1::plugin, rate,
                                                std::vector<FxParam>{{"Level", "dB", -20, 12, 0},
                                                                     {"Tone", "", 0, 1, .5},
                                                                     {"Drive", "", 0, 1, .4}});
    if (key == "GXPlus")
        return std::make_unique<GuitarixEffect>(
            mxrdist::plugin, rate,
            std::vector<FxParam>{{"Volume", "", 0, 1, .5}, {"Drive", "", 0, 1, .5}});
    if (key == "GXFuzz")
        return std::make_unique<GuitarixEffect>(
            fuzzface::plugin, rate,
            std::vector<FxParam>{{"Fuzz", "", 0, 1, .5}, {"Level", "", 0, 1, .5}});
    if (key == "GXMuff")
        return std::make_unique<GuitarixEffect>(
            muff::plugin, rate,
            std::vector<FxParam>{{"Tone", "", 0, 1, .5}, {"Volume", "", 0, 1, .5}});
    if (key == "GXScream")
        return std::make_unique<GuitarixEffect>(scream::plugin, rate,
                                                std::vector<FxParam>{{"Drive", "", 0, 1, .5}});
    if (key == "GXSoft")
        return std::make_unique<GuitarixEffect>(softclip::plugin, rate,
                                                std::vector<FxParam>{{"Fuzz", "", 0, 1.99, 1.5}});
    return {};
}
