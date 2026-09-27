# Changelog

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
