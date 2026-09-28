// Development-only WebView fixture. No hardware is opened and no audio is played.
// Run with node scripts/audio-ui-preview.cjs, then visit localhost:4322.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../prototype');
const fixture = `<script>
(() => {
  const listeners = new Set();
  let connected = true;
  const reply = data => setTimeout(() => listeners.forEach(fn => fn({data})), 0);
  window.chrome = {webview: {
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
    postMessage(m) {
      if (m.type === 'ready') reply({type:'ready',drivers:['Test ASIO','FlexASIO']});
      if (m.type === 'audioDevices') reply({type:'audioDevices',drivers:['Test ASIO','FlexASIO'],
        inputs:connected?[{id:'test-input',name:'Test USB input',channels:2}]:[],
        outputs:connected?[{id:'test-output',name:'Test speakers'}]:[]});
      if (m.type === 'driver') reply({type:'driver',driver:m.driver,inputs:['Instrument 1','Instrument 2'],outputs:['Left','Right']});
      if (m.type === 'start' || m.type === 'startWindows') reply({type:'status',running:true,message:'TEST ONLY — '+m.type+' — '+m.rate+' Hz'});
      if (m.type === 'stop') reply({type:'status',running:false,message:'Stopped (test fixture)'});
    }
  }};
  addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.textContent = 'TEST: disconnect / reconnect devices';
    button.style = 'position:fixed;bottom:0;right:0;z-index:99999';
    button.onclick = () => { connected = !connected; button.textContent = connected ? 'TEST: devices connected' : 'TEST: devices disconnected'; };
    document.body.append(button);
  });
})();
</script>`;
http
  .createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (path.basename(name) !== name || !/\.(html|css|js|png|svg)$/.test(name)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const file = path.join(root, name);
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    res.setHeader('Content-Type', types[path.extname(name)]);
    res.end(
      name === 'index.html'
        ? fs.readFileSync(file, 'utf8').replace('<head>', '<head>' + fixture)
        : fs.readFileSync(file),
    );
  })
  .listen(4322, '127.0.0.1', () =>
    console.log('Audio UI fixture: http://127.0.0.1:4322 (no hardware)'),
  );
