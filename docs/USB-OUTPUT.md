# Current listening result — 27 September 2026

Chris confirms USB Powercab playback works but feels too delayed for playing even with a 5 ms output request. This route is not qualified for live use. No buffer-request value represents measured total round-trip latency. The established low-latency baseline remains Mackie ASIO at 32 samples. Analogue output from that interface to Powercab avoids the app's separate-USB queue, but needs its own physical listening/latency check.

# Separate output devices

## Mackie input to Powercab USB

1. Close the earlier Guitar Suite build and open alpha 10.
2. Open Audio setup. Keep Mackie ASIO Driver and the existing guitar input, 48 kHz, with 32 samples in the Mackie panel.
3. Set Output device to Speakers (2- Powercab 112 Plus).
4. For the fastest requested output setting, choose Exclusive output and 5 ms. If another app holds the device, close its playback or use shared mode. Larger output buffers give more scheduling headroom.
5. Start audio. Master output controls this destination. Stop before changing routes; Start applies the saved choices.

To return to the prior route, choose Same ASIO interface (lowest delay), select the ASIO output pair, and restart audio. Separate mode does not also play through the Mackie output. Refresh outputs re-enumerates Windows playback endpoints; disconnected selections are retained and fail explicitly on Start.

Powercab should use Flat/FRFR with an app cabinet IR. If using its speaker modelling, bypass the app cabinet to avoid applying both. USB processing settings are covered in the [Line 6 Powercab manual](https://line6.com/data/6/0a020a4107835d2fac0e63b03/application/pdf/Powercab%20Manual%20-%20English%20.pdf).

## Timing and audio quality

Mackie and Powercab have independent clocks. Separate mode uses a bounded stereo queue and NAudio/WDL's 64-tap sinc resampler with slowly varying rate correction capped at +/-0.2%. The queue targets at least twice the requested output duration and accommodates the endpoint's actual read size. Startup/recovery fades in over 5 ms. This is additional output latency: selecting 5 ms does not mean 5 ms guitar-to-speaker latency. WASAPI/Windows may also convert sample rate or bit depth to a supported endpoint format. The tested Powercab accepts 48 kHz stereo float32 in shared mode and PCM16 in exclusive mode. Nothing changes the loaded NAM model or its quality selection, but the separate output transport is not a sample-identical pass-through. Direct ASIO output bypasses this extra queue/resampler entirely.

Production capture buffers remain matched to the actual ASIO frame count. ASIO only copies processed output into the queue. Resampling and Windows playback run on the output thread. A brief lock protects queue copies; no device playback wait or resampling runs under that lock. Queue underflows/overflows are counted and shown in workspace warnings. An unexpected output stop reports an error and stops audio on the UI timer. Unexpected ASIO reset still requires restart.

## Verification

- `--output-test`: nine simulated 60-second runs at 44.1/48/96 kHz with +/-500 ppm drift and 32-sample producer chunks. Checks finite audio, channel relationship, no dropped blocks, bounded queue, initial silence and overflow bounds. These are deterministic simulations, not real driver latency measurements.
- `--outputs`: enumerates endpoints without playback.
- `--output-check <endpoint-id>`: initialises and disposes shared/exclusive playback at 48 kHz / 5 ms without starting playback. Both modes passed on the connected Powercab. This checks format acceptance, not live sound.
- Existing full native engine/capture/effect/import tests and eight JS suites passed.
- Actual Mackie-to-Powercab listening, live unplug/reconnect and round-trip latency remain to be checked by Chris. The app never starts audio automatically.

Pinned dependency: NAudio.Wasapi 2.2.1 (MIT), alongside the existing NAudio.Core/Asio 2.2.1. See [the pinned WASAPI implementation](https://github.com/naudio/NAudio/blob/v2.2.1/NAudio.Wasapi/WasapiOut.cs) and [WDL adapter](https://github.com/naudio/NAudio/blob/v2.2.1/NAudio.Core/Wave/SampleProviders/WdlResamplingSampleProvider.cs).
