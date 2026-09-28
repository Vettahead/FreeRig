# NAM low-buffer regression — alpha 09

27 September 2026. Tested on Chris's current Windows PC; offline, no ASIO device opened.

The before path prepares NAM for 4096 frames; the after path prepares for the actual callback size. Both use the same released GuitarNam.dll, full-quality models, stereo LiveGraph, NAM pedal → built-in clean amp → cabinet filters, plus the output provider. Seven privately downloaded 48 kHz SlimmableContainer captures were tested. The selected model quality is unchanged. Each timed run renders approximately one second of audio; values below are medians across the seven captures. Initial loads/warm-up are excluded. These throughput measurements do not measure driver/converter latency, scheduling jitter, or worst-case callback duration.

| Callback samples | Before, ms / second audio | After, ms / second audio | Speed-up |
| ---------------- | ------------------------: | -----------------------: | -------: |
| 8                |                    1427.6 |                    169.7 |    8.41x |
| 32               |                     443.2 |                    118.0 |    3.76x |
| 64               |                     279.1 |                    110.0 |    2.54x |
| 128              |                     192.3 |                    105.7 |    1.82x |
| 256              |                     146.9 |                    105.3 |    1.40x |
| 512              |                     126.6 |                    105.2 |    1.20x |

All 42 stereo output comparisons reported maximum absolute sample difference **0**, using a varying two-frequency signal after identical-length graph warm-up. Three graph replacements and scene/bypass updates were exercised per case. A block exceeding its prepared size is rejected. The existing full native self-test passed with all seven captures, including effect presets, stereo IR, tuner, concurrent graph swaps and import/library tests.

No callback aggregation, extra delay, new resampler, model slimming or compiler/DSP change is involved. The UI and ASIO buffer settings are unchanged. The smaller preparation size applies at startup and to every graph replacement; a driver reset or callback-size change requires restart. Actual guitar feel and Mackie stability still need a listening check. 8 samples has very little operating-system scheduling margin even when offline processing fits.

## Reproduction

Build with native/build.ps1, then run the desktop executable with `--buffer-test` and local NAM paths; wait for exit and inspect buffer-test.txt beside the executable. Exit 0 means the output/transition/bounds checks passed. Timing is informational, not a flaky test threshold. The old preparation limit is retained as the optional default in offline Graph/LiveGraph callers for reference comparisons; the live ASIO path always supplies the driver size.

Private captures, account sessions and personal audio logs are excluded from the release source archive.
