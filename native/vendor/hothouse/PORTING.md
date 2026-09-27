# FreeRig Hothouse ports

Upstream: https://github.com/clevelandmusicco/HothouseExamples
Revision: ff2b5ac0874fd03557eece62dbb3c784562cb7ee
Licence: GPL-3.0-or-later (individual source notices retained).

Original hardware firmware remains under src/. Portable headers extract the processing structures, remove GPIO/control code, and use local sine/triangle LFO and linear delay helpers. Stereo uses independent channel state. EchoKing timing/envelope/DC-block coefficients scale from the upstream 48 kHz values to the host rate; delay storage scales with rate. The exposed EchoKing mode is normal echo, without SOS/preamp-only switches. Photon Vibe uses the vintage 6:1 LDR response. TriPhase runs all three models continuously and crossfades model selection. Host parameters are smoothed where continuous. These are FreeRig adaptations, not an endorsement or a claim of measured equivalence to original physical pedals. Names identify the source algorithms; no manufacturer artwork or logos are used.
