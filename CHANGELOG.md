## Alpha 44 — 4 October 2026

- Fixed blank ASIO input/output selectors after closing and reopening Audio setup while audio is running. Discovered channel names now survive dialog dismissal; saved selections remain visible when names are unavailable.
- Keeps driver discovery stopped during playback and preserves saved channel indices and audio processing. Browser reopen verification passed; this UI fix does not establish a resolution of reported missing Mackie sound.

## Alpha 43 — 4 October 2026

- Added automatic local audio-performance logging: one-second peak/load snapshots, new missed deadlines/output dropouts, route/rate/buffer context, scene/device settings, faults and UI timer gaps.
- Writes on a dedicated background worker with a bounded queue and two capped files. Audio processing arithmetic and callbacks are unchanged; existing meter readings are shared rather than consumed twice.
- Added log rotation/failure tests and a review guide. Logging does not prove the cause of the reported Mackie idle load or resolve live dropouts; no live ASIO listening is claimed.

## Alpha 42 — 30 September 2026

- Removed the generic panels covering amp and pedal artwork. Live controls now use measured faceplate positions for each enclosure family, with the image's original proportions preserved.
- Kept pedal names and bypass switches inside their enclosures; amps use a rocker switch on their control strip. Shortened EchoKing legends without changing parameter names, values or ordering.
- Corrected knob-pointer pivots at smaller sizes. Small-window combo editing frames the upper chassis so the controls stay accessible; larger windows show the full combo.
- Capture appearance inference prioritises a named 5150/Peavey amp over a Mesa cabinet in combined titles. Explicit saved looks remain respected.
- Same-page device settings and all audio processing are unchanged.

## 4 October 2026 — GitHub documentation preparation

- Reworked README as a project landing page with existing Alpha 42 screenshots, standard signal-flow diagram, setup steps and linked guides.
- Added a comprehensive FAQ covering setup, latency, captures/IRs, effects, scenes, backing audio, troubleshooting, privacy, licences and development.
- Added prominent upstream credits with named projects, retained licences, revisions, adaptation notes and AI artwork/code disclosure.
- Distinguished source downloads from portable packages and documented unresolved live-audio limitations. No app version, DSP or saved-data changes.

## Alpha 41 — 30 September 2026

- Fixed TONE3000 opening the pedal library from stock modelled amps and recorded cabinets. These now open the amp and IR cabinet categories respectively.
- Loading a TONE3000 capture into a modelled amp/cab now selects the correct capture loader, preserving routing and scene bypass. New amp captures start with neutral external EQ.
- Includes Alpha 40 control layouts and same-page settings. Support-report work deferred.

## Alpha 40 — 30 September 2026

- Reworked amp and pedal control faces into distinct control, identity and bypass regions with aligned labels, knobs and numeric values.
- Restored device settings beside the hardware on the same page; the device guide expands inline. Sound controls remain visible while optional settings scroll.
- Preserved audio processing, parameter indices, saved patches and scene behaviour.

## Alpha 39 â€” 30 September 2026

- The executable and running desktop window use a multi-size FR icon built from the original logoâ€™s script outlines.

- Reworked editor sizing around the available workspace: compact patch/scenes and chain, persistent device actions, and hardware fitted to the remaining height. Main sound controls no longer sit below a scrolling amp image.
- Sound, Device settings and Guide pages are one click away in a fixed navigation row. Optional settings and long manuals have their own content area. Main rig returns when the selected chain device is clicked again.

## Alpha 38 â€” 30 September 2026

- Collection and replacement picker share an Amp source filter: All amps, Modelled, or TONE3000 only. It filters amps without hiding other effect categories; the empty NAM loader appears under All amps.

- Device editing now expands inside the pedalboard workspace instead of covering and dimming the whole app. The chain and hardware controls slide up together; the library, toolbar and scenes remain usable.
- Click the selected device in the top chain again, Close or Escape to fold back to the full pedalboard with a size/fade transition. No audio processing changes.

## Alpha 37 â€” 30 September 2026

- The main rig now uses the same compact input/output dials and adjacent meters as the slide-up editor, replacing the long sliders. Both views stay synchronised with saved audio levels; calibration, audio load and overload warnings remain available. Audio processing is unchanged.

## Alpha 36 â€” 30 September 2026

- Device controls open in a smooth slide-up panel over the visible rig, with a compact hardware chain across the top. Click outside, press Escape or use Close to slide it away.
- Input trim and master output dials flank the chain, each with a live level meter. They mirror the existing saved audio controls without adding gain stages.
- Device switching, capture selection, replacement, knob edits and strip bypass gestures retain their existing handlers. The panel scrolls on smaller screens and respects reduced-motion preferences.

## Alpha 35 â€” 30 September 2026

- Lifted hardware now sways with damped momentum around the grab point, gently overshooting and settling when movement stops. Wide amp heads lean more subtly than pedals.
- Pointer tracking remains immediate; reduced-motion preferences disable sway. Animation stops on release/cancel and pauses when settled. Audio and routing are unchanged.

## Alpha 34 â€” 30 September 2026

- Dragging lifts the hardware artwork at its original size and grab point, with a raised shadow, gentle tilt and short landing animation. The original position fades during pickup.
- Highlighted targets and place/replace/remove hints clarify the result before release. Narrow pedal rails can scroll during dragging.
- Reduced-motion preferences disable lift/landing animation. Existing routing, replacement, cancellation and click suppression remain owned by the gesture adapter; audio processing is unchanged.

## Alpha 33 â€” 30 September 2026

- Moved the effects-loop pedalboard above the main rig, centred over the amp/cab stack, with send/return labels pointing towards the stack below.
- Four-slot rails, device dragging and audio routing are unchanged: the loop still processes after the complete amp and before the cabinet.

## Alpha 32 â€” 30 September 2026

- Extended realistic artwork across the complete device catalogue, collection, replacement picker, chain strip and editor using 26 shared chassis assets.
- Distinct British, blackface, tweed, diamond-grille, orange, rectifier, modern and boutique amp families; compact cast, treadle, round fuzz, folded-steel and wide studio pedals.
- All ten cabinet formats now have matching rendered speaker counts and proportions, including vertical 2Ã—12, slanted 4Ã—12 and eight-speaker bass towers.
- Saved appearances and custom finishes remain available. Live knobs, EQ faders, scene values, bypass and recorded mic selection retain their existing processor contracts.
- Four-pedal rows and measured patch leads remain. Images are bundled for offline use. These are original family-inspired illustrations, not new audio models or exact branded replicas.

