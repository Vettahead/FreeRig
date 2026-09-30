# Non-NAM amps and microphone-aware cabinets

Research checked 30 September 2026. These are integration candidates, **not new
models shipped in Alpha 25**. Source availability, circuit detail, controls,
licensing, existing tests and suitability for small live buffers matter more
than GitHub stars. No claim that any candidate has been auditioned against the
physical hardware in FreeRig.

## Amp shortlist

| Source                                                | Useful material                                                                                                                                                                                             | Decision                                                                                                                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Guitarix](https://github.com/brummer10/guitarix)     | Established C++/Faust DSP and component-based tone networks. Already supplies several FreeRig drives.                                                                                                       | Primary source family to investigate for circuit-derived amps. Retain each module's notices and identify the exact circuit/stages.                                         |
| [Tamgamp](https://github.com/sadko4u/tamgamp.lv2)     | Guitarix DK Builder chains and tuned Guitarix implementations. Explicitly **preamp only**; generic gain/Bass/Middle/Treble and level correction.                                                            | Strong starting source for ten preamp ports; not ten complete amps with original front panels.                                                                             |
| [SwankyAmp](https://github.com/resonantdsp/SwankyAmp) | Faust DSP derived by fitting empirical models to SPICE simulations. Includes preamp/power-amp drive, sag and tone-stack work. [GPLv3 source](https://github.com/resonantdsp/SwankyAmp/blob/master/LICENSE). | Investigate as a full, configurable amp architecture. Its available code does not include all the experimental fitting work and is not a set of ten verified brand clones. |
| [BYOD](https://github.com/Chowdhury-DSP/BYOD)         | Circuit-based distortion and tone-shaping modules; GPLv3/dual-licensed project.                                                                                                                             | Useful circuit reference and individual modules, not an automatic ten-amp collection.                                                                                      |
| [TooB](https://github.com/rerdavies/ToobAmp)          | Separate Fender/Marshall/Baxandall tone stack and cabinet IR processors. Its ML/NAM amps remain neural models.                                                                                              | Useful DSP references; exclude neural amps from this requested circuit-model bank.                                                                                         |
| [spiceAmp](https://github.com/olegkapitonov/spiceAmp) | ngspice-based offline amp simulation.                                                                                                                                                                       | Reference renders/circuit experiments, not the live engine.                                                                                                                |

Ten initial **preamp** candidates from Tamgamp: Princeton AA1164, Twin AA769
Normal, Twin AA769 Vibrato, JCM800 high input, JCM800 low input, Mesa DC3 rhythm,
Mesa DC3 lead, Dual Rectifier orange, Peavey 5150II lead and AC30 Brilliant.
That is six amp families with channel/input variations, not ten unrelated
physical amps. Its reverb and cabinet are not included. Adding full power-amp
behaviour needs separate engineering and comparison tests.

## Original controls

The UI must follow the implemented circuit, including tone-stack position,
interacting pots, channel switches, presence and master-volume behaviour.
[Guitarix's tone-stack source](https://github.com/brummer10/guitarix/blob/master/trunk/src/faust/tonestack.dsp)
contains component values for several families, including Mesa Mark; a tone
stack alone is not an amp. A Mesa Mark-style graphic EQ is a separate circuit
from its bass/middle/treble controls. Do not give every Mesa a decorative
five-band EQ or describe a generic post-EQ as the original circuit.

Acceptance before a port becomes stock: preserve native parameter meaning;
compare sweeps and level-dependent transfer against upstream; check aliases,
noise, denormals and stability at 44.1/48/96 kHz and 32/64/128 frames; test
drive-to-amp-to-cab routing, bypass, scenes, loading and output level. Follow
with matched-level listening. Keep input calibration explicit.

## Cabinets and microphones

[OrbitCab](https://github.com/darwinscat/orbitcab) has dual IR slots, blend,
alignment, phase and filtering. It is an AGPL project, and its preamp bank is
NAM-based, so it is not a substitute for the requested amp models.
[Flo's God's Cab plugin](https://flos-audio-plugins.eu/index.php/audio-plugins/god-s-cab)
demonstrates two independently adjusted mic channels and a room mic. However,
the developer marks it beta and offers GPL source by contact rather than a
ready public GitHub integration. The recordings' redistribution terms need
their own check.

[Jester Dyne's Jensen SM57 measurement](https://freesound.org/people/jesterdyne/sounds/116743/)
and [ENGL V30 measurement](https://freesound.org/people/jesterdyne/sounds/116735/)
are promising source recordings. [Axion's attribution list](https://axion.cab/about)
lists 14 Jester Dyne cabinet IRs with CC BY 4.0 credit across Jensen, Celestion
4×12 and ENGL V30 families, with dynamic/condenser choices and centre/edge
variants. Verify each original download and its licence before bundling;
14 microphone captures do **not** mean 14 cabinets.

[GuitarPedal](https://github.com/torvalds/GuitarPedal) is another physical-cab
research lead with a native validation bench. Its embedded assumptions and
actual microphone model need source-level evaluation before selecting it.
OpenRig's large named bank includes many captures; a name or mic-position knob
does not establish a complete physical cabinet model or asset redistribution
rights. TooB explicitly distinguishes its IR convolver from its lightweight
CabSim; keep that distinction in FreeRig too.

Proposed ten-cab coverage targets: open-back American 1×10, American 1×12,
American 2×12, tweed 4×10, British Alnico 2×12, Greenback 4×12, G12T-75 4×12,
V30 oversized 4×12, V30 compact 2×12 and bass 8×10. This is a sourcing target,
not a claim that ten qualifying redistributable multi-mic packs were found.

Recommended implementation: one cabinet owns a measured IR matrix, mic model,
centre-to-edge position and recorded distance; two mic channels have blend,
polarity and alignment. Missing combinations must be unavailable, not silently
invented. Interpolation needs phase/time alignment and level handling. A
single static IR cannot yield arbitrary physically accurate microphones or
positions by changing a treble filter. Cabinet convolution itself is non-NAM.

## Decision

Prioritise a validated circuit-amp port and a small, properly sourced multi-mic
cabinet set before expanding to ten each. The current research does not support
shipping ten supposedly authentic complete amps and ten movable-mic cabinets
without additional porting, asset verification and listening tests.

## Alpha 26 implementation

All 13 pinned Tamgamp preamps and five Jester cabinet configurations are now implemented. See [the implementation guide](CIRCUIT-AMPS-AND-CABS.md) for exact scope and limitations; the other candidates above remain research.
