# FreeRig

## Alpha 14 TONE3000 header action — 27 September 2026

Browse TONE3000 is now in the selected device header beside the capture selector and Replace device. The existing browse handler is retained; downloaded-tone attribution and variant details remain in Device options. Browser checks confirm the button is visible with options collapsed and opens the TONE3000 preview dialog. Restart Alpha 14 to load this interface update. Audio processing is unchanged.


## FreeRig Alpha 14 — 27 September 2026

The app is now FreeRig, using the supplied cream-and-orange SVG logo. Run **releases/FreeRig-alpha-14/FreeRig.exe**. Header, native window, status bar and user-facing import/export messages use the new name. Existing GuitarSuite storage folders, browser origin, patch formats and audio processing are preserved for compatibility.

## Alpha 13 header preset picker — 27 September 2026

The saved capture model picker now sits in the device header beside Replace device. Its original change handler and missing-file handling remain intact, and it is removed from the lower Device options section. The duplicated model filename is removed from the subtitle. Browser verification with an isolated two-model test pack confirms a single header picker and switching Clean to Crunch updates the selected asset. The saved-device regression suite passes. Restart Alpha 13 to load the updated interface.


## Alpha 13 drag/drop fix — 27 September 2026

Dropping moved, added or replacement devices keeps the routing board open, including saved TONE3000 devices. Dragging off the board also stays on the board. Ordinary clicks and picker selections still open controls. Ten existing JS suites pass; browser verification confirms moving and library insertion leave the editor closed, while a normal click opens it. Restart Alpha 13 to load the corrected UI.


## Alpha 13 — pedalboard and amp FX loop (27 September 2026)

Run **releases/GuitarSuite-alpha-13/GuitarSuite.exe**. The native window title and UI now both identify Alpha 13.

The normal routing workspace is a pedalboard: amp/cabinets on an upper shelf, and four initial pedal slots in each of Before amp, Amp FX loop and After cab. Numbered stages and left-to-right row arrows replace the screen-wrapping patch cables. Input/output trim remains above the workspace. Multiple cabinets share their input and their outputs are summed.

The processing order is Input → Before amp → Amp → FX loop → parallel cabinets → After cab → Output. Moving pedals to an empty slot reconnects them at that stage; dropping onto a device replaces it; dragging off the board removes it. Scene settings survive moves. The FX loop is after the whole amp model, not an internal preamp/power-amp split or a physical interface send/return. Existing saved delays are not moved automatically.

Advanced routing retains manual cables and Keep cables when moving. Custom patches open there automatically, preserving their connections. Switching a custom patch to pedalboard order requires an explicit action in a dialog; Undo restores its previous routing. The simple board always reconnects a move, even if Keep cables was enabled in Advanced mode. Existing patches and bank storage remain compatible.

Validation: ten JavaScript suites pass, including new tests for loop order, parallel-cab fanout, removal, saved loop slots, scene preservation and custom graph preservation. Browser testing moved Tape Echo into the loop, verified amp → delay → both cabinets → final effects in the cable list, checked the custom conversion dialog, save/reload and all three rows at 1920x1080 without page horizontal overflow. At 1280x720 the complete board is usable with main-pane vertical scrolling. Native offline regression passes after rebuilding the host to correct its title. Audio DSP source and native model/effect DLLs are unchanged. No live ASIO playback was started; hardware listening and existing Powercab/live-scene follow-ups remain outstanding.


## Alpha 12 — studio design pass (27 September 2026)

Run **releases/GuitarSuite-alpha-12/GuitarSuite.exe**. This is a UI-only release using the unchanged alpha 11 executable and audio libraries; the native window title may still say alpha 11. The in-app footer identifies design build 12.

