# Alpha 24 effects collection

The collection contains **200 separately registered native processors**: the
previous 35, 156 selected Airwindows algorithms and nine new FreeRig adapters.
Existing lightweight built-in devices and imported NAM captures are additional.
Different presets and enclosure colours are not counted as different effects.

## Coverage

| Family                         | Examples and purpose                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Drive, boost, distortion, fuzz | Centaur circuit drive, Guitarix DS-1/Distortion Plus/Fuzz Face/Muff, Airwindows Drive/Density/Tube/Spiral; clean and treble boosts |
| EQ                             | Ten Band EQ, Parametric, PearEQ, Baxandall, tone shelves and resonant EQ                                                           |
| Filters and wah                | Sweep Wah, Envelope Wah, resonant low/high/band/notch filters, infrasonic removal                                                  |
| Dynamics                       | Compressors, VariMu, transient shaping, gates, auto-swell, de-essing, de-hiss and noise reduction                                  |
| Modulation                     | Chorus, ensemble, phaser, flanger, rotary, Uni-Vibe style, vibrato, tremolo, autopan and ring modulation                           |
| Delay                          | Stereo/ping-pong, EchoKing tape echo, diffuse delay, multitap, reverse slices and granular textures                                |
| Reverb                         | Room, hall, plate, spring, chamber, cathedral, nonlinear/gated, huge ambient spaces and Shimmer Hall                               |
| Pitch and synthesis            | Studio Pitch, detune/doubling, octave/sub-octave, glitch shifting and a sixteen-band vocoder                                       |
| Studio and stereo              | Console/channel/tape colour, excitation, slew/transient control, width and mid/side filtering                                      |
| Lo-fi and experimental         | Bit/sample-rate reduction, tape wear/flutter, grain clouds, distorted ambience and unconventional filters                          |
| Looping                        | Temporary 60-second stereo phrase recording, playback and overdub                                                                  |

These cover the major requested families, not every specialised effect ever
invented. This release does not include intelligent key-aware harmonisation,
external-microphone vocoding, external sidechain routing, convolution reverb
libraries, or persistent loop recording. The existing tuner remains separate.

## Finding and using effects

Collection and Replace device have category filters. Search also matches the
algorithm description and your own tags. Select an effect to see its short
description and upstream source link. Airwindows controls retain the upstream
normalised percentage mapping; a percentage labelled “Frequency” is not Hz.
Starting settings are curated for insertion into a guitar chain; several studio
processors intentionally start neutral. Adjust them to hear their contribution.

Ten Band EQ starts flat and offers ±12 dB per octave band plus output trim.
Drive belongs before an amp/cab for conventional guitar distortion. Delay and
reverb usually belong after distortion; using a parallel path allows independent
wet mixing. Feedback and extreme resonant settings can create intentionally loud
or abrasive sounds. There is no hidden loudness normalisation between devices.

**Studio Pitch adds about 140 ms of processing delay.** Its latency is reported
to the graph, which also delays bypass and parallel joins for alignment. It is
for recording or wet-only arrangements, not a responsive dry live path. Musical
delay and reverb pre-delay are separate from this processing latency. NAM input
calibration and amp/cab processing have not been changed by this collection.

The looper records only while Record is selected, up to 60 seconds, then plays.
Play ends recording; Overdub blends incoming audio into the loop. Clear discards
it. Loop memory disappears when its processor is replaced or the app closes.
Patches/scenes save the control commands, not loop audio. It is a practice tool,
not a complete live loop-station implementation.

**Bird Treble Boost** was formerly labelled Scream Drive. The stable saved key
`fx-GXScream` and DSP are unchanged. It models Guitarix Screaming Bird, not a
Tube Screamer. Imported TS9 captures remain available independently.

## Research and selection

Research checked primary repositories, source, licences, manuals, activity and
community adoption on 28 September 2026. Stars are an adoption signal, not a
review score or audio-quality measurement. There is no defensible universal
“best” effect determined by downloads. No third-party review score is invented.

