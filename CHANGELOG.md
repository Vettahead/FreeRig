# Changelog

## 2026-09-26
- Desktop alpha 04: added persistent TONE3000 devices with whole selected-architecture packs, offline model variants, amp/cab/pedal support, capture-pedal DSP, custom enclosure looks/colours, previous-download recovery, progress/cancellation and cached retry. Verified library and native audio regressions plus fixture UI; real pack download/listening check remains pending.
- Defined Guitar Suite as a free desktop application for Chris and friends.
- Recorded NAM A2, pedalboard, cabinet, presets and TONE3000 scope.
- Planned a playable audio prototype before interface polish and distribution.
- Expanded product direction around LAVA Studio, Darkglass Anagram and Quad Cortex: routing grid, scenes, performance controls, parallel rigs and practice/recording tools; documented phased delivery in DESIGN-BRIEF.md.
- Built the first interactive rig interface in prototype/: editable chain, scene-specific controls, local persistence, JSON export, performance view and silent practice previews. Confirmed Windows/ASIO target. Audio and TONE3000 are explicitly unconnected.
- Added illustrated pedals, amp heads and cabinet; draggable library-to-rig placement, cross-path movement and reordering with insertion feedback. Added serial/parallel routing, shared pre/post chains, split modes and per-scene mixer controls. Preserved v1 saves and added graph/migration tests. Audio routing is still a design, not DSP.
- Replaced separate selected-device controls with interactive knobs and footswitches embedded in illustrated pedal enclosures, amplifier front panels and cabinet controls. Added vertical knob dragging, Shift fine adjustment and retained keyboard focus. Verified bypass and saved parameter recall.

- Build 04: replaced fixed A/B lanes with explicit patch cables, free board placement, fan-out/summing connections, cycle prevention and a pre-amp delay example. Added named/copyable scenes within patches, v3 migration preserving old connections/settings, and Drive/Delay/Modulation/Reverb/Dynamics/Utility library filters. Verified routing, dragging, scene recall and persistence; audio remains unconnected.

- Build 05: organised the cable graph into four pre-amp effect slots, stacked amp/cab section and four post-cab slots. Added plus-slot picker, snapped placement, parallel cab insertion and undoable off-board drag removal with neighbour reconnection. Preserved existing oversized rigs as overflow rows.
- Desktop alpha 01: built an x64 Windows executable using WinForms/WebView2 and NAudio ASIO. Added Amplitron-derived clean/crunch voices, basic effects and filtered cabinet; compiled official NAM Core with A2 support for local NAM/WAV imports; added Guitar Suite JSON preset import/export. Bundled licences and unmodified Eigen sources. Offline graph/effect/WaveNet/A2/LSTM/IR tests pass; physical ASIO and listening validation remain pending.

- Desktop alpha 02: added remembered, smoothed master output (−30 to +12 dB), input/output meters and ceiling indication after quiet Mackie playback was reported. Remember ASIO driver/channels/rate, automatically restart running audio after topology changes, and support compatible device replacement via library drop or editor picker while retaining routing/scene bypass and Undo. Offline engine, settings persistence and replacement tests passed; hardware retest pending.

- Desktop alpha 03: connected TONE3000 hosted Select OAuth flow using the supplied publishable key, PKCE/state validation and a separate bridge-free WebView. Added native encrypted token persistence/refresh, model picker, validated individual NAM/IR downloads, attribution/licence metadata, model variants and official branding. Live key/callback preflight reached sign-in; mocked token/refresh/redirect/download tests and core audio tests pass. Real account sign-in/download/playback remains to verify.
- Alpha 03.1: explicitly use TLS 1.2 for the .NET Framework API client; the compiled executable passed a live OAuth preflight. Packaged separately to preserve the open alpha 03 session.

## Alpha 05 — stereo effects and tuner (26 September 2026)

Run releases/GuitarSuite-alpha-05/GuitarSuite.exe. This portable Windows app needs no browser server. The original built-in sounds and saved TONE3000 library remain available.

- 22 new processors: six delays (digital, tape, double, pitch, four-tap and diffuse), eight reverbs (spring, hall, room, plate and ambient variants), and eight modulation effects (chorus, ensemble, flanger, phaser, rotary, vibrato, tremolo and auto-pan).
- Engines: selected Airwindows processors, Dragonfly hall/room/plate, Surge effects and its ChowDSP spring, plus a delay using ChowMatrix's diffusion algorithm. This is not the complete ChowMatrix plug-in or its node editor.
- Every new pedal has on-device controls and two starting presets. Values and bypass are saved independently in each of four scenes. Stereo Digital and Diffuse Echo offer beat divisions and tap tempo; delay time is limited to 2 seconds, including synced settings. Other Airwindows timing controls use the upstream normalised 0–100 scale.
- Native stereo signal paths and stereo cabinet IRs. Parallel joins and bypass align the 16-sample adapter delay of Surge/Spring processors. This does not compensate arbitrary latency inherent in imported models or IR contents. Model processing runs one instance per channel, increasing CPU use compared with alpha 04.
- Chromatic tuner using Cycfi Q BACF on the clean input, with note/octave, cents, A4 calibration from 430–450 Hz and optional output mute. Start ASIO in Audio setup, then press Tuner. Closing it restores the chosen master output. Supports single notes, not chords.

Validation: seven JavaScript suites; native tests for 22 effects at 44.1/48/96 kHz, stereo output, latency alignment, beat timing, stereo IRs, A2/LSTM playback and existing TONE3000/library regressions. The tuner passed 27 harmonic test tones within three cents and cleared after silence. Five stereo effects processed 2667 ms of audio in about 80 ms offline on this PC; this is not a real-time ASIO guarantee. Live guitar pitch tracking, listening quality and dropout tests still need Chris's interface.

Graph/asset edits still briefly restart audio on the saved ASIO configuration. Complete smoothing, spillover, MIDI, looper and recording are not finished. Old A/B mixer-junction patches are still refused by the native engine; use a current starter patch. Output has the existing gain ramp and ceiling.

The source and licences for this GPL-3.0-or-later build accompany the portable release. Third-party copyrights and their original licences are retained. No downloaded user captures or account credentials are included.
