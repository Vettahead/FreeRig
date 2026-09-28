# Adding a stock pedal

Use an existing small adapter and descriptor as a working example: `native/effects_spring.cpp` and `effects/fx-Spring.json`. Upstream algorithms belong in `native/vendor` with their licence and source revision recorded; our adapter belongs in owned source.

1. Implement `Effect` from `native/effects.h` in a focused `native/effects_<name>.cpp` file. Define parameter names, units, ranges and defaults in a stable order. Allocate buffers at construction/preparation time, implement `set`, `process`, and report actual processing latency. Preserve stereo and bypass expectations.
2. Declare the factory in `effects.h` and add one entry to `effects_registry.cpp`. Both loading and the exported catalogue use this table. Use a stable unique key; saved patches depend on it. The build discovers `effects_*.cpp` automatically.
3. Run `native/build-effects.ps1`. This rebuilds the DLL and exports its parameter catalogue. Do not edit the generated parameter JSON by hand.
4. Add `effects/fx-<key>.json` and list it in `effects/index.json`. Copy a similar descriptor for its schema: display name, category, engine credit, colour, presets, type, detail and icon. Do not include `params` or `latency`; the generator obtains those from the native processor. Preset values must match native parameter order and limits.
5. Run `npm run build`. Generic effect controls are generated from the catalogue. A special UI belongs in a dedicated React component. Tempo synchronisation is not automatic: inspect the existing tempo conversion in the processor before enabling a new sync control.
6. Rebuild the desktop host with `native/build.ps1`, then run `npm run check`, native formatting checks and `FreeRig.exe --self-test`. Add relevant offline regression tests in `native/Tests`, including finite output, parameter extremes, bypass and transitions. Test 44.1/48/96 kHz and 32/64/128-sample buffers where supported. Verify delay/reverb tails, parallel latency and scene changes. Listen on the actual interface before claiming live readiness.
7. Update vendor notices/provenance, README or effect documentation, and CHANGELOG. Include generated outputs so offline desktop packaging contains the new effect.

Existing built-in legacy devices are defined separately in `prototype/rig-model.js` and `native/Audio/Processor.cs`. Prefer the `Effect` adapter path for new stock pedals instead of growing the legacy processor switch.

A descriptor alone does not create a new sound processor. Conversely, registering native DSP without a descriptor fails catalogue generation, so the UI and engine cannot silently drift apart.

Curated `defaults` are the initial playable values in native parameter order. They can differ from an upstream algorithm’s raw defaults, but must stay within its limits. The generator validates these alongside named presets.
