# Pedalboard workflow

## Alpha 13 — pedalboard and amp FX loop (27 September 2026)

Run **releases/GuitarSuite-alpha-13/GuitarSuite.exe**. The native window title and UI now both identify Alpha 13.

The normal routing workspace is a pedalboard: amp/cabinets on an upper shelf, and four initial pedal slots in each of Before amp, Amp FX loop and After cab. Numbered stages and left-to-right row arrows replace the screen-wrapping patch cables. Input/output trim remains above the workspace. Multiple cabinets share their input and their outputs are summed.

The processing order is Input → Before amp → Amp → FX loop → parallel cabinets → After cab → Output. Moving pedals to an empty slot reconnects them at that stage; dropping onto a device replaces it; dragging off the board removes it. Scene settings survive moves. The FX loop is after the whole amp model, not an internal preamp/power-amp split or a physical interface send/return. Existing saved delays are not moved automatically.

Advanced routing retains manual cables and Keep cables when moving. Custom patches open there automatically, preserving their connections. Switching a custom patch to pedalboard order requires an explicit action in a dialog; Undo restores its previous routing. The simple board always reconnects a move, even if Keep cables was enabled in Advanced mode. Existing patches and bank storage remain compatible.

Validation: ten JavaScript suites pass, including new tests for loop order, parallel-cab fanout, removal, saved loop slots, scene preservation and custom graph preservation. Browser testing moved Tape Echo into the loop, verified amp → delay → both cabinets → final effects in the cable list, checked the custom conversion dialog, save/reload and all three rows at 1920x1080 without page horizontal overflow. At 1280x720 the complete board is usable with main-pane vertical scrolling. Native offline regression passes after rebuilding the host to correct its title. Audio DSP source and native model/effect DLLs are unchanged. No live ASIO playback was started; hardware listening and existing Powercab/live-scene follow-ups remain outstanding.

