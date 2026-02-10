# Cyclic 部署指南（无需信用卡）

## ✅ Cyclic 优势
- ✅ **完全免费**：无需信用卡
- ✅ **一键部署**：从 GitHub 直接部署
- ✅ **自动 HTTPS**：免费 SSL 证书
- ✅ **快速启动**：不会休眠
- ✅ **简单易用**：零配置

## 🚀 部署步骤

### 步骤 1: 访问 Cyclic
打开浏览器: https://cyclic.sh

### 步骤 2: 用 GitHub 登录
1. 点击 "Deploy Now" 或 "Sign In"
2. 选择 "Continue with GitHub"
3. 授权 Cyclic 访问你的 GitHub

### 步骤 3: 连接仓库
1. 点击 "Link Your Own"
2. 在搜索框输入 `task-management-system`
3. 点击 "Connect"

### 步骤 4: 自动部署
Cyclic 会自动：
- 检测 Node.js 项目
- 安装依赖（npm install）
- 启动应用（npm start）
- 生成公开 URL

### 步骤 5: 获取 URL
部署完成后，Cyclic 会显示你的应用 URL：
```
https://你的应用名.cyclic.app
```

### 步骤 6: 访问应用
点击 URL 即可访问！

---

## 📱 访问地址

- **主页**: `https://你的应用.cyclic.app`
- **任务提交**: `https://你的应用.cyclic.app/submit.html`
- **管理后台**: `https://你的应用.cyclic.app/admin.html`

## 🔑 默认账号
- 用户名: `admin`
- 密码: `admin123`

---

## 💡 Cyclic 特点

### 免费计划包含：
- ✅ 无限应用数量
- ✅ 自动 HTTPS
- ✅ 自定义域名
- ✅ 环境变量
- ✅ 实时日志
- ✅ 不会休眠

### 限制：
- ⚠️ 数据库使用 AWS DynamoDB（需要适配）
- ⚠️ SQLite 文件会在重启时重置
- ⚠️ 每月有请求数限制（对小型应用足够）

---

## 🔄 自动部署

每次推送代码到 GitHub，Cyclic 会自动重新部署：

```bash
git add .
git commit -m "更新内容"
git push origin main
```

---

## 📊 监控和管理

在 Cyclic 控制台可以：
- 查看实时日志
- 监控请求统计
- 设置环境变量
- 管理自定义域名
- 查看部署历史

---

## ⚙️ 环境变量

如果需要设置环境变量：
1. 在 Cyclic 控制台点击你的应用
2. 点击 "Variables" 标签
3. 添加变量（PORT 会自动设置）

---

## 🎯 与其他平台对比

| 特性 | Cyclic | Railway | Render |
|------|--------|---------|--------|
| 需要信用卡 | ❌ 不需要 | ❌ 不需要 | ✅ 需要 |
| 部署速度 | ⚡ 很快 | ⚡ 快 | 🐢 较慢 |
| 自动休眠 | ❌ 不休眠 | ❌ 不休眠 | ✅ 会休眠 |
| SQLite持久化 | ⚠️ 不持久 | ✅ 持久 | ⚠️ 不持久 |
| 自定义域名 | ✅ 免费 | ✅ 免费 | ✅ 免费 |
| 配置难度 | ⭐ 简单 | ⭐⭐ 简单 | ⭐⭐ 简单 |

---

## ❓ 常见问题

### Q: Cyclic 真的完全免费吗？
A: 是的！无需信用卡，只需 GitHub 账号。

### Q: 数据会丢失吗？
A: SQLite 数据在应用重启时会重置。如需持久化，建议使用 Railway。

### Q: 有请求数限制吗？
A: 有，但对小型应用来说足够使用。

### Q: 可以绑定自定义域名吗？
A: 可以！在应用设置中添加自定义域名。

### Q: 应用会休眠吗？
A: 不会！Cyclic 的应用不会自动休眠。

---

## 🎉 开始部署

现在就访问 https://cyclic.sh 开始部署吧！

只需要 2 分钟！
