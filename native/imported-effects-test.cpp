// Offline qualification for the four imported algorithms, independent of ASIO.
#include "effects.h"
#include <chrono>
#include <iostream>
#include <atomic>
#include <cstdlib>
#include <new>
#include <stdexcept>
static bool watchAlloc = false;
static size_t allocations = 0;
void *operator new(std::size_t n)
{
    if (watchAlloc)
        allocations++;
    if (auto p = std::malloc(n))
        return p;
    throw std::bad_alloc();
}
void *operator new[](std::size_t n)
{
    return ::operator new(n);
}
void operator delete(void *p) noexcept
{
    std::free(p);
}
void operator delete[](void *p) noexcept
{
    std::free(p);
}
void operator delete(void *p, std::size_t) noexcept
{
    std::free(p);
}
void operator delete[](void *p, std::size_t) noexcept
{
    std::free(p);
}
std::unique_ptr<Effect> create(std::string k, int r)
{
    return k == "CloudSeed" ? makeCloudSeed(r) : makeHothouse(k, r);
}
void check(bool b, const std::string &s)
{
    if (!b)
        throw std::runtime_error(s);
}
std::vector<float> render(const std::string &k, int rate, int block)
{
    auto f = create(k, rate);
    for (int i = 0; i < f->params.size(); i++)
        f->set(i, f->params[i].initial);
    std::vector<float> result;
    float l[4096], r[4096];
    for (int at = 0; at < rate * 2;)
    {
        int n = std::min(block, rate * 2 - at);
        for (int j = 0; j < n; j++)
        {
            l[j] = at + j < rate ? .1f * std::sin(6.283185307 * 173 * (at + j) / rate) : 0;
            r[j] = at + j < rate ? .07f * std::sin(6.283185307 * 281 * (at + j) / rate) : 0;
        }
        f->process(l, r, n);
        for (int j = 0; j < n; j++)
        {
            check(std::isfinite(l[j]) && std::isfinite(r[j]) && std::abs(l[j]) < 8 &&
                      std::abs(r[j]) < 8,
                  k + " invalid output");
            result.push_back(l[j]);
            result.push_back(r[j]);
        }
        at += n;
    }
    return result;
}
int main()
{
    try
    {
        for (auto k : {"CloudSeed", "EchoKing", "PhotonVibe", "TriPhase"})
            for (int sr : {44100, 48000, 96000})
            {
                auto reference = render(k, sr, 32);
                if (std::string(k) == "CloudSeed" || std::string(k) == "EchoKing")
                {
                    double tail = 0;
                    for (size_t j = sr * 2; j < reference.size(); j++)
                        tail += std::abs(reference[j]);
                    check(tail > .1, std::string(k) + " missing reverb/delay tail");
                }
                for (int b : {1, 17, 64, 127, 256})
                {
                    auto other = render(k, sr, b);
                    float delta = 0;
                    for (size_t j = 0; j < other.size(); j++)
                        delta = std::max(delta, std::abs(other[j] - reference[j]));
                    check(delta < .00002,
                          std::string(k) + " block dependence " + std::to_string(delta));
                }
                auto f = create(k, sr);
                float l[32], r[32];
                double energy = 0, stereo = 0;
                allocations = 0;
                auto begin = std::chrono::steady_clock::now();
                watchAlloc = true;
                for (int b = 0; b < 3000; b++)
                {
                    if (b % 100 == 0)
                        for (int p = 0; p < f->params.size(); p++)
                            f->set(p, b % 200 ? f->params[p].min : f->params[p].max);
                    for (int j = 0; j < 32; j++)
                    {
                        l[j] = .08f * std::sin(.1 * (b * 32 + j));
                        r[j] = .04f * std::cos(.071 * (b * 32 + j));
                    }
                    f->process(l, r, 32);
                    for (int j = 0; j < 32; j++)
                    {
                        if (!std::isfinite(l[j]) || !std::isfinite(r[j]) || std::abs(l[j]) >= 8 ||
                            std::abs(r[j]) >= 8)
                        {
                            watchAlloc = false;
                            throw std::runtime_error(std::string(k) + " parameter sweep unstable");
                        }
                        energy += std::abs(l[j]);
                        stereo += std::abs(l[j] - r[j]);
                    }
                }
                watchAlloc = false;
                auto us = std::chrono::duration_cast<std::chrono::microseconds>(
                              std::chrono::steady_clock::now() - begin)
                              .count();
                check(allocations == 0,
                      std::string(k) + " audio path allocated " + std::to_string(allocations));
                check(energy > 1 && stereo > 1, std::string(k) + " silent/collapsed");
                std::cout << "PASS " << k << " " << sr
                          << " Hz: block invariance 1/17/32/64/127/256, extremes finite, stereo, "
                             "no audio allocations; mean 32-frame callback "
                          << us / 3000.0 << " us, budget " << 32000000.0 / sr << " us\n";
            }
        return 0;
    }
    catch (const std::exception &e)
    {
        watchAlloc = false;
        std::cerr << e.what() << "\n";
        return 1;
    }
}
