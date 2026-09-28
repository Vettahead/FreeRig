"""Compare NAM IR convolution to direct convolution of WAV samples (offline).

Requires NumPy in the developer Python environment only; no app dependency.
Pass local PCM16/24/32 or float32/64 WAV cabinet paths. Tests at the WAV's
original sample rate so interpolation is not confused with convolution error.
"""
import argparse
import struct
import runpy
from pathlib import Path

import numpy as np
nam = runpy.run_path(str(Path(__file__).with_name("audit-nam.py")))
library, render = nam["library"], nam["render"]


def read_wav(path):
    content = path.read_bytes()
    assert content[:4] == b"RIFF" and content[8:12] == b"WAVE"
    chunks = {}
    at = 12
    while at + 8 <= len(content):
        name, size = struct.unpack_from("<4sI", content, at)
        chunks[name] = content[at + 8 : at + 8 + size]
        at += 8 + size + (size % 2)
    fmt = chunks[b"fmt "]
    kind, channels, rate, _, _, bits = struct.unpack_from("<HHIIHH", fmt)
    if kind == 65534:
        kind = struct.unpack_from("<H", fmt, 24)[0]
    data = chunks[b"data"]
    if kind == 3:
        values = np.frombuffer(data, dtype="<f" + str(bits // 8)).astype(float)
    elif kind == 1 and bits == 24:
        b = np.frombuffer(data, dtype=np.uint8).reshape(-1, 3).astype(np.int32)
        raw = b[:, 0] | (b[:, 1] << 8) | (b[:, 2] << 16)
        values = ((raw ^ 0x800000) - 0x800000) / 8388608.0
    elif kind == 1 and bits in (16, 32):
        values = np.frombuffer(data, dtype="<i" + str(bits // 8)).astype(float) / (2 ** (bits - 1))
    else:
        raise ValueError((kind, bits))
    return rate, values.reshape(-1, channels).mean(axis=1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cabinets", nargs="+", type=Path)
    args = parser.parse_args()
    dll = library(Path(__file__).resolve().parents[1] / "native/dist/GuitarNam.dll")
    for path in args.cabinets:
        rate, ir = read_wav(path)
        rng = np.random.default_rng(8719)
        signal = np.concatenate((rng.uniform(-.1, .1, 2048), np.zeros(len(ir)))).astype(np.float32)
        expected = np.convolve(signal, ir)[:len(signal)]
        for block in (32, 64, 128):
            actual = np.array(render(dll, path, rate, block, signal.tolist()))
            peak_error = np.max(np.abs(actual - expected))
            assert peak_error < 2e-5, (path.name, block, peak_error)
            print(f"PASS {path.name} {rate} Hz / {block}: direct-convolution max error {peak_error:.3g}")


if __name__ == "__main__":
    main()
