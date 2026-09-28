#pragma once
#include <cmath>
#include <algorithm>

namespace freerig
{
    constexpr double pi = 3.14159265358979323846;
    // Transposed direct-form II; double state keeps quiet decays well behaved.
    struct Biquad
    {
        double b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0, z1 = 0, z2 = 0;
        double tick(double x)
        {
            double y = b0 * x + z1;
            z1 = b1 * x - a1 * y + z2;
            z2 = b2 * x - a2 * y;
            return y;
        }
        void peak(double hz, double q, double db, double rate)
        {
            double w = 2 * pi * std::min(hz, rate * .45) / rate;
            double alpha = std::sin(w) / (2 * q), gain = std::pow(10.0, db / 40),
                   a0 = 1 + alpha / gain;
            b0 = (1 + alpha * gain) / a0;
            b1 = -2 * std::cos(w) / a0;
            b2 = (1 - alpha * gain) / a0;
            a1 = b1;
            a2 = (1 - alpha / gain) / a0;
        }
    };
    // Topology-preserving state variable filter, suitable for moving a cutoff.
    struct SVF
    {
        double s1 = 0, s2 = 0;
        double band(double x, double g, double damping)
        {
            const double a = 1 / (1 + g * (g + damping));
            double v1 = a * (s1 + g * (x - s2));
            double v2 = s2 + g * v1;
            s1 = 2 * v1 - s1;
            s2 = 2 * v2 - s2;
            return v1 * damping;
        }
    };
} // namespace freerig
