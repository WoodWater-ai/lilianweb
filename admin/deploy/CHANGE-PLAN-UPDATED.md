# 官网改动计划（更新版）

## 📋 改动需求总结

### 1. 联系信息更新
- **邮箱**：panjj13@163.com
- **微信**：jjp399
- **电话**：18657192015（保持不变）

### 2. 品牌信息更新
- **公司名称**：杭州礼链智能科技有限公司
- **产品名称**：礼链数智平台
- **品牌标识**：LINK INFINIT

### 3. 图片资源（完整版）

#### **Logo和Banner**
- **Logo**：LINK INFINIT品牌标志（蓝白渐变，L+∞符号）
- **Banner**：产品宣传横幅，包含管理后台和商城界面

#### **商城界面截图（2张）**
1. **商品兑换界面**：用户浏览商品、查看积分、兑换操作
2. **礼品卡登录界面**：兑换码登录、扫码功能

#### **管理后台截图（2张）**
1. **卡密管理界面**：批量生成卡密、礼品助手功能
2. **二级租户管理界面**：租户列表、权限管理

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

---

### **阶段二：品牌信息更新**

#### 改动位置：
1. **页面Title**：礼链数智平台
2. **导航栏Logo**：添加LINK INFINIT Logo图片
3. **Meta标签**：更新品牌名称
4. **底部Footer**：杭州礼链智能科技有限公司
5. **结构化数据**：更新Organization和SoftwareApplication Schema

---

### **阶段三：图片资源添加**

#### 1. Logo添加
**位置**：导航栏左侧、Footer底部
**文件**：logo-link-infinit.png

#### 2. Banner添加
**位置**：英雄区域（Hero Section）
**文件**：banner-main.png

#### 3. 产品界面截图展示（新增）

**位置**：产品展示区域（showcase section）

**展示方案**：

##### **方案A：分类展示（推荐）**

```html
<!-- 商城界面展示 -->
<div class="showcase-category">
  <h3 class="category-title">移动商城</h3>
  <div class="showcase-grid">
    <div class="showcase-item">
      <img src="shop-product-list.png" alt="商品兑换界面" />
      <p>商品浏览与兑换</p>
    </div>
    <div class="showcase-item">
      <img src="shop-login.png" alt="礼品卡登录" />
      <p>礼品卡登录入口</p>
    </div>
  </div>
</div>

<!-- 管理后台展示 -->
<div class="showcase-category">
  <h3 class="category-title">管理后台</h3>
  <div class="showcase-grid">
    <div class="showcase-item">
      <img src="admin-card-mgmt.png" alt="卡密管理" />
      <p>卡密生成与管理</p>
    </div>
    <div class="showcase-item">
      <img src="admin-tenant-mgmt.png" alt="二级租户管理" />
      <p>二级租户管理</p>
    </div>
  </div>
</div>
```

##### **方案B：轮播展示**

使用轮播组件展示4张截图，节省空间。

---

### **阶段四：首页展示优化**

#### 1. 英雄区域优化
- 添加Banner图片作为视觉焦点
- 保留核心文案和CTA按钮
- 优化布局，突出产品特色

#### 2. 产品展示区域优化
- 使用实际界面截图替换占位符
- 分类展示商城和后台界面
- 添加功能说明文字
- 优化视觉效果

---

## 📁 文件处理计划

### 需要创建的图片文件：

#### **Logo和Banner**
1. **logo-link-infinit.png**
   - 来源：第二张图片（Logo）
   - 用途：导航栏、Footer
   - 尺寸：200×200px

2. **banner-main.png**
   - 来源：第一张图片（Banner）
   - 用途：英雄区域展示
   - 尺寸：1920×1080px

#### **商城界面截图**
3. **shop-product-list.png**
   - 来源：图片1（商品兑换界面）
   - 用途：产品展示区域
   - 尺寸：1200×2000px（移动端长图）
   - 说明：展示商品列表、积分价格、兑换按钮

4. **shop-login.png**
   - 来源：图片2（礼品卡登录界面）
   - 用途：产品展示区域
   - 尺寸：1200×2000px（移动端长图）
   - 说明：展示登录入口、扫码功能

#### **管理后台截图**
5. **admin-card-mgmt.png**
   - 来源：图片3（卡密管理界面）
   - 用途：产品展示区域
   - 尺寸：1920×1080px（桌面端）
   - 说明：展示卡密生成、礼品助手功能

6. **admin-tenant-mgmt.png**
   - 来源：图片4（二级租户管理界面）
   - 用途：产品展示区域
   - 尺寸：1920×1080px（桌面端）
   - 说明：展示租户列表、权限管理

