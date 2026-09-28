# Working on FreeRig

Start with [the architecture map](docs/ARCHITECTURE.md) and [adding a pedal](docs/ADDING-A-PEDAL.md).

## Source rules

- Keep a file focused on one responsibility. Separate presentation, saved patch data, native messaging and audio processing.
- Add new interface work as React components in `ui/src`. The classic scripts are a compatibility layer; do not expand their shared state for new features.
- Add DSP through the `Effect` interface and native registry. Each effect has its own descriptor in `effects/`.
- Use descriptive names and explicit units. Keep parameter ordering and persisted keys stable; changing either requires a migration.
- Comment purpose, ownership, units, invariants and surprising decisions. Do not narrate obvious statements or leave obsolete code commented out.
- Never hand-edit generated files. Regenerate them using the documented build commands.
- Preserve upstream notices. Do not run formatters over `native/vendor`, dependencies, releases or generated bundles.
- Preserve audio processing arithmetic during structural refactors. Do not add allocation, file/network I/O, logging or new blocking operations to the audio callback.
- Keep saved patches, scenes, bypass transitions and native message contracts compatible unless a deliberate migration is included.

## Before finishing a change

Run `npm run check`. For native edits also run `npm run format:native:check`, build the desktop app and run its offline self-test. For DSP edits rebuild effects and test relevant sample rates, small buffers and transitions. Exercise affected UI interactions in the browser or desktop; do not claim live ASIO listening was tested by an offline render.

Update documentation and CHANGELOG for behaviour or architecture changes. Keep commits focused. Do not add new dependencies without explaining their purpose and licence.
