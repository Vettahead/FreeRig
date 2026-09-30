// Tamgamp's unmodified DK-builder circuits and gain-normalisation tables.
// Prepared stereo instances run at the upstream 96 kHz internal rate. Only
// controls actually present in a circuit are exposed; no decorative EQ knobs.
#include "effects.h"
#include <cstring>
#include <stdexcept>
#include "vendor/guitarix/gx_resampler.h"
#include "vendor/tamgamp/src/resources/faust.cpp"
#include "vendor/tamgamp/src/resources/ampsim.cpp"

namespace
{
    const char *names[] = {"DC3Rhythm",       "DC3Lead",      "JCM800High",    "JCM800Low",
                           "RectifierOrange", "RectifierRed", "Princeton",     "TwinNormal",
                           "TwinVibrato",     "AC30Normal",   "AC30Brilliant", "5150Crunch",
                           "5150Lead"};
    struct Binding : faust::UI
    {
        float *zones[6] = {};
        void addVerticalSlider(const char *label, float *zone, float, float, float, float) override
        {
            const char *keys[] = {".amp.gain",   ".amp.bass",    ".amp.middle",
                                  ".amp.treble", ".amp.pregain", ".amp.postgain"};
            for (int i = 0; i < 6; ++i)
                if (std::strcmp(label, keys[i]) == 0)
                    zones[i] = zone;
        }
    };
    struct CircuitAmp : Effect
    {
        std::unique_ptr<faust::dsp> channel[2];
        Binding binding[2];
        gx_resample::FixedRateResampler converter[2];
        std::vector<float> high[2];
        std::vector<int> mapping;
        int model, delay = 0;
        float gain = .5f, output = 1;
        explicit CircuitAmp(int index, int rate) : model(index)
        {
            for (int side = 0; side < 2; ++side)
            {
                channel[side].reset(tamgamp_lv2::ampsim_dsp[model]());
                channel[side]->init(96000);
                channel[side]->buildUserInterface(&binding[side]);
                if (converter[side].setup(rate, 96000))
                    throw std::runtime_error("Amp resampler failed");
                high[side].resize(converter[side].max_out_count(4096));
            }
            const char *labels[] = {"Gain", "Bass", "Middle", "Treble", "Input trim", "Output"};
            for (int i = 0; i < 6; ++i)
                if (binding[0].zones[i])
                {
                    mapping.push_back(i);
                    params.push_back({labels[i], i < 4 ? "" : "dB", i < 4 ? 0.f : -24.f,
                                      i < 4 ? 10.f : 12.f, i < 4 ? 5.f : 0.f});
                }
            // Match the upstream default loudness correction without an AGC.
            updateOutput();
            gx_resample::FixedRateResampler probe;
            probe.setup(rate, 96000);
            float input[512] = {}, result[512] = {};
            input[0] = 1;
            std::vector<float> temp(probe.max_out_count(512));
            probe.up(512, input, temp.data());
            probe.down(temp.data(), result);
            for (int i = 1; i < 512; ++i)
                if (std::abs(result[i]) > std::abs(result[delay]))
                    delay = i;
        }
        void updateOutput()
        {
            // Preserve upstream's normalisation interpolation exactly.
            const float *table = tamgamp_lv2::ampsim_norming + model * AMPSIM_GAIN_NORM_STEPS;
            int x = int(gain * AMPSIM_GAIN_NORM_STEPS - 1);
            float norm;
            if (x <= 0)
                norm = table[0];
            else if (x >= AMPSIM_GAIN_NORM_STEPS - 1)
                norm = table[AMPSIM_GAIN_NORM_STEPS - 1];
            else
            {
                float d = gain - x / float(AMPSIM_GAIN_NORM_STEPS);
                norm = table[x] * (1 - d) + table[x + 1] * d;
            }
            for (auto &b : binding)
                *b.zones[5] = output * norm;
        }
        void set(int index, float value) override
        {
            int control = mapping[index];
            float scaled = control < 4 ? value * .1f : std::pow(10.f, value / 20.f);
            if (control == 0)
                gain = scaled;
            if (control == 5)
                output = scaled;
            else
                for (auto &b : binding)
                    *b.zones[control] = scaled;
            if (control == 0 || control == 5)
                updateOutput();
        }
        int latency() const override
        {
            return delay;
        }
        void process(float *left, float *right, int frames) override
        {
            float *buffers[] = {left, right};
            for (int side = 0; side < 2; ++side)
            {
                int count = converter[side].up(frames, buffers[side], high[side].data());
                float *samples = high[side].data();
                channel[side]->compute(count, &samples, &samples);
                converter[side].down(samples, buffers[side]);
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeCircuitAmp(const std::string &key, int rate)
{
    for (int i = 0; i < 13; ++i)
        if (key == std::string("Amp") + names[i])
            return std::make_unique<CircuitAmp>(i + 1, rate);
    return {};
}
