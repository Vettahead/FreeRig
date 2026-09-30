/* Shared, DOM-free rig operations. The graph is deliberately acyclic:
   input → pre → split → A/B → merge → post → output. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GuitarRig = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const catalogue = [
    {
      key: 'nampedal',
      name: 'Capture Pedal',
      description:
        'Loads a saved NAM pedal capture. Its distortion is determined by the recorded pedal settings, not an extra virtual gain knob. Input trim changes the level hitting the capture; Output changes how hard it drives the following amp. Begin at 0 dB trim and compare bypass at matched loudness. Use a separate amp and cabinet unless the capture explicitly includes them.',
      type: 'Pedals',
      icon: '↯',
      colour: '#8f7f9e',
      detail: 'NAM pedal loader',
      params: [
        ['Input trim', -24, 24, 0, 'dB'],
        ['Output', -30, 12, 0, 'dB'],
      ],
    },
    {
      key: 'gate',
      name: 'Quiet Gate',
      description:
        'Reduces noise between phrases. Set Threshold just above the idle noise floor, then use Release to let notes fade naturally. Place early in the chain to avoid cutting off delay and reverb tails. Too high a threshold removes quiet notes; too short a release chops sustain.',
      type: 'Utility',
      icon: '⊣',
      colour: '#a7b995',
      detail: 'Noise gate',
      params: [
        ['Threshold', -80, 0, -54, 'dB'],
        ['Release', 10, 500, 120, 'ms'],
      ],
    },
    {
      key: 'drive',
      name: 'Moss Drive',
      description:
        'A stock overdrive with Drive, Tone and Level. Drive increases saturation, Tone adjusts brightness and Level sets the signal sent into the following amp. Start before the amp and level-match bypass before comparing. A low Drive setting with high Level still pushes the amplifier into distortion.',
      type: 'Pedals',
      icon: '↯',
      colour: '#bdcf80',
      detail: 'Overdrive · DSP',
      params: [
        ['Drive', 0, 10, 4.2, ''],
        ['Tone', 0, 10, 5.5, ''],
        ['Level', -24, 12, 0, 'dB'],
      ],
    },
    {
      key: 'amp',
      name: 'British Bloom',
      type: 'Amps',
      icon: '≋',
      colour: '#d6b77e',
      detail: 'NAM A2 · Placeholder',
      params: [
        ['Input trim', -24, 24, 0, 'dB'],
        ['Bass EQ', -12, 12, 1.5, 'dB'],
        ['Mid EQ', -12, 12, 0, 'dB'],
        ['Treble EQ', -12, 12, 2, 'dB'],
        ['Output', -30, 6, -6, 'dB'],
      ],
    },
    {
      key: 'cleanamp',
      name: 'Silver Coast',
      type: 'Amps',
      icon: '≋',
      colour: '#a8c5d2',
      detail: 'Clean amp · Placeholder',
      params: [
        ['Input trim', -24, 24, 0, 'dB'],
        ['Bass EQ', -12, 12, 0, 'dB'],
        ['Mid EQ', -12, 12, -1, 'dB'],
        ['Treble EQ', -12, 12, 1, 'dB'],
        ['Output', -30, 6, -6, 'dB'],
      ],
    },
    {
      key: 'cab',
      name: 'Vintage 2×12',
      type: 'Cabs',
      icon: '▦',
      colour: '#c0a688',
      detail: 'Cabinet IR · Placeholder',
      params: [
        ['Low cut', 20, 300, 80, 'Hz'],
        ['High cut', 2000, 20000, 8000, 'Hz'],
        ['Level', -24, 6, -3, 'dB'],
      ],
    },
    {
      key: 'delay',
      name: 'Tape Echo',
      description:
        'Stereo echo with Time, Feedback and Mix. Time sets repeat spacing, Feedback sets persistence and Mix balances repeats against the dry guitar. Start after the amp for clear echoes; before a driven amp, the repeats also distort. Raise feedback gradually to avoid a dense wash.',
      type: 'Pedals',
      icon: '≈',
      colour: '#82b7ba',
      detail: 'Stereo delay · DSP',
      params: [
        ['Time', 30, 1500, 380, 'ms'],
        ['Feedback', 0, 95, 32, '%'],
        ['Mix', 0, 100, 22, '%'],
      ],
    },
    {
      key: 'reverb',
      name: 'Open Space',
      description:
        'Stock algorithmic reverb. Decay sets the tail length, Tone changes its brightness and Mix sets the wet balance. Start after the amp or cabinet with a low mix; longer decay works best with room between phrases. It is a creative room effect, not a cabinet IR.',
      type: 'Pedals',
      icon: '✧',
      colour: '#b8a0c8',
      detail: 'Reverb · DSP',
      params: [
        ['Decay', 0.2, 15, 3.5, 's'],
        ['Tone', 0, 10, 6, ''],
        ['Mix', 0, 100, 24, '%'],
      ],
    },
    {
      key: 'chorus',
      name: 'Slow Tide',
      description:
        'Chorus adds a modulated delayed voice to the guitar. Rate sets movement speed, Depth sets the modulation excursion and Mix blends the moving voice with dry signal. Start slow and subtle for width, or raise depth for an obvious detuned shimmer.',
      type: 'Pedals',
      icon: '∿',
      colour: '#79b5ad',
      detail: 'Chorus · DSP',
      params: [
        ['Rate', 0.1, 8, 0.8, 'Hz'],
        ['Depth', 0, 100, 45, '%'],
        ['Mix', 0, 100, 35, '%'],
      ],
    },
    {
      key: 'compressor',
      name: 'Soft Press',
      description:
        'Stock compressor for controlling dynamics. Threshold selects where compression begins, Ratio sets its strength and Attack controls how quickly peaks are reduced. A slower attack preserves pick definition. Before the amp it changes how the amp is driven; after the cabinet it evens out the finished sound.',
      type: 'Utility',
      icon: '⇥',
      colour: '#d5a591',
      detail: 'Compressor · DSP',
      params: [
        ['Threshold', -60, 0, -24, 'dB'],
        ['Ratio', 1, 20, 4, ':1'],
        ['Attack', 1, 100, 20, 'ms'],
      ],
    },
  ];
  catalogue.push(
    ...(typeof module === 'object' && module.exports
      ? require('./effects-catalogue.js')
      : globalThis.EffectsCatalogue),
  );
  const laneNames = { pre: 'Before split', a: 'Path A', b: 'Path B', post: 'After merge' };
  const sceneNames = ['Clean', 'Crunch', 'Lead', 'Ambient'];
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const definition = (key) => catalogue.find((d) => d.key === key);
  const defaultRoute = () => ({
    mode: 'parallel',
    cross: 250,
    blend: 50,
    a: { level: -6, pan: 0, mute: false, invert: false },
    b: { level: -6, pan: 0, mute: false, invert: false },
  });
  function makeBlock(key, id, lane = 'a') {
    return { id, key, lane };
  }
  function valuesFor(block) {
    return { on: true, values: definition(block.key).params.map((p) => p[3]) };
  }
  function createDefault() {
    const entries = [
      ['gate', 'pre'],
      ['drive', 'a'],
      ['amp', 'a'],
      ['cab', 'a'],
      ['cleanamp', 'b'],
      ['cab', 'b'],
      ['delay', 'post'],
      ['reverb', 'post'],
    ];
    const blocks = entries.map(([key, lane], i) => makeBlock(key, `b${i}`, lane));
    return {
      version: 2,
      name: 'Sunday / Two sides of bloom',
      scene: 1,
      tempo: 112,
      parallel: true,
      blocks,
      routes: sceneNames.map(() => defaultRoute()),
      scenes: sceneNames.map((_, i) =>
        Object.fromEntries(
          blocks.map((b) => {
            const v = valuesFor(b);
            if (b.key === 'drive') v.on = i !== 0;
            if (b.key === 'reverb' && i === 3) v.values[2] = 58;
            return [b.id, v];
          }),
        ),
      ),
    };
  }
  const finite = (v, min, max) => Number.isFinite(v) && v >= min && v <= max;
  function validBase(s) {
    return (
      s &&
      typeof s.name === 'string' &&
      s.name.length <= 60 &&
      Number.isInteger(s.scene) &&
      s.scene >= 0 &&
      s.scene < (s.scenes?.length || 0) &&
      finite(s.tempo, 40, 240) &&
      Array.isArray(s.blocks) &&
      s.blocks.length > 0 &&
      s.blocks.length <= 24 &&
      new Set(s.blocks.map((b) => b.id)).size === s.blocks.length &&
      s.blocks.every(
        (b) => typeof b.id === 'string' && /^[a-zA-Z0-9-]+$/.test(b.id) && definition(b.key),
      ) &&
      Array.isArray(s.scenes) &&
      [4, 8].includes(s.scenes.length) &&
      s.scenes.every(
        (scene) =>
          scene &&
          s.blocks.every((b) => {
            const d = definition(b.key),
              v = scene[b.id];
            return (
              v &&
              typeof v.on === 'boolean' &&
              (v.sync === undefined || (Number.isInteger(v.sync) && v.sync >= 0 && v.sync <= 7)) &&
              Array.isArray(v.values) &&
              v.values.length === d.params.length &&
              v.values.every((n, i) => finite(n, d.params[i][1], d.params[i][2]))
            );
          }),
      )
    );
  }
  function valid(s) {
    return !!(
      validBase(s) &&
      s.version === 2 &&
      typeof s.parallel === 'boolean' &&
      s.blocks.every((b) => Object.hasOwn(laneNames, b.lane)) &&
      (s.parallel || !s.blocks.some((b) => b.lane === 'b')) &&
      Array.isArray(s.routes) &&
      s.routes.length === s.scenes.length &&
      s.routes.every(
        (r) =>
          r &&
          ['parallel', 'blend', 'crossover'].includes(r.mode) &&
          finite(r.cross, 40, 5000) &&
          finite(r.blend, 0, 100) &&
          ['a', 'b'].every(
            (l) =>
              r[l] &&
              finite(r[l].level, -60, 6) &&
              finite(r[l].pan, -100, 100) &&
              typeof r[l].mute === 'boolean' &&
              typeof r[l].invert === 'boolean',
          ),
      )
    );
  }
  function migrate(s) {
    if (valid(s)) return clone(s);
    // Preserve the exact order and all scene values of an older serial rig.
    if (!validBase(s) || s.version === 2) return null;
    return {
      ...clone(s),
      version: 2,
      parallel: false,
      blocks: s.blocks.map((b) => makeBlock(b.key, b.id, 'a')),
      routes: sceneNames.map(() => ({
        ...defaultRoute(),
        a: { level: 0, pan: 0, mute: false, invert: false },
      })),
    };
  }
  function blocksIn(s, lane) {
    return s.blocks.filter((b) => b.lane === lane);
  }
  function relocate(s, id, lane, beforeId = null) {
    const block = s.blocks.find((b) => b.id === id);
    if (
      !block ||
      !Object.hasOwn(laneNames, lane) ||
      (!s.parallel && lane === 'b') ||
      beforeId === id
    )
      return false;
    if (beforeId && !s.blocks.some((b) => b.id === beforeId && b.lane === lane)) return false;
    s.blocks = s.blocks.filter((b) => b.id !== id);
    block.lane = lane;
    const target = beforeId ? s.blocks.findIndex((b) => b.id === beforeId) : -1;
    if (target < 0) s.blocks.push(block);
    else s.blocks.splice(target, 0, block);
    return true;
  }
  function setParallel(s, enabled) {
    if (!enabled && s.parallel) {
      // Collapse in visible processing order; never discard the B branch.
      s.blocks = [
        ...blocksIn(s, 'pre'),
        ...blocksIn(s, 'a'),
        ...blocksIn(s, 'b'),
        ...blocksIn(s, 'post'),
      ];
      s.blocks.forEach((b) => {
        if (b.lane === 'b') b.lane = 'a';
      });
    }
    s.parallel = enabled;
  }
  function graph(s) {
    const edges = [];
    const connect = (from, list, to) => {
      let prev = from;
      for (const b of list) {
        edges.push([prev, b.id]);
        prev = b.id;
      }
      edges.push([prev, to]);
    };
    connect('input', blocksIn(s, 'pre'), s.parallel ? 'split' : 'path-a');
    if (s.parallel) {
      connect('split', blocksIn(s, 'a'), 'merge');
      connect('split', blocksIn(s, 'b'), 'merge');
    } else connect('path-a', blocksIn(s, 'a'), 'merge');
    connect('merge', blocksIn(s, 'post'), 'output');
    return {
      nodes: [
        'input',
        ...(s.parallel ? ['split'] : ['path-a']),
        ...s.blocks.map((b) => b.id),
        'merge',
        'output',
      ],
      edges,
    };
  }
  return {
    catalogue,
    laneNames,
    sceneNames,
    clone,
    definition,
    defaultRoute,
    makeBlock,
    valuesFor,
    createDefault,
    valid,
    migrate,
    blocksIn,
    relocate,
    setParallel,
    graph,
  };
});
