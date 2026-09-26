const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),P=require('./patch-model');
const ctx={window:{},PatchRig:P};vm.runInNewContext(fs.readFileSync(__dirname+'/slot-board.js','utf8'),ctx);const B=ctx.window.SlotBoard,s=P.createDefault();
B.assign(s);assert.equal(B.slots(s).filter(x=>x.section==='pre').length,4);assert.equal(B.slots(s).filter(x=>x.section==='post').length,4);
const cab={id:'extra',key:'cab',x:0,y:0};B.add(s,cab,{section:'cab',index:1});assert.ok(s.connections.some(e=>e[0]==='b2'&&e[1]==='extra'));assert.ok(s.connections.some(e=>e[0]==='extra'&&e[1]==='b5'));assert.ok(P.valid(s));
const edges=JSON.stringify(s.connections);B.move(s,'b4',{section:'pre',index:2});assert.equal(JSON.stringify(s.connections),edges);
B.remove(s,'b0');assert.ok(s.connections.some(e=>e[0]==='input'&&e[1]==='b1'));
for(const b of [...s.blocks])B.remove(s,b.id);s.junctions=[];assert.ok(P.valid(s));assert.deepEqual(s.connections,[['input','output']]);
console.log('PASS: four pre/post slots, parallel cab insertion, cable-preserving slot moves and removal through empty patch.');
