import { readFile } from 'node:fs/promises';

// Usage advice describes placement, not a restriction: studio processors can
// process guitars too. Keep upstream manuals attributed and separate from ours.
const placement = {
  Amps: 'Place after drives and before the cabinet. These are circuit preamps; add an IR cabinet for monitor/headphone playback. Tone controls follow the upstream circuit rather than a generic post-EQ.',
  Cabs: 'Place after the amp, before stereo studio effects. Choose recorded mic setups by their labels, blend gently and compare polarity. Recorded positions are discrete; there is no invented continuous distance control.',
  Drive:
    'Start before the amp. Match bypass loudness with the output/level control before judging the tone; extra level also drives the following amp harder. Keep a cabinet after an amp when monitoring through full-range speakers.',
  Reverb:
    'Start after the amp or cabinet for clear ambience. Use a low wet mix for ordinary playing, then increase decay and mix for ambient parts. Long tails and extreme settings can obscure the next phrase.',
  Delay:
    'Start after the amp or cabinet so repeats stay distinct. Increase feedback gradually; time controls the spacing and mix controls the balance with your playing. Placing it before a driven amp also distorts the repeats.',
  Modulation:
    'Before the amp gives a blended, coloured movement; after the amp makes the movement clearer. Start with a slow rate and moderate depth. Stereo width needs a stereo output to be heard fully.',
  Dynamics:
    'Before the amp changes playing dynamics and how hard the amp is driven; after the cabinet controls the finished sound. Compare at matched loudness. Aggressive compression or gating can remove pick attack and sustain.',
  EQ: 'Before the amp changes which frequencies drive distortion. After the cabinet shapes the finished tone. Start flat, make small adjustments and level-match before comparing.',
  Filter:
    'Use before the amp for an interaction with distortion, or after the cabinet to sculpt the finished sound. Resonant and nonlinear filters can change level dramatically; begin with subtle settings.',
  Pitch:
    'Use a clear input for pitch effects and start with a modest wet mix. Some algorithms deliberately glitch or add a processing window; those behaviours are not faults or promises of natural harmonisation.',
  Stereo:
    'Usually place after the cabinet. These effects need two output channels; check a mono fold-down because widening can change phase and reduce mono level.',
  Studio:
    'A recording/mix tool rather than a conventional stompbox. Start after the cabinet, compare at matched loudness and use small changes. It can still be used creatively anywhere in a guitar rig.',
  Tape: 'Start after the cabinet for recording-style colour. Drive it gently first: tape colour can soften transients, darken highs and change perceived loudness.',
  'Lo-fi':
    'Deliberately adds degradation, grit, wobble or reduced resolution. Start with subtle settings or a low wet mix where available. This is an audible character effect, not a transparent repair tool.',
  Looper:
    'Place after the cabinet to record the complete guitar sound. Recordings live in memory; saved patches contain controls, not the recorded phrase.',
  Synth:
    'A creative sound-design processor. Start with isolated notes and a moderate mix, then try chords. Do not assume that its internal oscillator follows the pitch of your guitar.',
  Utility:
    'Use to manage or shape the signal where needed. Compare with bypass and retain enough headroom for the following devices.',
};
export async function guideFor(descriptor, engine) {
  const id = descriptor.key.slice(3);
  let manual = '';
  if (descriptor.engine === 'Airwindows') {
    try {
      manual = (
        await readFile(
          new URL(`../native/vendor/airwindows/docs/${id}.txt`, import.meta.url),
          'utf8',
        )
      ).trim();
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const description = descriptor.description;
  const controls = engine.params
    .map(([name, min, max, initial, unit], i) =>
      name
        ? `${name}: ${Number(min.toFixed(3))}–${Number(max.toFixed(3))}${unit ? ' ' + unit : ''}; starting value ${descriptor.defaults[i]}.`
        : '',
    )
    .filter(Boolean)
    .join(' ');
  const studio = descriptor.factoryTags?.includes('Studio');
  return {
    description,
    factoryTags: descriptor.factoryTags ?? [],
    guide: [
      placement[studio ? 'Studio' : descriptor.category] || placement.Utility,
      descriptor.engine === 'Airwindows'
        ? 'Airwindows percentage controls are normalized algorithm controls; they are not literal Hz, milliseconds or hardware knob positions.' +
          (manual ? ' Read the original developer notes below for their interactions.' : '')
        : '',
      controls,
    ]
      .filter(Boolean)
      .join('\n\n'),
    ...(manual ? { manual } : {}),
  };
}
