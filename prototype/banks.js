/* Portable bank data is independent of the UI and audio device settings. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./patch-model.js'));else root.PatchBanks=factory(root.PatchRig);})(globalThis,function(rig){
 const clone=rig.clone;
 function valid(bank){return !!bank&&typeof bank.id==='string'&&/^[\w-]{1,80}$/.test(bank.id)&&typeof bank.name==='string'&&bank.name.trim().length>0&&bank.name.length<=60&&Array.isArray(bank.patches)&&bank.patches.length<=128&&new Set(bank.patches.map(p=>p.id)).size===bank.patches.length&&bank.patches.every(p=>p&&typeof p.id==='string'&&/^[\w-]{1,80}$/.test(p.id)&&rig.valid(p.rig));}
 function validStore(s){return !!s&&s.version===1&&Array.isArray(s.banks)&&s.banks.length>0&&s.banks.length<=64&&new Set(s.banks.map(b=>b.id)).size===s.banks.length&&s.banks.every(valid);}
 function extendScenes(s){if(s.scenes.length===4){for(let i=0;i<4;i++){s.scenes.push(clone(s.scenes[i]));s.sceneNames.push('Scene '+(i+5));}if(s.legacy){s.legacy.scenes.push(...clone(s.legacy.scenes));s.legacy.routes.push(...clone(s.legacy.routes));}}s.showExtraScenes=true;return s;}
 function exportBank(bank){if(!valid(bank))throw Error('Invalid bank');return {format:'guitar-suite-bank',version:1,bank:clone(bank)};}
 return {valid,validStore,extendScenes,exportBank};
});
