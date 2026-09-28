using System;
using System.Collections.Generic;
namespace GuitarSuite
{
    static class WindowsInputTests
    {
        public static void Run(List<string> lines)
        {
            // Unequal capture packet sizes must preserve time and isolate the
            // selected channel, including across a processing-block boundary.
            foreach (int channels in new[] { 1, 2, 8 })
                foreach (int block in new[] { 32, 64, 128 })
                {
                    int received = 0, sent = 0;
                    var assembler = new CaptureBlocks(
                        channels, channels - 1, block,
                        (samples, count) =>
                        {
                            if (count != block)
                                throw new Exception("Capture block size changed.");
                            for (int i = 0; i < count; i++)
                                if (samples[i] != (received++ % 1000) / 1000f)
                                    throw new Exception(
                                        "Capture lost/repeated samples or mixed channels.");
                        });
                    foreach (int frames in new[] { 1, 31, 97, 480, 7, 4096, 63 })
                    {
                        var values = new float[frames * channels];
                        for (int i = 0; i < frames; i++)
                        {
                            for (int c = 0; c < channels; c++)
                                values[i * channels + c] = -1;
                            values[i * channels + channels - 1] = (sent++ % 1000) / 1000f;
                        }
                        var bytes = new byte[values.Length * 4];
                        Buffer.BlockCopy(values, 0, bytes, 0, bytes.Length);
                        assembler.Push(bytes, bytes.Length);
                    }
                    if (received != sent / block * block)
                        throw new Exception("Capture remainder wrong.");
                }
            int clean = 0;
            var sanitiser =
                new CaptureBlocks(1, 0, 1,
                                  (s, n) =>
                                  {
                                      if (s[0] != 0)
                                          throw new Exception("Non-finite capture escaped.");
                                      clean++;
                                  });
            sanitiser.Push(BitConverter.GetBytes(float.NaN), 4);
            sanitiser.Push(BitConverter.GetBytes(float.PositiveInfinity), 4);
            bool rejected = false;
            try
            {
                sanitiser.Push(new byte[3], 3);
            }
            catch (ArgumentException)
            {
                rejected = true;
            }
            if (!rejected || clean != 2)
                throw new Exception("Capture packet validation failed.");
            lines.Add(
                "PASS: Windows float input channel isolation, packet continuity, bounded 32/64/128-frame blocks and invalid samples. No live driver exercised.");
        }
    }
}
