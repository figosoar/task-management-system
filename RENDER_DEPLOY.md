# Render 部署步骤

## ✅ 代码已推送到 GitHub
仓库地址: https://github.com/figosoar/task-management-system

## 🚀 在 Render 上部署

### 步骤 1: 访问 Render
打开浏览器访问: https://render.com

### 步骤 2: 注册/登录
- 点击右上角 "Get Started" 或 "Sign In"
- 推荐使用 GitHub 账号登录（一键授权）

### 步骤 3: 创建新服务
1. 登录后，点击 "New +" 按钮
2. 选择 "Web Service"

### 步骤 4: 连接 GitHub 仓库
1. 点击 "Connect a repository"
2. 如果是第一次使用，需要授权 Render 访问你的 GitHub
3. 在仓库列表中找到 "task-management-system"
4. 点击 "Connect"

### 步骤 5: 配置服务（自动检测）
Render 会自动读取 render.yaml 配置，你会看到：

- **Name**: task-management-system
- **Region**: Singapore
- **Branch**: main
- **Build Command**: npm install
- **Start Command**: npm start

### 步骤 6: 部署
1. 检查配置无误后，点击底部的 "Create Web Service"
2. Render 开始构建和部署（需要 3-5 分钟）
3. 你会看到实时的构建日志

### 步骤 7: 获取 URL
部署成功后，Render 会提供一个公开 URL，格式类似：
```
https://task-management-system-xxxx.onrender.com
```

### 步骤 8: 访问应用
1. 点击 Render 提供的 URL
2. 使用默认管理员账号登录：
   - 用户名: `admin`
   - 密码: `admin123`

## 📝 重要提示

### 免费版限制
- ⏰ 应用在 15 分钟无活动后会自动休眠
- 🔄 首次访问休眠的应用需要等待 30-60 秒唤醒
- 💾 SQLite 数据库在应用重启时会重置（数据不持久化）

### 解决数据持久化问题
如果需要数据持久化，有两个选择：

**选项 1: 升级到付费版**
- 价格: $7/月
- 获得持久化磁盘存储
- 应用不会休眠

**选项 2: 使用外部数据库**
- 使用 PostgreSQL 或 MySQL
- 需要修改代码以支持外部数据库

## 🔧 后续更新

每次推送代码到 GitHub 的 main 分支，Render 会自动重新部署：

```bash
git add .
git commit -m "更新说明"
git push origin main
```

## 📱 分享链接

部署成功后，你可以分享以下链接：

- **主页**: https://你的应用.onrender.com
- **任务提交表单**: https://你的应用.onrender.com/submit.html
- **管理后台**: https://你的应用.onrender.com/admin.html

## ❓ 常见问题

### Q: 为什么第一次访问很慢？
A: 免费版应用会休眠，首次访问需要唤醒。

### Q: 数据为什么丢失了？
A: 免费版不提供持久化存储，应用重启后数据会重置。

### Q: 如何查看日志？
A: 在 Render 控制台，点击你的服务，然后点击 "Logs" 标签。

### Q: 如何绑定自定义域名？
A: 在服务设置中，找到 "Custom Domain" 选项，添加你的域名。

## 🎉 完成！

你的任务管理系统现在已经部署到互联网上了！