| Project                                                                                                                                                                                     | Observed adoption                | Decision                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Airwindows](https://github.com/airwindows/airwindows) / [airwin2rack](https://github.com/baconpaul/airwin2rack)                                                                            | 1,236 / 714 stars                | MIT, mature and portable. Selected 156 additional algorithms at the already pinned revision; retained original manuals and notices.                                            |
| [KlonCentaur](https://github.com/jatinchowdhury18/KlonCentaur)                                                                                                                              | Original circuit research source | BSD-3-Clause. Adapted the original circuit using MIT chowdsp_wdf; numerical differences documented in PORTING.md.                                                              |
| [BYOD](https://github.com/Chowdhury-DSP/BYOD)                                                                                                                                               | 574 stars                        | Strong GPL-3.0 drive/modular collection. Further processors deferred because its JUCE/host integration requires a separate port and validation.                                |
| [GxPlugins](https://github.com/brummer10/GxPlugins.lv2)                                                                                                                                     | 237 stars                        | Existing Guitarix circuit ports retained. Useful source for further specific drives; not every skin is a circuit clone.                                                        |
| [FunBox](https://github.com/GuitarML/FunBox)                                                                                                                                                | 278 stars                        | Venus/Saturn/Pluto/Uranus are interesting spectral/looper/granular references. Hardware assumptions and component licences need individual review before porting. Not bundled. |
| [LSP](https://github.com/lsp-plugins/lsp-plugins)                                                                                                                                           | 892 stars                        | LGPL studio suite is a strong future source for advanced dynamics/EQ, but host and sidechain integration is substantial. Not bundled.                                          |
| [Signalsmith Stretch](https://github.com/Signalsmith-Audio/signalsmith-stretch)                                                                                                             | 559 stars                        | MIT; already used for shimmer. Added standalone pitch adapter with honest latency reporting.                                                                                   |
| [Dragonfly](https://github.com/michaelwillis/dragonfly-reverb), [Surge](https://github.com/surge-synthesizer/sst-effects), [Hothouse](https://github.com/clevelandmusicco/HothouseExamples) | Existing validated imports       | Retained hall/room/plate, modulation, EchoKing, Photon Vibe and TriPhase.                                                                                                      |

The collection provides tape, diffuse and ambient sounds in the broad area of
Strymon-style pedals. **It does not contain Strymon algorithms or promise exact
TimeLine/BigSky emulation.** Circuit and source credits describe what is actually
running. An embedded Centaur fork with unexplained extra gain corrections was
rejected in favour of the original circuit source.

## Reproducibility and verification

`scripts/effect-expansion.json` lists the 156 selected upstream algorithms.
`scripts/import-airwindows.mjs` imports only those sources/manuals from the pinned
archive, generates the registry adapter and preserves existing curated descriptors.
Run it explicitly after downloading that revision to the documented research
path in the script. Normal builds require no network or source re-import.

Each effect retains its own `effects/fx-*.json` descriptor. Native parameter
order/ranges remain authoritative; catalogue generation rejects missing or
duplicate descriptors. New focused processors live in `native/effects_*.cpp`.
Dependencies, licences and revisions are recorded in `native/vendor`.

Run `FreeRig.exe --self-test` after the desktop build. The complete suite includes
stereo, bounded starting-preset output, tails, invalid values, patch transitions,
NAM headroom and known-IR convolution. `scripts/audit-effects.py` additionally
checks all 200 processors at 44.1/48/96 kHz with 32/64/128-frame blocks, individual
parameter endpoints, flat/±6 dB EQ and stereo loop record/play/clear. It needs
NumPy as an offline developer dependency, not an application dependency.

Offline checks do not replace listening through ASIO, establish measured hardware
equivalence, or guarantee that every possible long chain fits a 32-sample deadline.
Watch FreeRig's audio load indicator when building a large rig.
