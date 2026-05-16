# 官网部署方案

## 🎉 当前状态

✅ 官网已准备就绪
✅ 本地预览已启动：http://localhost:3001

---

## 🚀 部署方案

### 方案一：Vercel部署（推荐）

#### 步骤1：安装Vercel CLI
```bash
npm install -g vercel
```

#### 步骤2：登录Vercel
```bash
vercel login
```

#### 步骤3：部署
```bash
cd E:\proo\prezzie-exchange-project-main\admin\deploy
vercel --prod
```

#### 优势
- ✅ 免费HTTPS
- ✅ 自动CDN
- ✅ 全球加速
- ✅ 自定义域名

---

### 方案二：Netlify部署

#### 方式A：网页拖拽部署
1. 访问 https://app.netlify.com/drop
2. 拖拽 `deploy` 文件夹到页面
3. 等待部署完成
4. 获得免费域名

#### 方式B：CLI部署
```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
cd E:\proo\prezzie-exchange-project-main\admin\deploy
netlify deploy --prod
```

---

### 方案三：GitHub Pages部署

#### 步骤1：创建GitHub仓库
```bash
cd E:\proo\prezzie-exchange-project-main\admin\deploy
git init
git add .
git commit -m "Initial commit: gift exchange website"
```

#### 步骤2：推送到GitHub
```bash
# 创建GitHub仓库后
git remote add origin https://github.com/your-username/gift-exchange-website.git
git push -u origin main
```

#### 步骤3：启用GitHub Pages
1. 访问仓库Settings
2. 找到Pages选项
3. 选择main分支
4. 保存并等待部署

#### 访问地址
```
https://your-username.github.io/gift-exchange-website
```

---

### 方案四：阿里云OSS部署

#### 步骤1：安装ossutil
下载：https://help.aliyun.com/document_detail/120075.html

#### 步骤2：配置
```bash
ossutil config
# 输入AccessKey和Endpoint
```

#### 步骤3：上传
```bash
ossutil cp -r E:\proo\prezzie-exchange-project-main\admin\deploy\ oss://your-bucket-name/ -u
```

#### 步骤4：配置静态网站托管
在OSS控制台设置静态网站托管，默认首页为index.html

---

### 方案五：腾讯云COS部署

#### 步骤1：安装coscmd
```bash
pip install coscmd
```

#### 步骤2：配置
```bash
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>
```

#### 步骤3：上传
```bash
coscmd upload -r E:\proo\prezzie-exchange-project-main\admin\deploy\ /
```

---

## 📊 方案对比

| 方案 | 价格 | 速度 | 易用性 | 自定义域名 | HTTPS |
|------|------|------|--------|-----------|-------|
| Vercel | 免费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ |
| Netlify | 免费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ |
| GitHub Pages | 免费 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ✅ |
| 阿里云OSS | 付费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ✅ |
| 腾讯云COS | 付费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ✅ |

---

## 🎯 推荐方案

### 个人/小团队：Vercel或Netlify
- 免费
- 快速
- 简单
- 自动HTTPS

### 企业用户：阿里云OSS或腾讯云COS
- 国内访问快
- 稳定可靠
- 技术支持

---

## 📝 部署后配置

### 1. 自定义域名
```
例如：www.lixangift.com
```

### 2. SSL证书
- Vercel/Netlify：自动配置
- GitHub Pages：自动配置
- OSS/COS：需手动配置

### 3. DNS解析
```
类型：CNAME
记录：www
值：部署平台提供的域名
```

---

## 🔧 当前文件位置

```
E:\proo\prezzie-exchange-project-main\admin\deploy\
├── index.html          # 官网主页
├── vercel.json         # Vercel配置
└── package.json        # 项目配置
```

---

## 🚀 快速开始

### 最快部署方式（5分钟）

1. **打开浏览器**
   访问：https://app.netlify.com/drop

2. **拖拽部署**
   拖拽文件夹：`E:\proo\prezzie-exchange-project-main\admin\deploy`

3. **获得域名**
   等待1-2分钟，获得免费域名

4. **完成！**
   分享你的官网链接

---

## 📞 技术支持

- 公司：礼享科技
- 电话：18657192015
- 产品：礼品兑换系统

---

## ✅ 部署检查清单

- [ ] 选择部署平台
- [ ] 完成部署
- [ ] 测试访问
- [ ] 配置自定义域名（可选）
- [ ] 配置SSL证书（自动）
- [ ] 添加网站统计（可选）
- [ ] 添加客服代码（可选）

---

选择最适合你的方案开始部署吧！
