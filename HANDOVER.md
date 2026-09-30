## 30 September 2026 — Alpha 38: editor inside the rig

Replaced the full-window modal/backdrop with an in-workspace expansion. Board and editor exchange within the chain shell with slide/scale/fade and height transitions. Selected overview device toggles back to the board; Escape, Close and existing outside-background dismissal remain. No focus trap; toolbar/library stay usable. Duplicate main-level pair hides while editor levels are present. No audio processing changes.

Release target: releases/FreeRig-alpha-38/FreeRig.exe with matching source/portable archives. npm run check passes all 15 tests and desktop build passes. Browser verified selected-device toggle back to board, switching devices, Escape, main/chain level visibility and amp-source filter exclusions. Modelled keeps circuit amps; TONE3000 only removes stock amps; All restores them. No downloaded packs were available in the browser fixture, so real-account browsing was not tested. Source filter is shared by Collection/replacement picker and leaves other categories unaffected. No live ASIO test. Local handover retained.

## 30 September 2026 — Alpha 37: main rig level dials

Reused the React LevelDial on the main page, replacing the long sliders. Surface-specific IDs keep editor and rig controls distinct. Hidden transport-owned controls remain the compatibility source; RigLevels mirrors their warning and both views observe the same levels/meters. Calibration and load controls remain visible. No native or DSP changes.

Validation: npm run check passes 15 tests; desktop build passes. Browser verified main input changes appearing in the editor, editor output changes appearing on the rig, old sliders hidden, no console errors and no horizontal page overflow at 1280×720. Screenshot: docs/screenshots/alpha37-levels.png. Live audio/meter response not tested. Release target: releases/FreeRig-alpha-37/FreeRig.exe and matching portable/source archives. Local handover retained.

## 30 September 2026 — Alpha 36: slide-up device editor

Added a focused React editor drawer with animated entrance/exit, dimmed rig backdrop, compact device strip and input/output dials with adjacent meters. Dials reuse the existing input-trim/master-output controls and native metering; no extra gain stage or audio arithmetic changes. Existing editor/overview DOM hosts are retained to preserve delegated events. Outside click, Escape and Close dismiss; keyboard focus stays within the panel, reduced motion is respected, and smaller windows scroll internally.

Validation: npm run check (15 tests) and desktop build pass. Browser verified outside-coordinate click, Close/Escape, device switching/replacement, parameter persistence after reopening, and both level controls updating their existing workspace counterparts. Layout checked at 1920×1080 and 1280×720 with no horizontal page overflow; no console errors observed. Screenshot: docs/screenshots/alpha36-editor.png. Live ASIO listening and live meter response were not tested; audio engine unchanged. Release target: releases/FreeRig-alpha-36/FreeRig.exe with portable/source archives. Local handover retained.
## 30 September 2026 — Alpha 35: natural drag sway

Added a focused damped angular spring around the grab point, with gentler wide-head motion and immediate cursor tracking. Spring pauses at rest, cancels on release and respects reduced motion. Simulated movement verifies lean, overshoot, settling and cancellation; browser verifies loop drop without editor opening or console errors. npm run check and desktop build pass. Release target: releases/FreeRig-alpha-35/FreeRig.exe with source/portable archives. Audio unchanged; Mission Control unavailable, local handover retained.

## 30 September 2026 — Alpha 34: hardware pickup feedback

Added focused React hardware drag previews: original-size artwork and grab offset, lift shadow/tilt, source dimming, drop outline and place/replace/remove hints, short landing or cancel animation, reduced-motion support. Legacy adapter retains routing, drop/remove and click suppression. No DSP or native contract changes. Browser verified delay movement into the loop, pedal replacement and library amp replacement without opening controls, preview cleanup and no console errors. npm run check (15 tests) and desktop build pass. Release target: releases/FreeRig-alpha-34/FreeRig.exe and matching portable/source archives. Mission Control remains unavailable; local handover retained.

## 30 September 2026 — Alpha 33: effects loop above the rig

Moved the loop tray above the main rig in React DOM order, keeping its send/return labels underneath. Routing and DSP are unchanged. npm run check and desktop build passed. Browser verified adding Tape Echo to the upper loop, returning to routing, and placement without horizontal page overflow at 1920×1080 and 1280×720. Preview: docs/screenshots/alpha33-board.png. Release target: releases/FreeRig-alpha-33/FreeRig.exe with portable/source archives. Mission Control remains unavailable; local handover retained.

