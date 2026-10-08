// Relationship pages retain the existing service scope, forms, and privacy wording.
export function createPartnersPage({ eyebrow, sectionHead, leadForm, arrow }) {
  return `<section class="rel-partner-hero" aria-labelledby="rel-partner-title">
  <div class="container rel-partner-hero-grid">
    <div class="rel-partner-hero-copy">
      ${eyebrow('LILIAN CITY PARTNERS', '礼链城市合伙人')}
      <h1 id="rel-partner-title">你连接本地信任，<br><span class="serif-accent">我们一起创造价值。</span></h1>
      <p>把你熟悉的企业，连接到适合的 AI 产品。<br>你推荐客户，礼链负责产品、成交与交付。</p>
      <a class="button light" href="#apply">申请成为城市合伙人 ${arrow}</a>
      <span class="rel-partner-hero-note">具体合作权益、授权范围与收益规则，在双方沟通后单独约定。</span>
    </div>
    <div class="rel-partner-brief" aria-label="城市合伙人与礼链的合作分工">
      <div class="rel-partner-brief-heading"><span>LOCAL CONNECTION</span><span>合作分工</span></div>
      <div class="rel-partner-brief-card"><span class="rel-brief-index" aria-hidden="true">01</span><div><span class="rel-brief-role">城市合伙人</span><h2>发现需求，推荐客户</h2><p>本地资源与信任，成为沟通的起点。</p></div></div>
      <div class="rel-brief-connector" aria-hidden="true"><span></span><i>↓</i><span></span></div>
      <div class="rel-partner-brief-card rel-partner-brief-card-light"><span class="rel-brief-index" aria-hidden="true">02</span><div><span class="rel-brief-role">礼链团队</span><h2>产品、成交与交付</h2><p>从需求评估，到方案实施与交付。</p></div></div>
      <p class="rel-partner-brief-footer">从一次真实的业务连接开始。</p>
    </div>
  </div>
</section>
<section class="section container rel-partner-audience">
  ${sectionHead('WHO WE WORK WITH', '适合谁加入', '让你已有的连接，<br>拥有新的可能。')}
  <div class="rel-audience-grid">
    <article><span class="rel-card-index">01 / COMMERCE</span><h3>电商与企业服务伙伴</h3><p>熟悉电商团队的运营需求，愿意推荐合适的产品与服务。</p></article>
    <article><span class="rel-card-index">02 / GIFT & BENEFITS</span><h3>礼品与福利服务商</h3><p>有企业客户资源，希望进一步沟通 AI 内容与数字化履约方案。</p></article>
    <article><span class="rel-card-index">03 / LOCAL NETWORK</span><h3>本地渠道与行业连接者</h3><p>了解当地企业，有真实的业务连接与长期合作意愿。</p></article>
  </div>
</section>
<section class="rel-responsibility-section">
  <div class="container rel-responsibility-grid">
    <div><p class="eyebrow">YOUR PART / 伙伴的角色</p><h2>你熟悉客户，<br>也了解当地的生意。</h2><p>发现适合的需求、推荐客户、协助建立沟通。<br>发挥你的本地资源与信任优势。</p></div>
    <div><p class="eyebrow">OUR PART / 礼链的角色</p><h2>我们理解产品，<br>也负责把方案交付。</h2><p>由礼链负责产品演示、需求评估、报价签约与实施交付，与你一起推进真实合作。</p></div>
  </div>
</section>
<section class="section container rel-partner-process">
  <div class="rel-process-intro">${eyebrow('THE FIRST STEP', '如何开始')}<h2>先认识，<br>再一起做事。</h2><p>具体合作权益、授权范围与收益规则，<br>在双方沟通后单独约定。</p></div>
  <ol class="rel-process-list">
    <li><span class="rel-process-number" aria-hidden="true">01</span><div><h3>提交合作申请</h3><p>告诉我们所在城市与客户资源。</p></div></li>
    <li><span class="rel-process-number" aria-hidden="true">02</span><div><h3>沟通合作方式</h3><p>了解彼此，明确适合的客户与协作方式。</p></div></li>
    <li><span class="rel-process-number" aria-hidden="true">03</span><div><h3>确认合作关系</h3><p>确认职责与权益，开始推进客户合作。</p></div></li>
  </ol>
</section>
<section class="rel-apply-section" id="apply" aria-labelledby="rel-apply-title">
  <div class="container rel-form-layout">
    <div class="rel-form-intro">${eyebrow('LET’S BUILD TOGETHER', '提交申请')}<h2 id="rel-apply-title">下一站，<br>就在你的城市。</h2><p>填下这些信息，我们从一次沟通开始。</p><div class="rel-application-note"><span>也可以先聊聊</span><button class="text-link" data-wechat>扫码联系礼链 ${arrow}</button></div></div>
    <div class="form-card rel-form-card"><div class="rel-form-card-heading"><span class="rel-card-index">PARTNER APPLICATION</span><h3>城市合伙人申请</h3></div>${leadForm('partner','partner')}</div>
  </div>
</section>`;
}

