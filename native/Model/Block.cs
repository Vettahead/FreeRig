using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // A device identity in a saved patch. Keep field names compatible with existing patch JSON.
    public class Block
    {
        public string id, key, assetId, assetName;
    }
}
