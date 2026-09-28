#pragma once
#include "effects.h"
// One registration drives both loading and the exported parameter catalogue.
struct EffectRegistration
{
    const char *key;
    std::unique_ptr<Effect> (*factory)(const std::string &, int);
};
const std::vector<EffectRegistration> &effectRegistry();
std::unique_ptr<Effect> createEffect(const std::string &key, int rate);
