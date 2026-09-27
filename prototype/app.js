'use strict';
const $ = (s) => document.querySelector(s);
const {catalogue,clone}=PatchRig;
const storageKey='guitar-suite-rig-v3';
let state=PatchRig.createStarter(),saved=null,history=[],selected=null,filter='All',dirty=false,toastTimer,loopTimer,pulseTimer,loopSeconds=0,pendingCable=null,chosenSlot=null;
try {
  const stored=JSON.parse(localStorage.getItem(storageKey)||localStorage.getItem('guitar-suite-rig-v2')||localStorage.getItem('guitar-suite-rig-v1'));
  const migrated=PatchRig.migrate(stored);if(migrated)state=migrated;
}catch { /* A corrupt or unavailable save must not stop the editor. */ }
SlotBoard.assign(state);saved=clone(state);
if(selected&&!state.blocks.some(b=>b.id===selected))selected=null;
const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function checkpoint(){history.push(clone(state));if(history.length>40)history.shift();}
function mark(){dirty=JSON.stringify(state)!==JSON.stringify(saved);$('#dirty').textContent=dirty?'UNSAVED':'SAVED';$('#undo').disabled=!history.length;NativeDesktop.sync(state);}
function current(b){return state.scenes[state.scene][b.id];}
const deviceCategories=['All','Amps','Cabs','Drive','Delay','Modulation','Reverb','Dynamics','Utility'];
let devicePicker=null;
const libraryCategory=d=>d.category||({nampedal:'Drive',drive:'Drive',delay:'Delay',chorus:'Modulation',reverb:'Reverb',compressor:'Dynamics',gate:'Utility'}[d.key]||d.type);
function renderLibrary(){
  const q=$('#search').value.toLowerCase();
  $('#filters').innerHTML=deviceCategories.map(t=>`<button class="${filter===t?'active':''}" data-filter="${t}" aria-pressed="${filter===t}">${t}</button>`).join('');
  const items=catalogue.filter(d=>(filter==='All'||libraryCategory(d)===filter)&&(d.name+' '+d.detail+' '+libraryCategory(d)).toLowerCase().includes(q));
  $('#library-count').textContent=String(catalogue.length+DeviceShelf.count()).padStart(2,'0');
  $('#library-label').textContent=filter==='All'?'ALL DEVICES':filter.toUpperCase();
  $('#library').innerHTML=DeviceShelf.cards(filter,q)+items.map(d=>`<button draggable="false" class="library-item" data-add="${d.key}" aria-label="Add ${d.name}"><span class="library-gear">${GearLooks.art({key:d.key})}</span><span><strong>${d.name}</strong><small>${d.detail}</small></span><span class="plus">＋</span></button>`).join('')||'<div class="empty">No matching devices. Try another search.</div>';
}
function render(){
  $('#rig-name').value=state.name;$('#tempo').value=state.tempo;$('#tempo-status').textContent=`${state.tempo} BPM`;$('#device-count').textContent=`${state.blocks.length} devices`;
  PatchUI.render(state,selected,pendingCable);
  $('#scenes').innerHTML=state.sceneNames.slice(0,state.showExtraScenes||state.scene>=4?8:4).map((name,i)=>`<button class="scene ${state.scene===i?'active':''}" data-scene="${i}" aria-pressed="${state.scene===i}"><span class="scene-number">0${i+1}</span><span><strong>${escapeHTML(name)}</strong><small>${Object.values(state.scenes[i]).filter(v=>v.on).length} devices on</small></span></button>`).join('');
  $('#stomps').innerHTML=state.blocks.map(b=>{const d=catalogue.find(x=>x.key===b.key);return `<button class="stomp ${current(b).on?'':'bypassed'}" data-stomp="${b.id}" style="--accent:${d.colour}" aria-pressed="${current(b).on}">${GearLooks.art(b,current(b).on)}<strong>${escapeHTML(b.tone3000?.title||d.name)}</strong><small>${current(b).on?'ON · CLICK TO BYPASS':'BYPASSED · CLICK TO ENABLE'}</small></button>`;}).join('');
  $('#performance-scenes').innerHTML=$('#scenes').innerHTML;renderEditor();mark();if(window.BankUI)BankUI.render();
}
function renderEditor(){
  const panel=$('#editor'),same=panel.dataset.device===selected,optionsOpen=same&&panel.querySelector('.device-options')?.open,scroll=same?panel.scrollTop:0;panel.dataset.device=selected||'';if(!same&&selected)document.querySelector('main').scrollTop=0;
  const b=state.blocks.find(x=>x.id===selected);document.body.classList.toggle('editing-device',!!b);$('#device-overview').hidden=!b;$('#device-overview').innerHTML=b?'<span class=overview-label>DEVICES</span>'+state.blocks.map(item=>'<button data-block="'+item.id+'" aria-pressed="'+(item.id===selected)+'" class="overview-device '+(current(item).on?'':'bypassed')+'">'+GearLooks.art(item,current(item).on)+'<span>'+escapeHTML(DeviceShelf.definition(item).name)+'</span></button>').join('')+'<button id=overview-routing>Routing ↗</button>':'';$('#editor').hidden=!b;if(!b){if(window.FreeRigReact)FreeRigReact.editor(null);else $('#editor').innerHTML='';return;}
  const d=DeviceShelf.definition(b),v=current(b),index=state.blocks.indexOf(b);
  const note=NativeDesktop.installed()?'Desktop engine · '+(b.assetName||'Built-in sound')+' · '+state.sceneNames[state.scene]+' scene':d.type==='Amps'?'NAM capture placeholder · EQ and trims are external controls.':b.key==='cab'?'Cabinet placeholder · No impulse response loaded.':'Effect controls are saved in your rig · Audio processing is not connected.';
  if(window.FreeRigReact){FreeRigReact.editor({rig:state,block:b,definition:d,sound:v,optionsOpen:!!optionsOpen,note});panel.scrollTop=scroll;return;}
  $('#editor').innerHTML=`<article class="editor" style="--accent:${d.colour}"><div class="editor-top"><div class="title"><span class="device-icon">${d.icon}</span><div><strong>${escapeHTML(d.name)}</strong><small>${escapeHTML(d.detail)} / ${escapeHTML(state.sceneNames[state.scene])} scene</small></div></div><div class="editor-actions"><button id="replace-device" aria-label="Replace selected device">Replace device…</button>  <button id="close-editor" aria-label="Close device controls">Routing ↗</button></div></div>${EffectTools.controls(b)}<div class="editor-body">${NativeDesktop.face(d,b,v)}</div><details class="device-options"><summary>Device options <span>Models, appearance & placement</span></summary>${NativeDesktop.controls(b)}${DeviceShelf.selector(b)}<div class="placement-tools"><label>Move to <select id="device-slot" aria-label="Device slot">${SlotBoard.slots(state).map(slot=>`<option value="${slot.section}:${slot.index}" ${b.slot.section===slot.section&&b.slot.index===slot.index?'selected':''}>${SlotBoard.label(slot)}${slot.block&&slot.block.id!==b.id?' (replace)':''}</option>`).join('')}</select></label><button id="remove" aria-label="Remove device">Remove from rig</button></div></details><div class="control-hint">Drag a knob up/down · Shift for fine adjustment · Click a value to type · Footswitch toggles bypass</div><div class="editor-note"><span>${escapeHTML(note)}</span><span>PATCH DEVICE / ${String(index+1).padStart(2,'0')}</span></div></article>`;
  // Keep the existing model selector and handler, but put it beside Replace device.
  const model=panel.querySelector('#saved-model');
  if(model){const label=model.closest('label');label.classList.add('header-model');model.setAttribute('aria-label','Capture preset');panel.querySelector('.editor-actions').prepend(label);panel.querySelector('.title small').textContent='TONE3000 / '+state.sceneNames[state.scene]+' scene';}
  // Reuse the existing browse action so its selected-device target stays intact.
  const browse=panel.querySelector('#browse-tone');
  if(browse){const tools=browse.parentElement;panel.querySelector('#replace-device').before(browse);if(!tools.children.length)tools.remove();}
  const options=panel.querySelector('.device-options');if(options)options.open=!!optionsOpen;panel.scrollTop=scroll;
}
function addDevice(key,slot=chosenSlot,openEditor=true){
  if(key.startsWith("pack:")){DeviceShelf.place(key.slice(5),slot,null,openEditor);return;}
  if(state.blocks.length>=24){toast('This prototype supports up to 24 blocks.');return;}
  const def=PatchRig.definition(key);if(!def)return;
  const slots=SlotBoard.slots(state),section=def.type==='Amps'?'amp':key==='cab'?'cab':'pre';
  slot=slot||slots.find(s=>s.section===section&&!s.block)||slots.find(s=>s.section==='post'&&!s.block);
  if(!slot||slots.some(s=>s.section===slot.section&&s.index===slot.index&&s.block)){toast('Choose an empty + slot first.');return;}
  checkpoint();const block={id:'b'+crypto.randomUUID(),key,x:0,y:0};SlotBoard.add(state,block,slot);selected=openEditor?block.id:null;chosenSlot=null;$('#modal').close();render();toast('Device added to '+SlotBoard.label(slot)+'.');
}
function moveDevice(id,slot,openEditor=true){const block=state.blocks.find(b=>b.id===id);if(!slot||!block)return;const type=PatchRig.definition(block.key).type;
  checkpoint();selected=SlotBoard.move(state,id,slot,state.keepCables===true&&($('#chain').dataset.mode==='advanced'||!SlotBoard.isStandard(state)));if(!openEditor)selected=null;render();
}
function replaceDevice(id,key,openEditor=true){if(key.startsWith("pack:")){DeviceShelf.place(key.slice(5),null,id,openEditor);return;}const b=state.blocks.find(b=>b.id===id);if(!b||!SlotBoard.compatible(b.key,key)){toast('Choose an amp, cab or pedal to match this device.');return;}checkpoint();SlotBoard.replace(state,id,key);selected=openEditor?id:null;render();toast('Device replaced. Cables and scene bypass states kept. Undo restores the previous sound.');}
 function removeDevice(id,openEditor=true){checkpoint();SlotBoard.remove(state,id);selected=openEditor?(state.blocks[0]?.id||null):null;pendingCable=null;render();toast('Device removed. Its neighbours stay connected. Undo restores it.');}
