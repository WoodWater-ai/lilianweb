(() => {
  'use strict';
  const get = id => document.getElementById(id);
  if (!get('trial')) return;
  const auth = get('trial-auth'), company = get('trial-company');
  // Preview has no authority. Real sessions, organization membership and credits
  // must be supplied and enforced by the existing backend at integration time.
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
  let remaining = 3, busy = false, fileReady = false, run = 0;
  function open(dialog) { dialog.showModal(); document.body.classList.add('dialog-open'); }
  get('trial-login').addEventListener('click', () => open(auth));
  document.querySelectorAll('[data-experience]').forEach(link=>link.addEventListener('click',()=>{
    if(get('trial-workspace').hidden)open(auth);
  }));
  get('trial-send').addEventListener('click', () => {
    if (!get('trial-phone').reportValidity()) return;
    get('trial-auth-status').textContent = '短信服务尚未接入，未发送验证码。请先预约产品演示。';
  });
  get('trial-auth-form').addEventListener('submit', event => {
    event.preventDefault();
    get('trial-auth-status').textContent = '登录服务尚未接入，暂不能注册或登录。你的填写内容未提交。';
  });
  if (local) get('trial-demo').hidden = false;
  get('trial-demo').addEventListener('click', () => { if (local) open(company); });
  get('trial-company-query').addEventListener('input', () => {
    get('trial-company-status').textContent = '企业查询待接入，可跳过；未查询或保存你输入的企业。';
  });
  get('trial-company-skip').addEventListener('click', () => {
    if (!local) return;
    company.close(); get('trial-locked').hidden = true; get('trial-workspace').hidden = false;
    get('trial-exit').hidden = false; get('trial-demo').hidden = true;
    get('trial-balance').textContent = `演示额度 ${remaining} / 3`;
    get('trial-file').focus();
  });
  get('trial-file').addEventListener('change', () => {
    const file = get('trial-file').files[0]; const current = ++run;
    fileReady = false; get('trial-generate').disabled = true;
    get('trial-upload-preview').hidden = true; get('trial-upload-label').hidden = false;
    get('trial-results').hidden = true; get('trial-empty').hidden = false;
    if (!file) { get('trial-status').textContent = ''; return; }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      get('trial-status').textContent = '请选择 10MB 以内的 JPG、PNG 或 WebP 图片。'; get('trial-file').value = ''; return;
    }
    const reader = new FileReader();
    reader.onerror = () => { if(current===run)get('trial-status').textContent = '图片读取失败，请重新选择。'; };
    reader.onload = () => {
      if (current !== run) return;
      const img = get('trial-upload-preview');
      img.onload = () => {
        if (current !== run) return;
        fileReady = true; img.hidden = false; get('trial-upload-label').hidden = true;
        get('trial-generate').disabled = remaining === 0;
        get('trial-status').textContent = remaining ? '已选择图片，仅在本机预览。点击可查看固定案例演示。' : '演示次数已用完，可联系礼链了解正式版。';
      };
      img.onerror = () => { if(current===run)get('trial-status').textContent = '文件不是可读取的图片，请重新选择。'; };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  get('trial-generate').addEventListener('click', () => {
    if (!local || busy || !fileReady || remaining <= 0 || get('trial-workspace').hidden) return;
    busy = true; const current = ++run;
    get('trial-generate').disabled = true; get('trial-file').disabled = true;
    get('trial-output').setAttribute('aria-busy','true');
    get('trial-status').textContent = '正在演示结果展示流程，没有调用生成服务…';
    setTimeout(() => {
      if (current !== run) return;
      remaining--; busy = false; get('trial-file').disabled = false;
      get('trial-output').removeAttribute('aria-busy');
      get('trial-empty').hidden = true; get('trial-results').hidden = false;
      get('trial-balance').textContent = `演示额度 ${remaining} / 3`;
      get('trial-generate').disabled = remaining === 0;
      get('trial-status').textContent = remaining ? '固定案例已展示，并非根据你的商品生成。可以更换图片继续验收。' : '演示次数已用完。联系礼链，了解完整产品。';
    }, 900);
  });
  function selectMode(video) {
    get('trial-image-pane').hidden = video; get('trial-video-pane').hidden = !video;
    for (const [id, active] of [['trial-image-mode', !video], ['trial-video-mode', video]]) {
      get(id).classList.toggle('active',active); get(id).setAttribute('aria-pressed',String(active));
    }
    if (!video) document.querySelectorAll('#trial-video-pane video').forEach(v=>v.pause());
  }
  get('trial-image-mode').addEventListener('click',()=>selectMode(false));
  get('trial-video-mode').addEventListener('click',()=>selectMode(true));
  get('trial-exit').addEventListener('click', () => {
    selectMode(false);
    ++run; busy=false; fileReady=false; remaining=3;
    get('trial-file').value=''; get('trial-file').disabled=false;
    get('trial-upload-preview').removeAttribute('src');get('trial-upload-preview').hidden=true;
    get('trial-upload-label').hidden=false;get('trial-results').hidden=true;get('trial-empty').hidden=false;
    get('trial-output').removeAttribute('aria-busy');get('trial-generate').disabled=true;get('trial-status').textContent='';
    get('trial-workspace').hidden=true;get('trial-locked').hidden=false;get('trial-exit').hidden=true;
    get('trial-demo').hidden=!local;get('trial-balance').textContent='登录后开放';get('trial-login').focus();
  });
})();
