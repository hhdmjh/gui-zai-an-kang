const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gui_zai_an_kang_secret_2024_production';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '..')));

// 内存数据库
const db = {
  users: [],
  healthData: [],
  aiReports: [],
  appointments: [],
  warnings: [],
  knowledgeArticles: [],
  communityEvents: [],
  eventRegistrations: []
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

// 健康检查 API
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// 用户注册 API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, real_name, phone, email, gender, age } = req.body;
    
    const existingUser = db.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: db.users.length + 1,
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
    
    db.users.push(newUser);
    
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

// 用户登录 API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
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
        token: token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

// 获取用户信息（两个端点都支持）
app.get('/api/user/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);
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

// 获取用户信息
app.get('/api/user/profile', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);
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

// 更新用户信息
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  const user = db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  const { real_name, phone, email, gender, age, password } = req.body;
  
  if (real_name) user.real_name = real_name;
  if (phone) user.phone = phone;
  if (email) user.email = email;
  if (gender) user.gender = gender;
  if (age) user.age = age;
  
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  
  res.json({
    success: true,
    message: '更新成功',
    data: user
  });
});

// 保存健康数据
app.post('/api/health-data', authMiddleware, (req, res) => {
  try {
    // 支持两种字段名格式
    const systolic = req.body.systolic || req.body.blood_pressure_systolic;
    const diastolic = req.body.diastolic || req.body.blood_pressure_diastolic;
    const bloodSugar = req.body.blood_sugar || req.body.bloodSugar;
    const weight = req.body.weight;
    const sleep = req.body.sleep || req.body.sleep_hours;
    const sport = req.body.sport || req.body.sport_minutes;
    // 使用前端传来的日期，如果没有则使用当前日期
    const recordDate = req.body.record_date || new Date().toISOString().split('T')[0];
    
    const newRecord = {
      id: db.healthData.length + 1,
      user_id: req.userId,
      record_date: recordDate,
      systolic: systolic ? parseFloat(systolic) : null,
      diastolic: diastolic ? parseFloat(diastolic) : null,
      blood_sugar: bloodSugar ? parseFloat(bloodSugar) : null,
      weight: weight ? parseFloat(weight) : null,
      sleep: sleep ? parseFloat(sleep) : null,
      sport: sport ? parseInt(sport) : null,
      created_at: new Date().toISOString()
    };
    
    db.healthData.push(newRecord);
    
    res.json({
      success: true,
      message: '保存成功',
      data: newRecord
    });
  } catch (error) {
    console.error('保存健康数据失败:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

// 获取健康数据
app.get('/api/health-data', authMiddleware, (req, res) => {
  const userRecords = db.healthData.filter(r => r.user_id === req.userId);
  
  // 转换为前端期望的格式
  const formattedData = userRecords.map(item => ({
    record_date: item.record_date,
    systolic: item.systolic,
    diastolic: item.diastolic,
    blood_sugar: item.blood_sugar,
    sleep: item.sleep,
    weight: item.weight,
    sport: item.sport
  }));
  
  res.json({
    success: true,
    data: formattedData
  });
});

// 删除健康数据
app.delete('/api/health-data/:id', authMiddleware, (req, res) => {
  const recordIndex = db.healthData.findIndex(r => r.id === parseInt(req.params.id) && r.user_id === req.userId);
  
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, message: '记录不存在' });
  }
  
  db.healthData.splice(recordIndex, 1);
  
  res.json({
    success: true,
    message: '删除成功'
  });
});

// 获取今日健康数据
app.get('/api/health-data/today', authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const userRecords = db.healthData.filter(r => r.user_id === req.userId && r.record_date === today);
  
  const formattedData = userRecords.map(item => ({
    id: item.id,
    record_date: item.record_date,
    systolic: item.systolic,
    diastolic: item.diastolic,
    blood_sugar: item.blood_sugar,
    sleep: item.sleep,
    weight: item.weight,
    sport: item.sport
  }));
  
  res.json({
    success: true,
    data: formattedData
  });
});

// 批量删除健康数据
app.delete('/api/health-data', authMiddleware, (req, res) => {
  const userRecords = db.healthData.filter(r => r.user_id === req.userId);
  
  if (userRecords.length === 0) {
    return res.status(404).json({ success: false, message: '暂无数据可删除' });
  }
  
  // 删除该用户的所有记录
  db.healthData = db.healthData.filter(r => r.user_id !== req.userId);
  
  res.json({
    success: true,
    message: '删除成功',
    deletedCount: userRecords.length
  });
});

// 联系人管理
const contacts = [];

