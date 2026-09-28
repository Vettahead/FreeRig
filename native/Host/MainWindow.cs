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
    // Desktop lifetime and validated WebView2 message dispatch. Audio remains in native/Audio.
    sealed partial class MainWindow : Form
    {
        readonly WebView2 web = new WebView2();
        readonly AudioEngine audio = new AudioEngine();
        readonly JavaScriptSerializer json = new JavaScriptSerializer { MaxJsonLength = 4000000 };
        readonly string data = Path.Combine(Environment.GetFolderPath(
                                                Environment.SpecialFolder.LocalApplicationData),
                                            "GuitarSuite"),
                        assets;
        string activeDriver;
        int activeInput, activeOutput, activeRate;
        Patch patch;
        string signature = "", lastStatus = "";
        readonly Timer timer = new Timer { Interval = 100 };
        public MainWindow()
        {
            Text = "FreeRig — Desktop Alpha 23";
            Width = 1280;
            Height = 850;
            MinimumSize = new System.Drawing.Size(850, 650);
            BackColor = System.Drawing.Color.FromArgb(16, 20, 17);
            assets = Path.Combine(data, "Library");
            Directory.CreateDirectory(assets);
            tones = new Tone3000(data, assets);
            web.Dock = DockStyle.Fill;
            Controls.Add(web);
            Shown += async delegate
            {
                try
                {
                    var environment = await CoreWebView2Environment.CreateAsync(
                        null, Path.Combine(data, "WebView"));
                    webEnvironment = environment;
                    await web.EnsureCoreWebView2Async(environment);
                    web.CoreWebView2.SetVirtualHostNameToFolderMapping(
                        "guitarsuite.local",
                        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ui"),
                        CoreWebView2HostResourceAccessKind.DenyCors);
                    web.CoreWebView2.Settings.AreDevToolsEnabled = false;
                    web.CoreWebView2.Settings.IsStatusBarEnabled = false;
                    web.CoreWebView2.NavigationStarting += (s, e) =>
                    {
                        if (!e.Uri.StartsWith("https://guitarsuite.local/",
                                              StringComparison.OrdinalIgnoreCase))
                            e.Cancel = true;
                    };
                    web.CoreWebView2.NewWindowRequested += (s, e) =>
                    {
                        e.Handled = true;
                        Uri target;
                        if (Uri.TryCreate(e.Uri, UriKind.Absolute, out target) &&
                            target.Scheme == "https" && target.Host == "www.tone3000.com" &&
                            target.IsDefaultPort)
                            System.Diagnostics.Process.Start(target.AbsoluteUri);
                    };
                    web.CoreWebView2.WebMessageReceived += Receive;
                    web.Source = new Uri("https://guitarsuite.local/index.html");
                    timer.Start();
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message, "Unable to start FreeRig");
                }
            };
            timer.Tick += delegate
            {
                Send(audio.PlayAlongStatus());
                if (audio.OutputError != null)
                    audio.Error = audio.OutputError;
                if (audio.Error != null)
                {
                    string err = audio.Error;
                    LogAudio("Fault: " + err);
                    audio.Stop();
                    audio.Error = null;
                    Send(new { type = "error", message = err });
                }
                string status = audio.Running ? audio.Backend + " running · " + audio.BufferSize +
                                                    " processing samples → " + audio.OutputName
                                              : "Audio stopped";
                if (status != lastStatus)
                {
                    lastStatus = status;
                    Send(new { type = "status", running = audio.Running, message = status });
                }
                if (audio.TunerEnabled)
                    Send(new { type = "tuner", hz = audio.TunerHz,
                               confidence = audio.TunerConfidence, running = audio.Running });
                if (audio.Running)
                    Send(new { type = "meter", peak = audio.Peak, output = audio.OutputPeak,
                               beforeCeiling = audio.TakeBeforeCeiling(),
                               clipped = audio.TakeClip(), load = audio.Stats.TakeLoad(),
                               rawPeak = audio.Stats.TakeInput(), overruns = audio.Overruns,
                               outputDropouts = audio.OutputDropouts });
            };
            FormClosing += delegate
            {
                timer.Stop();
                audio.Dispose();
                tones.Dispose();
            };
        }
        void LogAudio(string message)
        {
            try
            {
                File.AppendAllText(Path.Combine(data, "audio-diagnostics.log"),
                                   DateTime.Now.ToString("s") + " " + message +
                                       Environment.NewLine);
            }
            catch
            {
            }
        }
        void Send(object data)
        {
            if (!IsDisposed && !Disposing && web.CoreWebView2 != null)
                web.CoreWebView2.PostWebMessageAsJson(json.Serialize(data));
        }
    }
}
