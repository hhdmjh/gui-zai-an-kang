# 桂在安康 - 后端服务安装指南

## 📦 技术栈

- **Node.js** v24.14.1+ (JavaScript 运行时)
- **Express** v4.18.2 (Web 框架)
- **MySQL** v8.0+ (数据库)
- **mysql2** v3.6.5 (MySQL 驱动)

## 🚀 安装步骤

### 步骤 1：安装 Node.js

#### 方法一：使用安装包（推荐）
1. 访问 Node.js 官网：https://nodejs.org/
2. 下载 LTS（长期支持）版本
3. 运行安装程序，一路点击"Next"即可
4. 安装完成后，打开命令提示符，输入：
   ```bash
   node --version
   npm --version
   ```
   如果显示版本号，说明安装成功

#### 方法二：使用 winget（已启动）
```bash
winget install OpenJS.NodeJS.LTS
```

### 步骤 2：安装 MySQL 数据库

#### 方法一：MySQL 官方安装
1. 访问 MySQL 官网：https://dev.mysql.com/downloads/mysql/
2. 下载 MySQL Installer for Windows
3. 运行安装程序，选择"Developer Default"
4. 设置 root 密码（请记住这个密码）
5. 完成安装

#### 方法二：使用 XAMPP（简单）
1. 访问：https://www.apachefriends.org/
2. 下载 XAMPP
3. 安装后启动 Apache 和 MySQL

### 步骤 3：配置环境变量

1. 复制 `backend/.env.example` 为 `.env`
   ```bash
   cd backend
   copy .env.example .env
   ```

2. 编辑 `.env` 文件，修改数据库配置：
   ```env
   # MySQL 数据库配置
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=你的 MySQL 密码
   DB_NAME=gui_zai_an_kang
   ```

### 步骤 4：安装项目依赖

在 `backend` 目录下运行：
```bash
cd backend
npm install
```

这会安装以下依赖包：
- express
- mysql2
- cors
- body-parser
- dotenv
- nodemon (开发工具)

### 步骤 5：初始化数据库

确保 MySQL 服务已启动，然后运行：
```bash
npm run init-db
```

这会：
- 创建数据库 `gui_zai_an_kang`
- 创建用户表、健康数据表、预约记录表
- 插入默认用户 (admin/123456)

### 步骤 6：启动后端服务

```bash
npm start
```

如果看到以下信息，说明启动成功：
```
╔════════════════════════════════════════════════════════╗
║          🌿 桂在安康 - 后端服务启动成功                ║
╠════════════════════════════════════════════════════════╣
║  📡 服务地址：http://localhost:3000
║  📊 API 文档：http://localhost:3000/api
║  💾 数据库：MySQL
╚════════════════════════════════════════════════════════╝
```

## 🔧 前端配置

### 将后端 API 集成到前端

1. 在 `home.html`、`loogin.html`、`community.html` 的 `<head>` 标签中添加：
   ```html
   <script src="backend/api-client.js"></script>
   ```

2. 修改 `home.html` 中的数据保存逻辑：
   ```javascript
   // 原来的代码
   localStorage.setItem('healthData', JSON.stringify(healthData));
   
   // 修改为
   await SyncManager.saveHealthData(newData);
   ```

3. 修改数据获取逻辑：
   ```javascript
   // 原来的代码
   let healthData = JSON.parse(localStorage.getItem('healthData')) || [];
   
   // 修改为
   let healthData = await SyncManager.getHealthData();
   ```

## 📝 API 接口说明

### 用户登录
```
POST /api/login
Body: { "username": "admin", "password": "123456" }
```

### 获取健康数据
```
GET /api/health-data?user_id=1
```

### 保存健康数据
```
POST /api/health-data
Body: {
  "user_id": 1,
  "record_date": "2024-04-08",
  "systolic": 120,
  "diastolic": 80,
  "blood_sugar": 5.6,
  "sleep": 7,
  "weight": 101,
  "sport": 40
}
```

### 获取预约记录
```
GET /api/appointments?user_id=1
```

### 创建预约
```
POST /api/appointments
Body: {
  "user_id": 1,
  "name": "张三",
  "phone": "13800138000",
  "appointment_date": "2024-04-10",
  "appointment_time": "上午 9:00-11:00",
  "address": "南宁市青秀区 XX 路 XX 号",
  "remark": "备注"
}
```

## 🐛 常见问题

### 1. Node.js 安装失败
- 以管理员身份运行安装程序
- 关闭杀毒软件后重试
- 重启电脑后再安装

### 2. MySQL 连接失败
- 检查 MySQL 服务是否启动
- 确认用户名密码正确
- 检查防火墙设置

### 3. 端口被占用
修改 `.env` 文件中的端口号：
```env
PORT=3001
```

### 4. npm install 失败
- 检查网络连接
- 使用淘宝镜像：
  ```bash
  npm config set registry https://registry.npmmirror.com
  npm install
  ```

## ✅ 验证安装

1. 访问 http://localhost:3000 查看后端服务状态
2. 访问 http://localhost:3000/api/health 检查数据库连接
3. 使用 Postman 或浏览器测试 API 接口

## 🎯 下一步

安装完成后，可以：
1. 修改前端代码，使用后端 API 替代 LocalStorage
2. 添加用户认证功能（JWT）
3. 添加数据导出功能
4. 部署到服务器

## 📞 技术支持

如有问题，请检查：
1. Node.js 版本 >= 14
2. MySQL 服务是否运行
3. `.env` 配置是否正确
4. 端口是否被占用
