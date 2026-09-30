const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const esbuild = require('../ui/node_modules/esbuild');
const P = require('./patch-model.js');
const B = require('./banks.js');
// Exercise the actual React metadata modules with isolated storage. No browser,
// user library or audio engine participates in this persistence regression.
const memory = new Map();
let failWrite = false;
const storage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    if (failWrite) throw new Error('Storage full');
    memory.set(key, value);
  },
};
function load(name, imports = {}) {
  const exports = {};
  const code = esbuild.transformSync(fs.readFileSync(`../ui/src/tags/${name}.ts`, 'utf8'), {
    loader: 'ts',
    format: 'cjs',
  }).code;
  const context = {
    module: { exports },
    exports,
    localStorage: storage,
    window: { EffectsCatalogue: require('./effects-catalogue.js') },
    require: (id) => {
      if (!(id in imports)) throw new Error(id);
      return imports[id];
    },
  };
  vm.runInNewContext(code, context);
  return context.module.exports;
}
const model = load('model');
let store = load('store', { './model': model });
const plain = (value) => JSON.parse(JSON.stringify(value));
assert.deepEqual(plain(store.deviceTags({ key: 'fx-DeBess', tags: ['Vocals'] })), [
  'Studio',
  'Vocals',
]);
assert.deepEqual(
  plain(store.deviceTags({ key: 'fx-DeBess', assetId: 'custom', tags: ['Vocals'] })),
  ['Vocals'],
);
let rig = P.createStarter();
const untouched = JSON.stringify(rig.scenes),
  wiring = JSON.stringify(rig.connections);
rig = store.editTags(rig, null, [' Hendrix ', 'hendrix', 'Blues']);
assert.deepEqual(plain(rig.tags), ['Hendrix', 'Blues']);
assert(rig.blocks.every((block) => store.deviceTags(block).length === 0));
rig = store.editTags(rig, null, rig.tags, 'Hendrix');
assert(rig.blocks.every((block) => store.deviceTags(block)[0] === 'Hendrix'));
assert.equal(JSON.stringify(rig.scenes), untouched);
assert.equal(JSON.stringify(rig.connections), wiring);
assert(P.valid(plain(rig)));
const bank = { id: 'tag-bank', name: 'Band', patches: [{ id: 'tag-patch', rig: plain(rig) }] };
assert(B.valid(bank));
assert.deepEqual(B.exportBank(bank).bank.patches[0].rig.tags, ['Hendrix', 'Blues']);
rig = store.editTags(rig, null, []);
assert(rig.blocks.every((block) => store.deviceTags(block)[0] === 'Hendrix'));
rig = store.editTags(rig, rig.blocks[0].id, ['Solo']);
store = load('store', { './model': model });
assert.deepEqual(plain(store.deviceTags({ key: rig.blocks[0].key })), ['Solo']);
assert.equal(
  model.deviceIdentity({ key: 'nampedal', assetId: 'one', tone3000: { id: 123 } }),
  model.deviceIdentity({ key: 'nam', assetId: 'two', tone3000: { id: 123 } }),
);
failWrite = true;
assert.throws(() => store.editTags(rig, rig.blocks[0].id, ['Lost']), /Storage full/);
assert.deepEqual(plain(store.deviceTags({ key: rig.blocks[0].key })), ['Solo']);
for (const tags of [
  [''],
  ['x'.repeat(33)],
  ['Dup', 'dup'],
  Array.from({ length: 21 }, (_, i) => `${i}`),
])
  assert(!P.valid({ ...plain(rig), tags }));
assert(P.valid(P.createStarter()));
assert.deepEqual(
  plain(model.normaliseTags([null, 1, '', 'x'.repeat(33), ' Jazz  Rock ', 'jazz rock'])),
  ['Jazz Rock'],
);
console.log(
  'PASS: patch-only and propagated tags, independent audio state, bank portability, library reload and atomic storage failures.',
);
