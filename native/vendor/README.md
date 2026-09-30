# Bundled source â€” alpha 06

Exact revisions are recorded in SOURCES.json. Build-effects.ps1 compiles the selected source; the checked-in copies are authoritative for this build.

| Directory | Upstream | Licence / integration |
| --- | --- | --- |
| airwindows | https://github.com/baconpaul/airwin2rack and https://github.com/airwindows/airwindows | MIT; 13 processors, consolidated base, no upstream UI |
| dragonfly | https://github.com/michaelwillis/dragonfly-reverb | GPL-3.0-or-later; selected Freeverb3 dependencies and Hall/Room/Plate DSP |
| sst-effects, sst-basic-blocks, sst-filters, sst-waveshapers | https://github.com/surge-synthesizer | GPL-3.0-or-later; headers for delay, phaser, flanger, rotary |
| surge-spring and shared | https://github.com/surge-synthesizer/surge | GPL-3.0-or-later; ChowDSP spring processor and support classes |
| chowmatrix | https://github.com/Chowdhury-DSP/ChowMatrix | BSD-3-Clause; original diffusion source retained for provenance, adapted in effects_diffuse.cpp |
| cycfi-q | https://github.com/cycfi/q | Boost-1.0; BACF pitch detector and headers |
| cycfi-infra | https://github.com/cycfi/infra | MIT; header support facilities; licence text reproduced from referenced MIT licence |
| fmt | https://github.com/fmtlib/fmt | MIT; header dependency |

Modifications dated 26 September 2026: Dragonfly class names separated by processor; unused artwork/plug-in includes removed and denormal handling supplied in common/compat.h. Fixed room input filter naming in the host adapter. Surge spring global/portable-intrinsics includes replaced by host SIMD/sum/dB helpers; unused basic_dsp include removed from SmoothedValue. Allpass diffusion from ChowMatrix adapted to standalone stereo delay with local smoothing; no JUCE or complete ChowMatrix UI/code is included. Other source headers retain upstream copyright and licence notices.

The C ABI, stereo graph adapters, preset metadata and tuner UI are Guitar Suite additions. The combined Guitar Suite source is supplied under GPL-3.0-or-later, with original permissive licences retained on individual components. TONE3000 branding remains the owner's trademark. Microsoft runtime/SDK and .NET dependencies retain their separate notices.

Alpha 06 additions (26 September 2026): Guitarix selected Faust-generated drive circuits and original Faust source (GPL-2.0-or-later), Zita resampler 1.1.0 (GPL-3.0-or-later), and Signalsmith Stretch/Linear (MIT). Guitarix clipping.h gained an include guard; the Zita table mutex uses std::mutex instead of pthreads for Windows, with the same locking scope. Circuit maths are retained; the host runs each at 96 kHz with independent left/right instances. Selected Surge FloatyDelay and Reverb2 headers use the existing pinned source. Shimmer Hall is a Guitar Suite composition of Signalsmith pitch shifting and Dragonfly Hall, not a branded-pedal clone. See EFFECTS-RESEARCH.md in the parent directory.

## Alpha 15 additions

- cloudseed-core: https://github.com/GhostNoteAudio/CloudSeedCore — MIT. Open stereo core, not the commercial plugin or its preset library.
- hothouse: https://github.com/clevelandmusicco/HothouseExamples — GPL-3.0-or-later. EchoKing MkII, Glowjob Photon Vibe and TriPhase Theorem portable DSP extracts.

Exact revisions are in SOURCES.json; host modifications are documented in each directory's PORTING.md. All original copyright notices are retained.

## Alpha 24 additions

156 additional Airwindows algorithms and original MIT manuals at the existing pinned revision. Centaur circuit source (BSD-3-Clause, Jatin Chowdhury) and chowdsp_wdf (MIT) are documented in centaur/PORTING.md and SOURCES.json. FreeRig adds EQ, wah/envelope, reverse/granular, vocoder, practice looper and standalone Signalsmith pitch adapters. See ../docs/EFFECTS-COLLECTION.md from the repository root.


## Alpha 26 additions

Tamgamp source is pinned in SOURCES.json. Unmodified circuit resources and loudness tables are adapted in effects_tamgamp.cpp; LGPL support and original Guitarix GPL notices remain in the source tree with COPYING and COPYING.LESSER.

Jester Dyne's Brutal/Emerald CC0 cabinet packs retain original WAVs and PDF handbooks in jester-cabs. SOURCE hashes, the stable recording manifest and LICENSE.txt document provenance. scripts/build-cabinet-data.py trims leading silence, retains 200 ms and fades the final 10 ms without gain normalisation. The existing MIT Signalsmith FFT powers the partitioned tail. See docs/CIRCUIT-AMPS-AND-CABS.md at the repository root.
