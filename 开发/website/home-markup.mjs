// Homepage presentation uses the existing, verified product and replication assets.
export function homeIntro({ eyebrow, picture, imageButton, arrow }) {
  const motionControls = () => `<button class="home-motion-toggle" type="button" data-ambient-toggle aria-pressed="false" aria-label="播放复刻视频静音预览"><span data-ambient-icon aria-hidden="true">▶</span><span data-ambient-label>播放预览</span></button>`;
  const motionVideo = () => `<video data-ambient-video data-src="/assets/video-result-web.mp4" poster="/assets/video-poster.webp" muted loop playsinline preload="none" aria-label="绿色家居服授权参考视频复刻结果，静音预览"></video>`;

  return `
<section class="home-hero container" aria-labelledby="home-title">
  <div class="home-hero-copy">
    ${eyebrow('LILIAN · AI COMMERCE', '礼链 AI 电商解决方案')}
    <h1 id="home-title">好商品，<br>值得<span class="serif-accent">被看见。</span></h1>
    <p class="home-hero-description">从一张商品图，延展场景、细节与动态内容。<br>用 AIGC 素材工作台，连接图片与视频生产。</p>
    <div class="home-hero-actions"><a class="button primary" href="/aigc.html#trial" data-experience>立即体验 ${arrow}</a><a class="button quiet" href="#showcase">探索素材效果 ${arrow}</a></div>
    <div class="home-hero-note"><span class="live-dot" aria-hidden="true"></span>面向全品类电商<span aria-hidden="true">/</span>标准产品 + 定制服务</div>
  </div>
  <div class="home-hero-visual">
    <figure class="home-hero-scene">
      <button class="home-scene-open" data-image="/assets/scene.webp" data-caption="绿色家居服 · 模特场景素材" aria-label="放大查看绿色家居服模特场景素材">${picture('scene', '绿色家居服模特场景素材', '', true)}<span class="home-image-badge">AI 场景素材</span><span class="home-scene-caption">一款商品，更多表达<span>PRODUCT TO POSSIBILITY</span></span><span class="home-scene-zoom" aria-hidden="true">↗</span></button>
    </figure>
    <div class="home-hero-rail">
      <div class="home-hero-motion" data-ambient-stage>
        ${motionVideo()}
        <span class="home-motion-badge">AI VIDEO</span>
        ${motionControls()}
        <p class="home-hero-video-status" data-ambient-status aria-live="polite">已有复刻案例 · 静音预览</p>
      </div>
      <figure class="home-hero-source"><div><span>从商品原图出发</span><span aria-hidden="true">↗</span></div>${picture('trial-white-product', '绿色家居服上衣与短裤套装白底输入图', '', true)}<figcaption>颜色 · 版型 · 商品细节</figcaption></figure>
    </div>
    <div class="home-visual-caption"><span>IMAGE / VIDEO / CREATIVE</span><button class="text-button" data-video="/assets/video-result-web.mp4" data-poster="/assets/video-poster.webp" data-caption="授权参考视频复刻 · 绿色家居服">查看完整视频 ${arrow}</button></div>
  </div>
</section>
<div class="capability-band"><div class="container"><span>让内容生产接上业务</span><span>商品素材管理</span><i aria-hidden="true">✦</i><span>AI 图片与视频</span><i aria-hidden="true">✦</i><span>模板与审核归档</span><i aria-hidden="true">✦</i><span>活动与履约</span></div></div>

<section class="section home-image-section" id="showcase" aria-labelledby="home-image-title">
  <div class="container">
    <div class="section-head"><div>${eyebrow('ONE PRODUCT, MORE POSSIBILITIES', '图片素材展示')}<h2 id="home-image-title">从商品本身，<br>到让人心动的画面。</h2></div><p>以绿色家居服为例，展示商品原图、模特场景与细节素材。让每一种表达，都围绕商品展开。</p></div>
    <div class="home-image-cases">
      <figure class="home-case-input"><div class="home-case-label"><span>INPUT / 商品原图</span><span aria-hidden="true">↗</span></div>${imageButton('trial-white-product', '输入：绿色家居服套装白底图')}<figcaption><h3>一张白底图，作为起点。</h3><p>准备清楚的颜色、款式与主体素材。</p></figcaption></figure>
      <figure class="home-case-scene"><div class="home-case-label"><span>01 / 场景表达</span><span>AI IMAGE</span></div>${imageButton('scene', '输出：绿色家居服模特场景图')}<figcaption><h3>让商品，进入生活。</h3><p>模特上身与场景氛围，拓展商品的视觉表达。</p></figcaption></figure>
      <figure class="home-case-detail"><div class="home-case-label"><span>02 / 细节呈现</span><span>DETAIL</span></div>${imageButton('trial-detail-result', '输出：绿色家居服面料与蕾丝细节图')}<figcaption><h3>值得细看的，清楚呈现。</h3><p>从面料纹理到领口与蕾丝，让细节有自己的镜头。</p></figcaption></figure>
    </div>
    <div class="section-tail"><p>已有案例展示，实际效果需结合商品特征与审核要求确认。</p><a class="text-link" href="/aigc.html#showcase">探索更多素材效果 ${arrow}</a></div>
  </div>
</section>

<section class="section home-film-section" id="video-showcase" aria-labelledby="home-video-title">
  <div class="container">
    <div class="section-head"><div>${eyebrow('A PRODUCT STORY, IN MOTION', '视频素材展示')}<h2 id="home-video-title">好画面，<br>也能动起来。</h2></div><p>以授权参考视频的镜头与节奏为起点，结合商品与人物素材，看看复刻视频如何呈现。</p></div>
    <div class="home-film-layout">
      <figure class="home-film-reference"><div class="home-film-label"><span>01 / REFERENCE</span><span>参考视频</span></div><button class="home-reference-open" data-video="/assets/video-reference-web.mp4" data-poster="/assets/reference-poster.webp" data-caption="视频复刻输入 · 授权参考视频" aria-label="播放视频复刻的授权参考视频">${picture('reference-poster', '授权参考视频封面')}<span class="play-circle" aria-hidden="true">▶</span></button><figcaption><h3>参考镜头与节奏</h3><p>从已有的视觉方向出发。</p></figcaption></figure>
      <div class="home-film-result"><div class="home-film-label"><span>02 / AI VIDEO</span><span>复刻结果</span></div><div class="home-film-player" data-ambient-stage>${motionVideo()}${motionControls()}<p class="home-film-status" data-ambient-status aria-live="polite">已有复刻案例 · 静音预览</p></div><button class="home-film-full" data-video="/assets/video-result-web.mp4" data-poster="/assets/video-poster.webp" data-caption="授权参考视频复刻 · 绿色家居服">播放完整案例 ${arrow}</button></div>
      <div class="home-film-story"><span class="home-film-label">SUBJECT / 主体素材</span><div class="home-film-subjects">${picture('trial-white-product', '视频复刻输入：绿色家居服商品素材')}${picture('scene', '视频复刻输入：人物形象素材')}</div><h3>让你的商品，<br>成为故事的主角。</h3><p>参考视频 + 商品与人物素材，连接成新的动态表达。</p><a class="text-link" href="/aigc.html#showcase">了解视频工作台 ${arrow}</a><p class="home-film-disclaimer">已有授权案例展示<br>非本次实时生成</p></div>
    </div>
  </div>
</section>
`;
}
