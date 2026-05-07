/**
 * API 配置和请求封装
 */

const API_CONFIG = {
  // 后端 API 地址
  baseURL: 'http://localhost:3000/api',
  // 超时时间
  timeout: 10000,
  // 默认用户 ID（后续可从登录信息获取）
  defaultUserId: 1
};

// 通用请求方法
async function request(url, options = {}) {
  const fullUrl = `${API_CONFIG.baseURL}${url}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    const response = await fetch(fullUrl, {
      ...config,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '请求失败');
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API 请求错误:', error);
    throw error;
  }
}

// API 接口封装
const API = {
  // 用户登录
  async login(username, password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  // 获取健康数据
  async getHealthData(userId = API_CONFIG.defaultUserId) {
    return request(`/health-data?user_id=${userId}`);
  },
  
  // 保存健康数据
  async saveHealthData(data) {
    return request('/health-data', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 删除健康数据
  async deleteHealthData(id) {
    return request(`/health-data/${id}`, {
      method: 'DELETE'
    });
  },
  
  // 获取预约记录
  async getAppointments(userId = API_CONFIG.defaultUserId) {
    return request(`/appointments?user_id=${userId}`);
  },
  
  // 创建预约
  async createAppointment(data) {
    return request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// 数据同步管理器
const SyncManager = {
  // 是否启用后端同步
  useBackend: false,
  
  // 检查后端服务是否可用
  async checkBackend() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/health`);
      const data = await response.json();
      this.useBackend = data.success && data.database === '已连接';
      console.log('后端服务状态:', this.useBackend ? '✅ 可用' : '❌ 不可用');
      return this.useBackend;
    } catch (error) {
      this.useBackend = false;
      console.log('后端服务不可用，使用本地存储');
      return false;
    }
  },
  
  // 获取健康数据
  async getHealthData() {
    if (this.useBackend) {
      try {
        const result = await API.getHealthData();
        return result.data;
      } catch (error) {
        console.error('从后端获取数据失败，使用本地数据');
      }
    }
    // 降级到本地存储
    return JSON.parse(localStorage.getItem('healthData')) || [];
  },
  
  // 保存健康数据
  async saveHealthData(data) {
    if (this.useBackend) {
      try {
        await API.saveHealthData(data);
        console.log('数据已同步到后端');
      } catch (error) {
        console.error('同步到后端失败，保存到本地');
      }
    }
    // 同时保存到本地（双保险）
    const healthData = JSON.parse(localStorage.getItem('healthData')) || [];
    const existingIndex = healthData.findIndex(d => d.date === data.date);
    if (existingIndex >= 0) {
      healthData[existingIndex] = data;
    } else {
      healthData.push(data);
    }
    localStorage.setItem('healthData', JSON.stringify(healthData));
  },
  
  // 获取预约记录
  async getAppointments() {
    if (this.useBackend) {
      try {
        const result = await API.getAppointments();
        return result.data;
      } catch (error) {
        console.error('从后端获取预约失败，使用本地数据');
      }
    }
    return JSON.parse(localStorage.getItem('appointments')) || [];
  },
  
  // 保存预约记录
  async saveAppointment(data) {
    if (this.useBackend) {
      try {
        const result = await API.createAppointment(data);
        console.log('预约已同步到后端');
        return result.data;
      } catch (error) {
        console.error('同步到后端失败，保存到本地');
      }
    }
    // 同时保存到本地
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    data.id = Date.now();
    data.createTime = new Date().toLocaleString('zh-CN');
    data.status = '已提交';
    appointments.push(data);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    return data;
  }
};

// 导出到全局
window.API = API;
window.SyncManager = SyncManager;
window.API_CONFIG = API_CONFIG;

// 页面加载时检查后端服务
document.addEventListener('DOMContentLoaded', () => {
  SyncManager.checkBackend();
});
