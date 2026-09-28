#pragma once
#include "effects.h"
#include "vendor/airwindows/airwin_consolidated_base.h"

// A separate adapter leaves the original released processors unchanged. Controls
// expose upstream normalised positions as percentages, not invented physical units.
struct ImportedAirEffect : Effect
{
    std::unique_ptr<AirwinConsolidatedBase> fx;
    int fixedDelay;
    ImportedAirEffect(AirwinConsolidatedBase *processor, int count, int rate, int delay = 0)
        : fx(processor), fixedDelay(delay)
    {
        fx->setSampleRate(rate);
        for (int i = 0; i < count; ++i)
        {
            char name[64] = {};
            fx->getParameterName(i, name);
            params.push_back({name, "%", 0, 100, fx->getParameter(i) * 100});
        }
    }
    int latency() const override
    {
        return fixedDelay;
    }
    void set(int index, float value) override
    {
        fx->setParameter(index, value / 100);
    }
    void process(float *left, float *right, int frames) override
    {
        float *channels[] = {left, right};
        fx->processReplacing(channels, channels, frames);
    }
};
