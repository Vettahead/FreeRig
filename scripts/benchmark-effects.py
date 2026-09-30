"""Reference DSP cost at 48 kHz / 128 frames; never opens an audio device.

Includes the same DLL boundary for every processor. Measures warmed default
settings, not worst-case presets or whole-rig ASIO load. Regenerate explicitly
on a quiet machine; catalogue builds consume the checked-in report.
"""
import ctypes as c
import hashlib
import json
import os
import platform
import statistics
import time
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
dll_path = ROOT / "native/dist/GuitarEffects.dll"
os.add_dll_directory(str(dll_path.parent))
dll = c.CDLL(str(dll_path))
floats = c.POINTER(c.c_float)
dll.fx_load.argtypes = [c.c_char_p, c.c_int]
dll.fx_load.restype = c.c_void_p
dll.fx_set.argtypes = [c.c_void_p, c.POINTER(c.c_double), c.c_int]
dll.fx_process.argtypes = [c.c_void_p, floats, floats, c.c_int]
dll.fx_free.argtypes = [c.c_void_p]
read = lambda p: json.loads((ROOT / p).read_text(encoding="utf-8-sig"))
results = {}
for filename in read("effects/index.json"):
    effect = read("effects/" + filename)
    handle = dll.fx_load(effect["key"][3:].encode(), 48000)
    assert handle, effect["key"]
    try:
        values = effect["defaults"]
        assert dll.fx_set(handle, (c.c_double * len(values))(*values), len(values)) == 1
        # Each call receives fresh non-silent input; otherwise in-place feedback
        # through distortion would bias costs and exercise silence optimisations.
        signal = (.08 * np.sin(np.arange(128) * 2 * np.pi * 220 / 48000)).astype("float32")
        left, right = signal.copy(), signal.copy()
        lp, rp = left.ctypes.data_as(floats), right.ctypes.data_as(floats)
        timings = []
        for run in range(6):
            started = time.perf_counter_ns()
            for _ in range(500):
                np.copyto(left, signal)
                np.copyto(right, signal)
                assert dll.fx_process(handle, lp, rp, 128) == 1
            elapsed = (time.perf_counter_ns() - started) / 500000
            if run:
                timings.append(elapsed)
        micros = round(statistics.median(timings), 2)
        # Fixed, published thresholds are more useful than ranking equally cheap
        # processors into artificial thirds. This is cost, never a quality score.
        tier = "Light" if micros < 25 else "Moderate" if micros < 100 else "Heavy"
        results[effect["key"]] = {"tier": tier, "microseconds": micros}
    finally:
        dll.fx_free(handle)
report = {"sampleRate": 48000, "frames": 128, "processor": platform.processor(),
          "dllSha256": hashlib.sha256(dll_path.read_bytes()).hexdigest(),
          "method": "Median of five warmed 500-block runs at factory defaults; includes Python input copy and DLL overhead. Light <25 us, Moderate <100 us, Heavy >=100 us. Not ASIO latency or worst-case load.",
          "effects": results}
(ROOT / "effects/dsp-costs.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps({tier: sum(v["tier"] == tier for v in results.values()) for tier in ("Light", "Moderate", "Heavy")}))
