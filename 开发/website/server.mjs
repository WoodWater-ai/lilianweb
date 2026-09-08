import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { isIP } from 'node:net';
import { fileURLToPath } from 'node:url';
import { createSubmissionService, SubmissionError } from './submissions.mjs';
import { cliStore, feishuStore, unavailableStore } from './stores.mjs';

const root=path.resolve(fileURLToPath(new URL('../../admin/deploy/',import.meta.url)));
const pages=new Set(['index.html','aigc.html','solutions.html','partners.html','contact.html','privacy.html','sitemap.xml','robots.txt','googlebc923df561752f0d.html','baidu_verify_codeva-Tlt0dGlEex.html']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}

export function createWebsiteServer({store=unavailableStore(),origins=[],trustedProxyIps=[],clock=Date.now,rateLimit=6,rateWindow=10*60*1000}={}){
  const submit=createSubmissionService(store), requests=new Map();
  const allowedOrigins=new Set(origins);
  async function body(req){
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;if(size>16384)throw new SubmissionError(413,'提交内容过长。');chunks.push(chunk);}
    try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new SubmissionError(400,'提交内容格式不正确。');}
  }
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
    try{
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/api/website/submissions'){
        if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{ok:false,message:'请通过表单提交。'});}
        // Same-origin browser submissions only. Reverse proxy must preserve Origin.
        if(!allowedOrigins.has(req.headers.origin))return json(res,403,{ok:false,message:'请求来源不正确。'});
        if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return json(res,415,{ok:false,message:'提交格式不正确。'});
        const now=clock();
        for(const [key,value] of requests)if(now-value.start>=rateWindow)requests.delete(key);
        // Only accept X-Real-IP from explicitly configured proxies. The proxy must
        // overwrite this header with its client address, never pass it through.
        const peer=req.socket.remoteAddress||'unknown';
        const realIp=req.headers['x-real-ip'];
        const ip=trustedProxyIps.includes(peer)&&typeof realIp==='string'&&isIP(realIp)?realIp:peer;
        const entry=requests.get(ip)||{start:now,count:0};
        if(entry.count>=rateLimit){res.setHeader('Retry-After',String(Math.ceil((entry.start+rateWindow-now)/1000)));return json(res,429,{ok:false,message:'提交较频繁，请稍后重试。'});}
        if(requests.size>=10000&&!requests.has(ip))return json(res,429,{ok:false,message:'当前请求较多，请稍后重试。'});
        entry.count++;requests.set(ip,entry);
        if(Number(req.headers['content-length'])>16384)return json(res,413,{ok:false,message:'提交内容过长。'});
        const result=await submit(await body(req));
        return json(res,200,result);
      }
      if(url.pathname.startsWith('/api/'))return json(res,404,{ok:false,message:'接口不存在。'});
      if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return json(res,405,{ok:false});}
      const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
      const extension=path.extname(relative).toLowerCase();
      // Only explicitly public files are served. Historical markdown and configs
      // in admin/deploy are never served by this local/Node server.
      if(!pages.has(relative)&&!(/^(assets|images)\/[a-zA-Z0-9_\-\u3400-\u9fff.]+$/.test(relative)&&['.css','.js','.svg','.png','.jpg','.jpeg','.webp','.mp4'].includes(extension)))return json(res,404,{ok:false});
      const file=path.resolve(root,relative);
      if(!file.startsWith(root+path.sep)&&file!==path.join(root,'index.html'))return json(res,404,{ok:false});
      let info;try{info=await stat(file);}catch{return json(res,404,{ok:false});}
      if(!info.isFile())return json(res,404,{ok:false});
      const headers={'Content-Type':types[extension]||'application/octet-stream','Content-Length':info.size,'Cache-Control':extension==='.html'?'no-cache':'public, max-age=3600','Accept-Ranges':'bytes'};
      let start=0,end=info.size-1,status=200;
      if(req.headers.range){
        const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!range||(!range[1]&&!range[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
        if(range[1]){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;}else{start=Math.max(0,info.size-Number(range[2]));}
        if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
        status=206;headers['Content-Length']=end-start+1;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
      }
      res.writeHead(status,headers);
      if(req.method==='HEAD')return res.end();
      const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
    }catch(error){
      if(!res.headersSent)json(res,error instanceof SubmissionError?error.status:503,{ok:false,message:error instanceof SubmissionError?error.message:'暂未确认提交成功，请稍后重试。'});
      else res.end();
    }
  });
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const localCli=process.argv.includes('--local-cli');
  const host=process.env.WEBSITE_HOST||'127.0.0.1',port=Number(process.env.WEBSITE_PORT||4317);
  if(localCli&&(!['127.0.0.1','::1','localhost'].includes(host)||process.env.NODE_ENV==='production'))throw new Error('Local CLI adapter requires a loopback host and a non-production environment');
  const production=process.env.NODE_ENV==='production';
  const configured=Boolean(process.env.FEISHU_APP_ID&&process.env.FEISHU_APP_SECRET);
  if(production&&!configured)throw new Error('Production requires Feishu application credentials');
  const store=localCli?cliStore():configured?feishuStore({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET}):unavailableStore();
  const origins=production?['https://www.lilianagent.cn','https://lilianagent.cn']:[`http://127.0.0.1:${port}`,`http://localhost:${port}`];
  const trustedProxyIps=(process.env.WEBSITE_TRUSTED_PROXY_IPS||'').split(',').map(ip=>ip.trim()).filter(Boolean);
  if(trustedProxyIps.some(ip=>!isIP(ip)))throw new Error('WEBSITE_TRUSTED_PROXY_IPS must contain explicit IP addresses');
  const server=createWebsiteServer({store,origins,trustedProxyIps});
  server.requestTimeout=45000;server.headersTimeout=10000;
  server.listen(port,host,()=>console.log(`Website: http://${host}:${port} | submissions: ${localCli?'local Feishu CLI':configured?'Feishu API':'not connected (returns 503)'}`));
}
