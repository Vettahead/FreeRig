const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const saved = new Map([
    [
      'guitar-suite-audio-choice',
      JSON.stringify({
        driver: 'Mackie',
        input: 1,
        output: 2,
        rate: 44100,
        inputName: 'Guitar',
        outputName: 'Phones',
      }),
    ],
  ]),
  sent = [],
  events = {},
  elements = {};
let receive;
class Option {
  constructor(text, value) {
    this.textContent = text;
    this.value = String(value);
  }
}
function select() {
  return {
    value: '0',
    selectedOptions: [new Option('Input 1', 0)],
    replaceChildren(...options) {
      this.selectedOptions = options.slice(0, 1);
      this.value = options[0].value;
    },
    add(option) {
      this.selectedOptions = [option];
    },
  };
}
function modal() {
  for (const id of [
    'audio-driver',
    'audio-input',
    'audio-output',
    'audio-rate',
    'output-device',
    'output-latency',
  ])
    elements['#' + id] = select();
  elements['#audio-driver'].value = 'Other';
  elements['#audio-message'] = {};
  elements['#master-label'] = {};
  elements['#output-exclusive'] = { checked: false };
  elements['#output-options'] = { hidden: true };
}
const context = {
  window: {
    chrome: {
      webview: { postMessage: (m) => sent.push(m), addEventListener: (name, fn) => (receive = fn) },
    },
  },
  document: {
    addEventListener: (name, fn) => (events[name] = fn),
    querySelector: () => ({ innerHTML: '' }),
  },
  localStorage: { getItem: (k) => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, v) },
  Option,
  modal,
  $: (k) => elements[k],
  escapeHTML: String,
  renderLibrary() {},
  render() {},
  catalogue: [{ key: 'amp' }, { key: 'cleanamp' }, { key: 'cab' }],
  state: { blocks: [] },
  setTimeout,
  clearTimeout,
};
vm.runInNewContext(fs.readFileSync(__dirname + '/desktop-bridge.js', 'utf8'), context);
receive({ data: { type: 'ready', drivers: ['Other', 'Mackie'] } });
const ui = context.window.NativeDesktop;
ui.setup();
assert.equal(elements['#audio-driver'].value, 'Mackie');
assert.equal(elements['#audio-input'].value, '1');
assert.equal(elements['#audio-output'].value, '2');
assert.equal(elements['#audio-rate'].value, '44100');
elements['#audio-input'].value = '3';
events.change({ target: { id: 'audio-input' } });
ui.setup();
assert.equal(elements['#audio-input'].value, '3');
assert.equal(JSON.parse(saved.get('guitar-suite-audio-choice')).input, 3);
events.input({ target: { id: 'master-output', value: '0' } });
assert.equal(saved.get('guitar-suite-master-db'), '0');
assert.equal(sent.at(-1).type, 'master');
assert.equal(sent.at(-1).db, 0);
receive({ data: { type: 'ready', drivers: ['Other'] } });
ui.setup();
assert.equal(elements['#audio-driver'].value, 'Mackie');
assert.match(elements['#audio-message'].textContent, /unavailable/);
console.log(
  'PASS: driver/channel/rate restoration, reopen persistence, master messaging and missing-driver handling.',
);

receive({
  data: {
    type: 'outputs',
    devices: [{ id: 'powercab-id', name: 'Speakers (2- Powercab 112 Plus)' }],
  },
});
ui.setup();
assert.equal(elements['#output-device'].value, '');
assert.equal(elements['#output-options'].hidden, true);
elements['#output-device'].value = 'powercab-id';
elements['#output-device'].selectedOptions = [
  new Option('Speakers (2- Powercab 112 Plus)', 'powercab-id'),
];
elements['#output-latency'].value = '5';
elements['#output-exclusive'].checked = true;
events.change({ target: { id: 'output-device' } });
assert.equal(elements['#audio-output'].disabled, true);
assert.equal(elements['#output-options'].hidden, false);
ui.setup();
assert.equal(elements['#output-device'].value, 'powercab-id');
assert.equal(elements['#output-latency'].value, '5');
assert.equal(elements['#output-exclusive'].checked, true);
events.click({ target: { closest: () => ({ id: 'start-audio' }) } });
assert.equal(sent.at(-1).outputDevice, 'powercab-id');
assert.equal(sent.at(-1).outputLatency, 5);
assert.equal(sent.at(-1).outputExclusive, true);
receive({ data: { type: 'outputs', devices: [] } });
assert.equal(elements['#output-device'].value, 'powercab-id');
assert.match(elements['#output-device'].selectedOptions[0].textContent, /unavailable/);
elements['#output-device'].value = '';
events.change({ target: { id: 'output-device' } });
assert.equal(elements['#audio-output'].disabled, false);
console.log(
  'PASS: separate output selection, persistence, start payload, missing-device preservation and ASIO restoration.',
);
context.window.CalibrationUI = { reference: () => 18 };
sent.length = 0;
ui.sync({ blocks: [], scene: 7 }, true);
assert.equal(sent.length, 1);
assert.equal(sent[0].patch.scene, 7);
assert.equal(sent[0].patch.calibrationDbU, 18);
assert.equal(sent[0].type, 'sync');
console.log(
  'PASS: immediate scene dispatch and independent interface calibration in native sync payload.',
);

// The React setup adapter must preserve backend/device IDs and synchronise
// calibration before Start; old ASIO choices remain valid without a backend key.
const windowsChoice = {
  ...ui.audioChoice(),
  backend: 'windows',
  driver: 'WASAPI:test-endpoint',
  inputDevice: 'test-endpoint',
  input: 1,
  outputDevice: 'speakers-id',
  rate: 48000,
};
context.window.CalibrationUI = {
  reference: (c) => (c.driver === 'WASAPI:test-endpoint' ? 12 : null),
};
sent.length = 0;
ui.prepareAudio(windowsChoice);
assert.equal(sent.at(-1).type, 'sync');
assert.equal(sent.at(-1).patch.calibrationDbU, 12);
assert.equal(ui.audioChoice().inputDevice, 'test-endpoint');
assert.equal(JSON.parse(saved.get('guitar-suite-audio-choice')).backend, 'windows');
assert.equal(
  sent.some((m) => m.type === 'start' || m.type === 'startWindows'),
  false,
);
console.log('PASS: React audio adapter saves Windows identity and calibration without auto-start.');
// An overload correction changes only the master, preserving drive/calibration.
sent.length = 0;
const oldMaster = Number(saved.get('guitar-suite-master-db') ?? -12);
const corrected = ui.reduceOutput(2);
assert.equal(corrected, Math.max(-30, oldMaster - 8));
assert.equal(sent.length, 1);
assert.equal(sent[0].type, 'master');
assert.equal(sent[0].db, corrected);
assert.equal(Number(saved.get('guitar-suite-master-db')), corrected);
ui.reduceOutput(NaN);
ui.reduceOutput(0.5);
assert.equal(sent.length, 1);
console.log(
  'PASS: headroom correction changes only saved master, rejects invalid/non-overloaded peaks.',
);