## Alpha 31 â€” 30 September 2026

- All pedalboards use four positions on a single rail with tighter spacing. Narrow windows scroll the board horizontally instead of wrapping pedals into a second row.
- Short patch leads retain their attachment positions when a board scrolls. Audio processing and saved routing are unchanged.

## Alpha 30 â€” 30 September 2026

- Tighter pedal spacing and larger enclosures on broader board rails, following the supplied pedalboard reference.
- Short curved patch leads with shaded right-angle metal plugs seated against the hardware. Empty slots no longer have fake sockets or long perimeter wires; row-to-row wiring is tucked beneath the board.
- The Alpha 29 layout, drag targets, scenes and audio processing remain unchanged.

## Alpha 29 â€” 30 September 2026

- Rebuilt the normal routing workspace as a before-amp pedalboard, central amp/cab stack, after-cab pedalboard and compact send/return board.
- Added rail surfaces, metal connectors and measured patch leads. Leads follow visible slots and resize with the board; custom graphs remain in Advanced routing.
- Combo-style appearances show one amp enclosure with accessible cabinet processing below. Multiple cabinets retain their parallel/summed indication and individual controls.
- Preserved drag-to-move/replace/remove, bypass, device editing and scene behaviour. Empty effects loops are compact; no audio processing or saved-patch changes.

## Alpha 28 â€” 30 September 2026

- First hardware artwork pass: British amp head, green Moss Drive, blue Tape Echo, violet Open Space, horizontal 2Ã—12 and straight 4Ã—12 cabinet bodies.
- Working React knobs, numeric values and bypass switches sit on the hardware. Parameter ranges, scenes and audio processing are unchanged.
- Cleaner pedalboard shelves and compact spacing; device guides collapse beneath the editor. Existing custom colours, cabinet formats and other devices keep their established artwork.
- Original artwork is bundled for offline use. This is the first selected device set, not a reskin of the entire collection.

## Alpha 27 â€” 30 September 2026

- Added a bottom-left version button that opens the complete offline changelog, with release navigation and search.
- Backfilled Alpha 01â€“26 and the 03.1 hotfix from the existing project records; retained source-only diagnostics and early prototype history.
- Centralised the current release number. Builds and packaging reject missing release notes or mismatched version metadata.
- Keyboard, Escape and outside-click dismissal return focus to the version button. No audio processing or saved-patch changes.

## Alpha 26 â€” 30 September 2026

- Import all 13 Tamgamp circuit preamp channels with their actual controls and independent stereo state.
- Add five recorded cabinet/speaker configurations, 21 CC0 microphone setups, dual-mic blend, polarity and output controls saved per scene.
- Add allocation-free direct-head/FFT-tail cabinet convolution with staggered work and smooth microphone changes.
- Recognise all cabinet device types in placement/parallel routing; use appropriate amp-family artwork and corrected amp/cab preset labels.
- Preserve upstream sources/notices, original cabinet WAVs/handbooks and deterministic embedding. New native total: 218 processors.
- Document scope: preamps, not full power-amp models; five configurations from two enclosure families, not ten distinct cabinets.

## Alpha 25 â€” 30 September 2026

- Studio factory tags group 41 recording-oriented processors without losing effect categories or user tags.
- Detailed playing guides and control ranges for 200 native effects, including 156 attributed Airwindows manuals; expanded legacy pedal descriptions.
- React Quality / DSP cost filters in Collection and replacement picker, with measured per-device costs and explicit Unmeasured state.
- Component CSS now bundles correctly; no DSP arithmetic or patch contracts changed.
- Documented non-NAM circuit-amp and multi-mic cabinet research; these prospective ports are not included in this release.

## 28 September 2026 â€” Alpha 24: 200 effects and tags

Expanded to 200 separately registered native effects: 156 pinned MIT Airwindows imports plus Centaur, ten-band EQ, manual/envelope wah, standalone studio pitch, granular/reverse delay, vocoder and a temporary stereo practice looper. Preserved existing pedal presets/keys. Added category/description search, source notes, EQ faders and looper buttons. Bird Treble Boost corrects the misleading Scream Drive display name without changing its DSP. Includes the earlier patch/device tags, optional propagation, captured-pedal level comparisons, combined-cab guidance and up/down strip bypass gestures.

Validation: npm run check (13 suites), native formatting, desktop/effect builds, complete offline self-test (200 effects, 242 presets, 11 graph bypass cases), and 1,800 effect/rate/buffer cases with parameter endpoints passed. Graphic EQ response, loop record/play/clear/auto-play and one-sample ClipOnly2 latency verified. React browser checks cover filters, search, EQ faders/scene recall/reset/bypass and looper commands; actual 1920Ã—1080 DOM bounds checked. No live ASIO listening or physical-pedal equivalence claimed. Studio Pitch deliberately adds about 140 ms; labelled accordingly.

Release: releases/FreeRig-alpha-24/FreeRig.exe and FreeRig-alpha-24-win-x64.zip, with source and licences. Research/limitations: docs/EFFECTS-COLLECTION.md. No remote configured; Mission Control access remains unavailable, so this is the local handover. Next: user listening feedback, richer curated presets and advanced key-aware harmonisation/sidechain/persistent looping if wanted.

## 28 September 2026 â€” Tags, capture controls and strip bypass

Added modular React patch/device tags, explicit optional propagation, collection search and portable bank metadata. Added explicit NAM pedal level comparison, combined-cab bypass guidance and editor-strip up/down bypass gestures. No audio arithmetic changes. All 13 JavaScript suites and browser interactions pass; see docs/TAGS-AND-CAPTURE-LEVELS.md. Next: broad effect research and implementation requested by user, targeting roughly 200 distinct processors across all major families. Not yet packaged in a new release.

## 28 September 2026 â€” Exported patch gain-stage audit (source only)