export function createContactPage({ eyebrow, leadForm, arrow }) {
  return `<section class="container rel-contact-hero" aria-labelledby="rel-contact-title">
  ${eyebrow('HELLO, WE ARE LILIAN', '关于礼链')}
  <div class="rel-contact-hero-grid"><h1 id="rel-contact-title">让 AI，<br><span class="serif-accent">走进真实的生意。</span></h1><div class="rel-contact-about"><p>礼链由杭州礼鲤科技有限公司提供产品与服务，围绕电商素材生产、活动承接和履约交付，帮助团队把 AI 用到具体的工作中。</p><p>我们提供标准产品，也围绕业务需求开展定制服务。</p><div class="rel-contact-offering"><span>标准产品</span><span aria-hidden="true">+</span><span>定制服务</span></div></div></div>
  <div class="rel-contact-brandline"><span>LILIAN · AI COMMERCE</span><span>杭州礼鲤科技有限公司</span></div>
</section>
<section class="rel-contact-section">
  <div class="container rel-form-layout">
    <div class="rel-form-intro">${eyebrow('START A CONVERSATION', '联系我们')}<h2>先聊聊，<br>你想完成的事。</h2><p>准备了解产品、沟通定制需求，<br>或探讨合作，都可以从这里开始。</p>
      <div class="rel-contact-qr-card"><div class="rel-contact-qr-heading"><span class="rel-card-index">DIRECT CONTACT</span><h3>微信扫码联系</h3><p>无需填写表单，也能直接聊</p></div><img src="/assets/contact-qr.png" width="132" height="132" alt="礼链业务联系二维码"><button class="text-link" data-wechat>查看 / 保存二维码 ${arrow}</button></div>
      <a class="rel-partner-contact-link" href="/partners.html"><span>渠道合作</span><span>我是渠道伙伴，想申请合作 ${arrow}</span></a>
    </div>
    <div class="form-card rel-form-card"><div class="rel-form-card-heading"><span class="rel-card-index">PRODUCT & SERVICE</span><h3>预约产品演示 / 咨询方案</h3></div>${leadForm('lead','contact')}</div>
  </div>
</section>`;
}

export function createPrivacyPage({ arrow }) {
  const sections = [
    ['collection', '我们收集什么信息', '产品咨询包含手机号、公司名称，以及你选择提供的称呼、感兴趣的方案和需求描述。合伙人申请还包含姓名、意向城市，以及你选择填写的客户资源与合作说明。系统同时记录提交时间、来源页面、提交标识和同意联系的状态。'],
    ['use-storage', '信息如何使用与保存', '信息用于回复你的咨询、安排产品演示、评估合作需求和记录跟进情况。提交的信息保存在礼链使用的飞书多维表格中，由有业务需要的工作人员处理。我们不会在官网公开你的手机号或申请信息，也不会将这些信息作为公开案例发布。'],
    ['security', '安全与必要的技术处理', '网站服务端会校验表单并暂时处理网络地址等必要信息，用于限制异常请求和避免重复提交。网站不会把手机号、公司名称或需求内容发送到流量统计事件中。浏览器仅在当前页面会话中保留提交标识，用于失败重试。'],
    ['choices', '你可以如何选择', '你可以不提交表单，直接通过页面上的二维码联系我们。表单需要你主动勾选同意联系后才提交。如需查询、更正或请求删除已提交的信息，或撤回后续业务联系意愿，请通过官网的业务联系二维码提出，我们将在核实后处理。信息仅在业务联系所需期限内保存，业务结束后定期复核保留必要性。'],
    ['third-parties', '第三方服务', '表单存储使用飞书服务；扫码联系将进入微信或企业微信的服务环境，相应服务适用其自身的隐私规则。你可以在进入这些服务前决定是否继续。']
  ];
  const index = () => `<ol>${sections.map(([id,title],i)=>`<li><a href="#rel-privacy-${id}"><span aria-hidden="true">0${i+1}</span>${title}</a></li>`).join('')}</ol>`;
  return `<section class="container rel-privacy-header"><p class="eyebrow">PRIVACY NOTICE</p><div><h1>隐私说明</h1><p class="rel-privacy-date">更新日期：2026 年 9 月 8 日</p></div></section>
<div class="container rel-privacy-layout">
  <aside class="rel-privacy-sidebar"><nav aria-label="隐私说明目录"><span class="rel-card-index">ON THIS PAGE / 本页目录</span>${index()}</nav></aside>
  <div class="rel-privacy-content"><details class="rel-privacy-mobile-index"><summary>本页目录 <span aria-hidden="true">+</span></summary><nav aria-label="隐私说明目录">${index()}</nav></details><p class="rel-privacy-intro">杭州礼鲤科技有限公司（以下简称“礼链”）通过本网站接收产品咨询与城市合伙人申请。本说明解释我们收集哪些信息，以及如何使用这些信息。</p>
    ${sections.map(([id,title,content],i)=>`<section class="rel-privacy-section" id="rel-privacy-${id}" aria-labelledby="rel-privacy-title-${id}"><span class="rel-privacy-number" aria-hidden="true">0${i+1}</span><h2 id="rel-privacy-title-${id}">${title}</h2><p>${content}</p></section>`).join('')}
    <div class="rel-privacy-contact"><a class="button primary" href="/contact.html">联系礼链 ${arrow}</a></div>
  </div>
</div>`;
}
