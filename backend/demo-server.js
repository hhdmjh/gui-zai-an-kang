const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3001; // 演示模式使用 3001 端口
const JWT_SECRET = 'demo_secret_key_2024';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 演示数据库（内存存储）
const demoDB = {
  users: [
    { id: 1, username: 'admin', password: bcrypt.hashSync('123456', 10), role: 'admin' }
  ],
  healthData: [],
  aiReports: []
};

// JWT 中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: '未授权' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token 无效' });
  }
};

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, real_name, phone, email, gender, age } = req.body;
    
    // 检查用户名是否存在
    const existingUser = demoDB.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: demoDB.users.length + 1,
      username,
      password: hashedPassword,
      real_name: real_name || null,
      phone: phone || null,
      email: email || null,
      gender: gender || null,
      age: age || null,
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    demoDB.users.push(newUser);
    
    // 生成 token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '注册成功',
      data: {
        id: newUser.id,
        username: newUser.username,
        token: token
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '注册失败' });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = demoDB.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 生成 token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: user.role,
        token: token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

// 获取当前用户信息
app.get('/api/user/me', authMiddleware, async (req, res) => {
  const user = demoDB.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      age: user.age,
      role: user.role,
      created_at: user.created_at
    }
  });
});

// 获取健康数据
app.get('/api/health-data', authMiddleware, async (req, res) => {
  const userData = demoDB.healthData.filter(d => d.user_id === req.userId);
  res.json({ success: true, data: userData });
});

// 获取今日健康数据
app.get('/api/health-data/today', authMiddleware, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayData = demoDB.healthData.filter(
    d => d.user_id === req.userId && d.record_date === today
  );
  res.json({ success: true, data: todayData });
});

// 提交健康数据
app.post('/api/health-data', authMiddleware, async (req, res) => {
  try {
    const { record_date, systolic, diastolic, blood_sugar, sleep, weight, sport } = req.body;
    
    const newData = {
      id: demoDB.healthData.length + 1,
      user_id: req.userId,
      record_date,
      systolic,
      diastolic,
      blood_sugar,
      sleep,
      weight,
      sport,
      created_at: new Date().toISOString()
    };
    
    demoDB.healthData.push(newData);
    
    res.json({ success: true, message: '数据提交成功', data: newData });
  } catch (error) {
    console.error('提交失败:', error);
    res.status(500).json({ success: false, message: '提交失败' });
  }
});

// 删除健康数据
app.delete('/api/health-data/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const index = demoDB.healthData.findIndex(d => d.id === id && d.user_id === req.userId);
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: '记录不存在' });
  }
  
  demoDB.healthData.splice(index, 1);
  res.json({ success: true, message: '删除成功' });
});

// 获取统计数据
app.get('/api/statistics', authMiddleware, async (req, res) => {
  const userData = demoDB.healthData.filter(d => d.user_id === req.userId);
  
  if (userData.length === 0) {
    return res.json({
      success: true,
      data: {
        total_records: 0,
        averages: null
      }
    });
  }
  
  const totalRecords = userData.length;
  const avgSystolic = userData.reduce((sum, d) => sum + d.systolic, 0) / totalRecords;
  const avgDiastolic = userData.reduce((sum, d) => sum + d.diastolic, 0) / totalRecords;
  const avgBloodSugar = userData.reduce((sum, d) => sum + d.blood_sugar, 0) / totalRecords;
  const avgSleep = userData.reduce((sum, d) => sum + d.sleep, 0) / totalRecords;
  const avgWeight = userData.reduce((sum, d) => sum + d.weight, 0) / totalRecords;
  const avgSport = userData.reduce((sum, d) => sum + d.sport, 0) / totalRecords;
  
  res.json({
    success: true,
    data: {
      total_records: totalRecords,
      averages: {
        avg_systolic: avgSystolic,
        avg_diastolic: avgDiastolic,
        avg_blood_sugar: avgBloodSugar,
        avg_sleep: avgSleep,
        avg_weight: avgWeight,
        avg_sport: avgSport
      }
    }
  });
});

// 保存 AI 报告
app.post('/api/ai-report', authMiddleware, async (req, res) => {
  try {
    const report = {
      id: demoDB.aiReports.length + 1,
      user_id: req.userId,
      ...req.body,
      created_at: new Date().toISOString()
    };
    
    demoDB.aiReports.push(report);
    res.json({ success: true, message: 'AI 报告已保存' });
  } catch (error) {
    console.error('保存失败:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

// 获取最新 AI 报告
app.get('/api/ai-report/latest', authMiddleware, async (req, res) => {
  const userReports = demoDB.aiReports
    .filter(r => r.user_id === req.userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  if (userReports.length === 0) {
    return res.json({ success: false, message: '暂无 AI 报告', data: null });
  }
  
  res.json({ success: true, data: userReports[0] });
});

// 欢迎页面
app.get('/', (req, res) => {
  res.send(`
    <h1>🌿 桂在安康 - 演示模式</h1>
    <p>✅ 服务器运行正常</p>
    <p>📡 不需要 MySQL 数据库</p>
    <p>💾 数据保存在内存中</p>
    <p>🔗 访问：<a href="/login.html">http://localhost:3001/login.html</a></p>
    <p>💡 演示账号：admin / 123456</p>
  `);
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          🌿 桂在安康 - 演示模式启动成功                ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  📡 服务地址：http://localhost:${PORT}`.padEnd(53) + '║');
  console.log('║  💾 数据库：演示模式（无需 MySQL）'.padEnd(53) + '║');
  console.log('║  💡 账号：admin / 123456'.padEnd(53) + '║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});
