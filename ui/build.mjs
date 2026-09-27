import { build } from 'esbuild';
import { copyFile } from 'node:fs/promises';
await build({entryPoints:['src/main.tsx'],bundle:true,format:'iife',target:'es2022',minify:true,legalComments:'eof',outfile:'../prototype/react-ui.js',define:{'process.env.NODE_ENV':'"production"'}});
await copyFile('src/interface.css','../prototype/react-ui.css');