- Cleaner LAVA Studio-inspired workspace, with original hardware finishes informed by Chris's amp/pedal references: inset grilles, brushed panels, cast enclosures, more substantial knobs and contrast-aware pedal lettering. Stock reference images are not distributed.
- Docked equipment editor with a device overview strip and a Routing button. The strip is a device selector, not a representation of cable topology; the full routing board remains the source of truth.
- Devices/Patches collection tabs; search saved patches across banks and recall directly. Existing bank storage, recovery, save and import/export remain in use.
- Large Perform scene pads for four or eight scenes, with bypassable devices below. Scene dispatch and audio behaviour are unchanged.
- Checked at 1920x1080 and 1280x720. Amp and cab controls fit at 1080p; short windows use compact chrome and vertical scrolling for options or tall gear. Existing twenty appearance choices and colour overrides remain available.

Validation: nine JavaScript suites pass. Browser checks cover numeric knob edits, dirty/save state, device selection, patch search/recall, contextual Drive replacement, eight-scene Perform selection and 1080p geometry. Native binaries are hash-identical to alpha 11; no live ASIO playback was started. Powercab USB latency and full live scene-transition qualification remain outstanding.


## Alpha 11 — calibration, banks and performance workspace (27 September 2026)

Run **releases/GuitarSuite-alpha-11/GuitarSuite.exe**. Previous releases remain available. Keep the established Mackie ASIO / 32-sample route for the initial comparison. No buffer size, capture quality or sample rate is changed automatically.

- Input calibration: raw pre-trim peak meter and clipping hold, optional verified hardware dBu reference saved per ASIO driver/input. NAM input metadata drives input compensation; NAM pedal output metadata brings its output back to the same reference. Missing metadata stays uncorrected. Disabled by default; creative input trim remains separate. Hardware gain must stay at the setting for which the reference is valid. Metadata is read from the already loaded native NAM object during graph preparation. Gain changes ramp over 10 ms. A reference alone cannot certify an entire chain of uncalibrated effects.
- Audio-load bar: peak processing deadline usage over each 100 ms UI interval, session peak, cumulative missed deadlines and separate-output drops. 100% means the callback processing deadline was exceeded, not 100% Windows CPU. Driver scheduling and complete round-trip latency are not measured by this bar.
- Patch banks: create/rename banks, Save/Save as new, previous/next recall, bank export/import, persistent selections. Export references models/IRs; it does not bundle them. Recalling a patch preserves an unsaved recovery copy and supports Undo. A backup of the previous bank store is retained locally. Limits: 64 banks, 128 patches per bank, browser storage quota and existing 4 MB import limit.
- Scenes: four by default, four extra on demand; independent bypass/parameters, names, copy and keys 1–8. Hiding extras preserves their data and will not change the current sound. Old four-scene patches remain valid. Scene commands dispatch immediately instead of waiting for the 90 ms parameter-edit debounce. The existing graph stays alive; no models reload or intentional output mute occurs for scene recall.
- Workspace: collapsible device library, compact header, distinct bank/patch and scene controls, folded two-row chain on narrower windows, Fit board uses available width and height. Additional amp/cab buttons retain multi-cab support. Routing is unchanged by the drawing layout. Verified at 1920×1080 and 1280×800 with eight scenes; the main chain has no horizontal overflow. The amp editor fits in the smaller viewport. Very long chains may still need scrolling or explicit zoom.

Validation: nine JS suites pass. Full native regression passes with seven private captures, 31 effects and 65 presets. A synthetic unity NAM tests real native metadata, amp input compensation, pedal output calibration and disabling calibration at 32 samples. Eight-scene tests at 32/64/128 samples match uninterrupted delay output exactly and retain tails; 1,200 bypass switches per size introduce no silent samples. Browser tests cover banks, save/recall/Undo, eight-scene persistence, calibration guidance and smaller-window controls. No live ASIO playback was started during this work.

Live qualification remains open: abrupt delay-time, algorithm-specific or EQ changes can still produce audible transitions. These tests do not establish that every effect/parameter combination is clickless or that full patch changes preserve tails. Full patch recall still rebuilds the graph and may reset tails. Test real setlists at 32 samples before relying on scenes live.

Powercab feedback: Chris reports the separate USB route works but feels unusably delayed even at the 5 ms request. This is recorded as an unresolved latency issue, not a successful live route. The request is not total latency. Mackie ASIO output with an analogue cable to Powercab avoids our second-device queue; actual hardware round-trip latency still needs measurement.