Added a developer-only saved serial patch audit with per-stage peaks/RMS and sequential-routing checks. The supplied JCM Patch contains a combined amp+cab capture followed by another IR, with +5.1/+6 dB amp input/output in Crunch. Synthetic rendering reproduces a 12.89 dB TS9 pre-amp RMS drop and confirms the amp/cab path is retained. Prepared a separate four-scene listening comparison patch; original user files and playback DSP are unchanged. See docs/CAPTURE-FIDELITY.md for evidence and limits.

## 28 September 2026 â€” Drive-chain diagnostics (source only)

Extended offline capture-chain comparison to include a stock or NAM pedal before the amp/IR. Added stock-drive buffer-invariance diagnostics and routing regression tests. Six stock drives and three local Fortin TS-9 captures preserve the complete amp/cab path in constructed tests; capture inference matches generic NAM. The reported live sound remains under investigation pending the affected patch and gain settings. No playback DSP, model weights or release files changed. See docs/CAPTURE-FIDELITY.md.

## 28 September 2026 â€” Alpha 23 capture fidelity and output headroom

Removed unintended Â±8 floating-point clipping between devices, preserving hot capture waveforms until downstream attenuation. Intentional drive algorithms and final output protection remain. Added held pre-ceiling peak measurement and a React overload action that reduces only the saved master output. Unloaded cabinet blocks are labelled cuts-only, and capture editors distinguish head-only from amp+cab metadata.

Audited the two local Hendrix captures against a separate generic NAM build at 32/64/128 samples: maximum error 2.09e-7. Marshall Greenback/V30/Creamback IRs match independent direct WAV convolution within 5.85e-8. Six NAM/IR combinations match a separately constructed reference chain exactly at all three buffer sizes. Synthetic unity-gain chain peaks ranged 1.006â€“2.986, demonstrating possible output overload, not proving the user's live settings clipped. New headroom/bypass tests cover 44.1/48/96 kHz. See docs/CAPTURE-FIDELITY.md for reproducible commands and limitations. No model weights, NAM quality, sample-buffer setting or saved patch parameters were changed.

## 28 September 2026 â€” Alpha 22 play-along input

Added a React Play along toolbar dialog and independent stereo WASAPI loopback input. Backing volume/mute/meter sit after guitar effects and before the global master/ceiling. Two bounded SPSC queues isolate capture and worker resampling from the guitar callback. Source choices persist, connection does not; known output feedback routes are blocked and direct ASIO requires separate-device confirmation. Stopping guitar disconnects backing. No new dependencies or NAM/effects DLL changes.

Offline tests pass across 44.1/48/96 kHz and 32/64/128/4096-frame blocks, including independent mute, stereo summing, output protection, empty-source guitar equivalence, concurrent FIFO ordering and nine 30-second clock-drift simulations. Browser fixture checks cover connection, levels, mute, persistence, routing protection and stop/restart. These do not establish real-device loopback compatibility or live listening quality. See docs/PLAY-ALONG.md. No automatic capture, disk recording or audio upload.

## Alpha 21 â€” broader audio compatibility (28 September 2026)

- Added WASAPI shared input with channel selection, float format negotiation and bounded preallocated processing blocks using the existing NAudio dependency.
- Added a modular React audio setup form with ASIO/Windows choices, device refresh, automatic ASIO channel discovery, saved endpoint IDs and unavailable-device handling.
- Kept direct ASIO output separate from the Windows output queue; capture DSP and model-rate conversion are shared, with no new model approximations.
- Updated the setup wizard, latency explanations and Windows microphone-permission guidance. Device changes require Stop; audio never starts automatically.
- Added packet-continuity/channel-isolation regressions, Windows preference/calibration coverage and a hardware-free UI fixture.
- Live WASAPI/FlexASIO listening and round-trip latency qualification remain hardware checks; offline tests do not establish them.

## Project onboarding â€” 28 September 2026

- Added a concise Freerig project brief and ready-to-use project instructions with source location, architecture, verification limits and priorities.
- Added a mandatory working-directory check to repository guidance to prevent edits in the unrelated website project.
- Documentation only; no app version or audio behaviour change. Conversation-project settings/uploads must be applied separately.

## Alpha 20 â€” modular source and contributor workflow (28 September 2026)

- Split native patch models, interop, graph/processors, host messages and services into focused source files.
- Split the legacy application/artwork into named compatibility modules, with deterministic generated runtime bundles.
- Added one descriptor per imported stock pedal and a shared native factory registry; generation validates preset ranges and parameter counts.
- Added consistent source formatting, useful ownership/compatibility comments, contributor and pedal guides, and repository rules for future edits.
- Fixed delegated editor button handlers being replaced by React root event setup.
- Retained processing maths, saved patch keys and parameter ordering; no intentional sound or UI behaviour changes.

## Alpha 19 â€” cabinet formats redrawn (27 September 2026)

Run **releases/FreeRig-alpha-19/FreeRig.exe**. Cabinet format is now separate from Hardware look in Device options: 1x10, 1x12, 1x15, horizontal 2x10/2x12, vertical 2x12, compact 4x10, straight/slant 4x12 and 8x10. All 20 finishes work with any format. The editor and thumbnails use the same scalable illustration, with circular speakers, individual enclosure proportions, grille cloth, piping, protective corners and feet. Cabinet adjustments sit alongside the enclosure.

The chosen format is saved in the patch and survives scene changes and model changes. Existing patches without an explicit format infer it from a recognised tone/model name, then fall back to the previous look's speaker count. Geometry is representative, not a manufacturer specification. Appearance does not replace the loaded IR or change its sound; collection format inference uses the tone title, while explicit format choices belong to patch instances.

TypeScript/native builds, cabinet geometry/patch-roundtrip and saved-device regressions pass. Browser checks cover four-speaker layouts, format switching and cabinet parameter editing. All ten silhouettes were visually reviewed. Audio processing and both DSP DLLs are unchanged from Alpha 18.

## Alpha 18 â€” setup wizard and header alignment (27 September 2026)

Run **releases/FreeRig-alpha-18/FreeRig.exe**. Setup wizard beside Collection walks through connections, ASIO inputs/outputs, buffer size, first-sound troubleshooting, TONE3000 sign-in/downloads and saving patches/scenes. It opens the existing setup screens, remembers the current step for this app session, supports Escape/outside-click dismissal and never starts audio automatically. TONE3000 offers a choice of compatible devices already in the patch. Empty rigs receive an explanation rather than a broken action.

