'use strict';
const $ = (s) => document.querySelector(s);
const {catalogue,sceneNames,clone,makeBlock}=GuitarRig;
const sceneDescriptions=['Open & articulate','A little edge','Out in front','Room to wander'];
const storageKey='guitar-suite-rig-v2';
let state=GuitarRig.createDefault(),saved=null,history=[],selected='b2',filter='All',dirty=false,toastTimer,loopTimer,pulseTimer,loopSeconds=0,addLane='a';
try {
  const stored=JSON.parse(localStorage.getItem(storageKey)||localStorage.getItem('guitar-suite-rig-v1'));
  const migrated=GuitarRig.migrate(stored);if(migrated)state=migrated;
}catch { /* A corrupt or unavailable save must not stop the editor. */ }
saved=clone(state);
if(!state.blocks.some(b=>b.id===selected))selected=state.blocks[0].id;
const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function checkpoint(){history.push(clone(state));if(history.length>40)history.shift();}
function mark(){dirty=JSON.stringify(state)!==JSON.stringify(saved);$('#dirty').textContent=dirty?'UNSAVED':'SAVED';$('#undo').disabled=!history.length;}
function current(b){return state.scenes[state.scene][b.id];}
function renderLibrary(){
  const q=$('#search').value.toLowerCase();
  $('#filters').innerHTML=['All','Amps','Pedals','Cabs','Utility'].map(t=>`<button class="${filter===t?'active':''}" data-filter="${t}">${t}</button>`).join('');
  const items=catalogue.filter(d=>(filter==='All'||d.type===filter)&&(d.name+' '+d.detail).toLowerCase().includes(q));
  $('#library-count').textContent=String(catalogue.length).padStart(2,'0');
  $('#library-label').textContent=filter==='All'?'ALL DEVICES':filter.toUpperCase();
  $('#library').innerHTML=items.map(d=>`<button draggable="false" class="library-item" data-add="${d.key}" aria-label="Add ${d.name}"><span class="library-gear">${GearArt.svg(d.key)}</span><span><strong>${d.name}</strong><small>${d.detail}</small></span><span class="plus">＋</span></button>`).join('')||'<div class="empty">No matching devices. Try another search.</div>';
}
function render(){
  $('#rig-name').value=state.name;$('#tempo').value=state.tempo;$('#tempo-status').textContent=`${state.tempo} BPM`;$('#device-count').textContent=`${state.blocks.length} devices`;
  RoutingUI.render(state,selected,addLane);
  $('#scenes').innerHTML=sceneNames.map((name,i)=>`<button class="scene ${state.scene===i?'active':''}" data-scene="${i}" aria-pressed="${state.scene===i}"><span class="scene-number">0${i+1}</span><span><strong>${name}</strong><small>${sceneDescriptions[i]}</small></span></button>`).join('');
  $('#stomps').innerHTML=state.blocks.map(b=>{const d=catalogue.find(x=>x.key===b.key);return `<button class="stomp ${current(b).on?'':'bypassed'}" data-stomp="${b.id}" style="--accent:${d.colour}" aria-pressed="${current(b).on}">${GearArt.svg(b.key,current(b).on)}<strong>${d.name}</strong><small>${current(b).on?'ON · CLICK TO BYPASS':'BYPASSED · CLICK TO ENABLE'}</small></button>`;}).join('');
  renderEditor();mark();
}
function renderEditor(){
  const b=state.blocks.find(x=>x.id===selected);if(!b)return;
  const d=catalogue.find(x=>x.key===b.key),v=current(b),laneBlocks=GuitarRig.blocksIn(state,b.lane),index=laneBlocks.indexOf(b);
  const note=d.type==='Amps'?'NAM capture placeholder · EQ and trims are external controls.':b.key==='cab'?'Cabinet placeholder · No impulse response loaded.':'Effect controls are saved in your rig · Audio processing is not connected.';
  $('#editor').innerHTML=`<article class="editor" style="--accent:${d.colour}"><div class="editor-top"><div class="title"><span class="device-icon">${d.icon}</span><div><strong>${d.name}</strong><small>${d.detail} / ${sceneNames[state.scene]} scene</small></div></div><div class="editor-actions"><label class="lane-select-label">Move to <select id="block-lane" aria-label="Selected device path">${Object.entries(GuitarRig.laneNames).filter(([key])=>state.parallel||key!=='b').map(([key,label])=>`<option value="${key}" ${b.lane===key?'selected':''}>${label}</option>`).join('')}</select></label><button id="move-left" ${index===0?'disabled':''} aria-label="Move device left">←</button> <button id="move-right" ${index===laneBlocks.length-1?'disabled':''} aria-label="Move device right">→</button> <button id="remove" aria-label="Remove device" ${state.blocks.length===1?'disabled':''}>✕</button></div></div><div class="editor-body">${HardwareControls.face(d,v)}</div><div class="control-hint">Drag a knob up/down · Shift for fine adjustment · Click a value to type · Footswitch toggles bypass</div><div class="editor-note"><span>${note}</span><span>${GuitarRig.laneNames[b.lane].toUpperCase()} / ${String(index+1).padStart(2,'0')}</span></div></article>`;
}
function addDevice(key,lane=addLane,beforeId=null){
  if(state.blocks.length>=24){toast('This prototype supports up to 24 blocks.');return;}
  if(!GuitarRig.definition(key))return;
  checkpoint();const b=makeBlock(key,'b'+crypto.randomUUID(),lane);
  state.blocks.push(b);state.scenes.forEach(s=>s[b.id]=GuitarRig.valuesFor(b));
  if(beforeId)GuitarRig.relocate(state,b.id,lane,beforeId);
  selected=b.id;addLane=lane;render();toast(GuitarRig.definition(key).name+' added to '+GuitarRig.laneNames[lane]);
}
function moveInLane(id,offset){
  const block=state.blocks.find(b=>b.id===id),list=GuitarRig.blocksIn(state,block.lane),index=list.findIndex(b=>b.id===id),target=index+offset;
  if(target<0||target>=list.length)return;
  checkpoint();GuitarRig.relocate(state,id,block.lane,offset<0?list[target].id:list[target+1]?.id||null);render();
}
function relocate(id,lane,beforeId=null){checkpoint();GuitarRig.relocate(state,id,lane,beforeId);selected=id;addLane=lane;render();}

