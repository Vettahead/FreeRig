/* The native detector sees the guitar input before any effects or output mute. */
window.GuitarTuner=(()=>{
 let active=false,reference=440,muted=true;
 const host=window.chrome?.webview,send=()=>host?.postMessage({type:'tuner',enabled:active,mute:muted});
 function open(){active=true;send();modal('CHROMATIC TUNER',`<div class="tuner-face"><div id="tuner-note" aria-live="polite">—</div><div id="tuner-cents">Play one string and let it ring</div><div class="tuner-track"><span>♭</span><i></i><b id="tuner-needle" hidden></b><span>♯</span></div><div class="tuner-scale"><span>−50</span><span>IN TUNE</span><span>+50 cents</span></div><p id="tuner-status">${host?'Listening to your clean guitar input. Start audio in Audio setup if needed.':'Open Guitar Suite.exe and start audio to tune.'}</p><div class="tuner-options"><label>A4 reference <input id="tuner-reference" type="number" min="430" max="450" step="1" value="${reference}"> Hz</label><label><input id="tuner-mute" type="checkbox" ${muted?'checked':''}> Mute output while tuning</label></div><small>Standard guitar: E2 · A2 · D3 · G3 · B3 · E4<br>Chromatic detection also supports alternate tunings.</small></div>`);}
 document.addEventListener('click',e=>{if(e.target.closest('#tuner'))open();});
 document.addEventListener('change',e=>{if(e.target.id==='tuner-mute'){muted=e.target.checked;send();}if(e.target.id==='tuner-reference'){reference=Math.max(430,Math.min(450,Math.round(Number(e.target.value)||440)));e.target.value=reference;}});
 document.querySelector('#modal').addEventListener('close',()=>{if(active){active=false;send();}});
 if(host)host.addEventListener('message',e=>{const m=e.data;if(m.type!=='tuner'||!active||!document.querySelector('#tuner-note'))return;const valid=m.running&&Number.isFinite(m.hz)&&m.hz>=35&&m.hz<=1400&&m.confidence>.85;
 const note=document.querySelector('#tuner-note'),cents=document.querySelector('#tuner-cents'),needle=document.querySelector('#tuner-needle');
 if(!valid){note.textContent='—';note.classList.remove('in-tune');cents.textContent='Play one string and let it ring';needle.hidden=true;document.querySelector('#tuner-status').textContent=m.running?'Waiting for a clear note…':'Audio is stopped. Close the tuner and start audio in Audio setup.';return;}
 const midi=69+12*Math.log2(m.hz/reference),nearest=Math.round(midi),offset=(midi-nearest)*100;note.textContent=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][(nearest%12+12)%12]+(Math.floor(nearest/12)-1);note.classList.toggle('in-tune',Math.abs(offset)<3);cents.textContent=(offset>0?'+':'')+offset.toFixed(1)+' cents';needle.hidden=false;needle.style.left=(50+Math.max(-50,Math.min(50,offset)))+'%';document.querySelector('#tuner-status').textContent=m.hz.toFixed(1)+' Hz · '+(Math.abs(offset)<3?'In tune':offset<0?'Tune up slightly':'Tune down slightly');
 });return {open};
})();

