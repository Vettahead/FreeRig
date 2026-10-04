using System;
using System.IO;
using System.Collections.Generic;
namespace GuitarSuite
{
    static class AudioPerformanceLogTests
    {
        public static void Run(List<string> lines)
        {
            string directory = Path.Combine(Path.GetTempPath(), "FreeRig-log-" + Guid.NewGuid());
            Directory.CreateDirectory(directory);
            string path = Path.Combine(directory, "performance.jsonl");
            try
            {
                using (var log = new AudioPerformanceLog(path, 100))
                {
                    for (int i = 0; i < 12; i++)
                        log.Enqueue("{\"sample\":" + i + ",\"padding\":\"abcdefghijklmnop\"}");
                }
                if (!File.Exists(path + ".1") || new FileInfo(path).Length > 100 ||
                    new FileInfo(path + ".1").Length > 100 ||
                    !File.ReadAllText(path).Contains("\"sample\":11"))
                    throw new Exception("Performance log rotation/drain lost the last sample.");
                // An unwritable destination must fail within diagnostics, never in its producer.
                string blocked = Path.Combine(directory, "blocked");
                File.WriteAllText(blocked, "not a directory");
                using (var log = new AudioPerformanceLog(Path.Combine(blocked, "log.jsonl")))
                {
                    log.Enqueue("{}");
                    log.Dispose();
                    if (log.Failures != 1)
                        throw new Exception("Performance log did not count its write failure.");
                }
                lines.Add(
                    "PASS: background performance log drains, rotates with bounded files and contains IO failures.");
            }
            finally
            {
                Directory.Delete(directory, true);
            }
        }
    }
}