function toggle(id){checkpoint();current({id}).on=!current({id}).on;render();}
function modal(title,body){$('#modal-eyebrow').textContent=title;$('#modal-content').innerHTML=body;$('#modal').showModal();}
$('#filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;renderLibrary();}};
$('#search').oninput=renderLibrary;
$('#library').onclick=e=>{const b=e.target.closest('[data-add]');if(b)addDevice(b.dataset.add);};
$('#chain').onclick=e=>{
  const block=e.target.closest('[data-block]'),add=e.target.closest('[data-add-lane]'),junction=e.target.closest('[data-route-panel]');
  if(block){selected=block.dataset.block;render();}
  if(add){addLane=add.dataset.addLane;RoutingUI.render(state,selected,addLane);$('#search').focus();toast('Choose or drag a device into '+GuitarRig.laneNames[addLane]);}
  if(junction)openRouting();
};
// Shared destination rules for mouse, pen and touch dragging.
function destination(e){
  const lane=e.target.closest('[data-lane]');if(!lane)return null;
  const id=lane.dataset.lane,card=e.target.closest('[data-block]');
  if(!card)return {lane:id,before:null,element:lane,side:'drop-lane'};
  const box=card.getBoundingClientRect(),vertical=id==='pre'||id==='post';
  const after=vertical?e.clientY>box.top+box.height/2:e.clientX>box.left+box.width/2;
  const list=GuitarRig.blocksIn(state,id),index=list.findIndex(b=>b.id===card.dataset.block);
  return {lane:id,before:after?(list[index+1]?.id||null):card.dataset.block,element:card,side:after?'drop-after':'drop-before'};
}
$('#editor').onclick=e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.id==='bypass')toggle(selected);
  if(button.id==='move-left')moveInLane(selected,-1);
  if(button.id==='move-right')moveInLane(selected,1);
  if(button.id==='remove'&&state.blocks.length>1){checkpoint();const index=state.blocks.findIndex(b=>b.id===selected);state.blocks.splice(index,1);state.scenes.forEach(s=>delete s[selected]);selected=state.blocks[Math.min(index,state.blocks.length-1)].id;render();}
};
$('#editor').addEventListener('change',e=>{if(e.target.id==='block-lane')relocate(selected,e.target.value);});
function openRouting(){modal('ROUTING / '+sceneNames[state.scene].toUpperCase(),RoutingUI.controls(state));}
$('#routing-bar').onclick=e=>{
  const topology=e.target.closest('[data-topology]');
  if(topology){const enabled=topology.dataset.topology==='parallel';if(enabled===state.parallel)return;
    if(!enabled&&GuitarRig.blocksIn(state,'b').length){modal('CHANGE ROUTING','<h2>Join both paths?</h2><p>Path B devices will move after Path A, keeping all their scene settings. Before-split and after-merge devices stay in place. Undo restores the parallel layout.</p><button id="confirm-serial" class="primary">Join paths into serial</button>');return;}
    checkpoint();GuitarRig.setParallel(state,enabled);if(!enabled&&addLane==='b')addLane='a';render();
  }
  if(e.target.closest('#route-controls'))openRouting();
  if(e.target.closest('#dual-template'))modal('EXAMPLE RIG','<h2>Explore a dual-amp rig.</h2><p>Load a gate feeding two amp/cab paths, followed by shared delay and reverb. This replaces the current layout; Undo brings your rig back. Your saved rig is unchanged until you save.</p><button id="confirm-template" class="primary">Load example rig</button>');
};
$('#modal-content').addEventListener('click',e=>{
  if(e.target.id==='confirm-template'){checkpoint();state=GuitarRig.createDefault();selected='b2';addLane='a';$('#modal').close();render();}
  if(e.target.id==='confirm-serial'){checkpoint();GuitarRig.setParallel(state,false);if(addLane==='b')addLane='a';$('#modal').close();render();}
});
function updateRoutingControl(e){
  const el=e.target;if(!el.dataset.route)return;
  const r=state.routes[state.scene],keys=el.dataset.route.split('.'),obj=keys.length===2?r[keys[0]]:r,key=keys.at(-1);
  let value=el.type==='checkbox'?el.checked:el.tagName==='SELECT'?el.value:Number(el.value);
  if(typeof value==='number'){if(el.value===''||!Number.isFinite(value))return;value=Math.max(Number(el.min),Math.min(Number(el.max),value));if(e.type==='change')el.value=value;}
  if(obj[key]===value)return;checkpoint();obj[key]=value;
  if(key==='mode')$('#split-extra').innerHTML=RoutingUI.splitExtra(r);
  const output=el.parentElement.querySelector('output');if(output)output.textContent=key==='blend'?(100-value)+'% A / '+value+'% B':value===0?'Centre':Math.abs(value)+(value<0?' L':' R');
  render();
}
$('#modal-content').addEventListener('input',updateRoutingControl);
$('#modal-content').addEventListener('change',updateRoutingControl);

