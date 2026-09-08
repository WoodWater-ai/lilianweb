import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createSubmissionService, recordFields, validateSubmission, TABLES } from './submissions.mjs';
import { createWebsiteServer } from './server.mjs';
import { feishuStore } from './stores.mjs';

const valid = (overrides={})=>({kind:'lead',submissionId:randomUUID(),company:'官网自动化测试（非真实客户）',name:'测试',phone:'13800000000',city:'',solution:'AIGC素材工作台',message:'测试记录',consent:true,source:'/contact.html',website:'',...overrides});
function memoryStore(){const records=[];return {records,exists:async(table,key)=>records.some(item=>item.table===table&&item.fields['提交标识']===key),create:async(table,fields)=>records.push({table,fields})};}

test('customer and partner fields are routed to separate tables with no extra submitted fields',async()=>{
  const store=memoryStore(),submit=createSubmissionService(store);
  await submit(valid({admin:true}));await submit(valid({kind:'partner',city:'浙江省杭州市'}));
  assert.equal(store.records[0].table,TABLES.lead);assert.equal(store.records[1].table,TABLES.partner);
  assert.equal(store.records[0].fields['跟进状态'],'待联系');assert.equal(store.records[1].fields['申请状态'],'待联系');
  assert.equal(store.records[0].fields.admin,undefined);assert.equal(store.records[0].fields['同意联系'],true);
});
test('concurrent retries and service restarts do not create duplicate records',async()=>{
  const store=memoryStore(),submit=createSubmissionService(store),data=valid();
  const results=await Promise.all([submit(data),submit(data),submit(data)]);
  assert.ok(results.every(result=>result.ok));assert.equal(store.records.length,1);
  await createSubmissionService(store)(data);assert.equal(store.records.length,1);
});
test('a changed payload does not incorrectly reuse an earlier receipt',async()=>{
  const store=memoryStore(),submit=createSubmissionService(store),data=valid();
  await submit(data);await submit({...data,company:'另一家测试企业'});assert.equal(store.records.length,2);
});
test('failed write can be retried; an uncertain write is reconciled before creating another',async()=>{
  const store=memoryStore();let fail=true;
  const create=store.create;
  store.create=async(table,fields)=>{await create(table,fields);if(fail){fail=false;throw new Error('response lost');}};
  const submit=createSubmissionService(store),data=valid();
  await assert.rejects(submit(data));assert.deepEqual(await submit(data),{ok:true});assert.equal(store.records.length,1);
});
test('validation rejects missing consent, malformed phone, missing partner city, invalid type and oversized values',()=>{
  for(const bad of [{consent:false},{phone:'123'},{kind:'partner',city:''},{kind:'__proto__'},{company:' '},{company:'a'.repeat(101)},{submissionId:'bad'},{source:'https://attacker.invalid'},{website:'spam'},{solution:'invalid'}])assert.throws(()=>validateSubmission(valid(bad)));
  assert.equal(validateSubmission(valid({phone:'+86 138-0000-0000'})).phone,'13800000000');
  assert.equal(recordFields(validateSubmission(valid({solution:''})))['感兴趣的方案'],undefined);
});
async function withServer(fn,options={}){
  const server=createWebsiteServer({store:memoryStore(),origins:['https://www.lilianagent.cn'],...options});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{await fn(`http://127.0.0.1:${server.address().port}`);}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
const post=(url,data,extra={})=>fetch(url+'/api/website/submissions',{method:'POST',headers:{Origin:'https://www.lilianagent.cn','Content-Type':'application/json',...extra},body:JSON.stringify(data)});
test('HTTP form succeeds only after upstream acknowledgement and never leaks submitted fields',async()=>{
  await withServer(async url=>{const result=await post(url,valid());assert.equal(result.status,200);assert.deepEqual(await result.json(),{ok:true});assert.equal(result.headers.get('cache-control'),'no-store');});
});
test('upstream failure is a 503, never a successful receipt',async()=>{
  await withServer(async url=>{const result=await post(url,valid());assert.equal(result.status,503);assert.equal((await result.json()).ok,false);},{store:{exists:async()=>{throw new Error('secret should not leak');}}});
});
test('HTTP rejects foreign origins, wrong methods, invalid content types and malformed input',async()=>{
  await withServer(async url=>{
    assert.equal((await post(url,valid(),{Origin:'https://attacker.invalid'})).status,403);
    assert.equal((await post(url,valid(),{'Content-Type':'text/plain'})).status,415);
    assert.equal((await fetch(url+'/api/website/submissions')).status,405);
    assert.equal((await post(url,valid({consent:false}))).status,400);
  });
});
test('rate limits expire and cannot be bypassed with spoofed forwarded IP headers',async()=>{
  let now=1000;
  await withServer(async url=>{
    assert.equal((await post(url,valid())).status,200);
    assert.equal((await post(url,valid(),{'X-Forwarded-For':'8.8.8.8'})).status,429);
    now+=1001;assert.equal((await post(url,valid())).status,200);
  },{clock:()=>now,rateLimit:1,rateWindow:1000});
});
test('static site serves real pages and assets, blocks internal files, and supports video range requests',async()=>{
  await withServer(async url=>{
    for(const page of ['/','/aigc.html','/solutions.html','/partners.html','/contact.html','/privacy.html','/assets/site.css','/assets/site.js'])assert.equal((await fetch(url+page)).status,200,page);
    for(const privatePath of ['/package.json','/DEPLOYMENT-OPTIONS.md','/.env','/%2e%2e/AGENTS.md','/assets/../../package.json'])assert.equal((await fetch(url+privatePath)).status,404,privatePath);
    const part=await fetch(url+'/assets/video-result.mp4',{headers:{Range:'bytes=0-99'}});assert.equal(part.status,206);assert.equal((await part.arrayBuffer()).byteLength,100);
    assert.equal((await fetch(url+'/assets/video-result.mp4',{headers:{Range:'bytes=999999999999-'}})).status,416);
  });
});
test('trusted proxy resolves distinct client IPs and oversized payloads return 413',async()=>{
  await withServer(async url=>{
    assert.equal((await post(url,valid(),{'X-Real-IP':'192.0.2.1'})).status,200);
    assert.equal((await post(url,valid(),{'X-Real-IP':'192.0.2.2'})).status,200);
    assert.equal((await post(url,valid(),{'X-Real-IP':'192.0.2.1'})).status,429);
    assert.equal((await post(url,valid({message:'x'.repeat(17000)}),{'X-Real-IP':'192.0.2.3'})).status,413);
  },{trustedProxyIps:['127.0.0.1'],rateLimit:1});
});
test('production Feishu adapter caches auth and uses the real API contract for lookup/create',async()=>{
  const calls=[];
  const fake=async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});return {ok:true,json:async()=>url.includes('/auth/')?{code:0,tenant_access_token:'test-only',expire:7200}:url.includes('/search')?{code:0,data:{items:[]}}:{code:0,data:{record:{record_id:'test-record'}}}};};
  const store=feishuStore({appId:'test',appSecret:'test',fetchImpl:fake});
  assert.equal(await store.exists(TABLES.lead,'test-key'),false);await store.create(TABLES.lead,{'公司名称':'测试'});
  assert.equal(calls.length,3);assert.equal(calls[1].body.filter.conditions[0].field_name,'提交标识');assert.deepEqual(calls[2].body,{fields:{'公司名称':'测试'}});
  assert.equal(calls[2].options.headers.Authorization,'Bearer test-only');
});
test('production Feishu API failure cannot be reported as a success',async()=>{
  const store=feishuStore({appId:'test',appSecret:'test',fetchImpl:async()=>({ok:true,json:async()=>({code:99991668,msg:'do not expose token'})})});
  await assert.rejects(store.exists(TABLES.lead,'key'),error=>error.status===503&&!error.message.includes('token'));
});
