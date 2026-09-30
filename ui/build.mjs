import { build } from 'esbuild';
await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  banner: { js: '// GENERATED from ui/src by ui/build.mjs. Do not edit this bundle.' },
  legalComments: 'eof',
  outfile: '../prototype/react-ui.js',
  define: { 'process.env.NODE_ENV': '"production"' },
});
