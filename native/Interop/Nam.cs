using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite
{
    // Managed boundary to NAM. Callers own handles and must release them exactly once.
    static class Nam
    {
        [DllImport("GuitarNam.dll", CallingConvention = CallingConvention.Cdecl,
                   CharSet = CharSet.Unicode)]
        public static extern IntPtr gs_load(string path, int rate, int frames);
        [DllImport("GuitarNam.dll", CallingConvention = CallingConvention.Cdecl)]
        public static extern int gs_process(IntPtr model, float[] input, float[] output,
                                            int frames);
        [DllImport("GuitarNam.dll", CallingConvention = CallingConvention.Cdecl)]
        public static extern int gs_process_stereo(IntPtr model, float[] input, float[] left,
                                                   float[] right, int frames);
        [DllImport("GuitarNam.dll", CallingConvention = CallingConvention.Cdecl)]
        public static extern void gs_free(IntPtr model);
        [DllImport("GuitarNam.dll", CallingConvention = CallingConvention.Cdecl)]
        public static extern int gs_rate(IntPtr model);
        [DllImport("GuitarNam.dll", CallingConvention = CallingConvention.Cdecl)]
        public static extern int gs_levels(IntPtr model, out double input, out double output);
        [DllImport("GuitarNam.dll", CallingConvention = CallingConvention.Cdecl)]
        static extern IntPtr gs_error();
        public static string Error
        {
            get {
                return Marshal.PtrToStringAnsi(gs_error());
            }
        }
    }
}
