/**
 * Railway 部署专用服务器文件
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库配置
const mysql = require('mysql2/promise');

let db;

async function initDB() {
    try {
        db = await mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gui_zai_an_kang',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('✅ 数据库连接成功');
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        console.log('⚠️  将在首次访问时尝试连接');
    }
}

// 初始化数据库
initDB();

// 健康检查端点
app.get('/health', async (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'disconnected'
    });
});

// API 路由
app.use('/api', require('./routes/api'));

// 静态文件服务（用于 Vercel/Railway 部署）
app.use(express.static(path.join(__dirname, '..')));

// 所有其他路由返回 index.html（SPA 支持）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📍 访问地址：http://localhost:${PORT}`);
    if (process.env.RAILWAY_STATIC_URL) {
        console.log(`🌐 Railway 公网地址：${process.env.RAILWAY_STATIC_URL}`);
    }
});

module.exports = app;
