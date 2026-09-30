#include "effects.h"
#include "cabinet_convolution.h"
#include "cabinet-data.inc"

namespace
{
    // Windowed-sinc conversion at preparation time preserves the IR's gain.
    // Runtime processing never reads WAV files or constructs a new convolver.
    std::vector<float> converted(const CabinetRecording &ir, int rate)
    {
        if (rate == 48000)
            return {ir.samples, ir.samples + ir.size};
        double ratio = rate / 48000.0, cutoff = std::min(1.0, ratio);
        std::vector<float> out(int(std::ceil(ir.size * ratio)));
        for (int i = 0; i < int(out.size()); ++i)
        {
            double position = i / ratio, value = 0;
            for (int j = int(position) - 32; j <= int(position) + 32; ++j)
            {
                double distance = position - j;
                if (j < 0 || j >= ir.size || std::abs(distance) >= 32)
                    continue;
                double x = 3.141592653589793 * distance * cutoff;
                double sinc = std::abs(x) < 1e-10 ? 1 : std::sin(x) / x;
                value += ir.samples[j] * cutoff * sinc *
                         (.5 + .5 * std::cos(3.141592653589793 * distance / 32));
            }
            out[i] = float(value / ratio);
        }
        return out;
    }
    struct RecordedCabinet : Effect
    {
        std::vector<std::unique_ptr<CabinetConvolution>> left, right;
        std::vector<float> weights;
        int micA = 0, micB = 1;
        float blend = 0, polarity = 1, volume = .251188643f, currentVolume = .251188643f, smoothing;
        RecordedCabinet(int rate, const std::vector<int> &indices)
            : weights(indices.size(), 0), smoothing(1 - std::exp(-1.f / (.005f * rate)))
        {
            for (int index : indices)
            {
                auto ir = converted(cabinetRecordings[index], rate);
                left.push_back(std::make_unique<CabinetConvolution>(ir));
                right.push_back(std::make_unique<CabinetConvolution>(ir));
                // Stagger FFT partition boundaries across microphones/channels.
                // Prefeeding silence changes the work schedule, not IR arrival
                // time: each convolver still returns its zero-latency head.
                // Avoids all twelve Greenback convolvers bursting in one 32-frame call.
                int slot = int(left.size()) - 1;
                int total = int(indices.size()) * 2;
                for (int n = 0; n < slot * 2 * 256 / total; ++n)
                    left.back()->tick(0);
                for (int n = 0; n < (slot * 2 + 1) * 256 / total; ++n)
                    right.back()->tick(0);
            }
            weights[0] = 1;
            float last = float(indices.size() - 1);
            params = {{"Mic A", "", 0, last, 0},
                      {"Mic B", "", 0, last, 1},
                      {"Blend B", "%", 0, 100, 0},
                      {"Invert B", "", 0, 1, 0},
                      {"Output", "dB", -24, 12, -12}};
        }
        void set(int index, float value) override
        {
            if (index == 0)
                micA = int(std::round(value));
            if (index == 1)
                micB = int(std::round(value));
            if (index == 2)
                blend = value * .01f;
            if (index == 3)
                polarity = value >= .5f ? -1 : 1;
            if (index == 4)
                volume = std::pow(10.f, value / 20.f);
        }
        void process(float *l, float *r, int frames) override
        {
            for (int i = 0; i < frames; ++i)
            {
                float sumL = 0, sumR = 0;
                // All recorded responses keep their history, including while inaudible.
                // This makes mic/scene changes smooth with no allocation or reset gap.
                for (int j = 0; j < int(left.size()); ++j)
                {
                    float target = (j == micA ? 1 - blend : 0) + (j == micB ? blend * polarity : 0);
                    weights[j] += smoothing * (target - weights[j]);
                    sumL += weights[j] * left[j]->tick(l[i]);
                    sumR += weights[j] * right[j]->tick(r[i]);
                }
                currentVolume += smoothing * (volume - currentVolume);
                l[i] = sumL * currentVolume;
                r[i] = sumR * currentVolume;
            }
        }
    };
} // namespace
std::unique_ptr<Effect> makeRecordedCabinet(const std::string &key, int rate)
{
    if (key == "CabJesterV30")
        return std::make_unique<RecordedCabinet>(rate, std::vector<int>{0, 8, 11, 13});
    if (key == "CabJesterDV77")
        return std::make_unique<RecordedCabinet>(rate, std::vector<int>{1, 9, 12, 14});
    if (key == "CabJesterRockdriver")
        return std::make_unique<RecordedCabinet>(rate, std::vector<int>{2, 10});
    if (key == "CabJesterMixed")
        return std::make_unique<RecordedCabinet>(rate, std::vector<int>{3, 4, 5, 6, 7});
    if (key == "CabJesterGreenback")
        return std::make_unique<RecordedCabinet>(rate, std::vector<int>{15, 16, 17, 18, 19, 20});
    return {};
}
