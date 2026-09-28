"""Offline stock-drive block-size and output-level audit; never opens audio hardware."""

import ctypes as c
import json
from pathlib import Path
import numpy as np


def main():
    dll = c.CDLL(str(Path(__file__).resolve().parents[1] / "native/dist/GuitarEffects.dll"))
    ptr = c.POINTER(c.c_float)
    dll.fx_load.argtypes = [c.c_char_p, c.c_int]
    dll.fx_load.restype = c.c_void_p
    dll.fx_free.argtypes = [c.c_void_p]
    dll.fx_set.argtypes = [c.c_void_p, c.POINTER(c.c_double), c.c_int]
    dll.fx_process.argtypes = [c.c_void_p, ptr, ptr, c.c_int]
    dll.fx_catalogue.restype = c.c_char_p
    entries = json.loads(dll.fx_catalogue())
    for rate in (44100, 48000, 96000):
        t = np.arange(rate * 2) / rate
        signal = (.08 * np.sin(2 * np.pi * 110 * t)).astype(np.float32)
        signal[rate:] = 0
        for entry in entries:
            if not entry["key"].startswith("GX"):
                continue
            values = [p[3] for p in entry["params"]]
            for i, p in enumerate(entry["params"]):
                if p[0] in ("Drive", "Fuzz"):
                    values[i] = p[1]
            outputs = []
            for block in (32, 64, 128):
                handle = dll.fx_load(entry["key"].encode(), rate)
                assert handle
                result = signal.copy()
                right = signal.copy()
                try:
                    assert dll.fx_set(handle, (c.c_double * len(values))(*values), len(values))
                    for at in range(0, len(signal), block):
                        l = result[at:at + block]
                        r = right[at:at + block]
                        assert dll.fx_process(handle, l.ctypes.data_as(ptr), r.ctypes.data_as(ptr), len(l))
                    assert np.isfinite(result).all()
                    assert np.array_equal(result, right)
                    outputs.append(result)
                finally:
                    dll.fx_free(handle)
            error = max(float(np.max(np.abs(x - outputs[0]))) for x in outputs[1:])
            assert error < 2e-5, (entry["key"], rate, error)
            settled = outputs[0][rate // 2:rate]
            tail = outputs[0][-rate // 4:]
            print(f'{rate} {entry["key"]}: peak={np.max(np.abs(settled)):.5f}, DC={np.mean(settled):.5f}, silence={np.max(np.abs(tail)):.6f}, block error={error:.3g}')


if __name__ == "__main__":
    main()
