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
