const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// 验证请求结果
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: '参数验证失败',
      errors: errors.array() 
    });
  }
  next();
};

// 用户注册
router.post('/register', [
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确')
], validateRequest, async (req, res) => {
  try {
    const { username, password, email, phone, real_name, gender, age } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (username, password, email, phone, real_name, gender, age)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [username, hashedPassword, email || null, phone || null, real_name || null, gender || null, age || null]);
    
    res.json({ 
      success: true, 
      message: '注册成功',
      data: { id: result[0].insertId, username }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], validateRequest, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const sql = 'SELECT * FROM users WHERE username = ?';
    const users = await db.query(sql, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取当前用户信息
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const sql = 'SELECT id, username, email, phone, real_name, gender, age, height, avatar, role, created_at FROM users WHERE id = ?';
    const users = await db.query(sql, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新用户信息
router.put('/user/me', authMiddleware, async (req, res) => {
  try {
    const { email, phone, real_name, gender, age, height } = req.body;
    
    const sql = `
      UPDATE users 
      SET email = ?, phone = ?, real_name = ?, gender = ?, age = ?, height = ?
      WHERE id = ?
    `;
    
    await db.query(sql, [email, phone, real_name, gender, age, height, req.user.id]);
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 修改密码
router.post('/user/change-password', authMiddleware, [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少 6 位')
], validateRequest, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const sql = 'SELECT password FROM users WHERE id = ?';
    const users = await db.query(sql, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const isValidPassword = await bcrypt.compare(oldPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '原密码错误' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    await db.query(updateSql, [hashedPassword, req.user.id]);
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取健康数据
router.get('/health-data', authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let sql = 'SELECT * FROM health_data WHERE user_id = ?';
    const params = [req.user.id];
    
    if (start_date) {
      sql += ' AND record_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND record_date <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY record_date DESC';
    
    const data = await db.query(sql, params);
    res.json({ success: true, data });
  } catch (error) {
    console.error('获取健康数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 保存健康数据
router.post('/health-data', authMiddleware, async (req, res) => {
  try {
    const { record_date, systolic, diastolic, blood_sugar, sleep, weight, sport, heart_rate, temperature, oxygen_saturation, mood, note } = req.body;
    
    const sql = `
      INSERT INTO health_data 
      (user_id, record_date, systolic, diastolic, blood_sugar, sleep, weight, sport, heart_rate, temperature, oxygen_saturation, mood, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      systolic = VALUES(systolic),
      diastolic = VALUES(diastolic),
      blood_sugar = VALUES(blood_sugar),
      sleep = VALUES(sleep),
      weight = VALUES(weight),
      sport = VALUES(sport),
      heart_rate = VALUES(heart_rate),
      temperature = VALUES(temperature),
      oxygen_saturation = VALUES(oxygen_saturation),
      mood = VALUES(mood),
      note = VALUES(note)
    `;
    
    await db.query(sql, [req.user.id, record_date, systolic, diastolic, blood_sugar, sleep, weight, sport, heart_rate, temperature, oxygen_saturation, mood, note]);
    
    // 自动检查是否需要预警
    const warnings = checkHealthWarnings({ systolic, diastolic, blood_sugar, sleep, weight });
    if (warnings.length > 0) {
      for (const warning of warnings) {
        await db.query(`
          INSERT INTO warnings (user_id, health_data_id, warning_type, warning_level, warning_value, threshold_value, message)
          VALUES (?, LAST_INSERT_ID(), ?, ?, ?, ?, ?)
        `, [req.user.id, warning.type, warning.level, warning.value, warning.threshold, warning.message]);
      }
    }
    
    res.json({ success: true, message: '数据保存成功' });
  } catch (error) {
    console.error('保存健康数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 健康预警检查
function checkHealthWarnings(data) {
  const warnings = [];
  
  if (data.systolic && data.systolic >= 140) {
    warnings.push({
      type: '收缩压偏高',
      level: 'high',
      value: data.systolic,
      threshold: 140,
      message: `收缩压 ${data.systolic} mmHg，高于正常值 140 mmHg`
    });
  }
  
  if (data.diastolic && data.diastolic >= 90) {
    warnings.push({
      type: '舒张压偏高',
      level: 'high',
      value: data.diastolic,
      threshold: 90,
      message: `舒张压 ${data.diastolic} mmHg，高于正常值 90 mmHg`
    });
  }
  
  if (data.blood_sugar && data.blood_sugar >= 7.0) {
    warnings.push({
      type: '血糖偏高',
      level: 'high',
      value: data.blood_sugar,
      threshold: 7.0,
      message: `血糖 ${data.blood_sugar} mmol/L，高于正常值 7.0 mmol/L`
    });
  }
  
  if (data.sleep && data.sleep < 6) {
    warnings.push({
      type: '睡眠不足',
      level: 'medium',
      value: data.sleep,
      threshold: 6,
      message: `睡眠 ${data.sleep} 小时，低于推荐值 6 小时`
    });
  }
  
  return warnings;
}

// 删除健康数据
router.delete('/health-data/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM health_data WHERE id = ? AND user_id = ?';
    const result = await db.query(sql, [id, req.user.id]);
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ success: false, message: '数据不存在' });
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除健康数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取预警记录
router.get('/warnings', authMiddleware, async (req, res) => {
  try {
    const { is_read } = req.query;
    let sql = 'SELECT * FROM warnings WHERE user_id = ?';
    const params = [req.user.id];
    
    if (is_read !== undefined) {
      sql += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const data = await db.query(sql, params);
    res.json({ success: true, data });
  } catch (error) {
    console.error('获取预警记录失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 标记预警为已读
router.put('/warnings/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'UPDATE warnings SET is_read = TRUE WHERE id = ? AND user_id = ?';
    await db.query(sql, [id, req.user.id]);
    res.json({ success: true, message: '已标记为已读' });
  } catch (error) {
    console.error('标记预警失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取预约记录
router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const sql = 'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC';
    const data = await db.query(sql, [req.user.id]);
    res.json({ success: true, data });
  } catch (error) {
    console.error('获取预约记录失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建预约
router.post('/appointments', authMiddleware, [
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('phone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('appointment_date').isDate().withMessage('预约日期格式不正确'),
  body('appointment_time').notEmpty().withMessage('预约时间不能为空'),
  body('address').notEmpty().withMessage('地址不能为空')
], validateRequest, async (req, res) => {
  try {
    const { name, phone, appointment_date, appointment_time, address, remark, service_type } = req.body;
    
    const sql = `
      INSERT INTO appointments 
      (user_id, name, phone, appointment_date, appointment_time, address, remark, service_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [req.user.id, name, phone, appointment_date, appointment_time, address, remark, service_type]);
    res.json({ 
      success: true, 
      message: '预约成功',
      data: { id: result[0].insertId }
    });
  } catch (error) {
    console.error('创建预约失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 取消预约
router.delete('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'UPDATE appointments SET status = ? WHERE id = ? AND user_id = ?';
    await db.query(sql, ['已取消', id, req.user.id]);
    res.json({ success: true, message: '预约已取消' });
  } catch (error) {
    console.error('取消预约失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取健康知识列表
router.get('/knowledge', async (req, res) => {
  try {
    const { category, is_featured } = req.query;
    let sql = 'SELECT * FROM knowledge_articles WHERE 1=1';
    const params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (is_featured) {
      sql += ' AND is_featured = TRUE';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const data = await db.query(sql, params);
    res.json({ success: true, data });
  } catch (error) {
    console.error('获取知识列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取知识详情
router.get('/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 增加阅读量
    await db.query('UPDATE knowledge_articles SET views = views + 1 WHERE id = ?', [id]);
    
    const sql = 'SELECT * FROM knowledge_articles WHERE id = ?';
    const articles = await db.query(sql, [id]);
    
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }
    
    res.json({ success: true, data: articles[0] });
  } catch (error) {
    console.error('获取知识详情失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取社区活动列表
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const sql = 'SELECT * FROM community_events WHERE status = ? ORDER BY event_date ASC';
    const data = await db.query(sql, ['active']);
    res.json({ success: true, data });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 报名参加活动
router.post('/events/:id/register', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查活动是否存在且有人数限制
    const events = await db.query('SELECT * FROM community_events WHERE id = ?', [id]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    
    const event = events[0];
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return res.status(400).json({ success: false, message: '活动已满员' });
    }
    
    // 检查是否已报名
    const existing = await db.query('SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?', [id, req.user.id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '您已报名该活动' });
    }
    
    // 插入报名记录
    await db.query('INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)', [id, req.user.id]);
    
    // 更新活动参与人数
    await db.query('UPDATE community_events SET current_participants = current_participants + 1 WHERE id = ?', [id]);
    
    res.json({ success: true, message: '报名成功' });
  } catch (error) {
    console.error('报名活动失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取统计数据
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let dateFilter = '';
    const params = [req.user.id];
    
    if (start_date && end_date) {
      dateFilter = 'AND record_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    // 获取最新记录
    const latestSql = `SELECT * FROM health_data WHERE user_id = ? ${dateFilter} ORDER BY record_date DESC LIMIT 1`;
    const latest = await db.query(latestSql, params);
    
    // 获取平均值
    const avgSql = `
      SELECT 
        AVG(systolic) as avg_systolic,
        AVG(diastolic) as avg_diastolic,
        AVG(blood_sugar) as avg_blood_sugar,
        AVG(sleep) as avg_sleep,
        AVG(weight) as avg_weight,
        AVG(sport) as avg_sport
      FROM health_data 
      WHERE user_id = ? ${dateFilter}
    `;
    const averages = await db.query(avgSql, params);
    
    // 获取记录总数
    const countSql = `SELECT COUNT(*) as total FROM health_data WHERE user_id = ? ${dateFilter}`;
    const count = await db.query(countSql, params);
    
    res.json({
      success: true,
      data: {
        latest: latest[0] || null,
        averages: averages[0],
        total_records: count[0].total
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 保存 AI 健康建议
router.post('/ai-report', validateRequest, authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      report_date, scores, averages, suggestions, 
      warning_suggestions, trend_analysis 
    } = req.body;
    
    const sql = `
      INSERT INTO ai_health_reports 
      (user_id, report_date, overall_score, bp_score, sugar_score, lifestyle_score,
       avg_systolic, avg_diastolic, avg_blood_sugar, avg_sleep, avg_weight, avg_sport,
       suggestions, warning_suggestions, trend_analysis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(sql, [
      userId,
      report_date,
      scores.overall,
      scores.bp,
      scores.sugar,
      scores.lifestyle,
      averages.systolic,
      averages.diastolic,
      averages.bloodSugar,
      averages.sleep,
      averages.weight,
      averages.sport,
      JSON.stringify(suggestions),
      JSON.stringify(warning_suggestions),
      JSON.stringify(trend_analysis)
    ]);
    
    res.json({ success: true, message: 'AI 报告已保存' });
  } catch (error) {
    console.error('保存 AI 报告失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取用户最新的 AI 健康建议
router.get('/ai-report/latest', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const sql = `
      SELECT * FROM ai_health_reports 
      WHERE user_id = ? 
      ORDER BY report_date DESC 
      LIMIT 1
    `;
    
    const reports = await db.query(sql, [userId]);
    
    if (reports.length > 0) {
      const report = reports[0];
      res.json({
        success: true,
        data: {
          ...report,
          suggestions: JSON.parse(report.suggestions),
          warning_suggestions: JSON.parse(report.warning_suggestions),
          trend_analysis: JSON.parse(report.trend_analysis)
        }
      });
    } else {
      res.json({
        success: false,
        message: '暂无 AI 报告',
        data: null
      });
    }
  } catch (error) {
    console.error('获取 AI 报告失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
