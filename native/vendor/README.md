# Bundled source — alpha 05

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
