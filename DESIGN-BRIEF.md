# Guitar Suite: interface and feature direction

Updated 26 September 2026. User direction: an interface and feature set like LAVA Studio, Darkglass Anagram and Quad Cortex. Interpreting "angram" as Darkglass Anagram. This is a product target, not a claim of existing functionality or exact feature parity.

## Reference roles
- LAVA Studio: inspiration for an inviting, large-screen playing and recording workspace, with accessible amp/effect editing and practice tools.
- Darkglass Anagram: inspiration for clear block-based chains, parallel processing and readily accessible parameter controls.
- Quad Cortex: inspiration for a routing grid, preset/scene/stomp workflows and a dedicated performance view.
- Use an original visual identity and our own assets. NAM and cabinet IRs provide our model ecosystem; these references do not imply access to proprietary captures, effects, preset formats or cloud libraries.

## Main workspace
A dark, spacious desktop interface with restrained colour coding by effect family, readable labels and large controls suitable for mouse and touch. Keyboard navigation and numeric parameter entry accompany drag interactions. Scale the layout for ordinary laptop screens.

Top bar: rig name, save/undo, scene selector, input/output meters, tuner and tempo.
Left library: local rigs, amps, cabinets, effects, favourites and TONE3000 search.
Centre: signal-chain grid with visible connections. Drag blocks to move them; click to edit; clearly show bypass, mono/stereo state, splits and merges.
Lower editor: selected amp or pedal with recognisable artwork, a small set of prominent knobs and an expandable detailed editor. Show units and values. No controls that imply hardware behaviour the model cannot reproduce.
Bottom performance strip: named scene buttons such as Clean, Crunch, Lead and Ambient, assignable stomp buttons and tap tempo. These example scenes are not factory sounds until authored and tested.
Practice workspace: looper, metronome/drum grooves, backing-track playback and recording, accessible without losing the current rig.

## Product feature targets
- NAM A2 amp and drive captures; cabinet IR loading, blend and bypass.
- Dedicated gate, compressor, EQ, boost/drive, chorus, phaser, flanger, tremolo, wah, delay and reverb. Pitch/octave effects follow once quality and latency are acceptable.
- Serial and parallel routing, dual amp/cab paths, split/merge blocks, path level and pan controls, stereo processing and output mapping supported by the connected audio interface.
- Presets plus scenes: recall bypass states and selected parameter values within a rig. Stomp mode controls individual blocks; performance mode shows large named targets.
- MIDI learn, footswitch and expression-pedal mapping, keyboard shortcuts and tempo synchronisation.
- TONE3000 sign-in, search/filter, favourites, download status and model loading; local imports and offline rig use.
- Tuner, metronome, drum grooves, backing-track playback, looper with overdub/undo and audio export, and dry/processed recording. Use original or redistributable practice content.
- Rig sharing with asset references and missing-file resolution; do not silently bundle third-party captures.
- Input calibration, clipping indication, device/buffer settings, CPU indication, crash recovery and clear errors.

## Delivery phases and acceptance
1. Playable foundation: native audio engine, one NAM amp and IR, basic levels/gate; verify real interface latency, model compatibility and stable continuous playback.
2. Rig workspace: polished chain editor, core effects, parameter editor, preset save/restore, tuner and undo. All displayed controls must affect real processing.
3. Advanced performance: parallel paths, dual rigs, scenes, stomp/performance view and MIDI/expression mapping. Measure CPU headroom; test switching artefacts and effect tails before promising seamless changes.
4. Connected library: tone picker as the first integration, then native TONE3000 browsing, favourites and local cache. Test expired login, failed downloads and missing assets.
5. Practice studio: looper, metronome, grooves, backing tracks and dry/processed recording. Start with a simple recorder; a full multitrack DAW and AI stem separation remain separate future investigations.
6. Friends' release: validate installer, sample-rate/device changes, offline use, saved rigs and supported hardware; include required notices and a short setup guide.

The architecture should allow scenes and parallel routing from the outset, even while the first prototype exposes only a serial chain. Hardware-specific I/O depends on each person's interface. Exact block limits, effect catalogue size and latency targets must be measured rather than borrowed from hardware marketing claims.

## Next design deliverable
An interactive desktop interface prototype showing a populated rig, effect editing, library selection, scene switching and practice view. Clearly distinguish simulated UI interactions from real audio processing until connected to the native engine.

## Official references consulted
- LAVA Studio: https://www.lavamusic.com/br/lava-studio
- LAVA Studio official store: https://www.lava-music.de/en/lava-studio/LVSTUDIOD2C
- Darkglass Anagram: https://www.darkglass.com/products/anagram/
- Quad Cortex manual: https://neuraldsp.com/manual/quad-cortex