function chooseSlot(value){const [section,index]=value.split(':');chosenSlot={section,index:Number(index)};openDevicePicker(null,section==='amp'?'Amps':section==='cab'?'Cabs':'All');}
function openDevicePicker(blockId,category){
  const block=state.blocks.find(b=>b.id===blockId);
  devicePicker={blockId: block?.id||null,category:category||libraryCategory(PatchRig.definition(block.key)),query:''};
  $('#modal').classList.add('device-picker-modal');
  modal(block?'REPLACE / '+DeviceShelf.definition(block).name.toUpperCase():'ADD / '+SlotBoard.label(chosenSlot).toUpperCase(),'<h2>Choose your sound.</h2><div id="picker-filters" class="filters" aria-label="Device categories"></div><label class="picker-search">Search devices<input id="picker-search" type="search" placeholder="Search this category…" autocomplete="off"></label><div id="picker-results" class="slot-picker"></div>');
  renderDevicePicker();
}
function renderDevicePicker(){
  if(!devicePicker)return;
  const {category,query}=devicePicker;
  $('#picker-filters').innerHTML=deviceCategories.map(t=>'<button data-picker-filter="'+t+'" class="'+(t===category?'active':'')+'" aria-pressed="'+(t===category)+'">'+t+'</button>').join('');
  const items=catalogue.filter(d=>(category==='All'||libraryCategory(d)===category)&&(d.name+' '+d.detail+' '+libraryCategory(d)).toLowerCase().includes(query));
  $('#picker-results').innerHTML=DeviceShelf.pickerCards(category,query)+items.map(d=>'<button data-picker="'+d.key+'">'+GearArt.svg(d.key)+'<strong>'+escapeHTML(d.name)+'</strong><small>'+escapeHTML(libraryCategory(d))+'</small></button>').join('')||'<p class="empty">No matching devices. Try another category or search.</p>';
}

