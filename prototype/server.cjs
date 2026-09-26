// Local-only preview server. No build step or third-party dependencies.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/routing.css':'routing.css','/rig-model.js':'rig-model.js','/gear-art.js':'gear-art.js','/routing-ui.js':'routing-ui.js','/gear-drag.js':'gear-drag.js'};
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript'};
http.createServer((req,res)=>{
  const file=files[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404);res.end('Not found');return;}
  fs.readFile(path.join(__dirname,file),(err,data)=>{
    if(err){res.writeHead(500);res.end('Could not read preview file');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]+'; charset=utf-8','Cache-Control':'no-store'});res.end(data);
  });
}).listen(4317,'127.0.0.1',()=>console.log('Guitar Suite preview: http://127.0.0.1:4317'));

