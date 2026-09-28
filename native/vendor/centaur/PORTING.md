# Centaur circuit port — 28 September 2026

Source: https://github.com/jatinchowdhury18/KlonCentaur at
`f3bb633a593b6fbb22a44c1ef9d1dbedbfe92d5b`, BSD-3-Clause.
The complete original licence is retained in this directory.

FreeRig uses the PreAmpWDF, FeedForward2WDF and ClippingWDF component topologies.
Their JUCE include is replaced by `effects_centaur_support.h`, using the MIT
chowdsp_wdf single header pinned in SOURCES.json. The WDF namespace alias and
`jmax` helper preserve the small original interface. Original clipping source
and diode source are retained for comparison but are not compiled.

`effects_centaur.cpp` adapts the original input, op-amp, summing, tone and output
analogue transfer functions with bilinear conversion at 96 kHz. Pole warping
uses the original complex-pole rule; real poles use an ordinary bilinear
transform. Op-amp bounds and component values are retained. Left and right own
independent state. Parameter changes are smoothed; the existing Zita converter
reports its delay to the graph. No embedded-fork gain correction is applied.

The diode-pair equation is solved with eight fixed Newton iterations for Wright
omega in `effects_centaur_diode.h`. This replaces the original JUCE lookup-table
and approximation implementation; it is an intentional numerical difference.
The port is circuit-derived, not a claim of sample-identical ChowCentaur output
or measured equivalence to a particular physical Klon. Offline finite-output,
control-transition and sample-rate checks do not establish perceptual accuracy.

Additional native delay reporting: selected Airwindows BeziComp, Isolator3 and ToTape8 wrappers report their one-frame output staging delay; upstream arithmetic remains unchanged.