## 30 September 2026 — Alpha 32: complete hardware artwork coverage

Expanded the original six chassis to 26 shared assets covering every catalogue entry: eight amplifier families, eight pedal families and ten cabinet geometries. React owns family selection, control placement, saved-finish tinting and decorative thumbnails; a small static-markup bridge updates compatibility library/picker/overview hosts. Imported amp names can select a default family without overriding explicit saved looks. Actual processor parameter order/ranges, EQ faders, mic choices and scene/bypass contracts remain intact. All images are local. Source references and prompts: docs/HARDWARE-DESIGN.md and docs/hardware-artwork-prompts.json.

Validation: npm run check passes 15 tests including full catalogue × 20 appearance mappings, cabinet format uniqueness, explicit capture-look override and non-mutation. Desktop build and offline self-test pass. Browser exercised amp replacement, blackface/rectifier appearances, 4×10/8×10 cabinet selection, recorded mic choice, 12-control Phase Sweep numeric edit/scene recall/bypass, EQ faders/reset, picker thumbnails and four occupied positions per row. No horizontal page overflow at 1280×720. Final 1080p screenshots: docs/screenshots/alpha32-board.png and alpha32-amp.png. No live ASIO listening; DSP arithmetic and audio DLLs unchanged.

Release target: releases/FreeRig-alpha-32/FreeRig.exe plus portable/source archives. Previous releases preserved. Family-inspired illustrations are not 228 bespoke chassis or new audio models. Mission Control remains unavailable; local handover retained.

## 30 September 2026 — Alpha 31: four pedals per rail

Corrected the remaining two-column grid: every board now keeps four positions on one row, with closer spacing and more width assigned to pre/post boards. Narrow boards scroll horizontally rather than wrap. Cable anchor measurements include scroll offset. Audio processing and routing contracts unchanged.

Validation: npm run check (13 suites) and desktop build pass. Browser verified four loaded pre-amp pedals share the same row at 1920×1080 and 1280×720, with no horizontal page overflow at 1280. Preview: docs/screenshots/alpha31-board.png. Release: releases/FreeRig-alpha-31/FreeRig.exe and matching source/portable archives. Mission Control unavailable; local handover retained.
## 30 September 2026 — Alpha 30: short patch leads and realistic plug ends

Kept the Alpha 29 stage layout, increased pedal artwork size, tightened neighbour spacing and broadened board rails. Replaced perimeter wires and floating striped blocks with short curved leads, metallic right-angle plugs, collars and strain relief. Only occupied neighbours on the same rail receive a lead; blank slots have no sockets and row transitions are tucked beneath the board. Legacy SVG canvas margins and raster enclosure margins are accounted for in attachment positions. No audio or patch contracts changed.

Validation: npm run check passes all 13 suites; desktop build passes. Browser verified the final 1080p appearance, no horizontal overflow at 1280×720, pedal selection, slot movement and cable removal/reflow after moving a pedal to another rail; no console errors observed. Screenshot: docs/screenshots/alpha30-board.png. No DSP changes or live ASIO listening. Release target: releases/FreeRig-alpha-30/FreeRig.exe with portable ZIP and source. Mission Control remains unavailable; handover retained locally.
## 30 September 2026 — Alpha 29: connected pedalboards and amplifier station

Rebuilt the normal routing workspace as a before-amp pedalboard, central amp/cab stack (or appearance-selected combo), after-cab pedalboard and smaller attached FX-loop board. Rails, plugs and measured patch leads convey serial order; stage numbering states the actual amp → loop → cab order. Multiple cabinets retain parallel/summed routing. Combo appearance keeps cabinet/microphone processing separately editable and does not infer capture contents. See docs/PEDALBOARD-DESIGN.md for research, ownership and limits.

React presentation only; no native audio arithmetic, saved parameter keys, routing contracts or dependencies changed. Removed positional FLIP animation because it caused cable positions to retain intermediate coordinates after resize; layout observers now follow artwork sizing without an animation loop. The wider artwork catalogue remains the Alpha 28 scope.

Validation: npm run check (13 suites), desktop build and full offline self-test passed. Browser verified delay drag into the loop without opening controls, drop-on-device replacement, bypass, scene recall, amp editor, combo presentation, multiple cabinets and Advanced routing toggle. No horizontal page overflow at 1280×720 or 1536×864; smaller windows scroll vertically. 1920×1080 preview saved at docs/screenshots/alpha29-board.png. Both DSP DLLs match Alpha 28 byte-for-byte. No live ASIO listening performed.

