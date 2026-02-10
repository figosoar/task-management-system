# Railway 部署指南（无需信用卡）

## ✅ 为什么选择 Railway？
- ✅ **完全免费**：无需信用卡
- ✅ **每月 $5 免费额度**：足够小型应用使用
- ✅ **自动部署**：推送代码自动更新
- ✅ **支持 SQLite**：数据持久化
- ✅ **简单易用**：几分钟完成部署

## 🚀 部署步骤

### 方法 1: 通过 Railway 网站（推荐）

#### 步骤 1: 访问 Railway
打开浏览器: https://railway.app

#### 步骤 2: 注册/登录
1. 点击右上角 "Login"
2. 选择 "Login with GitHub"（推荐）
3. 授权 Railway 访问你的 GitHub

#### 步骤 3: 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 在列表中找到 `task-management-system`
4. 点击仓库名称

#### 步骤 4: 自动部署
Railway 会自动：
- 检测 Node.js 项目
- 安装依赖
- 启动应用
- 分配公开 URL

#### 步骤 5: 生成公开域名
1. 部署完成后，点击你的服务
2. 点击 "Settings" 标签
3. 找到 "Networking" 部分
4. 点击 "Generate Domain"
5. Railway 会生成一个域名，格式：`xxx.up.railway.app`

#### 步骤 6: 访问应用
复制生成的域名，在浏览器中访问！

---

### 方法 2: 使用 Railway CLI

#### 安装 Railway CLI
```bash
npm install -g @railway/cli
```

#### 登录
```bash
railway login
```

#### 初始化项目
```bash
railway init
```

#### 部署
```bash
railway up
```

#### 生成域名
```bash
railway domain
```

---

## 📱 访问地址

部署成功后，你的应用地址：
- **主页**: `https://你的应用.up.railway.app`
- **任务提交**: `https://你的应用.up.railway.app/submit.html`
- **管理后台**: `https://你的应用.up.railway.app/admin.html`

## 🔑 默认账号
- 用户名: `admin`
- 密码: `admin123`

## 💡 Railway 免费额度

### 免费计划包含：
- ✅ $5 免费额度/月
- ✅ 512MB RAM
- ✅ 1GB 磁盘空间
- ✅ 无限项目数
- ✅ 数据持久化

### 额度消耗：
- 运行时间按小时计费
- 小型应用通常每月消耗 $3-5
- 如果超出额度，应用会暂停（下月自动恢复）

## 🔄 自动部署

每次推送代码到 GitHub，Railway 会自动重新部署：

```bash
git add .
git commit -m "更新内容"
git push origin main
```

## 📊 监控和日志

在 Railway 控制台可以：
- 查看实时日志
- 监控资源使用
- 查看部署历史
- 设置环境变量

## ⚙️ 环境变量（可选）

如果需要设置环境变量：
1. 在 Railway 控制台点击你的服务
2. 点击 "Variables" 标签
3. 添加变量，例如：
   - `NODE_ENV=production`
   - `PORT=3000`（Railway 会自动设置）

## 🎯 优势对比

| 特性 | Railway | Render | Vercel |
|------|---------|--------|--------|
| 需要信用卡 | ❌ 不需要 | ✅ 需要 | ❌ 不需要 |
| 免费额度 | $5/月 | 750小时/月 | 100GB流量 |
| Node.js支持 | ✅ 完美 | ✅ 完美 | ⚠️ Serverless |
| SQLite支持 | ✅ 支持 | ⚠️ 不持久 | ❌ 不支持 |
| 自动休眠 | ❌ 不休眠 | ✅ 会休眠 | ❌ 不休眠 |
| 部署速度 | ⚡ 快 | 🐢 较慢 | ⚡ 很快 |

## ❓ 常见问题

### Q: Railway 真的不需要信用卡吗？
A: 是的！只需要 GitHub 账号就可以使用。

### Q: 免费额度用完了怎么办？
A: 应用会暂停，下个月自动恢复。或者升级到付费计划（$5/月起）。

### Q: 数据会丢失吗？
A: 不会！Railway 提供持久化存储，数据会保留。

### Q: 如何查看剩余额度？
A: 在 Railway 控制台右上角可以看到当前月份的使用情况。

### Q: 可以绑定自定义域名吗？
A: 可以！在 Settings → Networking 中添加自定义域名。

## 🎉 开始部署

现在就访问 https://railway.app 开始部署吧！

整个过程只需要 3-5 分钟！
