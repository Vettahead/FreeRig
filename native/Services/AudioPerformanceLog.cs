using System;
using System.Collections.Concurrent;
using System.IO;
using System.Text;
using System.Threading;
namespace GuitarSuite
{
    // Control-thread producer, dedicated file writer. Never called by audio rendering.
    // A bounded queue drops diagnostics rather than blocking the host; one backup caps disk use.
    sealed class AudioPerformanceLog : IDisposable
    {
        readonly BlockingCollection<string> pending = new BlockingCollection<string>(64);
        readonly Thread writer;
        readonly string path;
        readonly long maximumBytes;
        int dropped, failures, disposed;
        public int Dropped
        {
            get {
                return Volatile.Read(ref dropped);
            }
        }
        public int Failures
        {
            get {
                return Volatile.Read(ref failures);
            }
        }
        public AudioPerformanceLog(string path, long maximumBytes = 5 * 1024 * 1024)
        {
            this.path = path;
            this.maximumBytes = maximumBytes;
            writer = new Thread(Write) { IsBackground = true, Name = "Audio performance log" };
            writer.Start();
        }
        public void Enqueue(string line)
        {
            if (!pending.TryAdd(line))
                Interlocked.Increment(ref dropped);
        }
        void Write()
        {
            foreach (string line in pending.GetConsumingEnumerable())
            {
                try
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(path));
                    if (Encoding.UTF8.GetByteCount(line) + 2 > maximumBytes)
                    {
                        Interlocked.Increment(ref dropped);
                        continue;
                    }
                    if (File.Exists(path) &&
                        new FileInfo(path).Length + Encoding.UTF8.GetByteCount(line) + 2 >
                            maximumBytes)
                    {
                        string backup = path + ".1";
                        if (File.Exists(backup))
                            File.Delete(backup);
                        File.Move(path, backup);
                    }
                    File.AppendAllText(path, line + Environment.NewLine, new UTF8Encoding(false));
                }
                catch (Exception)
                {
                    // Diagnostic failure must never stop playback. Counters surface it in later
                    // records.
                    Interlocked.Increment(ref failures);
                }
            }
        }
        public void Dispose()
        {
            if (Interlocked.Exchange(ref disposed, 1) != 0)
                return;
            pending.CompleteAdding();
            // Bounded shutdown: a stalled filesystem cannot hold the desktop open indefinitely.
            if (writer.Join(2000))
                pending.Dispose();
        }
    }
}
