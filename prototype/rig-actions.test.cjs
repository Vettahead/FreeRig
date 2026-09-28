const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const P = require('./patch-model');
const ctx = { window: {}, PatchRig: P };
vm.runInNewContext(fs.readFileSync(__dirname + '/slot-board.js', 'utf8'), ctx);
const B = ctx.window.SlotBoard,
  A = require('./rig-actions')(P, B);
const s = P.createStarter();
B.assign(s);
const b = s.blocks.find((b) => b.key === 'amp');
b.assetId = 'local-capture';
b.assetName = 'Saved capture';
b.tone3000 = { id: 'test-pack', modelId: 'model-two', title: 'My amp' };
b.appearance = { style: 'look-2', colour: '#123456' };
s.scenes.forEach((scene, i) => {
  scene[b.id].on = i % 2 === 0;
  scene[b.id].values[0] = i;
});
const original = P.clone(b),
  settings = s.scenes.map((scene) => P.clone(scene[b.id]));
assert.equal(A.duplicate(s, b.id, 'duplicate'), 'duplicate');
const copy = s.blocks.find((b) => b.id === 'duplicate');
assert.equal(copy.assetId, original.assetId);
assert.deepEqual(copy.tone3000, original.tone3000);
assert.deepEqual(copy.appearance, original.appearance);
s.scenes.forEach((scene, i) => assert.deepEqual(scene.duplicate, settings[i]));
assert.ok(B.isStandard(s));
assert.ok(P.valid(s));
s.scenes[0].duplicate.values[0] = 9;
assert.equal(s.scenes[0][b.id].values[0], 0);
copy.appearance.colour = '#ffffff';
assert.equal(b.appearance.colour, '#123456');
assert.equal(A.duplicate(s, b.id, 'duplicate'), null);
const before = P.clone(s);
B.move(s, 'duplicate', A.emptySlot(s, 'loop'));
assert.equal(s.blocks.find((b) => b.id === 'duplicate').slot.section, 'loop');
assert.deepEqual(s.scenes, before.scenes);
assert.ok(P.valid(s));
B.remove(s, 'duplicate');
assert.ok(B.isStandard(s));
assert.equal(s.blocks.length, before.blocks.length - 1);
const custom = P.createDefault();
B.assign(custom);
A.duplicate(custom, custom.blocks[0].id, 'custom-copy');
assert.ok(P.valid(custom));
assert.ok(P.valid(P.migrate(JSON.parse(JSON.stringify(custom)))));
console.log(
  'PASS: duplicate retains capture/appearance and independent settings for all scenes; move/remove remain valid and saved rigs migrate.',
);
