#include "effects_registry.h"
#include <stdexcept>
namespace
{
    template <std::unique_ptr<Effect> (*Factory)(int)>
    std::unique_ptr<Effect> singleFactory(const std::string &, int rate)
    {
        return Factory(rate);
    }
} // namespace
const std::vector<EffectRegistration> &effectRegistry()
{
    // Registration is used at load/catalogue time, never for per-sample dispatch.
    static const std::vector<EffectRegistration> entries = {
        {"CloudSeed", singleFactory<makeCloudSeed>},
        {"EchoKing", makeHothouse},
        {"PhotonVibe", makeHothouse},
        {"TriPhase", makeHothouse},
        {"ShimmerHall", singleFactory<makeShimmer>},
        {"SurgeFloaty", makeSurge},
        {"SurgeReverb", makeSurge},
        {"GXOrange", makeGuitarix},
        {"GXPlus", makeGuitarix},
        {"GXFuzz", makeGuitarix},
        {"GXMuff", makeGuitarix},
        {"GXScream", makeGuitarix},
        {"GXSoft", makeGuitarix},
        {"Spring", singleFactory<makeSpring>},
        {"DiffuseDelay", singleFactory<makeDiffuse>},
        {"SurgeDelay", makeSurge},
        {"TapeDelay2", makeAir},
        {"Doublelay", makeAir},
        {"PitchDelay", makeAir},
        {"PurestEcho", makeAir},
        {"DragonHall", singleFactory<makeDragonHall>},
        {"DragonRoom", singleFactory<makeDragonRoom>},
        {"DragonPlate", singleFactory<makeDragonPlate>},
        {"Galactic3", makeAir},
        {"CreamCoat", makeAir},
        {"kCathedral5", makeAir},
        {"kGuitarHall2", makeAir},
        {"StereoChorus", makeAir},
        {"StereoEnsemble", makeAir},
        {"SurgeFlanger", makeSurge},
        {"SurgePhaser", makeSurge},
        {"SurgeRotary", makeSurge},
        {"Vibrato", makeAir},
        {"Tremolo", makeAir},
        {"AutoPan", makeAir},
    };
    return entries;
}
std::unique_ptr<Effect> createEffect(const std::string &key, int rate)
{
    if (rate < 8000 || rate > 192000)
        throw std::runtime_error("Unsupported effect sample rate");
    for (const auto &entry : effectRegistry())
    {
        if (key == entry.key)
        {
            auto effect = entry.factory(key, rate);
            if (!effect)
                throw std::runtime_error("Registered effect factory returned no processor: " + key);
            return effect;
        }
    }
    throw std::runtime_error("Unknown effect: " + key);
}
