import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
const root=path.resolve('public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.vtt':'text/vtt; charset=utf-8','.srt':'application/x-subrip; charset=utf-8','.mp4':'video/mp4'};
const server=http.createServer(async(req,res)=>{
 try {
  const decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(decoded==='/'?'/index.html':decoded));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const s=await stat(file);if(!s.isFile())throw new Error('Not found');
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  let start=0,end=s.size-1,status=200;
  if(req.headers.range){
   const m=req.headers.range.match(/^bytes=(\d*)-(\d*)$/);
   if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${s.size}`});res.end();return;}
   if(!m[1])start=Math.max(0,s.size-Number(m[2]));else {start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
   if(start>end||start>=s.size){res.writeHead(416,{'Content-Range':`bytes */${s.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${s.size}`;
  }
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD'){res.end();return;}
  createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Preview: http://localhost:'+ (process.env.PORT||4173)));
