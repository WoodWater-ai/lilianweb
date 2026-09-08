import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { BASE, SubmissionError } from './submissions.mjs';
const exec=promisify(execFile);

// For local verification only. Never expose this adapter on a public interface.
export function cliStore(){
  async function run(args){
    try{
      const {stdout}=await exec('lark-cli',['base',...args,'--as','user'],{timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LARKSUITE_CLI_NO_UPDATE_NOTIFIER:'1',LARKSUITE_CLI_NO_SKILLS_NOTIFIER:'1'}});
      const result=JSON.parse(stdout);
      if(result.ok!==true)throw new Error('upstream failure');
      return result.data;
    }catch{throw new SubmissionError(503,'暂未确认提交成功，请稍后重试。');}
  }
  return {
    async exists(table,key){
      const result=await run(['+record-list','--base-token',BASE,'--table-id',table,'--field-id','提交标识','--limit','1','--filter-json',JSON.stringify({logic:'and',conditions:[['提交标识','==',key]]}),'--format','json']);
      const records=result.record_id_list;
      if(!Array.isArray(records))throw new SubmissionError(503,'暂未确认提交成功，请稍后重试。');
      return records.length>0;
    },
    async create(table,fields){
      const result=await run(['+record-batch-create','--base-token',BASE,'--table-id',table,'--json',JSON.stringify({create_records:[fields]})]);
      if(!Array.isArray(result.record_id_list)||result.record_id_list.length!==1||result.ignored_fields?.length)throw new SubmissionError(503,'暂未确认提交成功，请稍后重试。');
    }
  };
}

// Production adapter uses application credentials provided by the deployment
// environment. The app must have access to the two Base tables. No local auth is read.
export function feishuStore({appId,appSecret,fetchImpl=fetch}){
  if(!appId||!appSecret)throw new Error('FEISHU_APP_ID and FEISHU_APP_SECRET are required');
  let token='',expires=0;
  async function api(path,body,authenticated=true){
    try{
      if(authenticated&&Date.now()>=expires){
        const auth=await api('/auth/v3/tenant_access_token/internal',{app_id:appId,app_secret:appSecret},false);
        if(!auth.tenant_access_token||!auth.expire)throw new Error('invalid auth response');
        token=auth.tenant_access_token;expires=Date.now()+Math.max(0,auth.expire-120)*1000;
      }
      const response=await fetchImpl('https://open.feishu.cn/open-apis'+path,{method:'POST',headers:{'Content-Type':'application/json',...(authenticated?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
      const data=await response.json();
      if(!response.ok||data.code!==0){if(data.code===99991663||data.code===99991668)expires=0;throw new Error('upstream failure');}
      return data;
    }catch{throw new SubmissionError(503,'暂未确认提交成功，请稍后重试。');}
  }
  return {
    async exists(table,key){
      const result=await api(`/bitable/v1/apps/${BASE}/tables/${table}/records/search?page_size=1`,{field_names:['提交标识'],filter:{conjunction:'and',conditions:[{field_name:'提交标识',operator:'is',value:[key]}]}});
      if(!Array.isArray(result.data?.items))throw new SubmissionError(503,'暂未确认提交成功，请稍后重试。');
      return result.data.items.length>0;
    },
    async create(table,fields){
      const result=await api(`/bitable/v1/apps/${BASE}/tables/${table}/records`,{fields});
      if(!result.data?.record?.record_id)throw new SubmissionError(503,'暂未确认提交成功，请稍后重试。');
    }
  };
}

export function unavailableStore(){return {exists:async()=>{throw new SubmissionError(503,'服务尚未连接，请直接扫码联系。');},create:async()=>{throw new SubmissionError(503,'服务尚未连接，请直接扫码联系。');}};}
