const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),P=require('./patch-model');
const ctx={window:{},PatchRig:P};vm.runInNewContext(fs.readFileSync(__dirname+'/slot-board.js','utf8'),ctx);const B=ctx.window.SlotBoard;
const s=P.createStarter();B.assign(s);assert.ok(B.isStandard(s));const before=JSON.stringify(s.scenes);
B.move(s,'b4',{section:'loop',index:0});assert.ok(B.isStandard(s));assert.ok(s.connections.some(e=>e[0]==='b2'&&e[1]==='b4'));assert.ok(s.connections.some(e=>e[0]==='b4'&&e[1]==='b3'));assert.deepEqual(JSON.parse(JSON.stringify(s.scenes)),JSON.parse(before));assert.ok(P.valid(s));
B.add(s,{id:'cab2',key:'cab',x:0,y:0},{section:'cab',index:1});assert.ok(s.connections.some(e=>e[0]==='b4'&&e[1]==='cab2'));assert.ok(s.connections.some(e=>e[0]==='cab2'&&e[1]==='b5'));
B.move(s,'b5',{section:'loop',index:1});assert.ok(B.isStandard(s));for(const id of ['b3','cab2'])assert.ok(s.connections.some(e=>e[0]==='b5'&&e[1]===id));
B.remove(s,'b4');assert.ok(B.isStandard(s));assert.ok(s.connections.some(e=>e[0]==='b2'&&e[1]==='b5'));assert.ok(P.valid(s));
const loaded=P.migrate(JSON.parse(JSON.stringify(s)));B.assign(loaded);assert.equal(loaded.blocks.find(b=>b.id==='b5').slot.section,'loop');assert.ok(B.isStandard(loaded));
const custom=P.createDefault();B.assign(custom);const edges=JSON.stringify(custom.connections);assert.equal(B.isStandard(custom),false);B.assign(custom);assert.equal(JSON.stringify(custom.connections),edges);B.move(custom,'b4',{section:'loop',index:0},true);assert.equal(JSON.stringify(custom.connections),edges);assert.equal(B.isStandard(custom),false);B.useStandard(custom);assert.ok(B.isStandard(custom));assert.ok(P.valid(custom));
console.log('PASS: loop ordering, multi-cab fanout, removal, scene preservation, persisted loop slots and opt-in custom rewiring.');

