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
