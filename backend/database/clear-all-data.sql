-- 清空所有测试数据
-- 在 MySQL 中运行：mysql -u root -p 桂在安康 < clear-all-data.sql

USE 桂在安康;

-- 清空数据（保留表结构）
DELETE FROM event_registrations;
DELETE FROM community_events;
DELETE FROM appointments;
DELETE FROM warnings;
DELETE FROM ai_health_reports;
DELETE FROM health_data;
DELETE FROM knowledge_articles;

-- 重置自增 ID（可选）
ALTER TABLE event_registrations AUTO_INCREMENT = 1;
ALTER TABLE community_events AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE warnings AUTO_INCREMENT = 1;
ALTER TABLE ai_health_reports AUTO_INCREMENT = 1;
ALTER TABLE health_data AUTO_INCREMENT = 1;
ALTER TABLE knowledge_articles AUTO_INCREMENT = 1;

-- 验证（保留 admin 用户）
SELECT '✅ 数据已清空！' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS health_data_count FROM health_data;
