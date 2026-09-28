"""Offline capture parity audit. No audio devices, playback, model edits or uploads.

Build native/build-nam.ps1 -Reference first. Pass one or more local .nam paths.
The independent generic NAM build checks our fast build; neither is an analogue
ground-truth recording. Blocks, input aliasing and headroom are checked separately.
"""

import argparse
import ctypes as c
import math
from pathlib import Path


def library(path):
    dll = c.CDLL(str(path.resolve()))
    ptr = c.POINTER(c.c_float)
    dll.gs_load.argtypes = [c.c_wchar_p, c.c_int, c.c_int]
    dll.gs_load.restype = c.c_void_p
    dll.gs_process.argtypes = [c.c_void_p, ptr, ptr, c.c_int]
    dll.gs_free.argtypes = [c.c_void_p]
    dll.gs_rate.argtypes = [c.c_void_p]
    dll.gs_error.restype = c.c_char_p
    return dll


def render(dll, path, rate, block, signal, alias=False):
    handle = dll.gs_load(str(path.resolve()), rate, block)
    if not handle:
        raise RuntimeError(dll.gs_error().decode())
    result = []
    try:
        for start in range(0, len(signal), block):
            values = signal[start : start + block]
            source = (c.c_float * len(values))(*values)
            output = source if alias else (c.c_float * len(values))()
            assert dll.gs_process(handle, source, output, len(values)) == 1
            result.extend(output)
    finally:
        dll.gs_free(handle)
    assert all(map(math.isfinite, result))
    return result


def compare(expected, actual):
    error = [a - b for a, b in zip(actual, expected)]
    peak = max(map(abs, error))
    energy = sum(x * x for x in expected)
    relative = math.sqrt(sum(x * x for x in error) / max(energy, 1e-30))
    assert peak < 2e-4 and relative < 2e-3, (peak, relative)
    return f"max error {peak:.3g}, relative RMS {relative:.3g}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("models", nargs="+", type=Path)
    parser.add_argument("--rate", type=int, default=48000)
    args = parser.parse_args()
    dist = Path(__file__).resolve().parents[1] / "native/dist"
    fast = library(dist / "GuitarNam.dll")
    reference = library(dist / "GuitarNamReference.dll")
    # Deterministic decaying chord followed by silence exercises nonlinear state
    # and tails, with a discontinuity at attack. Peak remains below input clipping.
    signal = [
        0.12 * math.exp(-i / (args.rate * 0.4))
        * sum(math.sin(2 * math.pi * hz * i / args.rate) for hz in (82.41, 123.47, 164.81))
        if i < args.rate else 0.0
        for i in range(args.rate * 2)
    ]
    for model in args.models:
        expected = render(reference, model, args.rate, 128, signal)
        print(model.name, f"reference peak {max(map(abs, expected)):.6f}")
        for block in (32, 64, 128):
            actual = render(fast, model, args.rate, block, signal)
            print(f"  {block} frames: {compare(expected, actual)}")
            alias = render(fast, model, args.rate, block, signal, alias=True)
            print(f"  in-place: {compare(actual, alias)}")


if __name__ == "__main__":
    main()
