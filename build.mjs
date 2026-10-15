import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
await mkdir('public',{recursive:true});
await build({entryPoints:['web/app.ts'],bundle:true,format:'iife',target:'es2022',outfile:'public/app.js',minify:true,legalComments:'eof'});
const html=await readFile('public/index.html','utf8');
let css=await readFile('public/style.css','utf8');
const font=await readFile('public/assets/Vazirmatn.woff2');
const image=await readFile('public/assets/classroom.jpg');
const poster=await readFile('public/assets/film-poster.jpg');
const js=await readFile('public/app.js','utf8');
css=css.replace("url('./assets/Vazirmatn.woff2')",`url('data:font/woff2;base64,${font.toString('base64')}')`);
const standalone=html
 .replace('<link rel="preload" href="./assets/Vazirmatn.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="./style.css">',`<style>${css}</style>`)
 .replace('<script src="./app.js" defer></script>',`<script>window.addEventListener('DOMContentLoaded',()=>{${js.replace(/\.\/assets\/film\.mp4/g,'./public/assets/film.mp4').replace(/\.\/assets\/film-poster\.jpg/g,`data:image/jpeg;base64,${poster.toString('base64')}`).replace(/\.\/assets\/classroom\.jpg/g,`data:image/jpeg;base64,${image.toString('base64')}`).replace(/<\/script/gi,'<\\/script')} })</script>`)
 .replace(/src="\.\/assets\/classroom\.jpg"/g,`src="data:image/jpeg;base64,${image.toString('base64')}"`);
await writeFile('presentation.html',standalone);
console.log('Built public/ and presentation.html.');