Release target: releases/FreeRig-alpha-29/FreeRig.exe and portable ZIP with matching source. Previous releases preserved. Mission Control remains unavailable; local handover retained.
## 30 September 2026 — Alpha 28: first hardware artwork set

Added original image-generated amp, drive, delay, reverb and 2×12/4×12 chassis assets with React parameter/bypass overlays. Profile mapping is intentionally limited to British Bloom/JCM800, Moss Drive, Tape Echo, Open Space, unloaded default 2×12 and recorded Jester 4×12 cabinets. Custom finishes/formats use the existing renderer; switching back to a mapped factory look recognises its saved factory colour. Board shelves and spacing are cleaner; longer guides collapse below controls. No audio arithmetic, patch/native contract or dependency changes. See docs/HARDWARE-DESIGN.md for modular extension points, scope and generation prompts.

Validation: npm run check (13 suites), native formatting, desktop build and complete offline self-test passed (218 processors, 265 presets). Browser checked numeric edits/scene recall, bypass, selection, drag from after-cab into FX loop without opening the editor, mic selection, factory-appearance fallback/return and 1080p views. Smaller 1280×720/1536×864 windows remain scrollable; no horizontal overflow observed at 1536. Screenshots: docs/screenshots/alpha28-amp.png and alpha28-board.png. No live ASIO listening performed. First art set only; the wider catalogue and collection thumbnails still use previous designs.

Release target: releases/FreeRig-alpha-28/FreeRig.exe and portable ZIP with matching source. Existing releases preserved. Mission Control remains unavailable; local handover retained.

## 30 September 2026 — Alpha 27: complete in-app release history

Added a fixed bottom-left React version button and searchable offline changelog dialog with release navigation, keyboard focus restoration, Escape and outside dismissal. Backfilled Alpha 01–04 and 03.1 headings using the existing historical records; retained all later release and source-only notes. release.json is now the single current-version source for the UI and native window title. Native builds and packaging validate matching, current release history; AGENTS.md and docs/RELEASING.md require updates every version. No new dependencies or audio/patch arithmetic changes.

Validation: npm run check (13 suites), native formatting/build and complete offline self-test passed. Browser checks cover search for 03.1, oldest-release navigation, Enter/Escape/focus return and 1080p layout. Release target: releases/FreeRig-alpha-27/FreeRig.exe and portable ZIP with source; Alpha 26 preserved. Audio DLLs are identical to Alpha 26. Mission Control remains unavailable; local handover retained.

## 30 September 2026 — Alpha 26: circuit amps and recorded cabinets

Imported all 13 Tamgamp DK preamp channels with actual source controls, original arithmetic/tables and 96 kHz internal resampling. Added five cabinet/speaker configurations (two physical enclosure families) using 21 verified CC0 Jester Dyne recordings. React editor offers two real recorded setup selectors, blend, polarity and output, saved per scene. No continuous invented mic positions, full power-amp stage or ten unrelated cabinets claimed. All source/handbooks/WAVs/licences retained; see docs/CIRCUIT-AMPS-AND-CABS.md.

Cabinet processing uses a direct 256-sample head and FFT tail with zero added buffering. Histories remain running for 5 ms selection fades. Staggered FFT work reduces small-buffer spikes. At 32 samples, one warmed JCM800+Greenback run stayed within the callback deadline at 48/96 kHz; this is offline evidence, not an ASIO guarantee. Unchanged NAM arithmetic and user buffer preferences.

Validation: npm run check (13 suites), native formatting, effects/desktop builds and complete offline self-test passed (218 processors, 265 presets, 16 bypass cases). The bypass test now correctly expects the actual-rate delayed dry path for resampled amps. Independent audit passes all 18 new processors at 44.1/48/96 kHz and 1/17/32/64/127/4096 blocks, endpoint changes, cabinet stereo checks and all 21 WAV comparisons (max error 1.44e-6). UI tested mic selection, polarity, blend, independent scene recall, presets and source-specific AC30 controls/artwork at 1920x1080. No live listening performed.

Release: releases/FreeRig-alpha-26/FreeRig.exe and FreeRig-alpha-26-win-x64.zip, including matching source/licences. Next: user's monitor/ASIO listening feedback; additional independently licensed cabinet enclosures and full power-amp modelling remain future work. No Git remote configured; Mission Control external update remains unavailable, with handover saved locally.

