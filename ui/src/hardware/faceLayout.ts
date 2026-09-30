import type { HardwareProfile } from './profiles';

type Region = readonly [left: number, top: number, width: number, height: number];
// Coordinates refer to the ORIGINAL artwork, including its transparent margin.
// Combo editors frame the upper chassis; board thumbnails still show the full cabinet.
export interface FaceLayout {
  controls: Region;
  badge: Region;
  switch: Region;
  crop: number;
  ink: string;
}
const head: FaceLayout = {
  controls: [7, 61, 77, 21],
  badge: [15, 29, 70, 18],
  switch: [86, 62, 7, 20],
  crop: 1,
  ink: '#29241a',
};
const combo: FaceLayout = {
  controls: [7, 15, 77, 10],
  badge: [12, 32, 76, 11],
  switch: [86, 15, 7, 10],
  crop: 0.48,
  ink: '#f1eadb',
};
const pedal: FaceLayout = {
  controls: [16, 12, 68, 30],
  badge: [17, 46, 66, 16],
  switch: [38, 72, 24, 15],
  crop: 1,
  ink: '#fff1d3',
};
export const faceLayouts: Partial<Record<HardwareProfile, FaceLayout>> = {
  amp: head,
  modern: { ...head, controls: [7, 64, 77, 22], ink: '#f1eadb', switch: [86, 65, 7, 20] },
  rectifier: { ...head, controls: [7, 64, 77, 22], ink: '#f1eadb', switch: [86, 65, 7, 20] },
  orange: { ...head, controls: [7, 64, 77, 18], badge: [39, 31, 22, 15], switch: [86, 64, 7, 18] },
  combo,
  tweed: { ...combo, controls: [8, 12.5, 76, 9], switch: [86, 12.5, 7, 9] },
  vox: { ...combo, controls: [8, 14, 76, 15], switch: [86, 15, 7, 13], ink: '#29241a' },
  boutique: { ...combo, controls: [8, 14, 76, 13], switch: [86, 15, 7, 11], ink: '#29241a' },
  drive: pedal,
  reverb: pedal,
  'pedal-treadle': { ...pedal, controls: [16, 5, 68, 28], badge: [17, 37, 66, 17] },
  'pedal-compact': { ...pedal, switch: [37, 67, 26, 20] },
  'pedal-round': { ...pedal, controls: [23, 20, 54, 28], badge: [23, 50, 54, 16] },
  'pedal-rat': { ...pedal, controls: [14, 12, 72, 25], badge: [20, 48, 60, 17] },
  'pedal-studio': {
    controls: [11, 19, 78, 43],
    badge: [12, 68, 58, 17],
    switch: [77, 69, 11, 16],
    crop: 1,
    ink: '#fff1d3',
  },
  delay: {
    controls: [12, 22, 76, 35],
    badge: [13, 64, 55, 15],
    switch: [77, 64, 11, 17],
    crop: 1,
    ink: '#fff1d3',
  },
};
export const faceLayout = (profile: HardwareProfile) => faceLayouts[profile] || pedal;

// Short screen-printed legends; accessible names and persisted keys stay intact.
export function faceLegend(name: string) {
  return name
    .replace(/^Model:.*/i, 'Model')
    .replace(/^Tape:.*/i, 'Tape')
    .replace('Wow and flutter', 'Wow / flutter')
    .replace('Record level', 'Record');
}
