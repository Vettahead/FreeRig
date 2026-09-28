#pragma once
#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <cmath>
struct FxParam
{
    std::string name, unit;
    float min, max, initial;
};
// A processor owns its prepared DSP buffers. set/process must not perform I/O.
// process receives in-place stereo samples; the C ABI limits a call to 4096 frames.
struct Effect
{
    std::vector<FxParam> params;
    virtual ~Effect() = default;
    virtual void set(int i, float value) = 0;
    virtual void process(float *l, float *r, int n) = 0;
    virtual int latency() const
    {
        return 0;
    }
};
std::unique_ptr<Effect> makeAir(const std::string &, int);
std::unique_ptr<Effect> makeSurge(const std::string &, int);
std::unique_ptr<Effect> makeDragonHall(int);
std::unique_ptr<Effect> makeDragonRoom(int);
std::unique_ptr<Effect> makeDragonPlate(int);
std::unique_ptr<Effect> makeSpring(int rate);
std::unique_ptr<Effect> makeDiffuse(int rate);
std::unique_ptr<Effect> makeGuitarix(const std::string &, int);
std::unique_ptr<Effect> makeShimmer(int);

std::unique_ptr<Effect> makeHothouse(const std::string &, int);
std::unique_ptr<Effect> makeCloudSeed(int);
