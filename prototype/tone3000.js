/* TONE3000's hosted Select flow owns browsing/sign-in. This page receives only
   public tone metadata and local asset references, never OAuth credentials. */
window.ToneLibrary=(()=>{
 const host=window.chrome?.webview,send=value=>host?.postMessage(value);
 let target=null,connected=false,details=null,busy=false,architecture='2';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function imageURL(value){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:'';}catch{return '';}}
 function picture(url,alt,cls='tone-picture'){const safe=imageURL(url);return safe?'<img class="'+cls+'" src="'+esc(safe)+'" alt="'+esc(alt)+'" referrerpolicy="no-referrer">':'';}
 function mark(){return '<img class="tone-brand" src="tone3000-logo.svg" alt="TONE3000">';}
 function block(){return state.blocks.find(b=>b.id===target);}
 function open(id=selected){
  const b=state.blocks.find(b=>b.id===id);if(!b){toast('Select an amp, cabinet or pedal in your chain, then browse TONE3000.');return;}
  target=id;details=null;architecture=b.tone3000?.architecture||'2';
  if(!host){modal('POWERED BY TONE3000',mark()+'<h2>Browse tones in the Windows app.</h2><p>Open FreeRig, select an amp, cabinet or pedal and choose Browse TONE3000.</p>');return;}
  send({type:'toneStatus'});intro();
 }
 function intro(){modal('POWERED BY TONE3000',mark()+'<h2>Your next favourite tone.</h2><p>Explore community captures of real amps and cabinets on TONE3000. Sign in there, pick a tone, then choose a model to load into this device.</p><p>'+esc(PatchRig.definition(block()?.key)?.name||'Selected device')+' · '+(connected?'Your TONE3000 connection is saved.':'Sign-in stays with TONE3000. No password is stored in FreeRig.')+'</p>'+architecturePicker()+'<button id="tone-browse" class="primary">Continue to TONE3000</button> '+(connected?'<button id="tone-disconnect">Disconnect account</button>':'')+'<p id="tone-message" role="status"></p>');setBusy();}
 function architecturePicker(){return block()?.key==='cab'?'':'<label>NAM models<select id="tone-architecture"><option value="2" '+(architecture==='2'?'selected':'')+'>A2</option><option value="1" '+(architecture==='1'?'selected':'')+'>A1</option><option value="custom" '+(architecture==='custom'?'selected':'')+'>Custom</option></select></label>';}
 function attribution(t){return '<div class="tone-attribution">'+picture(t.user?.avatar_url,'Creator avatar','tone-avatar')+'<span>@'+esc(t.user?.username||'Unknown creator')+'</span></div>';}
 function showDetails(){
  const t=details.tone,user=details.user;
  modal('POWERED BY TONE3000',mark()+'<div class="tone-account">'+picture(user?.avatar_url,'Your avatar','tone-avatar')+'<span>@'+esc(user?.username||'Connected')+'</span><button id="tone-browse">Browse TONE3000</button><button id="tone-disconnect">Disconnect</button></div>'+picture(t.images?.[0],t.title)+'<h2>'+esc(t.title)+'</h2><p>'+esc(t.gear)+' · '+esc(t.format?.toUpperCase())+'</p>'+attribution(t)+'<p>'+esc(t.description||'')+'</p><p>Licence: '+esc(t.license||'See tone page')+'</p>'+architecturePicker()+'<label>Model<select id="tone-model">'+details.models.map(m=>'<option value="'+Number(m.id)+'">'+esc(m.name)+' · '+esc(m.size)+'</option>').join('')+'</select></label>'+(t.gear==='amp-cab'?'<p>This capture already includes a cabinet. Bypass your separate cab if you do not want a second cabinet sound.</p>':'')+'<button id="tone-load" class="primary">Download and load into '+esc(PatchRig.definition(block()?.key)?.name||'device')+'</button><button id="tone-pack">Save pack ('+details.models.length+' models'+(t.format==='nam'?' · '+(architecture==='custom'?'Custom':'A'+architecture):'')+')</button><button id="tone-cancel" hidden>Stop after current model</button><p id="tone-message" role="status">Downloads appear as one device in your library. Cables and scenes stay in place.</p>');setBusy();
 }
 function setBusy(){for(const id of ['tone-browse','tone-load','tone-pack','tone-disconnect','tone-architecture','tone-model']){const el=document.getElementById(id);if(el)el.disabled=busy;}}
 function note(text){const el=document.getElementById('tone-message');if(el)el.textContent=text;else toast(text);}
 host?.addEventListener('message',e=>{const m=e.data;
  if(m.type==='toneStatus'){connected=m.connected;if(document.getElementById('tone-browse')&&!details)intro();}
  if(m.type==='toneBusy'){busy=m.busy;setBusy();if(!busy&&document.getElementById('tone-cancel'))document.getElementById('tone-cancel').hidden=true;}
  if(m.type==='toneError')note(m.message);if(m.type==='toneProgress')note(m.message);
  if(m.type==='toneDetails'){if(m.blockId!==target)return;connected=true;details=m;architecture=m.architecture;showDetails();}
 });
 document.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;
  if(button.id==='browse-tone'){open();return;}
  if(button.id==='tone-browse'){if(busy)return;busy=true;setBusy();note('Choose a tone in the TONE3000 window.');send({type:'toneBrowse',blockId:target,architecture});}
  if(button.id==='tone-load'){if(busy||!details)return;busy=true;setBusy();note('Downloading and checking the selected model…');send({type:'toneDownload',blockId:target,modelId:Number(document.getElementById('tone-model').value)});}
  if(button.id==='tone-pack'){if(busy||!details)return;busy=true;setBusy();document.getElementById('tone-cancel').hidden=false;note('Saving this pack to Devices…');send({type:'tonePack',blockId:target});}
  if(button.id==='tone-cancel'){send({type:'toneCancel'});note('Finishing the current model, then stopping. Saved files stay available.');}
  if(button.id==='tone-disconnect'){if(busy)return;details=null;send({type:'toneDisconnect'});}
  if(button.id==='tone-details'){const b=state.blocks.find(b=>b.id===selected);if(!b?.tone3000)return;open(b.id);note('Loading tone details…');send({type:'toneDetails',blockId:b.id,toneId:b.tone3000.id,architecture});}
 });
 document.addEventListener('change',e=>{if(e.target.id!=='tone-architecture')return;architecture=e.target.value;if(details){busy=true;setBusy();note('Loading models…');send({type:'toneDetails',blockId:target,toneId:details.tone.id,architecture});}});
 function controls(b){return '<div class="tone-tools"><button id="browse-tone">Browse TONE3000</button>'+(b.tone3000?'<button id="tone-details">'+esc(b.tone3000.title)+' · Browse variants</button>'+attribution(b.tone3000)+'<small>'+esc(b.tone3000.license)+'</small>':'')+'</div>';}
 function blockArt(b){return '<span class="tone-block-art">'+(picture(b.tone3000?.images?.[0],b.tone3000?.title)||GearArt.svg(b.key))+'<img class="tone-origin" src="tone3000-mark.svg" alt="TONE3000"></span>';}
 return {open,controls,blockArt,imageURL};
})();
