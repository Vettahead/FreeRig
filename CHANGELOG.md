# Changelog

## 2026-09-26
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
