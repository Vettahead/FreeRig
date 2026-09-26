# Guitar Suite

## Alpha 06 — routing, stock drives and ambient sounds (26 September 2026)

Run **releases/GuitarSuite-alpha-06/GuitarSuite.exe** from the complete portable folder. Audio starts only when you press Start in Audio setup. No browser server is required. Alpha 05 remains alongside it.

- Drop any library device onto an existing device to replace it. Dragging an existing device onto another moves its complete sound, capture, appearance and four scene settings into the target's position, removing the old source. The target's wiring remains. Undo restores the previous rig.
- Moving to an empty slot reconnects at the new position by default; **Keep cables when moving** preserves custom routing instead. New insertions join an actual audio route, including on branched patches. Additional cabs retain the parallel-cab behaviour. Parallel signals sum; manage their levels.
- **Input trim** and **Master output** live on the routing workspace, with meters and clipping indication. Both are remembered. Input trim affects drive into the rig; master affects listening volume. Gains ramp over 10 ms. Tuner still listens before input trim.
- Clicking a device opens its controls in a drawer. Close or Escape dismisses it. The board no longer auto-shrinks below 85%; scroll to reach the rest of a long rig. Library and workspace scroll independently.
- **20 hardware looks each** for amps, cabinets and pedals. Cabinet illustrations include 1×12, 2×12 and 4×12 forms; knobs remain on the illustrated hardware. Looks are cosmetic and do not load a different model or IR. Downloaded packs still offer their Saved model selector.
- **Six stock Guitarix drives/fuzzes**: Orange Distortion, Distortion Plus, Round Fuzz, Sustain Fuzz, Scream Drive and Soft Clip. These run at 96 kHz internally with Zita resampling where required. Scream Drive is the upstream Screaming Bird circuit, not a Tube Screamer.
- **Shimmer Hall**, **Warp Echo** (including reverse wash) and **Modulated Space**, alongside alpha 05's 22 stereo effects and tuner. There are now 31 added native effects and 65 presets, plus the original devices. These cover ambient/shimmer/modulated/tape/multitap sounds; they are not Strymon algorithm replicas.
- Fixed local-file import explicitly stopping audio. Model changes now use the existing resume-on-rig-update path. Fully bypassed captures stop processing after the fade settles. Imported amp captures no longer receive built-in amp voicing EQ; first imports start with neutral external EQ. Existing saved EQ settings remain as the user set them.

Validation: eight JavaScript suites, native tests for all 31 effects and 65 presets at 44.1/48/96 kHz with regular and irregular buffers up to 4096 frames, tuner/IR/latency/tempo/library/auth regressions, and three actual locally downloaded A2 pedal variants through a pedal → amp → cab rig. Bypass matches removing the pedal while retaining the downstream amp/cab; neutral captured amps match direct official NAM Core output. The original distorted/crashing state was not reproduced, so this is a verified set of fixes and regression tests, not a claim that every hardware failure has been reproduced. No live ASIO audio was started during the unattended work.

See **native/EFFECTS-RESEARCH.md** for source comparisons, dated GitHub adoption figures, selection rationale and limitations. Hardware listening/long-run dropout checks remain for Chris. Capture accuracy depends on the capture itself and correct input calibration; amp+cab captures should not normally feed a second cabinet. The built-in cabinet remains a filter approximation until a measured IR is loaded. Routing edits still cause a short restart; spillover, complete smoothing, MIDI, recording and a real looper remain unfinished.

Source, revision pins and licences accompany this GPL-3.0-or-later release. Private pedal test captures and account data are excluded.

A free desktop guitar suite for Chris and friends, built around Neural Amp Modeler A2 with optional TONE3000 integration.

## Previous release: Alpha 05 — stereo effects and tuner (26 September 2026)

Run releases/GuitarSuite-alpha-05/GuitarSuite.exe. This portable Windows app needs no browser server. The original built-in sounds and saved TONE3000 library remain available.

