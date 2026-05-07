const { pool, query } = require('./db');
const bcrypt = require('bcryptjs');

// 初始化数据库（创建表结构）
async function initDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 创建用户表
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        real_name VARCHAR(50),
        gender VARCHAR(10),
        age INT,
        height DECIMAL(5,2),
        avatar VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 用户表创建成功');

    // 创建健康数据表
    await query(`
      CREATE TABLE IF NOT EXISTS health_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        record_date DATE NOT NULL,
        systolic DECIMAL(5,2),
        diastolic DECIMAL(5,2),
        blood_sugar DECIMAL(5,2),
        sleep DECIMAL(4,2),
        weight DECIMAL(5,2),
        sport INT,
        heart_rate INT,
        temperature DECIMAL(4,2),
        oxygen_saturation DECIMAL(4,2),
        mood VARCHAR(50),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_record (user_id, record_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 健康数据表创建成功');

    // 创建预约记录表
    await query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        remark TEXT,
        status VARCHAR(20) DEFAULT '已提交',
        service_type VARCHAR(50),
        staff_name VARCHAR(50),
        staff_phone VARCHAR(20),
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 预约记录表创建成功');

    // 创建预警记录表
    await query(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        health_data_id INT,
        warning_type VARCHAR(50) NOT NULL,
        warning_level VARCHAR(20) NOT NULL,
        warning_value DECIMAL(10,2),
        threshold_value DECIMAL(10,2),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        notified_family BOOLEAN DEFAULT FALSE,
        notified_doctor BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (health_data_id) REFERENCES health_data(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 预警记录表创建成功');

    // 创建健康知识库表
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL,
        content TEXT,
        author VARCHAR(100),
        views INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 知识库表创建成功');

    // 创建社区活动表
    await query(`
      CREATE TABLE IF NOT EXISTS community_events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time VARCHAR(50),
        location VARCHAR(200),
        max_participants INT,
        current_participants INT DEFAULT 0,
        organizer VARCHAR(100),
        contact_phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 社区活动表创建成功');

    // 创建活动报名表
    await query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        FOREIGN KEY (event_id) REFERENCES community_events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 活动报名表创建成功');

    // 创建 AI 健康建议记录表
    await query(`
      CREATE TABLE IF NOT EXISTS ai_health_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        report_date DATE NOT NULL,
        overall_score INT,
        bp_score INT,
        sugar_score INT,
        lifestyle_score INT,
        avg_systolic DECIMAL(5,2),
        avg_diastolic DECIMAL(5,2),
        avg_blood_sugar DECIMAL(5,2),
        avg_sleep DECIMAL(4,2),
        avg_weight DECIMAL(5,2),
        avg_sport INT,
        suggestions TEXT,
        warning_suggestions TEXT,
        trend_analysis TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ AI 健康建议表创建成功');

    // 插入默认用户（admin/123456）
    const hashedPassword = await bcrypt.hash('123456', 10);
    await query(`
      INSERT INTO users (username, password, real_name, role) 
      SELECT 'admin', ?, '管理员', 'admin'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
    `, [hashedPassword]);
    console.log('✅ 默认用户创建成功 (admin/123456)');

    // 插入测试用户
    const testUserPassword = await bcrypt.hash('123456', 10);
    await query(`
      INSERT INTO users (username, password, real_name, phone, email, role) 
      SELECT 'test', ?, '测试用户', '13800138000', 'test@example.com', 'user'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'test');
    `, [testUserPassword]);
    console.log('✅ 测试用户创建成功 (test/123456)');

    // 插入示例健康知识
    await query(`
      INSERT INTO knowledge_articles (title, category, content, author, is_featured) 
      SELECT '高血压的饮食调理', '饮食养生', '高血压患者应低盐低脂饮食，多吃新鲜蔬菜水果...', '张医生', TRUE
      WHERE NOT EXISTS (SELECT 1 FROM knowledge_articles);
    `);
    console.log('✅ 示例数据插入成功');

    console.log('🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDatabase };
