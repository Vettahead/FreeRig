#pragma once
#include "effects.h"
#include "vendor/guitarix/gx_resampler.h"
#include <stdexcept>

// Owns preparation and the existing Zita conversion path. The inner processor
// always runs at 96 kHz. Construction measures converter delay for graph joins.
struct Rate96Effect : Effect
{
    std::unique_ptr<Effect> inner;
    gx_resample::FixedRateResampler left, right;
    std::vector<float> highL, highR;
    int delay = 0;
    Rate96Effect(std::unique_ptr<Effect> effect, int rate)
        : inner(std::move(effect)), highL(50000), highR(50000)
    {
        params = inner->params;
        if (left.setup(rate, 96000) || right.setup(rate, 96000))
            throw std::runtime_error("96 kHz converter setup failed");
        gx_resample::FixedRateResampler probe;
        probe.setup(rate, 96000);
        float input[512]{}, output[512]{};
        input[0] = 1;
        std::vector<float> high(probe.max_out_count(512));
        probe.up(512, input, high.data());
        probe.down(high.data(), output);
        for (int i = 1; i < 512; ++i)
            if (std::abs(output[i]) > std::abs(output[delay]))
                delay = i;
    }
    int latency() const override
    {
        return delay;
    }
    void set(int i, float v) override
    {
        inner->set(i, v);
    }
    void process(float *l, float *r, int n) override
    {
        int count = left.up(n, l, highL.data());
        right.up(n, r, highR.data());
        inner->process(highL.data(), highR.data(), count);
        left.down(highL.data(), l);
        right.down(highR.data(), r);
    }
};
