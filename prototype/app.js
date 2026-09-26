'use strict';
const $ = (s) => document.querySelector(s);
const {catalogue,clone}=PatchRig;
const storageKey='guitar-suite-rig-v3';
let state=PatchRig.createDefault(),saved=null,history=[],selected='b2',filter='All',dirty=false,toastTimer,loopTimer,pulseTimer,loopSeconds=0,pendingCable=null;
try {
  const stored=JSON.parse(localStorage.getItem(storageKey)||localStorage.getItem('guitar-suite-rig-v2')||localStorage.getItem('guitar-suite-rig-v1'));
  const migrated=PatchRig.migrate(stored);if(migrated)state=migrated;
}catch { /* A corrupt or unavailable save must not stop the editor. */ }
saved=clone(state);
if(!state.blocks.some(b=>b.id===selected))selected=state.blocks[0].id;
const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function checkpoint(){history.push(clone(state));if(history.length>40)history.shift();}
function mark(){dirty=JSON.stringify(state)!==JSON.stringify(saved);$('#dirty').textContent=dirty?'UNSAVED':'SAVED';$('#undo').disabled=!history.length;}
function current(b){return state.scenes[state.scene][b.id];}
const libraryCategory=d=>({drive:'Drive',delay:'Delay',chorus:'Modulation',reverb:'Reverb',compressor:'Dynamics',gate:'Utility'}[d.key]||d.type);
function renderLibrary(){
  const q=$('#search').value.toLowerCase();
  $('#filters').innerHTML=['All','Amps','Cabs','Drive','Delay','Modulation','Reverb','Dynamics','Utility'].map(t=>`<button class="${filter===t?'active':''}" data-filter="${t}" aria-pressed="${filter===t}">${t}</button>`).join('');
  const items=catalogue.filter(d=>(filter==='All'||libraryCategory(d)===filter)&&(d.name+' '+d.detail+' '+libraryCategory(d)).toLowerCase().includes(q));
  $('#library-count').textContent=String(catalogue.length).padStart(2,'0');
  $('#library-label').textContent=filter==='All'?'ALL DEVICES':filter.toUpperCase();
  $('#library').innerHTML=items.map(d=>`<button draggable="false" class="library-item" data-add="${d.key}" aria-label="Add ${d.name}"><span class="library-gear">${GearArt.svg(d.key)}</span><span><strong>${d.name}</strong><small>${d.detail}</small></span><span class="plus">＋</span></button>`).join('')||'<div class="empty">No matching devices. Try another search.</div>';
}
function render(){
  $('#rig-name').value=state.name;$('#tempo').value=state.tempo;$('#tempo-status').textContent=`${state.tempo} BPM`;$('#device-count').textContent=`${state.blocks.length} devices`;
  PatchUI.render(state,selected,pendingCable);
  $('#scenes').innerHTML=state.sceneNames.map((name,i)=>`<button class="scene ${state.scene===i?'active':''}" data-scene="${i}" aria-pressed="${state.scene===i}"><span class="scene-number">0${i+1}</span><span><strong>${escapeHTML(name)}</strong><small>${Object.values(state.scenes[i]).filter(v=>v.on).length} devices on</small></span></button>`).join('');
  $('#stomps').innerHTML=state.blocks.map(b=>{const d=catalogue.find(x=>x.key===b.key);return `<button class="stomp ${current(b).on?'':'bypassed'}" data-stomp="${b.id}" style="--accent:${d.colour}" aria-pressed="${current(b).on}">${GearArt.svg(b.key,current(b).on)}<strong>${d.name}</strong><small>${current(b).on?'ON · CLICK TO BYPASS':'BYPASSED · CLICK TO ENABLE'}</small></button>`;}).join('');
  renderEditor();mark();
}
function renderEditor(){
  const b=state.blocks.find(x=>x.id===selected);if(!b)return;
  const d=catalogue.find(x=>x.key===b.key),v=current(b),index=state.blocks.indexOf(b);
  const note=d.type==='Amps'?'NAM capture placeholder · EQ and trims are external controls.':b.key==='cab'?'Cabinet placeholder · No impulse response loaded.':'Effect controls are saved in your rig · Audio processing is not connected.';
  $('#editor').innerHTML=`<article class="editor" style="--accent:${d.colour}"><div class="editor-top"><div class="title"><span class="device-icon">${d.icon}</span><div><strong>${d.name}</strong><small>${d.detail} / ${escapeHTML(state.sceneNames[state.scene])} scene</small></div></div><div class="editor-actions"><label class="board-position">Board X <input id="position-x" type="number" min="0" max="5000" step="10" value="${b.x}" aria-label="Device position X"></label><label class="board-position">Y <input id="position-y" type="number" min="0" max="3000" step="10" value="${b.y}" aria-label="Device position Y"></label> <button id="remove" aria-label="Remove device" ${state.blocks.length===1?'disabled':''}>✕</button></div></div><div class="editor-body">${HardwareControls.face(d,v)}</div><div class="control-hint">Drag a knob up/down · Shift for fine adjustment · Click a value to type · Footswitch toggles bypass</div><div class="editor-note"><span>${note}</span><span>PATCH DEVICE / ${String(index+1).padStart(2,'0')}</span></div></article>`;
}
function addDevice(key,position=null){
  if(state.blocks.length>=24){toast('This prototype supports up to 24 blocks.');return;}
  if(!PatchRig.definition(key))return;
  checkpoint();const b={id:'b'+crypto.randomUUID(),key,...(position||{x:220+(state.blocks.length%5)*170,y:500})};
  state.blocks.push(b);state.scenes.forEach(s=>s[b.id]=PatchRig.valuesFor(b));selected=b.id;render();toast('Device added. Connect its input and output jacks.');
}
function moveDevice(id,position){checkpoint();Object.assign(state.blocks.find(b=>b.id===id),position);selected=id;render();}
function cable(from,to){if(!PatchRig.canConnect(state,from,to)){toast('That cable is already connected, invalid, or would create a feedback loop.');return false;}checkpoint();PatchRig.connect(state,from,to);pendingCable=null;render();toast('Cable connected — shared by every scene.');return true;}
function openCables(){modal('PATCH / SHARED WIRING',PatchUI.controls(state));}

