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

## Alpha 16 — React interface foundation (27 September 2026)

Run **releases/FreeRig-alpha-16/FreeRig.exe**. The normal pedalboard, device editor and hardware knobs now render through React and TypeScript. Right-click a device to edit, bypass, replace, duplicate with all scene settings, move between stages or remove. Empty slots have an Add menu. Shift+F10 opens the same menu; arrows navigate, Escape closes and restores focus. Ctrl+Z invokes Undo outside text fields. Dragging still leaves the editor closed. Menus, editor entry, bypass and device movement have lightweight animations that respect reduced-motion preferences.

This is the first migration stage. The native audio engine and saved-patch model remain the authority; collection, banks, advanced cable drawing and import/preset forms still use their existing handlers. React is bundled locally and needs no internet at runtime. Alpha 15 remains available. TypeScript build, 11 JS regression suites, full native offline self-test and browser interaction checks pass. No live ASIO playback was started. See docs/REACT-MIGRATION.md.

## Alpha 15 — imported pedal collection (27 September 2026)

Run **releases/FreeRig-alpha-15/FreeRig.exe**. Adds CloudSeed Space ambient reverb, EchoKing MkII tape echo, Photon Vibe and TriPhase Theorem, with 12 FreeRig starting presets. Find them under Reverb, Delay and Modulation. They work offline. Alpha 14 remains available.

The native ports add no dry-path buffering and do not change ASIO settings or NAM processing. Offline qualification passes at 44.1/48/96 kHz, including small blocks, parameter extremes, tails, stereo state and bypass/re-engagement. The full native regression and three JS suites pass. Browser checks confirm all four control panels and preset application. Live ASIO listening and worst-case scheduling are not certified by these offline checks. See docs/IMPORTED-EFFECTS.md for provenance and limitations.

## Alpha 11 — calibration, banks and performance workspace (27 September 2026)

## FreeRig Alpha 14 — 27 September 2026

The app is now FreeRig, using the supplied cream-and-orange SVG logo. Run **releases/FreeRig-alpha-14/FreeRig.exe**. Header, native window, status bar and user-facing import/export messages use the new name. Existing GuitarSuite storage folders, browser origin, patch formats and audio processing are preserved for compatibility.

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

# Guitar Suite — Windows Desktop Alpha 06

Run `GuitarSuite.exe` from the complete release folder. This is an actual x64 Windows application with native ASIO audio and a compiled NAM engine. Its interface is hosted in WebView2; it does not need a browser tab, Node or the preview server. Windows .NET Framework 4.8 and Microsoft Edge WebView2 Runtime are required (both are present on the development PC).

## First sound

1. Connect your guitar to your interface's instrument input and listen through that interface. Turn down physical monitoring volume for the first check.
2. Open **Audio setup**, select the manufacturer's ASIO driver, and press **Read channels**.
3. Select the guitar input, a stereo output pair and 48 kHz. Use **Driver / buffer settings** for the manufacturer's buffer control; begin at 128 or 256 samples.
4. Press **Start audio**. The default patch uses the included British crunch amp and a filtered cabinet. Silver Coast supplies the clean amp voice. These work without model downloads.
5. Raise **Master output** in Audio setup gradually towards **0 dB** if playback is quiet. Input/output meters show levels; a warning appears when output hits its ceiling. The master setting is remembered.
6. Driver, input, output and sample rate are remembered across dialog openings and launches. Choose them once in this update. Adding/removing/replacing gear automatically restarts running audio on the same interface, with a brief gap; audio stays stopped if rebuilding fails. Stop audio before changing hardware settings. Knobs, bypass and scenes update while running.

## Board and files

Four effects slots sit before the amp section and four after the cab section. Empty slots show a +; choose gear there or drag from the library. Amps and cabs stack vertically, with extra cabs inheriting parallel source/output connections. Drag gear to another slot to change its drawing position; cables remain the authoritative processing order. Drag off the board to remove, with Undo available; neighbouring cables reconnect. Existing larger rigs keep their overflow devices rather than discarding them.

Drag a library amp onto an existing amp to replace it in place. The selected device panel also has a **Replace with** picker: amps replace amps, cabs replace cabs, and pedals replace pedals. Cables, position and each scene’s bypass state remain; new device knobs reset to defaults, and the old model reference is removed. Undo restores the previous device and all its settings.

