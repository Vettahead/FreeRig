# Hardware artwork — Alpha 32

The complete catalogue now uses original generated chassis artwork with live React controls. There are **26 shared assets**: eight amplifier families, eight pedal families and ten cabinet geometries. This is full catalogue coverage through families, not one bespoke image per processor or an assertion of exact hardware emulation.

`ui/src/hardware/profiles.ts` owns classification, saved appearance mapping and cosmetic finish filters. `families.css` owns panel placement and thumbnail geometry. `RenderedHardware.tsx` owns the live descriptor-driven controls; `RenderedThumbnail` is inert. `legacyArtwork.tsx` exposes that same React thumbnail to compatibility library/overview hosts via escaped static markup. No new dependency: static rendering uses the existing react-dom package.

Downloaded amplifier names can choose a default family when there is no explicitly saved look; a chosen look always wins. The selector labels this automatic state rather than claiming the first manual option is selected.

Cabinet geometry still comes from the established CabinetLooks resolver and persisted cabFormat, including downloaded metadata inference. Artwork never changes convolution or adds a cabinet to a capture. Ten Band EQ keeps its actual faders and recorded cabinets keep their actual mic selectors. Saved keys, scenes, parameter order and audio arithmetic are unchanged. The desktop build bundles all images for offline use.

The 20 existing appearance choices map to families and cosmetic colourways. Custom colour affects the chassis, not DOM text or controls. Higher parameter counts use a wider panel; family references never introduce controls unsupported by the processor. Small library/chain thumbnails reuse the same artwork and are sized independently from the board. New chassis include jack anchor metadata for the measured leads.

## Reference audit

The supplied BIAS-style pedalboard and realistic stock illustrations guided material detail, proportion and hardware placement. Official product references consulted for the family distinctions:

- [Fender Twin Reverb](https://www.fender.com/products/65-twin-reverb/) — blackface combo, silver cloth and twin-speaker proportion.
- [Marshall JCM800](https://www.marshall.com/ca/en/product/jcm800-2203-vintage-reissue-head?pid=1007097) — black head and lower gold panel.
- [Mesa Dual Rectifier](https://production.mesaboogie.com/amplifiers/electric/rectifier-series/dual-rectifier/head.html) — diamond plate and black control strip.
- [VOX AC30](https://voxamps.com/product/ac30-custom/) — diamond grille and contrasting upper panel.
- [BOSS DS-1W](https://www.boss.info/global/products/ds-1w/) — stepped compact chassis and rubber tread.
- [Dunlop Fuzz Face](https://www.jimdunlop.com/fuzz-face-distortion/) — round enclosure and side jacks.
- [Strymon BigSky](https://www.strymon.net/support/bigsky/) — wide enclosure for larger control sets.
- [Ampeg SVT-810E](https://ampeg.com/products/heritage/svt810e/) — two columns of four speakers in a tall cabinet.

Twenty additional PNGs were generated with the built-in image tool on 30 September 2026. See [asset prompts](hardware-artwork-prompts.json). No vendor photos, logos or stock watermarks were copied into the app. The compact cast asset includes a fixed metal switch; its live hit target overlays that switch rather than drawing a second one.

## Original Alpha 28 set and prompts

This first implementation uses original generated product artwork beneath live React controls. No runtime 3D renderer, new dependency, animation loop or audio-thread work is introduced. Labels and numeric values remain selectable, sharp DOM text. The images are not photographs of real products or copies of the supplied reference screenshots.

## Scope and extension

`ui/src/hardware/profiles.ts` maps a deliberately limited set of default appearances: British Bloom and the JCM800 channels, Moss Drive, Tape Echo, Open Space, the unloaded Vintage 2×12 and the recorded Jester 4×12 cabinets. Custom colours, explicit cabinet formats and alternative appearances retain the existing renderer. Imported cabinet formats are never inferred from the new artwork.

`RenderedHardware.tsx` reads the existing descriptor's parameter order, labels, units and scene values. The shared `Knob` preserves the existing input/native bridge contract. `RenderedThumbnail` is decorative: selection, drag and bypass remain owned by Board. Recorded cabinet mic controls stay in CabinetEditor. Presentation CSS belongs to `hardware.css`; extend a profile only after checking its actual control count and layout. Do not add fake hardware controls that do not affect the processor.

The desktop build copies `prototype/hardware` into `ui/hardware`. Keep those files with the release for offline operation. No change to saved keys, parameter order, captures, convolution, buffer settings or audio arithmetic.

## Artwork provenance and reproducible direction

Created 30 September 2026 using the built-in image-generation tool: new-image generation for all six chassis; background-removal edits for drive and delay. Transparent PNG output. The source prompts below describe the original art direction; text and knobs are added by React, never baked into the image. No stock-image watermark was removed and no reference image was used as an editing input.

Shared prompt requirements: isolated product asset, orthographic view, transparent background, premium photorealistic material detail, soft upper-left studio lighting, no text/logos/watermarks, no knobs or switches on blank panels.

| File in `prototype/hardware` | Prompt subject and compositing constraints                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| amp.png                      | British vintage amplifier head, front view, wide 3:1 silhouette; black pebbled tolex, rounded leather edges, brass corners, leather handle, charcoal woven grille. Empty warm champagne brushed brass control panel at x 7–93%, y 60–87%; feet visible. |
| drive.png                    | Narrow forest-green enamel overdrive enclosure, top-down view, bevelled edges, silver side sockets, corner screws, black rubber tread on lower third. Upper 60% blank for controls.                                                                     |
| delay.png                    | Wide petrol-blue brushed-metal stereo delay enclosure, top-down view, landscape 1.5:1 proportions, softly rounded corners, four screws and silver side sockets. Entire face blank.                                                                      |
| reverb.png                   | Tall portrait 4:5 plum-violet metallic reverb enclosure, top-down view, rounded corners, polished aluminium edge trim, four silver screws and side sockets. Entire face blank.                                                                          |
| cab.png                      | Straight black 4×12 cabinet, front view; exactly four speaker silhouettes in a 2×2 layout behind warm-grey woven grille, black tolex, silver corners, cream piping and feet.                                                                            |
| cab2.png                     | Horizontal vintage 2×12 cabinet, front view, 1.65:1 proportions; exactly two speakers side by side behind warm-grey woven grille, black tolex, cream piping, metal corners and feet.                                                                    |

Drive/delay edit prompt: remove the entire background outside the enclosure and sockets, with genuine transparent alpha and no backdrop/halo; preserve pedal colour, texture, shape and empty face; add no controls or text.

## Validation limits

Browser validation covers live values, bypass and scene recall, device selection and the first artwork layouts. 1080p is the primary view; smaller windows retain scrolling. This is a first selected set, not a finished visual overhaul of every effect. Audio validation is offline only; no live ASIO listening was performed for this visual release.
