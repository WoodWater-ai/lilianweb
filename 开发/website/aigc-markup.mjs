// AIGC marketing page. The existing trial and video workbench own their behavior.
export function createAigcPage({ eyebrow, picture, imageButton, sectionHead, button, arrow, cta, faq, trialMarkup, videoWorkbench }) {
  const capabilities = [
    ['product-management', '商品素材管理', '以商品信息为起点', '集中管理商品、SKU 与主体素材，为每次创作准备清楚的商品信息。需要 ERP 对接时，单独确认接口范围与交付方式。', 'trial-white-product', 'PRODUCT / 商品'],
    ['image-production', '图片素材生产', '按业务目标，组织图片生产', '主图、场景图、细节图与上身 / 三视图，围绕用途创建任务。保留结果与任务记录，便于审核、调整和复用。', 'product-expressions', 'IMAGE / 图片'],
    ['video-production', '视频素材生产', '让图片，延展成动态内容', '支持首帧视频创作，以及基于授权参考视频的镜头与节奏复刻。实际效果结合商品、动作和镜头复杂度评估。', 'video-poster', 'VIDEO / 视频'],
    ['creation', 'AI 自由创作', '给创意，留一点自由', '引用已有素材，多轮调整创作方向；将满意的结果继续创作或归档，让探索和生产自然衔接。', 'scene', 'CREATIVE / 创作'],
  ];
  return `<section class="aigc-hero container" aria-labelledby="aigc-hero-title">
    <div class="aigc-hero-copy">${eyebrow('AIGC WORKBENCH', '礼链素材工作台')}<h1 id="aigc-hero-title">商品一上新，<br><span class="serif-accent">图片视频一起出。</span></h1><p class="aigc-hero-description">面向持续上新的品牌与电商团队，以商品和 SKU 为起点，连接图片、视频生产与素材管理。</p><div class="aigc-hero-actions"><a class="button primary" href="#trial" data-experience>立即体验 ${arrow}</a><a class="text-link" href="#showcase">先看作品 ${arrow}</a></div><p class="aigc-hero-audience">为品牌负责人、电商负责人<br>与内容生产团队而准备。</p><div class="aigc-hero-path" aria-label="工作台流程"><span>商品</span><i aria-hidden="true">→</i><span>图片</span><i aria-hidden="true">→</i><span>视频</span><i aria-hidden="true">→</i><span>素材归档</span></div></div>
    <div class="aigc-hero-visual"><div class="aigc-hero-visual-head"><span>ONE PRODUCT. MORE POSSIBILITIES.</span><span>01 / AIGC</span></div><div class="aigc-hero-composition"><button class="aigc-hero-scene" data-image="/assets/scene.webp" data-caption="绿色家居服案例：模特场景图" aria-label="放大查看：绿色家居服模特场景图">${picture('scene', '绿色家居服模特场景图', '', true)}<span class="aigc-work-badge">场景表达 / SCENE</span><span class="aigc-hero-scene-caption">让商品，走进生活。<small>绿色家居服 · 已有效果展示</small></span><span class="aigc-hero-zoom" aria-hidden="true">↗</span></button><div class="aigc-hero-rail"><figure class="aigc-hero-detail">${imageButton('trial-detail-result', '绿色家居服案例：面料与蕾丝细节')}<figcaption><span>02 / DETAIL</span><strong>让细节被看见。</strong></figcaption></figure><figure class="aigc-hero-input"><span class="aigc-mini-label">一张商品图 <i aria-hidden="true">↗</i></span>${picture('trial-white-product', '输入商品：绿色家居服套装白底图')}<figcaption>输入 / 商品白底图</figcaption></figure></div></div><p class="aigc-hero-visual-note"><span class="aigc-note-dot" aria-hidden="true"></span>已确认案例 · 图片效果需经人工审核</p></div>
  </section>
  <section class="aigc-value-band" aria-label="产品价值"><div class="container aigc-values">${[
    ['01 / REUSABLE', '把选好的审美，沉淀为模板', '将视觉风格与创作要求沉淀下来，减少每次上新的重复配置。'],
    ['02 / CONNECTED', '同一商品，连续产出图与视频', '场景、细节、上身与视频表达围绕商品展开，让内容生产更连贯。'],
    ['03 / FOR YOUR TEAM', '从生成到归档，衔接团队工作', '连接商品、任务与素材管理，为审核、复用和持续上新做好准备。'],
  ].map(([index, title, desc]) => `<article><span class="aigc-value-index">${index}</span><h3>${title}</h3><p>${desc}</p></article>`).join('')}</div></section>
  <section class="section container aigc-showcase" id="showcase">
    ${sectionHead('THE WORK, AND HOW IT STARTS', '效果与过程', '先看作品，<br>再看它从哪里开始。', '上传商品白底图，使用预设模板，生成场景展示与细节特写。以下为绿色家居服案例效果。')}
    <div class="aigc-case-nav"><p>图片与视频，围绕同一件商品展开。</p><div class="filter-bar" role="group" aria-label="筛选素材"><button class="filter active" data-filter="all" aria-pressed="true">全部素材</button><button class="filter" data-filter="image" aria-pressed="false">图片素材</button><button class="filter" data-filter="video" aria-pressed="false">视频素材</button></div></div>
    <div class="aigc-image-case" data-category="image"><div class="aigc-case-heading"><span>01 / IMAGE STORY</span><span>白底图 → 场景图 + 细节图</span></div><div class="aigc-image-flow"><figure class="aigc-image-input"><div class="aigc-frame-label"><span>INPUT / 输入</span><span aria-hidden="true">↗</span></div>${imageButton('trial-white-product', '输入：绿色家居服套装白底图')}<figcaption><h3>一张商品白底图</h3><p>提供完整商品，展示颜色与款式。</p></figcaption></figure><figure class="aigc-image-scene"><div class="aigc-frame-label"><span>OUTPUT 01 / 场景</span><span>SCENE</span></div>${imageButton('scene', '输出：绿色家居服模特场景图')}<figcaption><h3>把商品，放进生活场景</h3><p>围绕商品，生成真实感的场景表达。</p></figcaption></figure><figure class="aigc-image-detail"><div class="aigc-frame-label"><span>OUTPUT 02 / 细节</span><span>DETAIL</span></div>${imageButton('trial-detail-result', '输出：绿色家居服面料与蕾丝细节图')}<figcaption><h3>让细节，被看得更清楚</h3><p>展示面料纹理、领口与蕾丝细节。</p></figcaption></figure></div></div>
    <div class="aigc-expression" data-category="image"><div class="aigc-expression-copy">${eyebrow('MORE EXPRESSIONS', '独立案例')}<h3>一件商品，<br>更多种表达。</h3><p>平铺、上身、生活场景、面料与包装，看看完整产品能带来的内容可能。</p><div class="aigc-expression-tags"><span>商品平铺</span><span>模特上身</span><span>生活场景</span><span>面料细节</span><span>包装陈列</span></div><p class="aigc-expression-note">以下为独立案例，非免费试用输出数量承诺。</p></div><figure>${imageButton('product-expressions', '家居服独立案例：平铺、上身、场景、细节与包装九宫格')}<figcaption><span>ONE PRODUCT / MULTIPLE EXPRESSIONS</span><span>查看完整案例 ${arrow}</span></figcaption></figure></div>
    <div class="aigc-film-case" data-category="video"><div class="aigc-film-heading"><div>${eyebrow('STILL TO MOTION', '视频素材')}<h3>让画面，<br>有了下一秒。</h3></div><div><p>从首帧延展，或参考视频复刻。<br>选择一种方式，查看输入素材与对应输出。</p><span class="aigc-film-state"><i aria-hidden="true"></i>已有复刻案例 · 可播放查看</span></div></div>${videoWorkbench('showcase', 'replica')}<p class="aigc-film-note">复刻展示为固定案例，非实时生成。图生视频对应结果待确认后加入。</p></div>
    <p class="aigc-showcase-note">素材效果需经过人工审核。图片与视频示例不代表每次生成均能达到相同效果。</p>
  </section>
  ${trialMarkup}
  <section class="section aigc-capabilities"><div class="container">${sectionHead('FOUR CAPABILITIES, ONE WORKBENCH', '产品能力', '灵感与生产，<br>在一个工作台里衔接。', '商品素材管理、图片生产、视频生产与 AI 自由创作，覆盖商品内容生产的不同环节。')}<div class="aigc-capability-shell"><div class="capability-tabs" role="tablist" aria-label="工作台能力">${capabilities.map(([key, label], i) => `<button role="tab" id="tab-${key}" aria-controls="panel-${key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${key}"><span>0${i + 1}</span>${label}<i aria-hidden="true">↗</i></button>`).join('')}</div>${capabilities.map(([key, , title, desc, src, index], i) => `<div class="capability-panel aigc-capability-panel" role="tabpanel" id="panel-${key}" aria-labelledby="tab-${key}" tabindex="0" ${i ? 'hidden' : ''}><div class="aigc-capability-copy"><p class="eyebrow">${index}</p><h3>${title}</h3><p>${desc}</p><a class="text-link" href="#trial" data-experience>从一次体验开始 ${arrow}</a></div><div class="aigc-capability-visual">${imageButton(src, title + ' · 能力效果示意')}<span class="aigc-capability-caption">能力效果示意 · 实际使用范围在合作前确认</span></div></div>`).join('')}</div></div></section>
  <section class="section container aigc-workflow">${sectionHead('FROM PRODUCT TO CONTENT', '工作流程', '每次上新，<br>都有清晰的下一步。', '把商品事实、创作任务和素材资产连起来，让团队知道接下来做什么。')}<ol class="aigc-process">${[
    ['PRODUCT', '商品与 SKU', '关联商品信息与主体素材，为创作准备清楚的起点。'],
    ['IMAGE', '图片生产', '围绕用途，组织场景、细节与上身等图片表达。'],
    ['VIDEO', '视频延展', '从首帧开始，或基于授权参考视频复刻镜头与节奏。'],
    ['REVIEW', '审核与素材归档', '业务团队确认商品细节与使用要求，再归档复用。'],
  ].map(([en, title, desc], i) => `<li><div class="aigc-process-top"><span>0${i + 1}</span><small>${en}</small><i aria-hidden="true">${i < 3 ? '→' : '✓'}</i></div><h3>${title}</h3><p>${desc}</p></li>`).join('')}</ol><p class="aigc-erp-note">ERP 同步与回写按需对接，具体支持范围、系统与交付方式在合作前确认。</p><div class="aigc-scope"><div><p class="eyebrow">START SMALL, THINK COMPLETE</p><h3>先试一种效果，<br>再了解完整工作方式。</h3>${button('预约完整产品演示')}</div><div class="aigc-scope-items"><article><span>01 / 轻量体验</span><p>免费图片体验：白底图输入，使用预设模板查看场景组图。视频体验为已有案例的模拟演示。</p></article><article><span>02 / 完整工作台</span><p>商品管理、图片生产、视频创作与素材管理。标准产品与定制服务可按团队情况选择。</p></article></div></div></section>
  <section class="section aigc-industries"><div class="container">${sectionHead('DESIGNED FOR COMMERCE', '面向全品类电商', '从你的场景出发，<br>找到合适的用法。', '当前展示以家居服素材为主。更多品类，从具体商品与业务需求开始评估。')}<div class="aigc-industry-grid">${[
    ['01', 'FASHION', '服装与配饰', '模特上身、场景表达、商品细节与短视频'],
    ['02', 'BEAUTY', '美妆与个护', '产品展示与场景素材，按商品样本评估'],
    ['03', 'LIVING', '家居与生活', '空间场景、商品陈列与活动视觉'],
    ['04', 'GIFTING', '礼品与福利', '活动素材、品牌表达与兑换履约衔接'],
  ].map(([index, en, title, desc]) => `<article><div class="aigc-industry-top"><span>${index}</span><small>${en}</small></div><h3>${title}</h3><p>${desc}</p></article>`).join('')}</div></div></section>
  <section class="section container aigc-faq"><div class="aigc-faq-heading">${eyebrow('A FEW MORE THINGS', '常见问题')}<h2>你可能<br>还想知道。</h2><p>从体验到团队落地，<br>把需要确认的事先说清楚。</p><button class="text-link" data-inquiry>聊聊你的具体需求 ${arrow}</button></div>${faq([
    ['这是软件，还是素材代做服务？', '礼链提供标准产品与定制服务。你可以先了解素材工作台，再根据团队情况沟通部署、使用与落地支持；具体交付范围在合作前确认。'],
    ['可以自动发布到电商平台吗？', '当前官网展示的是素材生产与管理能力。自动多平台发布不作为已上线能力承诺，系统对接需求可单独评估。'],
    ['生成的素材可以直接使用吗？', '上线前需要由业务团队审核商品颜色、版型、图案、文案与使用要求。我们会结合你的场景确认审核标准和使用边界。'],
    ['如何了解价格和定制范围？', '先告诉我们品类、素材需求和团队工作方式。我们通过产品演示与需求沟通，确认标准产品是否适用，以及需要哪些定制服务。'],
  ])}</section>${cta()}`;
}
