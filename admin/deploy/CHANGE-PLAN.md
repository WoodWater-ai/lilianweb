# 官网改动计划

## 📋 改动需求总结

### 1. 联系信息更新
- **邮箱**：panjj13@163.com
- **微信**：jjp399
- **电话**：18657192015（保持不变）

### 2. 品牌信息更新
- **公司名称**：杭州礼链智能科技有限公司
- **产品名称**：礼链数智平台
- **品牌标识**：LINK INFINIT

### 3. 图片资源
- **Logo**：LINK INFINIT品牌标志（蓝白渐变，L+∞符号）
- **Banner**：产品宣传横幅，包含：
  - 管理后台界面截图（平板）
  - 移动商城界面截图（手机×2）

---

## 🎯 详细改动计划

### **阶段一：联系信息更新**

#### 改动位置：
1. **CTA区域按钮**
   - "联系我们"按钮 → 邮箱链接改为 panjj13@163.com
   - 微信咨询信息 → 显示微信号：jjp399

2. **底部Footer**
   - 联系邮箱更新
   - 微信号更新

#### 具体改动：
```html
<!-- 修改前 -->
<a href="mailto:contact@lixangift.com">📧 联系我们</a>
<p>或添加微信咨询：<span>lixangift</span></p>

<!-- 修改后 -->
<a href="mailto:panjj13@163.com">📧 联系我们</a>
<p>或添加微信咨询：<span>jjp399</span></p>
```

---

### **阶段二：品牌信息更新**

#### 改动位置：
1. **页面Title**
   - 礼享兑换系统 → 礼链数智平台

2. **导航栏Logo**
   - 文字：礼享兑换系统 → 礼链数智平台
   - 添加：LINK INFINIT Logo图片

3. **Meta标签**
   - description、keywords中的品牌名称
   - Open Graph标签

4. **底部Footer**
   - 公司名称：礼享科技 → 杭州礼链智能科技有限公司
   - 产品名称更新

5. **结构化数据**
   - Organization Schema
   - SoftwareApplication Schema

#### 具体改动：
```html
<!-- 修改前 -->
<title>礼享兑换系统 - 行业首个Agent智能解决方案</title>
<div class="logo">🎁 礼享兑换系统</div>

<!-- 修改后 -->
<title>礼链数智平台 - 行业首个Agent智能解决方案</title>
<div class="logo">
  <img src="logo.png" alt="LINK INFINIT" />
  礼链数智平台
</div>
```

---

### **阶段三：图片资源添加**

#### 1. Logo添加

**位置**：
- 导航栏左侧
- Footer底部

**实现方式**：
```html
<!-- 导航栏Logo -->
<div class="logo">
  <img src="logo-link-infinit.png" alt="LINK INFINIT" class="logo-img" />
  <span class="logo-text">礼链数智平台</span>
</div>

<!-- CSS样式 -->
.logo-img {
  width: 40px;
  height: 40px;
  margin-right: 0.5rem;
}
```

#### 2. Banner添加

**位置**：
- 英雄区域（Hero Section）背景或内容区
- 替换现有的渐变背景

**实现方式**：
```html
<!-- 方案A：作为Hero背景 -->
<section class="hero" style="background-image: url('banner.png')">
  ...
</section>

<!-- 方案B：作为Hero内容区图片 -->
<div class="hero-visual">
  <img src="banner.png" alt="礼链数智平台" class="hero-banner" />
</div>
```

#### 3. 产品界面截图展示

**位置**：
- 产品展示区域（已创建的showcase section）
- 替换占位符

**实现方式**：
```html
<!-- 管理后台截图 -->
<div class="showcase-image-placeholder">
  <img src="admin-dashboard.png" alt="管理后台界面" />
</div>

<!-- 移动商城截图 -->
<div class="showcase-image-placeholder">
  <img src="mobile-shop.png" alt="移动商城界面" />
</div>
```

---

### **阶段四：首页展示优化**

#### 1. 英雄区域优化

**改动内容**：
- 添加Banner图片作为视觉焦点
- 保留核心文案和CTA按钮
- 优化布局，突出产品特色

**实现方式**：
```html
<section class="hero">
  <div class="hero-content">
    <div class="hero-text">
      <!-- 文案内容 -->
    </div>
    <div class="hero-visual">
      <img src="banner.png" alt="礼链数智平台" />
    </div>
  </div>
</section>
```

#### 2. 产品展示区域优化

**改动内容**：
- 使用Banner中的实际界面截图
- 添加截图说明文字
- 优化视觉效果

---

## 📁 文件处理计划

### 需要创建的图片文件：

1. **logo-link-infinit.png**
   - 来源：第二张图片（Logo）
   - 用途：导航栏、Footer
   - 尺寸：建议200×200px

2. **banner-main.png**
   - 来源：第一张图片（Banner）
   - 用途：英雄区域展示
   - 尺寸：保持原始尺寸或优化为1920×1080px

3. **admin-dashboard.png**
   - 来源：从Banner中裁剪平板界面
   - 用途：产品展示区域
   - 尺寸：建议1200×800px

4. **mobile-shop.png**
   - 来源：从Banner中裁剪手机界面
   - 用途：产品展示区域
   - 尺寸：建议600×1000px

---

## 🎨 样式优化计划

### 需要添加的CSS：

```css
/* Logo样式 */
.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

/* Banner样式 */
.hero-banner {
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

/* 截图展示样式 */
.showcase-image {
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
```

---

## 📊 改动影响范围

### 需要修改的文件：
- ✅ index.html（主要改动）
- ✅ 新增图片文件（4个）

### 不需要修改的文件：
- ✅ sitemap.xml（保持不变）
- ✅ robots.txt（保持不变）
- ✅ netlify.toml（保持不变）

---

## 🚀 实施步骤

### 步骤1：准备图片文件
- 保存Logo图片
- 保存Banner图片
- （可选）裁剪产品界面截图

### 步骤2：更新HTML内容
- 更新联系信息
- 更新品牌名称
- 添加图片引用

### 步骤3：优化样式
- 添加Logo样式
- 添加Banner样式
- 优化展示效果

### 步骤4：测试验证
- 本地预览效果
- 检查所有链接
- 验证图片显示

### 步骤5：部署上线
- 部署到Netlify
- 验证线上效果

---

## ✅ 验收标准

### 必须完成：
- [ ] 联系邮箱更新为 panjj13@163.com
- [ ] 微信号更新为 jjp399
- [ ] 公司名称更新为 杭州礼链智能科技有限公司
- [ ] 产品名称更新为 礼链数智平台
- [ ] Logo正确显示
- [ ] Banner正确显示
- [ ] 所有按钮功能正常
- [ ] 部署成功并可访问

### 建议完成：
- [ ] 产品界面截图清晰展示
- [ ] 响应式布局优化
- [ ] 图片加载优化

---

## 📝 备注

1. **图片处理**：建议使用图片压缩工具优化文件大小
2. **SEO影响**：品牌名称变更需要更新搜索引擎收录
3. **用户体验**：Banner图片可能影响首屏加载速度，需优化

---

**确认此计划后，我将开始执行改动。**
