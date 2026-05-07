const { query } = require('./db');

// 更新数据库：添加 AI 健康建议表
async function updateDatabase() {
  try {
    console.log('开始更新数据库...');

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ AI 健康建议表创建成功');

    // 验证表已创建
    const tables = await query('SHOW TABLES LIKE "ai_health_reports"');
    if (tables.length > 0) {
      console.log('✅ 验证成功：ai_health_reports 表已存在');
      
      // 显示表结构
      const desc = await query('DESC ai_health_reports');
      console.log('\n表结构:');
      console.table(desc);
    }

    console.log('\n🎉 数据库更新完成！');
  } catch (error) {
    console.error('❌ 数据库更新失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateDatabase()
    .then(() => {
      console.log('\n✅ 按任意键退出...');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ 错误:', err.message);
      process.exit(1);
    });
}

module.exports = { updateDatabase };
