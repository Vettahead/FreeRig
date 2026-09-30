import type { Block } from '../types';

// Presentation families never select DSP or infer a cabinet inside a capture.
export type HardwareProfile =
  | 'amp'
  | 'combo'
  | 'tweed'
  | 'vox'
  | 'rectifier'
  | 'modern'
  | 'orange'
  | 'boutique'
  | 'drive'
  | 'delay'
  | 'reverb'
  | 'pedal-compact'
  | 'pedal-treadle'
  | 'pedal-round'
  | 'pedal-rat'
  | 'pedal-studio'
  | 'cab'
  | 'cab2'
  | 'cab-1x10'
  | 'cab-1x12'
  | 'cab-1x15'
  | 'cab-2x10'
  | 'cab-2x12v'
  | 'cab-4x10'
  | 'cab-4x12s'
  | 'cab-8x10';
const ampFamilies: HardwareProfile[] = [
  'amp',
  'combo',
  'tweed',
  'orange',
  'vox',
  'rectifier',
  'modern',
  'boutique',
  'tweed',
  'combo',
  'modern',
  'vox',
  'amp',
  'amp',
  'boutique',
  'modern',
  'combo',
  'orange',
  'amp',
  'modern',
];
const pedalFamilies: HardwareProfile[] = [
  'pedal-compact',
  'pedal-treadle',
  'pedal-rat',
  'pedal-studio',
  'drive',
  'pedal-rat',
  'pedal-round',
  'pedal-compact',
  'pedal-compact',
  'pedal-rat',
  'pedal-treadle',
  'pedal-treadle',
  'pedal-compact',
  'pedal-compact',
  'pedal-compact',
  'pedal-studio',
  'delay',
  'pedal-round',
  'pedal-compact',
  'pedal-studio',
];
const cabinets: Record<string, HardwareProfile> = {
  '1x10': 'cab-1x10',
  '1x12': 'cab-1x12',
  '1x15': 'cab-1x15',
  '2x10': 'cab-2x10',
  '2x12': 'cab2',
  '2x12v': 'cab-2x12v',
  '4x10': 'cab-4x10',
  '4x12': 'cab',
  '4x12s': 'cab-4x12s',
  '8x10': 'cab-8x10',
};
export function hardwareProfile(block: Block): HardwareProfile {
  const definition = window.DeviceShelf.definition(block);
  const look = window.GearLooks.get(block);
  const index = Number(look.id.replace('look-', '')) || 0;
  if (definition.type === 'Cabs') return cabinets[CabinetLooks.get(block, look)[0]] || 'cab2';
  if (definition.type === 'Amps') {
    // Capture metadata guides only the default picture. Explicit saved looks
    // always win, and no guessed brand changes the model or routing.
    if (!block.appearance?.style && (block.assetId || block.tone3000)) {
      const name = `${block.assetName || ''} ${block.tone3000?.title || ''} ${definition.name}`;
      if (/tweed|bassman/i.test(name)) return 'tweed';
      if (/fender|twin|princeton|deluxe reverb/i.test(name)) return 'combo';
      if (/vox|ac[ -]?(15|30)/i.test(name)) return 'vox';
      if (/mesa|rectifier|boogie/i.test(name)) return 'rectifier';
      if (/orange|rockerverb/i.test(name)) return 'orange';
      if (/peavey|5150|6505|engl|diezel|soldano/i.test(name)) return 'modern';
      if (/matchless|dumble|two[ -]?rock/i.test(name)) return 'boutique';
    }
    return ampFamilies[index] || 'amp';
  }
  if (block.appearance?.style) return pedalFamilies[index] || 'pedal-compact';
  if (/Scream|TS9|Tube.?Screamer/i.test(definition.name)) return 'drive';
  if (/Orange Distortion/i.test(definition.name)) return 'pedal-treadle';
  if (block.key === 'drive') return 'drive';
  if (block.key === 'delay') return 'delay';
  if (block.key === 'reverb') return 'reverb';
  if (/Fuzz|GXRound/i.test(block.key + definition.name)) return 'pedal-round';
  if (/Rat|Distortion/i.test(definition.name)) return 'pedal-rat';
  if (
    definition.params.filter((p) => p[0]).length <= 5 &&
    /Chorus|Flanger|Compressor|Gate/i.test(definition.name)
  )
    return 'pedal-treadle';
  if (
    definition.params.filter((p) => p[0]).length > 5 ||
    /Delay|Reverb|Studio|EQ|Looper|Synth|Pitch|Stereo|Tape/.test(definition.type)
  )
    return 'pedal-studio';
  return 'pedal-compact';
}
export const hardwareImage = (profile: HardwareProfile) => `hardware/${profile}.png`;
export const isCabinet = (profile: HardwareProfile) => profile.startsWith('cab');
export const isCombo = (profile: HardwareProfile) =>
  ['combo', 'tweed', 'vox', 'boutique'].includes(profile);
export const isAmplifier = (profile: HardwareProfile) => ampFamilies.includes(profile);
export const hardwareClass = (profile: HardwareProfile) =>
  isCabinet(profile)
    ? 'cab2'
    : isAmplifier(profile)
      ? 'amp'
      : ['pedal-studio', 'pedal-rat', 'pedal-round'].includes(profile)
        ? 'delay'
        : profile.startsWith('pedal-')
          ? 'reverb'
          : profile;
export function cabinetLabel(block: Block) {
  return CabinetLooks.get(block, window.GearLooks.get(block))[1];
}
// Saved finishes stay cosmetic and affect the chassis only, not readable controls.
export function chassisFilter(block: Block, profile: HardwareProfile): string {
  const look = window.GearLooks.get(block);
  const neutralPedal = ['pedal-compact', 'pedal-treadle', 'pedal-studio'].includes(profile);
  const factory = block.appearance?.colour === look.body;
  // The first eight amp families keep their authored materials; alternative
  // colourways and cabinet finishes tint that family without changing geometry.
  const alternateFinish =
    !!block.appearance?.style &&
    (isCabinet(profile) ||
      Number(look.id.replace('look-', '')) >= 8 ||
      (profile === 'pedal-round' && look.id === 'look-6'));
  const colour =
    (!factory ? block.appearance?.colour : '') ||
    (alternateFinish
      ? look.body
      : neutralPedal
        ? block.appearance?.style
          ? look.body
          : window.DeviceShelf.definition(block).colour
        : '');
  if (!/^#[0-9a-f]{6}$/i.test(colour || '')) return 'none';
  const rgb = [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16) / 255);
  const max = Math.max(...rgb),
    min = Math.min(...rgb),
    delta = max - min;
  let hue =
    delta === 0
      ? 0
      : max === rgb[0]
        ? ((rgb[1] - rgb[2]) / delta) % 6
        : max === rgb[1]
          ? (rgb[2] - rgb[0]) / delta + 2
          : (rgb[0] - rgb[1]) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  return `grayscale(1) sepia(${delta > 0.06 ? 1 : 0}) saturate(${delta > 0.06 ? 2.2 : 0}) hue-rotate(${hue - 45}deg) brightness(${Math.max(0.35, Math.min(1.1, 0.25 + 0.65 * max))})`;
}