- 22 new processors: six delays (digital, tape, double, pitch, four-tap and diffuse), eight reverbs (spring, hall, room, plate and ambient variants), and eight modulation effects (chorus, ensemble, flanger, phaser, rotary, vibrato, tremolo and auto-pan).
- Engines: selected Airwindows processors, Dragonfly hall/room/plate, Surge effects and its ChowDSP spring, plus a delay using ChowMatrix's diffusion algorithm. This is not the complete ChowMatrix plug-in or its node editor.
- Every new pedal has on-device controls and two starting presets. Values and bypass are saved independently in each of four scenes. Stereo Digital and Diffuse Echo offer beat divisions and tap tempo; delay time is limited to 2 seconds, including synced settings. Other Airwindows timing controls use the upstream normalised 0–100 scale.
- Native stereo signal paths and stereo cabinet IRs. Parallel joins and bypass align the 16-sample adapter delay of Surge/Spring processors. This does not compensate arbitrary latency inherent in imported models or IR contents. Model processing runs one instance per channel, increasing CPU use compared with alpha 04.
- Chromatic tuner using Cycfi Q BACF on the clean input, with note/octave, cents, A4 calibration from 430–450 Hz and optional output mute. Start ASIO in Audio setup, then press Tuner. Closing it restores the chosen master output. Supports single notes, not chords.

Validation: seven JavaScript suites; native tests for 22 effects at 44.1/48/96 kHz, stereo output, latency alignment, beat timing, stereo IRs, A2/LSTM playback and existing TONE3000/library regressions. The tuner passed 27 harmonic test tones within three cents and cleared after silence. Five stereo effects processed 2667 ms of audio in about 80 ms offline on this PC; this is not a real-time ASIO guarantee. Live guitar pitch tracking, listening quality and dropout tests still need Chris's interface.

Graph/asset edits still briefly restart audio on the saved ASIO configuration. Complete smoothing, spillover, MIDI, looper and recording are not finished. Old A/B mixer-junction patches are still refused by the native engine; use a current starter patch. Output has the existing gain ramp and ceiling.

The source and licences for this GPL-3.0-or-later build accompany the portable release. Third-party copyrights and their original licences are retained. No downloaded user captures or account credentials are included.

## Earlier status (superseded by alpha 05)
Windows desktop alpha 04 and interface build 05 are implemented. Run releases/GuitarSuite-alpha-04/GuitarSuite.exe. The program hosts the existing UI locally, uses NAudio ASIO, includes two Amplitron-derived built-in amp voices and a filtered cabinet, and loads NAM models/cabinet WAV IRs through the compiled official NAM Core. No preview server is needed.

The board has four slots before the amp and four after the cab, stacked amp/cab branches, plus buttons on the line and undoable off-board drag deletion. Four named scenes remain independent for parameters and bypass. Guitar Suite patch JSON import is implemented; model files are imported onto the selected amp/cab.

Offline audio tests pass for the complete effects chain, amp voices, WaveNet/A2/LSTM models and WAV IR convolution. Chris has confirmed audible Mackie playback, but reported low volume. Alpha 02 adds a remembered master output, input/output meters, saved ASIO choices, automatic restart after edits, and device replacement by library drop or editor picker. Live verification of these fixes and latency/dropout checks remain pending. This alpha is mono-to-stereo, briefly restarts audio for graph changes, and has no tuner, MIDI or real recording yet. See [native/README.md](native/README.md) for setup, exact limits, build instructions and licences. Earlier interface sections below are historical and superseded where noted.

Alpha 04 adds saved TONE3000 amp, cabinet and pedal devices. Save pack downloads all models in the selected architecture into one library entry; select a saved model in the lower details panel. Classic/tweed/modern looks and colours are customisable. Earlier alpha 03 downloads migrate automatically. Chris confirmed sign-in and individual downloads work; the new whole-pack workflow has fixture/native test coverage and awaits a live account check.

## First release scope
- Real-time guitar input and output through an audio interface.
- NAM A2 amp and drive-pedal capture loading from local .nam files.
- Cabinet impulse-response loading, with bypass for captures that already include a cabinet.
- Gate, compressor, EQ, chorus, delay and reverb as dedicated effects.
- Visual pedalboard with ordering, bypass and parameter controls.
- Tuner and local presets; share rig settings with friends.
- Optional TONE3000 sign-in, tone selection and individual model downloads.
- Local playback independent of a network connection once required files are available.

