-- 更新数据库：添加 AI 健康建议表
-- 运行方式：mysql -u root -p 桂在安康 < update-add-ai-report-table.sql

USE 桂在安康;

-- 创建 AI 健康建议记录表
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

-- 查看表是否创建成功
SHOW TABLES LIKE 'ai_health_reports';

-- 查看表结构
DESC ai_health_reports;

SELECT '✅ AI 健康建议表创建成功！' AS message;
