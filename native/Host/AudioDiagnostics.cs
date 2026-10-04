using System;
using System.Diagnostics;
using System.Linq;
namespace GuitarSuite
{
    sealed partial class MainWindow
    {
        AudioPerformanceLog performanceLog;
        readonly Stopwatch diagnosticClock = Stopwatch.StartNew();
        readonly string diagnosticSession = Guid.NewGuid().ToString("N");
        long diagnosticLastTick, diagnosticLastRecord;
        float diagnosticLoadPeak, diagnosticInputPeak, diagnosticOutputPeak;
        double diagnosticMaxUiGapMs;
        int diagnosticOverruns, diagnosticOutputDrops, diagnosticSamples;
        bool diagnosticRunning;
        object diagnosticRoute;
        void PerformanceEvent(string kind, object details)
        {
            if (performanceLog != null)
                performanceLog.Enqueue(json.Serialize(new {
                    schema = 1, utc = DateTime.UtcNow.ToString("o"), session = diagnosticSession,
                    elapsedMs = diagnosticClock.ElapsedMilliseconds, kind = kind, details = details
                }));
        }
        void PerformanceStart(object route)
        {
            diagnosticRoute = route;
            diagnosticOverruns = audio.Overruns;
            diagnosticOutputDrops = audio.OutputDropouts;
            diagnosticLastRecord = diagnosticClock.ElapsedMilliseconds;
            diagnosticSamples = 0;
            diagnosticLoadPeak = diagnosticInputPeak = diagnosticOutputPeak = 0;
            diagnosticMaxUiGapMs = 0;
            diagnosticRunning = true;
            PerformanceEvent("audio-start", new { route = route, bufferFrames = audio.BufferSize });
            PerformanceRig();
        }
        void PerformanceRig()
        {
            if (patch == null || patch.blocks == null)
                return;
            var states = patch.scenes[patch.scene];
            PerformanceEvent("rig", new {
                scene = patch.scene + 1,
                devices = patch.blocks
                              .Select(b => new {
                                  id = b.id, key = b.key, capture = b.assetName,
                                  enabled = states.ContainsKey(b.id) && states[b.id].on,
                                  parameters = states.ContainsKey(b.id) ? states[b.id].values : null
                              })
                              .ToArray(),
                connections = patch.connections
            });
        }
        // Consume the SAME peak-hold reading as the UI; a second TakeLoad would lose evidence.
        // This measures the existing processing timer, not driver arrival jitter or process CPU.
        void PerformanceSample(float load, float input, float output, bool flush = false)
        {
            long now = diagnosticClock.ElapsedMilliseconds;
            if (diagnosticLastTick != 0)
                diagnosticMaxUiGapMs = Math.Max(diagnosticMaxUiGapMs, now - diagnosticLastTick);
            diagnosticLastTick = now;
            if (!audio.Running && !diagnosticRunning)
                return;
            diagnosticLoadPeak = Math.Max(diagnosticLoadPeak, load);
            diagnosticInputPeak = Math.Max(diagnosticInputPeak, input);
            diagnosticOutputPeak = Math.Max(diagnosticOutputPeak, output);
            diagnosticSamples++;
            if (now - diagnosticLastRecord < 1000 && audio.Running && !flush)
                return;
            int misses = audio.Overruns, drops = audio.OutputDropouts;
            PerformanceEvent("sample",
                             new { running = audio.Running,
                                   intervalMs = now - diagnosticLastRecord,
                                   uiSamples = diagnosticSamples,
                                   maximumUiTickGapMs = diagnosticMaxUiGapMs,
                                   callbackLastPercent = audio.CallbackLoad * 100,
                                   callbackPeakPercent = diagnosticLoadPeak * 100,
                                   missedDeadlines = misses,
                                   newMissedDeadlines = Math.Max(0, misses - diagnosticOverruns),
                                   outputDropouts = drops,
                                   newOutputDropouts = Math.Max(0, drops - diagnosticOutputDrops),
                                   inputPeak = diagnosticInputPeak,
                                   outputPeak = diagnosticOutputPeak,
                                   backend = audio.Backend,
                                   bufferFrames = audio.BufferSize,
                                   output = audio.OutputName,
                                   route = diagnosticRoute,
                                   scene = patch == null ? 0 : patch.scene + 1,
                                   window = WindowState.ToString(),
                                   tuner = audio.TunerEnabled,
                                   logDropped = performanceLog.Dropped,
                                   logFailures = performanceLog.Failures });
            diagnosticRunning = audio.Running;
            diagnosticLastRecord = now;
            diagnosticOverruns = misses;
            diagnosticOutputDrops = drops;
            diagnosticSamples = 0;
            diagnosticLoadPeak = diagnosticInputPeak = diagnosticOutputPeak = 0;
            diagnosticMaxUiGapMs = 0;
        }
    }
}
