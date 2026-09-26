# Guitar Suite

A free desktop guitar suite for Chris and friends, built around Neural Amp Modeler A2 with optional TONE3000 integration.

## Status
First interactive interface prototype completed on 26 September 2026. All users are confirmed on Windows; support will target manufacturer ASIO drivers with per-computer device/channel settings. Interface models are not yet confirmed. No real-time audio engine is connected yet.

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
Inspect the development toolchain, choose the native audio framework and build the smallest playable NAM plus cabinet prototype. Confirm operating systems and interfaces before installer and device testing. Preserve licence notices and check redistribution rights for any bundled captures or IRs.



## Run the interface prototype
With Node.js installed, run `node prototype/server.cjs` from this folder, then open http://127.0.0.1:4317 in a browser. You can also open prototype/index.html directly; local storage behaviour can differ for file URLs. No packages or build step are required. Optional Google Fonts fall back to system fonts offline.

Working now: library search/filter, device insertion/removal, drag reordering and arrow controls, scene-specific bypass and parameter values, undo, local save/restore of one rig, JSON export, performance view, and silent practice transport/pulse previews. Keys 1-4 select scenes; Ctrl+S saves. Model names and artwork are illustrative placeholders.

Not implemented: audio processing, ASIO device enumeration, NAM/IR file loading, TONE3000 OAuth/downloads, actual looping/recording, parallel routing, MIDI and installer. The prototype states these limits in the interface. Export contains settings only; preset import and multiple saved rigs are future work.

### Validation
JavaScript syntax check passed. Browser verification covered library search, adding a chorus, reordering via arrow controls, parameter editing, bypass, save/reload persistence, scene isolation, removal, and practice transport controls. Desktop layout was inspected at 1440px; the 600px panel has no page-level horizontal overflow. Native audio and physical interfaces have not been tested. Drag reordering and file export still need a dedicated end-to-end check.

### Next implementation
Review this interface direction, then choose the native Windows audio framework and connect an ASIO/NAM/IR processing prototype. Keep the audio thread independent of UI, file loading and network work.
