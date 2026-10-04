using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Web.Script.Serialization;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;
using NAudio.Wave;
namespace GuitarSuite
{
    // Validates trusted UI messages and hands work to audio/library services.
    sealed partial class MainWindow
    {
        async void Receive(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            if (!e.Source.StartsWith("https://guitarsuite.local/",
                                     StringComparison.OrdinalIgnoreCase))
                return;
            try
            {
                var message = json.Deserialize<Dictionary<string, object>>(e.WebMessageAsJson);
                string type = (string)message["type"];
                if (type.StartsWith("playAlong", StringComparison.Ordinal))
                {
                    HandlePlayAlong(type, message);
                    return;
                }
                if (type.StartsWith("tone", StringComparison.Ordinal))
                {
                    await HandleTone(message);
                    return;
                }
                if (type == "ready")
                {
                    var drivers = AsioOut.GetDriverNames();
                    File.WriteAllText(Path.Combine(data, "startup.log"),
                                      DateTime.Now.ToString("s") +
                                          " Desktop UI ready; native bridge connected; " +
                                          drivers.Length + " ASIO drivers found; audio stopped.");
                    Send(new { type = "ready", drivers = drivers });
                    Send(new { type = "outputs", devices = OutputDevices.List() });
                    return;
                }
                if (type == "audioDevices")
                {
                    Send(new { type = "audioDevices", drivers = AsioOut.GetDriverNames(),
                               inputs = WindowsInput.List(), outputs = OutputDevices.List() });
                    return;
                }
                if (type == "startWindows")
                {
                    audio.StartWindows(
                        (string)message["inputDevice"], Convert.ToInt32(message["input"]),
                        Convert.ToInt32(message["rate"]), patch, assets,
                        (string)message["outputDevice"], Convert.ToInt32(message["outputLatency"]),
                        Convert.ToBoolean(message["outputExclusive"]));
                    PerformanceStart(
                        new { backend = "Windows", inputDevice = message["inputDevice"],
                              inputChannel = message["input"], rateHz = message["rate"],
                              outputDevice = message["outputDevice"],
                              outputLatencyMs = message["outputLatency"],
                              outputExclusive = message["outputExclusive"] });
                    lastStatus = "";
                    return;
                }
                if (type == "sync")
                {
                    string raw = json.Serialize(message["patch"]);
                    Patch next = json.Deserialize<Patch>(raw);
                    if (next == null || next.blocks == null || next.scenes == null ||
                        next.scene < 0 || next.scene >= next.scenes.Length)
                        throw new Exception("Invalid patch data.");
                    string nextSignature =
                        json.Serialize(new { blocks = next.blocks, connections = next.connections,
                                             junctions = next.junctions });
                    bool changed = nextSignature != signature;
                    // Prepare the new graph before publication; failed loads keep the old rig.
                    if (changed && audio.Running)
                        audio.Replace(next);
                    else
                        audio.Update(next);
                    patch = next;
                    signature = nextSignature;
                    PerformanceRig();
                    if (changed && audio.Running)
                        LogAudio("Rig switched with ASIO open; blocks=" + next.blocks.Length +
                                 "; overruns=" + audio.Overruns);
                    return;
                }
                if (type == "calibrationInfo")
                {
                    Send(new { type = "calibrationInfo",
                               devices = audio.Running
                                             ? audio.CalibrationInfo
                                             : (patch == null ? new Block[0] : patch.blocks)
                                                   .Where(b => DeviceLibrary.SafeAsset(b.assetId) &&
                                                               b.assetId.EndsWith(".nam"))
                                                   .Select(b => (object) new {
                                                       id = b.id, name = b.assetName ?? b.key,
                                                       levels = CaptureLevels.Read(
                                                           Path.Combine(assets, b.assetId))
                                                   })
                                                   .ToArray() });
                    return;
                }
                if (type == "outputs")
                {
                    Send(new { type = "outputs", devices = OutputDevices.List() });
                    return;
                }
                if (type == "start")
                {
                    activeDriver = (string)message["driver"];
                    activeInput = Convert.ToInt32(message["input"]);
                    activeOutput = Convert.ToInt32(message["output"]);
                    activeRate = Convert.ToInt32(message["rate"]);
                    audio.Start(
                        activeDriver, activeInput, activeOutput, activeRate, patch, assets,
                        message.ContainsKey("outputDevice") ? (string)message["outputDevice"] : "",
                        message.ContainsKey("outputLatency")
                            ? Convert.ToInt32(message["outputLatency"])
                            : 10,
                        message.ContainsKey("outputExclusive") &&
                            Convert.ToBoolean(message["outputExclusive"]));
                    LogAudio("Start: " + activeDriver + "; rate=" + activeRate +
                             "; buffer=" + audio.BufferSize + "; output=" + audio.OutputName);
                    PerformanceStart(new {
                        backend = "ASIO", driver = activeDriver, inputChannel = activeInput,
                        outputChannel = activeOutput, rateHz = activeRate,
                        outputDevice =
                            message.ContainsKey("outputDevice") ? message["outputDevice"] : "",
                        outputLatencyMs =
                            message.ContainsKey("outputLatency") ? message["outputLatency"] : null,
                        outputExclusive = message.ContainsKey("outputExclusive")
                                              ? message["outputExclusive"]
                                              : null
                    });
                    lastStatus = "";
                    return;
                }
                if (type == "tuner")
                {
                    audio.Tune(Convert.ToBoolean(message["enabled"]),
                               Convert.ToBoolean(message["mute"]));
                    return;
                }
                if (type == "inputTrim")
                {
                    audio.SetInput(Convert.ToDouble(message["db"]));
                    return;
                }
                if (type == "master")
                {
                    audio.SetMaster(Convert.ToDouble(message["db"]));
                    return;
                }
                if (type == "stop")
                {
                    PerformanceSample(audio.Stats.TakeLoad(), audio.Stats.TakeInput(),
                                      audio.OutputPeak, true);
                    PerformanceEvent("audio-stop", new { overruns = audio.Overruns,
                                                         outputDropouts = audio.OutputDropouts });
                    audio.Stop();
                    lastStatus = "";
                    return;
                }
                if (type == "driver")
                {
                    if (audio.Running)
                        throw new Exception("Stop audio before changing driver settings.");
                    using (var driver = new AsioOut((string)message["driver"]))
                    {
                        if (message.ContainsKey("panel") && Convert.ToBoolean(message["panel"]))
                            driver.ShowControlPanel();
                        Send(new { type = "driver", driver = (string)message["driver"],
                                   inputs = Enumerable.Range(0, driver.DriverInputChannelCount)
                                                .Select(i => driver.AsioInputChannelName(i))
                                                .ToArray(),
                                   outputs = Enumerable.Range(0, driver.DriverOutputChannelCount)
                                                 .Select(i => driver.AsioOutputChannelName(i))
                                                 .ToArray() });
                    }
                    return;
                }
                if (type == "importAsset")
                {
                    bool cab = (string)message["kind"] == "cab";
                    using (var dialog = new OpenFileDialog {
                        Title = cab ? "Import cabinet impulse response" : "Import NAM amp model",
                        Filter =
                            cab ? "Cabinet IR (*.wav)|*.wav" : "Neural Amp Modeler (*.nam)|*.nam",
                        CheckFileExists = true
                    })
                    {
                        if (dialog.ShowDialog(this) != DialogResult.OK)
                            return;
                        var file = new FileInfo(dialog.FileName);
                        if (file.Length > (cab ? 20000000 : 128000000))
                            throw new Exception(
                                "This file is too large for the first desktop build.");
                        IntPtr probe = Nam.gs_load(file.FullName, 0, 4096);
                        if (probe == IntPtr.Zero)
                            throw new Exception(Nam.Error);
                        int rate = Nam.gs_rate(probe);
                        if (rate <= 0)
                            rate = 48000;
                        Nam.gs_free(probe);
                        string id = Guid.NewGuid().ToString("N") + (cab ? ".wav" : ".nam");
                        File.Copy(file.FullName, Path.Combine(assets, id));
                        Send(new { type = "asset", blockId = message["blockId"], assetId = id,
                                   assetName = file.Name, rate = rate });
                    }
                    return;
                }
                if (type == "importPatch")
                {
                    using (var dialog =
                               new OpenFileDialog { Title = "Import FreeRig patch",
                                                    Filter = "FreeRig patch (*.json)|*.json",
                                                    CheckFileExists = true })
                    {
                        if (dialog.ShowDialog(this) == DialogResult.OK)
                        {
                            if (new FileInfo(dialog.FileName).Length > 4000000)
                                throw new Exception("Patch file is too large.");
                            Send(new { type = "patch", value = json.DeserializeObject(
                                                           File.ReadAllText(dialog.FileName)) });
                        }
                    }
                    return;
                }
                if (type == "exportPatch")
                {
                    using (var dialog =
                               new SaveFileDialog { Title = "Export FreeRig patch",
                                                    Filter = "FreeRig patch (*.json)|*.json",
                                                    FileName = "FreeRig patch.json" })
                    {
                        if (dialog.ShowDialog(this) == DialogResult.OK)
                            File.WriteAllText(dialog.FileName, json.Serialize(message["value"]),
                                              Encoding.UTF8);
                    }
                    return;
                }
            }
            catch (Exception ex)
            {
                Send(new { type = "error", message = ex.Message });
            }
        }
    }
}
