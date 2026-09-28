using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Wire-format patch received from WebView2. Routing is shared; device settings vary by scene.
    public class Patch
    {
        public int scene;
        public double? calibrationDbU;
        public int tempo = 112;
        public Block[] blocks;
        public string[][] connections;
        public Dictionary<string, DeviceState>[] scenes;
        public object[] junctions;
    }
}
