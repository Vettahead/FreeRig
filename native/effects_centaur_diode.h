#pragma once
#include "effects_centaur_support.h"

namespace GainStageSpace
{
    // Same diode-pair equation and component values as ChowCentaur. Solve
    // omega+log(omega)=x directly, replacing its JUCE LUT/approximation split.
    // Fixed iterations, no table allocation or initialisation in processing.
    template <typename T, typename Next> class CustomDiodePairT : public chowdsp::wdft::RootWDF
    {
        Next &next;
        T saturation, thermal, resistance = 0, ratio = 0, logRatio = 0, incidentWave = 0;

      public:
        CustomDiodePairT(T is, T vt, Next &n) : next(n), saturation(is), thermal(vt)
        {
            next.connectToParent(this);
            calcImpedance();
        }
        void calcImpedance() override
        {
            resistance = next.wdf.R * saturation;
            ratio = resistance / thermal;
            logRatio = std::log(ratio);
        }
        void incident(T value)
        {
            incidentWave = value;
        }
        T reflected()
        {
            T sign = incidentWave >= 0 ? 1 : -1;
            T x = logRatio + std::abs(incidentWave) / thermal + ratio;
            T omega = x < 1 ? std::exp(x) : x - std::log(x) + T(.5);
            for (int i = 0; i < 8; ++i)
                omega -= (omega + std::log(omega) - x) * omega / (omega + 1);
            return incidentWave + 2 * sign * (resistance - thermal * omega);
        }
    };
} // namespace GainStageSpace
