import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { trialMarkup } from './trial-markup.mjs';
import { videoWorkbench } from './video-workbench.mjs';
import { homeIntro } from './home-markup.mjs';
import { createAigcPage } from './aigc-markup.mjs';
import { createSolutionsPage } from './solutions-markup.mjs';
import { createPartnersPage, createContactPage, createPrivacyPage } from './relationship-markup.mjs';

const output = new URL('../../admin/deploy/', import.meta.url);
const pageStyles = {aigc:'aigc-page.css', solutions:'solutions-page.css', partners:'relationship-page.css', contact:'relationship-page.css', privacy:'relationship-page.css'};
const assetHash = createHash('sha256');
for (const asset of ['site.css', 'site.js', 'trial.js', ...new Set(Object.values(pageStyles))]) {
  assetHash.update(await readFile(new URL(`assets/${asset}`, output)));
}
const assetVersion = assetHash.digest('hex').slice(0, 12);
const arrow = '<span aria-hidden="true">↗</span>';
const brand = '<img src="/assets/brand.svg" width="36" height="36" alt=""><span>礼链<small>LILIAN</small></span>';
const button = (text = '预约产品演示', style = 'primary') => `<button class="button ${style}" data-inquiry>${text}${arrow}</button>`;
const picture = (src, alt, cls = '', eager = false) => `<img class="${cls}" src="/assets/${src}.webp" alt="${alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${eager ? 'fetchpriority="high"' : ''}>`;
const imageButton = (src, alt, cls = '') => `<button class="image-open ${cls}" data-image="/assets/${src}.webp" data-caption="${alt}" aria-label="放大查看：${alt}">${picture(src, alt)}<span class="zoom-mark" aria-hidden="true">↗</span></button>`;
const eyebrow = (en, cn) => `<p class="eyebrow"><span class="tiny-mark" aria-hidden="true"></span>${en}<span class="eyebrow-cn">${cn}</span></p>`;

function leadForm(kind = 'lead', id = 'contact') {
  const partner = kind === 'partner';
  return `<form class="lead-form" data-kind="${kind}" novalidate>
    <div class="form-fields">
      <div class="form-grid">
        <label for="${id}-company">${partner ? '公司 / 团队' : '公司名称'} <span>*</span><input id="${id}-company" name="company" autocomplete="organization" maxlength="100" placeholder="请输入公司或团队名称" required></label>
        <label for="${id}-name">${partner ? '你的姓名 <span>*</span>' : '怎么称呼你'}<input id="${id}-name" name="name" autocomplete="name" maxlength="40" placeholder="方便我们与你联系" ${partner ? 'required' : ''}></label>
        <label for="${id}-phone">手机号码 <span>*</span><input id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="请输入中国大陆手机号" required></label>
        ${partner ? `<label for="${id}-city">意向城市 <span>*</span><input id="${id}-city" name="city" maxlength="60" placeholder="如：浙江省杭州市" required></label>` : `<label for="${id}-solution">感兴趣的方案<select id="${id}-solution" name="solution"><option value="">请选择（选填）</option><option>AIGC素材工作台</option><option>电商履约</option><option>综合解决方案</option><option>定制服务</option></select></label>`}
      </div>
      <label for="${id}-message">${partner ? '客户资源与合作想法' : '想解决什么问题'}<textarea id="${id}-message" name="message" rows="3" maxlength="1000" placeholder="${partner ? '例如：服务的行业、已有客户资源、希望开展合作的方式' : '例如：商品上新频繁，希望批量制作场景图和短视频'}"></textarea></label>
      <div class="honey" aria-hidden="true"><label>请留空<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <label class="consent"><input type="checkbox" name="consent" required><span>我已阅读<a href="/privacy.html" target="_blank" rel="noopener">隐私说明</a>，同意礼链就本次${partner ? '合作申请' : '咨询'}与我联系。</span></label>
      <p class="form-status" role="status" aria-live="polite"></p>
      <button type="submit" class="button primary form-submit">${partner ? '提交合作申请' : '提交需求，预约演示'}${arrow}</button>
      <p class="form-note">${partner ? '申请提交后，我们将联系你沟通。提交申请不代表获得城市授权。' : '信息仅用于本次业务沟通。你也可以不填表，直接扫码联系我们。'}</p>
    </div>
    <div class="form-success" hidden tabindex="-1"><span class="success-icon" aria-hidden="true">✓</span><h3>${partner ? '合作申请已收到' : '需求已收到'}</h3><p>感谢你的关注。我们将根据你留下的联系方式与你沟通。</p><p class="receipt"></p><button type="button" class="button primary" data-wechat>现在扫码联系${arrow}</button><button type="button" class="text-button" data-form-reset>提交另一条${partner ? '申请' : '需求'}</button></div>
  </form>`;
}

