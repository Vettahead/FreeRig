# Connected pedalboard — Alpha 29

## Design decisions

The user's BIAS FX reference makes pedals readable as objects sitting on rails, joined by short patch cables. Alpha 29 applies that to the normal board: before-amp effects on the left, amp above its cabinet in the middle, after-cab effects on the right, and a smaller send/return tray attached below. Stage numbers and the full signal-order line distinguish physical placement from processing order. Empty loop slots take less space; a populated loop expands to show its gear.

Both main boards read left to right, then continue on the next row. Short leads include plugs at the artwork edges; return leads use the gap between rows. Empty positions are visual pass-through slots, not new processors. Multiple amps remain individually selectable; multiple cabinets remain parallel and visibly labelled as summed. At smaller widths the layout stacks vertically and retains scrolling rather than shrinking every target indefinitely.

Combo presentation follows the selected hardware appearance. It shows the existing combo enclosure and a compact, separately editable cabinet-processing area. This is a cosmetic grouping, not proof that an imported capture includes a cabinet. Existing combined-capture and unloaded-IR notices remain authoritative.

The effects loop is **after the complete amp processor, before the cabinet**. It cannot insert effects between a NAM capture's internal preamp and power amp. Existing capture/model DSP is unchanged.

## Research

- [BIAS FX signal path management](https://help.positivegrid.com/hc/en-us/articles/360025357751-Signal-Path-Management): drag reordering, replacement and bypass on the gear, with a middle-FX position in dual paths. Adopted direct manipulation; retained FreeRig's existing single-click editing and drop-to-replace contracts.
- [AmpliTube 5 specifications](https://www.ikmultimedia.com/products/amplitube5/?p=specs): resizable gear interface with custom routing and separate cabinet/microphone editing. Adopted a clear physical station with detailed controls opened only when needed.
- [Quad Cortex manual](https://neuraldsp.com/manual/quad-cortex): the grid and custom routing offer flexibility. FreeRig keeps its Advanced routing view for that job rather than making decorative leads imply arbitrary connections.

No competitor artwork or assets were copied. Existing original Alpha 28 artwork and the compatibility illustrations are reused; this release is a layout pass, not a reskin of every processor.

## Implementation

`ui/src/Board.tsx` owns stage composition and retains established block/slot attributes used by pointer dragging and menus. `ui/src/board/PedalDeck.tsx` owns deck presentation and cable measurement. Its ResizeObserver responds to enclosure and container size changes; SVG leads are noninteractive and do not intercept drag targets. Measurements use visible artwork edges and slot row bounds. No animation loop, new dependency, persistence migration or native audio work is introduced.

`stage.css` is scoped to the physical board. The old positional slide animation was removed because transformed intermediate rectangles can leave patch leads at the wrong position after a resize/drop. Hover and focus feedback remains; motion is not required to understand routing.

Changing arrangement must continue through the existing command/drag model. Custom graphs are shown by Advanced routing and are not represented by the decorative serial leads. Do not add cables to the audio graph from the presentation layer.
