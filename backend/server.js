const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gui-an-kang-secret-key-2024';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// 数据库
let db;

// 初始化数据库
async function initDatabase() {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    
    // 创建表
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            real_name TEXT,
            phone TEXT,
            email TEXT,
            gender TEXT,
            age INTEGER,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS health_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            systolic INTEGER,
            diastolic INTEGER,
            blood_sugar REAL,
            sleep REAL,
            weight REAL,
            sport INTEGER,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            hospital TEXT NOT NULL,
            department TEXT NOT NULL,
            doctor TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            contact_username TEXT NOT NULL,
            relation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_username TEXT,
            to_username TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            data TEXT,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_health_user ON health_data(user_id);
        CREATE INDEX IF NOT EXISTS idx_health_date ON health_data(date);
        CREATE INDEX IF NOT EXISTS idx_notifications_to ON notifications(to_username);
    `);
    
    console.log('✅ 数据库初始化成功');
}

// JWT 验证中间件
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: '未授权' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token 无效' });
    }
}

// 用户注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码必填' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
            'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
            [username, hashedPassword, name || username]
        );
        
        const result = db.exec('SELECT last_insert_rowid() as id');
        const userId = result[0].values[0][0];
        
        res.json({ success: true, message: '注册成功', userId });
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ success: false, message: '用户名已存在' });
        }
        res.status(500).json({ success: false, message: '注册失败：' + error.message });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!result.length || result[0].values.length === 0) {
            return res.status(400).json({ success: false, message: '用户名或密码错误' });
        }
        
        const columns = result[0].columns;
        const values = result[0].values[0];
        const user = {};
        columns.forEach((col, i) => user[col] = values[i]);
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: '用户名或密码错误' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                real_name: user.real_name,
                phone: user.phone,
                email: user.email,
                gender: user.gender,
                age: user.age,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: '登录失败：' + error.message });
    }
});

// 获取用户信息
app.get('/api/user/me', authMiddleware, (req, res) => {
    try {
        const result = db.exec('SELECT * FROM users WHERE id = ?', [req.user.id]);
        
        if (!result.length || result[0].values.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }
        
        const columns = result[0].columns;
        const values = result[0].values[0];
        const user = {};
        columns.forEach((col, i) => user[col] = values[i]);
        
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                real_name: user.real_name,
                phone: user.phone,
                email: user.email,
                gender: user.gender,
                age: user.age,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取失败：' + error.message });
    }
});

// 更新用户信息
app.put('/api/user/me', authMiddleware, (req, res) => {
    try {
        const { real_name, phone, email, gender, age } = req.body;
        
        db.run(
            `UPDATE users 
             SET real_name = ?, phone = ?, email = ?, gender = ?, age = ?
             WHERE id = ?`,
            [real_name, phone, email, gender, age, req.user.id]
        );
        
        res.json({ success: true, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '更新失败：' + error.message });
    }
});

// 修改密码
app.post('/api/user/change-password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        const result = db.exec('SELECT * FROM users WHERE id = ?', [req.user.id]);
        const columns = result[0].columns;
        const values = result[0].values[0];
        const user = {};
        columns.forEach((col, i) => user[col] = values[i]);
        
        const validPassword = await bcrypt.compare(oldPassword, user.password);
        
        if (!validPassword) {
            return res.status(400).json({ success: false, message: '原密码错误' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        
        res.json({ success: true, message: '密码修改成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '修改失败：' + error.message });
    }
});

// 获取健康数据
app.get('/api/health-data', authMiddleware, (req, res) => {
    try {
        const result = db.exec(
            'SELECT * FROM health_data WHERE user_id = ? ORDER BY date DESC',
            [req.user.id]
        );
        
        const data = [];
        if (result.length) {
            const columns = result[0].columns;
            result[0].values.forEach(values => {
                const row = {};
                columns.forEach((col, i) => row[col] = values[i]);
                data.push(row);
            });
        }
        
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取失败：' + error.message });
    }
});

// 添加健康数据
app.post('/api/health-data', authMiddleware, (req, res) => {
    try {
        const { date, systolic, diastolic, blood_sugar, sleep, weight, sport, note } = req.body;
        
        // 检查是否已存在今日数据
        const existing = db.exec(
            'SELECT * FROM health_data WHERE user_id = ? AND date = ?',
            [req.user.id, date]
        );
        
        if (existing.length && existing[0].values.length > 0) {
            return res.status(400).json({ success: false, message: '今日数据已存在' });
        }
        
        db.run(
            `INSERT INTO health_data (user_id, date, systolic, diastolic, blood_sugar, sleep, weight, sport, note)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, date, systolic, diastolic, blood_sugar, sleep, weight, sport, note]
        );
        
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        
        res.json({ success: true, id, message: '添加成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '添加失败：' + error.message });
    }
});