## 30 September 2026 — Alpha 25: Studio, guides and DSP cost

Added a factory Studio tag/filter to 41 production-oriented effects without removing their effect categories or user tags. All 200 native descriptors now supply detailed playing/control guides; 156 retain original Airwindows developer notes. Legacy pedal descriptions expanded. React Quality / DSP cost filters work in the collection and replacement picker, with Light/Moderate/Heavy/Unmeasured groups and card badges. These are measured default-setting processing costs, not sound-quality ratings or worst-case performance guarantees.

Offline reference benchmark: 48 kHz / 128 frames, warmed five-run medians, 186 Light / 12 Moderate / 2 Heavy. Report and reproducible tool committed; no audio processing arithmetic changed. Fixed the UI build overwriting component CSS. Native version label advanced to Alpha 25.

Validation: npm run check (13 suites), native formatting, desktop build and full offline self-test pass. Self-test needed the normal Windows profile for DPAPI credential tests. Browser checks covered Studio, shared cost filters, replacement, descriptions and guides at 1920x1080 without horizontal overflow. Screenshot: docs/screenshots/alpha25-studio-guides.png. No live ASIO listening claimed.

Release target: releases/FreeRig-alpha-25/FreeRig.exe and FreeRig-alpha-25-win-x64.zip, including source/licences. See docs/EFFECT-BROWSING.md. Non-NAM amp and multi-mic cabinet research is in docs/AMP-CAB-RESEARCH.md: Guitarix/Tamgamp preamps, SwankyAmp architecture, real measured mic-position IR sets. Ten complete hardware-equivalent amps and ten qualified multi-mic cabinets are NOT implemented or promised as already sourced. Next: qualify licences/assets, port a representative amp with faithful controls, validate against references, then expand. Mission Control external update remains blocked; handover retained locally.
## 28 September 2026 — Alpha 24: 200 effects and tags

Expanded to 200 separately registered native effects: 156 pinned MIT Airwindows imports plus Centaur, ten-band EQ, manual/envelope wah, standalone studio pitch, granular/reverse delay, vocoder and a temporary stereo practice looper. Preserved existing pedal presets/keys. Added category/description search, source notes, EQ faders and looper buttons. Bird Treble Boost corrects the misleading Scream Drive display name without changing its DSP. Includes the earlier patch/device tags, optional propagation, captured-pedal level comparisons, combined-cab guidance and up/down strip bypass gestures.

Validation: npm run check (13 suites), native formatting, desktop/effect builds, complete offline self-test (200 effects, 242 presets, 11 graph bypass cases), and 1,800 effect/rate/buffer cases with parameter endpoints passed. Graphic EQ response, loop record/play/clear/auto-play and one-sample ClipOnly2 latency verified. React browser checks cover filters, search, EQ faders/scene recall/reset/bypass and looper commands; actual 1920×1080 DOM bounds checked. No live ASIO listening or physical-pedal equivalence claimed. Studio Pitch deliberately adds about 140 ms; labelled accordingly.

Release: releases/FreeRig-alpha-24/FreeRig.exe and FreeRig-alpha-24-win-x64.zip, with source and licences. Research/limitations: docs/EFFECTS-COLLECTION.md. No remote configured; Mission Control access remains unavailable, so this is the local handover. Next: user listening feedback, richer curated presets and advanced key-aware harmonisation/sidechain/persistent looping if wanted.

## 28 September 2026 — Tags, capture controls and strip bypass

Added modular React patch/device tags, explicit optional propagation, collection search and portable bank metadata. Added explicit NAM pedal level comparison, combined-cab bypass guidance and editor-strip up/down bypass gestures. No audio arithmetic changes. All 13 JavaScript suites and browser interactions pass; see docs/TAGS-AND-CAPTURE-LEVELS.md. Next: broad effect research and implementation requested by user, targeting roughly 200 distinct processors across all major families. Not yet packaged in a new release.

## 28 September 2026 — User's JCM Patch inspected

User supplied Desktop/FreeRig patch.json. Active Crunch scene has Fortin_TS9_1 at 0/0 dB, Jcm800 at +5.1 input/+6 output, Floaty Delay on, V30 IR at −3 dB and Dragon Room on. Jcm800 is an amp+cab capture: extra cab double-filters. Routing is a correct series chain. Synthetic saved-patch render measures TS9 pre-amp RMS drop 12.89 dB, post-amp drop 5.43 dB; extra IR raises RMS 21 dB (including its −3 dB trim). Exact graph/sequential parity through cabinet at 32/64/128; Dragon Room's random modulation prevents identical independent wet tails. No engine bypass bug demonstrated.