Saved model labels/selectors now align with header buttons; long model names truncate inside the selector and controls wrap on smaller windows. TypeScript/build and browser checks pass, including audio/TONE3000 handoffs, step resumption and an extra-long model label with no header overflow. Native host change is version text only; DPI manifest retained, DSP DLLs unchanged. Live hardware and online authentication were not repeated for this interface-only update.

## Alpha 17 â€” display clarity and creator credit (27 September 2026)

Run **releases/FreeRig-alpha-17/FreeRig.exe** after closing the previous app. The desktop host now declares per-monitor DPI awareness so Windows does not bitmap-scale its interface on high-DPI screens. Text-bearing filter layers are removed and small labels use clearer sizes and weights. Downloaded captures show their creator name and avatar at the bottom-right of the device editor, visible with Device options closed; missing or unavailable avatars fall back to an initial.

TypeScript production build, native offline self-test and browser creator-credit checks pass. Embedded DPI manifest and release integrity are verified. Actual sharpness on the user's 4K display and movement between monitors still need a visual check after restart. Audio processing is unchanged; both DSP DLLs match Alpha 16. Alpha 16 remains available.

## Alpha 16 â€” React interface foundation (27 September 2026)

Run **releases/FreeRig-alpha-16/FreeRig.exe**. The normal pedalboard, device editor and hardware knobs now render through React and TypeScript. Right-click a device to edit, bypass, replace, duplicate with all scene settings, move between stages or remove. Empty slots have an Add menu. Shift+F10 opens the same menu; arrows navigate, Escape closes and restores focus. Ctrl+Z invokes Undo outside text fields. Dragging still leaves the editor closed. Menus, editor entry, bypass and device movement have lightweight animations that respect reduced-motion preferences.

This is the first migration stage. The native audio engine and saved-patch model remain the authority; collection, banks, advanced cable drawing and import/preset forms still use their existing handlers. React is bundled locally and needs no internet at runtime. Alpha 15 remains available. TypeScript build, 11 JS regression suites, full native offline self-test and browser interaction checks pass. No live ASIO playback was started. See docs/REACT-MIGRATION.md.

## Alpha 15 â€” imported pedal collection (27 September 2026)

Run **releases/FreeRig-alpha-15/FreeRig.exe**. Adds CloudSeed Space ambient reverb, EchoKing MkII tape echo, Photon Vibe and TriPhase Theorem, with 12 FreeRig starting presets. Find them under Reverb, Delay and Modulation. They work offline. Alpha 14 remains available.

The native ports add no dry-path buffering and do not change ASIO settings or NAM processing. Offline qualification passes at 44.1/48/96 kHz, including small blocks, parameter extremes, tails, stereo state and bypass/re-engagement. The full native regression and three JS suites pass. Browser checks confirm all four control panels and preset application. Live ASIO listening and worst-case scheduling are not certified by these offline checks. See docs/IMPORTED-EFFECTS.md for provenance and limitations.

# Changelog

## Alpha 14 TONE3000 header action â€” 27 September 2026

Browse TONE3000 is now in the selected device header beside the capture selector and Replace device. The existing browse handler is retained; downloaded-tone attribution and variant details remain in Device options. Browser checks confirm the button is visible with options collapsed and opens the TONE3000 preview dialog. Restart Alpha 14 to load this interface update. Audio processing is unchanged.


## FreeRig Alpha 14 â€” 27 September 2026

The app is now FreeRig, using the supplied cream-and-orange SVG logo. Run **releases/FreeRig-alpha-14/FreeRig.exe**. Header, native window, status bar and user-facing import/export messages use the new name. Existing GuitarSuite storage folders, browser origin, patch formats and audio processing are preserved for compatibility.

## Alpha 13 header preset picker â€” 27 September 2026

The saved capture model picker now sits in the device header beside Replace device. Its original change handler and missing-file handling remain intact, and it is removed from the lower Device options section. The duplicated model filename is removed from the subtitle. Browser verification with an isolated two-model test pack confirms a single header picker and switching Clean to Crunch updates the selected asset. The saved-device regression suite passes. Restart Alpha 13 to load the updated interface.


## Alpha 13 drag/drop fix â€” 27 September 2026

Dropping moved, added or replacement devices keeps the routing board open, including saved TONE3000 devices. Dragging off the board also stays on the board. Ordinary clicks and picker selections still open controls. Ten existing JS suites pass; browser verification confirms moving and library insertion leave the editor closed, while a normal click opens it. Restart Alpha 13 to load the corrected UI.


## Alpha 13 â€” pedalboard and amp FX loop (27 September 2026)

Run **releases/GuitarSuite-alpha-13/GuitarSuite.exe**. The native window title and UI now both identify Alpha 13.

The normal routing workspace is a pedalboard: amp/cabinets on an upper shelf, and four initial pedal slots in each of Before amp, Amp FX loop and After cab. Numbered stages and left-to-right row arrows replace the screen-wrapping patch cables. Input/output trim remains above the workspace. Multiple cabinets share their input and their outputs are summed.

The processing order is Input â†’ Before amp â†’ Amp â†’ FX loop â†’ parallel cabinets â†’ After cab â†’ Output. Moving pedals to an empty slot reconnects them at that stage; dropping onto a device replaces it; dragging off the board removes it. Scene settings survive moves. The FX loop is after the whole amp model, not an internal preamp/power-amp split or a physical interface send/return. Existing saved delays are not moved automatically.

Advanced routing retains manual cables and Keep cables when moving. Custom patches open there automatically, preserving their connections. Switching a custom patch to pedalboard order requires an explicit action in a dialog; Undo restores its previous routing. The simple board always reconnects a move, even if Keep cables was enabled in Advanced mode. Existing patches and bank storage remain compatible.

Validation: ten JavaScript suites pass, including new tests for loop order, parallel-cab fanout, removal, saved loop slots, scene preservation and custom graph preservation. Browser testing moved Tape Echo into the loop, verified amp â†’ delay â†’ both cabinets â†’ final effects in the cable list, checked the custom conversion dialog, save/reload and all three rows at 1920x1080 without page horizontal overflow. At 1280x720 the complete board is usable with main-pane vertical scrolling. Native offline regression passes after rebuilding the host to correct its title. Audio DSP source and native model/effect DLLs are unchanged. No live ASIO playback was started; hardware listening and existing Powercab/live-scene follow-ups remain outstanding.


