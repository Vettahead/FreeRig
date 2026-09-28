const fs = require('fs'),
  vm = require('vm'),
  assert = require('node:assert/strict'),
  P = require('./patch-model');
const ctx = { window: {}, PatchRig: P };
vm.runInNewContext(fs.readFileSync('slot-board.js', 'utf8'), ctx);
const B = ctx.window.SlotBoard;
let p = B.assign(P.createStarter());
let drive = p.blocks.find((b) => b.key === 'drive'),
  amp = p.blocks.find((b) => b.key === 'amp'),
  cab = p.blocks.find((b) => b.key === 'cab');
drive.assetId = 'capture.nam';
drive.key = 'nampedal';
p.scenes.forEach((s, i) => (s[drive.id] = { on: i !== 0, values: [i, -i] }));
const values = JSON.stringify(p.scenes.map((s) => s[drive.id])),
  targetId = amp.id,
  sourceId = drive.id;
assert.equal(B.move(p, sourceId, amp.slot), targetId);
assert.equal(p.blocks.length, 5);
assert(!p.blocks.some((b) => b.id === sourceId));
assert.equal(amp.key, 'nampedal');
assert.equal(amp.assetId, 'capture.nam');
assert.equal(JSON.stringify(p.scenes.map((s) => s[targetId])), values);
assert(p.connections.some((e) => e[0] === targetId && e[1] === cab.id));
assert(P.valid(p));
assert.equal(P.activeNodes(p).size, 7);
p = B.assign(P.createStarter());
drive = p.blocks.find((b) => b.key === 'drive');
cab = p.blocks.find((b) => b.key === 'cab');
const old = JSON.stringify(p.connections);
B.move(p, drive.id, { section: 'post', index: 3 });
assert.notEqual(JSON.stringify(p.connections), old);
assert(p.connections.some((e) => e[0] === drive.id && e[1] === 'output'));
assert(
  !p.connections.some(
    (e) => e[0] === drive.id && e[1] === p.blocks.find((b) => b.key === 'amp').id,
  ),
);
assert(P.valid(p));
const rewired = JSON.stringify(p.connections);
B.move(p, drive.id, { section: 'pre', index: 2 }, true);
assert.equal(JSON.stringify(p.connections), rewired);
assert(P.valid(p));
// Even on a custom branch, an inserted device has an actual audio route.
p = B.assign(P.createDefault());
B.add(p, { id: 'inserted', key: 'nampedal' }, { section: 'pre', index: 3 });
assert(P.activeNodes(p).has('inserted'));
assert(P.valid(p));
vm.runInNewContext(fs.readFileSync('gear-looks.js', 'utf8'), ctx);
const looks = ctx.window.GearLooks;
for (const key of ['amp', 'cab', 'nampedal']) {
  const b = { key };
  const choices = looks.list(b);
  assert.equal(choices.length, 20);
  assert.equal(new Set(choices.map((c) => c.id)).size, 20);
  const art = new Set();
  for (const c of choices) {
    b.appearance = { style: c.id };
    assert.equal(looks.get(b).id, c.id);
    art.add(looks.art(b));
    assert(!looks.skin(b, 'test').includes('undefined'));
  }
  assert.equal(art.size, 20);
}
console.log(
  'PASS: cross-type occupied-slot replacement preserves moved capture/scenes and target wiring; default moves rewire; keep-cables opt-in; inserted devices connected; 20 valid looks per category.',
);
