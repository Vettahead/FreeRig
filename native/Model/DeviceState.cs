using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Scene-local bypass and parameter values; parameter order belongs to the device definition.
    public class DeviceState
    {
        public bool on;
        public int sync;
        public double[] values;
    }
}
