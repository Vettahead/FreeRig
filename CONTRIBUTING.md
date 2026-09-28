# Contributing to FreeRig

The readable source is organised by responsibility. Start in `ui/src` for React, `native/Audio` for the engine, and `effects` for stock pedal definitions. See [Architecture](docs/ARCHITECTURE.md).

## Install and build

Windows, Node.js/npm and the existing native dependencies are required. Install JavaScript dependencies with `npm ci` and `npm --prefix ui ci`.

```powershell
npm run build
npm run format
npm run format:native
npm run check
npm run format:native:check
powershell -File native/build.ps1
```

`native/build.ps1` uses the dependency layout described in [native/README.md](native/README.md). It builds the desktop host and copies UI assets; it does not rebuild C++ effects or NAM. For effects changes, run `native/build-effects.ps1` first, then `npm run build`, then `native/build.ps1`.

Run the desktop engine checks without starting live audio:

```powershell
$p = Start-Process native/dist/FreeRig.exe -ArgumentList '--self-test' -WindowStyle Hidden -Wait -PassThru
$p.ExitCode
Get-Content native/dist/self-test.txt
```

The JavaScript tests run from `prototype` because existing fixtures use relative paths. The root test command handles this automatically.

## Editing safely

Read [AGENTS.md](AGENTS.md) for the coding rules, which apply to both people and coding assistants. Use small, named functions and focused components. Comments should explain why a constraint exists, what owns a resource, or what units a value uses. Remove obsolete code instead of leaving disabled blocks.

Before adding a pedal, follow [the pedal guide](docs/ADDING-A-PEDAL.md). Update existing tests when behaviour changes, and add regression coverage for a meaningful new contract. Avoid tests that merely duplicate implementation text.

Generated `prototype/app.js`, `prototype/gear-looks.js`, `prototype/effects-catalogue.js`, `prototype/react-ui.js`, `prototype/react-ui.css` and `native/effect-presets.json` are committed runtime outputs. Edit their sources, rebuild, and include the resulting changes. Large minified release bundles are normal; they are not the files contributors should edit.
