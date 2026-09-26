/* Saved packs are independent of a patch: deleting an instance never deletes
   its library device. Model switching only changes that instance's asset. */
window.DeviceShelf=(()=>{
 const host=window.chrome?.webview,send=m=>host?.postMessage(m);let devices=[];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const find=id=>devices.find(d=>String(d.toneId)===String(id));
 const colour=value=>/^#[a-f0-9]{6}$/i.test(value||'')?value:'#766b56';
 function appearance(b){const d=find(b.tone3000?.id);return {style:b.appearance?.style||d?.style||'look-0',colour:colour(b.appearance?.colour||d?.colour)};}
 const category=d=>d.key==='cab'?'Cabs':d.key==='nampedal'?'Drive':'Amps';
 function art(d){return GearLooks.art({key:d.key,appearance:{style:d.style,colour:colour(d.colour)}});}
 function cards(filter,query){const list=devices.filter(d=>(filter==='All'||filter===category(d))&&(d.tone.title+' '+(d.tone.user?.username||'')+' '+category(d)).toLowerCase().includes(query));return list.length?'<div class="saved-heading">YOUR DOWNLOADED DEVICES</div>'+list.map(d=>'<button draggable="false" class="library-item saved-device" data-add="pack:'+d.toneId+'" aria-label="Add saved '+esc(d.tone.title)+'"><span class="library-gear">'+art(d)+'</span><span><strong>'+esc(d.tone.title)+'</strong><small>'+d.models.filter(m=>m.available).length+' saved models · @'+esc(d.tone.user?.username||'creator')+'</small></span><span class="plus">＋</span></button>').join(''):'';}
 function attach(b,d,m){b.assetId=m.assetId;b.assetName=m.name;b.tone3000={...d.tone,modelId:m.id,architecture:m.architecture};b.appearance={style:d.style,colour:colour(d.colour)};}
 function place(id,slot=null,replaceId=null){
  const d=find(id),m=d?.models.find(m=>m.available);if(!d||!m){toast('This device has no available model files. Download its pack again.');return;}
  let b=replaceId&&state.blocks.find(b=>b.id===replaceId);
  if(b&&!SlotBoard.compatible(b.key,d.key)){toast('Drop this device onto a matching amp, cabinet or pedal.');return;}
  if(!b){const section=d.key==='cab'?'cab':d.key==='amp'?'amp':'pre',slots=SlotBoard.slots(state);slot=slot||chosenSlot||slots.find(s=>s.section===section&&!s.block)||(section==='pre'&&slots.find(s=>s.section==='post'&&!s.block));if(!slot||slots.some(s=>s.section===slot.section&&s.index===slot.index&&s.block)){toast('Choose a matching empty slot or drop onto a device to replace it.');return;}if(state.blocks.length>=24){toast('The board supports up to 24 devices.');return;}}
  checkpoint();if(b){SlotBoard.replace(state,b.id,d.key);}else{b={id:'b'+crypto.randomUUID(),key:d.key,x:0,y:0};SlotBoard.add(state,b,slot);}attach(b,d,m);if(d.key==="amp")state.scenes.forEach(scene=>{scene[b.id].values[1]=scene[b.id].values[2]=scene[b.id].values[3]=0;});selected=b.id;chosenSlot=null;document.querySelector('#modal').close();render();toast(d.tone.title+' added. Choose its model in the details panel.');
 }
 function selector(b){const d=find(b.tone3000?.id);if(!d)return '<div class="saved-controls">'+GearLooks.selector(b)+'<span>Appearance only · sound stays unchanged</span></div>';const a=appearance(b);return '<div class="saved-controls"><label>Saved model<select id="saved-model">'+d.models.map(m=>'<option value="'+m.id+'" '+(m.id===b.tone3000.modelId?'selected':'')+' '+(!m.available?'disabled':'')+'>'+esc(m.name)+(m.architecture?' · '+esc(m.architecture==='custom'?'Custom':'A'+m.architecture):'')+(m.rate?' · '+(m.rate/1000)+' kHz':'')+(!m.available?' · missing file':'')+'</option>').join('')+'</select></label>'+GearLooks.selector(b)+'<label>Colour<input id="device-colour" type="color" value="'+a.colour+'" aria-label="Device colour"></label><span>'+d.models.filter(m=>m.available).length+' models saved offline</span></div>';}
 function skin(b,html){return GearLooks.skin(b,html);}

 function definition(b){const base=PatchRig.definition(b.key);return b.tone3000?{...base,name:b.tone3000.title||base.name,detail:'TONE3000 · '+(b.assetName||'Capture'),colour:appearance(b).colour}:base;}
 function options(b){return devices.filter(d=>SlotBoard.compatible(b.key,d.key)).map(d=>'<option value="pack:'+d.toneId+'" '+(b.tone3000?.id===d.toneId?'selected':'')+'>'+esc(d.tone.title)+' · saved</option>').join('');}
 document.addEventListener('change',e=>{
  if(!['saved-model','device-look','device-colour'].includes(e.target.id))return;const b=state.blocks.find(b=>b.id===selected),d=find(b?.tone3000?.id);if(!b)return;
  if(e.target.id==='saved-model'){if(!d)return;const m=d.models.find(m=>String(m.id)===e.target.value&&m.available);if(!m)return;checkpoint();const looks=b.appearance;attach(b,d,m);if(looks)b.appearance=looks;render();toast('Model changed'+(m.rate?' · use '+m.rate.toLocaleString()+' Hz':'')+'.');}
  else{checkpoint();const a=appearance(b);if(e.target.id==='device-look'){a.style=e.target.value;a.colour=GearLooks.list(b).find(x=>x.id===a.style)?.body||a.colour;}else a.colour=colour(e.target.value);b.appearance=a;if(d){d.style=a.style;d.colour=a.colour;send({type:'toneAppearance',toneId:d.toneId,...a});}render();renderLibrary();}
 });
 host?.addEventListener('message',e=>{const m=e.data;if(m.type==='ready')send({type:'toneLibrary'});if(m.type==='toneLibrary'){devices=Array.isArray(m.devices)?m.devices:[];renderLibrary();renderEditor();}});
 return {cards,place,selector,skin,definition,options,find,count:()=>devices.length};
})();