function nav(active) {
  const items = [['/', '首页', 'home'], ['/aigc.html', 'AIGC 素材工作台', 'aigc'], ['/solutions.html', '电商解决方案', 'solutions'], ['/partners.html', '城市合伙人', 'partners']];
  return `<a class="skip-link" href="#main">跳到主要内容</a><header class="site-header"><div class="nav-shell"><a class="brand" href="/" aria-label="礼链首页">${brand}</a><nav id="primary-nav" aria-label="主导航">${items.map(([url, label, key]) => `<a href="${url}" ${active === key ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav><div class="nav-actions"><a class="contact-link" href="/contact.html">联系我们</a><a class="button primary" href="/aigc.html#trial" data-experience>立即体验 ↗</a><button class="menu-toggle" aria-controls="primary-nav" aria-expanded="false" aria-label="展开导航"><span></span><span></span></button></div></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container footer-top"><div><a class="brand" href="/">${brand}</a><p>让商品内容，成为生意的增长起点。</p><small>AI COMMERCE, MADE PRACTICAL.</small></div><div><h3>产品与服务</h3><a href="/aigc.html">AIGC 素材工作台</a><a href="/solutions.html#fulfillment">电商履约解决方案</a><a href="/solutions.html#services">标准产品与定制服务</a></div><div><h3>一起成长</h3><a href="/partners.html">成为城市合伙人</a><a href="/contact.html">关于礼链</a><button class="text-button" data-wechat>扫码联系</button></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} 杭州礼鲤科技有限公司</span><a href="/privacy.html">隐私说明</a><span>杭州 · 服务全品类电商团队</span></div></footer>`;
}
function dialogs() {
  return `<dialog id="inquiry-dialog" class="form-dialog" aria-labelledby="inquiry-title"><button class="dialog-close" data-close aria-label="关闭预约窗口">×</button><p class="eyebrow">LET’S TALK</p><h2 id="inquiry-title">从你的商品，开始聊起。</h2><p class="dialog-intro">告诉我们你的需求，一起找到适合的产品与落地方式。</p>${leadForm('lead', 'modal')}</dialog>
  <dialog id="wechat-dialog" class="wechat-dialog" aria-labelledby="wechat-title"><button class="dialog-close" data-close aria-label="关闭二维码窗口">×</button><div class="qr-brand">${brand}</div><p class="eyebrow">A CONVERSATION STARTS HERE</p><h2 id="wechat-title">扫码，直接聊聊。</h2><p>使用微信扫一扫，添加礼链业务联系人</p><img class="contact-qr" src="/assets/contact-qr.png" width="324" height="324" alt="礼链业务联系二维码"><p class="small">手机浏览时，可保存二维码后在微信中识别。</p><a class="button secondary" href="/assets/contact-qr.png" download="礼链业务联系二维码.png">保存二维码 ↓</a><p class="small">无需先填写表单，也可以直接联系。</p></dialog>
  <dialog id="media-dialog" class="media-dialog" aria-label="素材预览"><button class="dialog-close" data-close aria-label="关闭素材预览">×</button><div class="media-body"></div><p class="media-caption"></p></dialog>
  <div class="mobile-dock"><button data-wechat>扫码联系</button><a class="button primary" href="/aigc.html#trial" data-experience>立即体验 ↗</a></div>`;
}
const sectionHead = (en, cn, title, desc = '') => `<div class="section-head"><div>${eyebrow(en, cn)}<h2>${title}</h2></div>${desc ? `<p>${desc}</p>` : ''}</div>`;
const cta = () => `<section class="end-cta"><div class="container"><div><p class="eyebrow">YOUR NEXT CHAPTER</p><h2>把下一个上新，<br>变成新的开始。</h2></div><div><p>从一个商品、一个场景开始，<br>找到适合你的 AI 电商工作方式。</p><a class="button primary" href="/aigc.html#trial" data-experience>立即体验 ↗</a><button class="text-button" data-wechat>或直接扫码联系 →</button></div></div></section>`;

const home = `${homeIntro({ eyebrow, picture, imageButton, arrow })}
<section class="section container" id="why">${sectionHead('ONE WORKBENCH, FOUR CAPABILITIES', 'AIGC 素材工作台', '四大能力，<br>覆盖商品内容生产。', '商品管理、图片素材生产、视频素材生产与 AI 自由创作，连接在同一个工作台。')}<div class="home-capabilities">${[
['home-product-management','01 / PRODUCT','商品管理','以商品和 SKU 为起点，关联商品信息与素材，让每次创作有据可依。'],
['home-image-production','02 / IMAGE','图片素材生产','主图、场景图、细节图与上身效果，围绕商品准备多种视觉表达。'],
['home-video-production','03 / VIDEO','视频素材生产','从首帧图延展视频，或基于授权参考视频复刻镜头与节奏。'],
['home-ai-creation','04 / CREATIVE','AI 自由创作','引用素材、多轮创作，将创意探索与后续任务、素材管理衔接。']
].map(([src,index,title,desc])=>`<article><div class="home-capability-image">${picture(src,title+' · PPT 产品展示素材')}</div><span class="index">${index}</span><h3>${title}</h3><p>${desc}</p></article>`).join('')}</div><div class="home-capabilities-tail"><p>从商品事实到图片、视频，再到审核与素材归档。</p><a class="text-link" href="/aigc.html">了解完整工作台 ${arrow}</a></div></section>
<section class="section container workbench-section">${sectionHead('YOUR CREATIVE WORKBENCH', 'AIGC 素材工作台', '好素材背后，<br>是一套好用的工作方式。', '商品、模板、图片、视频与创作任务，在一个工作台里衔接。')}<div class="workflow-strip"><span><b>01</b> 准备商品素材</span><i>→</i><span><b>02</b> 选择模板与创作</span><i>→</i><span><b>03</b> 图片 / 视频生成</span><i>→</i><span><b>04</b> 审核与归档</span></div><div class="browser-frame"><div class="browser-top"><span><i></i><i></i><i></i></span><span>礼链 · AIGC 素材工作台</span><span>PRODUCT VIEW</span></div>${imageButton('workbench', 'AIGC 素材工作台实机截图，界面中保留达芬奇密码产品名称')}</div><div class="section-tail"><p>现有工作台界面 · 产品内名称为「达芬奇密码」</p><a class="text-link" href="/aigc.html">了解完整工作流程 ${arrow}</a></div></section>
<section class="matrix-section"><div class="container matrix-layout"><div>${eyebrow('CONNECTED COMMERCE', '礼链解决方案')}<h2>从素材起步，<br>向业务延伸。</h2><p>以成熟的内容生产与履约能力为基础，<br>围绕你的实际业务，组合适合的服务。</p><a class="button light" href="/solutions.html">了解电商解决方案 ${arrow}</a></div><div class="matrix-list"><a href="/aigc.html"><span>01</span><div><h3>AIGC 内容生产</h3><p>商品素材 · 图片视频 · 模板复用</p></div><span class="matrix-state">核心产品 ↗</span></a><a href="/solutions.html#fulfillment"><span>02</span><div><h3>电商履约交付</h3><p>活动承接 · 权益兑换 · 订单履约</p></div><span class="matrix-state">成熟方案 ↗</span></a><a href="/solutions.html#extension"><span>03</span><div><h3>AI 运营辅助</h3><p>活动策划 · 内容文案 · 复盘辅助</p></div><span class="matrix-state muted">按需评估 ↗</span></a><a href="/solutions.html#extension"><span>04</span><div><h3>独立站与获客</h3><p>品牌展示 · 线索承接 · 渠道推广</p></div><span class="matrix-state muted">定制咨询 ↗</span></a></div></div></section>
<section class="section container">${sectionHead('A WAY THAT FITS YOU', '合作方式', '标准产品打底，<br>你的业务决定下一步。')}<div class="service-pair"><article><span class="index">PRODUCT / 标准产品</span><h3>把成熟能力用起来</h3><p>从 AIGC 素材工作台或履约系统开始，通过产品演示了解功能，再确认适用场景与使用方式。</p><a class="text-link" href="/aigc.html">了解产品 ${arrow}</a></article><article><span class="index">SERVICE / 定制服务</span><h3>把业务需求落下去</h3><p>围绕你的业务流程、系统对接和专属场景，确认需求、交付范围与验收方式。</p><button class="text-link" data-inquiry>聊聊定制需求 ${arrow}</button></article></div></section>
<section class="partner-teaser container"><div class="partner-emblem" aria-hidden="true">L<span>PARTNERS</span></div><div><p class="eyebrow">GROW TOGETHER</p><h2>把本地的信任，<br>连接到新的生意。</h2><p>你推荐客户，我们负责产品、成交与交付。<br>欢迎成为礼链城市合伙人。</p></div><a class="button primary" href="/partners.html">了解合伙人计划 ${arrow}</a></section>${cta()}`;

const aigc = createAigcPage({eyebrow,picture,imageButton,sectionHead,button,arrow,cta,faq,trialMarkup,videoWorkbench});

function faq(items) {return `<div class="faq-list">${items.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div>`;}
const solutions = createSolutionsPage({eyebrow,picture,imageButton,sectionHead,button,arrow,cta});
const partners = createPartnersPage({eyebrow,sectionHead,leadForm,arrow});
const contact = createContactPage({eyebrow,leadForm,arrow});
const privacy = createPrivacyPage({arrow});

const pages = [
['index.html','home','礼链 · AI 电商解决方案｜AIGC 素材工作台','礼链为全品类电商团队提供 AIGC 素材工作台、电商履约与定制服务。从商品图片和视频生产，到活动承接和订单履约。',home],
['aigc.html','aigc','AIGC 素材工作台｜礼链','了解礼链 AIGC 素材工作台的商品管理、图片生产、视频创作与素材归档，查看真实素材与工作台演示。',aigc],
['solutions.html','solutions','电商解决方案｜礼链','从 AI 内容生产到活动承接、权益兑换与订单履约，以标准产品和定制服务支持电商业务。',solutions],
['partners.html','partners','城市合伙人计划｜礼链','成为礼链城市合伙人。你推荐客户，礼链负责产品、成交与交付。提交城市合作申请。',partners],
['contact.html','contact','关于与联系｜礼链','联系杭州礼鲤科技有限公司，预约 AIGC 素材工作台演示，咨询标准产品、定制服务与渠道合作。',contact],
['privacy.html','privacy','隐私说明｜礼链','了解礼链官网产品咨询和城市合伙人申请的信息收集、使用与联系选择。',privacy]
];
for(const [file,key,title,description,body] of pages){
 const url=`https://www.lilianagent.cn/${file==='index.html'?'':file}`;
 const html=`<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="theme-color" content="#123e35"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:locale" content="zh_CN"><meta property="og:site_name" content="礼链"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://www.lilianagent.cn/assets/share.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/brand.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css?v=${assetVersion}">${pageStyles[key]?`<link rel="stylesheet" href="/assets/${pageStyles[key]}?v=${assetVersion}">`:""}<script src="/assets/site.js?v=${assetVersion}" defer></script>${key==='aigc'?`<script src="/assets/trial.js?v=${assetVersion}" defer></script>`:''}</head><body data-page="${key}">${nav(key)}<main id="main">${body}</main>${footer()}${dialogs()}<noscript><div class="noscript-note">表单提交与素材预览需要启用 JavaScript。你仍可在<a href="/contact.html">联系页</a>扫描二维码联系礼链。</div></noscript></body></html>`;
 await writeFile(new URL(file,output),html);
}
await writeFile(new URL('sitemap.xml',output),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([file])=>`<url><loc>https://www.lilianagent.cn/${file==='index.html'?'':file}</loc></url>`).join('')}</urlset>\n`);
console.log(`Generated ${pages.length} pages in ${fileURLToPath(output)}`);