## Alpha 12 â€” studio design pass (27 September 2026)

Run **releases/GuitarSuite-alpha-12/GuitarSuite.exe**. This is a UI-only release using the unchanged alpha 11 executable and audio libraries; the native window title may still say alpha 11. The in-app footer identifies design build 12.

- Cleaner LAVA Studio-inspired workspace, with original hardware finishes informed by Chris's amp/pedal references: inset grilles, brushed panels, cast enclosures, more substantial knobs and contrast-aware pedal lettering. Stock reference images are not distributed.
- Docked equipment editor with a device overview strip and a Routing button. The strip is a device selector, not a representation of cable topology; the full routing board remains the source of truth.
- Devices/Patches collection tabs; search saved patches across banks and recall directly. Existing bank storage, recovery, save and import/export remain in use.
- Large Perform scene pads for four or eight scenes, with bypassable devices below. Scene dispatch and audio behaviour are unchanged.
- Checked at 1920x1080 and 1280x720. Amp and cab controls fit at 1080p; short windows use compact chrome and vertical scrolling for options or tall gear. Existing twenty appearance choices and colour overrides remain available.

Validation: nine JavaScript suites pass. Browser checks cover numeric knob edits, dirty/save state, device selection, patch search/recall, contextual Drive replacement, eight-scene Perform selection and 1080p geometry. Native binaries are hash-identical to alpha 11; no live ASIO playback was started. Powercab USB latency and full live scene-transition qualification remain outstanding.


## Alpha 11 â€” calibration, banks and performance workspace (27 September 2026)

Run **releases/GuitarSuite-alpha-11/GuitarSuite.exe**. Previous releases remain available. Keep the established Mackie ASIO / 32-sample route for the initial comparison. No buffer size, capture quality or sample rate is changed automatically.

- Input calibration: raw pre-trim peak meter and clipping hold, optional verified hardware dBu reference saved per ASIO driver/input. NAM input metadata drives input compensation; NAM pedal output metadata brings its output back to the same reference. Missing metadata stays uncorrected. Disabled by default; creative input trim remains separate. Hardware gain must stay at the setting for which the reference is valid. Metadata is read from the already loaded native NAM object during graph preparation. Gain changes ramp over 10 ms. A reference alone cannot certify an entire chain of uncalibrated effects.
- Audio-load bar: peak processing deadline usage over each 100 ms UI interval, session peak, cumulative missed deadlines and separate-output drops. 100% means the callback processing deadline was exceeded, not 100% Windows CPU. Driver scheduling and complete round-trip latency are not measured by this bar.
- Patch banks: create/rename banks, Save/Save as new, previous/next recall, bank export/import, persistent selections. Export references models/IRs; it does not bundle them. Recalling a patch preserves an unsaved recovery copy and supports Undo. A backup of the previous bank store is retained locally. Limits: 64 banks, 128 patches per bank, browser storage quota and existing 4 MB import limit.
- Scenes: four by default, four extra on demand; independent bypass/parameters, names, copy and keys 1â€“8. Hiding extras preserves their data and will not change the current sound. Old four-scene patches remain valid. Scene commands dispatch immediately instead of waiting for the 90 ms parameter-edit debounce. The existing graph stays alive; no models reload or intentional output mute occurs for scene recall.
- Workspace: collapsible device library, compact header, distinct bank/patch and scene controls, folded two-row chain on narrower windows, Fit board uses available width and height. Additional amp/cab buttons retain multi-cab support. Routing is unchanged by the drawing layout. Verified at 1920Ã—1080 and 1280Ã—800 with eight scenes; the main chain has no horizontal overflow. The amp editor fits in the smaller viewport. Very long chains may still need scrolling or explicit zoom.

Validation: nine JS suites pass. Full native regression passes with seven private captures, 31 effects and 65 presets. A synthetic unity NAM tests real native metadata, amp input compensation, pedal output calibration and disabling calibration at 32 samples. Eight-scene tests at 32/64/128 samples match uninterrupted delay output exactly and retain tails; 1,200 bypass switches per size introduce no silent samples. Browser tests cover banks, save/recall/Undo, eight-scene persistence, calibration guidance and smaller-window controls. No live ASIO playback was started during this work.

Live qualification remains open: abrupt delay-time, algorithm-specific or EQ changes can still produce audible transitions. These tests do not establish that every effect/parameter combination is clickless or that full patch changes preserve tails. Full patch recall still rebuilds the graph and may reset tails. Test real setlists at 32 samples before relying on scenes live.

Powercab feedback: Chris reports the separate USB route works but feels unusably delayed even at the 5 ms request. This is recorded as an unresolved latency issue, not a successful live route. The request is not total latency. Mackie ASIO output with an analogue cable to Powercab avoids our second-device queue; actual hardware round-trip latency still needs measurement.

MIDI foot control is on the todo list. See [GUI research](docs/GUI-RESEARCH.md) and [next work](docs/TODO.md).

## Alpha 10 colour hotfix â€” 27 September 2026

Custom colours now tint the realistic amp/cab enclosures instead of being obscured by opaque texture images. Wood and folded-metal finishes also use the saved colour. Texture, grille, controls and audio settings are retained. Untouched devices keep their default finish. Close and reopen alpha 10 to load the updated UI.

Verified red/blue rendering on black tolex, tweed cabinet, wood amp and folded-metal pedal using the production skin renderer and CSS. Audio executable and DSP libraries are unchanged.

## Alpha 10 â€” separate USB output (27 September 2026)

Run **releases/GuitarSuite-alpha-10/GuitarSuite.exe**. Chris confirmed alpha 09 is working well with the Mackie at 32 samples; that remains the established single-interface baseline.

Audio setup now has an independent Output device selector. Keep Mackie ASIO for the guitar input and select **Speakers (2- Powercab 112 Plus)** for USB playback. Stop/Start applies device changes. Choices persist by Windows endpoint ID; missing saved outputs remain labelled unavailable, with no silent fallback. Refresh outputs detects newly connected devices. Same ASIO interface remains the default and retains the alpha 09 processing path.

