import type { Block } from '../types';

// This first art set is deliberately scoped. A saved custom finish/format must
// never silently become a different enclosure just because new artwork exists.
export type HardwareProfile = 'amp' | 'drive' | 'delay' | 'reverb' | 'cab' | 'cab2';
export function hardwareProfile(block: Block): HardwareProfile | null {
  const style = block.appearance?.style;
  // The appearance picker saves the factory colour with the style. Only a
  // genuinely custom colour needs the tintable compatibility artwork.
  const colour = block.appearance?.colour;
  const factoryColour = window.GearLooks.list(block).find((look) => look.id === style)?.body;
  if (colour && colour.toLowerCase() !== factoryColour?.toLowerCase()) return null;
  if (['amp', 'fx-AmpJCM800High', 'fx-AmpJCM800Low'].includes(block.key))
    return !style || style === 'look-0' ? 'amp' : null;
  if (['drive', 'delay', 'reverb'].includes(block.key)) {
    const defaultStyle = block.key === 'drive' ? 'look-4' : 'look-0';
    return !style || style === defaultStyle ? (block.key as HardwareProfile) : null;
  }
  if (block.key.startsWith('fx-CabJester') && !style && !block.appearance?.cabFormat) return 'cab';
  if (block.key === 'cab' && !block.assetId && !style && !block.appearance?.cabFormat)
    return 'cab2';
  return null;
}

export const hardwareImage = (profile: HardwareProfile) => `hardware/${profile}.png`;