function cable(from,to){if(!PatchRig.canConnect(state,from,to)){toast('That cable is already connected, invalid, or would create a feedback loop.');return false;}checkpoint();PatchRig.connect(state,from,to);pendingCable=null;render();toast('Cable connected — shared by every scene.');return true;}
function openCables(){modal('PATCH / SHARED WIRING',PatchUI.controls(state));}

function toggle(id){checkpoint();current({id}).on=!current({id}).on;render();}
function modal(title,body){$('#modal-eyebrow').textContent=title;$('#modal-content').innerHTML=body;$('#modal').showModal();}
$('#filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;renderLibrary();}};
$('#search').oninput=renderLibrary;
$('#library').onclick=e=>{const b=e.target.closest('[data-add]');if(b)addDevice(b.dataset.add);};
$('#chain').onclick=e=>{
  const slot=e.target.closest('[data-slot]');if(slot){chooseSlot(slot.dataset.slot);return;}
  const port=e.target.closest('[data-port]'),block=e.target.closest('[data-block]'),bypass=e.target.closest('[data-node-bypass]'),wire=e.target.closest('[data-cable]');
  if(port){if(port.dataset.port==='out'){pendingCable=pendingCable===port.dataset.node?null:port.dataset.node;PatchUI.render(state,selected,pendingCable);}else if(pendingCable)cable(pendingCable,port.dataset.node);else toast('Choose an output jack first.');return;}
  if(bypass){toggle(bypass.dataset.nodeBypass);return;}
  if(block){selected=block.dataset.block;render();}
  if(wire)openCables();
  if(e.target.closest('[data-legacy]')){state.legacy.scene=state.scene;modal('SAVED ROUTING SETTINGS',RoutingUI.controls(state.legacy));}
};
function destination(e){return PatchUI.destination(e);}
$('#editor').onclick=e=>{const button=e.target.closest('button');if(!button)return;if(button.id==='replace-device'){openDevicePicker(selected);return;}if(button.id==='close-editor'){selected=null;render();return;}if(button.id==='bypass')toggle(selected);if(button.id==='remove')removeDevice(selected);};
$('#editor').addEventListener('change',e=>{if(e.target.id==='device-slot'){const [section,index]=e.target.value.split(':');moveDevice(selected,{section,index:Number(index)});}});
$('#routing-bar').onclick=e=>{
  if(e.target.closest('#advanced-routing')){if($('#chain').dataset.mode==='advanced'||!SlotBoard.isStandard(state)){if(!SlotBoard.isStandard(state)){modal('PEDALBOARD ORDER','<h2>Use the pedalboard signal order?</h2><p>This reconnects the patch as Before amp → Amp → FX loop → Cabinets in parallel → After cab → Output. Custom branches and legacy mixer settings are replaced. Device settings and scenes stay. Undo restores the original routing.</p><button id="confirm-pedalboard" class="primary">Use pedalboard order</button>');return;}$('#chain').dataset.mode='board';}else $('#chain').dataset.mode='advanced';pendingCable=null;PatchUI.render(state,selected,pendingCable);return;}

  if(e.target.closest('#add-amp-slot,#add-cab-slot')){const section=e.target.closest('#add-amp-slot')?'amp':'cab',slot=SlotBoard.slots(state).find(s=>s.section===section&&!s.block);chooseSlot(section+':'+slot.index);return;}
  if(e.target.closest('#wire-list'))openCables();
  if(e.target.closest('#arrange')){checkpoint();PatchRig.arrange(state);render();}
  if(e.target.closest('#routing-example'))modal('EXAMPLE PATCH','<h2>Echo around the amp.</h2><p>The drive output splits: one cable goes through the amp, the other through a delay. Both join at the cabinet. The delay starts at 100% wet. This replaces your open patch; Undo restores it. Your saved patch stays unchanged until Save.</p><button id="confirm-template" class="primary">Load pre-amp delay example</button>');
};
$('#routing-bar').onchange=e=>{if(e.target.id==='keep-cables'){state.keepCables=e.target.checked;mark();return;}if(e.target.id==='board-zoom'){$('#chain').dataset.zoom=e.target.value;PatchUI.render(state,selected,pendingCable);}};
$('#rename-scene').onclick=()=>modal('SCENE NAME','<h2>Name this scene.</h2><label>Scene name<input id="scene-name" maxlength="24" value="'+escapeHTML(state.sceneNames[state.scene])+'"></label><button id="apply-scene-name" class="primary">Rename scene</button>');
$('#copy-scene').onclick=()=>modal('COPY SCENE','<h2>Copy '+escapeHTML(state.sceneNames[state.scene])+'.</h2><p>Replace another scene’s knob settings and bypass states. Its name and the patch wiring stay as they are. Undo can restore it.</p><label>Destination scene<select id="scene-destination">'+state.sceneNames.map((name,i)=>i===state.scene?'':'<option value="'+i+'">'+escapeHTML(name)+'</option>').join('')+'</select></label><button id="apply-copy-scene" class="primary">Copy settings</button>');
$('#modal-content').addEventListener('click',e=>{
  if(e.target.id==='confirm-pedalboard'){checkpoint();SlotBoard.useStandard(state);$('#chain').dataset.mode='board';pendingCable=null;$('#modal').close();render();return;}
  const category=e.target.closest('[data-picker-filter]');if(category&&devicePicker){devicePicker.category=category.dataset.pickerFilter;renderDevicePicker();return;}
  const picker=e.target.closest('[data-picker]');if(picker&&devicePicker){const target=devicePicker.blockId;if(target){replaceDevice(target,picker.dataset.picker);$('#modal').close();}else addDevice(picker.dataset.picker);return;}
  if(e.target.id==='confirm-template'){checkpoint();state=PatchRig.createDefault();selected='b2';pendingCable=null;$('#modal').close();render();}
  if(e.target.id==='connect-cable'){const from=$('#cable-from').value,to=$('#cable-to').value;if(cable(from,to))openCables();}
  const remove=e.target.closest('[data-disconnect]');if(remove){checkpoint();state.connections.splice(Number(remove.dataset.disconnect),1);render();openCables();}
  if(e.target.id==='apply-scene-name'){const name=$('#scene-name').value.trim();if(!name){toast('Give the scene a name.');return;}checkpoint();state.sceneNames[state.scene]=name;$('#modal').close();render();}
  if(e.target.id==='apply-copy-scene'){checkpoint();PatchRig.copyScene(state,state.scene,Number($('#scene-destination').value));$('#modal').close();render();toast('Scene settings copied.');}
});
function updateRoutingControl(e){
  const el=e.target;if(!el.dataset.route||!state.legacy)return;
  const r=state.legacy.routes[state.scene],keys=el.dataset.route.split('.'),obj=keys.length===2?r[keys[0]]:r,key=keys.at(-1);
  let value=el.type==='checkbox'?el.checked:el.tagName==='SELECT'?el.value:Number(el.value);
  if(typeof value==='number'){if(el.value===''||!Number.isFinite(value))return;value=Math.max(Number(el.min),Math.min(Number(el.max),value));}
  if(obj[key]===value)return;checkpoint();obj[key]=value;if(key==='mode')$('#split-extra').innerHTML=RoutingUI.splitExtra(r);render();
}
$('#modal-content').addEventListener('input',updateRoutingControl);
$('#modal-content').addEventListener('change',updateRoutingControl);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected&&!$('#modal').open&&!pendingCable){selected=null;render();}if(e.key==='Escape'&&pendingCable){pendingCable=null;PatchUI.render(state,selected);}});

