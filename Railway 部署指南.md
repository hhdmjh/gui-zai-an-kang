# 🚀 Railway 快速部署指南（5分钟完成）

## 前置准备
- ✅ GitHub 账号（已有）
- ✅ Railway 账号：https://railway.app/

---

## 第一步：创建 Railway 项目

1. **打开 Railway**
   👉 访问：https://railway.app/

2. **登录**
   - 点击 "Start a New Project"
   - 选择 "Log in with GitHub"

3. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"

4. **选择仓库**
   - 选择 `hhdmjh/gui-zai-an-kang`

---

## 第二步：配置数据库

1. **添加 MySQL 数据库**
   - 在项目页面，点击 "+ New"
   - 选择 "Database"
   - 选择 "MySQL"
   - Railway 会自动创建并提供连接信息

2. **记录数据库信息**
   - 点击数据库
   - 找到 "Connection String"
   - 类似：`mysql://username:password@host:port/database`
   - 记下来，后面会用到

---

## 第三步：配置后端环境变量

1. **回到项目主页**
   - 点击 "backend" 服务（或您的项目服务）

2. **添加环境变量**
   - 点击 "Variables" 标签
   - 添加以下变量：

```
PORT=3000
DB_HOST=<从上面获得的 MySQL 主机>
DB_PORT=3306
DB_USER=<MySQL 用户名>
DB_PASSWORD=<MySQL 密码>
DB_NAME=<数据库名，通常是 railway>
JWT_SECRET=gui_zai_an_kang_secret_key_2026
```

3. **点击 "Deploy"**（如果需要）

---

## 第四步：获取公网地址

1. **等待部署完成**
   - Railway 会自动部署
   - 看到绿色 "Deployed" 状态

2. **获取 URL**
   - 在项目页面找到 "Domains" 或 "URL"
   - 类似：`https://gui-zai-an-kang-production.up.railway.app`

3. **记录这个 URL**

---

## 第五步：更新前端 API 地址

现在需要修改前端代码，让它连接到 Railway 后端：

### 方法 1：直接在 GitHub 修改

1. 打开 GitHub 仓库
2. 编辑 `login.html`（同样方法修改其他文件）
3. 找到第 370 行：
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```
4. 改为：
   ```javascript
   const API_BASE_URL = 'https://你的Railway地址/api';
   ```
5. 同样修改：
   - home.html (第 383 行)
   - profile.html (第 341 行)
   - contacts.html (第 162 行)
   - notifications.html (第 128 行)
   - register.html (第 373 行)
   - ai-report.html (第 296 行)

6. 提交更改

---

## 第六步：测试

1. 访问：https://hhdmjh.github.io/gui-zai-an-kang/
2. 登录（admin/123456）
3. 点击"社区服务"
4. ✅ 应该可以正常使用了！

---

## 常见问题

### Q: 数据库连接失败
A: 检查环境变量是否正确，特别是 DB_HOST、DB_USER、DB_PASSWORD

### Q: 前端显示网络错误
A: 确保已更新所有 HTML 文件的 API_BASE_URL

### Q: Railway 需要付费吗？
A: Railway 有免费额度（500小时/月），足够演示使用

---

## 完成！🎉

部署完成后，您的系统就可以通过以下地址访问：
- 前端：https://hhdmjh.github.io/gui-zai-an-kang/
- 后端：https://xxx.railway.app/

评委可以直接在线演示！
