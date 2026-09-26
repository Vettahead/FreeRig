const assert=require('node:assert/strict');
const R=require('./rig-model.js');
const s=R.createDefault();
assert.ok(R.valid(s));
// Both branches reach the output, without processing one branch through the other.
let g=R.graph(s);
const adj=Object.fromEntries(g.nodes.map(id=>[id,g.edges.filter(e=>e[0]===id).map(e=>e[1])]));
function reaches(from,to,seen=new Set()){if(from===to)return true;if(seen.has(from))return false;seen.add(from);return adj[from].some(n=>reaches(n,to,new Set(seen)));}
for(const b of s.blocks){assert.ok(reaches('input',b.id));assert.ok(reaches(b.id,'output'));assert.ok(!adj[b.id].some(n=>reaches(n,b.id)));}
const a=R.blocksIn(s,'a'),b=R.blocksIn(s,'b');
assert.ok(!reaches(a.at(-1).id,b[0].id));
// Cross-path moves preserve the device identity and every scene's parameters.
const originalScenes=R.clone(s.scenes);
assert.equal(R.relocate(s,a[0].id,'b',b[0].id),true);
assert.equal(R.blocksIn(s,'b')[0].id,a[0].id);
assert.deepEqual(s.scenes,originalScenes);
assert.equal(R.relocate(s,a[0].id,'bogus'),false);
assert.equal(R.relocate(s,a[0].id,'b',a[0].id),false);
assert.ok(R.valid(s));
// Serial conversion keeps all devices, in the documented audible order.
const expected=['pre','a','b','post'].flatMap(l=>R.blocksIn(s,l).map(b=>b.id));
R.setParallel(s,false);
assert.deepEqual(s.blocks.map(b=>b.id),expected);
assert.equal(R.blocksIn(s,'b').length,0);
assert.deepEqual(s.scenes,originalScenes);
assert.ok(R.valid(s));
assert.equal(R.relocate(s,a[0].id,'b'),false);
// A v1 saved chain migrates without changing its order or scene data.
const old=R.clone(s);delete old.version;delete old.parallel;delete old.routes;old.blocks.forEach(b=>delete b.lane);
const migrated=R.migrate(old);
assert.ok(R.valid(migrated));assert.equal(migrated.parallel,false);
assert.deepEqual(migrated.blocks.map(b=>b.id),old.blocks.map(b=>b.id));assert.deepEqual(migrated.scenes,old.scenes);
assert.deepEqual(R.migrate(JSON.parse(JSON.stringify(s))),s);
const broken=R.clone(s);broken.routes[0].a.level=Infinity;assert.equal(R.valid(broken),false);
// An empty parallel branch is explicitly a dry pass-through edge.
const dry=R.createDefault();dry.blocks.filter(b=>b.lane==='b').forEach(b=>R.relocate(dry,b.id,'a'));
assert.ok(R.graph(dry).edges.some(([a,b])=>a==='split'&&b==='merge'));
console.log('PASS: graph connectivity, acyclic branches, cross-path movement, serial conversion, v1 migration, persistence validation and empty dry path.');
