using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Processes devices in dependency order and aligns parallel paths before summing.
    sealed class Graph : IDisposable
    {
        public object[] CalibrationInfo { get; private set; }
        readonly int maxFrames;
        readonly StereoProcessor[] nodes;
        readonly float[] input = new float[4096], output = new float[4096];
        readonly int[] finalSources;
        readonly Dictionary<string, StereoProcessor> byId;
        public Graph(Patch patch, int rate, string assets, int maxFrames = 4096)
        {
            if (maxFrames < 1 || maxFrames > 4096)
                throw new Exception("Unsupported audio buffer size.");
            this.maxFrames = maxFrames;
            if (patch == null || patch.blocks == null || patch.blocks.Length > 24 ||
                patch.scenes == null || (patch.scenes.Length != 4 && patch.scenes.Length != 8) ||
                patch.scene < 0 || patch.scene >= patch.scenes.Length)
                throw new Exception("Invalid patch.");
            if (patch.junctions != null && patch.junctions.Length > 0)
                throw new Exception(
                    "This older patch has saved A/B mixers. Load the starter patch " +
                    "or remove those mixer routes before playing.");
            var waiting = new List<Block>(patch.blocks);
            var ordered = new List<Block>();
            var known = new HashSet<string> { "input" };
            foreach (var edge in patch.connections)
                if (edge.Length != 2 || edge[1] == "input" || edge[0] == "output" ||
                    edge[0] == edge[1])
                    throw new Exception("Invalid cable.");
            while (waiting.Count > 0)
            {
                var ready = waiting
                                .Where(b => patch.connections.Where(e => e[1] == b.id)
                                                .All(e => known.Contains(e[0])))
                                .ToArray();
                if (ready.Length == 0)
                    throw new Exception("The patch contains a cycle or missing device.");
                foreach (var b in ready)
                {
                    ordered.Add(b);
                    known.Add(b.id);
                    waiting.Remove(b);
                }
            }
            if (patch.connections.Any(e => !known.Contains(e[0]) ||
                                           (!known.Contains(e[1]) && e[1] != "output")))
                throw new Exception("A cable refers to a missing device.");
            var built = new List<StereoProcessor>();
            try
            {
                foreach (var b in ordered)
                    built.Add(new StereoProcessor(b, patch.scenes[patch.scene][b.id], rate, assets,
                                                  maxFrames));
            }
            catch
            {
                foreach (var p in built)
                    p.Dispose();
                throw;
            }
            nodes = built.ToArray();
            byId = nodes.ToDictionary(n => n.Block.id);
            CalibrationInfo =
                nodes
                    .Where(n =>
                               !String.IsNullOrEmpty(n.Block.assetId) &&
                               n.Block.assetId.EndsWith(".nam", StringComparison.OrdinalIgnoreCase))
                    .Select(n => (object) new { id = n.Block.id,
                                                name = n.Block.assetName ?? n.Block.key,
                                                levels = n.Calibration })
                    .ToArray();
            foreach (var node in nodes)
                node.Sources =
                    patch.connections.Where(e => e[1] == node.Block.id)
                        .Select(e => e[0] == "input"
                                         ? -1
                                         : Array.FindIndex(nodes, n => n.Block.id == e[0]))
                        .ToArray();
            finalSources =
                patch.connections.Where(e => e[1] == "output")
                    .Select(e => e[0] == "input" ? -1
                                                 : Array.FindIndex(nodes, n => n.Block.id == e[0]))
                    .ToArray();
            foreach (var node in nodes)
            {
                int max = node.Sources.Select(i => i < 0 ? 0 : nodes[i].TotalLatency)
                              .DefaultIfEmpty(0)
                              .Max();
                node.TotalLatency = max + node.Latency;
                node.Align =
                    node.Sources
                        .Select(i => new StereoDelay(max - (i < 0 ? 0 : nodes[i].TotalLatency)))
                        .ToArray();
                node.Update(patch.scenes[patch.scene][node.Block.id], patch.tempo,
                            patch.calibrationDbU);
            }
            Update(patch);
            int finalMax =
                finalSources.Select(i => i < 0 ? 0 : nodes[i].TotalLatency).DefaultIfEmpty(0).Max();
            finalAlign =
                finalSources
                    .Select(i => new StereoDelay(finalMax - (i < 0 ? 0 : nodes[i].TotalLatency)))
                    .ToArray();
        }
        public readonly float[] Right = new float[4096];
        StereoDelay[] finalAlign;
        volatile StereoProcessor.ControlSnapshot[] controls;
        public void Update(Patch patch)
        {
            // Allocate/derive every scene control on the control thread, then publish
            // the whole scene atomically. A render never combines two scene snapshots.
            var previous = controls;
            var next = new StereoProcessor.ControlSnapshot[nodes.Length];
            for (int i = 0; i < nodes.Length; i++)
            {
                DeviceState state;
                next[i] = patch.scenes[patch.scene].TryGetValue(nodes[i].Block.id, out state)
                              ? nodes[i].Prepare(state, patch.tempo, patch.calibrationDbU)
                              : previous[i];
            }
            controls = next;
        }
        public float[] Run(float[] source, int count)
        {
            if (count < 1 || count > maxFrames)
                throw new Exception("Audio block exceeds the prepared buffer size. Restart audio " +
                                    "after changing the driver buffer.");
            var snapshot = controls;
            Array.Copy(source, input, count);
            int nodeIndex = 0;
            foreach (var node in nodes)
            {
                Array.Clear(node.Buffer, 0, count);
                Array.Clear(node.Right, 0, count);
                for (int j = 0; j < node.Sources.Length; j++)
                {
                    int index = node.Sources[j];
                    node.Align[j].Add(index < 0 ? input : nodes[index].Buffer,
                                      index < 0 ? input : nodes[index].Right, node.Buffer,
                                      node.Right, count);
                }
                node.Process(count, snapshot[nodeIndex++]);
            }
            Array.Clear(output, 0, count);
            Array.Clear(Right, 0, count);
            for (int j = 0; j < finalSources.Length; j++)
            {
                int index = finalSources[j];
                finalAlign[j].Add(index < 0 ? input : nodes[index].Buffer,
                                  index < 0 ? input : nodes[index].Right, output, Right, count);
            }
            return output;
        }
        public void Dispose()
        {
            foreach (var p in nodes)
                p.Dispose();
        }
    }
    // A replacement is built before taking the render gate. The ASIO device and its
    // buffers stay open; no native model can be disposed while a callback uses it.
}