// Keep range elements mounted during pointer and keyboard interaction.
let parameterEditing=false;
$('#editor').addEventListener('input',e=>{const el=e.target;if(!el.matches('[data-param],[data-number]'))return;if(!parameterEditing){checkpoint();parameterEditing=true;}const i=Number(el.dataset.param??el.dataset.number),b=state.blocks.find(x=>x.id===selected),d=catalogue.find(x=>x.key===b.key),p=d.params[i];if(el.value==='')return;const value=Math.max(p[1],Math.min(p[2],Number(el.value)));if(!Number.isFinite(value))return;current(b).values[i]=value;const parent=el.closest('.parameter');parent.querySelector('[data-param]').value=value;if(!el.matches('[data-number]'))parent.querySelector('[data-number]').value=value;const proportion=(value-p[1])/(p[2]-p[1]);parent.querySelector('.knob').style.setProperty('--angle',`${proportion*270}deg`);parent.querySelector('.knob').style.setProperty('--rotate',`${-135+proportion*270}deg`);mark();});
$('#editor').addEventListener('change',e=>{if(e.target.matches('[data-param],[data-number]')){parameterEditing=false;const i=Number(e.target.dataset.param??e.target.dataset.number);e.target.value=current(state.blocks.find(b=>b.id===selected)).values[i];}});
$('#scenes').onclick=e=>{const b=e.target.closest('[data-scene]');if(b){checkpoint();state.scene=Number(b.dataset.scene);render();}};
$('#stomps').onclick=e=>{const b=e.target.closest('[data-stomp]');if(b)toggle(b.dataset.stomp);};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('active',n===b));document.querySelectorAll('.workspace-view').forEach(s=>s.hidden=s.id!==`${b.dataset.view}-view`);});
$('#rig-name').onfocus=()=>checkpoint();$('#rig-name').oninput=e=>{state.name=e.target.value;mark();};$('#rig-name').onblur=()=>{state.name=state.name.trim()||'Untitled rig';$('#rig-name').value=state.name;mark();};
$('#undo').onclick=()=>{if(!history.length)return;state=history.pop();if(!state.parallel&&addLane==='b')addLane='a';if(!state.blocks.some(b=>b.id===selected))selected=state.blocks[0].id;render();};
$('#save').onclick=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));saved=clone(state);mark();toast('Rig saved on this computer.');}catch{toast('Local save unavailable. Use Export to keep your rig.');}};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'guitar-suite-prototype',version:2,rig:state,graph:GuitarRig.graph(state)},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${state.name.replace(/[^a-z0-9 -]/gi,'').trim()||'guitar-rig'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Rig settings exported. No audio or model files included.');};
$('#add-device').onclick=()=>{$('#search').focus();$('#search').scrollIntoView({behavior:'smooth',block:'center'});};
$('#tone3000').onclick=()=>modal('CONNECTED LIBRARY','<h2>Your next favourite tone.</h2><p>TONE3000 browsing and downloads will connect here through the official API. This prototype does not sign in or download models.</p><p>Planned: your favourites, amp and pedal captures, cabinet IRs, and a local library for offline playing.</p><a href="https://www.tone3000.com" target="_blank" rel="noopener noreferrer">Explore TONE3000 ↗</a>');
$('#settings').onclick=()=>modal('WINDOWS AUDIO','<h2>Plug in. Find your sound.</h2><p>The desktop app will use your interface’s ASIO driver. Device detection is not available in this interface prototype.</p><label>Driver<select disabled><option>ASIO — native engine not connected</option></select></label><label>Input / output<select disabled><option>Connect audio engine to select channels</option></select></label><div class="setup-note"><p>Each player will choose their own interface, guitar input and headphone/speaker outputs. Hardware settings stay on that computer, separate from shared rigs.</p></div>');
$('#close-modal').onclick=()=>$('#modal').close();$('#modal').onclick=e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}};
$('#tempo').onchange=e=>{checkpoint();state.tempo=Math.max(40,Math.min(240,Number(e.target.value)||112));render();if(pulseTimer){stopPulse();startPulse();}};
function startPulse(){let beat=0;const pulse=()=>{document.querySelectorAll('#beats i').forEach((e,i)=>e.classList.toggle('active',i===beat));beat=(beat+1)%4;};pulse();pulseTimer=setInterval(pulse,60000/state.tempo);$('#metronome').textContent='Stop visual pulse';}
function stopPulse(){clearInterval(pulseTimer);pulseTimer=null;$('#metronome').textContent='Start visual pulse';document.querySelectorAll('#beats i').forEach(e=>e.classList.remove('active'));}
$('#metronome').onclick=()=>pulseTimer?stopPulse():startPulse();
$('#loop').onclick=()=>{if(loopTimer)return;$('#loop-status').textContent='Preview running — no audio is being captured.';$('#loop').disabled=true;loopTimer=setInterval(()=>{loopSeconds++;$('#loop-display').textContent=`${String(Math.floor(loopSeconds/60)).padStart(2,'0')}:${String(loopSeconds%60).padStart(2,'0')}`;},1000);};
function stopLoop(){clearInterval(loopTimer);loopTimer=null;$('#loop').disabled=false;$('#loop-status').textContent='Preview stopped. No audio was recorded.';}
$('#stop-loop').onclick=stopLoop;$('#clear-loop').onclick=()=>{stopLoop();loopSeconds=0;$('#loop-display').textContent='00:00';};
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||$('#modal').open)return;if(['1','2','3','4'].includes(e.key)){checkpoint();state.scene=Number(e.key)-1;render();}if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();$('#save').click();}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
renderLibrary();render();

installGearDrag({root:$('#chain'),library:$('#library'),resolveTarget:destination,onDrop:(payload,target)=>{if(payload.key)addDevice(payload.key,target.lane,target.before);else relocate(payload.id,target.lane,target.before);}});




HardwareControls.install($('#editor'));


