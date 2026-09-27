// Local-only preview server. No build step or third-party dependencies.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = {'/pedalboard-ui.js':'pedalboard-ui.js','/banks.js':'banks.js','/performance-ui.js':'performance-ui.js','/calibration-ui.js':'calibration-ui.js','/workspace.css':'workspace.css','/tolex-black.png':'tolex-black.png','/grille-silver.png':'grille-silver.png','/studio-skin.css':'studio-skin.css','/hardware-materials.png':'hardware-materials.png','/effects-catalogue.js':'effects-catalogue.js','/effects-ui.js':'effects-ui.js','/effects-ui.css':'effects-ui.css','/tuner.js':'tuner.js','/device-shelf.js':'device-shelf.js','/device-shelf.css':'device-shelf.css','/tone3000.js':'tone3000.js','/tone3000.css':'tone3000.css','/tone3000-logo.svg':'tone3000-logo.svg','/tone3000-mark.svg':'tone3000-mark.svg','/desktop-bridge.js':'desktop-bridge.js','/slot-board.js':'slot-board.js','/patch-model.js':'patch-model.js','/patch-ui.js':'patch-ui.js','/patch-ui.css':'patch-ui.css','/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/routing.css':'routing.css','/rig-model.js':'rig-model.js','/gear-art.js':'gear-art.js','/gear-looks.js':'gear-looks.js','/routing-ui.js':'routing-ui.js','/gear-drag.js':'gear-drag.js','/hardware-controls.js':'hardware-controls.js','/hardware-controls.css':'hardware-controls.css'};
const types = {'.png':'image/png','.svg':'image/svg+xml','.html':'text/html','.css':'text/css','.js':'text/javascript'};
http.createServer((req,res)=>{
  const file=files[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404);res.end('Not found');return;}
  fs.readFile(path.join(__dirname,file),(err,data)=>{
    if(err){res.writeHead(500);res.end('Could not read preview file');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]+'; charset=utf-8','Cache-Control':'no-store'});res.end(data);
  });
}).listen(4317,'127.0.0.1',()=>console.log('Guitar Suite preview: http://127.0.0.1:4317'));
