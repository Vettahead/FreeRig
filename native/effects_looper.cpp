#include "effects.h"

namespace
{
    // Audio is intentionally volatile: patches save controls, never loop audio.
    // Recording overwrites only visited samples, avoiding a callback buffer clear.
    struct PhraseLooper : Effect
    {
        std::vector<float> left, right;
        int mode = 0, command = 0, length = 0, cursor = 0, rate;
        float mix = .7f, overdub = .5f;
        PhraseLooper(int sr) : left(sr * 60), right(sr * 60), rate(sr)
        {
            params = {{"Mode", "", 0, 3, 0},
                      {"Loop level", "%", 0, 100, 70},
                      {"Overdub", "%", 0, 100, 50}};
        }
        void set(int i, float v) override
        {
            if (i == 0)
            {
                int next = std::clamp(int(std::round(v)), 0, 3);
                // Auto-play at capacity is internal state. Repeated host parameter
                // updates must not re-trigger the still-selected Record command.
                if (next == command)
                    return;
                command = next;
                if (next == 0)
                {
                    length = 0;
                    cursor = 0;
                }
                if (next == 1)
                {
                    length = 0;
                    cursor = 0;
                }
                if (mode == 1 && next >= 2)
                    cursor = 0;
                mode = next;
            }
            if (i == 1)
                mix = v / 100;
            if (i == 2)
                overdub = v / 100;
        }
        void process(float *l, float *r, int n) override
        {
            for (int i = 0; i < n; ++i)
            {
                if (mode == 1)
                {
                    left[cursor] = l[i];
                    right[cursor] = r[i];
                    length = ++cursor;
                    if (cursor == int(left.size()))
                    {
                        mode = 2;
                        cursor = 0;
                    }
                }
                else if (mode >= 2 && length > 0)
                {
                    float a = left[cursor], b = right[cursor];
                    if (mode == 3)
                    {
                        left[cursor] = a * (1 - overdub) + l[i] * overdub;
                        right[cursor] = b * (1 - overdub) + r[i] * overdub;
                    }
                    float fade = std::min(1.f, float(std::min(cursor, length - 1 - cursor)) /
                                                   std::max(1, rate / 200));
                    l[i] += a * mix * fade;
                    r[i] += b * mix * fade;
                    cursor = (cursor + 1) % length;
                }
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makePhraseLooper(int rate)
{
    return std::make_unique<PhraseLooper>(rate);
}
