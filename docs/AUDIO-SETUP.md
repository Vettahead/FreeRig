# Audio setup

Open Alpha 21 and choose **Audio setup**. Audio starts only after **Start audio**. Stop before changing devices, channels, sample rate or driver settings. Input trim and master output remain on the routing workspace.

## Choose a route

- **ASIO:** select the manufacturer's driver when available. Channel names load on selection; Read channels refreshes them. Choose the guitar input and stereo output pair. Same ASIO interface avoids the separate Windows output queue. Driver / buffer settings opens the driver's own panel. FreeRig does not change its hardware buffer automatically.
- **Windows audio:** choose a recording endpoint, guitar channel and playback endpoint. Shared-mode WASAPI input accepts devices without ASIO drivers. Windows handles sample-format/rate conversion to the chosen processing rate. Output can be shared (default) or exclusive if supported and not occupied by another app.
- **Universal ASIO:** an installed, registered driver such as FlexASIO appears in the ASIO list. FreeRig does not install or configure it automatically. FlexASIO defaults to DirectSound with a preferred 20 ms buffer; consult its [configuration guide](https://github.com/dechamps/FlexASIO/blob/master/CONFIGURATION.md) for an appropriate backend and buffer. Compatibility and performance require testing with the actual hardware.

Refresh devices after connecting hardware or installing a driver. Saved missing endpoints remain marked unavailable; FreeRig does not silently switch to another microphone or speaker. Choices are saved when Start is pressed. Existing ASIO preferences migrate without resetting the selected driver, channels or rate.

## Latency and troubleshooting

Windows capture requests 10 ms packets and feeds the engine in 128-frame blocks. The block size shown in status is processing granularity, **not** the hardware capture buffer or total latency. A partial processing block waits for the next capture packet. The separate-output queue, drift correction, Windows conversion and hardware add delay. Output settings of 5/10/20 ms are requests, not round-trip measurements. Use the interface's own ASIO input and output for the best chance of responsive live playing.

If capture cannot start, check Windows **Privacy & security → Microphone → Let desktop apps access your microphone**, then check that the selected device is connected and enabled. If exclusive output fails, stop other apps using it or disable exclusive output. Missing ASIO channels require Read channels or driver re-selection after reconnecting. Check physical instrument/Hi-Z mode and gain before increasing input trim.

FreeRig takes a mono guitar input and produces stereo output. This release is not a multichannel recording mixer. Windows audio support does not guarantee that Bluetooth or every USB combination will have usable guitar latency.

## Verification

The offline suite tests selected-channel isolation for 1/2/8-channel float packets, changing packet sizes, continuity through 32/64/128-frame blocks, invalid samples and packet validation. Existing graph, scene, capture calibration and effect regressions remain required. `FreeRig.exe --inputs` enumerates capture endpoints without recording. `node scripts/audio-ui-preview.cjs` serves a development-only mock at localhost:4322; Start in that fixture never opens hardware. It is not packaged in the desktop UI.

Browser testing checks ASIO discovery, Windows selection, explicit start/stop, locked settings while running, remembered choices, missing endpoints, refresh and dismissal. Real WASAPI, manufacturer ASIO and FlexASIO playing tests on several interfaces are still needed before claiming broad live-use qualification.

## Proposed follow-up: play-along input

Mix a separately captured stereo backing source after the guitar effects, with its own gain, mute and meter, before the final output ceiling. Keep buffering/resampling off the guitar callback's critical path and do not make guitar output wait for backing audio. Correct clock drift and supply silence when the backing source pauses. Prevent selecting FreeRig's final output as its own loopback source.

WASAPI endpoint loopback requires a shared-mode source; the final guitar output may independently use ASIO or exclusive WASAPI. Muting a Windows source can silence its capture on some systems, so do not promise a muted-speaker workaround. Protected content and driver behaviour may limit capture. See [Microsoft loopback recording](https://learn.microsoft.com/en-us/windows/win32/coreaudio/loopback-recording) and [NAudio's loopback guide](https://github.com/naudio/NAudio/blob/main/Docs/WasapiLoopbackCapture.md).

This is a design proposal, not implemented in Alpha 21. A hardware version could prioritise USB audio-in and optionally offer Bluetooth for backing tracks; live guitar monitoring should remain local. PipeWire alone is not a guarantee of low latency: the device graph, scheduling and hardware still require measurement.
