// Cycfi Q BACF detector, Boost Software License 1.0. Analyse clean input.
#include <q/pitch/pitch_detector.hpp>
#include <cmath>
#include <algorithm>
struct Tuner
{
    cycfi::q::pitch_detector detector;
    double dc = 0, low = 0, power = 0;
    int rate;
    float hz = 0, confidence = 0;
    Tuner(int r)
        : detector(cycfi::q::frequency(35), cycfi::q::frequency(1400), r, cycfi::q::dB(-40.0)),
          rate(r)
    {
    }
};
#define API extern "C" __declspec(dllexport)
API void *tuner_load(int rate)
{
    try
    {
        return new Tuner(rate);
    }
    catch (...)
    {
        return nullptr;
    }
}
API void tuner_free(Tuner *t)
{
    delete t;
}
API void tuner_process(Tuner *t, const float *data, int n)
{
    if (!t)
        return;
    const double hp = 1 - std::exp(-2 * 3.141592653589793 * 20 / t->rate),
                 lp = 1 - std::exp(-2 * 3.141592653589793 * 1600 / t->rate),
                 env = 1 - std::exp(-1.0 / (t->rate * .04));
    for (int i = 0; i < n; i++)
    {
        double x = std::isfinite(data[i]) ? data[i] : 0;
        t->dc += hp * (x - t->dc);
        t->low += lp * (x - t->dc - t->low);
        t->power += env * (x * x - t->power);
        t->detector((float)t->low);
    }
    t->confidence = t->detector.periodicity();
    t->hz = t->power > 1e-7 && t->confidence > .85f ? t->detector.get_frequency() : 0;
}
API float tuner_hz(Tuner *t)
{
    return t ? t->hz : 0;
}
API float tuner_confidence(Tuner *t)
{
    return t ? t->confidence : 0;
}
