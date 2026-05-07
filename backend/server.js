const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const db = require('./database/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析 JSON 请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码请求体

// 静态文件服务（前端页面）
app.use(express.static('../'));

// API 路由
app.use('/api', apiRoutes);

// 欢迎页面路由
app.get('/', (req, res) => {
  res.send(`
    <h1>桂在安康 - 后端服务</h1>
    <p>✅ 服务器运行正常</p>
    <p>📡 API 接口地址：/api</p>
    <p>📊 可用接口：</p>
    <ul>
      <li>GET /api/health-data - 获取健康数据</li>
      <li>POST /api/health-data - 保存健康数据</li>
      <li>DELETE /api/health-data/:id - 删除健康数据</li>
      <li>POST /api/login - 用户登录</li>
      <li>GET /api/appointments - 获取预约记录</li>
      <li>POST /api/appointments - 创建预约</li>
    </ul>
  `);
});

// 健康检查接口
app.get('/api/health', async (req, res) => {
  const dbConnected = await db.testConnection();
  res.json({
    success: true,
    message: '服务运行正常',
    database: dbConnected ? '已连接' : '未连接',
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          🌿 桂在安康 - 后端服务启动成功                ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  📡 服务地址：http://localhost:${PORT}`.padEnd(53) + '║');
  console.log('║  📊 API 文档：http://localhost:' + PORT + '/api'.padEnd(53) + '║');
  console.log('║  💾 数据库：MySQL'.padEnd(53) + '║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});
