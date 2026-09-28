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
    // Application entry point and offline diagnostic commands.
    static class Program
    {
        [STAThread]
        static int Main(string[] args)
        {
            if (args.Length == 3 && args[0] == "--audit-patch")
                return SavedPatchAudit.Run(args[1], args[2]);
            if (args.Length == 3 && args[0] == "--audit-chain")
                return CaptureChainAudit.Run(args[1], args[2]);
            if (args.Length == 4 && args[0] == "--audit-drive-chain")
                return CaptureChainAudit.Run(args[1], args[2], args[3]);
            if (args.Length > 0 && args[0] == "--tone-preflight")
            {
                try
                {
                    File.WriteAllText(
                        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tone-preflight.txt"),
                        Tone3000.Preflight().GetAwaiter().GetResult());
                    return 0;
                }
                catch (Exception ex)
                {
                    File.WriteAllText(
                        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tone-preflight.txt"),
                        ex.Message);
                    return 1;
                }
            }
            if (args.Length > 0 && args[0] == "--output-test")
                return OutputTests.Run();
            if (args.Length > 1 && args[0] == "--output-check")
            {
                var results = new System.Collections.Generic.List<string>();
                foreach (bool exclusive in new[] { false, true })
                {
                    try
                    {
                        using (var output = new SeparateOutput(args[1], 48000, 5, exclusive))
                            results.Add("PASS: initialised without playback; exclusive=" +
                                        exclusive + "; " + output.Name + "; " + output.Details);
                    }
                    catch (Exception e)
                    {
                        results.Add("FAIL: exclusive=" + exclusive + "; " + e.ToString());
                    }
                }
                File.WriteAllLines(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "output-check.txt"),
                    results);
                return results.Any(s => s.StartsWith("FAIL")) ? 1 : 0;
            }
            if (args.Length > 0 && args[0] == "--inputs")
            {
                File.WriteAllText(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "inputs.json"),
                    new JavaScriptSerializer().Serialize(WindowsInput.List()));
                return 0;
            }
            if (args.Length > 0 && args[0] == "--outputs")
            {
                File.WriteAllText(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "outputs.json"),
                    new JavaScriptSerializer().Serialize(OutputDevices.List()));
                return 0;
            }
            if (args.Length > 0 && args[0] == "--buffer-test")
                return BufferTests.Run(args.Skip(1).ToArray());
            if (args.Length > 0 && args[0] == "--self-test")
                return EngineTests.Run(args.Skip(1).ToArray());
            if (args.Length > 0 && args[0] == "--drivers")
            {
                try
                {
                    File.WriteAllLines(
                        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "drivers.txt"),
                        AsioOut.GetDriverNames());
                    return 0;
                }
                catch (Exception e)
                {
                    File.WriteAllText(
                        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "drivers.txt"),
                        e.ToString());
                    return 1;
                }
            }
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainWindow());
            return 0;
        }
    }
}