Added --audit-patch in focused SavedPatchAudit.cs, developer-only/no audio hardware. Separate releases/diagnostics/JCM TS9 comparison.json has four listening scenes: bypass/raw/+6/+12 dB pedal output, amp 0/−6 dB, extra IR/delay/reverb bypassed. All original assets/routing retained, original export untouched. These are explicit gain comparisons, not automatic calibration or a guaranteed hardware match. Alpha23 remains released; no DSP or app UI changes. Await user listening comparison. See docs/CAPTURE-FIDELITY.md.

Comparison copy placed on Desktop as FreeRig TS9 comparison.json. All four scenes render with exact sequential parity at 32/64/128; scene 4 is 0.86 dB louder than bypass post-amp on the synthetic chord. Required project checks, native formatting, desktop build and offline self-test pass. Original/compare reports are under releases/diagnostics; no live ASIO listening claimed.

## 28 September 2026 — Drive-before-amp investigation, not resolved

User reports stock Scream Drive and downloaded Tube Screamer sound wrong before an amp even at low gain. Scream Drive is actually Guitarix Screaming Bird. Local Fortin TS9 models 1/2/3 have no input/output dBu metadata. All three match generic NAM within 2.44e-7; all six stock drives and three TS9 captures followed by Hendrix 1959JMH + G12M IR match direct sequential processing exactly at 32/64/128. Stock drives are block-invariant at 44.1/48/96 kHz. New CLI audit supports stock keys or a same-folder pedal .nam filename; see docs/CAPTURE-FIDELITY.md.

No playback changes or new release made: do not present passing synthetic tests as a fix. User says first selected TS9 model and untouched default controls; library order confirms TS9_1. Asked user to Export the affected patch as Desktop/drive-test.json and confirm when saved. Need that actual patch to distinguish custom routing, gain staging and captured settings. Explained Input trim is not input clipping or a recreation of a captured pedal's physical Drive knob; default is 0 dB unity. Existing Alpha23 remains the released app. Required project checks, native formatting, desktop build and full offline self-test pass. Mission Control unavailable; local handover retained.

## 28 September 2026 — Alpha 23 capture fidelity and output headroom

Removed unintended ±8 floating-point clipping between devices, preserving hot capture waveforms until downstream attenuation. Intentional drive algorithms and final output protection remain. Added held pre-ceiling peak measurement and a React overload action that reduces only the saved master output. Unloaded cabinet blocks are labelled cuts-only, and capture editors distinguish head-only from amp+cab metadata.

Audited the two local Hendrix captures against a separate generic NAM build at 32/64/128 samples: maximum error 2.09e-7. Marshall Greenback/V30/Creamback IRs match independent direct WAV convolution within 5.85e-8. Six NAM/IR combinations match a separately constructed reference chain exactly at all three buffer sizes. Synthetic unity-gain chain peaks ranged 1.006–2.986, demonstrating possible output overload, not proving the user's live settings clipped. New headroom/bypass tests cover 44.1/48/96 kHz. See docs/CAPTURE-FIDELITY.md for reproducible commands and limitations. No model weights, NAM quality, sample-buffer setting or saved patch parameters were changed.

## 28 September 2026 — Alpha 22 play-along input

Added a React Play along toolbar dialog and independent stereo WASAPI loopback input. Backing volume/mute/meter sit after guitar effects and before the global master/ceiling. Two bounded SPSC queues isolate capture and worker resampling from the guitar callback. Source choices persist, connection does not; known output feedback routes are blocked and direct ASIO requires separate-device confirmation. Stopping guitar disconnects backing. No new dependencies or NAM/effects DLL changes.

Offline tests pass across 44.1/48/96 kHz and 32/64/128/4096-frame blocks, including independent mute, stereo summing, output protection, empty-source guitar equivalence, concurrent FIFO ordering and nine 30-second clock-drift simulations. Browser fixture checks cover connection, levels, mute, persistence, routing protection and stop/restart. These do not establish real-device loopback compatibility or live listening quality. See docs/PLAY-ALONG.md. No automatic capture, disk recording or audio upload.

## 28 September 2026 — Alpha 21 audio compatibility

