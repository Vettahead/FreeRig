#pragma once
#include "vendor/chowdsp-wdf/chowdsp_wdf.h"
#include <algorithm>
// Compatibility names for the original ChowCentaur WDF topology. No JUCE host.
namespace chowdsp
{
    namespace WDFT = wdft;
}
template <typename T> inline T jmax(T a, T b)
{
    return std::max(a, b);
}
