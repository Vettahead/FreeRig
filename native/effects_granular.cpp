#include "effects.h"
#include "effects_filters.h"
#include <array>

namespace
{
    // Four overlapping Hann-windowed grains read a preallocated history. Dry
    // guitar stays immediate. This is a texture delay, not a transparent shifter.
    struct GrainCloud : Effect
    {
        std::vector<float> left, right;
        int write = 0, rate;
        double duration = .12, pitch = 1, feedback = .15, mix = .3, spread = .5;
        struct Grain
        {
            double phase = 0, read = 0, step = 1, length = 1;
        };
        std::array<Grain, 4> grains;
        GrainCloud(int sr) : left(sr * 4), right(sr * 4), rate(sr)
        {
            for (int i = 0; i < 4; ++i)
            {
                grains[i].phase = i * .25;
                grains[i].length = sr * duration;
            }
            params = {{"Grain", "ms", 25, 500, 120},
                      {"Pitch", "semitones", -24, 24, 0},
                      {"Feedback", "%", 0, 85, 15},
                      {"Spread", "%", 0, 100, 50},
                      {"Mix", "%", 0, 100, 30}};
        }
        void set(int i, float v) override
        {
            if (i == 0)
                duration = v * .001;
            if (i == 1)
                pitch = std::pow(2.0, v / 12);
            if (i == 2)
                feedback = v / 100;
            if (i == 3)
                spread = v / 100;
            if (i == 4)
                mix = v / 100;
        }
        double sample(const std::vector<float> &data, double position)
        {
            while (position < 0)
                position += data.size();
            while (position >= data.size())
                position -= data.size();
            int index = int(position);
            double f = position - index;
            return data[index] * (1 - f) + data[(index + 1) % data.size()] * f;
        }
        void process(float *l, float *r, int count) override
        {
            for (int i = 0; i < count; ++i)
            {
                double a = 0, b = 0;
                for (int j = 0; j < 4; ++j)
                {
                    auto &grain = grains[j];
                    if (grain.phase >= 1)
                    {
                        grain.phase -= 1;
                        grain.length = duration * rate;
                        grain.step = pitch;
                        // Keep even +24 semitone grains behind the live write head.
                        grain.read = write - grain.length * std::max(1.0, pitch) -
                                     rate * (.05 + j * .025 * spread);
                    }
                    double window = .25 * (1 - std::cos(2 * freerig::pi * grain.phase));
                    a += window * sample(left, grain.read);
                    b += window * sample(right, grain.read + j * spread * 13);
                    grain.read += grain.step;
                    grain.phase += 1 / grain.length;
                }
                left[write] = float(l[i] + feedback * std::tanh(a));
                right[write] = float(r[i] + feedback * std::tanh(b));
                write = (write + 1) % int(left.size());
                l[i] = float(l[i] * (1 - mix) + a * mix);
                r[i] = float(r[i] * (1 - mix) + b * mix);
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeGrainCloud(int rate)
{
    return std::make_unique<GrainCloud>(rate);
}
