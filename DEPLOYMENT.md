# 部署指南

## 方案 1: Render（推荐）✅

Render 提供免费的 Node.js 应用托管，支持 SQLite 数据库。

### 部署步骤

1. **准备 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到 GitHub**
   - 在 GitHub 创建新仓库
   - 推送代码：
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

3. **在 Render 部署**
   - 访问 https://render.com
   - 注册/登录账户
   - 点击 "New +" → "Web Service"
   - 连接你的 GitHub 仓库
   - 配置：
     - Name: task-management-system
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
   - 点击 "Create Web Service"

4. **访问应用**
   - 部署完成后，Render 会提供一个 URL
   - 格式：`https://你的应用名.onrender.com`

### 注意事项
- 免费版会在不活动时休眠，首次访问可能需要等待
- SQLite 数据库在每次重启时会重置（免费版限制）
- 如需持久化数据，考虑升级到付费版或使用外部数据库

---

## 方案 2: Railway

Railway 也提供免费的 Node.js 托管。

### 部署步骤

1. **准备代码**（已完成）

2. **部署到 Railway**
   - 访问 https://railway.app
   - 注册/登录
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库
   - Railway 会自动检测并部署

3. **配置域名**
   - 在项目设置中生成公开 URL

---

## 方案 3: Heroku

Heroku 是经典的 PaaS 平台。

### 部署步骤

1. **安装 Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **登录并创建应用**
   ```bash
   heroku login
   heroku create 你的应用名
   ```

3. **部署**
   ```bash
   git push heroku main
   ```

4. **打开应用**
   ```bash
   heroku open
   ```

---

## 方案 4: Vercel（需要改造）

Vercel 主要用于静态网站和 serverless 函数，需要将 Express 应用改造为 serverless 函数。

---

## 方案 5: 自己的服务器

如果你有自己的服务器（VPS）：

1. **连接服务器**
   ```bash
   ssh user@your-server-ip
   ```

2. **安装 Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **上传代码**
   ```bash
   git clone https://github.com/你的用户名/仓库名.git
   cd 仓库名
   npm install
   ```

4. **使用 PM2 运行**
   ```bash
   npm install -g pm2
   pm2 start server.js --name task-app
   pm2 save
   pm2 startup
   ```

5. **配置 Nginx 反向代理**（可选）

---

## 推荐方案对比

| 平台 | 优点 | 缺点 | 价格 |
|------|------|------|------|
| **Render** | 简单、支持 SQLite | 免费版会休眠 | 免费/$7/月 |
| **Railway** | 快速、自动部署 | 免费额度有限 | 免费/$5/月 |
| **Heroku** | 成熟稳定 | 免费版已取消 | $7/月起 |
| **VPS** | 完全控制 | 需要运维知识 | $5/月起 |

## 当前项目已准备好部署

✅ PORT 环境变量支持  
✅ package.json 配置完整  
✅ .gitignore 已创建  
✅ render.yaml 配置文件  

选择一个方案开始部署吧！
