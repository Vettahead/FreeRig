# Effect guides, Studio tags and DSP cost

Alpha 25 adds a factory **Studio** tag to 41 recording/mix-focused processors.
Studio shows them together; their original EQ/dynamics/stereo/etc. categories
remain useful. Studio means intended recording use, not incompatible with
guitar. User tags remain independent, searchable and portable. Factory tags
are identified as such in the editor and cannot be removed accidentally.

Every native effect has a description and expandable playing guide with
placement advice and its actual exposed control ranges/defaults. The 156
new Airwindows imports include their original developer manuals, attributed
separately. Legacy stock pedals have expanded descriptions too. Descriptors
remain individual files in `effects/`; common guide formatting lives in
`scripts/effect-guides.mjs`. No DSP arithmetic or patch keys changed.

**Quality · DSP cost** filters the collection and replacement picker together:
Light, Moderate, Heavy or Unmeasured. It is computational cost, not a quality
rating. Imported captures and older built-in blocks are unmeasured; do not
assign a capture the cost of a different model. Device details show the
measured microseconds, separately from latency.

The offline reference at 48 kHz / 128 frames uses warmed factory settings:
five timed runs of 500 blocks after warm-up, median per-block time including
Python input-copy and DLL-call overhead. Fixed bands: Light <25 μs, Moderate
<100 μs, Heavy ≥100 μs. Result: 186 Light, 12 Moderate, 2 Heavy. The benchmark
does not open ASIO and does not measure whole-rig deadlines, worst-case
settings, minimum latency or audio quality. Use the live Audio load meter for
the actual rig/device/buffer combination.

Regenerate explicitly with `python scripts/benchmark-effects.py` (NumPy
required) after building `native/dist/GuitarEffects.dll`. `effects/dsp-costs.json`
records the DLL hash, processor and method. `npm run build` consumes this report;
it never benchmarks during ordinary builds or inside the audio callback. A new
effect without a benchmark is Unmeasured.

New library controls live in React. Legacy rendering calls a narrow predicate
and refresh adapter; filter changes do not update a patch or restart audio.
The UI build now bundles imported CSS instead of overwriting it with a single
file, allowing each component to own its styles.
