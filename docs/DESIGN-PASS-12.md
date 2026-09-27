# Studio design pass

## Alpha 12 — studio design pass (27 September 2026)

Run **releases/GuitarSuite-alpha-12/GuitarSuite.exe**. This is a UI-only release using the unchanged alpha 11 executable and audio libraries; the native window title may still say alpha 11. The in-app footer identifies design build 12.

- Cleaner LAVA Studio-inspired workspace, with original hardware finishes informed by Chris's amp/pedal references: inset grilles, brushed panels, cast enclosures, more substantial knobs and contrast-aware pedal lettering. Stock reference images are not distributed.
- Docked equipment editor with a device overview strip and a Routing button. The strip is a device selector, not a representation of cable topology; the full routing board remains the source of truth.
- Devices/Patches collection tabs; search saved patches across banks and recall directly. Existing bank storage, recovery, save and import/export remain in use.
- Large Perform scene pads for four or eight scenes, with bypassable devices below. Scene dispatch and audio behaviour are unchanged.
- Checked at 1920x1080 and 1280x720. Amp and cab controls fit at 1080p; short windows use compact chrome and vertical scrolling for options or tall gear. Existing twenty appearance choices and colour overrides remain available.

Validation: nine JavaScript suites pass. Browser checks cover numeric knob edits, dirty/save state, device selection, patch search/recall, contextual Drive replacement, eight-scene Perform selection and 1080p geometry. Native binaries are hash-identical to alpha 11; no live ASIO playback was started. Powercab USB latency and full live scene-transition qualification remain outstanding.

The source of visual direction is the official LAVA manual documented in GUI-RESEARCH.md and user-provided reference images. Hardware remains original CSS/SVG with existing original textures; no watermarks were removed and no stock assets were bundled. No new runtime dependency was introduced.
