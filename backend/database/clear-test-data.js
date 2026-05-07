const { query } = require('./db');

// 清空测试数据
async function clearTestData() {
  try {
    console.log('开始清空测试数据...');

    // 清空 AI 报告
    await query('DELETE FROM ai_health_reports');
    console.log('✅ 已清空 AI 报告数据');

    // 清空预警记录
    await query('DELETE FROM warnings');
    console.log('✅ 已清空预警记录');

    // 清空健康数据
    await query('DELETE FROM health_data');
    console.log('✅ 已清空健康数据');

    // 清空预约记录
    await query('DELETE FROM appointments');
    console.log('✅ 已清空预约记录');

    // 清空活动报名
    await query('DELETE FROM event_registrations');
    console.log('✅ 已清空活动报名');

    // 清空社区活动
    await query('DELETE FROM community_events');
    console.log('✅ 已清空社区活动');

    // 保留用户数据（可选）
    // await query('DELETE FROM users WHERE username != "admin"');
    // console.log('✅ 已清空普通用户，保留 admin 账号');

    console.log('\n🎉 所有测试数据已清空！');
    console.log('现在登录后，所有数据都应该是 0！');
  } catch (error) {
    console.error('❌ 清空数据失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  clearTestData()
    .then(() => {
      console.log('\n✅ 按任意键退出...');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ 错误:', err.message);
      process.exit(1);
    });
}

module.exports = { clearTestData };
