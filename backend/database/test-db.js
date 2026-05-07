const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('尝试连接数据库...\n');
  
  // 尝试不同的密码
  const passwords = ['', 'root', '123456', 'password', 'admin'];
  
  for (const pwd of passwords) {
    try {
      console.log(`尝试密码：${pwd || '(空)'}`);
      
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pwd,
        multipleStatements: true
      });
      
      console.log(`✅ 成功！密码是：${pwd || '(空)'}`);
      
      // 查看数据库
      const [databases] = await connection.query('SHOW DATABASES');
      console.log('\n可用数据库:');
      databases.forEach(db => {
        console.log(`  - ${db.Database}`);
      });
      
      await connection.end();
      return;
      
    } catch (error) {
      console.log(`❌ 失败：${error.message}\n`);
    }
  }
  
  console.log('\n所有常用密码都试过了，请手动设置 MySQL 密码：');
  console.log('1. 打开 MySQL');
  console.log('2. 运行：ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'123456\';');
  console.log('3. 或者修改 .env 文件中的 DB_PASSWORD');
}

testConnection();
