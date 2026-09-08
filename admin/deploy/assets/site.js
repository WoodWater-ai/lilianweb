(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  // Deliberately send only non-personal event attributes. No contact data in analytics.
  function track(event, attributes = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, page: document.body.dataset.page, ...attributes });
  }
  const dialogs = $$('dialog');
  const openers = new WeakMap();
  function openDialog(dialog) {
    openers.set(dialog, document.activeElement);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  function closeDialog(dialog) { dialog.close(); }
  dialogs.forEach(dialog => {
    $('[data-close]', dialog).addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      if (dialog.id === 'media-dialog') {
        $$('video', dialog).forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
        $('.media-body', dialog).replaceChildren();
      }
      if (!dialogs.some(item => item.open)) document.body.classList.remove('dialog-open');
      const opener = openers.get(dialog);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
  });
  $$('[data-inquiry]').forEach(button => button.addEventListener('click', () => {
    openDialog($('#inquiry-dialog'));
    track('inquiry_open');
  }));
  $$('[data-wechat]').forEach(button => button.addEventListener('click', () => {
    openDialog($('#wechat-dialog'));
    track('contact_qr_view');
  }));
  const menu = $('.menu-toggle');
  const nav = $('#primary-nav');
  function closeMenu() {nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','展开导航');}
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    menu.setAttribute('aria-label', expanded ? '收起导航' : '展开导航');
    nav.classList.toggle('open', expanded);
  });
  document.addEventListener('keydown', event => {if(event.key==='Escape') closeMenu();});
  $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));
  $$('[data-image],[data-video]').forEach(button => button.addEventListener('click', () => {
    const dialog = $('#media-dialog');
    const body = $('.media-body', dialog);
    body.replaceChildren();
    if (button.dataset.video) {
      const video = document.createElement('video');
      video.src = button.dataset.video;
      video.poster = button.dataset.poster || '';
      video.controls = true; video.playsInline = true; video.preload = 'metadata';
      video.setAttribute('aria-label',button.dataset.caption || '视频预览');
      video.addEventListener('error', () => {
        const error = document.createElement('p');
        error.textContent = '视频暂时无法播放，请稍后重试或联系我们了解演示。';
        if(!$('.media-error',body)){error.className='media-error';body.append(error);}
      });
      body.append(video);
      openDialog(dialog);
      video.play().catch(() => {});
      track('video_open');
    } else {
      const image = document.createElement('img');
      image.src = button.dataset.image;
      image.alt = button.dataset.caption || '素材预览';
      body.append(image); openDialog(dialog);
      track('image_preview');
    }
    $('.media-caption',dialog).textContent=button.dataset.caption || '';
  }));
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));
    });
    $$('[data-category]').forEach(item => {item.hidden=button.dataset.filter!=='all' && item.dataset.category!==button.dataset.filter;});
    track('case_filter',{category:button.dataset.filter});
  }));
  const tabs=$$('[data-tab]');
  function selectTab(tab) {
    tabs.forEach(item=>{const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;$('#'+item.getAttribute('aria-controls')).hidden=!active;});
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectTab(tab));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();selectTab(tabs[next]);tabs[next].focus();}
    });
  });
  function freshId() {return crypto.randomUUID();}
  $$('.lead-form').forEach(form=>{
    let submissionId=freshId();
    let previousPayload='';
    let pending=false;
    const fields=$('.form-fields',form), success=$('.form-success',form), status=$('.form-status',form), submit=$('[type=submit]',form);
    const originalLabel=submit.innerHTML;
    const control=name=>form.elements.namedItem(name);
    const value=name=>String(control(name)?.value || '').trim();
    form.addEventListener('input',event=>{event.target.removeAttribute('aria-invalid');});
    function fail(message,name){status.textContent=message;if(name){control(name).setAttribute('aria-invalid','true');control(name).focus();}}
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(pending)return;
      status.textContent='';
      const kind=form.dataset.kind;
      const phone=value('phone').replace(/[\s-]/g,'').replace(/^\+86/,'');
      if(!value('company'))return fail('请填写公司或团队名称。','company');
      if(kind==='partner'&&!value('name'))return fail('请填写你的姓名。','name');
      if(!/^1[3-9]\d{9}$/.test(phone))return fail('请填写有效的中国大陆手机号码。','phone');
      if(kind==='partner'&&!value('city'))return fail('请填写意向合作城市。','city');
      if(!control('consent').checked)return fail('请阅读隐私说明，并勾选同意联系。','consent');
      const payload={kind,company:value('company'),name:value('name'),phone,city:value('city'),solution:value('solution'),message:value('message'),consent:true,source:location.pathname,website:value('website')};
      const serialized=JSON.stringify(payload);
      if(previousPayload && previousPayload!==serialized)submissionId=freshId();
      previousPayload=serialized;
      pending=true;submit.disabled=true;form.setAttribute('aria-busy','true');submit.textContent='正在提交，请稍候…';
      $$('input,select,textarea',form).forEach(input=>{input.disabled=true;});
      try {
        const response=await fetch('/api/website/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,submissionId}),signal:AbortSignal.timeout(45000)});
        const result=await response.json().catch(()=>null);
        if(!response.ok || result?.ok!==true){
          if(response.status===429)throw new Error('提交较频繁，请稍后再试，或直接扫码联系。');
          if(response.status===400)throw new Error(result?.message || '请检查填写的信息后重试。');
          throw new Error('暂未确认提交成功，请保留当前页面稍后重试，或直接扫码联系。');
        }
        fields.hidden=true;success.hidden=false;
        $('.receipt',success).textContent='提交编号：'+submissionId.slice(0,8).toUpperCase();
        success.focus();track(kind==='partner'?'partner_application_success':'lead_submit_success');
      }catch(error){
        fail(error.name==='TimeoutError' || error.name==='AbortError' ? '连接超时，暂未确认提交结果。请点击重试，系统会核对本次提交，避免重复。' : error instanceof TypeError ? '网络连接失败，请检查网络后重试。已填写的信息仍保留。' : error.message);
        track('submission_error',{kind});
      }finally{pending=false;submit.disabled=false;form.removeAttribute('aria-busy');submit.innerHTML=originalLabel;$$('input,select,textarea',form).forEach(input=>{input.disabled=false;});}
    });
    $('[data-form-reset]',form).addEventListener('click',()=>{
      form.reset();submissionId=freshId();previousPayload='';status.textContent='';success.hidden=true;fields.hidden=false;control('company').focus();
    });
  });
  track('website_page_view');
})();
