// 演示模式数据库 - 不需要真实的 MySQL
// 直接操作 localStorage

const DemoDB = {
  // 用户存储
  users: [],
  
  // 健康数据存储
  healthData: [],
  
  // AI 报告存储
  aiReports: [],
  
  // 初始化
  init() {
    // 从 localStorage 加载数据
    const savedUsers = localStorage.getItem('demo_users');
    const savedHealthData = localStorage.getItem('demo_health_data');
    const savedAiReports = localStorage.getItem('demo_ai_reports');
    
    this.users = savedUsers ? JSON.parse(savedUsers) : [];
    this.healthData = savedHealthData ? JSON.parse(savedHealthData) : [];
    this.aiReports = savedAiReports ? JSON.parse(savedAiReports) : [];
    
    // 如果没有用户，添加一个默认管理员
    if (this.users.length === 0) {
      this.users.push({
        id: 1,
        username: 'admin',
        password: '123456',
        role: 'admin',
        created_at: new Date().toISOString()
      });
      this.saveUsers();
    }
    
    console.log('✅ 演示数据库初始化完成');
    console.log(`用户数：${this.users.length}`);
    console.log(`健康数据：${this.healthData.length}`);
  },
  
  // 保存用户
  saveUsers() {
    localStorage.setItem('demo_users', JSON.stringify(this.users));
  },
  
  // 保存健康数据
  saveHealthData() {
    localStorage.setItem('demo_health_data', JSON.stringify(this.healthData));
  },
  
  // 保存 AI 报告
  saveAiReports() {
    localStorage.setItem('demo_ai_reports', JSON.stringify(this.aiReports));
  },
  
  // 查找用户
  findUser(username) {
    return this.users.find(u => u.username === username);
  },
  
  // 添加用户
  addUser(user) {
    // 检查用户名是否已存在
    if (this.findUser(user.username)) {
      return { success: false, message: '用户名已存在' };
    }
    
    const newUser = {
      id: this.users.length + 1,
      ...user,
      created_at: new Date().toISOString()
    };
    
    this.users.push(newUser);
    this.saveUsers();
    
    return { success: true, user: newUser };
  },
  
  // 验证密码
  verifyPassword(user, password) {
    return user.password === password;
  },
  
  // 获取用户健康数据
  getHealthData(userId) {
    return this.healthData.filter(d => d.user_id === userId);
  },
  
  // 添加健康数据
  addHealthData(userId, data) {
    const newData = {
      id: this.healthData.length + 1,
      user_id: userId,
      ...data,
      created_at: new Date().toISOString()
    };
    
    this.healthData.push(newData);
    this.saveHealthData();
    
    return { success: true, data: newData };
  },
  
  // 删除健康数据
  deleteHealthData(id) {
    const index = this.healthData.findIndex(d => d.id === id);
    if (index > -1) {
      this.healthData.splice(index, 1);
      this.saveHealthData();
      return { success: true };
    }
    return { success: false, message: '记录不存在' };
  },
  
  // 获取今日数据
  getTodayData(userId) {
    const today = new Date().toISOString().split('T')[0];
    return this.healthData.filter(d => 
      d.user_id === userId && d.record_date === today
    );
  },
  
  // 保存 AI 报告
  saveAiReport(userId, report) {
    const newReport = {
      id: this.aiReports.length + 1,
      user_id: userId,
      ...report,
      created_at: new Date().toISOString()
    };
    
    this.aiReports.push(newReport);
    this.saveAiReports();
    
    return { success: true, report: newReport };
  },
  
  // 获取最新 AI 报告
  getLatestAiReport(userId) {
    const reports = this.aiReports
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return reports[0] || null;
  },
  
  // 清空用户数据
  clearUserData(userId) {
    this.healthData = this.healthData.filter(d => d.user_id !== userId);
    this.aiReports = this.aiReports.filter(r => r.user_id !== userId);
    this.saveHealthData();
    this.saveAiReports();
  }
};

// 初始化演示数据库
DemoDB.init();
