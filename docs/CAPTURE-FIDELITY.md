# Capture fidelity audit — Alpha 23

Chris reported harshness with several Hendrix captures, cabinet IRs and studio monitors, including when play-along was disconnected. The unloaded stock-cab issue is **not** an explanation for that report. The exact live patch levels and interface gain have not been measured.

## Findings and changes

- NAM input calibration follows the reference plugin's interface-reference minus capture-reference formula. No guessed calibration, automatic input boost or reduced model quality was added.
- Two downloaded models were checked: Marshall 1959 JMH 60th Hendrix (head only) and Marshall JTM 45/100 Super 100 Amplifier 1966 (amp+cab). A separate generic NAM build, without `NAM_ENABLE_A2_FAST`, provides the comparison. Maximum sample difference was 2.09e-7 across 32/64/128-frame blocks; in-place and separate-buffer processing were identical. This checks implementation parity, not accuracy against an analogue recording.
- Three local IRs were checked: Marshall 1960 Lead G12M Greenback 1973/M201, Marshall JCM900 V30 2001/SM57, and JCM900 G12H-75/SM57. Independent direct convolution of decoded WAV samples matched NAM's convolution within 5.85e-8 at 48 kHz and 32/64/128 frames. These are the closest matching downloaded cabinet files to the user's description, not a verified snapshot of the active patch.
- All six NAM → IR combinations, with neutral amp controls and 80 Hz/8 kHz cabinet cuts, matched a separately constructed reference chain exactly. The synthetic decaying chord produced post-IR peaks of 1.006–2.986 at unity levels. These peaks can clip the final output if insufficient attenuation is applied. The test does not prove that the user's saved gains clipped.
- Removed an unintended ±8 hard clip in the managed processors. Floating-point signals can legitimately exceed full scale between stages; later gain can restore headroom. That old clip permanently changed hot signals before later attenuation. A 100x linear NAM regression proves waveform preservation and bypass at 44.1/48/96 kHz and 32/64/128 frames.
- Final ±0.95 output protection remains a hard ceiling. A new peak hold measures the signal **before** that ceiling. The React warning stays visible until acknowledged. **Lower master output** uses the measured peak plus headroom to lower only the global master, within its existing −30 dB minimum. It changes neither input trim nor capture drive, EQ, calibration or patch data. Recheck after playing harder or changing patches; it is not an automatic limiter.

The original NAM playback DLL and model weights are unchanged. Effects are rebuilt and regression-tested, but no effect algorithm was modified. Play-along still mixes after guitar effects. No guitar buffering or lookahead was introduced.

## Using the result

Keep your current IR and play the problem patch in Alpha 23. If **Output clipped** appears, choose **Lower master output**, then play again. Recover listening volume at the monitor/interface control if necessary. Raising the app's master into the ceiling recreates the distortion. If it still clips at −30 dB, lower device output levels.

Input gain has a different purpose: it changes what the NAM model receives and therefore its breakup. A bright or overdriven result without output clipping may require checking physical interface gain, input calibration, capture-specific instructions, routing or IR choice. An amp+cab capture already includes speaker filtering; a second cab adds filtering again. Do not automatically remove a user's IR or alter their calibration.

## Reproducing the audit

From the repository, using the documented native toolchain:

```powershell
powershell -File native/build-nam.ps1 -Reference
python scripts/audit-nam.py C:/models/amp.nam
python scripts/audit-ir.py C:/models/cab.wav
native/dist/FreeRig.exe --audit-chain C:/models/amp.nam C:/models/cab.wav
native/dist/FreeRig.exe --self-test
```

The reference build writes `GuitarNamReference.dll` beside the playback DLL; it does not replace it and is excluded from releases. The IR audit uses NumPy in the developer environment only (BSD-3-Clause); no new runtime dependency is shipped. `--audit-chain` requires the files in one directory and writes `capture-chain-audit.txt` beside the executable. No command opens audio hardware, records the user or uploads captures. User model/IR files are not included in release source archives.