// 添加联系人
app.post('/api/contacts', authMiddleware, (req, res) => {
  const { contact_username, relation } = req.body;
  
  // 检查联系人是否已存在
  const existing = contacts.find(c => 
    c.user_id === req.userId && c.contact_username === contact_username
  );
  
  if (existing) {
    return res.status(400).json({ success: false, message: '联系人已存在' });
  }
  
  const newContact = {
    id: contacts.length + 1,
    user_id: req.userId,
    contact_username,
    relation: relation || null,
    created_at: new Date().toISOString()
  };
  
  contacts.push(newContact);
  
  res.json({
    success: true,
    message: '添加成功',
    data: newContact
  });
});

// 获取联系人列表
app.get('/api/contacts', authMiddleware, (req, res) => {
  const userContacts = contacts.filter(c => c.user_id === req.userId);
  
  res.json({
    success: true,
    data: userContacts
  });
});

// 删除联系人
app.delete('/api/contacts/:id', authMiddleware, (req, res) => {
  const contactIndex = contacts.findIndex(c => 
    c.id === parseInt(req.params.id) && c.user_id === req.userId
  );
  
  if (contactIndex === -1) {
    return res.status(404).json({ success: false, message: '联系人不存在' });
  }
  
  contacts.splice(contactIndex, 1);
  
  res.json({
    success: true,
    message: '删除成功'
  });
});

// 消息通知
const notifications = [];

// 发送通知
app.post('/api/notifications', authMiddleware, (req, res) => {
  const { to_username, type, title, message, data } = req.body;
  
  // 检查接收用户是否存在
  const targetUser = db.users.find(u => u.username === to_username);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  const sender = db.users.find(u => u.id === req.userId);
  
  const newNotification = {
    id: notifications.length + 1,
    from_user_id: req.userId,
    from_username: sender.username,
    to_user_id: targetUser.id,
    to_username,
    type,
    title,
    message,
    data: data || null,
    is_read: false,
    created_at: new Date().toISOString()
  };
  
  notifications.push(newNotification);
  
  res.json({
    success: true,
    message: '发送成功',
    data: newNotification
  });
});

// 获取我的通知
app.get('/api/notifications', authMiddleware, (req, res) => {
  const userNotifications = notifications.filter(n => n.to_user_id === req.userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    data: userNotifications
  });
});

// 标记通知为已读
app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const notification = notifications.find(n => 
    n.id === parseInt(req.params.id) && n.to_user_id === req.userId
  );
  
  if (!notification) {
    return res.status(404).json({ success: false, message: '通知不存在' });
  }
  
  notification.is_read = true;
  
  res.json({
    success: true,
    message: '已标记为已读'
  });
});

// 获取未读通知数量
app.get('/api/notifications/unread-count', authMiddleware, (req, res) => {
  const unreadCount = notifications.filter(n => 
    n.to_user_id === req.userId && !n.is_read
  ).length;
  
  res.json({
    success: true,
    data: { count: unreadCount }
  });
});

// 获取统计数据
app.get('/api/statistics', authMiddleware, (req, res) => {
  const userRecords = db.healthData.filter(r => r.user_id === req.userId);
  
  const totalRecords = userRecords.length;
  
  // 计算平均值
  const averages = {
    avg_systolic: 0,
    avg_diastolic: 0,
    avg_blood_sugar: 0,
    avg_sleep: 0,
    avg_weight: 0,
    avg_sport: 0
  };
  
  if (totalRecords > 0) {
    averages.avg_systolic = userRecords.reduce((sum, r) => sum + (r.systolic || 0), 0) / totalRecords;
    averages.avg_diastolic = userRecords.reduce((sum, r) => sum + (r.diastolic || 0), 0) / totalRecords;
    averages.avg_blood_sugar = userRecords.reduce((sum, r) => sum + (r.blood_sugar || 0), 0) / totalRecords;
    averages.avg_sleep = userRecords.reduce((sum, r) => sum + (r.sleep || 0), 0) / totalRecords;
    averages.avg_weight = userRecords.reduce((sum, r) => sum + (r.weight || 0), 0) / totalRecords;
    averages.avg_sport = userRecords.reduce((sum, r) => sum + (r.sport || 0), 0) / totalRecords;
  }
  
  res.json({
    success: true,
    data: {
      total_records: totalRecords,
      averages: averages
    }
  });
});

