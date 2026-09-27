/* Original hardware-inspired illustrations; appearance never selects a DSP model. */
window.GearLooks=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const designs=[
 ['British Gold','#292826','#c7a866','#393632','gold',2],
 ['American Blackface','#202326','#bfc2bf','#70777a','silver',2],
 ['Golden Tweed','#bc9958','#876c41','#665442','tweed',1],
 ['Orange Box','#cd672e','#e8d7a4','#826b48','cream',2],
 ['Diamond Boutique','#472e24','#a57b43','#816948','diamond',2],
 ['California Rectifier','#1e2022','#909599','#25282c','steel',4],
 ['German Steel','#202227','#afb2ac','#52575b','steel',4],
 ['Ivory Boutique','#d4c9a8','#725e40','#948268','cream',1],
 ['Brown Panel','#614833','#a58759','#756754','tweed',2],
 ['Silver Sparkle','#777f83','#d5d8d5','#393f43','silver',2],
 ['Red High Gain','#8b2928','#161a1e','#333337','steel',4],
 ['Blue Chime','#274f69','#d5c797','#7c7a6a','diamond',2],
 ['Olive Vintage','#5e6741','#baac75','#443f2e','gold',1],
 ['Purple Stack','#654568','#c3a379','#29282c','gold',4],
 ['Walnut Studio','#6d4a30','#d8c3a1','#8e7b61','wood',1],
 ['Blackout Modern','#151718','#4a5051','#171c1f','steel',4],
 ['Seafoam Combo','#85a89b','#ded3b4','#817c6a','silver',2],
 ['Red Tolex','#9e3e37','#d8c49b','#55483d','cream',2],
 ['Copper Boutique','#4a3932','#b68861','#57504a','gold',1],
 ['White Stadium','#d2d0c7','#3d4246','#474e51','steel',4]
 ];
 const families=[
 ['Marshall','head','gold','script'],['Fender blackface','combo','black','script'],['Fender tweed','combo','tweed','script'],['Orange','head','cream','block'],['VOX','combo','diamond','serif'],['Mesa/Boogie','head','steel','plate'],['ENGL','head','steel','block'],['Matchless','combo','cream','plate'],['Fender brownface','combo','brown','script'],['Fender silverface','combo','silver','script'],['Soldano','head','black','block'],['VOX','combo','diamond','serif'],['Hiwatt','head','black','plate'],['Bogner','head','gold','script'],['Boutique wood','combo','wood','serif'],['Diezel','head','steel','block'],['Fender custom','combo','silver','script'],['Orange custom','head','cream','block'],['Friedman','head','gold','script'],['Peavey','head','black','block']
 ];
 const pedalNames=['Compact cast','Compact treadle','Folded steel','Wide studio','Green overdrive','Black distortion','Silver fuzz','Cream boost','Brown drive','Silver modulation','Red distortion','Blue chorus','Olive drive','Purple modulation','Copper tremolo','Black studio','Seafoam delay','Red fuzz','Copper boost','White ambience'];
 const pedalBrands=['MXR','BOSS','Electro-Harmonix','Strymon','Ibanez','Pro Co','Dunlop','boutique','boutique','Electro-Harmonix','BOSS','BOSS','MXR','boutique','boutique','Eventide','TC Electronic','Dunlop','boutique','Strymon'];
 const kind=b=>b.key==='cab'?'cab':PatchRig.definition(b.key)?.type==='Amps'?'amp':'pedal';
 function list(b){const pedal=kind(b)==='pedal';return designs.map((d,i)=>({id:'look-'+i,name:pedal?pedalNames[i]:d[0]+(kind(b)==='cab'?' '+d[5]+'×12':''),body:d[1],panel:d[2],grille:d[3],texture:d[4],speakers:d[5],brand:pedal?pedalBrands[i]:families[i][0],format:families[i][1],face:pedal?([1,10,11].includes(i)?'pedal-treadle':[3,15,19].includes(i)?'pedal-wide':[2,6,9].includes(i)?'pedal-folded':'pedal-cast'):families[i][2],badge:families[i][3]}));}

 function get(b){const all=list(b);return all.find(d=>d.id===b.appearance?.style)||all[b.appearance?.style==='tweed'?2:b.appearance?.style==='modern'?5:b.key==='cleanamp'||b.key==='fx-GXOrange'?1:b.key==='drive'?4:0];}
 function selector(b){const selected=get(b);return '<label>Hardware look<select id="device-look" aria-label="Hardware look">'+list(b).map(d=>'<option value="'+d.id+'" '+(d.id===selected.id?'selected':'')+'>'+esc(d.name+' · '+d.brand+'-style')+'</option>').join('')+'</select></label>';}
 let seq=0;
 function art(b,on=true){if(kind(b)==='pedal'&&!b.appearance)return GearArt.svg(b.key,on);const d=get(b),id='look'+(++seq),body=/^#[a-f0-9]{6}$/i.test(b.appearance?.colour||'')?b.appearance.colour:d.body,type=kind(b),four=d.speakers===4,cab=type==='cab',pedal=type==='pedal';
 const x=pedal?49:cab&&d.speakers===1?43:13,w=pedal?102:cab&&d.speakers===1?114:174,y=cab?10:pedal?8:28,h=cab?137:pedal?138:108;
 let inside='';
 if(cab){const coords=d.speakers===1?[[100,81,42]]:four?[[61,54,29],[139,54,29],[61,115,29],[139,115,29]]:[[59,88,36],[140,88,36]];inside=coords.map(([a,c,r])=>'<circle cx="'+a+'" cy="'+c+'" r="'+r+'" fill="url(#'+id+'cone)" stroke="#9996"/><circle cx="'+a+'" cy="'+c+'" r="'+r*.24+'" fill="#1c2021"/>').join('')+'<rect x="'+(x+9)+'" y="21" width="'+(w-18)+'" height="115" fill="url(#'+id+'weave)"/><rect x="72" y="25" width="56" height="15" fill="'+d.panel+'"/><text x="100" y="35" text-anchor="middle" font-size="7" fill="#171a18">'+d.speakers+' × 12</text>';}
 else if(pedal){inside=[73,101,129].map(a=>'<circle cx="'+a+'" cy="33" r="9" fill="#242726" stroke="#c4c9b5"/><path d="M'+a+' 25v6" stroke="#fff"/>').join('')+'<text x="100" y="70" fill="#f0e9d9" text-anchor="middle" font-size="10">'+esc(PatchRig.definition(b.key)?.name?.slice(0,18)||'CAPTURE')+'</text><path d="M72 91q14-24 28 0t28 0" stroke="#fff7" fill="none"/><circle cx="100" cy="122" r="11" fill="#bbc0b7" stroke="#454944"/><circle cx="125" cy="111" r="3" fill="'+(on?'#e5ffa9':'#464b43')+'"/>';}
 else{const combo=d.format==='combo',grilleY=combo?76:40,panelY=combo?40:98;inside='<rect x="23" y="'+grilleY+'" width="154" height="'+(combo?47:52)+'" fill="url(#'+id+'weave)"/><text x="100" y="'+(grilleY+32)+'" text-anchor="middle" fill="#f1e4c9" font-family="'+(d.badge==='script'?'Georgia':'Arial')+'" font-style="'+(d.badge==='script'?'italic':'normal')+'" font-size="17">'+esc(d.name.split(' ')[0])+'</text><rect x="23" y="'+panelY+'" width="154" height="'+(combo?31:25)+'" rx="2" fill="'+(d.face==='black'||d.face==='steel'?'#161a1b':d.panel)+'"/>'+[37,57,77,97,117,137].map(a=>'<circle cx="'+a+'" cy="'+(panelY+13)+'" r="5" fill="#282b28" stroke="#bbb8a7"/><path d="M'+a+' '+(panelY+8)+'v3" stroke="#fff"/>').join('')+'<circle cx="165" cy="'+(panelY+13)+'" r="3" fill="'+(on?'#ffaa63':'#4b4134')+'"/>';}

 return '<svg class="gear-svg" viewBox="0 0 200 160" aria-hidden="true"><defs><pattern id="'+id+'tolex" width="200" height="160" patternUnits="userSpaceOnUse"><image href="tolex-black.png" width="200" height="160"/></pattern><radialGradient id="'+id+'cone"><stop stop-color="#15191a"/><stop offset=".4" stop-color="#43494a"/><stop offset=".85" stop-color="#22292a"/><stop offset="1" stop-color="#5c625e"/></radialGradient><pattern id="'+id+'weave" width="'+(d.texture==='diamond'?12:4)+'" height="'+(d.texture==='diamond'?12:4)+'" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="'+d.grille+'" opacity=".55"/><path d="'+(d.texture==='diamond'?'M0 6L6 0l6 6-6 6Z':'M0 0h4v4')+'" stroke="#ddd8" stroke-width=".5" fill="none"/></pattern><linearGradient id="'+id+'shine" x2=".7" y2="1"><stop stop-color="#ffffff22"/><stop offset="1" stop-color="#0005"/></linearGradient></defs><ellipse cx="100" cy="151" rx="80" ry="6" fill="#0005"/>'+(!pedal&&!cab?'<path d="M74 28v-9h52v9" stroke="#7a7c71" stroke-width="6" fill="none"/>':'')+'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(d.texture==='steel'?3:8)+'" fill="'+body+'" stroke="#161b1a" stroke-width="4"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6" fill="url(#'+id+'tolex)" opacity=".35"/><rect x="'+(x+6)+'" y="'+(y+6)+'" width="'+(w-12)+'" height="'+(h-12)+'" fill="url(#'+id+'shine)"/>'+inside+'</svg>';
 }
 function skin(b,html){const d=get(b),body=/^#[a-f0-9]{6}$/i.test(b.appearance?.colour||'')?b.appearance.colour:d.body;if(kind(b)==='cab')html=html.replace('<i></i><i></i><strong>','<i></i>'.repeat(d.speakers)+'<strong>');return '<div class="custom-device '+(/^#[a-f0-9]{6}$/i.test(b.appearance?.colour||'')?'colour-custom ':'')+'look-'+d.texture+' speakers-'+d.speakers+' family-'+d.face+' format-'+d.format+' badge-'+d.badge+' device-'+kind(b)+'" style="--device-colour:'+(kind(b)==='pedal'&&!b.appearance?(PatchRig.definition(b.key)?.colour||body):body)+';--look-panel:'+d.panel+';--look-grille:'+d.grille+'">'+html+'<div class="hardware-style-credit">'+esc(d.brand+'-style enclosure')+' · appearance only</div></div>';}
 return {list,get,selector,art,skin};
})();

