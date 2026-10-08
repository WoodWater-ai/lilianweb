export function createSolutionsPage({ eyebrow, picture, imageButton, sectionHead, button, arrow, cta }) {
  const status = (label, muted = false) => `<span class="sol-status${muted ? ' sol-status-muted' : ''}"><i aria-hidden="true"></i>${label}</span>`;
  const icon = (type) => {
    const paths = {
      content: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 16 6-6 5 5 3-3 4 4"/><circle cx="16" cy="8" r="1.5"/>',
      fulfillment: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>',
      operations: '<path d="M4 21V10m8 11V3m8 18v-7M1 10h6M9 3h6m2 11h6"/>',
      acquisition: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 6.5h.01M9 6.5h.01m4 6.5h5m-3-2 3 2-3 2M6 13h3m-3 3h5"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type]}</svg>`;
  };

  return `<div class="sol-page">
<section class="container sol-hero">
  <div class="sol-hero-copy">
    ${eyebrow('CONNECTED COMMERCE', '礼链电商解决方案')}
    <h1>内容的下一步，<br><span class="serif-accent">是业务的每一步。</span></h1>
    <p class="sol-hero-description">从商品图片与视频，到活动承接与订单履约。以成熟产品为起点，围绕你的业务，组合适合的服务。</p>
    <div class="sol-hero-actions">${button('咨询我的业务场景')}<a class="text-link" href="#sol-content">从内容生产开始 ${arrow}</a></div>
    <div class="sol-hero-status">${status('AIGC · 成熟产品')}${status('履约 · 成熟方案')}</div>
  </div>
  <div class="sol-hero-board">
    <div class="sol-board-heading"><span>FROM CONTENT TO COMMERCE</span><span>礼链 · 产品与服务</span></div>
    <div class="sol-board-layout">
      <figure class="sol-board-scene">${picture('scene', '绿色家居服模特场景图 · 现有 AIGC 素材效果', '', true)}<figcaption><span>商品的一种表达</span><small>AIGC CONTENT</small></figcaption></figure>
      <div class="sol-board-rail">
        <div class="sol-board-path"><p>从创作，到交付</p><div><span>01 / CONTENT</span><h3>准备好内容</h3><small>商品 · 图片 · 视频</small></div><i aria-hidden="true">↓</i><div><span>02 / FULFILLMENT</span><h3>承接好业务</h3><small>活动 · 兑换 · 订单</small></div><p class="sol-board-path-note">按业务需要组合服务</p></div>
        <figure class="sol-board-source">${picture('trial-white-product', '绿色家居服套装商品白底图')}<figcaption>从你的商品开始 <span aria-hidden="true">↗</span></figcaption></figure>
      </div>
    </div>
    <p class="sol-board-note">现有商品素材效果展示 · 不代表各模块已自动打通</p>
  </div>
</section>

<section class="sol-system-section">
  <div class="container">
    <div class="sol-system-heading"><p class="eyebrow">A WAY THAT FITS YOUR BUSINESS</p><h2>两个成熟起点，<span class="serif-accent">更多业务可能。</span></h2><p>先选择适合的产品，再确认需要延伸的服务。</p></div>
    <div class="sol-system-grid" aria-label="礼链方案与能力状态">
      <a class="sol-system-item" href="#sol-content"><span class="sol-system-icon">${icon('content')}</span>${status('成熟产品')}<h3>AIGC 内容生产</h3><p>商品素材、图片视频<br>模板复用与审核归档</p><span class="sol-system-link">了解内容生产 ${arrow}</span></a>
      <a class="sol-system-item" href="#fulfillment"><span class="sol-system-icon">${icon('fulfillment')}</span>${status('成熟方案')}<h3>电商履约交付</h3><p>活动承接、权益兑换<br>订单管理与物流跟踪</p><span class="sol-system-link">了解履约方案 ${arrow}</span></a>
      <a class="sol-system-item sol-system-optional" href="#extension"><span class="sol-system-icon">${icon('operations')}</span>${status('按需评估', true)}<h3>AI 运营辅助</h3><p>活动方案、内容文案<br>业务复盘辅助</p><span class="sol-system-link">沟通适用场景 ${arrow}</span></a>
      <a class="sol-system-item sol-system-optional" href="#extension"><span class="sol-system-icon">${icon('acquisition')}</span>${status('定制咨询', true)}<h3>独立站与获客</h3><p>品牌展示、商品介绍<br>线索承接与渠道页面</p><span class="sol-system-link">沟通定制需求 ${arrow}</span></a>
    </div>
    <details class="sol-resource sol-matrix-resource"><summary><span>查看解决方案全景资料<small>业务全景示意 · 各模块适用范围需单独确认</small></span><span class="sol-resource-toggle" aria-hidden="true">+</span></summary><div class="sol-resource-body">${imageButton('matrix', '礼链 AI 电商增长智能体矩阵 · 业务全景示意')}<p>AIGC 与履约为成熟能力；运营辅助、独立站与获客按实际需求评估，不代表所有模块已自动打通。</p></div></details>
  </div>
</section>

<section class="container sol-feature sol-content-section" id="sol-content">
  <div class="sol-feature-copy">
    ${eyebrow('01 / CONTENT', '内容生产')}
    <h2>给每一款商品，<br><span class="serif-accent">更丰富的表达。</span></h2>
    <p>用 AIGC 素材工作台集中组织商品、模板与创作任务。让图片和视频围绕同一商品展开，经过审核后归档使用。</p>
    <ul class="sol-feature-points"><li><span>商品为起点</span><p>管理商品主体素材与 SKU，让创作有据可依。</p></li><li><span>图片与视频</span><p>商品图、场景图、细节图，以及动态内容表达。</p></li><li><span>团队工作流</span><p>模板复用、任务记录、人工审核与素材归档。</p></li></ul>
    <a class="text-link" href="/aigc.html">了解 AIGC 素材工作台 ${arrow}</a>
  </div>
  <div class="sol-content-gallery">
    <figure class="sol-content-input"><span class="sol-image-label">INPUT / 商品</span>${imageButton('trial-white-product', '输入：绿色家居服套装白底图')}<figcaption>商品白底图</figcaption></figure>
    <figure class="sol-content-scene"><span class="sol-image-label">OUTPUT / 场景</span>${imageButton('scene', '输出：绿色家居服模特场景图')}<figcaption>生活场景表达</figcaption></figure>
    <figure class="sol-content-detail"><span class="sol-image-label">OUTPUT / 细节</span>${imageButton('trial-detail-result', '输出：绿色家居服面料与蕾丝细节图')}<figcaption>面料与细节展示</figcaption></figure>
    <p class="sol-content-note">绿色家居服现有案例 · 素材使用前需经过人工审核</p>
  </div>
</section>

<section class="sol-fulfillment-section" id="fulfillment">
  <div class="container sol-feature">
    <div class="sol-feature-copy">
      ${eyebrow('02 / FULFILLMENT', '活动与履约')}
      <h2>从活动入口，<br><span class="serif-accent">到礼品送达。</span></h2>
      <p>为礼品服务商、企业福利与会员活动提供系统承接，让权益兑换与订单履约有序进行。</p>
      <div class="sol-fulfillment-tags"><span>礼品服务商</span><span>企业福利</span><span>会员活动</span></div>
      ${button('咨询履约方案', 'light')}
      <p class="sol-fulfillment-note">根据活动需求，确认系统使用与实施范围。</p>
    </div>
    <div class="sol-fulfillment-board">
      <div class="sol-fulfillment-board-head"><span>一场活动，清晰的交付路径</span>${status('成熟方案')}</div>
      <ol class="sol-fulfillment-path">
        <li><span>01</span><div><h3>活动入口</h3><p>活动与兑换入口、礼包及兑换码管理</p></div><i aria-hidden="true">↘</i></li>
        <li><span>02</span><div><h3>选择与兑换</h3><p>移动商城、商品选择与收货信息</p></div><i aria-hidden="true">↘</i></li>
        <li><span>03</span><div><h3>订单履约</h3><p>订单管理与物流跟踪</p></div><i aria-hidden="true">↘</i></li>
        <li><span>04</span><div><h3>活动复盘</h3><p>整理活动与履约信息，支持后续复盘</p></div><i aria-hidden="true">✓</i></li>
      </ol>
      <details class="sol-resource sol-fulfillment-resource"><summary><span>查看履约系统展示资料</span><span class="sol-resource-toggle" aria-hidden="true">+</span></summary><div class="sol-resource-body">${imageButton('fulfillment', '礼链履约系统 · 管理后台与移动商城展示资料')}<p>既有系统展示资料，具体功能范围以产品演示与合作约定为准。</p></div></details>
    </div>
  </div>
</section>

<section class="container sol-extension-section" id="extension">
  ${sectionHead('EXTEND WHEN YOU NEED', '按需延伸', '围绕你的业务，<br>多走一步。', '通过需求沟通确认适用性、交付范围与实施方式。')}
  <div class="sol-extension-grid">
    <article><div class="sol-extension-top"><span class="sol-extension-index">01 / OPERATIONS</span>${status('按需评估', true)}</div><span class="sol-extension-icon">${icon('operations')}</span><h3>让运营准备，<br>更有条理。</h3><p>围绕活动方案、商品卖点、运营文案与复盘报告，评估 AI 辅助的适用环节。业务决策与执行确认仍由团队负责。</p><div class="sol-extension-bottom"><span>AI 运营辅助</span><button class="text-link" data-inquiry>沟通运营需求 ${arrow}</button></div></article>
    <article><div class="sol-extension-top"><span class="sol-extension-index">02 / ACQUISITION</span>${status('定制咨询', true)}</div><span class="sol-extension-icon">${icon('acquisition')}</span><h3>给品牌，<br>一个清晰的入口。</h3><p>结合品牌展示、商品介绍与线索承接需求，沟通独立站与渠道推广页面。推广效果不作保证性承诺。</p><div class="sol-extension-bottom"><span>独立站与获客</span><button class="text-link" data-inquiry>沟通建站需求 ${arrow}</button></div></article>
  </div>
</section>

<section class="sol-delivery-section" id="services"><div class="container">
  <div class="sol-delivery-heading">${eyebrow('PRODUCT + SERVICE', '交付方式')}<h2>先把需求说清，<br><span class="serif-accent">再把事情做好。</span></h2><p>标准产品打底，定制范围在合作前确认。</p></div>
  <ol class="sol-delivery-steps">${[
    ['01', '了解业务', '沟通品类、现有流程和最想解决的问题。', '你的业务'],
    ['02', '演示与评估', '看标准产品，确认哪些能力适合你。', '适用的产品'],
    ['03', '确认合作', '约定产品、定制范围、报价和验收方式。', '清楚的约定'],
    ['04', '实施与交付', '按约定完成实施、验证与使用沟通。', '落地的结果']
  ].map(([number, title, desc, label]) => `<li><div class="sol-delivery-number"><span>${number}</span><i aria-hidden="true">→</i></div><h3>${title}</h3><p>${desc}</p><small>${label}</small></li>`).join('')}</ol>
</div></section>
${cta()}
</div>`;
}