// Keep range elements mounted during pointer and keyboard interaction.
let parameterEditing=false;
$('#editor').addEventListener('input',e=>{const el=e.target;if(!el.matches('[data-param],[data-number]'))return;if(!parameterEditing){checkpoint();parameterEditing=true;}const i=Number(el.dataset.param??el.dataset.number),b=state.blocks.find(x=>x.id===selected),d=catalogue.find(x=>x.key===b.key),p=d.params[i];if(el.value==='')return;const value=Math.max(p[1],Math.min(p[2],Number(el.value)));if(!Number.isFinite(value))return;current(b).values[i]=value;const parent=el.closest('.parameter');parent.querySelector('[data-param]').value=value;if(!el.matches('[data-number]'))parent.querySelector('[data-number]').value=value;const proportion=(value-p[1])/(p[2]-p[1]);parent.querySelector('.knob').style.setProperty('--angle',`${proportion*270}deg`);parent.querySelector('.knob').style.setProperty('--rotate',`${-135+proportion*270}deg`);mark();});
$('#editor').addEventListener('change',e=>{if(e.target.matches('[data-param],[data-number]')){parameterEditing=false;const i=Number(e.target.dataset.param??e.target.dataset.number);e.target.value=current(state.blocks.find(b=>b.id===selected)).values[i];}});
$('#scenes').onclick=e=>{const b=e.target.closest('[data-scene]');if(b){checkpoint();state.scene=Number(b.dataset.scene);NativeDesktop.sync(state,true);render();}};
$('#performance-scenes').onclick=e=>{const b=e.target.closest('[data-scene]');if(b)$('#scenes [data-scene="'+b.dataset.scene+'"]').click();};
$('#device-overview').onclick=e=>{const b=e.target.closest('[data-block]');selected=b?b.dataset.block:null;renderEditor();};
$('#stomps').onclick=e=>{const b=e.target.closest('[data-stomp]');if(b)toggle(b.dataset.stomp);};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.body.dataset.view=b.dataset.view;selected=null;renderEditor();document.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('active',n===b));document.querySelectorAll('.workspace-view').forEach(s=>s.hidden=s.id!==`${b.dataset.view}-view`);});
$('#rig-name').onfocus=()=>checkpoint();$('#rig-name').oninput=e=>{state.name=e.target.value;mark();};$('#rig-name').onblur=()=>{state.name=state.name.trim()||'Untitled rig';$('#rig-name').value=state.name;mark();};
$('#undo').onclick=()=>{if(!history.length)return;state=history.pop();pendingCable=null;if(selected&&!state.blocks.some(b=>b.id===selected))selected=state.blocks[0]?.id||null;render();};
$('#save').onclick=()=>{try{if(window.BankUI)BankUI.save();localStorage.setItem(storageKey,JSON.stringify(state));saved=clone(state);mark();toast('Patch and all '+state.scenes.length+' scenes saved on this computer.');}catch{toast('Local save unavailable. Use Export to keep your rig.');}};
$('#export').onclick=()=>{if(NativeDesktop.installed()){NativeDesktop.exportPatch({format:'guitar-suite-prototype',version:3,rig:state,graph:PatchRig.graph(state)});return;}const url=URL.createObjectURL(new Blob([JSON.stringify({format:'guitar-suite-prototype',version:3,rig:state,graph:PatchRig.graph(state)},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${state.name.replace(/[^a-z0-9 -]/gi,'').trim()||'guitar-rig'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Rig settings exported. No audio or model files included.');};

$('#tone3000').onclick=()=>ToneLibrary.open();
$('#settings').onclick=NativeDesktop.setup;
$('#close-modal').onclick=()=>$('#modal').close();$('#modal').onclick=e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}};
$('#tempo').onchange=e=>{checkpoint();state.tempo=Math.max(40,Math.min(240,Number(e.target.value)||112));render();if(pulseTimer){stopPulse();startPulse();}};
function startPulse(){let beat=0;const pulse=()=>{document.querySelectorAll('#beats i').forEach((e,i)=>e.classList.toggle('active',i===beat));beat=(beat+1)%4;};pulse();pulseTimer=setInterval(pulse,60000/state.tempo);$('#metronome').textContent='Stop visual pulse';}
function stopPulse(){clearInterval(pulseTimer);pulseTimer=null;$('#metronome').textContent='Start visual pulse';document.querySelectorAll('#beats i').forEach(e=>e.classList.remove('active'));}
$('#metronome').onclick=()=>pulseTimer?stopPulse():startPulse();
$('#loop').onclick=()=>{if(loopTimer)return;$('#loop-status').textContent='Preview running — no audio is being captured.';$('#loop').disabled=true;loopTimer=setInterval(()=>{loopSeconds++;$('#loop-display').textContent=`${String(Math.floor(loopSeconds/60)).padStart(2,'0')}:${String(loopSeconds%60).padStart(2,'0')}`;},1000);};
function stopLoop(){clearInterval(loopTimer);loopTimer=null;$('#loop').disabled=false;$('#loop-status').textContent='Preview stopped. No audio was recorded.';}
$('#stop-loop').onclick=stopLoop;$('#clear-loop').onclick=()=>{stopLoop();loopSeconds=0;$('#loop-display').textContent='00:00';};
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||$('#modal').open)return;if(/^[1-8]$/.test(e.key)&&Number(e.key)<=state.scenes.length){checkpoint();state.scene=Number(e.key)-1;NativeDesktop.sync(state,true);render();}if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();$('#save').click();}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
renderLibrary();render();

installGearDrag({root:$('#chain'),library:$('#library'),resolveTarget:destination,onRemove:id=>removeDevice(id,false),onDrop:(payload,target)=>{const slot=target.slot||state.blocks.find(b=>b.id===target.id)?.slot;if(payload.key&&target.id)replaceDevice(target.id,payload.key,false);else if(payload.key)addDevice(payload.key,slot,false);else moveDevice(payload.id,slot,false);}});
new ResizeObserver(()=>{if($('#chain').clientWidth>0)PatchUI.render(state,selected,pendingCable);}).observe($('#chain'));

HardwareControls.install($('#editor'));



NativeDesktop.boot();

// Close panels on an outside press; do this before a new device's click opens it.
document.addEventListener('pointerdown',e=>{
  if(!selected||$('#modal').open||e.target.closest('#editor,#device-overview,#scenes,#performance-scenes,.scene-tools,[data-block],button,input,select,label,a,summary'))return;
  selected=null;renderEditor();
  // Keep the clicked board control mounted so its pending click still works.
  document.querySelectorAll('#chain .selected,#chain .cable.lit').forEach(el=>el.classList.remove('selected','lit'));
  document.querySelectorAll('#chain [data-block][aria-pressed="true"]').forEach(el=>el.setAttribute('aria-pressed','false'));
});
$('#modal-content').addEventListener('input',e=>{if(e.target.id==='picker-search'&&devicePicker){devicePicker.query=e.target.value.trim().toLowerCase();renderDevicePicker();}});
$('#modal').addEventListener('close',()=>{devicePicker=null;chosenSlot=null;$('#modal').classList.remove('device-picker-modal');});

// Explicit command adapter: all mutations keep the existing Undo/save/native sync path.
window.FreeRigReact?.connect({
 snapshot:()=>state,
 edit:id=>{selected=id;render();},
 bypass:id=>toggle(id),
 replace:id=>{selected=id;openDevicePicker(id);},
 remove:id=>removeDevice(id,false),
 add:value=>chooseSlot(value),
 duplicate:id=>{if(state.blocks.length>=24){toast('The rig supports up to 24 devices.');return;}checkpoint();RigActions.duplicate(state,id,'b'+crypto.randomUUID());selected=null;render();toast('Device duplicated with all scene settings. Undo restores the rig.');},
 move:(id,section)=>moveDevice(id,RigActions.emptySlot(state,section),false)
});
document.addEventListener('keydown',e=>{if(e.defaultPrevented||e.target.closest('input,textarea,select')||$('#modal').open)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('#undo').click();}});
