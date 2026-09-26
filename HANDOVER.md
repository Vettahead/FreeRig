# Handover — 26 September 2026

Interface build 04 is in prototype/. Launch with node prototype/server.cjs at http://127.0.0.1:4317. The current live preview runs from the identical staging copy under Codex visualizations. No actual NAM, ASIO, IR or effects engine exists.

User wants freely routed gear, controls on each illustrated device, and scenes within a patch. New patch-model.js adds v3 explicit connections, DAG validation, scene names/copy and migration. patch-ui.js/css replace visible fixed A/B bands with a draggable board and output/input jacks. Use Cables for keyboard cable editing; Tidy board and zoom aid navigation. The pre-amp delay sample branches after drive, bypasses amp through wet delay, rejoins at cab. Existing routing-ui.js/rig-model.js remain for legacy state validation and retained mixer controls.

Four scenes recall all knob/bypass values independently; names editable, settings copyable. Wiring/positions shared across scenes. Save patch stores the complete patch under guitar-suite-rig-v3; old keys remain. Migration retains old junctions and legacy mixer snapshots rather than discarding them. The user's current Sunday / Slow Bloom rig with ten devices was saved before refreshing; test actions use localhost, separate from their 127.0.0.1 storage. HardwareControls still supplies actual on-device knobs and footswitches.

Latest request also replaced broad Pedals filter with Drive, Delay, Modulation, Reverb, Dynamics and Utility alongside All/Amps/Cabs. Category mapping is independent of artwork device type.

Both model test suites pass. Browser verified every effect filter, branching connections, cycle prevention, disconnect, device drag with retained cables, scene naming/copy, parameter/bypass isolation and save/reload. Native audio and physical interfaces remain untested. Future DSP must define gain staging, stereo port rules, wet-branch bypass semantics, latency compensation and smooth scene switching. No import, multi-patch library or MIDI yet.

Next: user feedback, then native Windows audio framework/toolchain choice and real ASIO/NAM/IR prototype. All friends use Windows with varying interfaces. Keep advanced routing/performance and audio milestones open until the actual engine is implemented. Mission Control project bb78c32c-d021-44ed-b02c-0cad6ae65576. No Git remote is configured.
