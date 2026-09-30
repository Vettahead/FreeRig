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

## Alpha 30 cable detail

The supplied pedalboard reference calls for closely spaced hardware and short right-angle leads. Cables now connect only occupied neighbours on the same rail. Empty positions have no sockets; row changes are visually routed beneath the board. The numbered stages remain authoritative for signal order. Legacy SVG anchors compensate for transparent canvas margins; raster anchors follow the enclosure profile. Plug bodies use a metallic gradient, collar and dark strain relief.

Alpha 31 keeps all four positions on one rail. Narrow boards scroll horizontally rather than wrap; plug measurements include the board scroll offset.

## Alpha 33 loop placement

The loop tray sits above the main rig in DOM and visual order. Its send/return labels sit underneath and point towards the amp/cab station below. This is presentation only: section IDs, drag targets and amp → loop → cab processing order are unchanged.

## Alpha 34 hardware pickup

`ui/src/board/DragPreview.tsx` owns a short-lived React artwork layer, original-size grab offsets, shadow/tilt, target feedback and landing/cancel cleanup. The existing `prototype/gear-drag.js` gesture adapter calls this presentation bridge and remains the sole owner of drop/remove commands, pointer capture and click suppression. The preview is inert, ignores hit testing and never moves the actual board DOM. Reduced-motion preferences skip lift/landing animations; pointer tracking is immediate. Horizontal auto-scroll also recognises the physical deck rails.

Alpha 35 adds `hardwareSway.ts`: a time-based damped angular spring pivoting at the grab point. Wide heads use a gentler angle and slower response. The visual spring pauses at rest and cancels on release; the host follows the pointer immediately. Reduced motion skips the spring.
