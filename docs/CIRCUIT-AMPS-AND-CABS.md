# Circuit amps and recorded cabinets — Alpha 26

## Included models

All 13 preamp circuits in the pinned [Tamgamp source](https://github.com/sadko4u/tamgamp.lv2) are registered separately:

| Family              | Channels          |
| ------------------- | ----------------- |
| Fender Princeton    | Preamp            |
| Fender Twin         | Normal, Vibrato   |
| Marshall JCM800     | High, Low         |
| Mesa DC-3           | Rhythm, Lead      |
| Mesa Dual Rectifier | Orange, Red       |
| Vox AC30            | Normal, Brilliant |
| Peavey 5150         | Crunch, Lead      |

These are nonlinear DK circuit **preamps**, not NAM captures or complete hardware-equivalent amplifiers. Original upstream circuit arithmetic, tables and gain normalisation are retained. The adapter runs at the source's 96 kHz operating rate with the existing Guitarix resampler and reported conversion latency. Each channel has independent state. It exposes only controls actually present in that circuit: Princeton has no Middle; AC30 Normal has Gain plus input/output trims. No invented presence, power-amp, reverb or Mesa graphic EQ is implied. Names describe the source's circuit targets, not manufacturer endorsement. SwankyAmp and other research candidates are not included.

## Cabinets and microphones

[The Jester Dyne packs](https://darwinscat.com/sound-utils/cabinet-ir-utility) provide 21 CC0 recordings. Both original PDF handbooks and WAV files are retained under `native/vendor/jester-cabs`.

| Configuration                                              | Recorded setups |
| ---------------------------------------------------------- | --------------- |
| Modified oversized BG412S / Vintage 30                     | 4               |
| Modified oversized BG412S / Eminence DV-77                 | 4               |
| Modified oversized BG412S / Rockdriver Junior              | 2               |
| Modified oversized BG412S / mixed speakers and microphones | 5               |
| Marshall 1960AX / G12M-25 Greenback                        | 6               |

This is **five configurations across two enclosure families**, not ten unrelated measured cabinets. SM57, e606 and PDMIC75 recordings are labelled as documented, including upper/lower speaker positions where known. Mixed recordings retain their documented combined setup; they cannot be unmixed into independent microphones. No continuous distance/angle/centre-edge simulation is claimed.

Choose Microphone A and B, blend B from 0–100%, optionally invert B polarity and set output. All five numeric parameters are scene-owned and use stable descriptor ordering. A single microphone is the default. Output starts at −12 dB for headroom; this is an explicit trim, not IR normalisation. Phase cancellation between recordings can lower volume.

The reproducible embed script removes only leading samples below −80 dB relative to peak, retains up to 200 ms and applies a 10 ms cosine fade. It does not normalise gain. Original assets are untouched. Non-48 kHz IR conversion uses a windowed-sinc filter during preparation.

## Implementation and performance

`native/effects_tamgamp.cpp` owns the amp adapter. `native/effects_cabinets.cpp` owns cabinet selection/smoothing; `native/cabinet_convolution.h` owns direct-head/partitioned-tail convolution. `ui/src/cabinets` owns the React editor. Each device has its own descriptor in `effects/`.

The cabinet has a 256-sample direct head and FFT tail, with no added buffering delay. All microphone histories remain warm so a selection change uses a 5 ms crossfade without loading or resetting. FFT boundaries are staggered across microphones/channels to reduce work spikes at 32 frames. This costs more DSP than a single IR. No allocation, file access or locks occur in these processing callbacks.

A warmed offline JCM800 High → six-mic Greenback chain at 32 frames measured median / 99th percentile / maximum 93.5 / 123.8 / 376.8 microseconds at 48 kHz (666.7 microsecond deadline), and 114.3 / 143.9 / 281.8 at 96 kHz (333.3 deadline) in one 1,999-call run. This includes Python/DLL call overhead; it is not a live ASIO scheduling guarantee. Existing NAM arithmetic and buffer preferences are unchanged.

## Reproduce validation

Run `python scripts/build-cabinet-data.py --check` to verify embedded recordings, or omit `--check` after deliberately changing the source bank. Build effects with `native/build-effects.ps1`, then run `python scripts/audit-amp-cabs.py` (NumPy required by the audit only). It checks 44.1/48/96 kHz, 1/17/32/64/127/4096-frame block invariance, parameter changes, cabinet channel isolation/proportionality and all 21 independent WAV impulse comparisons. Rebuild reference cost metadata with `python scripts/benchmark-effects.py`, then `npm run build`.

Upstream Tamgamp support is LGPL-3.0-or-later; its Guitarix circuit resources carry GPL notices. Preserve both COPYING files and accompanying source. Jester recordings are CC0 per their handbooks. The existing Signalsmith FFT is MIT. Exact revisions/hashes are in `native/vendor/SOURCES.json`; no new installed runtime is needed.