## Milestones
1. Audio prototype: device selection, input/output levels, NAM model loading and cabinet processing. Validate on a real interface for latency, dropouts, clipping and CPU usage.
2. Pedalboard: modular effects, reorder/bypass, parameter smoothing and tuner.
3. Presets: save/reload a complete rig, handle missing files and share settings without silently redistributing captures.
4. TONE3000: official OAuth with PKCE and tone picker first; securely store tokens, download individual models, handle expiry and network errors. Keep network/file work off the real-time audio thread.
5. Friends' release: installer, dependency notices, setup guide and validation on their hardware.

## Engineering direction
Use NAM's native C++ processing library. Select the desktop/audio framework after checking build tools, platform needs and dependency licences. A normal NAM capture represents particular gear settings; extra gain/EQ controls must not be presented as exact replicas of the captured hardware's controls.

No app account or subscription is planned. Each person uses their own TONE3000 account for connected features. Verify current API registration requirements and terms during implementation. Individual model downloads are the intended route; whole-tone downloads require approved-partner access.

## Future platform candidates
Mac builds and a DAW plugin remain future platform candidates. MIDI control, looping, metronome, recording and an in-app tone browser are now planned product features, phased after the first playable prototype. See DESIGN-BRIEF.md for the expanded direction.

## References
- NAM Core: https://github.com/sdatkinson/NeuralAmpModelerCore
- TONE3000 API: https://www.tone3000.com/api
- API examples: https://github.com/tone-3000/api

## Interface and feature direction
The user selected LAVA Studio, Darkglass Anagram and Quad Cortex as product references. See [DESIGN-BRIEF.md](DESIGN-BRIEF.md) for the intended workspace, controls, expanded features and delivery phases.

## Next step
Validate the Windows alpha with a connected guitar/audio interface for latency, dropouts and sound quality, then improve smoothing/stereo processing. Windows is confirmed; confirm exact interfaces before installer and device testing. Preserve licence notices and check redistribution rights for any bundled captures or IRs.



## Run the interface prototype
With Node.js installed, run `node prototype/server.cjs` from this folder, then open http://127.0.0.1:4317 in a browser. You can also open prototype/index.html directly; local storage behaviour can differ for file URLs. No packages or build step are required. Optional Google Fonts fall back to system fonts offline.

Working now: library search/filter, device insertion/removal, free board dragging and cable editing, scene-specific bypass and parameter values, undo, local save/restore of one rig, JSON export, performance view, and silent practice transport/pulse previews. Keys 1-4 select scenes; Ctrl+S saves. Model names and artwork are illustrative placeholders.

Not implemented: audio processing, ASIO device enumeration, NAM/IR file loading, TONE3000 OAuth/downloads, actual looping/recording, DSP execution of the routing graph, MIDI and installer. The prototype states these limits in the interface. Export contains settings only; preset import and multiple saved rigs are future work.

### Validation
JavaScript syntax check passed. Browser verification covered library search, adding a chorus, reordering via arrow controls, parameter editing, bypass, save/reload persistence, scene isolation, removal, and practice transport controls. Desktop layout was inspected at 1440px; the 600px panel has no page-level horizontal overflow. Native audio and physical interfaces have not been tested. Mouse dragging from library to chain, between paths and within a path has now been verified. File export still needs a dedicated end-to-end check.

### Next implementation
Review this interface direction, then choose the native Windows audio framework and connect an ASIO/NAM/IR processing prototype. Keep the audio thread independent of UI, file loading and network work.

## Earlier routing editor (build 02, superseded by build 04)
- Original vector artwork for individual pedals, two amp heads and a speaker cabinet, shown in the library, chain, performance view and selected-device editor.
- Drag devices from the library into a path. Drag existing gear before/after another device or into an empty path. A floating preview and insertion marker show the destination. Escape cancels a drag. Arrow buttons and the selected-device path selector provide keyboard alternatives.
- Topology: input -> shared pre chain -> split -> parallel A/B paths -> merge -> shared post chain -> output. Serial mode keeps a single A chain. This is one split/merge section; arbitrary nested routing, feedback loops and hardware sends are not implemented.
- Parallel full-range, A/B blend and frequency crossover modes; per-path level, pan, mute and polarity controls. Mixer/split settings are scene-specific, while device placement is shared across scenes. These are saved routing intentions for the future audio engine, not working DSP.
- Empty chains pass through. Serial conversion moves B devices after A and keeps every scene value. Undo restores the original layout. The dual-amp example is available from the routing toolbar and does not replace the saved rig unless Save is pressed.
- Existing v1 saves migrate to a serial layout without losing order or scene values. V2 is saved under a new storage key; the old save is retained. Export includes the versioned rig and explicit graph edges.

