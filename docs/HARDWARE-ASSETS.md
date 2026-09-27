# Hardware asset provenance

27 September 2026. Built-in image_gen was used; no API/CLI fallback. Generated materials are original project assets. CSS and SVG render the interactive hardware. The reference supplied by Chris, C:/Users/chris/Desktop/333.webp, was used as a visual direction, not copied into the app.

## Saved project assets
- prototype/hardware-materials.png: four-quadrant material atlas, used for tweed and diamond cloth.
- prototype/tolex-black.png: repeating black tolex.
- prototype/grille-silver.png: repeating silver/charcoal grille cloth.

Manufacturer names in the appearance picker identify styling inspiration only. Controls expose the real engine parameters; selecting an appearance does not load a manufacturer model. All enclosure geometry, typography and controls are original UI work.

## Generation prompts

### hardware-materials.png
Create one photorealistic material texture atlas for a premium guitar amplifier desktop interface. Exactly four equal square quadrants in a seamless 2 by 2 grid, filling entire image with no margins, labels, letters, objects, knobs, equipment, frames or dividing lines. Flat orthographic macro photography, neutral even lighting, high definition tactile detail, consistent material scale. Top left: charcoal black pebbled leatherette/tolex vinyl of a vintage guitar amplifier, dense tiny irregular grain. Top right: silvery charcoal woven amplifier speaker grille cloth, tiny regular interwoven horizontal and vertical threads, no speaker visible. Bottom left: warm honey tan diagonal herringbone woven tweed fabric, fine vintage amp covering. Bottom right: dark brown and black woven grille cloth with thin subtle gold diamond lattice typical British combo cloth. These will be used as separate CSS background regions on interactive rendered hardware. Absolutely no vignette or perspective, keep brightness and detail uniform to the edges.

### tolex-black.png
One seamless tiling photorealistic PBR diffuse material texture, black charcoal guitar-amplifier tolex vinyl with tiny irregular pebbled grain. Orthographic macro photograph of the flat material only, covering the entire square. Very fine closely spaced small grain, like authentic 1960s blackface combo amplifier covering. Even neutral light with subtle grain highlights, predominantly near black. No shadows cast by objects, no perspective, no labels, no text, no hardware, no borders, no vignette. Will be tiled at 200 CSS pixels across on an interactive amplifier enclosure.

### grille-silver.png
One seamless tiling photorealistic PBR diffuse material texture, vintage blackface guitar amplifier woven speaker grille cloth. Silver grey and charcoal black intertwined fine thread lattice, small tight rectangular weave. Orthographic close-up photograph of flat cloth covering entire square. Predominantly dark charcoal with thin silver threads. Neutral uniform diffuse light, consistent scale and brightness. No speaker cones, no hardware, no logos, no objects, no shadows, no perspective, no borders, no vignette, no text. Texture will repeat at 220 CSS pixels across an interactive amp speaker grille.

## Official design references consulted
- Fender Deluxe Reverb: https://intl.fender.com/products/65-deluxe-reverb
- Marshall amps: https://www.marshall.com/im/en/amplifiers
- VOX AC30: https://voxamps.com/en-gb/product/ac30-hand-wired-tube-amp-2/
- Mesa/Boogie Dual Rectifier: https://legacy.mesaboogie.com/amplifiers/electric/rectifier-series/dual-rectifier/index.html