// 更新健康数据
app.put('/api/health-data/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const { systolic, diastolic, blood_sugar, sleep, weight, sport, note } = req.body;
        
        db.run(
            `UPDATE health_data 
             SET systolic = ?, diastolic = ?, blood_sugar = ?, sleep = ?, weight = ?, sport = ?, note = ?
             WHERE id = ? AND user_id = ?`,
            [systolic, diastolic, blood_sugar, sleep, weight, sport, note, id, req.user.id]
        );
        
        res.json({ success: true, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '更新失败：' + error.message });
    }
});

// 删除健康数据
app.delete('/api/health-data/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const result = db.run('DELETE FROM health_data WHERE id = ? AND user_id = ?', [id, req.user.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: '数据不存在' });
        }
        
        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '删除失败：' + error.message });
    }
});

// 获取联系人
app.get('/api/contacts', authMiddleware, (req, res) => {
    try {
        const result = db.exec(
            `SELECT c.*, u.name as contact_name 
             FROM contacts c 
             LEFT JOIN users u ON c.contact_username = u.username 
             WHERE c.user_id = ?`,
            [req.user.id]
        );
        
        const contacts = [];
        if (result.length) {
            const columns = result[0].columns;
            result[0].values.forEach(values => {
                const row = {};
                columns.forEach((col, i) => row[col] = values[i]);
                contacts.push(row);
            });
        }
        
        res.json({ success: true, contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取失败：' + error.message });
    }
});

// 添加联系人
app.post('/api/contacts', authMiddleware, (req, res) => {
    try {
        const { contact_username, relation } = req.body;
        
        // 检查联系人是否存在
        const contactUser = db.exec('SELECT * FROM users WHERE username = ?', [contact_username]);
        if (!contactUser.length || contactUser[0].values.length === 0) {
            return res.status(404).json({ success: false, message: '联系人不存在' });
        }
        
        // 检查是否已添加
        const existing = db.exec(
            'SELECT * FROM contacts WHERE user_id = ? AND contact_username = ?',
            [req.user.id, contact_username]
        );
        
        if (existing.length && existing[0].values.length > 0) {
            return res.status(400).json({ success: false, message: '已添加该联系人' });
        }
        
        db.run(
            'INSERT INTO contacts (user_id, contact_username, relation) VALUES (?, ?, ?)',
            [req.user.id, contact_username, relation]
        );
        
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        
        res.json({ success: true, id, message: '添加成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '添加失败：' + error.message });
    }
});

// 删除联系人
app.delete('/api/contacts/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const result = db.run('DELETE FROM contacts WHERE id = ? AND user_id = ?', [id, req.user.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: '联系人不存在' });
        }
        
        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '删除失败：' + error.message });
    }
});

// 获取通知
app.get('/api/notifications', authMiddleware, (req, res) => {
    try {
        const result = db.exec(
            `SELECT * FROM notifications 
             WHERE to_username = ? 
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.user.username]
        );
        
        const notifications = [];
        if (result.length) {
            const columns = result[0].columns;
            result[0].values.forEach(values => {
                const row = {};
                columns.forEach((col, i) => row[col] = values[i]);
                notifications.push(row);
            });
        }
        
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取失败：' + error.message });
    }
});

// 发送通知
app.post('/api/notifications', authMiddleware, (req, res) => {
    try {
        const { to_username, type, title, message, data } = req.body;
        
        db.run(
            `INSERT INTO notifications (from_username, to_username, type, title, message, data)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.username, to_username, type, title, message, JSON.stringify(data || {})]
        );
        
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        
        res.json({ success: true, id, message: '发送成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '发送失败：' + error.message });
    }
});

// 标记通知为已读
app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const result = db.run(
            `UPDATE notifications SET is_read = 1 WHERE id = ? AND to_username = ?`,
            [id, req.user.username]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: '通知不存在' });
        }
        
        res.json({ success: true, message: '已标记为已读' });
    } catch (error) {
        res.status(500).json({ success: false, message: '更新失败：' + error.message });
    }
});

// 预约挂号
app.post('/api/appointments', authMiddleware, (req, res) => {
    try {
        const { hospital, department, doctor, date, time } = req.body;
        
        db.run(
            `INSERT INTO appointments (user_id, hospital, department, doctor, date, time)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, hospital, department, doctor || '', date, time]
        );
        
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        
        res.json({ success: true, id, message: '预约成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '预约失败：' + error.message });
    }
});

// 获取预约记录
app.get('/api/appointments', authMiddleware, (req, res) => {
    try {
        const result = db.exec(
            'SELECT * FROM appointments WHERE user_id = ? ORDER BY date DESC, time DESC',
            [req.user.id]
        );
        
        const appointments = [];
        if (result.length) {
            const columns = result[0].columns;
            result[0].values.forEach(values => {
                const row = {};
                columns.forEach((col, i) => row[col] = values[i]);
                appointments.push(row);
            });
        }
        
        res.json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取失败：' + error.message });
    }
});

// 启动服务器
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log(`✅ 桂在安康后端服务已启动`);
        console.log(`📡 访问地址：http://localhost:${PORT}`);
        console.log(`📊 API 地址：http://localhost:${PORT}/api`);
    });
}

startServer().catch(console.error);