Separate-device mode opens ASIO for input only and sends processed stereo audio, including master gain/tuner mute/output ceiling, through WASAPI to the selected endpoint. A bounded FIFO and WDL sinc rate correction accommodate the independent hardware clocks. Shared/exclusive modes and 5/10/20 ms output-buffer requests are available. This route adds buffering/resampling and is not bit-identical or as low-latency as the direct ASIO route; the models themselves stay full quality. Requested output time is not measured round-trip latency. For Powercab, try Exclusive output with 5 ms; if unavailable or unstable, use shared mode or more output headroom. The Mackie 32-sample input setting is unchanged.

Validation: eight JS suites passed including device persistence, missing-device handling, start payload and returning to ASIO. Full native regression passed with seven private captures. Nine offline 60-second clock-drift cases (44.1/48/96 kHz, -500/0/+500 ppm, 32-frame producer) had zero drops and preserved stereo; startup silence and overflow bounds passed. Connected Powercab initialised at 48 kHz stereo in shared float32 and exclusive PCM16, without playback. No live sound was sent; actual listening, unplug/reconnect during playback and end-to-end latency remain unverified.

See docs/USB-OUTPUT.md for setup, limitations and validation.

## Alpha 09 â€” low-buffer NAM processing (27 September 2026)

Run **releases/GuitarSuite-alpha-09/GuitarSuite.exe**. The previous builds remain available. Chris confirmed stock processing and IR cabinets sound okay, while NAM captures sound bit-crushed. The local Mackie log showed 48 kHz / 8 samples and over 300,000 cumulative callback overruns.

The engine had prepared every NAM instance for a maximum 4096-sample block, even for 8-sample ASIO callbacks. On the tested A2 captures, that oversized preparation made tiny-block processing far more expensive. Alpha 09 obtains the driver buffer size before building the graph and passes it through every NAM/IR instance and replacement. Warm-up uses bounded chunks. Unexpected live buffer changes are rejected with restart guidance instead of passing an oversized block into a model.

No extra audio buffering, resampling, capture slimming, precision reduction or DSP algorithm change was introduced. Native DSP DLLs are unchanged. All 42 before/after full-chain comparisons (seven private captures Ã— six buffer sizes) produced zero difference on both channels. Replacement and scene bypass passed at every size; the complete native self-test also passed. Median full-chain time improved 8.4x at 8 samples, 3.8x at 32 and 2.5x at 64. These are offline throughput measurements, not a live scheduling guarantee or a measured round-trip latency. Live Mackie listening remains to be confirmed; 32/64 samples are useful initial low-latency checks, and no buffer setting is forced.

See docs/NAM-BUFFER-PERFORMANCE.md for methodology and results. Run GuitarSuite.exe --buffer-test followed by paths to local .nam files to reproduce; captures are not distributed in the source/release.

## Alpha 08 â€” realistic hardware and cleaner studio (27 September 2026)

Run **releases/GuitarSuite-alpha-08/GuitarSuite.exe**. Alpha 07 remains available for the live Mackie comparison. Audio engine behaviour is unchanged from alpha 07; its reported-noise fix still awaits hardware confirmation.

- Centred equipment view with a quieter charcoal workspace, clearer hierarchy, restrained brass accents and compact scenes. The selected equipment is the main control surface. Close, Escape and outside dismissal remain available.
- Real material textures, metal corner protectors, handles, layered knob caps and readable control labels. Combo controls sit above the grille; heads use wider lower control panels. Manufacturer-inspired families include blackface/silverface, tweed, British gold, diamond cloth, cream panels, industrial metal and wood. These are original UI renditions rather than exact product scans or changes to the audio model.
- Twenty appearance choices per amp, cabinet and pedal, retaining existing appearance IDs. Pedals now have category-appropriate appearance names and compact cast, treadle, folded metal and wide enclosure structures. Cabinets have one, two or four visible speaker elements behind cloth. Looks remain independent of the actual capture or IR.
- Device options groups model import, saved variants, appearance and placement below the hardware. It stays open when changing appearance. Replace device keeps the contextual category picker; effect presets stay visible above the controls.
- Material textures are bundled locally and system fonts are used, so the new appearance works offline. Texture assets and generation prompts are documented in docs/HARDWARE-ASSETS.md.

Validation: eight JavaScript suites pass. Browser verified amp/cab/pedal renderings, 20 choices, appearance leaving parameters unchanged, rotary keyboard adjustment, bypass, Undo, contextual replacement, outside dismissal and a 900Ã—650 cabinet view without page overflow. Existing native engine/DSP sources and DLLs are unchanged except for the window version label. No live audio was started during visual work.

## Alpha 07 â€” live device switching and contextual picker (27 September 2026)

Run **releases/GuitarSuite-alpha-07/GuitarSuite.exe**. This is a candidate fix for the scratchy audio reported after amp/pedal changes. Live Mackie validation remains necessary; the original hardware noise has not been reproduced offline.

- Rig changes keep the existing ASIO device, input/output channels, buffers and sample rate open. Construct and warm the replacement graph first, swap it between processing blocks, and blend into its output over 10 ms. A failed model load leaves the working audio graph intact; the UI reports the failure. The selected UI device can still show the failed choice until Undo is used.
- Graph replacement, parameter publication and rendering are synchronised so an active native processor cannot be disposed beneath a callback. Graph preparation and disposal take place outside the render gate. Existing effect tails reset on a graph replacement; this is not spillover.
- Processing errors latch silence until the engine stops. ASIO reset requests mute the stream and report an actionable error. Buffer-overrun indication is shown in workspace levels. Local audio-diagnostics.log records starts, graph swaps and faults without account tokens.
- Replace device opens a visual picker in the current category: amps, cabinets, drive, delay, modulation, reverb, dynamics or utility. Filters and search allow switching category; saved TONE3000 packs are included. Empty amp/cab slots start in their matching category.
- Clicking outside dismisses the picker or device controls; Escape and close buttons remain available. Outside dismissal keeps board controls mounted so the same click can open another action.