---

## 🎨 样式优化计划

### 需要添加的CSS：

```css
/* Logo样式 */
.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-right: 0.5rem;
}

/* Banner样式 */
.hero-banner {
  width: 100%;
  max-width: 1000px;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

/* 产品展示分类 */
.showcase-category {
  margin-bottom: 4rem;
}

.category-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 截图展示样式 */
.showcase-image {
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.showcase-image:hover {
  transform: scale(1.02);
}

.showcase-item {
  text-align: center;
}

.showcase-item p {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--text-secondary);
}
```

---

## 📊 改动影响范围

### 需要修改的文件：
- ✅ index.html（主要改动）
- ✅ 新增图片文件（6个）

### 不需要修改的文件：
- ✅ sitemap.xml（保持不变）
- ✅ robots.txt（保持不变）
- ✅ netlify.toml（保持不变）

---

## 🚀 实施步骤

### 步骤1：保存图片文件
- 保存Logo图片
- 保存Banner图片
- 保存商城界面截图（2张）
- 保存管理后台截图（2张）

### 步骤2：更新HTML内容
- 更新联系信息
- 更新品牌名称
- 添加Logo和Banner
- 添加产品界面截图展示

### 步骤3：优化样式
- 添加Logo样式
- 添加Banner样式
- 添加截图展示样式
- 优化响应式布局

### 步骤4：测试验证
- 本地预览效果
- 检查所有链接
- 验证图片显示
- 测试响应式布局

### 步骤5：部署上线
- 部署到Netlify
- 验证线上效果
- 测试所有功能

---

## ✅ 验收标准

### 必须完成：
- [ ] 联系邮箱更新为 panjj13@163.com
- [ ] 微信号更新为 jjp399
- [ ] 公司名称更新为 杭州礼链智能科技有限公司
- [ ] 产品名称更新为 礼链数智平台
- [ ] Logo正确显示
- [ ] Banner正确显示
- [ ] 商城界面截图正确显示（2张）
- [ ] 管理后台截图正确显示（2张）
- [ ] 所有按钮功能正常
- [ ] 响应式布局正常
- [ ] 部署成功并可访问

### 建议完成：
- [ ] 图片懒加载优化
- [ ] 图片压缩优化
- [ ] 添加图片说明文字
- [ ] 优化移动端展示效果

---

## 📸 图片展示策略

### **首页展示优先级**

1. **最高优先级**：Banner（英雄区域）
   - 包含完整产品概念
   - 视觉冲击力强

2. **高优先级**：商城界面（产品展示区）
   - 商品兑换界面
   - 礼品卡登录界面

3. **中优先级**：管理后台（产品展示区）
   - 卡密管理界面
   - 二级租户管理界面

### **展示布局建议**

```
首页结构：
├── 导航栏（Logo + 菜单）
├── 英雄区域（Banner + 核心文案）
├── Agent特色区域
├── 产品特色区域
├── 系统架构区域
├── 产品展示区域（新增）
│   ├── 移动商城（2张截图）
│   └── 管理后台（2张截图）
├── 客户案例区域
├── CTA区域
└── 底部Footer
```

---

## 📝 备注

1. **图片处理**：
   - 建议使用图片压缩工具优化文件大小
   - 保持图片清晰度的同时减小文件体积
   - 建议使用WebP格式提升加载速度

2. **SEO影响**：
   - 品牌名称变更需要更新搜索引擎收录
   - 添加图片alt标签提升SEO

3. **用户体验**：
   - Banner图片可能影响首屏加载速度，需优化
   - 建议使用懒加载技术
   - 移动端需要优化图片展示尺寸

4. **响应式设计**：
   - 移动端截图在手机上展示效果更好
   - 桌面端截图在电脑上展示效果更好
   - 需要针对不同设备优化展示布局

---

## 🎯 图片用途总结

| 图片名称 | 用途 | 展示位置 | 优先级 |
|---------|------|---------|--------|
| logo-link-infinit.png | 品牌标识 | 导航栏、Footer | 最高 |
| banner-main.png | 产品宣传 | 英雄区域 | 最高 |
| shop-product-list.png | 商城展示 | 产品展示区 | 高 |
| shop-login.png | 商城展示 | 产品展示区 | 高 |
| admin-card-mgmt.png | 后台展示 | 产品展示区 | 中 |
| admin-tenant-mgmt.png | 后台展示 | 产品展示区 | 中 |

---

**确认此计划后，我将开始执行改动。**