Audio setup now lives in modular React files under ui/src/audio. Added Windows WASAPI shared input, selected-channel float packet assembly and the existing drift-corrected Windows output path; direct ASIO still avoids that queue. Endpoint choices persist on Start, ASIO channels load on selection, missing devices remain unavailable, and settings lock while running. No driver is installed automatically. Native model/effects DLLs are unchanged from Alpha 20.

Read docs/AUDIO-SETUP.md for timing and privacy limits. Offline packet/engine tests and all 12 JavaScript suites pass; browser fixture checks cover ASIO/Windows start/stop, saved channels, unavailable endpoints and the compact layout. Real Windows/ASIO/FlexASIO listening and round-trip measurements have not been performed. The initial sandbox self-test failed at Windows DPAPI user-profile access; the same full test passed outside the sandbox. Play-along loopback was discussed and recorded as a proposal, not implemented. Source remains canonical here; native/deps is a local junction to the existing cached toolchain and is excluded from Git.

## 28 September 2026 — Alpha 20 source refactor

Readable source now has native Model/Interop/Audio/Host/Services/Tests folders, ordered legacy UI compatibility modules, one descriptor per stock effect and a central native factory registry. Start at README, CONTRIBUTING and docs/ARCHITECTURE.md. AGENTS.md establishes modularity, useful comments and verification rules. All 12 JS suites and native offline self-tests pass; browser checks verified knob edits, contextual amp replacement and cabinet navigation. DSP maths/parameter definitions are preserved. Actual live ASIO listening was not repeated. Remaining React migration, clean-machine sharing checks, Powercab USB latency, live-use qualification and MIDI remain separate work.

## Alpha 19 — cabinet formats redrawn (27 September 2026)

Run **releases/FreeRig-alpha-19/FreeRig.exe**. Cabinet format is now separate from Hardware look in Device options: 1x10, 1x12, 1x15, horizontal 2x10/2x12, vertical 2x12, compact 4x10, straight/slant 4x12 and 8x10. All 20 finishes work with any format. The editor and thumbnails use the same scalable illustration, with circular speakers, individual enclosure proportions, grille cloth, piping, protective corners and feet. Cabinet adjustments sit alongside the enclosure.

The chosen format is saved in the patch and survives scene changes and model changes. Existing patches without an explicit format infer it from a recognised tone/model name, then fall back to the previous look's speaker count. Geometry is representative, not a manufacturer specification. Appearance does not replace the loaded IR or change its sound; collection format inference uses the tone title, while explicit format choices belong to patch instances.

TypeScript/native builds, cabinet geometry/patch-roundtrip and saved-device regressions pass. Browser checks cover four-speaker layouts, format switching and cabinet parameter editing. All ten silhouettes were visually reviewed. Audio processing and both DSP DLLs are unchanged from Alpha 18.

## Alpha 18 — setup wizard and header alignment (27 September 2026)

Run **releases/FreeRig-alpha-18/FreeRig.exe**. Setup wizard beside Collection walks through connections, ASIO inputs/outputs, buffer size, first-sound troubleshooting, TONE3000 sign-in/downloads and saving patches/scenes. It opens the existing setup screens, remembers the current step for this app session, supports Escape/outside-click dismissal and never starts audio automatically. TONE3000 offers a choice of compatible devices already in the patch. Empty rigs receive an explanation rather than a broken action.

Saved model labels/selectors now align with header buttons; long model names truncate inside the selector and controls wrap on smaller windows. TypeScript/build and browser checks pass, including audio/TONE3000 handoffs, step resumption and an extra-long model label with no header overflow. Native host change is version text only; DPI manifest retained, DSP DLLs unchanged. Live hardware and online authentication were not repeated for this interface-only update.

## Alpha 17 — display clarity and creator credit (27 September 2026)

Run **releases/FreeRig-alpha-17/FreeRig.exe** after closing the previous app. The desktop host now declares per-monitor DPI awareness so Windows does not bitmap-scale its interface on high-DPI screens. Text-bearing filter layers are removed and small labels use clearer sizes and weights. Downloaded captures show their creator name and avatar at the bottom-right of the device editor, visible with Device options closed; missing or unavailable avatars fall back to an initial.

TypeScript production build, native offline self-test and browser creator-credit checks pass. Embedded DPI manifest and release integrity are verified. Actual sharpness on the user's 4K display and movement between monitors still need a visual check after restart. Audio processing is unchanged; both DSP DLLs match Alpha 16. Alpha 16 remains available.

