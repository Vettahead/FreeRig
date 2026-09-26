/* Slots organise the drawing, independently of cable topology. Moving between
   slots never silently rewires a custom branch. Empty-slot insertion does. */
window.SlotBoard=(()=>{
  const columns={pre:[1,2,3,4],amp:[5],cab:[6],post:[7,8,9,10]};
  function assign(s){
    const used=new Set(),firstAmp=s.blocks.findIndex(b=>PatchRig.definition(b.key).type==='Amps');
    s.blocks.forEach((b,i)=>{
      let section=b.slot?.section|| (b.key==='cab'?'cab':PatchRig.definition(b.key).type==='Amps'?'amp':i<firstAmp?'pre':'post');
      if(!columns[section])section='post';
      let index=Number.isInteger(b.slot?.index)&&b.slot.index>=0?b.slot.index:0;
      while(used.has(section+index))index++;
      b.slot={section,index};used.add(section+index);
      const span=columns[section].length;b.x=30+columns[section][index%span]*170;b.y=100+Math.floor(index/span)*220;
    });
    s.junctions.forEach((b,i)=>{b.x=200+i*170;b.y=100+Math.max(2,...s.blocks.map(b=>Math.floor((b.y-100)/220)+1))*220;});
    s.output={x:1900,y:100};return s;
  }
  function slots(s){assign(s);const list=[];for(const [section,cols]of Object.entries(columns)){
    const used=s.blocks.filter(b=>b.slot.section===section),count=section==='amp'||section==='cab'?Math.max(1,...used.map(b=>b.slot.index+2)):Math.max(4,...used.map(b=>b.slot.index+1));
    for(let index=0;index<count;index++){const span=cols.length;list.push({section,index,x:30+cols[index%span]*170,y:100+Math.floor(index/span)*220,block:used.find(b=>b.slot.index===index)});}
  }return list;}
  function label(slot){return ({pre:'Before amp',amp:'Amp',cab:'Cab',post:'After cab'})[slot.section]+(slot.section==='pre'||slot.section==='post'?' '+(slot.index+1):slot.index?' '+(slot.index+1):'');}
  function move(s,id,slot){const b=s.blocks.find(b=>b.id===id);if(!b)return;const other=s.blocks.find(b=>b.id!==id&&b.slot.section===slot.section&&b.slot.index===slot.index);if(other)other.slot={...b.slot};b.slot={section:slot.section,index:slot.index};assign(s);}
  function add(s,b,slot){
    b.slot={section:slot.section,index:slot.index};s.blocks.push(b);s.scenes.forEach(scene=>scene[b.id]=PatchRig.valuesFor(b));assign(s);
    // Additional cabs share the first cab's source/destination, creating a branch.
    const peer=slot.section==='cab'&&s.blocks.find(n=>n.key==='cab'&&n.id!==b.id);
    if(peer){const edges=[...s.connections];edges.filter(e=>e[1]===peer.id).forEach(e=>PatchRig.connect(s,e[0],b.id));edges.filter(e=>e[0]===peer.id).forEach(e=>PatchRig.connect(s,b.id,e[1]));return;}
    const ordered=s.blocks.filter(n=>n.slot.index<4||['amp','cab'].includes(n.slot.section)).sort((a,c)=>a.x-c.x||a.y-c.y),i=ordered.indexOf(b),previous=ordered[i-1]?.id||'input',next=ordered[i+1]?.id||'output';
    const edge=s.connections.findIndex(e=>e[0]===previous&&e[1]===next);
    if(edge>=0){s.connections.splice(edge,1);PatchRig.connect(s,previous,b.id);PatchRig.connect(s,b.id,next);}
    else if(s.blocks.length===1){PatchRig.connect(s,'input',b.id);PatchRig.connect(s,b.id,'output');}
  }
  function remove(s,id){const incoming=s.connections.filter(e=>e[1]===id).map(e=>e[0]),outgoing=s.connections.filter(e=>e[0]===id).map(e=>e[1]);PatchRig.remove(s,id);for(const a of incoming)for(const b of outgoing)PatchRig.connect(s,a,b);assign(s);}
  function compatible(a,b){const group=key=>{const d=PatchRig.definition(key);return !d?null:d.type==='Amps'?'amp':d.type==='Cabs'?'cab':'effect';};return group(a)!==null&&group(a)===group(b);}
  function replace(s,id,key){const b=s.blocks.find(n=>n.id===id);if(!b||!compatible(b.key,key))return false;b.key=key;delete b.assetId;delete b.assetName;s.scenes.forEach(scene=>{const on=scene[id].on;scene[id]=PatchRig.valuesFor(b);scene[id].on=on;});return true;}
  return {assign,slots,label,move,add,remove,compatible,replace};
})();
