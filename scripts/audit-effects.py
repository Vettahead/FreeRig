"""Offline native catalogue audit. Requires NumPy; never opens an audio device.

Run after build-effects.ps1. Measures small-buffer behaviour and verifies every
parameter endpoint remains finite. Endpoints are tested individually, not as
an arbitrary all-controls-at-maximum preset. Results are written under releases.
"""
import ctypes as c
import json
import os
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
os.add_dll_directory(str(ROOT / "native/dist"))
DLL = c.CDLL(str(ROOT / "native/dist/GuitarEffects.dll"))
FLOATS = c.POINTER(c.c_float)
DLL.fx_load.argtypes = [c.c_char_p, c.c_int]
DLL.fx_load.restype = c.c_void_p
DLL.fx_free.argtypes = [c.c_void_p]
DLL.fx_set.argtypes = [c.c_void_p, c.POINTER(c.c_double), c.c_int]
DLL.fx_process.argtypes = [c.c_void_p, FLOATS, FLOATS, c.c_int]
DLL.fx_latency.argtypes = [c.c_void_p]


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8-sig"))


def controls(handle, values):
    assert DLL.fx_set(handle, (c.c_double * len(values))(*values), len(values)) == 1


def process(handle, left, right):
    left, right = np.array(left, dtype="float32"), np.array(right, dtype="float32")
    assert DLL.fx_process(handle, left.ctypes.data_as(FLOATS), right.ctypes.data_as(FLOATS), len(left)) == 1
    assert np.isfinite(left).all() and np.isfinite(right).all()
    return left, right


def run():
    catalogue = read("native/effects-catalogue.json")
    descriptors = {d["key"][3:]: d for d in (read("effects/" + f) for f in read("effects/index.json"))}
    failures, cases = [], 0
    for rate in (44100, 48000, 96000):
        for entry in catalogue:
            key = entry["key"]
            for size in (32, 64, 128):
                handle = DLL.fx_load(key.encode(), rate)
                assert handle, key
                try:
                    defaults = descriptors[key]["defaults"]
                    controls(handle, defaults)
                    # A second of input followed by a quarter-second tail exercises
                    # long-window effects as well as short callback scheduling.
                    for at in range(0, rate * 5 // 4, size):
                        t = (np.arange(size) + at) / rate
                        envelope = np.where(t < 1, .08, 0)
                        l, r = process(handle, envelope * np.sin(t * 1382.3), envelope * .5 * np.sin(t * 2073.5))
                        assert max(np.abs(l).max(), np.abs(r).max()) < 8, "unbounded starting preset"
                    if size == 32:
                        # Test control transitions on a running processor, restoring
                        # the complete defaults between each independent endpoint.
                        for i, parameter in enumerate(entry["params"]):
                            for endpoint in parameter[1:3]:
                                values = defaults.copy()
                                values[i] = endpoint
                                controls(handle, values)
                                for at in range(0, 4096, size):
                                    t = (np.arange(size) + at) / rate
                                    process(handle, .05 * np.sin(t * 1382.3), .03 * np.sin(t * 2073.5))
                                controls(handle, defaults)
                    cases += 1
                except Exception as error:
                    failures.append(f"{key}: {rate} Hz / {size}: {error}")
                finally:
                    DLL.fx_free(handle)
        print(f"Audited {rate} Hz; {len(failures)} failures", flush=True)

    # Flat EQ must preserve samples; a +6 dB 1 kHz band must deliver that gain.
    for gain in (0, 6, -6):
        handle = DLL.fx_load(b"GraphicEQ", 48000)
        try:
            values = [0] * 11
            values[5] = gain
            controls(handle, values)
            for at in range(0, 48000, 128):
                x = .05 * np.sin((np.arange(128) + at) * 2 * np.pi * 1000 / 48000)
                l, r = process(handle, x, x * .5)
            measured = 20 * np.log10(np.linalg.norm(l) / np.linalg.norm(x))
            assert abs(measured - gain) < .1, (gain, measured)
        finally:
            DLL.fx_free(handle)
    handle = DLL.fx_load(b"PhraseLooper", 48000)
    try:
        controls(handle, [1, 100, 50])
        for _ in range(30):
            process(handle, [.1] * 128, [-.05] * 128)
        controls(handle, [2, 100, 50])
        for _ in range(4):
            l, r = process(handle, [0] * 128, [0] * 128)
        assert np.max(np.abs(l - .1)) < 1e-6 and np.max(np.abs(r + .05)) < 1e-6
        controls(handle, [0, 100, 50])
        l, r = process(handle, [0] * 128, [0] * 128)
        assert np.max(np.abs(l)) == 0 and np.max(np.abs(r)) == 0
    finally:
        DLL.fx_free(handle)
    # The selected ClipOnly2 implementations delay the complete output by one
    # frame, even at 96 kHz. Check real impulse arrival against host metadata.
    for rate in (44100, 48000, 96000):
        handle = DLL.fx_load(b"BeziComp", rate)
        try:
            controls(handle, [50, 50, 0])
            impulse = np.zeros(32)
            impulse[0] = .1
            l, r = process(handle, impulse, impulse)
            assert np.argmax(np.abs(l)) == DLL.fx_latency(handle) == 1
        finally:
            DLL.fx_free(handle)
    # Filling the loop must auto-play without a repeated Record control update
    # erasing it. Small batches exercise exactly the callback update contract.
    handle = DLL.fx_load(b"PhraseLooper", 48000)
    try:
        controls(handle, [1, 100, 50])
        for _ in range(48000 * 60 // 128):
            process(handle, [.1] * 128, [-.05] * 128)
        controls(handle, [1, 100, 50])
        for _ in range(4):
            l, r = process(handle, [0] * 128, [0] * 128)
        assert np.max(np.abs(l - .1)) < 1e-6
    finally:
        DLL.fx_free(handle)
    report = {"processors": len(catalogue), "passed_cases": cases, "failures": failures,
              "checks": "44.1/48/96 kHz; 32/64/128 frames; individual parameter endpoints; flat/±6 dB EQ; stereo loop record/play/clear"}
    output = ROOT / "releases/research/effects-audit.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report), flush=True)
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    run()
