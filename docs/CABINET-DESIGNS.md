## Alpha 19 — cabinet formats redrawn (27 September 2026)

Run **releases/FreeRig-alpha-19/FreeRig.exe**. Cabinet format is now separate from Hardware look in Device options: 1x10, 1x12, 1x15, horizontal 2x10/2x12, vertical 2x12, compact 4x10, straight/slant 4x12 and 8x10. All 20 finishes work with any format. The editor and thumbnails use the same scalable illustration, with circular speakers, individual enclosure proportions, grille cloth, piping, protective corners and feet. Cabinet adjustments sit alongside the enclosure.

The chosen format is saved in the patch and survives scene changes and model changes. Existing patches without an explicit format infer it from a recognised tone/model name, then fall back to the previous look's speaker count. Geometry is representative, not a manufacturer specification. Appearance does not replace the loaded IR or change its sound; collection format inference uses the tone title, while explicit format choices belong to patch instances.

TypeScript/native builds, cabinet geometry/patch-roundtrip and saved-device regressions pass. Browser checks cover four-speaker layouts, format switching and cabinet parameter editing. All ten silhouettes were visually reviewed. Audio processing and both DSP DLLs are unchanged from Alpha 18.
