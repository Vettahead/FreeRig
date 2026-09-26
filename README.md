# Guitar Suite

A free desktop guitar suite for Chris and friends, built around Neural Amp Modeler A2 with optional TONE3000 integration.

## Status
Windows desktop alpha 03 and interface build 05 are implemented. Run releases/GuitarSuite-alpha-03.1/GuitarSuite.exe. The program hosts the existing UI locally, uses NAudio ASIO, includes two Amplitron-derived built-in amp voices and a filtered cabinet, and loads NAM models/cabinet WAV IRs through the compiled official NAM Core. No preview server is needed.

The board has four slots before the amp and four after the cab, stacked amp/cab branches, plus buttons on the line and undoable off-board drag deletion. Four named scenes remain independent for parameters and bypass. Guitar Suite patch JSON import is implemented; model files are imported onto the selected amp/cab.

Offline audio tests pass for the complete effects chain, amp voices, WaveNet/A2/LSTM models and WAV IR convolution. Chris has confirmed audible Mackie playback, but reported low volume. Alpha 02 adds a remembered master output, input/output meters, saved ASIO choices, automatic restart after edits, and device replacement by library drop or editor picker. Live verification of these fixes and latency/dropout checks remain pending. This alpha is mono-to-stereo, briefly restarts audio for graph changes, and has no tuner, MIDI or real recording yet. See [native/README.md](native/README.md) for setup, exact limits, build instructions and licences. Earlier interface sections below are historical and superseded where noted.

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