## Current release: FreeRig Alpha 16 — 27 September 2026

React/TypeScript owns the normal pedalboard, editor and knobs, with device context menus and animations. See docs/REACT-MIGRATION.md for architecture, build commands, checks and remaining areas. Alpha 15 effects are included; both DSP DLLs are unchanged. Run releases/FreeRig-alpha-16/FreeRig.exe. React bundle is local/offline. TypeScript, 11 JS suites, native self-test and browser interactions passed; no live ASIO session was started. Run JS suites from prototype with node --test *.test.cjs. Remaining migration areas: collection, bank/scene shell, import/setup forms and advanced cable drawing. Existing Powercab USB, live long-chain/scene and MIDI follow-ups remain.



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

# Current handover — alpha 06

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

# Previous handover — alpha 05

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

Build order: native/bootstrap.ps1, native/build-nam.ps1, native/build-effects.ps1, node prototype/generate-effects.cjs, native/build.ps1. Vendor source is checked in; no effect downloads needed. Rebuild effects after adapter changes; metadata generator rounds float ranges and defines UI defaults/presets. Native EffectsTests and prototype/effects.test.cjs cover additions. effects-ui.js and tuner.js connect to existing bridge; StereoEffects.cs owns native processors and per-channel models. Do not ship the preview as a playable app.

# Current update — alpha 04 saved TONE3000 devices

Canonical portable build: releases/GuitarSuite-alpha-04/GuitarSuite.exe and matching win-x64 ZIP. Chris confirmed alpha 03.1 sign-in/individual download functions. Alpha 04 adds durable DeviceLibrary.cs manifest with alpha 03 sidecar recovery, one device per tone, grouped model variants, cached downloads, pedal capture DSP, cancellable sequential pack saving, and saved custom enclosure styles/colours. Save pack covers the selected architecture only, clearly labelled; additional architectures merge into the same tone. Official ZIP endpoint remains partner-only.

UI modules device-shelf.js/css provide saved library cards, drag/replacement integration, offline Saved model selector and appearance controls. Deleting board instances retains library files. Scene knobs/bypass stay independent; model assets remain patch-wide per instance. Model switching uses the existing graph restart path and saved ASIO settings. Account tokens remain encrypted separately.

Validation: six JS suites pass; native tests cover library grouping/restart/dedup/missing files/legacy recovery, cached download, mocked auth/IR download, DSP, real A2 model playback and captured pedal comparison against raw NAM output. Browser fixture verified saved replacement, variant picker and custom amp appearance. No real account pack download or ASIO listening test performed in this turn. Next: Chris opens alpha 04, saves one pack and tries Saved model switching while playing. Earlier implementation history below is historical.

# Latest update — desktop alpha 03 / TONE3000

Canonical build: releases/GuitarSuite-alpha-03.1/GuitarSuite.exe and matching ZIP. TONE3000 implementation commit 2047d3b; follow-up sets TLS 1.2 explicitly. Alpha 03.1 is separate because alpha 03 was already open. The compiled native HTTPS preflight also passed. New native Tone3000.cs contains PKCE Select flow, encrypted DPAPI token store and refresh, scoped authenticated HTTP and streamed model download with native validation. ToneIntegration.cs connects it to the selected amp/cab; tone3000.js renders splash/model picker/creator and licence information and block artwork. Existing alpha 02 volume, saved ASIO settings, automatic restart and replacements retained.

Public client_id is embedded from Chris. No secret key. Callback https://guitarsuite.local/tone3000/callback is intercepted in separate TONE3000 WebView without native bridge. Live preflight returned 307 to /api/v1/select/signin/email, confirming key/callback accepted. Each user still must sign in; do not claim an authenticated connection or actual account download has been verified. Offline test transport covered encrypted storage/refresh and redirect credential isolation with actual fixture IR validation. Tests need normal Windows user profile (sandbox DPAPI fails).

Next: Chris closes old app, opens alpha 03, selects an amp/cab, Browse TONE3000, Continue, signs in via email code, picks tone/model then Download and load. Confirm actual model URL origin is accepted and playback works at model sample rate. App only permits initial model URLs under https://www.tone3000.com/api/v1/; public HTTPS redirects are followed without tokens off-origin. If real API provides another documented initial host, verify before changing that guard. Audio library at LocalAppData/GuitarSuite/Library; encrypted token file is outside releases. No captured models bundled. Pedal captures/custom catalogue/favourites UI are not implemented separately; hosted Select owns browsing.

