window.NativeDesktop=(()=>{
 const host=window.chrome?.webview;let drivers=[],running=false,timer;const send=value=>host?.postMessage(value);
 function sync(patch){if(!host)return;clearTimeout(timer);timer=setTimeout(()=>send({type:'sync',patch}),90);}
 function setup(){
  if(!host){modal('WINDOWS PROGRAM','<h2>Open Guitar Suite.exe to play.</h2><p>This browser tab is the design preview. The Windows program includes ASIO, built-in amps, NAM loading and cabinet IR import.</p>');return;}
  modal('WINDOWS AUDIO','<h2>Plug in and play.</h2><p>Choose your interface’s ASIO driver and guitar input. Output starts at −12 dB with a safety ceiling. This first engine is mono, sent to both outputs.</p><label>Driver<select id="audio-driver">'+drivers.map(name=>'<option>'+escapeHTML(name)+'</option>').join('')+'</select></label><button id="inspect-driver">Read channels</button> <button id="driver-panel">Driver / buffer settings</button><div class="cable-form"><label>Guitar input<select id="audio-input"><option value="0">Input 1</option></select></label><label>Stereo output<select id="audio-output"><option value="0">Outputs 1 + 2</option></select></label><label>Sample rate<select id="audio-rate"><option value="48000">48,000 Hz</option><option value="44100">44,100 Hz</option><option value="96000">96,000 Hz</option></select></label></div><p id="audio-message" role="status">'+(running?'Audio is running.':'Audio is stopped. Use Read channels to see your interface inputs.')+'</p><meter id="input-meter" min="0" max="1" value="0" aria-label="Guitar input level"></meter><div class="transport"><button id="start-audio" class="primary">Start audio</button><button id="stop-audio">Stop audio</button></div><p>Change the chain while stopped. Scenes and knobs work while playing. Tails/spillover and seamless routing changes are not implemented yet.</p>');
 }
 function installed(){return !!host;}
 function importPatch(value){const candidate=PatchRig.migrate(value?.rig||value);if(!candidate){toast('This is not a supported Guitar Suite patch. A .nam model is imported on an amp.');return;}checkpoint();state=SlotBoard.assign(candidate);selected=state.blocks[0]?.id||null;render();toast('Patch imported. Import any missing NAM or IR files onto their devices.');}
 if(host)host.addEventListener('message',e=>{
  const message=e.data;
  if(message.type==='ready'){drivers=message.drivers;document.querySelector('.notice').innerHTML='<span class="tag">DESKTOP ALPHA</span> Built-in amps · ASIO · NAM + IR import · Audio starts only when you press Start.';catalogue.find(d=>d.key==='amp').detail='British crunch · Amplitron';catalogue.find(d=>d.key==='cleanamp').detail='American clean · Amplitron';catalogue.find(d=>d.key==='cab').detail='Filtered cabinet · IR ready';renderLibrary();render();}
  if(message.type==='status'){running=message.running;$('#settings').innerHTML=(running?'● ':'○ ')+escapeHTML(message.message)+' ↗';const line=$('#audio-message');if(line)line.textContent=message.message;document.querySelector('.statusbar').firstElementChild.textContent=message.message;document.querySelector('.statusbar').children[1].textContent=running?'ASIO active':'ASIO ready';document.querySelector('.chain-footer').firstElementChild.textContent=running?'Native audio engine running':'Native audio engine stopped';document.querySelector('.version').textContent='GUITAR SUITE / DESKTOP ALPHA';}
  if(message.type==='error'){toast(message.message);const line=$('#audio-message');if(line)line.textContent=message.message;}
  if(message.type==='meter'&&$('#input-meter'))$('#input-meter').value=Math.min(1,message.peak);
  if(message.type==='driver'&&$('#audio-input')){$('#audio-input').innerHTML=message.inputs.map((name,i)=>'<option value="'+i+'">'+escapeHTML(name)+'</option>').join('');$('#audio-output').innerHTML=message.outputs.slice(0,-1).map((name,i)=>'<option value="'+i+'">'+escapeHTML(name)+' + '+escapeHTML(message.outputs[i+1])+'</option>').join('');}
  if(message.type==='asset'){const b=state.blocks.find(b=>b.id===message.blockId);if(!b)return;checkpoint();b.assetId=message.assetId;b.assetName=message.assetName;render();toast('Imported '+message.assetName+'. Use '+message.rate.toLocaleString()+' Hz for playback.');}
  if(message.type==='patch')importPatch(message.value);
 });
 document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.id==='inspect-driver'||button.id==='driver-panel')send({type:'driver',driver:$('#audio-driver').value,panel:button.id==='driver-panel'});
  if(button.id==='start-audio'){clearTimeout(timer);send({type:'sync',patch:state});send({type:'start',driver:$('#audio-driver').value,input:Number($('#audio-input').value),output:Number($('#audio-output').value),rate:Number($('#audio-rate').value)});}
  if(button.id==='stop-audio')send({type:'stop'});
  if(button.id==='import-model'){if(!host){setup();return;}const b=state.blocks.find(b=>b.id===selected);send({type:'importAsset',blockId:b.id,kind:b.key==='cab'?'cab':'amp'});}
  if(button.id==='factory-model'){const b=state.blocks.find(b=>b.id===selected);checkpoint();delete b.assetId;delete b.assetName;render();}
  if(button.id==='import-patch'){if(host){send({type:'importPatch'});return;}const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=async()=>{try{if(input.files[0].size>4000000)throw Error();importPatch(JSON.parse(await input.files[0].text()));}catch{toast('Unable to read this patch file.');}};input.click();}
 });
 function controls(b){if(!['amp','cleanamp','cab'].includes(b.key))return '';return '<div class="asset-tools"><span>'+escapeHTML(b.assetName||(b.key==='cab'?'Built-in filtered cabinet':'Built-in Amplitron amp'))+'</span><button id="import-model">Import '+(b.key==='cab'?'cab IR (.wav)':'NAM (.nam)')+'</button>'+(b.assetId?'<button id="factory-model">Use built-in</button>':'')+'</div>';}
 function boot(){if(host)send({type:'ready'});}
 function face(d,b,v){let html=HardwareControls.face(d,v);if(host&&!b.assetId)html=html.replace('NAM A2 / CAPTURE PLAYER','BUILT-IN / AMPLITRON').replace('TRIM & EQ CONTROLS SURROUND THE CAPTURE','AMP INPUT / TONE / OUTPUT').replace('CABINET IR / OUTPUT SHAPING','FILTERED CABINET / OUTPUT SHAPING');return html;}
 return {sync,setup,installed,controls,face,boot,exportPatch:value=>send({type:'exportPatch',value})};
})();
