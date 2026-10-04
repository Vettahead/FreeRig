# Processing spikes investigation — 4 October 2026

## Live observations

Three user-run Alpha 43 sessions used the same scene/rig, Mackie ASIO input/output and 48 kHz. Input levels were effectively silent. These numbers summarise the log snapshot taken for review, not all callbacks or a controlled statistical experiment.

| Run              | Duration  | Buffer    | New processing misses | Median latest-callback snapshot | Median interval peak | Maximum peak |
| ---------------- | --------- | --------- | --------------------- | ------------------------------- | -------------------- | ------------ |
| Visible          | 174.487 s | 32 frames | 17                    | 25.5%                           | 70.5%                | 381.6%       |
| Mostly minimised | 296.777 s | 32 frames | 20                    | 27.0%                           | 77.9%                | 207.6%       |
| Visible          | 284.773 s | 64 frames | 5                     | 25.0%                           | 52.0%                | 123.8%       |

The 64-frame run had roughly 82% fewer misses per minute than the first visible run. Minimising did not clearly reduce typical load and does not explicitly suspend WebView2. No logger failures/drops were recorded. Direct ASIO reports zero separate-output dropouts by definition; that does not establish zero hardware underruns.

## Offline investigation

The supplied serial patch matches the logged scene settings and ordering: gate, captured drive, captured amp, delay, loaded IR and bypassed room reverb. The developer-only `--profile-patch` command opens no driver or WebView window. Three initial elapsed-only runs reproduced sporadic 32/64-frame spikes despite normal whole-chain medians near 23–24%. Steady loops including warm-up allocated zero managed bytes and recorded no generation-0 collections. No live fault is attributed to GC from these results.

Extended the command with paired elapsed ticks and Windows thread-cycle counts, keeping the timing samples paired before percentile sorting. It reports source-signal versus source-silence subsets, and the three slowest blocks in each subset. Instrumentation is exclusively in the offline diagnostic; the live callback, audio arithmetic and public Alpha 43 package are unchanged.

Three additional standalone runs were performed **after** the UI/native checks and offline self-tests had completed. Earlier cycle runs that overlapped verification were excluded from the comparison below. All measured cases use 48 kHz, one second warm-up and six seconds of alternating 1.5-second signal/silence phases; offline execution is unpaced. Desktop/system background activity is not fully controlled.

| Buffer | Whole-chain median, runs 1/2/3 | Maximum load, runs 1/2/3 | Missed blocks, runs 1/2/3 |
| ------ | ------------------------------ | ------------------------ | ------------------------- |
| 32     | 23.8 / 23.8 / 23.6%            | 190.2 / 159.5 / 88.1%    | 4 / 2 / 0 of 9,000        |
| 64     | 23.4 / 23.2 / 24.0%            | 90.1 / 182.2 / 56.6%     | 0 / 3 / 0 of 4,500        |
| 128    | 22.8 / 22.8 / 22.7%            | 44.4 / 60.2 / 39.5%      | 0 / 0 / 0 of 2,250        |

In the first standalone 32-frame run, signal/silent whole-chain medians were 23.6/23.9%. The captured drive and amp each cost about 10% median; delay about 0.9%; the other stages were comparatively smaller. Stage runs are separate from whole-chain runs: their percentiles and spike times must not be added or treated as the same incident.

The slowest silent block in run 1 used **190.2% elapsed deadline budget** but only **1.16 times** the silent subset's median thread cycles. Run 2's slowest silent block used **159.5% elapsed budget** with **1.14 times** its median thread cycles. These elapsed increases greatly exceed the corresponding increase in measured work. Similar disparities appeared in individual stages, including the lightweight gate.

## Interpretation and next step

The evidence supports intermittent time spent away from executing this thread as a contributor, rather than a reproducible sustained DSP overload. It also shows that the measured normal silence path costs about as much as the signal path. It does not isolate every spike, rule out longer-tail behaviour, establish a specific driver/DPC cause, or show which external process competes for the CPU. The profiler has no WebView window, but other apps (including the stopped FreeRig desktop) remained present; it does not exonerate all browser/system interference.

[Microsoft's QueryThreadCycleTime guidance](https://learn.microsoft.com/en-us/windows/win32/api/realtimeapiset/nf-realtimeapiset-querythreadcycletime) explicitly warns against converting these counts into elapsed time. Counts here are relative work evidence only. Frequency changes, core migration, hardware accounting and query overhead limit interpretation; they are not a calibrated CPU-duration measurement.

Keep the user's chosen 64-frame route unchanged for subsequent live comparison. The next useful evidence is a short Windows scheduling/CPU trace during reproduction, capturing audio-thread context switches and driver interrupt/DPC activity, plus full callback/output and arrival-gap telemetry. The current log stops before all direct output-provider work and cannot distinguish late arrivals from processing overruns. No process-priority, affinity, power-plan or driver settings were changed, and no guessed DSP optimisation is presented as a fix.

Raw reports remain local under ignored `releases/diagnostics/alpha43-controlled-cycles-run*.txt`. Private models/exports and raw logs are not published. The summarised findings and diagnostic source are committed to GitHub. Native self-tests cover preservation of wall/cycle pairing and silence-subset reporting, alongside the existing audio regressions. No live ASIO listening or latency measurement was performed by the assistant.
