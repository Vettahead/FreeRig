# Imported effects — Alpha 15

CloudSeed Space uses the current reusable [CloudSeedCore](https://github.com/GhostNoteAudio/CloudSeedCore) stereo engine (MIT), starting from its DarkPlate topology. It is not a port of the commercial plugin interface or its preset collection. EchoKing MkII, Photon Vibe and TriPhase Theorem adapt [HothouseExamples](https://github.com/clevelandmusicco/HothouseExamples) (GPL-3.0-or-later). Pinned revisions and exact host changes are in native/vendor/SOURCES.json and the two PORTING.md files.

Each pedal has three FreeRig presets. Continuous controls are smoothed. TriPhase runs its three phasers continuously and blends between models. EchoKing model/tape-age switches retain discrete changes; this release does not promise seamless switching of those modes. EchoKing exposes normal echo, without the hardware SOS/preamp-only modes. New effects have no tempo-sync control in this release.

CloudSeed uses up to 64 samples of scratch space, processing shorter callbacks immediately. A fixed internal feedback delay makes its reverb topology independent of host block length; it is not an added input/output buffer. The dry signal is mixed immediately. No NAM processing, capture calibration, ASIO device or buffer setting was changed.

Qualification: native/imported-effects-test.cpp tests equivalent output for blocks 1/17/32/64/127/256 at 44.1/48/96 kHz, bounded finite parameter extremes, stereo output, audible-length reverb/echo tails, and no allocations during processing/parameter updates. EffectsTests.cs covers graph bypass/re-engagement at 32 samples and all 77 presets; full --self-test passes. The new collection totals 35 native effects. Browser checks confirmed all four editors and applying CloudSeed/EchoKing presets. Existing effects, pedalboard and patch-model JS suites pass.

Offline mean processing per 32-frame block at 48 kHz on this PC: CloudSeed 31.59 microseconds, EchoKing 6.75, Photon 3.73, TriPhase 7.71 (666.67 microseconds available per callback). These are isolated averages, not worst-case ASIO latency or a promise about long chains. No live audio device was started. Physical-pedal equivalence was not measured.

Build with native/build-effects.ps1 then native/build.ps1. Run FreeRig.exe --self-test. Compile native/imported-effects-test.cpp with effects_hothouse.cpp and effects_cloudseed.cpp using the bundled clang++ compiler, -std=c++20 -O2 -static -D_USE_MATH_DEFINES. Tests and complete corresponding source are included in the release source archive.
