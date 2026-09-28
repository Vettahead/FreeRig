using System;
using System.Linq;
using System.Runtime.InteropServices;
namespace GuitarSuite
{
    // C ABI boundary for the native effect library. Parameter order must match its exported
    // catalogue.
    static class Effects
    {
        const string Dll = "GuitarEffects.dll";
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
        public static extern IntPtr fx_load(string key, int rate);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern void fx_free(IntPtr fx);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern int fx_latency(IntPtr fx);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern int fx_set(IntPtr fx, double[] values, int count);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern int fx_process(IntPtr fx, float[] l, float[] r, int count);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern IntPtr fx_catalogue();
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern IntPtr tuner_load(int rate);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern void tuner_free(IntPtr tuner);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern void tuner_process(IntPtr tuner, float[] input, int count);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern float tuner_hz(IntPtr tuner);
        [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)]
        public static extern float tuner_confidence(IntPtr tuner);
    }
    // Fixed buffers and delay lines are allocated while constructing the graph,
    // never in the ASIO callback. Align every fan-in and the bypass signal.
}