// 生成 AI 健康报告
app.post('/api/ai-report', authMiddleware, (req, res) => {
  try {
    const { healthData } = req.body;
    
    const recordCount = healthData.length;
    const avgSleep = healthData.reduce((sum, r) => sum + (r.sleep || 0), 0) / recordCount;
    const avgSport = healthData.reduce((sum, r) => sum + (r.sport || 0), 0) / recordCount;
    const avgBloodPressureS = healthData.reduce((sum, r) => sum + (r.systolic || 0), 0) / recordCount;
    const avgBloodPressureD = healthData.reduce((sum, r) => sum + (r.diastolic || 0), 0) / recordCount;
    const avgBloodSugar = healthData.reduce((sum, r) => sum + (r.blood_sugar || 0), 0) / recordCount;
    const avgWeight = healthData.reduce((sum, r) => sum + (r.weight || 0), 0) / recordCount;
    
    let healthScore = 100;
    
    if (avgSleep < 6) healthScore -= 15;
    else if (avgSleep > 8) healthScore -= 5;
    
    if (avgSport < 30) healthScore -= 20;
    else if (avgSport < 60) healthScore -= 10;
    
    if (avgBloodPressureS > 140 || avgBloodPressureD > 90) healthScore -= 20;
    else if (avgBloodPressureS > 120 || avgBloodPressureD > 80) healthScore -= 10;
    
    if (avgBloodSugar > 6.1) healthScore -= 15;
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    const suggestions = [];
    
    if (avgSleep < 7) {
      suggestions.push('建议保证每天 7-8 小时的睡眠，有助于身体恢复和免疫力提升。');
    }
    
    if (avgSport < 30) {
      suggestions.push('建议增加运动量，每天至少 30 分钟中等强度运动，如快走、慢跑等。');
    }
    
    if (avgBloodPressureS > 120) {
      suggestions.push('血压偏高，建议减少盐分摄入，保持心情舒畅，定期监测血压。');
    }
    
    if (avgBloodSugar > 5.5) {
      suggestions.push('血糖偏高，建议控制饮食，减少糖分摄入，多吃蔬菜。');
    }
    
    if (avgWeight > 75) {
      suggestions.push('体重略高，建议合理饮食搭配运动，保持健康体重。');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('您的健康状况良好，请继续保持良好的生活习惯！');
    }
    
    const report = {
      id: db.aiReports.length + 1,
      user_id: req.userId,
      health_score: healthScore,
      avg_sleep: avgSleep.toFixed(1),
      avg_sport: avgSport.toFixed(1),
      avg_blood_pressure_s: avgBloodPressureS.toFixed(0),
      avg_blood_pressure_d: avgBloodPressureD.toFixed(0),
      avg_blood_sugar: avgBloodSugar.toFixed(1),
      avg_weight: avgWeight.toFixed(1),
      suggestions: suggestions,
      created_at: new Date().toISOString()
    };
    
    db.aiReports.push(report);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('生成 AI 报告失败:', error);
    res.status(500).json({ success: false, message: '生成报告失败' });
  }
});

// 获取 AI 报告
app.get('/api/ai-report/latest', authMiddleware, (req, res) => {
  const userReports = db.aiReports.filter(r => r.user_id === req.userId);
  
  if (userReports.length === 0) {
    return res.status(404).json({ success: false, message: '暂无健康报告' });
  }
  
  const latestReport = userReports[userReports.length - 1];
  
  res.json({
    success: true,
    data: latestReport
  });
});

// 获取健康知识库
app.get('/api/knowledge', (req, res) => {
  const articles = db.knowledgeArticles;
  res.json({
    success: true,
    data: articles
  });
});

// 获取社区活动
app.get('/api/events', (req, res) => {
  const events = db.communityEvents;
  res.json({
    success: true,
    data: events
  });
});

// 报名活动
app.post('/api/events/:id/register', authMiddleware, (req, res) => {
  const registration = {
    id: db.eventRegistrations.length + 1,
    user_id: req.userId,
    event_id: parseInt(req.params.id),
    created_at: new Date().toISOString()
  };
  
  db.eventRegistrations.push(registration);
  
  res.json({
    success: true,
    message: '报名成功',
    data: registration
  });
});

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 登录页
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// 注册页
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'register.html'));
});

// 主页
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'home.html'));
});

// 个人中心
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'profile.html'));
});

// AI 报告
app.get('/ai-report', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'ai-report.html'));
});

// 健康知识库
app.get('/knowledge', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'knowledge.html'));
});

// 社区活动
app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'community.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================');
  console.log('✅ 桂在安康 - 健康管理系统已启动');
  console.log('========================================');
  console.log(`🌐 本地访问：http://localhost:${PORT}`);
  console.log(`📱 局域网访问：http://你的IP:${PORT}`);
  console.log(`🔗 API 测试：http://localhost:${PORT}/api/health`);
  console.log('========================================\n');
  console.log('💡 提示：');
  console.log('1. 在浏览器打开 http://localhost:' + PORT);
  console.log('2. 如果要让外网访问，请使用内网穿透工具');
  console.log('   推荐：ngrok, localtunnel, 或 cpolar');
  console.log('========================================\n');
});
