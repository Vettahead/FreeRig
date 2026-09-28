using System;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Threading;
namespace GuitarSuite
{
    // Read optional physical reference levels once, while preparing the graph.
    // Missing metadata is not a licence to infer calibration from musical peaks.
    public sealed class CaptureLevels
    {
        public double? inputDbU, outputDbU;
        public static CaptureLevels FromModel(IntPtr model)
        {
            double input, output;
            int flags = Nam.gs_levels(model, out input, out output);
            return new CaptureLevels { inputDbU = (flags & 1) != 0 ? (double?)input : null,
                                       outputDbU = (flags & 2) != 0 ? (double?)output : null };
        }
        static double? Level(Dictionary<string, object> metadata, string key)
        {
            object raw;
            if (!metadata.TryGetValue(key, out raw) || raw == null)
                return null;
            double value;
            if (!Double.TryParse(
                    Convert.ToString(raw, System.Globalization.CultureInfo.InvariantCulture),
                    System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out value) ||
                Double.IsNaN(value) || Double.IsInfinity(value) || value < -100 || value > 100)
                return null;
            return value;
        }
        public static CaptureLevels Read(string path)
        {
            var result = new CaptureLevels();
            if (!path.EndsWith(".nam", StringComparison.OrdinalIgnoreCase))
                return result;
            if (!File.Exists(path) || new FileInfo(path).Length > 128000000)
                return result;
            try
            {
                var root = new JavaScriptSerializer { MaxJsonLength = 128000000 }
                               .Deserialize<Dictionary<string, object>>(File.ReadAllText(path));
                object raw;
                if (root.TryGetValue("metadata", out raw))
                {
                    var metadata = raw as Dictionary<string, object>;
                    if (metadata != null)
                    {
                        result.inputDbU = Level(metadata, "input_level_dbu");
                        result.outputDbU = Level(metadata, "output_level_dbu");
                    }
                }
            }
            catch
            { /* Audio loader validates the capture separately. */
            }
            return result;
        }
        static double Gain(double? reference, double? model, bool output)
        {
            if (!reference.HasValue || !model.HasValue)
                return 1;
            if (Double.IsNaN(reference.Value) || Double.IsInfinity(reference.Value) ||
                reference.Value < -40 || reference.Value > 40)
                throw new Exception("Input calibration reference must be between -40 and +40 dBu.");
            double db = output ? model.Value - reference.Value : reference.Value - model.Value;
            if (Math.Abs(db) > 60)
                throw new Exception(
                    "Capture calibration difference exceeds 60 dB. Check the reference levels.");
            return Math.Pow(10, db / 20);
        }
        public double InputGain(double? reference)
        {
            return Gain(reference, inputDbU, false);
        }
        public double OutputGain(double? reference)
        {
            return Gain(reference, outputDbU, true);
        }
    }
    // Atomic peak hold captures short overloads between the 100 ms UI updates.
    // No locks, allocations or file access on the audio callback.
    public sealed class AudioStats
    {
        float load, peak;
        static void Maximum(ref float target, float value)
        {
            float before;
            do
            {
                before = target;
                if (value <= before)
                    return;
            } while (Interlocked.CompareExchange(ref target, value, before) != before);
        }
        public void Input(float[] values, int count)
        {
            float maximum = 0;
            for (int i = 0; i < count; i++)
                maximum = Math.Max(maximum, Math.Abs(values[i]));
            Maximum(ref peak, maximum);
        }
        public void Load(float value)
        {
            Maximum(ref load, value);
        }
        public float TakeInput()
        {
            return Interlocked.Exchange(ref peak, 0);
        }
        public float TakeLoad()
        {
            return Interlocked.Exchange(ref load, 0);
        }
        public void Reset()
        {
            TakeInput();
            TakeLoad();
        }
    }
}