Run `node prototype/rig-model.test.cjs` for graph connectivity, no-cycle, migration, move, serial-conversion and persistence validation checks. Browser checks passed for library drag, cross-path movement, in-path reordering, serial conversion/undo, crossover frequency and level/pan save/reload, and scene isolation. The 600px panel has no page-level horizontal overflow; the routing canvas itself scrolls. Touch/pen use is implemented via pointer events but has not been physically tested.

## Controls on the gear (build 03)
Click a rig device to open its hardware control surface. Pedals have interactive knobs, numeric readouts and a bypass footswitch directly on the enclosure; amp controls are built into the front panel, and cabinet shaping controls live on the cabinet. The previous separate control bank is removed.

Drag a knob vertically to adjust it, hold Shift for fine adjustment, or focus the knob and use the arrow keys. Click the on-device value to type an exact setting. Settings still belong to the selected scene and use the existing save/export model. Browser checks verified pointer dragging, consecutive keyboard adjustments with retained focus, the pedal footswitch, amp controls, and save/reload persistence. All controls remain interface state only until the audio engine is connected.

## Free patch routing and scenes (build 04)

The board now uses explicit cables rather than fixed A/B lanes. Click an output jack, then an input jack. One output can feed multiple devices; multiple cables can join at any input. Click Cables to add or disconnect connections using named devices. Cycles, duplicate cables and invalid endpoints are rejected. Disconnected devices have dashed borders; moving a device preserves its cables. Tidy board arranges the graph, and zoom offers fit/80%/100%. Drag new gear from the library, then wire it; numeric board positions provide a keyboard alternative.

The pre-amp delay example branches after the drive, routes through an amp and a wet delay in parallel, and joins both at the cabinet. Example loading is undoable. This is routing design data only, not an audio implementation; gain staging, stereo port rules, bypass behaviour on wet-only branches, latency compensation and click-free scene changes remain audio-engine work.

Four named scenes belong to each patch and recall independent parameter values and bypass states. Rename a scene or copy its settings to another slot. Cables and board positions stay shared; Save patch saves every scene. Version 3 uses a new storage key, keeping earlier saves intact. Old serial/parallel patches retain their exact connections and scene values, with saved splitter/trim/mixer junctions retaining earlier routing settings. JSON export includes versioned patch data and explicit edges.

Library filters are All, Amps, Cabs, Drive, Delay, Modulation, Reverb, Dynamics and Utility. Search also matches categories. Hardware artwork/control rendering still uses device type independently of library category.

Validation: both `node prototype/rig-model.test.cjs` and `node prototype/patch-model.test.cjs` pass. Browser checks covered every new effect filter, direct jack connections, cycle rejection, cable removal, device dragging with cables retained, scene parameter/bypass isolation, scene naming/copying and save/reload. The original 10-device user rig was saved before refresh and retained. No physical audio or touch/pen validation has been performed.

## Windows alpha / slotted board (build 05)
See native/README.md for the current executable and audio behaviour. Tests: node prototype/rig-model.test.cjs, node prototype/patch-model.test.cjs, node prototype/slot-board.test.cjs and GuitarSuite.exe --self-test with official NAM fixtures. Browser-verified plus-slot insertion, parallel cab addition and off-board drag deletion. Old visual rigs are preserved; legacy A/B junction processing is refused explicitly by the first audio engine. TONE3000 hosted Select integration is implemented in alpha 03; full user sign-in/download verification and installer remain outstanding.

## TONE3000 connection
Powered by [TONE3000](https://www.tone3000.com). In alpha 03, select an amp or cab and choose **Browse TONE3000**. Sign in in the official window, select a tone, then choose a model to download and load. Includes A2/A1/Custom selection, cabinet IRs, creator/licence metadata, encrypted Windows token storage and refresh. The app key/callback was accepted by the live authorisation endpoint; authenticated end-to-end verification awaits Chris. See native/README.md for setup and limits.
