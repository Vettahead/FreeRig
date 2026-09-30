#pragma once
#include "vendor/signalsmith/signalsmith-linear/fft.h"
#include <array>
#include <vector>

// Zero-added-latency convolution: direct 256-sample head, FFT-partitioned tail.
// A complete input partition is available precisely when its delayed tail is
// needed. Every allocation and FFT plan belongs to preparation, not processing.
class CabinetConvolution
{
    using Complex = std::complex<float>;
    static constexpr int hop = 256, size = hop * 2;
    signalsmith::linear::FFT<float> fft{size};
    std::array<float, hop> head{}, ring{}, tail{}, overlap{};
    std::array<Complex, size> input{}, scratch{}, sum{}, time{};
    std::vector<std::array<Complex, size>> kernels, history;
    int cursor = 0, partition = 0;

  public:
    explicit CabinetConvolution(const std::vector<float> &ir)
    {
        for (int i = 0; i < hop && i < int(ir.size()); ++i)
            head[i] = ir[i];
        int parts = std::max(1, (int(ir.size()) - 1) / hop);
        kernels.resize(parts);
        history.resize(parts);
        for (int p = 0; p < parts; ++p)
        {
            scratch.fill({});
            for (int i = 0; i < hop; ++i)
            {
                int offset = (p + 1) * hop + i;
                if (offset < int(ir.size()))
                    scratch[i] = ir[offset];
            }
            fft.fft(scratch.data(), kernels[p].data());
        }
    }
    float tick(float sample)
    {
        ring[cursor] = sample;
        input[cursor] = sample;
        float result = tail[cursor];
        for (int i = 0; i < hop; ++i)
            result += head[i] * ring[(cursor - i + hop) % hop];
        if (++cursor == hop)
        {
            cursor = 0;
            fft.fft(input.data(), history[partition].data());
            sum.fill({});
            int count = int(kernels.size());
            for (int p = 0; p < count; ++p)
            {
                const auto &past = history[(partition - p + count) % count];
                for (int i = 0; i < size; ++i)
                    sum[i] += past[i] * kernels[p][i];
            }
            fft.ifft(sum.data(), time.data());
            for (int i = 0; i < hop; ++i)
            {
                tail[i] = time[i].real() / size + overlap[i];
                overlap[i] = time[i + hop].real() / size;
            }
            partition = (partition + 1) % count;
        }
        return result;
    }
};
