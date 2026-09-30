# FreeRig

A Windows guitar suite with a WebView2/React interface, native ASIO / Windows audio, NAM captures, cabinet IRs, stock effects, patches/scenes and optional TONE3000 downloads. Local models and effects work offline.

## Run

Open `releases/FreeRig-alpha-40/FreeRig.exe`. Keep the whole release folder together. Use **Setup wizard** in the toolbar for audio and TONE3000 setup. Older releases remain available for comparison.

Alpha 29 arranges the rig as connected physical pedalboards around an amp/cab stack, with an attached effects loop. Alpha 33 places that loop above the main rig. Alpha 35 adds natural, damped sway to the hardware pickup and landing feedback. See [pedalboard design](docs/PEDALBOARD-DESIGN.md).

Alpha 32 extends realistic hardware artwork across the complete collection, with distinct amp/pedal families, ten cabinet geometries and live controls. See [hardware design](docs/HARDWARE-DESIGN.md) for scope, extension points and artwork provenance.

Alpha 38 keeps editing inside the pedalboard workspace, with a slide-up chain and hardware controls. Click the selected chain device again to return to the full layout. Alpha 36 introduced device controls in a slide-up editor with a compact chain, input/output dials and meters. Click outside or press Escape to return to the rig. Alpha 37 brings the same input/output dials and meters to the main rig, replacing the long sliders.

Collection and the replacement picker offer **Amp source**: All amps, Modelled, or TONE3000 only.

Alpha 40 keeps device settings alongside the hardware on one page. Pedals group labels, knobs and values above the name and footswitch; amps use a dedicated control strip. The optional guide expands in the settings column.

## Audio compatibility

Audio setup now offers ASIO or Windows audio (WASAPI shared input). Select a recording device/channel and output, then press Start. Manufacturer ASIO remains the recommended route for responsive playing; Windows audio broadens compatibility without another driver installation. Installed universal ASIO drivers such as FlexASIO appear in the ASIO list. See [Audio setup](docs/AUDIO-SETUP.md) for latency, privacy and testing limits.

## Capture sound and levels

Alpha 23 preserves floating-point headroom between devices and holds output-overload readings. If **Output clipped** appears, **Lower master output** reduces listening level without changing capture drive. See [the capture audit](docs/CAPTURE-FIDELITY.md).

That guide also documents the drive-before-amp investigation and offline comparisons. A captured pedal's **Input trim** changes its input level, not its original physical Drive setting.

## Tags and capture controls

Tag patches and devices by artist, band or style, search tags in Collection, and optionally apply a patch tag to its devices. Captured pedals offer explicit level comparison; drag devices up/down in the editor strip to bypass/enable them. See [the guide](docs/TAGS-AND-CAPTURE-LEVELS.md). Included in Alpha 24.

## Effects collection

Alpha 24 includes **200 native stock processors**, plus the existing built-in devices. EQ, studio dynamics, drive/fuzz, filters/wah, chorus/phaser/flanger/rotary, delay/reverse/granular, reverb/shimmer, pitch, synth, stereo, tape/lo-fi and a practice looper are covered. Each has its own descriptor and source credit. See [the collection and research](docs/EFFECTS-COLLECTION.md) for coverage, licences and limitations.

## Play along

Use **Play along** in the toolbar to mix another app into your output, with its own stereo level and mute. Route the app to a separate playback device first. See [the setup guide](docs/PLAY-ALONG.md).

## Project setup

For a new Freerig conversation, use [Project context](docs/PROJECT-CONTEXT.md) as the reference brief and [Project instructions](docs/PROJECT-INSTRUCTIONS.md) as its working instructions. The conversation project is separate from the local source folder; select this repository for coding work.

## Edit the source

- [Architecture map](docs/ARCHITECTURE.md): where each part lives and how it connects.
- [Contributing](CONTRIBUTING.md): dependencies, build commands and checks.
- [Add a pedal](docs/ADDING-A-PEDAL.md): native processor, definition, presets and tests.
- [Coding rules](AGENTS.md): standards for future human and assistant changes.
- [Native build details](native/README.md): compiler/dependency setup and audio notes.

The files to edit are `ui/src`, `src/legacy`, `effects` and the organised folders under `native`. Some large files in `prototype` are **generated runtime bundles**. Their headers identify the source; do not hand-edit them.

```powershell
npm ci
npm --prefix ui ci
npm run build
npm run check
```

Building native code also requires the documented Windows toolchain/dependencies. See Contributing before changing DSP.

## Alpha 20 source reorganisation

Audio graph, device processors, patch data, host messages and services now have separate source files. Stock effects have individual descriptors and one native factory registry. Formatting and generated-file checks help prevent another monolithic source file. The legacy interface remains an explicitly documented compatibility layer while React migration continues.

This refactor preserves patch keys, parameter order, processing maths and the existing interface. It does not claim new audio quality or lower latency.

## History and licences

See [CHANGELOG](CHANGELOG.md) for changes and [earlier release notes](docs/RELEASE-HISTORY.md) for the detailed development history. Upstream effect licences and revisions are recorded in `native/vendor`; packaged notices are in each release's `licenses` folder. The project licence is in [LICENSE](LICENSE).

Alpha 25 adds Studio factory tags, detailed effect guides and measured DSP-cost filters. See [effect browsing](docs/EFFECT-BROWSING.md) and [non-NAM amp/cab research](docs/AMP-CAB-RESEARCH.md).

## Circuit amps and recorded cabinets

Alpha 26 adds all 13 Tamgamp circuit preamps/channels and five cabinet/speaker configurations with 21 recorded microphone setups. Open Collection → Amps or Cabs. Cabinets offer two microphone selectors, blend, polarity and output; settings belong to scenes. See [the models, controls and validation](docs/CIRCUIT-AMPS-AND-CABS.md).

## Release history

Click the version at the bottom-left to read and search the complete offline changelog. The current version comes from `release.json`; update its number and add matching release notes to `CHANGELOG.md` for every release, then run `npm run build`. Builds/package checks reject stale history or mismatched numbers. See [the release workflow](docs/RELEASING.md).