function toggle(id){checkpoint();current({id}).on=!current({id}).on;render();}
function modal(title,body){$('#modal-eyebrow').textContent=title;$('#modal-content').innerHTML=body;$('#modal').showModal();}
$('#filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;renderLibrary();}};
$('#search').oninput=renderLibrary;
$('#library').onclick=e=>{const b=e.target.closest('[data-add]');if(b)addDevice(b.dataset.add);};
$('#chain').onclick=e=>{
  const port=e.target.closest('[data-port]'),block=e.target.closest('[data-block]'),bypass=e.target.closest('[data-node-bypass]'),wire=e.target.closest('[data-cable]');
  if(port){if(port.dataset.port==='out'){pendingCable=pendingCable===port.dataset.node?null:port.dataset.node;PatchUI.render(state,selected,pendingCable);}else if(pendingCable)cable(pendingCable,port.dataset.node);else toast('Choose an output jack first.');return;}
  if(bypass){toggle(bypass.dataset.nodeBypass);return;}
  if(block){selected=block.dataset.block;render();}
  if(wire)openCables();
  if(e.target.closest('[data-legacy]')){state.legacy.scene=state.scene;modal('SAVED ROUTING SETTINGS',RoutingUI.controls(state.legacy));}
};
function destination(e){return PatchUI.destination(e);}
$('#editor').onclick=e=>{const button=e.target.closest('button');if(!button)return;if(button.id==='bypass')toggle(selected);if(button.id==='remove'&&state.blocks.length>1){checkpoint();PatchRig.remove(state,selected);selected=state.blocks[0].id;pendingCable=null;render();toast('Device and its cables removed. Undo restores them.');}};
$('#editor').addEventListener('change',e=>{if(!['position-x','position-y'].includes(e.target.id))return;const axis=e.target.id.endsWith('x')?'x':'y',v=Number(e.target.value);if(Number.isFinite(v))moveDevice(selected,{[axis]:Math.max(0,Math.min(axis==='x'?5000:3000,v))});});
$('#routing-bar').onclick=e=>{
  if(e.target.closest('#wire-list'))openCables();
  if(e.target.closest('#arrange')){checkpoint();PatchRig.arrange(state);render();}
  if(e.target.closest('#routing-example'))modal('EXAMPLE PATCH','<h2>Echo around the amp.</h2><p>The drive output splits: one cable goes through the amp, the other through a delay. Both join at the cabinet. The delay starts at 100% wet. This replaces your open patch; Undo restores it. Your saved patch stays unchanged until Save.</p><button id="confirm-template" class="primary">Load pre-amp delay example</button>');
};
$('#routing-bar').onchange=e=>{if(e.target.id==='board-zoom'){$('#chain').dataset.zoom=e.target.value;PatchUI.render(state,selected,pendingCable);}};
$('#rename-scene').onclick=()=>modal('SCENE NAME','<h2>Name this scene.</h2><label>Scene name<input id="scene-name" maxlength="24" value="'+escapeHTML(state.sceneNames[state.scene])+'"></label><button id="apply-scene-name" class="primary">Rename scene</button>');
$('#copy-scene').onclick=()=>modal('COPY SCENE','<h2>Copy '+escapeHTML(state.sceneNames[state.scene])+'.</h2><p>Replace another scene’s knob settings and bypass states. Its name and the patch wiring stay as they are. Undo can restore it.</p><label>Destination scene<select id="scene-destination">'+state.sceneNames.map((name,i)=>i===state.scene?'':'<option value="'+i+'">'+escapeHTML(name)+'</option>').join('')+'</select></label><button id="apply-copy-scene" class="primary">Copy settings</button>');
$('#modal-content').addEventListener('click',e=>{
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
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pendingCable){pendingCable=null;PatchUI.render(state,selected);}});