Validation: eight JavaScript suites; browser checks for Drive/Amps context, category switching, search, replacement without increasing device count, Undo and both outside-dismiss paths. Native suite passed under the normal Windows profile, including 180 graph replacements with concurrent rendering at 44.1/48/96 kHz, failure retaining the old graph, all effects/presets, and repeated captured pedal/amp switches for three private A2 fixtures. These tests do not simulate the Mackie driver's hardware timing. No live audio was started. A restricted-account encryption-test failure was resolved by rerunning under the normal Windows profile.

Next: validate amp/drive changes through the Mackie; use the supplied 333.webp reference for realistic manufacturer-specific hardware and a cleaner layout after audio stability is confirmed.

## Alpha 06 â€” routing, stock drives and ambient sounds (26 September 2026)

Run **releases/GuitarSuite-alpha-06/GuitarSuite.exe** from the complete portable folder. Audio starts only when you press Start in Audio setup. No browser server is required. Alpha 05 remains alongside it.

- Drop any library device onto an existing device to replace it. Dragging an existing device onto another moves its complete sound, capture, appearance and four scene settings into the target's position, removing the old source. The target's wiring remains. Undo restores the previous rig.
- Moving to an empty slot reconnects at the new position by default; **Keep cables when moving** preserves custom routing instead. New insertions join an actual audio route, including on branched patches. Additional cabs retain the parallel-cab behaviour. Parallel signals sum; manage their levels.
- **Input trim** and **Master output** live on the routing workspace, with meters and clipping indication. Both are remembered. Input trim affects drive into the rig; master affects listening volume. Gains ramp over 10 ms. Tuner still listens before input trim.
- Clicking a device opens its controls in a drawer. Close or Escape dismisses it. The board no longer auto-shrinks below 85%; scroll to reach the rest of a long rig. Library and workspace scroll independently.
- **20 hardware looks each** for amps, cabinets and pedals. Cabinet illustrations include 1Ã—12, 2Ã—12 and 4Ã—12 forms; knobs remain on the illustrated hardware. Looks are cosmetic and do not load a different model or IR. Downloaded packs still offer their Saved model selector.
- **Six stock Guitarix drives/fuzzes**: Orange Distortion, Distortion Plus, Round Fuzz, Sustain Fuzz, Scream Drive and Soft Clip. These run at 96 kHz internally with Zita resampling where required. Scream Drive is the upstream Screaming Bird circuit, not a Tube Screamer.
- **Shimmer Hall**, **Warp Echo** (including reverse wash) and **Modulated Space**, alongside alpha 05's 22 stereo effects and tuner. There are now 31 added native effects and 65 presets, plus the original devices. These cover ambient/shimmer/modulated/tape/multitap sounds; they are not Strymon algorithm replicas.
- Fixed local-file import explicitly stopping audio. Model changes now use the existing resume-on-rig-update path. Fully bypassed captures stop processing after the fade settles. Imported amp captures no longer receive built-in amp voicing EQ; first imports start with neutral external EQ. Existing saved EQ settings remain as the user set them.

Validation: eight JavaScript suites, native tests for all 31 effects and 65 presets at 44.1/48/96 kHz with regular and irregular buffers up to 4096 frames, tuner/IR/latency/tempo/library/auth regressions, and three actual locally downloaded A2 pedal variants through a pedal â†’ amp â†’ cab rig. Bypass matches removing the pedal while retaining the downstream amp/cab; neutral captured amps match direct official NAM Core output. The original distorted/crashing state was not reproduced, so this is a verified set of fixes and regression tests, not a claim that every hardware failure has been reproduced. No live ASIO audio was started during the unattended work.

See **native/EFFECTS-RESEARCH.md** for source comparisons, dated GitHub adoption figures, selection rationale and limitations. Hardware listening/long-run dropout checks remain for Chris. Capture accuracy depends on the capture itself and correct input calibration; amp+cab captures should not normally feed a second cabinet. The built-in cabinet remains a filter approximation until a measured IR is loaded. Routing edits still cause a short restart; spillover, complete smoothing, MIDI, recording and a real looper remain unfinished.

Source, revision pins and licences accompany this GPL-3.0-or-later release. Private pedal test captures and account data are excluded.

## Early design and prototype â€” 26 September 2026
- Defined Guitar Suite as a free desktop application for Chris and friends.
- Recorded NAM A2, pedalboard, cabinet, presets and TONE3000 scope.
- Planned a playable audio prototype before interface polish and distribution.
- Expanded product direction around LAVA Studio, Darkglass Anagram and Quad Cortex: routing grid, scenes, performance controls, parallel rigs and practice/recording tools; documented phased delivery in DESIGN-BRIEF.md.
- Built the first interactive rig interface in prototype/: editable chain, scene-specific controls, local persistence, JSON export, performance view and silent practice previews. Confirmed Windows/ASIO target. Audio and TONE3000 are explicitly unconnected.
- Added illustrated pedals, amp heads and cabinet; draggable library-to-rig placement, cross-path movement and reordering with insertion feedback. Added serial/parallel routing, shared pre/post chains, split modes and per-scene mixer controls. Preserved v1 saves and added graph/migration tests. Audio routing is still a design, not DSP.
- Replaced separate selected-device controls with interactive knobs and footswitches embedded in illustrated pedal enclosures, amplifier front panels and cabinet controls. Added vertical knob dragging, Shift fine adjustment and retained keyboard focus. Verified bypass and saved parameter recall.

- Build 04: replaced fixed A/B lanes with explicit patch cables, free board placement, fan-out/summing connections, cycle prevention and a pre-amp delay example. Added named/copyable scenes within patches, v3 migration preserving old connections/settings, and Drive/Delay/Modulation/Reverb/Dynamics/Utility library filters. Verified routing, dragging, scene recall and persistence; audio remains unconnected.

- Build 05: organised the cable graph into four pre-amp effect slots, stacked amp/cab section and four post-cab slots. Added plus-slot picker, snapped placement, parallel cab insertion and undoable off-board drag removal with neighbour reconnection. Preserved existing oversized rigs as overflow rows.

## Alpha 04 â€” 26 September 2026

- Desktop alpha 04: added persistent TONE3000 devices with whole selected-architecture packs, offline model variants, amp/cab/pedal support, capture-pedal DSP, custom enclosure looks/colours, previous-download recovery, progress/cancellation and cached retry. Verified library and native audio regressions plus fixture UI; real pack download/listening check remains pending.

