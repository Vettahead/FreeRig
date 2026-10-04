# Architecture

FreeRig has a Windows desktop host, a WebView2 interface and native audio processing. The interface describes a patch; the audio engine owns playback.

| Location               | Responsibility                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `ui/src`               | React board, selected-device editor, controls, context menus and setup wizard                      |
| `src/legacy/app`       | Existing patch state, undo, commands, picker, DOM bindings and bootstrap                           |
| `src/legacy/artwork`   | Cabinet geometry and hardware appearance                                                           |
| `prototype`            | Browser entry point, remaining focused legacy modules, styles and JS regression tests              |
| `effects/*.json`       | One human-readable presentation/preset definition per imported stock effect                        |
| `native/Model`         | Saved/message patch data and per-scene device state                                                |
| `native/Host`          | Window lifetime, trusted WebView messages and TONE3000 UI integration                              |
| `native/Services`      | Device library and TONE3000 account/download service                                               |
| `native/Audio`         | ASIO/Windows capture, graph handover, graph rendering, processors, calibration and separate output |
| `native/Interop`       | Managed declarations for the NAM and effects C APIs                                                |
| `native/effects_*.cpp` | Effect adapters, registration and exported C ABI                                                   |
| `native/Tests`         | Offline engine, capture, effect, buffer, output and service checks                                 |
| `native/vendor`        | Upstream DSP with provenance/licences; excluded from house formatting                              |
| `scripts`              | Deterministic generation, test and formatting entry points                                         |

## UI to audio

React uses the command adapter in `src/legacy/app/bootstrap.js`. Commands take undo snapshots, mutate patch state and render/synchronise through the existing path. `prototype/desktop-bridge.js` sends messages through WebView2. `native/Host/Messages.cs` validates the source and dispatches them. `AudioEngine` owns the driver; `LiveGraph` owns graph handover; `Graph` orders and combines processors.

Patch field names, device IDs, parameter ordering and scene storage are compatibility contracts. An appearance-only change should not modify DSP, trigger driver selection or alter capture gain.

## A deliberate compatibility boundary

The legacy app files are concatenated in `src/legacy/manifest.json` order. They still share classic-script lexical scope with existing integrations; they are not independent ES modules. This preserves load order and saved-state behaviour during the React migration. New features should use React components and explicit commands, not add more globals. Remaining legacy services can move behind typed interfaces incrementally.

## Pedal data

`effects_registry.cpp` is the single native key-to-factory table. Both loading and catalogue export use it. Native processors define parameter order, units, limits and latency. The native build exports `native/effects-catalogue.json`.

`scripts/build-effects.mjs` combines that exported data with `effects/index.json` and each descriptor. It rejects missing/duplicate effects and invalid preset lengths or ranges. It generates browser definitions and native factory presets from the same source. UI presentation cannot silently redefine a DSP parameter range.

## Audio invariants

Capture sample-rate conversion, input calibration, processing block sizes, bypass/tail behaviour and parallel latency alignment affect sound or feel. Preserve their maths and ordering during refactors. Build/allocate replacement processors before callback use. Do not introduce callback allocation, network/file access or blocking work. Offline tests verify numerical behaviour; live driver timing and playing feel require hardware checks.

Curated `defaults` are the initial playable values in native parameter order. They can differ from an upstream algorithm’s raw defaults, but must stay within its limits. The generator validates these alongside named presets.

## Audio setup boundary

`ui/src/audio/AudioSetup.tsx` owns the form; `useAudioSetup.ts` owns discovery/session messages and `types.ts` the UI contract. `NativeDesktop.prepareAudio` persists the chosen route and synchronises the patch/calibration before an explicit start. Old ASIO preferences without a backend field remain valid. Windows calibration keys use `WASAPI:<endpoint ID>` plus channel, so they cannot reuse an ASIO calibration accidentally.

`WindowsInput` requests shared-mode float capture through the existing NAudio dependency. `CaptureBlocks` selects one channel and carries partial packets into preallocated 128-frame blocks. Windows conversion handles endpoint format negotiation; the existing graph handles NAM model-rate conversion. Both backends call the same engine processing method. Windows input uses the existing drift-corrected separate-output queue; direct ASIO output does not gain this queue. Capture disposal joins the capture thread before graph disposal. No new dependencies were introduced.

## Play-along boundary

`ui/src/audio/PlayAlong.tsx` owns the dialog and `usePlayAlong.ts` its saved choice and host messages. `Host/PlayAlong.cs` handles explicit start/stop/level/discovery; status and errors are separate from guitar engine errors. `AudioEngine.PlayAlong.cs` owns capture lifetime and routing validation. An audio session generation invalidates direct-ASIO confirmation after restart.

`PlayAlongInput` captures shared endpoint stereo float using existing NAudio. Its capture callback copies into `StereoFifo`; a worker drains that queue, performs WDL clock correction via `ClockedOutput`, and fills a second FIFO. Only the worker owns the resampler. `LiveProvider` reads ready samples through `BackingMixer` without locks, waits or allocations, adding stereo backing after the graph and before master gain/ceiling. Queue starvation supplies silence. Independent gain/mute use 5 ms smoothing. Stop joins capture/worker on the control thread; the retained managed mixer safely drains/fades. Backing resampling preserves peaks until final summing protection; separate final output retains its existing ceiling.

No patch/scene keys, effect arithmetic or native DSP binaries change. Backing settings are global local preferences, not patch state. No audio is saved or uploaded.

## Floating-point headroom

`Processor` and `StereoProcessor` preserve finite samples above full scale; clipping between devices would permanently alter the waveform before later gain or cabinet stages. Intentional effect nonlinearities remain part of their sound. `LiveProvider` retains final protection and publishes pre-ceiling overload peaks through `PeakHold`. `OutputHeadroom.tsx` holds the warning and invokes the compatibility adapter's master-only correction when clicked; it never changes capture input, calibration or patch values. Final protection uses OutputLimiter: stereo-linked instantaneous peak reduction with an 80 ms exponential release, after backing summing and master gain. It adds no buffering, allocation or locks. Signals below the 0.95 ceiling pass unchanged when its gain has recovered. Sustained overload changes dynamics; this is not automatic loudness normalisation. The existing clipped message flag continues to report pre-protection overload for compatibility, while the warning describes limiter activity.

## Circuit amps and cabinet bank

Tamgamp adaptation lives in `native/effects_tamgamp.cpp`; recorded cabinet processing is split between `effects_cabinets.cpp` and `cabinet_convolution.h`. `scripts/build-cabinet-data.py` reproducibly embeds the original CC0 bank. The React cabinet editor uses the existing scene parameter command contract. See [models and invariants](CIRCUIT-AMPS-AND-CABS.md).

## Release metadata

`release.json` and `CHANGELOG.md` feed `scripts/build-release.mjs`. Its generated JSON is bundled by the focused React `ui/src/release-history/ReleaseHistory.tsx` component. The native build writes the same version to `release-version.txt`, read by the window title. Packaging validates these contracts. See [release workflow](RELEASING.md).

## Callback publication

LiveGraph has one audio reader. Atomic graph announcement/recheck protects native lifetime; only the control thread waits for retirement. Graph publishes complete prepared scene snapshots in one array, read once per block. Rendering takes no control monitor. See [the robustness audit](AUDIO-ROBUSTNESS.md) for remaining callback allocation, separate-output contention and timing limits.
