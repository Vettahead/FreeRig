const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('../ui/node_modules/typescript');
const PatchRig = require('./patch-model.js');
const effects = require('./effects-catalogue.js');
const context = {
  window: { DeviceShelf: { definition: (b) => PatchRig.definition(b.key) } },
  PatchRig,
  exports: {},
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('gear-looks.js', 'utf8'), context);
vm.runInContext(
  ts.transpileModule(fs.readFileSync('../ui/src/hardware/profiles.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  context,
);
const { hardwareProfile, hardwareImage, chassisFilter } = context.exports;

test('every catalogue processor has bundled artwork without mutating patch data', () => {
  const blocks = [...PatchRig.createDefault().blocks, ...effects.map((d) => ({ key: d.key }))];
  const before = JSON.stringify(blocks);
  for (const block of blocks) {
    assert.ok(fs.existsSync(hardwareImage(hardwareProfile(block))), block.key);
    for (let i = 0; i < 20; i++) {
      const styled = { ...block, appearance: { style: `look-${i}`, colour: '#336699' } };
      assert.ok(fs.existsSync(hardwareImage(hardwareProfile(styled))), `${block.key} look ${i}`);
      assert.notEqual(chassisFilter(styled, hardwareProfile(styled)), 'none');
    }
  }
  assert.equal(JSON.stringify(blocks), before);
});

test('cabinet dimensions remain distinct through saved format selection', () => {
  const profiles = new Set();
  for (const format of [
    '1x10',
    '1x12',
    '1x15',
    '2x10',
    '2x12',
    '2x12v',
    '4x10',
    '4x12',
    '4x12s',
    '8x10',
  ]) {
    const block = { key: 'cab', appearance: { cabFormat: format } };
    const profile = hardwareProfile(block);
    profiles.add(profile);
    assert.ok(fs.existsSync(hardwareImage(profile)));
  }
  assert.equal(profiles.size, 10);
  assert.equal(hardwareProfile({ key: 'fx-AmpRectifierRed' }), 'rectifier');
  assert.equal(hardwareProfile({ key: 'fx-AmpTwinNormal' }), 'combo');
  assert.equal(hardwareProfile({ key: 'fx-AmpAC30Normal' }), 'vox');
  assert.equal(hardwareProfile({ key: 'fx-Amp5150Lead' }), 'modern');
  const capture = { key: 'amp', assetId: 'local', tone3000: { title: 'Fender Twin clean' } };
  assert.equal(hardwareProfile(capture), 'combo');
  assert.equal(hardwareProfile({ ...capture, appearance: { style: 'look-5' } }), 'rectifier');
});
