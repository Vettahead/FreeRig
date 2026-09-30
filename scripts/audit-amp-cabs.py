"""Offline small-buffer/transition and independent WAV-convolution checks.

Uses the shipped C ABI, never an audio device. Requires numpy for reference
arithmetic. This does not establish equivalence to physical amplifiers.
"""
import ctypes as c
import json
import os
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
os.add_dll_directory(str(ROOT / 'native/dist'))
dll = c.CDLL(str(ROOT / 'native/dist/GuitarEffects.dll'))
Float = c.POINTER(c.c_float)
dll.fx_load.argtypes = [c.c_char_p, c.c_int]
dll.fx_load.restype = c.c_void_p
dll.fx_set.argtypes = [c.c_void_p, c.POINTER(c.c_double), c.c_int]
dll.fx_process.argtypes = [c.c_void_p, Float, Float, c.c_int]
dll.fx_free.argtypes = [c.c_void_p]
catalogue = json.loads((ROOT / 'native/effects-catalogue.json').read_text(encoding='utf-8-sig'))
items = [e for e in catalogue if e['key'].startswith(('Amp', 'CabJester'))]

def render(item, rate, size, signal, values=None, change=False):
    handle = dll.fx_load(item['key'].encode(), rate)
    assert handle, item['key']
    values = values or [p[3] for p in item['params']]
    try:
        def apply(v):
            assert dll.fx_set(handle, (c.c_double * len(v))(*v), len(v)) == 1
        apply(values)
        result = []
        for offset in range(0, len(signal), size):
            if change:
                bounds = 1 if (offset // size) % 2 else 2
                apply([p[bounds] for p in item['params']])
            left = signal[offset:offset+size].astype('float32').copy()
            right = left * .37 if size == 64 and item['key'].startswith('Cab') else np.zeros(len(left), dtype='float32')
            assert dll.fx_process(handle, left.ctypes.data_as(Float), right.ctypes.data_as(Float), len(left)) == 1, (item['key'], rate, size)
            assert np.all(np.isfinite(left)) and np.max(np.abs(left)) < 1000, (item['key'], 'unbounded')
            result.extend(left)
            # Tube circuits can have tiny settling/DC residuals on an unexcited
            # channel; recorded cabinets must preserve exact channel isolation.
            if item['key'].startswith('Cab'):
                assert np.max(np.abs(right - (.37 * left if size == 64 else 0))) < 2e-6
        return np.array(result)
    finally:
        dll.fx_free(handle)

report = []
for item in items:
    for rate in [44100, 48000, 96000]:
        t = np.arange(8192) / rate
        signal = .03 * (np.sin(2*np.pi*110*t) + .4*np.sin(2*np.pi*331*t))
        reference = render(item, rate, 128, signal)
        for size in [1, 17, 32, 64, 127, 4096]:
            output = render(item, rate, size, signal)
            error = float(np.max(np.abs(output-reference)))
            assert error < 2e-5, (item['key'], rate, size, error)
        render(item, rate, 32, signal, change=True)
        report.append({'key':item['key'], 'rate':rate, 'peak':float(np.max(np.abs(reference)))})
    print('PASS', item['key'], flush=True)

bank = json.loads((ROOT/'native/vendor/jester-cabs/cabinet-bank.json').read_text())
groups = {'V30':[0,8,11,13], 'DV77':[1,9,12,14], 'Rockdriver':[2,10], 'Mixed':[3,4,5,6,7], 'Greenback':[15,16,17,18,19,20]}
max_error = 0
for suffix, indices in groups.items():
    item = next(e for e in items if e['key'] == 'CabJester'+suffix)
    for choice, index in enumerate(indices):
        with wave.open(str(ROOT/'native/vendor/jester-cabs'/bank['recordings'][index]['file'])) as wav:
            raw = wav.readframes(wav.getnframes())
        ir = np.array([int.from_bytes(raw[i:i+3], 'little', signed=True)/8388608 for i in range(0,len(raw),3)])
        ir = ir[np.flatnonzero(np.abs(ir) >= np.max(np.abs(ir))*.0001)[0]:][:9600]
        ir[-480:] *= .5*(1+np.cos(np.pi*np.arange(480)/479))
        # Settle the 5 ms selection fade before the test impulse.
        signal = np.zeros(24000); signal[12000] = .1
        result = render(item,48000,32,signal,[choice,choice,0,0,0])[12000:12000+len(ir)]
        error = float(np.max(np.abs(result-ir*.1)))
        assert error < 2e-6,(suffix,choice,error)
        max_error = max(max_error,error)
print('PASS all 21 IRs against independently decoded WAVs; max error',max_error)
(ROOT/'releases/alpha26-amp-cab-audit.json').write_text(json.dumps({'cases':report,'irMaxError':max_error},indent=2)+'\n')
