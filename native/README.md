# Guitar Suite — Windows desktop alpha

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
- Drag the saved amp/cab/pedal from Devices onto an appropriate slot or existing device, or choose it in **Replace with**. The **Saved model** picker in its lower details panel switches local files without another download. Knobs and scene bypass states remain; the model is shared across scenes within that instance. Models can require different audio sample rates.
- **Look** and **Colour** customise its enclosure. Appearance is saved as the library default for future instances; existing instances retain their own saved patch appearance.
- Removing a device from the board does not delete it from the library. Earlier alpha 03 attribution sidecars are recovered automatically. Missing files are marked unavailable.
- The local catalogue is stored in %LOCALAPPDATA%/GuitarSuite/Library/devices.json. It holds model references and attribution, not sign-in tokens. No captures are redistributed in the application.

## Current limits

- Early alpha: Chris reports audible but quiet playback through a Mackie Big Knob Studio+. Installed driver names are discoverable; hardware latency, sound quality, dropout behaviour and hot-unplug recovery require a listening session.
- Mono processing, duplicated to two ASIO outputs. Stereo IRs are downmixed. No stereo panning or latency compensation yet.
- Routing changes briefly stop/restart running audio so graphs/models can be rebuilt off the callback. Failed changes leave audio stopped and show an error. Scene/bypass changes have a short bypass fade; complete parameter smoothing, spillover and seamless changes are not finished.
- Old saved A/B splitter/mixer junctions remain visible and editable in the interface, but are explicitly refused by this first audio engine. Start with a fresh desktop patch or the example for audio testing.
- A bypassed parallel branch passes dry audio; adjust routing to avoid unwanted dry duplication. Multiple paths sum at unity before the final output trim and ceiling.
- Built-in effects are basic DSP implementations. Amps are an adapted clean/crunch subset of Amplitron, not exact emulations of commercial hardware. Cabinet default is filtering, not a bundled measured IR. No oversampling in this alpha.
- Master output adjusts from −30 to +12 dB, initially −12 dB, with a 10 ms gain ramp and a hard ceiling; this is not a mastering limiter. Meters show input and output peaks. 0 dB removes the original fixed attenuation.
- MIDI, tuner, recording/looper and WASAPI remain unimplemented. Practice transport remains a visual preview.
- Unsigned portable folder release. No installer, updates, account or subscription.

## Build

From `native/`, run `bootstrap.ps1`, `build-nam.ps1`, then `build.ps1` in PowerShell. Downloads come from official GitHub/NuGet sources and stay under `native/deps/`; no compiler installation is required. The scripts use the existing .NET Framework compiler. NAM uses a pinned portable LLVM-MinGW build; `GuitarNam.dll` statically includes its C++ runtime.

`GuitarSuite.exe --self-test [model.nam ...]` writes `self-test.txt` beside the executable. Tests cover distinct amp voices, a full effects chain, invalid-cycle rejection, live scene updates, WAV IR convolution, and optional NAM model files. Run JS model tests from `prototype/` with Node. ASIO callback hardware tests remain outstanding.

## Sources and licensing

- Amplitron amp model parameters / shaping, adapted to C#: https://github.com/sudip-mondal-2002/Amplitron/tree/18d0afc9b68ce474e8c3b445ee13d88359f83425 — MIT, Sudip Mondal 2026. Clean American and British Crunch voices supply the default amps. Original three-band shaping and envelope/sag concept retained; controls, graph integration and gain scaling adapted.
- NeuralAmpModelerCore: https://github.com/sdatkinson/NeuralAmpModelerCore/tree/0b3d3c97b0859a3a8c92a8628c4dd89a25eb5842 — MIT, Steven Atkinson. Built with A2 fast path and float samples.
- NAudio 2.2.1: https://github.com/naudio/NAudio/tree/v2.2.1 — MIT, Mark Heath.
- Eigen at the NAM submodule revision — MPL-2.0 and notices included in `licenses/`; unmodified header source included as `source/Eigen-source.zip` in release folders.
- nlohmann/json 3.12.0 — MIT, Niels Lohmann.
- LLVM-MinGW 20260922 C++ runtime — Apache-2.0 with LLVM exceptions and bundled notices.
- Microsoft.Web.WebView2 1.0.2903.40 — Microsoft SDK redistributable licence included. The separately installed WebView2 Runtime is provided by Microsoft.

Other investigated options: Airwindows (MIT, many amp/cab DSP designs), Open Riff Box (GPLv3, larger complete suite), Rustortion (MIT, Rust engine with separate IR permissions), and AmpForge. They are not bundled in this alpha. The Amplitron subset plus official NAM Core minimises unrelated framework integration while retaining model import.
