# Guitar Suite

A free desktop guitar suite for Chris and friends, built around Neural Amp Modeler A2 with optional TONE3000 integration.

## Status
Interactive interface build 02 completed on 26 September 2026, with illustrated gear and an editable split/merge routing design. All users are confirmed on Windows; support will target manufacturer ASIO drivers with per-computer device/channel settings. Interface models are not yet confirmed. No real-time audio engine is connected yet.

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
Inspect the development toolchain, choose the native audio framework and build the smallest playable NAM plus cabinet prototype. Windows is confirmed; confirm exact interfaces before installer and device testing. Preserve licence notices and check redistribution rights for any bundled captures or IRs.



## Run the interface prototype
With Node.js installed, run `node prototype/server.cjs` from this folder, then open http://127.0.0.1:4317 in a browser. You can also open prototype/index.html directly; local storage behaviour can differ for file URLs. No packages or build step are required. Optional Google Fonts fall back to system fonts offline.

Working now: library search/filter, device insertion/removal, drag reordering and arrow controls, scene-specific bypass and parameter values, undo, local save/restore of one rig, JSON export, performance view, and silent practice transport/pulse previews. Keys 1-4 select scenes; Ctrl+S saves. Model names and artwork are illustrative placeholders.

Not implemented: audio processing, ASIO device enumeration, NAM/IR file loading, TONE3000 OAuth/downloads, actual looping/recording, DSP execution of the routing graph, MIDI and installer. The prototype states these limits in the interface. Export contains settings only; preset import and multiple saved rigs are future work.

### Validation
JavaScript syntax check passed. Browser verification covered library search, adding a chorus, reordering via arrow controls, parameter editing, bypass, save/reload persistence, scene isolation, removal, and practice transport controls. Desktop layout was inspected at 1440px; the 600px panel has no page-level horizontal overflow. Native audio and physical interfaces have not been tested. Mouse dragging from library to chain, between paths and within a path has now been verified. File export still needs a dedicated end-to-end check.

### Next implementation
Review this interface direction, then choose the native Windows audio framework and connect an ASIO/NAM/IR processing prototype. Keep the audio thread independent of UI, file loading and network work.

## Illustrated routing editor (build 02)
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