MIDI foot control is on the todo list. See [GUI research](docs/GUI-RESEARCH.md) and [next work](docs/TODO.md).

## Alpha 10 colour hotfix — 27 September 2026

Custom colours now tint the realistic amp/cab enclosures instead of being obscured by opaque texture images. Wood and folded-metal finishes also use the saved colour. Texture, grille, controls and audio settings are retained. Untouched devices keep their default finish. Close and reopen alpha 10 to load the updated UI.

Verified red/blue rendering on black tolex, tweed cabinet, wood amp and folded-metal pedal using the production skin renderer and CSS. Audio executable and DSP libraries are unchanged.

## Alpha 10 — separate USB output (27 September 2026)

Run **releases/GuitarSuite-alpha-10/GuitarSuite.exe**. Chris confirmed alpha 09 is working well with the Mackie at 32 samples; that remains the established single-interface baseline.

Audio setup now has an independent Output device selector. Keep Mackie ASIO for the guitar input and select **Speakers (2- Powercab 112 Plus)** for USB playback. Stop/Start applies device changes. Choices persist by Windows endpoint ID; missing saved outputs remain labelled unavailable, with no silent fallback. Refresh outputs detects newly connected devices. Same ASIO interface remains the default and retains the alpha 09 processing path.

Separate-device mode opens ASIO for input only and sends processed stereo audio, including master gain/tuner mute/output ceiling, through WASAPI to the selected endpoint. A bounded FIFO and WDL sinc rate correction accommodate the independent hardware clocks. Shared/exclusive modes and 5/10/20 ms output-buffer requests are available. This route adds buffering/resampling and is not bit-identical or as low-latency as the direct ASIO route; the models themselves stay full quality. Requested output time is not measured round-trip latency. For Powercab, try Exclusive output with 5 ms; if unavailable or unstable, use shared mode or more output headroom. The Mackie 32-sample input setting is unchanged.

Validation: eight JS suites passed including device persistence, missing-device handling, start payload and returning to ASIO. Full native regression passed with seven private captures. Nine offline 60-second clock-drift cases (44.1/48/96 kHz, -500/0/+500 ppm, 32-frame producer) had zero drops and preserved stereo; startup silence and overflow bounds passed. Connected Powercab initialised at 48 kHz stereo in shared float32 and exclusive PCM16, without playback. No live sound was sent; actual listening, unplug/reconnect during playback and end-to-end latency remain unverified.

See docs/USB-OUTPUT.md for setup, limitations and validation.

## Alpha 09 — low-buffer NAM processing (27 September 2026)

Run **releases/GuitarSuite-alpha-09/GuitarSuite.exe**. The previous builds remain available. Chris confirmed stock processing and IR cabinets sound okay, while NAM captures sound bit-crushed. The local Mackie log showed 48 kHz / 8 samples and over 300,000 cumulative callback overruns.

The engine had prepared every NAM instance for a maximum 4096-sample block, even for 8-sample ASIO callbacks. On the tested A2 captures, that oversized preparation made tiny-block processing far more expensive. Alpha 09 obtains the driver buffer size before building the graph and passes it through every NAM/IR instance and replacement. Warm-up uses bounded chunks. Unexpected live buffer changes are rejected with restart guidance instead of passing an oversized block into a model.

No extra audio buffering, resampling, capture slimming, precision reduction or DSP algorithm change was introduced. Native DSP DLLs are unchanged. All 42 before/after full-chain comparisons (seven private captures × six buffer sizes) produced zero difference on both channels. Replacement and scene bypass passed at every size; the complete native self-test also passed. Median full-chain time improved 8.4x at 8 samples, 3.8x at 32 and 2.5x at 64. These are offline throughput measurements, not a live scheduling guarantee or a measured round-trip latency. Live Mackie listening remains to be confirmed; 32/64 samples are useful initial low-latency checks, and no buffer setting is forced.