Source/branding references and exact limits are in native/README.md. Preview server now exec session 93436 on port 4317 from staging; server whitelist includes TONE3000 assets.

# Latest update — desktop alpha 02

Canonical portable build: releases/GuitarSuite-alpha-02/GuitarSuite.exe (and matching ZIP). Alpha 01 remains untouched because Chris may be playing it. Close alpha 01 before opening alpha 02; select Mackie once in the new version. Alpha 02 saves driver/input/output/rate and master volume to the shared WebView local storage. Default master remains −12 dB; raise towards 0 dB to remove previous attenuation. Input/output meters and clipping indication added.

Graph edits while running now stop and restart using the active ASIO configuration; failures leave audio stopped. This is not seamless and has not been retested on hardware. Library-to-existing-device drops and the editor Replace with picker preserve target ID/cables/slot and each scene bypass state, reset knobs to the new device defaults, and clear old asset references. Undo restores snapshots. Moving an existing board device retains the existing slot-swap behaviour.

Chris reported hearing audio through Mackie Big Knob Studio+ but quiet everywhere; do not claim loudness resolved until he tests master output. Native master/ceiling tests, JS settings persistence/replacement tests passed, and browser picker was verified.

# Handover — 26 September 2026

Windows desktop alpha 01 + UI build 05 are ready. Canonical source: C:/Users/chris/Documents/GitHub/guitar-suite. The browser preview still runs from the staged Codex visualizations copy on port 4317. The standalone releases/GuitarSuite-alpha-01/GuitarSuite.exe needs no Node/server; it uses local WebView2 assets and C# ASIO/DSP plus GuitarNam.dll. No installer/remote Git repository yet.

User requested a tidy board: four + effect slots before amp, amp/cab area supporting multiple cabs, four after. slot-board.js assigns fixed drawing slots separately from cables, auto-inserts into a direct edge, creates additional cabs in parallel, and reconnects neighbours on remove. gear-drag.js invokes removal on pointer release outside the board; Escape/cancel is non-destructive; Undo restores snapshots. Existing overflow gear/junctions is preserved. Each patch has four named scenes.

Desktop code lives in native/. build.ps1 uses .NET Framework csc already on Windows. bootstrap.ps1 downloads pinned NuGet packages, a portable LLVM compiler, NAM Core and Eigen; no system toolchain installation. build-nam.ps1 compiles official NAM Core 0b3d3c97 with A2 fast path. Defaults adapt Amplitron clean/crunch MIT source 18d0afc9; other effects are basic local DSP. An on-device Import NAM or cab IR button uses native file picker, validates and copies files into LocalAppData/GuitarSuite/Library. JSON patches import separately; model assets are not embedded in exported JSON. Native state is stored in a separate WebView profile from the browser preview.

Tests passed: all three JS suites; browser plus insertion, additional cab, off-board drag removal; native full gate/compressor/drive/amp/cab/chorus/delay/reverb chain, distinct amp voices, live scene update, cycle rejection, WaveNet/A2/LSTM loading and known IR convolution. No physical interface/audio output was activated. Next must be user guitar/interface listening and latency/dropout checks. Audio is deliberately stopped at launch. ASIO drivers on the PC include PreSonus families, FM3 and Valeton; installed does not mean connected.

Important alpha limits: mono processing duplicated to stereo outputs; stereo IR downmix; adjustable output trim/ceiling; no oversampling, full smoothing, spillover, MIDI, tuner, TONE3000 or actual looper. Graph/asset changes stop audio. Legacy A/B saved junctions remain visually preserved but native Graph rejects them explicitly; fresh native starter patch has no legacy junctions. Models require matching sample rates unless Core supports resampling. Keep audio/advanced routing milestones open until hardware tested.

Full licence and source links are in native/README.md; release includes required notices and Eigen source archive. No imported NAM captures are bundled. Do not claim the engine is production ready or that ASIO hardware has been verified. Mission Control bb78c32c-d021-44ed-b02c-0cad6ae65576.

Live follow-up: Chris signed in and selected a tone in alpha 03, then got 'An error occurred while sending the request' at native token exchange. Alpha 03.1 explicitly enables TLS 1.2; a native .NET Framework GET auth preflight and POST to the token endpoint with a deliberately invalid diagnostic code both reached TONE3000 (307 and expected 400). Chris is retrying 03.1. Actual model download remains unverified.
