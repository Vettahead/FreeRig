/* Commands reuse the saved rig model; React never invents a second audio state. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.RigActions=factory(root.PatchRig,root.SlotBoard);})(typeof window==='undefined'?globalThis:window,function(P,B){
 function emptySlot(s,section){const slots=B.slots(s).filter(x=>x.section===section);return slots.find(x=>!x.block)||{section,index:Math.max(-1,...slots.map(x=>x.index))+1};}
 function duplicate(s,id,newId){const original=s.blocks.find(b=>b.id===id);if(!original||s.blocks.length>=24||s.blocks.some(b=>b.id===newId))return null;const settings=s.scenes.map(scene=>P.clone(scene[id]));const copy=P.clone(original);copy.id=newId;B.add(s,copy,emptySlot(s,original.slot.section));s.scenes.forEach((scene,i)=>scene[newId]=settings[i]);return newId;}
 return {emptySlot,duplicate};
});
