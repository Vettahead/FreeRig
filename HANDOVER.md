# Latest update — desktop alpha 03 / TONE3000

Canonical build: releases/GuitarSuite-alpha-03/GuitarSuite.exe and matching ZIP. Source commit pending at write time. New native Tone3000.cs contains PKCE Select flow, encrypted DPAPI token store and refresh, scoped authenticated HTTP and streamed model download with native validation. ToneIntegration.cs connects it to the selected amp/cab; tone3000.js renders splash/model picker/creator and licence information and block artwork. Existing alpha 02 volume, saved ASIO settings, automatic restart and replacements retained.

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
