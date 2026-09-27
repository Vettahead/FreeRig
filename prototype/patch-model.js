/* Explicit patch cables replace lanes. Scene snapshots own parameters/bypass;
   topology belongs to the patch, so recalling a scene never rewires it. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./rig-model.js'));
  else root.PatchRig=factory(root.GuitarRig);
})(typeof globalThis!=='undefined'?globalThis:this,function(legacy){
  const {clone,definition,valuesFor}=legacy;
  const ids=s=>['input',...s.blocks.map(b=>b.id),...s.junctions.map(j=>j.id),'output'];
  function graph(s){return {nodes:ids(s),edges:clone(s.connections)};}
  function canConnect(s,from,to){
    const nodes=ids(s);if(s.connections.length>=200)return false;
    if(!nodes.includes(from)||!nodes.includes(to)||from===to||from==='output'||to==='input')return false;
    if(s.connections.some(e=>e[0]===from&&e[1]===to))return false;
    const seen=new Set(),visit=id=>{if(id===from)return true;if(seen.has(id))return false;seen.add(id);return s.connections.filter(e=>e[0]===id).some(e=>visit(e[1]));};
    return !visit(to);
  }
  function connect(s,from,to){if(!canConnect(s,from,to))return false;s.connections.push([from,to]);return true;}
  function remove(s,id){s.blocks=s.blocks.filter(b=>b.id!==id);s.connections=s.connections.filter(e=>!e.includes(id));s.scenes.forEach(scene=>delete scene[id]);}
  function arrange(s){
    // Longest upstream distance gives deterministic columns, including branches.
    const depth={input:0};
    for(let i=0;i<ids(s).length;i++)for(const [a,b] of s.connections)if(depth[a]!==undefined)depth[b]=Math.max(depth[b]||0,depth[a]+1);
    const rows={};for(const b of [...s.blocks,...s.junctions]){const col=depth[b.id]??1,row=rows[col]||0;rows[col]=row+1;b.x=40+col*170;b.y=60+row*210;}
    s.output={x:40+(depth.output??s.blocks.length+1)*170,y:100};
  }
  function createDefault(){
    const blocks=['gate','drive','amp','cab','delay','reverb'].map((key,i)=>({id:'b'+i,key,x:0,y:0}));
    const s={version:3,name:'Sunday / Echo around the amp',scene:1,tempo:112,blocks,junctions:[],output:{x:1230,y:100},sceneNames:[...legacy.sceneNames],scenes:legacy.sceneNames.map((_,i)=>Object.fromEntries(blocks.map(b=>{const v=valuesFor(b);if(b.key==='drive')v.on=i!==0;if(b.key==='delay'){v.values[2]=100;v.on=i!==0;}if(b.key==='reverb'&&i===3)v.values[2]=58;return [b.id,v];}))),connections:[['input','b0'],['b0','b1'],['b1','b2'],['b2','b3'],['b1','b4'],['b4','b3'],['b3','b5'],['b5','output']]};
    arrange(s);return s;
  }
  function valid(s){
    if(!s||s.version!==3||!Array.isArray(s.junctions)||s.junctions.length>3||!Array.isArray(s.blocks)||s.blocks.length>24)return false;
    // Reuse the established parameter/range validation, without legacy lanes.
    const proxy={...s,version:2,parallel:false,blocks:s.blocks.map(b=>({...b,lane:'a'})),routes:(s.scenes||[]).map(()=>legacy.defaultRoute())};
    if(!s.blocks.length){const sample=legacy.makeBlock('gate','validation-only','a');proxy.blocks=[sample];proxy.scenes=s.scenes?.map(()=>({'validation-only':legacy.valuesFor(sample)}));}
    if(!legacy.valid(proxy)||!Array.isArray(s.scenes)||![4,8].includes(s.scenes.length)||!s.scenes.every(scene=>scene&&typeof scene==='object')||!Array.isArray(s.sceneNames)||s.sceneNames.length!==s.scenes.length||!s.sceneNames.every(n=>typeof n==='string'&&n.trim().length>0&&n.length<=24))return false;
    const position=b=>b&&Number.isFinite(b.x)&&b.x>=0&&b.x<=5000&&Number.isFinite(b.y)&&b.y>=0&&b.y<=3000;
    if(!s.blocks.every(position)||!position(s.output)||!s.junctions.every(j=>position(j)&&['split','merge','path-a'].includes(j.id)))return false;
    if(new Set(ids(s)).size!==ids(s).length||!Array.isArray(s.connections)||s.connections.length>200)return false;
    const check={...s,connections:[]};for(const e of s.connections){if(!Array.isArray(e)||e.length!==2||!connect(check,...e))return false;}
    if(s.junctions.length&&(!s.legacy||!legacy.valid(s.legacy)))return false;
    return true;
  }
  function migrate(value){
    if(valid(value))return clone(value);
    if(value?.version===3)return null;
    const old=legacy.migrate(value);if(!old)return null;
    const g=legacy.graph(old),s={...clone(old),version:3,sceneNames:[...legacy.sceneNames],connections:g.edges,junctions:g.nodes.filter(id=>['split','merge','path-a'].includes(id)).map(id=>({id,x:0,y:0})),legacy:clone(old)};
    delete s.routes;delete s.parallel;s.blocks.forEach(b=>delete b.lane);arrange(s);return valid(s)?s:null;
  }
  function activeNodes(s){
    const walk=(start,reverse)=>{const seen=new Set();function visit(id){if(seen.has(id))return;seen.add(id);s.connections.filter(e=>e[reverse?1:0]===id).forEach(e=>visit(e[reverse?0:1]));}visit(start);return seen;};
    const forward=walk('input',false),back=walk('output',true);return new Set([...forward].filter(id=>back.has(id)));
  }
  function copyScene(s,from,to){if(from===to||![from,to].every(i=>Number.isInteger(i)&&i>=0&&i<s.scenes.length))return false;s.scenes[to]=clone(s.scenes[from]);if(s.legacy)s.legacy.routes[to]=clone(s.legacy.routes[from]);return true;}
  function createStarter(){const s=createDefault();s.name='Sunday / First sound';s.connections=[['input','b0'],['b0','b1'],['b1','b2'],['b2','b3'],['b3','b4'],['b4','b5'],['b5','output']];s.scenes.forEach(scene=>{scene.b4.values[2]=22;});return s;}
  return {...legacy,createDefault,createStarter,valid,migrate,graph,connect,canConnect,remove,arrange,activeNodes,copyScene};
});