## Alpha 03.1 â€” 26 September 2026

- Alpha 03.1: explicitly use TLS 1.2 for the .NET Framework API client; the compiled executable passed a live OAuth preflight. Packaged separately to preserve the open alpha 03 session.

## Alpha 03 â€” 26 September 2026

- Desktop alpha 03: connected TONE3000 hosted Select OAuth flow using the supplied publishable key, PKCE/state validation and a separate bridge-free WebView. Added native encrypted token persistence/refresh, model picker, validated individual NAM/IR downloads, attribution/licence metadata, model variants and official branding. Live key/callback preflight reached sign-in; mocked token/refresh/redirect/download tests and core audio tests pass. Real account sign-in/download/playback remains to verify.

## Alpha 02 â€” 26 September 2026

- Desktop alpha 02: added remembered, smoothed master output (âˆ’30 to +12 dB), input/output meters and ceiling indication after quiet Mackie playback was reported. Remember ASIO driver/channels/rate, automatically restart running audio after topology changes, and support compatible device replacement via library drop or editor picker while retaining routing/scene bypass and Undo. Offline engine, settings persistence and replacement tests passed; hardware retest pending.

## Alpha 01 â€” 26 September 2026

- Desktop alpha 01: built an x64 Windows executable using WinForms/WebView2 and NAudio ASIO. Added Amplitron-derived clean/crunch voices, basic effects and filtered cabinet; compiled official NAM Core with A2 support for local NAM/WAV imports; added Guitar Suite JSON preset import/export. Bundled licences and unmodified Eigen sources. Offline graph/effect/WaveNet/A2/LSTM/IR tests pass; physical ASIO and listening validation remain pending.

## Alpha 05 â€” stereo effects and tuner (26 September 2026)

Run releases/GuitarSuite-alpha-05/GuitarSuite.exe. This portable Windows app needs no browser server. The original built-in sounds and saved TONE3000 library remain available.

- 22 new processors: six delays (digital, tape, double, pitch, four-tap and diffuse), eight reverbs (spring, hall, room, plate and ambient variants), and eight modulation effects (chorus, ensemble, flanger, phaser, rotary, vibrato, tremolo and auto-pan).
- Engines: selected Airwindows processors, Dragonfly hall/room/plate, Surge effects and its ChowDSP spring, plus a delay using ChowMatrix's diffusion algorithm. This is not the complete ChowMatrix plug-in or its node editor.
- Every new pedal has on-device controls and two starting presets. Values and bypass are saved independently in each of four scenes. Stereo Digital and Diffuse Echo offer beat divisions and tap tempo; delay time is limited to 2 seconds, including synced settings. Other Airwindows timing controls use the upstream normalised 0â€“100 scale.
- Native stereo signal paths and stereo cabinet IRs. Parallel joins and bypass align the 16-sample adapter delay of Surge/Spring processors. This does not compensate arbitrary latency inherent in imported models or IR contents. Model processing runs one instance per channel, increasing CPU use compared with alpha 04.
- Chromatic tuner using Cycfi Q BACF on the clean input, with note/octave, cents, A4 calibration from 430â€“450 Hz and optional output mute. Start ASIO in Audio setup, then press Tuner. Closing it restores the chosen master output. Supports single notes, not chords.

Validation: seven JavaScript suites; native tests for 22 effects at 44.1/48/96 kHz, stereo output, latency alignment, beat timing, stereo IRs, A2/LSTM playback and existing TONE3000/library regressions. The tuner passed 27 harmonic test tones within three cents and cleared after silence. Five stereo effects processed 2667 ms of audio in about 80 ms offline on this PC; this is not a real-time ASIO guarantee. Live guitar pitch tracking, listening quality and dropout tests still need Chris's interface.

Graph/asset edits still briefly restart audio on the saved ASIO configuration. Complete smoothing, spillover, MIDI, looper and recording are not finished. Old A/B mixer-junction patches are still refused by the native engine; use a current starter patch. Output has the existing gain ramp and ceiling.

The source and licences for this GPL-3.0-or-later build accompany the portable release. Third-party copyrights and their original licences are retained. No downloaded user captures or account credentials are included.

## 3 October 2026 — Audio callback robustness (source candidate)

- Removed the graph control monitor from rendering; native graph retirement waits only on the control thread.
- Publish complete scene snapshots per audio block and skip unchanged native effect parameter setters.
- Added small-buffer concurrency, disposal and coherent-scene regressions. Full-path audit records remaining EQ allocations, separate-output locking and incomplete timing telemetry.
- Mackie 32-sample regression remains unconfirmed by live hardware. No driver buffer/rate, DSP arithmetic or saved patch migration changed. Alpha 42 release folders remain intact.

## 3 October 2026 — Supplied patch timing and steady callback allocations

- Added an offline serial-patch profiler with per-stage and complete graph/output deadline statistics at 32/64/128 samples.
- Removed per-block enumerable allocations from unchanged legacy amp/cab EQ comparisons, preserving parameter comparison and DSP arithmetic; added zero-allocation steady render/output regression checks.
- Supplied patch loop allocation fell from 2,688,000 bytes to zero over seven seconds at 32 frames. Timing remains subject to scheduling; this does not establish a live driver fix.
- Existing logs show recent Mackie ASIO input routed to a separate BIG KNOB Windows output, adding buffering, plus repeated driver resets. Documented direct-ASIO comparison steps and unresolved cause in docs/AUDIO-ROBUSTNESS.md.

## 4 October 2026 — Source-only processing spike investigation

- Extended the offline serial-patch profiler with paired thread-cycle and elapsed timing, signal/silent subsets and slow-block evidence; no new live callback instrumentation or DSP changes.
- Recorded live 32/64-frame comparisons and repeated standalone offline runs. Near-normal thread work during some elapsed spikes supports scheduling interruption as a contributor; the responsible driver/process remains unproven.
- Added summary-pairing regression coverage. Existing portable Alpha 43 is preserved; this is a diagnostic source update, not a new app release.

## 4 October 2026 — Mackie ASIO output investigation

- Documented separate input/output channel naming and the Studio+ USB 3/4 cue return. Manufacturer ASIO playback silence remains under investigation; Windows playback success alone does not identify a converter or routing defect. No runtime change or new app release.
