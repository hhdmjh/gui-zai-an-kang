# 桂在安康 - 后端部署指南

## 🚀 快速部署到 Railway

### 步骤 1: 准备 GitHub 仓库

1. 打开 https://github.com
2. 创建新仓库 `gui-an-kang`
3. 将整个项目推送到 GitHub

### 步骤 2: 部署到 Railway

1. 访问 https://railway.app
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `gui-an-kang` 仓库
6. Railway 会自动检测并部署

### 步骤 3: 配置环境变量

在 Railway 面板中，点击 "Variables"，添加：

```
PORT=3000
JWT_SECRET=your-secret-key-2024
NODE_ENV=production
```

### 步骤 4: 获取访问地址

部署成功后，Railway 会提供：
- 公网访问地址：`https://gui-an-kang-production.up.railway.app`
- API 地址：`https://gui-an-kang-production.up.railway.app/api`

## 📝 修改前端 API 地址

修改前端文件中的 API_BASE_URL：

```javascript
const API_BASE_URL = 'https://gui-an-kang-production.up.railway.app/api';
```

需要修改的文件：
- home.html
- community.html
- profile.html
- contacts.html
- notifications.html

## 🎯 本地测试

### 安装依赖
```bash
cd backend
npm install
```

### 启动服务
```bash
npm start
```

### 访问
- 前端：http://localhost:3000
- API: http://localhost:3000/api

## 📊 数据库说明

使用 SQLite 数据库，自动创建以下表：
- users - 用户表
- health_data - 健康数据表
- appointments - 预约记录表
- contacts - 联系人表
- notifications - 通知表

## 🔐 API 接口

### 用户相关
- POST /api/register - 用户注册
- POST /api/login - 用户登录
- GET /api/user/me - 获取用户信息
- PUT /api/user/me - 更新用户信息
- POST /api/user/change-password - 修改密码

### 健康数据
- GET /api/health-data - 获取健康数据
- POST /api/health-data - 添加健康数据
- PUT /api/health-data/:id - 更新健康数据
- DELETE /api/health-data/:id - 删除健康数据

### 联系人
- GET /api/contacts - 获取联系人
- POST /api/contacts - 添加联系人
- DELETE /api/contacts/:id - 删除联系人

### 通知
- GET /api/notifications - 获取通知
- POST /api/notifications - 发送通知
- PUT /api/notifications/:id/read - 标记已读

### 预约
- GET /api/appointments - 获取预约
- POST /api/appointments - 创建预约

## 💡 测试账号

注册后即可使用，或创建测试账号：
- 用户名：test123
- 密码：123456

## 🌐 访问网址

部署后提供：
1. GitHub Pages 网址
2. Railway 后端地址
3. 二维码
