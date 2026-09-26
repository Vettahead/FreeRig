'use strict';
const $ = (s) => document.querySelector(s);
const catalogue = [
  {key:'gate',name:'Quiet Gate',type:'Utility',icon:'⊣',colour:'#a7b995',detail:'Noise gate',params:[['Threshold',-80,0,-54,'dB'],['Release',10,500,120,'ms']]},
  {key:'drive',name:'Moss Drive',type:'Pedals',icon:'↯',colour:'#bdcf80',detail:'Overdrive · DSP',params:[['Drive',0,10,4.2,''],['Tone',0,10,5.5,''],['Level',-24,12,0,'dB']]},
  {key:'amp',name:'British Bloom',type:'Amps',icon:'≋',colour:'#d6b77e',detail:'NAM A2 · Placeholder',params:[['Input trim',-24,24,0,'dB'],['Bass EQ',-12,12,1.5,'dB'],['Mid EQ',-12,12,0,'dB'],['Treble EQ',-12,12,2,'dB'],['Output',-30,6,-6,'dB']]},
  {key:'cab',name:'Vintage 2×12',type:'Cabs',icon:'▦',colour:'#c0a688',detail:'Cabinet IR · Placeholder',params:[['Low cut',20,300,80,'Hz'],['High cut',2000,20000,8000,'Hz'],['Level',-24,6,-3,'dB']]},
  {key:'delay',name:'Tape Echo',type:'Pedals',icon:'≈',colour:'#82b7ba',detail:'Stereo delay · DSP',params:[['Time',30,1500,380,'ms'],['Feedback',0,95,32,'%'],['Mix',0,100,22,'%']]},
  {key:'reverb',name:'Open Space',type:'Pedals',icon:'✧',colour:'#b8a0c8',detail:'Reverb · DSP',params:[['Decay',0.2,15,3.5,'s'],['Tone',0,10,6,''],['Mix',0,100,24,'%']]},
  {key:'chorus',name:'Slow Tide',type:'Pedals',icon:'∿',colour:'#79b5ad',detail:'Chorus · DSP',params:[['Rate',0.1,8,0.8,'Hz'],['Depth',0,100,45,'%'],['Mix',0,100,35,'%']]},
  {key:'compressor',name:'Soft Press',type:'Utility',icon:'⇥',colour:'#a7b995',detail:'Compressor · DSP',params:[['Threshold',-60,0,-24,'dB'],['Ratio',1,20,4,':1'],['Attack',1,100,20,'ms']]}
];
const sceneNames=['Clean','Crunch','Lead','Ambient'];
const sceneDescriptions=['Open & articulate','A little edge','Out in front','Room to wander'];
const clone = (v) => JSON.parse(JSON.stringify(v));
const makeBlock = (key, index) => {const d=catalogue.find(x=>x.key===key);return {id:`b${index}`,key,on:true,values:d.params.map(p=>p[3])};};
const defaultBlocks=['gate','drive','amp','cab','delay','reverb'].map(makeBlock);
const defaultState={name:'Sunday / Slow Bloom',scene:1,tempo:112,blocks:defaultBlocks,scenes:sceneNames.map((_,i)=>Object.fromEntries(defaultBlocks.map(b=>[b.id,{on:b.key==='drive'?i!==0:true,values:b.values.map((v,j)=>b.key==='reverb'&&j===2&&i===3?58:b.key==='delay'&&j===2&&i===3?40:v)}])))};
const storageKey='guitar-suite-rig-v1';
let state=clone(defaultState),saved=null,history=[],selected='b2',filter='All',dragged=null,dirty=false,toastTimer,loopTimer,pulseTimer,loopSeconds=0;
const valid = s => s && typeof s.name==='string' && Number.isInteger(s.scene)&&s.scene>=0&&s.scene<4 && Number.isFinite(s.tempo)&&s.tempo>=40&&s.tempo<=240 && Array.isArray(s.blocks)&&s.blocks.length>0&&s.blocks.length<=24&&new Set(s.blocks.map(b=>b.id)).size===s.blocks.length&&s.blocks.every(b=>typeof b.id==='string'&&catalogue.some(d=>d.key===b.key))&&Array.isArray(s.scenes)&&s.scenes.length===4&&s.scenes.every(scene=>scene&&s.blocks.every(b=>{const d=catalogue.find(x=>x.key===b.key),v=scene[b.id];return v&&typeof v.on==='boolean'&&Array.isArray(v.values)&&v.values.length===d.params.length&&v.values.every((n,i)=>Number.isFinite(n)&&n>=d.params[i][1]&&n<=d.params[i][2]);}));
try{const stored=JSON.parse(localStorage.getItem(storageKey));if(valid(stored))state=stored;saved=clone(state);}catch{saved=clone(state);}
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
  $('#library').innerHTML=items.map(d=>`<button class="library-item" data-add="${d.key}" aria-label="Add ${d.name}"><span class="device-icon" style="--accent:${d.colour}">${d.icon}</span><span><strong>${d.name}</strong><small>${d.detail}</small></span><span class="plus">＋</span></button>`).join('')||'<div class="empty">No matching devices. Try another search.</div>';
}
function render(){
  $('#rig-name').value=state.name;$('#tempo').value=state.tempo;$('#tempo-status').textContent=`${state.tempo} BPM`;$('#device-count').textContent=`${state.blocks.length} devices`;
  $('#chain').innerHTML=state.blocks.map(b=>{const d=catalogue.find(x=>x.key===b.key),v=current(b);return `<button draggable="true" class="block ${b.id===selected?'selected':''} ${v.on?'':'bypassed'}" data-block="${b.id}" style="--accent:${d.colour}" aria-label="Edit ${d.name}${v.on?'':', bypassed'}" aria-pressed="${b.id===selected}"><span class="block-type">${d.type.toUpperCase()}<span class="block-symbol">${d.icon}</span></span><strong>${d.name}</strong><small>${v.on?'ON':'BYPASSED'} / ${b.key==='amp'?'NAM A2':b.key==='cab'?'IR':'DSP'}</small></button>`;}).join('');
  $('#scenes').innerHTML=sceneNames.map((name,i)=>`<button class="scene ${state.scene===i?'active':''}" data-scene="${i}" aria-pressed="${state.scene===i}"><span class="scene-number">0${i+1}</span><span><strong>${name}</strong><small>${sceneDescriptions[i]}</small></span></button>`).join('');
  $('#stomps').innerHTML=state.blocks.map(b=>{const d=catalogue.find(x=>x.key===b.key);return `<button class="stomp ${current(b).on?'':'bypassed'}" data-stomp="${b.id}" style="--accent:${d.colour}" aria-pressed="${current(b).on}">${d.icon}<strong>${d.name}</strong><small>${current(b).on?'ON · CLICK TO BYPASS':'BYPASSED · CLICK TO ENABLE'}</small></button>`;}).join('');
  renderEditor();mark();
}
function renderEditor(){
  const b=state.blocks.find(x=>x.id===selected);if(!b)return;
  const d=catalogue.find(x=>x.key===b.key),v=current(b),index=state.blocks.indexOf(b);
  const note=b.key==='amp'?'NAM capture placeholder · EQ and trims are external controls.':b.key==='cab'?'Cabinet placeholder · No impulse response loaded.':'Effect controls are saved in your rig · Audio processing is not connected.';
  $('#editor').innerHTML=`<article class="editor" style="--accent:${d.colour}"><div class="editor-top"><div class="title"><span class="device-icon">${d.icon}</span><div><strong>${d.name}</strong><small>${d.detail} / ${sceneNames[state.scene]} scene</small></div></div><div><button id="move-left" ${index===0?'disabled':''} aria-label="Move device left">←</button> <button id="move-right" ${index===state.blocks.length-1?'disabled':''} aria-label="Move device right">→</button> <button id="bypass" aria-pressed="${!v.on}">${v.on?'● Enabled':'○ Bypassed'}</button> <button id="remove" aria-label="Remove device" ${state.blocks.length===1?'disabled':''}>✕</button></div></div><div class="editor-body"><div class="amp-art"><strong>${b.key==='amp'?'Bloom':d.name.split(' ')[0]}</strong><small>${b.key==='amp'?'BRITISH VOICING':d.type.toUpperCase()}</small></div><div class="parameters">${d.params.map((p,i)=>{const percent=(v.values[i]-p[1])/(p[2]-p[1]);return `<div class="parameter"><div class="knob" style="--angle:${percent*270}deg;--rotate:${-135+percent*270}deg"><div class="knob-face"></div></div><label for="p${i}">${p[0].toUpperCase()}</label><div class="param-value"><input aria-label="${p[0]} value" data-number="${i}" type="number" min="${p[1]}" max="${p[2]}" step="${p[4]==='ms'||p[4]==='Hz'&&p[2]>100?1:0.1}" value="${v.values[i]}"><span>${p[4]}</span></div><input id="p${i}" aria-label="${p[0]}" data-param="${i}" type="range" min="${p[1]}" max="${p[2]}" step="${p[4]==='ms'||p[4]==='Hz'&&p[2]>100?1:0.1}" value="${v.values[i]}"></div>`;}).join('')}</div></div><div class="editor-note"><span>${note}</span><span>BLOCK ${String(index+1).padStart(2,'0')}</span></div></article>`;
}
function addDevice(key){if(state.blocks.length>=24){toast('This prototype supports up to 24 blocks.');return;}checkpoint();const b=makeBlock(key,crypto.randomUUID());state.blocks.push(b);state.scenes.forEach(s=>s[b.id]={on:true,values:clone(b.values)});selected=b.id;render();toast(`${catalogue.find(d=>d.key===key).name} added to rig`);}
function move(from,to){if(to<0||to>=state.blocks.length||from===to)return;checkpoint();const [b]=state.blocks.splice(from,1);state.blocks.splice(to,0,b);render();}
function toggle(id){checkpoint();current({id}).on=!current({id}).on;render();}
function modal(title,body){$('#modal-eyebrow').textContent=title;$('#modal-content').innerHTML=body;$('#modal').showModal();}
$('#filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;renderLibrary();}};
$('#search').oninput=renderLibrary;
$('#library').onclick=e=>{const b=e.target.closest('[data-add]');if(b)addDevice(b.dataset.add);};
$('#chain').onclick=e=>{const b=e.target.closest('[data-block]');if(b){selected=b.dataset.block;render();}};
$('#chain').ondragstart=e=>{const b=e.target.closest('[data-block]');if(!b)return;dragged=b.dataset.block;e.dataTransfer.setData('text/plain',dragged);e.dataTransfer.effectAllowed='move';};
$('#chain').ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';};
$('#chain').ondrop=e=>{e.preventDefault();const target=e.target.closest('[data-block]');if(target&&dragged)move(state.blocks.findIndex(b=>b.id===dragged),state.blocks.findIndex(b=>b.id===target.dataset.block));dragged=null;};
$('#chain').ondragend=()=>{dragged=null;};
$('#editor').onclick=e=>{const button=e.target.closest('button');if(!button)return;const index=state.blocks.findIndex(b=>b.id===selected);if(button.id==='bypass')toggle(selected);if(button.id==='move-left')move(index,index-1);if(button.id==='move-right')move(index,index+1);if(button.id==='remove'&&state.blocks.length>1){checkpoint();state.blocks.splice(index,1);state.scenes.forEach(s=>delete s[selected]);selected=state.blocks[Math.min(index,state.blocks.length-1)].id;render();}};
// Keep range elements mounted during pointer and keyboard interaction.
let parameterEditing=false;
$('#editor').addEventListener('input',e=>{const el=e.target;if(!el.matches('[data-param],[data-number]'))return;if(!parameterEditing){checkpoint();parameterEditing=true;}const i=Number(el.dataset.param??el.dataset.number),b=state.blocks.find(x=>x.id===selected),d=catalogue.find(x=>x.key===b.key),p=d.params[i];if(el.value==='')return;const value=Math.max(p[1],Math.min(p[2],Number(el.value)));if(!Number.isFinite(value))return;current(b).values[i]=value;const parent=el.closest('.parameter');parent.querySelector('[data-param]').value=value;if(!el.matches('[data-number]'))parent.querySelector('[data-number]').value=value;const proportion=(value-p[1])/(p[2]-p[1]);parent.querySelector('.knob').style.setProperty('--angle',`${proportion*270}deg`);parent.querySelector('.knob').style.setProperty('--rotate',`${-135+proportion*270}deg`);mark();});
$('#editor').addEventListener('change',e=>{if(e.target.matches('[data-param],[data-number]')){parameterEditing=false;renderEditor();}});
$('#scenes').onclick=e=>{const b=e.target.closest('[data-scene]');if(b){checkpoint();state.scene=Number(b.dataset.scene);render();}};
$('#stomps').onclick=e=>{const b=e.target.closest('[data-stomp]');if(b)toggle(b.dataset.stomp);};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('active',n===b));document.querySelectorAll('.workspace-view').forEach(s=>s.hidden=s.id!==`${b.dataset.view}-view`);});
$('#rig-name').onfocus=()=>checkpoint();$('#rig-name').oninput=e=>{state.name=e.target.value;mark();};$('#rig-name').onblur=()=>{state.name=state.name.trim()||'Untitled rig';$('#rig-name').value=state.name;mark();};
$('#undo').onclick=()=>{if(!history.length)return;state=history.pop();if(!state.blocks.some(b=>b.id===selected))selected=state.blocks[0].id;render();};
$('#save').onclick=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));saved=clone(state);mark();toast('Rig saved on this computer.');}catch{toast('Local save unavailable. Use Export to keep your rig.');}};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'guitar-suite-prototype',version:1,rig:state},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${state.name.replace(/[^a-z0-9 -]/gi,'').trim()||'guitar-rig'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Rig settings exported. No audio or model files included.');};
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
