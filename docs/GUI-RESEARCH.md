# Modeler GUI research — 27 September 2026

The goal is fast, predictable editing at 1080p, with the selected physical device as the main control surface. These are interaction principles, not copied product artwork or claims of identical functionality.

## LAVA Studio — main interaction reference

The official beta manual, pages 17–21, describes a left-to-right chain, drag repositioning, same-type model replacement, input/output meters, a visible DSP percentage and a separation between regular and advanced controls. It also describes optional automatic amp/cab pairing. These support a simple default rig view with clearly available deeper tools.

Applied: contextual replacement (existing), on-device controls (existing), clearer input/output and processing meters, less persistent chrome, collapsible library and genuine fit-to-window routing. Next: a single content browser for patches/devices, stronger favourites/search, and a device editing workspace that keeps a compact routing overview visible. Automatic cab matching should be optional, never replace a user's IR unexpectedly.

Source: [LAVA Studio official manual, beta 1](https://attach-intl-cdn.lavamusic.com/attach/10001/20251107/818353f8b791418cc321b7ccc729c321.pdf). This dated manual is used for interaction patterns, not current model counts or hardware performance figures. [Current official product page](https://www.lavamusic.com/lava-studio).

## Quad Cortex / Cortex Control

The manual separates preset, scene and stomp modes. Scenes change parameters within a preset; banks organise preset recall. A block opens its contextual parameter editor, while the desktop editor retains a grid overview. CPU monitoring and a directory for presets/captures/IRs are explicit tools.

Applied: distinct bank/patch and scene navigation, eight optional scene slots, contextual editors and audio workload visibility. Next: a larger Perform view with scene assignments, clear dirty/save state, and MIDI control. Our meter measures callback deadline usage, not a directly comparable Quad Cortex CPU percentage.

Source: [Quad Cortex 4.1.1 manual](https://neuraldsp.com/manual/quad-cortex), Scene Mode, Parameter Editors, CPU Monitor, Directory and Cortex Control sections.

## Darkglass Anagram

Its scene model changes bypass/parameters within the same preset and signal path. This supports keeping our routing patch-wide and changing only control snapshots during scene recall.

Source: [Official Anagram manual](https://api.darkglass.com/static/Anagram-Manual.pdf), Scene Mode.

## Design rules

1. Patch, scene and individual device changes must look and behave distinctly.
2. One click selects gear; its knobs are the controls. Secondary options stay collapsed.
3. Display useful levels and load without filling the page with diagnostics.
4. Fit the normal rig at 1080p and 1280×800. Keep the library independently scrollable and collapsible.
5. Keep keyboard focus, outside dismissal, Undo and saved state predictable.
6. Label incomplete practice tools and live-performance limits honestly.
7. Preserve known-good audio behaviour while iterating on the visual workspace.