Reference behaviour: [NAM plugin input/output gain implementation](https://github.com/sdatkinson/NeuralAmpModelerPlugin/blob/main/NeuralAmpModeler/NeuralAmpModeler.cpp). Its optional loudness-normalised output differs from FreeRig's raw output plus explicit device/master controls; perceived loudness across loaders is not automatically equal.

## Limits

Offline synthetic signals and browser fixtures do not establish live ASIO timing, the current hardware gain, monitor behaviour or subjective tone. The user's exact live harshness remains unconfirmed until the same patch is played with measured headroom. These changes correct a demonstrated internal clipping defect and make final overload observable without changing NAM's processing quality.

## Drive-before-amp investigation (28 September 2026)

The subsequent report concerns stock Scream Drive and a saved Tube Screamer capture. Scream Drive uses Guitarix's **Screaming Bird treble booster**, not a Tube Screamer. The downloaded pack is **Fortin Modded TS-9 Tube Screamer**, with `Fortin_TS9_1`, `_2` and `_3` models. None contains `input_level_dbu` or `output_level_dbu`; FreeRig therefore applies no inferred calibration. The model metadata's `gain` and `loudness` fields are not physical calibration references.

The editor's **Input trim** adjusts signal level before inference. It does not recreate the captured pedal's physical Drive knob. Lowering trim cannot select a different captured setting; that requires selecting another saved model. Pedal Output controls how hard the following amp is driven, while master output controls listening level after the chain.

Developer diagnostics added (no playback DSP changes):

```powershell
python scripts/audit-drives.py
native/dist/FreeRig.exe --audit-drive-chain C:/models/amp.nam C:/models/cab.wav GXScream
native/dist/FreeRig.exe --audit-drive-chain C:/models/amp.nam C:/models/cab.wav pedal.nam
```

For a captured pedal, supply its filename in the same directory as the amp/IR. Reports are written beside the executable as `drive-chain-<key-or-filename>-audit.txt`. The stock-drive script uses the existing developer NumPy dependency; it checks minimum drive, stereo equality, finite output, block invariance and reports DC/silence levels without imposing a subjective tone target.

Results:

- All six Guitarix drives produced exactly identical samples at 32/64/128 frames at each of 44.1/48/96 kHz. This does not compare against recordings of hardware circuits.
- All three TS-9 captures matched the separate generic NAM engine at 48 kHz, 32/64/128 frames. Worst absolute error was 2.44e-7; in-place processing was identical.
- Each of the six stock drives and three captured pedals, followed by the Hendrix 1959JMH NAM and Marshall G12M/M201 IR, matched separate sequential processing exactly at 32/64/128 frames. The amp and IR were not skipped in these constructed series patches.
- Added routing regression coverage: inserting a stock or captured drive preserves the amp/IR assets, their scene settings, and the series path with no pedal-to-output bypass branch.

The user's actual patch, gain settings and live playing have not been reproduced. No engine fix is claimed from these passing diagnostics, and no calibration, tone compensation or model weights were changed. The next step is the affected saved patch and its current pedal/amp trims, rather than guessing a new input attenuation.

### Exported JCM Patch examined

The supplied export selects Crunch (scene index 1): gate → Fortin_TS9_1 → JCM800 → Floaty Delay → V30 IR → Dragon Room. There is no pedal-to-output bypass route. Pedal trims are 0/0 dB, but the amp has +5.1 dB input and +6 dB output. The amp's saved metadata identifies **Marshall Jcm800 + V30 1960**, an amp+cab capture, so the additional V30 IR filters the cabinet sound a second time.

The new developer command renders this saved serial chain, compares each stage with sequential processing, and measures pedal-on/off variants:

```powershell
native/dist/FreeRig.exe --audit-patch "C:/path/FreeRig patch.json" C:/path/Library
```

It writes `saved-patch-audit.txt` next to the executable. It is a narrow diagnostic for a serial four-or-eight-scene patch with one captured pedal; it does not claim to validate arbitrary parallel routing. It additionally renders stored scenes 1–4. Dragon Room's random modulation means independently constructed wet tails differ; deterministic stages are checked separately, with exact agreement through the extra cabinet at 32/64/128 frames.

With the same synthetic chord used above, the TS9 reduced pre-amp RMS by 12.89 dB (−26.68 to −39.57 dBFS). The active saved chain's RMS drop after the amp was 5.43 dB. The additional IR raised the delayed signal from −23.37 to −2.37 dBFS RMS despite its −3 dB output control; it reached a 2.83 peak before the reverb. This proves the tested level drop and hot downstream signal, not the user's live output clipping: master gain and hardware gain are absent from the export.

A separate, untracked `releases/diagnostics/JCM TS9 comparison.json` keeps the original model files and routing, bypasses the extra cab/delay/reverb, sets amp input/output to 0/−6 dB, and offers pedal bypass/raw/+6/+12 dB output scenes. The gain steps are explicit listening comparisons, **not inferred physical pedal calibration**. The original export and saved app patch are not edited; no playback DSP change or new app release accompanies this investigation.
