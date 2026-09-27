const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ui=fs.existsSync(path.join(root,'prototype'))?path.join(root,'prototype'):root;
const existing=require(path.join(ui,'effects-catalogue.js'));
const native=JSON.parse(fs.readFileSync(path.join(__dirname,'effects-catalogue.json'),'utf8').replace(/^\uFEFF/,''));
const additions={
 CloudSeed:{name:'CloudSeed Space',category:'Reverb',engine:'Cloud Seed Core / Ghost Note Audio',colour:'#9289bb',presets:[['Dark space',[6,20,30,6500,25,15]],['Endless sky',[16,45,65,4500,42,10]],['Soft plate',[2.5,8,12,9000,20,30]]]},
 EchoKing:{name:'EchoKing MkII',category:'Delay',engine:'Cleveland Music Co. / FreeRig port',colour:'#c58a58',presets:[['EP-2 warm tape',[320,35,70,50,25,30,2,1]],['EP-1 worn slap',[100,18,90,35,50,24,1,2]],['EP-3 clear repeats',[450,48,70,65,12,32,3,0]]]},
 PhotonVibe:{name:'Photon Vibe',category:'Modulation',engine:'Cleveland Music Co. / FreeRig port',colour:'#a38dc2',presets:[['Vintage swirl',[1.2,65,50,50,0,0,0]],['Slow photocell',[.55,90,70,50,15,0,0]],['Liquid vibrato',[2.4,60,45,50,0,1,0]]]},
 TriPhase:{name:'TriPhase Theorem',category:'Modulation',engine:'Cleveland Music Co. / FreeRig port',colour:'#d09567',presets:[['Script 90',[1,.6,0,100,0]],['Gentle 45',[0,.45,0,100,0]],['Stone colour',[2,.8,100,100,0]]]}
};
const all=existing.filter(d=>!additions[d.key.slice(3)]);
for(const [key,meta] of Object.entries(additions)){const d=native.find(d=>d.key===key);if(!d)throw Error('Missing native effect '+key);const presets=meta.presets.map(([name,values])=>({name,values}));all.push({...d,...meta,key:'fx-'+key,type:'Pedals',detail:meta.category+' · '+meta.engine,icon:meta.category==='Reverb'?'✧':meta.category==='Delay'?'≈':'∿',sync:false,presets});}
fs.writeFileSync(path.join(ui,'effects-catalogue.js'),'/* Generated native parameters with curated factory presets. */\n(function(root){const data='+JSON.stringify(all,null,2)+";if(typeof module==='object'&&module.exports)module.exports=data;else root.EffectsCatalogue=data;})(globalThis);\n");
fs.writeFileSync(path.join(__dirname,'effect-presets.json'),JSON.stringify(all.map(d=>({key:d.key.slice(3),presets:d.presets})),null,2));
console.log('Added four effects with twelve curated presets; existing entries preserved.');
