const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm'),
  fs = require('node:fs');
const PatchRig = require('./patch-model.js');
const context = { window: {}, PatchRig };
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname + '/gear-looks.js', 'utf8'), context);
const looks = context.window.GearLooks;
function svg(b) {
  return decodeURIComponent(looks.art(b).match(/src="data:image\/svg\+xml,([^"]+)"/)[1]);
}
test('cabinet format geometry and patch recall remain independent of finish and sound', () => {
  for (const [format, count] of [
    ['1x10', 1],
    ['1x12', 1],
    ['1x15', 1],
    ['2x10', 2],
    ['2x12', 2],
    ['2x12v', 2],
    ['4x10', 4],
    ['4x12', 4],
    ['4x12s', 4],
    ['8x10', 8],
  ]) {
    const rig = PatchRig.createDefault(),
      b = rig.blocks.find((b) => b.key === 'cab');
    b.appearance = { style: 'look-3', colour: '#4488aa', cabFormat: format };
    const before = JSON.stringify(rig.scenes);
    const restored = PatchRig.migrate(JSON.parse(JSON.stringify(rig))).blocks.find(
      (b) => b.key === 'cab',
    );
    assert.equal(restored.appearance.cabFormat, format);
    assert.equal((svg(restored).match(/<g transform=/g) || []).length, count);
    assert.equal(JSON.stringify(rig.scenes), before);
    assert.match(
      looks.skin(
        restored,
        '<div class="cabinet-panel">CONTROLS</div><div class="hardware-caption">test</div>',
      ),
      /CONTROLS/,
    );
  }
  const base = { key: 'cab', appearance: { style: 'look-0' } };
  const getbox = (f) =>
    svg({ ...base, appearance: { ...base.appearance, cabFormat: f } }).match(
      /viewBox="([^"]+)"/,
    )[1];
  assert.notEqual(getbox('4x10'), getbox('4x12'));
  assert.notEqual(getbox('2x12'), getbox('2x12v'));
  assert.match(svg({ ...base, tone3000: { title: 'Vintage 4x10 cab' } }), /4 × 10/);
  assert.match(svg({ ...base, tone3000: { title: 'Vertical 2x12v' } }), /vertical/);
});
