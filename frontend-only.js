/**
 * 纯前端模式 - 覆盖所有后端 API 调用
 * 使用 LocalStorage 存储所有数据
 */

// 覆盖 UserUtils
const OriginalUserUtils = window.UserUtils || {};

window.UserUtils = {
    // 检查是否登录
    isLoggedIn: function() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },
    
    // 获取当前用户
    getCurrentUser: function() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // 获取 Token（兼容旧代码）
    getToken: function() {
        return localStorage.getItem('token') || 'demo-token';
    },
    
    // 退出登录
    logout: function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    },
    
    // 跳转到登录页
    redirectToLogin: function() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },
    
    // 获取 API 基础 URL（兼容旧代码）
    getApiBaseUrl: function() {
        return ''; // 纯前端模式不需要
    }
};

// 页面加载时自动检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    // 如果是登录页或注册页，不需要检查
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html' || currentPage === 'register.html' || currentPage === '') {
        return;
    }
    
    // 其他页面检查登录状态
    if (!UserUtils.isLoggedIn()) {
        window.location.href = 'login.html';
    }
});

console.log('✅ 纯前端模式已启用 - 所有数据存储在本地浏览器');
