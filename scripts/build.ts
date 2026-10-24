import './migrations.js';
import { build } from 'esbuild';
import { mkdir, rename, rm } from 'node:fs/promises';
await rm('dist/worker',{recursive:true,force:true});
await rm('dist/wrangler.json',{force:true});
await mkdir('dist/apps',{recursive:true});
await build({entryPoints:['mcp-ui/lectures.ts','mcp-ui/analytics.ts'],bundle:true,format:'esm',minify:true,outdir:'dist/apps'});
for(const name of ['lectures','analytics'])await rename(`dist/apps/${name}.js`,`dist/apps/${name}.js.txt`);
