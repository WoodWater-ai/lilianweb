import { createHash } from 'node:crypto';

export const BASE = 'UFFNbJCyBa588jsGYeBcB6FunVb';
export const TABLES = {lead:'tblU9bwDkRDnk5CK',partner:'tblasYhHd5LNAsjI'};
export const SOLUTIONS = ['','AIGC素材工作台','电商履约','综合解决方案','定制服务'];
export class SubmissionError extends Error {
  constructor(status,message){super(message);this.status=status;}
}
function text(value,max,required=false){
  if(value===undefined&&!required)return '';
  if(typeof value!=='string')throw new SubmissionError(400,'提交信息格式不正确。');
  const result=value.trim();
  if(result.length>max || (required&&!result) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result))throw new SubmissionError(400,'请检查必填信息和文字长度。');
  return result;
}
export function validateSubmission(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new SubmissionError(400,'提交信息格式不正确。');
  if(!Object.hasOwn(TABLES,input.kind))throw new SubmissionError(400,'申请类型不正确。');
  if(input.consent!==true)throw new SubmissionError(400,'请阅读隐私说明，并勾选同意联系。');
  if(input.website)throw new SubmissionError(400,'请检查填写的信息。');
  const id=text(input.submissionId,36,true);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw new SubmissionError(400,'提交标识无效，请刷新页面后重试。');
  const phone=text(input.phone,20,true).replace(/[\s-]/g,'').replace(/^\+86/,'');
  if(!/^1[3-9]\d{9}$/.test(phone))throw new SubmissionError(400,'请填写有效的中国大陆手机号码。');
  const source=text(input.source,100,true);
  if(!['/','/index.html','/aigc.html','/solutions.html','/partners.html','/contact.html','/privacy.html'].includes(source))throw new SubmissionError(400,'来源页面不正确。');
  const solution=text(input.solution,50);
  if(!SOLUTIONS.includes(solution))throw new SubmissionError(400,'请选择有效的咨询方案。');
  return {kind:input.kind,submissionId:id.toLowerCase(),phone,company:text(input.company,100,true),name:text(input.name,40,input.kind==='partner'),city:text(input.city,60,input.kind==='partner'),solution,message:text(input.message,1000),source,consent:true};
}
export function recordFields(item){
  // Include a payload fingerprint in the submission key. Retries of the same payload
  // resolve across restarts; changing data cannot silently receive an old receipt.
  const fingerprint=createHash('sha256').update(JSON.stringify(item)).digest('hex').slice(0,24);
  const common={'手机号':item.phone,'来源页面':item.source,'提交标识':`${item.submissionId}:${fingerprint}`,'同意联系':true};
  if(item.kind==='partner')return {...common,'申请人姓名':item.name,'公司或团队':item.company,'意向城市':item.city,'客户资源与合作说明':item.message,'申请状态':'待联系'};
  return {...common,'公司名称':item.company,'称呼':item.name,...(item.solution?{'感兴趣的方案':item.solution}:{}),'需求描述':item.message,'跟进状态':'待联系'};
}
export function createSubmissionService(store){
  const pending=new Map();
  // Serialize writes across both tables to avoid upstream concurrent-write conflicts.
  let queue=Promise.resolve();
  return async input=>{
    const item=validateSubmission(input), fields=recordFields(item), key=`${item.kind}:${fields['提交标识']}`;
    if(pending.has(key))return pending.get(key);
    if(pending.size>=30)throw new SubmissionError(429,'当前提交较多，请稍后重试。');
    const task=queue.then(async()=>{
      if(await store.exists(TABLES[item.kind],fields['提交标识']))return {ok:true};
      await store.create(TABLES[item.kind],fields);
      return {ok:true};
    });
    queue=task.catch(()=>{});
    pending.set(key,task);
    try{return await task;}finally{pending.delete(key);}
  };
}
