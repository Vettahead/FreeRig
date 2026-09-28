#include "effects.h"

namespace
{
    // Two alternating phrase buffers: play the previous slice backwards while
    // recording the next. Short edge fades prevent slice-boundary clicks.
    struct ReverseEcho : Effect
    {
        std::vector<float> left[2], right[2];
        int rate, recording = 0, cursor = 0, length, nextLength;
        float feedback = .25f, mix = .3f;
        bool ready = false;
        ReverseEcho(int sr) : rate(sr), length(sr / 2), nextLength(length)
        {
            for (int b = 0; b < 2; ++b)
            {
                left[b].resize(sr * 2);
                right[b].resize(sr * 2);
            }
            params = {{"Slice", "ms", 50, 2000, 500},
                      {"Feedback", "%", 0, 85, 25},
                      {"Mix", "%", 0, 100, 30}};
        }
        void set(int i, float v) override
        {
            if (i == 0)
                nextLength = std::clamp(int(rate * v * .001), 1, rate * 2);
            if (i == 1)
                feedback = v / 100;
            if (i == 2)
                mix = v / 100;
        }
        void process(float *l, float *r, int n) override
        {
            for (int i = 0; i < n; ++i)
            {
                int read = length - 1 - cursor;
                float fade = std::min(1.f, float(std::min(cursor, read)) / std::max(1, rate / 200));
                float a = ready ? left[1 - recording][read] * fade : 0;
                float b = ready ? right[1 - recording][read] * fade : 0;
                left[recording][cursor] = l[i] + feedback * std::tanh(a);
                right[recording][cursor] = r[i] + feedback * std::tanh(b);
                l[i] = l[i] * (1 - mix) + a * mix;
                r[i] = r[i] * (1 - mix) + b * mix;
                if (++cursor == length)
                {
                    cursor = 0;
                    recording = 1 - recording;
                    ready = true;
                    // A changed slice length starts a fresh recording cycle; no
                    // unwritten data from the larger region may be played.
                    if (length != nextLength)
                    {
                        length = nextLength;
                        ready = false;
                    }
                }
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeReverseEcho(int rate)
{
    return std::make_unique<ReverseEcho>(rate);
}
