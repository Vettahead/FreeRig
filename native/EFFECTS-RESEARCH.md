# Effects selection — 26 September 2026

The current app contains 31 native library effects, in addition to its original simple effects and two Amplitron amp voices. Selection combines upstream source inspection, licence compatibility, integration cost and the actual native tests. Popularity is supporting evidence, not a sound-quality score. GitHub has no consistent user-review rating, and release downloads exclude package managers, mirrors and plug-in bundles.

## Shortlist and adoption

Numbers below were read from each project's official GitHub API on the date above. Downloads are the sum of assets attached to the latest **up to 30 releases**, not lifetime downloads or unique users. A dash means no useful count was available. Source snapshots are pinned in `vendor/SOURCES.json`.

| Project | Stars | Release asset downloads | Decision |
|---|---:|---:|---|
| [Guitarix](https://github.com/brummer10/guitarix) | 653 | 7,618 (11 releases) | Added six drive/fuzz processors; retains circuit/filter code and Zita resampling. |
| [Surge XT](https://github.com/surge-synthesizer/surge) | 4,031 | 23 (one retained release; not representative) | Existing delay/flanger/phaser/rotary/spring, plus FloatyDelay and Reverb2 via the team's effects library. |
| [Airwindows](https://github.com/airwindows/airwindows) | 1,234 | — | Retained 13 mature delay, reverb and modulation algorithms; consolidated source pinned separately. |
| [Dragonfly Reverb](https://github.com/michaelwillis/dragonfly-reverb) | 1,149 | 286,742 (30 releases) | Hall, Room and Plate; Hall also supplies the shimmer reverb's wet tank. |
| [Signalsmith Stretch](https://github.com/Signalsmith-Audio/signalsmith-stretch) | 558 | — | Added pitch shifting for Shimmer Hall. Its latency is confined to the wet ambience, leaving the dry guitar immediate. |
| [ChowMatrix](https://github.com/Chowdhury-DSP/ChowMatrix) | 335 | 86,322 (4 releases) | Existing standalone diffusion adaptation retained; not a complete port of ChowMatrix. |
| [BYOD](https://github.com/Chowdhury-DSP/BYOD) | 574 | 78,982 (6 releases) | Strong future WDF/circuit option; deferred the larger JUCE processor/host integration in favour of the tested Guitarix adapters. |
| [Valley Rack Free / Plateau](https://github.com/ValleyAudio/ValleyRackFree) | 217 | 12,251 (10 releases) | Attractive Dattorro ambience; deferred another host-specific port after selecting Dragonfly and Surge tanks. |
| [Ensemble Chorus](https://github.com/jpcima/ensemble-chorus) | 41 | — | Interesting BBD architecture, but experimental and last pushed in 2019. Current Airwindows chorus/ensemble plus Surge modulation were the lower-risk choice. |
| [DISTRHO Ports](https://github.com/DISTRHO/DISTRHO-Ports) | 317 | 60,252 (5 releases) | Useful collection, but overlapping engines and per-component licences; no wholesale import. |
| [DaisySP](https://github.com/electro-smith/DaisySP) | 1,232 | — | Useful embedded DSP; no wholesale import because algorithms overlap and licences vary by component. |
| [Cycfi Q](https://github.com/cycfi/q) | 1,425 | — | BACF tuner retained; 27 harmonic pitch cases pass within three cents at three sample rates. |

Upstream descriptions, manuals, maintenance history and issues were considered alongside these counts. No claim of universal “best”, Strymon equivalence or exact hardware replication follows from them. No third-party review score has been invented.

## Sounds added in alpha 06

- **Orange Distortion**: Guitarix `bossds1`; DS-1-inspired circuit simulation.
- **Distortion Plus**: Guitarix `mxrdist`; MXR-style distortion circuit.
- **Round Fuzz**: Guitarix `fuzzface`; fuzz circuit simulation.
- **Sustain Fuzz**: Guitarix `muff`; its filter/clipper implementation, not a claim of an exact particular Big Muff revision.
- **Scream Drive**: Guitarix `scream`, whose upstream name is *Screaming Bird*. This is **not** a Tube Screamer model.
- **Soft Clip**: Guitarix's simple soft-clip effect; an algorithmic shaper, not a captured pedal.
- **Warp Echo**: Surge FloatyDelay with rate, pitch/filter modulation and a reverse-wash preset.
- **Modulated Space**: Surge Reverb2 with diffusion, damping, modulation and long-cloud presets.
- **Shimmer Hall**: original combination of Signalsmith pitch shifting and Dragonfly Hall; octave-up, fifth and octave-down presets. Inspired by the broad ambient/shimmer category, not Strymon's proprietary algorithms.

Six Guitarix processors run at 96 kHz with the original Zita resampler at 44.1/48 kHz I/O. Their integer adapter delay is measured on construction and aligned through the graph, including bypass and parallel joins. At 96 kHz there is no resampling. Other processors retain their upstream rate handling; the whole app is not universally oversampled.

## Accuracy and validation limits

The official NAM Core remains the capture engine. Alpha 06 removes the factory amp EQ offsets from captured amps; newly imported amp captures begin with neutral external EQ. Existing user EQ choices remain intact. Capture input/output levels are not automatically normalised: doing so would change how a captured drive pushes the next amp. Match the capture creator's calibration guidance when supplied.

Native tests cover 31 effects at 44.1/48/96 kHz; all 65 factory presets with 1/17/64/127/256/1024/4096/128-sample blocks; finite bounded output; stereo preservation; delayed bypass/parallel joins; IR impulse responses; tempo timing; tuner accuracy; and TONE3000 mock download/library/auth cases. Three locally downloaded Fortin A2 pedal variants pass full pedal → amp → cab tests, including scene switches and bypass matching a pedal-removed rig. Neutral captured amps also match direct NAM Core output within the regression tolerance.

The original reported distortion/crash was not reproduced with those fixtures. Definite import-stop and unwanted amp-EQ faults were corrected, and fully bypassed captures stop processing. Hardware ASIO listening, physical pedal comparisons and long-running dropout tests remain necessary; no live audio was started during this unattended run. A full amp+cab capture followed by another cabinet produces double cabinet filtering. Parallel paths sum, and bypass normally passes dry signal through the existing route.
