// API 配置 - 部署后修改为 Railway 地址
const API_BASE_URL = 'http://localhost:3000/api';

// 部署到 Railway 后修改为：
// const API_BASE_URL = 'https://你的项目名-production.up.railway.app/api';

// 辅助函数
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...(options.headers || {})
            }
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API 请求错误:', error);
        throw error;
    }
}
