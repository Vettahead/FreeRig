using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Script.Serialization;

namespace GuitarSuite
{
    // Developer-only render of an exported serial patch. The saved file and assets
    // remain untouched; no audio device is opened and no live guitar is recorded.
    static class SavedPatchAudit
    {
        sealed class Export
        {
            public Patch rig;
        }
        public static int Run(string path, string assets)
        {
            var lines = new List<string>();
            try
            {
                string json = File.ReadAllText(path);
                var serializer = new JavaScriptSerializer { MaxJsonLength = 4000000 };
                foreach (int frames in new[] { 32, 64, 128 })
                    foreach (string mode in new[] { "saved-on", "saved-off", "single-cab-on",
                                                    "single-cab-off", "neutral-on", "neutral-off",
                                                    "scene-0", "scene-1", "scene-2", "scene-3" })
                    {
                        var patch = serializer.Deserialize<Export>(json).rig;
                        bool storedScene = mode.StartsWith("scene-");
                        if (storedScene)
                            patch.scene = Int32.Parse(mode.Substring(6));
                        var pedal = patch.blocks.Single(b => b.key == "nampedal");
                        var scene = patch.scenes[patch.scene];
                        if (!storedScene)
                            scene[pedal.id].on = mode.EndsWith("-on");
                        if (!storedScene && !mode.StartsWith("saved"))
                            foreach (var b in patch.blocks.Where(b => b.key == "cab"))
                                scene[b.id].on = false;
                        if (mode.StartsWith("neutral"))
                            foreach (var b in patch.blocks)
                            {
                                if (b.key == "amp")
                                    scene[b.id].values = new[] { 0.0, 0, 0, 0, -6 };
                                if (b.key.StartsWith("fx-"))
                                    scene[b.id].on = false;
                            }
                        // This audit accepts only a single unbranched series chain. Build
                        // a separate sequential processor list to check graph execution.
                        var ordered = new List<Block>();
                        string atNode = "input";
                        while (atNode != "output")
                        {
                            var edge = patch.connections.Single(e => e[0] == atNode);
                            atNode = edge[1];
                            if (atNode == "output")
                                break;
                            if (ordered.Any(b => b.id == atNode))
                                throw new Exception("Cycle in audit patch.");
                            ordered.Add(patch.blocks.Single(b => b.id == atNode));
                        }
                        if (ordered.Count != patch.blocks.Length ||
                            patch.connections.Length != ordered.Count + 1)
                            throw new Exception("Audit requires a serial patch.");
                        var processors = new List<StereoProcessor>();
                        try
                        {
                            foreach (var b in ordered)
                            {
                                var processor =
                                    new StereoProcessor(b, scene[b.id], 48000, assets, frames);
                                processor.Update(scene[b.id], patch.tempo, patch.calibrationDbU);
                                processors.Add(processor);
                            }
                            using (var graph = new Graph(patch, 48000, assets, frames))
                            {
                                var graphNodes =
                                    (StereoProcessor[]) typeof(Graph)
                                        .GetField("nodes",
                                                  System.Reflection.BindingFlags.NonPublic |
                                                      System.Reflection.BindingFlags.Instance)
                                        .GetValue(graph);
                                var stageDifferences = new double[processors.Count];
                                var source = new float[frames];
                                var left = new float[frames];
                                var right = new float[frames];
                                double[] peaks = new double[processors.Count],
                                         energy = new double[processors.Count];
                                double difference = 0;
                                int samples = 0;
                                for (int at = 0; at < 96000; at += frames)
                                {
                                    for (int i = 0; i < frames; i++)
                                    {
                                        double t = (at + i) / 48000.0;
                                        source[i] =
                                            t < 1 ? (float)(.12 * Math.Exp(-t / .4) *
                                                            (Math.Sin(2 * Math.PI * 82.41 * t) +
                                                             Math.Sin(2 * Math.PI * 123.47 * t) +
                                                             Math.Sin(2 * Math.PI * 164.81 * t)))
                                                  : 0;
                                    }
                                    Array.Copy(source, left, frames);
                                    Array.Copy(source, right, frames);
                                    for (int p = 0; p < processors.Count; p++)
                                    {
                                        var processor = processors[p];
                                        Array.Copy(left, processor.Buffer, frames);
                                        Array.Copy(right, processor.Right, frames);
                                        processor.Process(frames);
                                        Array.Copy(processor.Buffer, left, frames);
                                        Array.Copy(processor.Right, right, frames);
                                        for (int i = 0; i < frames; i++)
                                        {
                                            peaks[p] =
                                                Math.Max(peaks[p], Math.Max(Math.Abs(left[i]),
                                                                            Math.Abs(right[i])));
                                            energy[p] += ((double)left[i] * left[i] +
                                                          (double)right[i] * right[i]) /
                                                         2;
                                        }
                                    }
                                    var actual = graph.Run(source, frames);
                                    for (int p = 0; p < processors.Count; p++)
                                    {
                                        var graphNode = graphNodes.Single(
                                            n => n.Block.id == processors[p].Block.id);
                                        for (int i = 0; i < frames; i++)
                                            stageDifferences[p] = Math.Max(
                                                stageDifferences[p],
                                                Math.Max(Math.Abs(graphNode.Buffer[i] -
                                                                  processors[p].Buffer[i]),
                                                         Math.Abs(graphNode.Right[i] -
                                                                  processors[p].Right[i])));
                                    }
                                    for (int i = 0; i < frames; i++)
                                        difference =
                                            Math.Max(difference,
                                                     Math.Max(Math.Abs(actual[i] - left[i]),
                                                              Math.Abs(graph.Right[i] - right[i])));
                                    samples += frames;
                                }
                                // Dragonfly Room modulates with random noise; independently
                                // constructed wet reverb tails need not be sample-identical.
                                // Assert parity before that stage, and throughout dry cases.
                                for (int p = 0; p < processors.Count; p++)
                                    if ((ordered[p].key != "fx-DragonRoom" ||
                                         !scene[ordered[p].id].on) &&
                                        stageDifferences[p] > .00002)
                                        throw new Exception("Sequential mismatch at " +
                                                            ordered[p].id);
                                lines.Add(mode + " / " + frames + " frames: graph difference " +
                                          difference);
                                for (int p = 0; p < processors.Count; p++)
                                    lines.Add(String.Format(
                                        System.Globalization.CultureInfo.InvariantCulture,
                                        "  {0} {1}: peak {2:F6}; RMS {3:F2} dBFS; stage difference {4:G4}",
                                        ordered[p].id, ordered[p].key, peaks[p],
                                        10 * Math.Log10(Math.Max(energy[p] / samples, 1e-30)),
                                        stageDifferences[p]));
                            }
                        }
                        finally
                        {
                            foreach (var processor in processors)
                                processor.Dispose();
                        }
                    }
                lines.Add(
                    "Synthetic chord only; no hardware listening or master-output setting reproduced.");
            }
            catch (Exception e)
            {
                lines.Add("FAIL: " + e);
            }
            File.WriteAllLines(
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "saved-patch-audit.txt"),
                lines);
            return lines.Any(line => line.StartsWith("FAIL")) ? 1 : 0;
        }
    }
}