// Keep range elements mounted during pointer and keyboard interaction.
let parameterEditing=false;
$('#editor').addEventListener('input',e=>{const el=e.target;if(!el.matches('[data-param],[data-number]'))return;if(!parameterEditing){checkpoint();parameterEditing=true;}const i=Number(el.dataset.param??el.dataset.number),b=state.blocks.find(x=>x.id===selected),d=catalogue.find(x=>x.key===b.key),p=d.params[i];if(el.value==='')return;const value=Math.max(p[1],Math.min(p[2],Number(el.value)));if(!Number.isFinite(value))return;current(b).values[i]=value;const parent=el.closest('.parameter');parent.querySelector('[data-param]').value=value;if(!el.matches('[data-number]'))parent.querySelector('[data-number]').value=value;const proportion=(value-p[1])/(p[2]-p[1]);parent.querySelector('.knob').style.setProperty('--angle',`${proportion*270}deg`);parent.querySelector('.knob').style.setProperty('--rotate',`${-135+proportion*270}deg`);mark();});
$('#editor').addEventListener('change',e=>{if(e.target.matches('[data-param],[data-number]')){parameterEditing=false;const i=Number(e.target.dataset.param??e.target.dataset.number);e.target.value=current(state.blocks.find(b=>b.id===selected)).values[i];}});
$('#scenes').onclick=e=>{const b=e.target.closest('[data-scene]');if(b){checkpoint();state.scene=Number(b.dataset.scene);render();}};
$('#stomps').onclick=e=>{const b=e.target.closest('[data-stomp]');if(b)toggle(b.dataset.stomp);};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('active',n===b));document.querySelectorAll('.workspace-view').forEach(s=>s.hidden=s.id!==`${b.dataset.view}-view`);});
$('#rig-name').onfocus=()=>checkpoint();$('#rig-name').oninput=e=>{state.name=e.target.value;mark();};$('#rig-name').onblur=()=>{state.name=state.name.trim()||'Untitled rig';$('#rig-name').value=state.name;mark();};
$('#undo').onclick=()=>{if(!history.length)return;state=history.pop();pendingCable=null;if(!state.blocks.some(b=>b.id===selected))selected=state.blocks[0].id;render();};
$('#save').onclick=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));saved=clone(state);mark();toast('Patch and all four scenes saved on this computer.');}catch{toast('Local save unavailable. Use Export to keep your rig.');}};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'guitar-suite-prototype',version:3,rig:state,graph:PatchRig.graph(state)},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${state.name.replace(/[^a-z0-9 -]/gi,'').trim()||'guitar-rig'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Rig settings exported. No audio or model files included.');};
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

installGearDrag({root:$('#chain'),library:$('#library'),resolveTarget:destination,onDrop:(payload,target)=>{const position={x:target.x,y:target.y};if(payload.key)addDevice(payload.key,position);else moveDevice(payload.id,position);}});
new ResizeObserver(()=>{if($('#chain').clientWidth>0)PatchUI.render(state,selected,pendingCable);}).observe($('#chain'));

HardwareControls.install($('#editor'));


