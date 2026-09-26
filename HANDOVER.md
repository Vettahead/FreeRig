# Handover — 26 September 2026

Interface build 02 is in prototype/. Launch with node prototype/server.cjs at http://127.0.0.1:4317. The current live preview runs from an identical staged copy under the Codex visualizations folder. It is a UI/routing design prototype; no NAM, ASIO, IR convolution or real audio processing exists yet.

User feedback: routing must support advanced signal paths, and each pedal/amp/cab must have a graphic representation like LAVA Studio. All devices must be draggable. Implemented original SVG gear art, shared pre/post chains around parallel A/B paths, serial conversion, scene-specific full-range/blend/crossover settings and level/pan/mute/polarity mixers. Mouse dragging works from library to lanes, between lanes, and before/after devices; undo and keyboard alternatives remain. The topology is one acyclic split/merge section, not an arbitrary nested graph.

Separate modules: rig-model.js (state, migration, graph operations), gear-art.js (original vector illustrations), routing-ui.js (graph and mixer views), gear-drag.js (pointer drag controller), app.js (interaction orchestration). V1 saves migrate without changing order or scenes; V2 uses a separate storage key. The user's original rig was saved before refresh and retained. Browser tests used localhost (separate storage origin) so the sample rig did not overwrite the user's 127.0.0.1 rig.

Validation: node prototype/rig-model.test.cjs passes connectivity/cycle, movement, serial conversion, migration and state validation checks. Browser-tested mouse drag insertion, cross-path movement, reordering, crossover/mixer persistence, serial conversion/undo and scene recall; narrow layout is contained. Touch/pen and physical audio devices are untested. Source, README and changelog are updated.

All users are on Windows, using differing interfaces; manufacturer ASIO drivers remain the target. Next: user visual feedback, then native audio framework selection and the actual NAM/ASIO/IR engine. Do not mark the advanced performance milestone complete until real routing DSP and MIDI have been implemented and validated.

Mission Control project: bb78c32c-d021-44ed-b02c-0cad6ae65576.

Build 03 follow-up: User requested actual controls on the device artwork, with no separate bank of knobs. hardware-controls.js and hardware-controls.css now render interactive pedal, amp and cabinet faces. app.js delegates selected-device rendering and installs the rotary pointer handlers. Range controls retain keyboard semantics and numeric entry; consecutive adjustments no longer rerender the focused input. Browser-verified mouse knob drag, bypass switch, persistence and keyboard focus. No DSP was added. Live preview uses the staged copy with identical source.
