# Audio performance logging — Alpha 43

FreeRig automatically writes `audio-performance.jsonl` under `%LOCALAPPDATA%\GuitarSuite` (normally `C:\Users\chris\AppData\Local\GuitarSuite`). It is separate from the older `audio-diagnostics.log`, which records starts and faults. Open Alpha 43 or a matching source build; the preserved Alpha 42 executable does not contain this logger.

## Capture a useful session

1. Open Alpha 43 and start audio with your existing route, patch, rate and buffer. No settings are automatically changed.
2. Leave the rig running without playing for about a minute, then play for a minute. Note the times of audible interruptions.
3. Minimise the window for a minute and restore it. This records window state; it does not explicitly suspend WebView2.
4. Stop audio to flush the final measurement. Ask for a review of the local log; retain its `.1` backup too if present.

The assistant can read these local files with filesystem access. No automatic upload or GitHub commit occurs. The log contains driver/device names, endpoint identifiers, executable path, device IDs/capture names, scene parameters and routing; review these before sharing publicly. It contains no recorded audio, model weights or account tokens.

## Interpret the measurements

Each line is a JSON record. App start/close, audio start/stop, rig synchronisation and faults mark context. A sample is normally written roughly once per second while running, with actual `intervalMs` and a count of UI samples. Start records identify backend, channels, rate, output choices and buffer frames. Rig records identify enabled devices and scene settings.

| Field                                   | Meaning                                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `callbackPeakPercent`                   | Maximum of existing atomic load readings collected by the 100 ms host timer during the interval. Brief processing spikes are held until collected. Resetting the UI held peak does not erase this log. |
| `callbackLastPercent`                   | Most recent callback's measured load at snapshot time; not an interval average or whole-PC CPU percentage.                                                                                             |
| `missedDeadlines`, `newMissedDeadlines` | Existing session processing-overrun count and its delta since the previous record.                                                                                                                     |
| `outputDropouts`, `newOutputDropouts`   | Existing separate-output dropout counter and delta; not every possible driver/hardware underrun.                                                                                                       |
| `inputPeak`, `outputPeak`               | Maximum raw input hold and sampled output meter readings for the interval. Output is not a new full-rate detector.                                                                                     |
| `maximumUiTickGapMs`, `window`          | Largest observed host timer gap and window state at snapshot time. Delayed UI servicing does not establish a cause.                                                                                    |
| `logDropped`, `logFailures`             | Cumulative dropped diagnostics (bounded queue/oversized record) and file-write failures, not audio failures.                                                                                           |

Load is measured processing time divided by the audio block's deadline budget. At 48 kHz / 32 frames, the budget is 0.667 ms: 60% is about 0.40 ms; 350% is about 2.33 ms. The existing timer includes input/graph work and separate-output submission where used. It does not measure all direct-ASIO output-provider work or driver-arrival jitter. OS pre-emption can contribute to a peak. These records alone cannot blame WebView2 or a particular processor.

A silent guitar still passes through the live rig; inference, convolution, delays and modulation can keep consuming processing time. See [Audio robustness](AUDIO-ROBUSTNESS.md) for the unresolved live-driver investigation.

## Ownership and limits

The host reads each existing peak hold once, sharing the result between UI and logging. New allocations/serialization occur on the control/UI thread. A bounded queue sends records to a dedicated file writer; audio rendering performs no new I/O, logging, allocations or blocking operations. Logging still has a small system cost; it is not claimed to be free.

Rotation retains one backup (`audio-performance.jsonl.1`) at a 5 MiB cap per file. Oversized records are dropped. Old samples/context age out; session IDs distinguish restarts and route/scene summaries repeat in samples. File errors are contained without intentionally stopping audio. Closing waits at most two seconds for queued records; stalled storage can lose final records.

Offline tests cover draining, rotation and write-failure containment, alongside native audio regressions. Real idle/playing ASIO capture and audible dropout correlation still require the new build on the affected hardware.