Click an amp and **Import NAM (.nam)** to load a local capture. Click a cab and **Import cab IR (.wav)** to load an impulse response. The app validates the file, copies it to `%LOCALAPPDATA%/GuitarSuite/Library`, and links it to that device. **Use built-in** restores the default engine. Set the device sample rate to the model's training rate shown after import; unsupported rate conversions are rejected, not silently played at the wrong speed. NAM model versions supported by the pinned official Core include WaveNet, A2 and LSTM (covered by smoke tests).

**Import patch** reads exported Guitar Suite JSON files (including older supported rig versions). This is not a converter for other vendors' preset formats. A `.nam` file is an amp/pedal model, not a complete multi-effect preset. Exported patches contain settings and references, not model/IR audio files: friends must import their own copies onto the relevant blocks. Four named scenes save per-device knobs and bypass states; wiring and assets are patch-wide.

## TONE3000 — alpha 04

Powered by [TONE3000](https://www.tone3000.com). Select an amp, cabinet or pedal, then **Browse TONE3000** in its editor. Continue to the official sign-in/catalogue window, enter your email and sign-in code there, and select a tone. Back in Guitar Suite, choose a model and press **Download and load**. A2 is selected initially; choose A1 or Custom before browsing for those models. Cabinet browsing filters for WAV IRs. Amp + Cab captures already contain cabinet colour; bypass a separate cabinet if appropriate for your rig.

The built-in publishable app key was supplied by Chris; it is not a secret. Each person signs into their own account. OAuth uses PKCE S256 and random state; the native callback is intercepted at https://guitarsuite.local/tone3000/callback, so no listener or external server is required. If redirect restrictions are configured in TONE3000 settings, register that exact address. The live preflight accepted this key/address and redirected to TONE3000 sign-in on 26 September 2026. Chris confirmed the sign-in and individual download flow works in alpha 03.1. Whole-pack downloads and playback switching in alpha 04 still need a live account/hardware check.

Access and refresh tokens remain in native code and are encrypted for the Windows user at %LOCALAPPDATA%/GuitarSuite/tone3000-session.bin. Disconnect removes those saved API tokens; it does not sign out of TONE3000 browser cookies or delete downloaded models. Tokens are not included in exports, screenshots, logs or release packages. Tokens are sent only to the exact official API origin; external download redirects receive no Authorization header.

Each downloaded model is size-limited and validated by NAM Core before it is saved or attached to the rig. Files and an attribution/licence sidecar live in the local Library. No downloaded captures are bundled with the release. Tone metadata and creator attribution appear in the editor; tone artwork and TONE3000 origin appear in the block. The Browse variants button reopens available remote variants. Downloaded audio files work offline; browsing and remote artwork need a connection. Exports contain references and attribution, not downloaded files or account details.

This first integration uses the official hosted Select flow for browsing, favourites and account sign-in. It does not implement a second searchable remote catalogue. Pedal captures use the dedicated Capture Pedal block with input/output trims. API reference/design requirements: https://www.tone3000.com/api ; terms: https://www.tone3000.com/api/terms . Official logos are included unchanged from the provided branding bundle and remain TONE3000 trademarks. No partnership or certification is claimed.


### Saved devices and packs

- **Download and load** saves the chosen model to Devices and loads it onto the selected block.
- **Save pack** saves all models listed for this tone and the selected architecture (A1, A2 or Custom); cabinet packs include all listed IRs. Change architecture and save again to merge additional models into the same device. This uses supported individual-model downloads, not the partner-only ZIP endpoint.
- Progress shows the current file. **Stop after current model** stops between files. Completed files remain available after cancellation/failure; retry skips already saved files. Requests are paced below the API rate limit.
- Drag the saved amp/cab/pedal from Devices onto an appropriate slot or existing device, or choose it in **Replace with**. The **Saved model** picker in its device drawer switches local files without another download. Knobs and scene bypass states remain; the model is shared across scenes within that instance. Models can require different audio sample rates.
- **Look** and **Colour** customise its enclosure. Appearance is saved as the library default for future instances; existing instances retain their own saved patch appearance.
- Removing a device from the board does not delete it from the library. Earlier alpha 03 attribution sidecars are recovered automatically. Missing files are marked unavailable.
- The local catalogue is stored in %LOCALAPPDATA%/GuitarSuite/Library/devices.json. It holds model references and attribution, not sign-in tokens. No captures are redistributed in the application.

## Current limits

- Early alpha: Chris reports audible but quiet playback through a Mackie Big Knob Studio+. Installed driver names are discoverable; hardware latency, sound quality, dropout behaviour and hot-unplug recovery require a listening session.
- Alpha 05 preserves stereo, including IR channels; adapter latency is aligned at joins. No general per-path pan control yet.
- Routing changes briefly stop/restart running audio so graphs/models can be rebuilt off the callback. Failed changes leave audio stopped and show an error. Scene/bypass changes have a short bypass fade; complete parameter smoothing, spillover and seamless changes are not finished.
- Old saved A/B splitter/mixer junctions remain visible and editable in the interface, but are explicitly refused by this first audio engine. Start with a fresh desktop patch or the example for audio testing.
- A bypassed parallel branch passes dry audio; adjust routing to avoid unwanted dry duplication. Multiple paths sum at unity before the final output trim and ceiling.
- Original legacy effects remain basic DSP implementations; the new named pedals use the bundled open-source engines. Amps are an adapted clean/crunch subset of Amplitron, not exact emulations of commercial hardware. Cabinet default is filtering, not a bundled measured IR. The six Guitarix additions run at 96 kHz internally; other algorithms retain their upstream rate handling.
- Master output adjusts from −30 to +12 dB, initially −12 dB, with a 10 ms gain ramp and a hard ceiling; this is not a mastering limiter. Meters show input and output peaks. 0 dB removes the original fixed attenuation.
- MIDI, recording/looper and WASAPI remain unimplemented; the chromatic tuner is implemented. Practice transport remains a visual preview.
- Unsigned portable folder release. No installer, updates, account or subscription.

## Build

From `native/`, run `bootstrap.ps1`, `build-nam.ps1`, then `build-effects.ps1`, then `build.ps1` in PowerShell. Downloads come from official GitHub/NuGet sources and stay under `native/deps/`; no compiler installation is required. The scripts use the existing .NET Framework compiler. NAM uses a pinned portable LLVM-MinGW build; `GuitarNam.dll` statically includes its C++ runtime.

`GuitarSuite.exe --self-test [model.nam ...]` writes `self-test.txt` beside the executable. Tests cover distinct amp voices, a full effects chain, invalid-cycle rejection, live scene updates, WAV IR convolution, and optional NAM model files. Run JS model tests from `prototype/` with Node. ASIO callback hardware tests remain outstanding.

## Sources and licensing

- Amplitron amp model parameters / shaping, adapted to C#: https://github.com/sudip-mondal-2002/Amplitron/tree/18d0afc9b68ce474e8c3b445ee13d88359f83425 — MIT, Sudip Mondal 2026. Clean American and British Crunch voices supply the default amps. Original three-band shaping and envelope/sag concept retained; controls, graph integration and gain scaling adapted.
- NeuralAmpModelerCore: https://github.com/sdatkinson/NeuralAmpModelerCore/tree/0b3d3c97b0859a3a8c92a8628c4dd89a25eb5842 — MIT, Steven Atkinson. Built with A2 fast path and float samples.
- NAudio 2.2.1: https://github.com/naudio/NAudio/tree/v2.2.1 — MIT, Mark Heath.
- Eigen at the NAM submodule revision — MPL-2.0 and notices included in `licenses/`; unmodified header source included as `source/Eigen-source.zip` in release folders.
- nlohmann/json 3.12.0 — MIT, Niels Lohmann.
- LLVM-MinGW 20260922 C++ runtime — Apache-2.0 with LLVM exceptions and bundled notices.
- Microsoft.Web.WebView2 1.0.2903.40 — Microsoft SDK redistributable licence included. The separately installed WebView2 Runtime is provided by Microsoft.

Alpha 05 additionally bundles selected Airwindows, Dragonfly, Surge and ChowMatrix-derived code, Cycfi Q and supporting libraries. See vendor/README.md and the release licences.
