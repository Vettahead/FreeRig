#include "effects_registry.h"
#include "json.hpp"
#include <iostream>
#include <xmmintrin.h>
using json = nlohmann::json;
static thread_local std::string error;
#define API extern "C" __declspec(dllexport)
API const char *fx_error()
{
    return error.c_str();
}
API void *fx_load(const char *key, int rate)
{
    try
    {
        return createEffect(key, rate).release();
    }
    catch (const std::exception &e)
    {
        error = e.what();
        return nullptr;
    }
}
API void fx_free(Effect *fx)
{
    delete fx;
}
API int fx_latency(Effect *fx)
{
    return fx ? fx->latency() : 0;
}
API int fx_set(Effect *fx, const double *values, int count)
{
    if (!fx || count != (int)fx->params.size())
        return 0;
    for (int i = 0; i < count; i++)
    {
        auto p = fx->params[i];
        if (!std::isfinite(values[i]) || values[i] < p.min - 0.00001 || values[i] > p.max + 0.00001)
            return 0;
    }
    try
    {
        for (int i = 0; i < count; i++)
            fx->set(i, (float)values[i]);
        return 1;
    }
    catch (const std::exception &e)
    {
        error = e.what();
        return 0;
    }
}
API int fx_process(Effect *fx, float *l, float *r, int count)
{
    if (!fx || count < 0 || count > 4096)
        return 0;
    unsigned old = _mm_getcsr();
    _mm_setcsr(old | 0x8040);
    try
    {
        fx->process(l, r, count);
        _mm_setcsr(old);
        for (int i = 0; i < count; i++)
            if (!std::isfinite(l[i]) || !std::isfinite(r[i]))
                return 0;
        return 1;
    }
    catch (...)
    {
        _mm_setcsr(old);
        return 0;
    }
}
API const char *fx_catalogue()
{
    static std::string result;
    try
    {
        json all = json::array();
        for (const auto &entry : effectRegistry())
        {
            const auto key = entry.key;
            auto fx = createEffect(key, 48000);
            json p = json::array();
            for (auto x : fx->params)
                p.push_back({x.name, x.min, x.max, x.initial, x.unit});
            all.push_back({{"key", key}, {"params", p}, {"latency", fx->latency()}});
        }
        result = all.dump();
        return result.c_str();
    }
    catch (const std::exception &e)
    {
        error = e.what();
        return nullptr;
    }
}
#ifdef FX_DUMP
int main()
{
    auto s = fx_catalogue();
    if (!s)
    {
        std::cerr << error;
        return 1;
    }
    std::cout << s;
}
#endif