See docs/NAM-BUFFER-PERFORMANCE.md for methodology and results. Run GuitarSuite.exe --buffer-test followed by paths to local .nam files to reproduce; captures are not distributed in the source/release.

## Alpha 08 — realistic hardware and cleaner studio (27 September 2026)

Run **releases/GuitarSuite-alpha-08/GuitarSuite.exe**. Alpha 07 remains available for the live Mackie comparison. Audio engine behaviour is unchanged from alpha 07; its reported-noise fix still awaits hardware confirmation.

- Centred equipment view with a quieter charcoal workspace, clearer hierarchy, restrained brass accents and compact scenes. The selected equipment is the main control surface. Close, Escape and outside dismissal remain available.
- Real material textures, metal corner protectors, handles, layered knob caps and readable control labels. Combo controls sit above the grille; heads use wider lower control panels. Manufacturer-inspired families include blackface/silverface, tweed, British gold, diamond cloth, cream panels, industrial metal and wood. These are original UI renditions rather than exact product scans or changes to the audio model.
- Twenty appearance choices per amp, cabinet and pedal, retaining existing appearance IDs. Pedals now have category-appropriate appearance names and compact cast, treadle, folded metal and wide enclosure structures. Cabinets have one, two or four visible speaker elements behind cloth. Looks remain independent of the actual capture or IR.
- Device options groups model import, saved variants, appearance and placement below the hardware. It stays open when changing appearance. Replace device keeps the contextual category picker; effect presets stay visible above the controls.
- Material textures are bundled locally and system fonts are used, so the new appearance works offline. Texture assets and generation prompts are documented in docs/HARDWARE-ASSETS.md.

Validation: eight JavaScript suites pass. Browser verified amp/cab/pedal renderings, 20 choices, appearance leaving parameters unchanged, rotary keyboard adjustment, bypass, Undo, contextual replacement, outside dismissal and a 900×650 cabinet view without page overflow. Existing native engine/DSP sources and DLLs are unchanged except for the window version label. No live audio was started during visual work.

## Alpha 07 — live device switching and contextual picker (27 September 2026)

Run **releases/GuitarSuite-alpha-07/GuitarSuite.exe**. This is a candidate fix for the scratchy audio reported after amp/pedal changes. Live Mackie validation remains necessary; the original hardware noise has not been reproduced offline.

- Rig changes keep the existing ASIO device, input/output channels, buffers and sample rate open. Construct and warm the replacement graph first, swap it between processing blocks, and blend into its output over 10 ms. A failed model load leaves the working audio graph intact; the UI reports the failure. The selected UI device can still show the failed choice until Undo is used.
- Graph replacement, parameter publication and rendering are synchronised so an active native processor cannot be disposed beneath a callback. Graph preparation and disposal take place outside the render gate. Existing effect tails reset on a graph replacement; this is not spillover.
- Processing errors latch silence until the engine stops. ASIO reset requests mute the stream and report an actionable error. Buffer-overrun indication is shown in workspace levels. Local audio-diagnostics.log records starts, graph swaps and faults without account tokens.
- Replace device opens a visual picker in the current category: amps, cabinets, drive, delay, modulation, reverb, dynamics or utility. Filters and search allow switching category; saved TONE3000 packs are included. Empty amp/cab slots start in their matching category.
- Clicking outside dismisses the picker or device controls; Escape and close buttons remain available. Outside dismissal keeps board controls mounted so the same click can open another action.

Validation: eight JavaScript suites; browser checks for Drive/Amps context, category switching, search, replacement without increasing device count, Undo and both outside-dismiss paths. Native suite passed under the normal Windows profile, including 180 graph replacements with concurrent rendering at 44.1/48/96 kHz, failure retaining the old graph, all effects/presets, and repeated captured pedal/amp switches for three private A2 fixtures. These tests do not simulate the Mackie driver's hardware timing. No live audio was started. A restricted-account encryption-test failure was resolved by rerunning under the normal Windows profile.

Next: validate amp/drive changes through the Mackie; use the supplied 333.webp reference for realistic manufacturer-specific hardware and a cleaner layout after audio stability is confirmed.

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
