# FreeRig

A Windows guitar suite with a WebView2/React interface, native ASIO / Windows audio, NAM captures, cabinet IRs, stock effects, patches/scenes and optional TONE3000 downloads. Local models and effects work offline.

## Run

Open `releases/FreeRig-alpha-21/FreeRig.exe`. Keep the whole release folder together. Use **Setup wizard** in the toolbar for audio and TONE3000 setup. Older releases remain available for comparison.

## Audio compatibility

Audio setup now offers ASIO or Windows audio (WASAPI shared input). Select a recording device/channel and output, then press Start. Manufacturer ASIO remains the recommended route for responsive playing; Windows audio broadens compatibility without another driver installation. Installed universal ASIO drivers such as FlexASIO appear in the ASIO list. See [Audio setup](docs/AUDIO-SETUP.md) for latency, privacy and testing limits.

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
