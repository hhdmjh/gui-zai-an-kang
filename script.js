/**
 * 桂在安康 - 通用工具函数库
 */

// 本地存储管理工具
const StorageUtils = {
    // 保存数据
    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },

    // 读取数据
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('读取数据失败:', e);
            return defaultValue;
        }
    },

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('删除数据失败:', e);
            return false;
        }
    },

    // 清空所有数据
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('清空数据失败:', e);
            return false;
        }
    }
};

// 用户管理工具
const UserUtils = {
    // 检查登录状态
    isLoggedIn() {
        return StorageUtils.get('isLoggedIn', false);
    },

    // 获取当前用户
    getCurrentUser() {
        return StorageUtils.get('currentUser', null);
    },

    // 登录
    login(username) {
        StorageUtils.save('isLoggedIn', true);
        StorageUtils.save('currentUser', username);
    },

    // 登出
    logout() {
        StorageUtils.remove('isLoggedIn');
        StorageUtils.remove('currentUser');
    },

    // 跳转到登录页
    redirectToLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }
};

// 日期工具函数
const DateUtils = {
    // 格式化日期
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },

    // 获取今天日期
    today() {
        return this.formatDate(new Date());
    },

    // 获取几天后的日期
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // 计算两个日期之间的天数
    diffDays(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

// 通知提示工具
const NotificationUtils = {
    // 显示提示消息
    show(message, type = 'info', duration = 3000) {
        // 移除旧的通知
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }

        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const colors = {
            success: '#52c41a',
            error: '#cf1322',
            warning: '#fa8c16',
            info: '#1890ff'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 10px;
            color: white;
            font-size: 18px;
            font-weight: 600;
            z-index: 9999;
            animation: slideDown 0.3s ease;
            background: ${colors[type] || colors.info};
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // 指定时间后移除
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    warning(message) {
        this.show(message, 'warning');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// 健康数据管理工具
const HealthDataUtils = {
    // 保存健康数据
    saveData(data) {
        const healthData = StorageUtils.get('healthData', []);
        
        // 检查是否已存在该日期的数据
        const existingIndex = healthData.findIndex(d => d.date === data.date);
        if (existingIndex >= 0) {
            healthData[existingIndex] = data;
        } else {
            healthData.push(data);
        }
        
        StorageUtils.save('healthData', healthData);
        return true;
    },

    // 获取健康数据
    getAllData() {
        return StorageUtils.get('healthData', []);
    },

    // 获取排序后的数据
    getSortedData() {
        const data = this.getAllData();
        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // 获取最近 N 条数据
    getRecentData(n = 7) {
        const sorted = this.getSortedData();
        return sorted.slice(-n);
    },

    // 删除数据
    deleteData(date) {
        const healthData = StorageUtils.get('healthData', []);
        const filtered = healthData.filter(d => d.date !== date);
        StorageUtils.save('healthData', filtered);
        return true;
    }
};

// 预警判断工具
const WarningUtils = {
    // 预警阈值配置
    thresholds: {
        systolic: { max: 140, min: 90, unit: 'mmHg', name: '收缩压' },
        diastolic: { max: 90, min: 60, unit: 'mmHg', name: '舒张压' },
        bloodSugar: { max: 7.0, min: 3.9, unit: 'mmol/L', name: '血糖' },
        sleep: { max: 10, min: 6, unit: '小时', name: '睡眠' },
        weight: { max: 110, min: 90, unit: '斤', name: '体重' }
    },

    // 检查单条数据是否异常
    checkData(data) {
        const warnings = [];

        if (data.systolic >= this.thresholds.systolic.max) {
            warnings.push({
                item: '收缩压',
                value: data.systolic,
                threshold: `≥${this.thresholds.systolic.max}${this.thresholds.systolic.unit}`,
                level: 'high'
            });
        }

        if (data.diastolic >= this.thresholds.diastolic.max) {
            warnings.push({
                item: '舒张压',
                value: data.diastolic,
                threshold: `≥${this.thresholds.diastolic.max}${this.thresholds.diastolic.unit}`,
                level: 'high'
            });
        }

        if (data.bloodSugar >= this.thresholds.bloodSugar.max) {
            warnings.push({
                item: '血糖',
                value: data.bloodSugar,
                threshold: `≥${this.thresholds.bloodSugar.max}${this.thresholds.bloodSugar.unit}`,
                level: 'high'
            });
        }

        if (data.sleep < this.thresholds.sleep.min) {
            warnings.push({
                item: '睡眠',
                value: data.sleep,
                threshold: `<${this.thresholds.sleep.min}${this.thresholds.sleep.unit}`,
                level: 'medium'
            });
        }

        if (data.weight >= this.thresholds.weight.max) {
            warnings.push({
                item: '体重',
                value: data.weight,
                threshold: `≥${this.thresholds.weight.max}${this.thresholds.weight.unit}`,
                level: 'medium'
            });
        }

        return warnings;
    },

    // 检查所有数据的异常
    checkAllData() {
        const healthData = HealthDataUtils.getAllData();
        const allWarnings = [];

        healthData.forEach(data => {
            const warnings = this.checkData(data);
            if (warnings.length > 0) {
                warnings.forEach(w => {
                    allWarnings.push({
                        date: data.date,
                        ...w
                    });
                });
            }
        });

        return allWarnings;
    },

    // 获取异常数据统计
    getWarningStats() {
        const warnings = this.checkAllData();
        const stats = {};

        warnings.forEach(w => {
            if (!stats[w.item]) {
                stats[w.item] = 0;
            }
            stats[w.item]++;
        });

        return stats;
    }
};

// 预约管理工具
const AppointmentUtils = {
    // 保存预约
    saveAppointment(appointment) {
        const appointments = StorageUtils.get('appointments', []);
        appointment.id = Date.now();
        appointment.createTime = new Date().toLocaleString('zh-CN');
        appointment.status = '已提交';
        appointments.push(appointment);
        StorageUtils.save('appointments', appointments);
        return appointment;
    },

    // 获取所有预约
    getAllAppointments() {
        return StorageUtils.get('appointments', []);
    },

    // 获取预约（按 ID）
    getAppointment(id) {
        const appointments = this.getAllAppointments();
        return appointments.find(a => a.id === id);
    },

    // 更新预约状态
    updateStatus(id, status) {
        const appointments = StorageUtils.get('appointments', []);
        const index = appointments.findIndex(a => a.id === id);
        if (index >= 0) {
            appointments[index].status = status;
            StorageUtils.save('appointments', appointments);
            return true;
        }
        return false;
    },

    // 删除预约
    deleteAppointment(id) {
        const appointments = StorageUtils.get('appointments', []);
        const filtered = appointments.filter(a => a.id !== id);
        StorageUtils.save('appointments', filtered);
        return true;
    }
};

// 简易预测算法（线性回归）
const PredictionUtils = {
    // 线性回归预测
    linearRegression(data, key, periods = 3) {
        if (data.length < 2) return [];

        const values = data.map(d => d[key]);
        const n = values.length;

        // 计算斜率和截距
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumXX += i * i;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // 生成预测值
        const predictions = [];
        for (let i = 1; i <= periods; i++) {
            predictions.push(slope * (n + i - 1) + intercept);
        }

        return predictions;
    },

    // 移动平均预测
    movingAverage(data, key, window = 3, periods = 3) {
        if (data.length < window) return [];

        const values = data.map(d => d[key]);
        const n = values.length;

        // 计算最近 window 个数据的平均值
        const recentValues = values.slice(-window);
        const avg = recentValues.reduce((sum, v) => sum + v, 0) / window;

        // 生成预测值（使用平均值）
        const predictions = [];
        for (let i = 0; i < periods; i++) {
            predictions.push(avg);
        }

        return predictions;
    }
};

// 图表工具
const ChartUtils = {
    // 初始化图表实例
    initCharts(chartIds) {
        const charts = {};
        chartIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                charts[id] = echarts.init(element);
            }
        });
        return charts;
    },

    // 批量调整图表大小
    resizeCharts(charts) {
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    },

    // 销毁图表
    disposeCharts(charts) {
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.dispose === 'function') {
                chart.dispose();
            }
        });
    }
};

// 表单验证工具
const FormValidateUtils = {
    // 验证手机号
    isPhone(phone) {
        return /^1[3-9]\d{9}$/.test(phone);
    },

    // 验证邮箱
    isEmail(email) {
        return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email);
    },

    // 验证身份证
    isIDCard(idCard) {
        return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
    },

    // 验证是否为空
    isEmpty(value) {
        return value === null || value === undefined || value === '';
    },

    // 验证长度
    isLength(value, min, max) {
        const len = value ? value.length : 0;
        return len >= min && len <= max;
    }
};

// 导出工具（全局可用）
window.StorageUtils = StorageUtils;
window.UserUtils = UserUtils;
window.DateUtils = DateUtils;
window.NotificationUtils = NotificationUtils;
window.HealthDataUtils = HealthDataUtils;
window.WarningUtils = WarningUtils;
window.AppointmentUtils = AppointmentUtils;
window.PredictionUtils = PredictionUtils;
window.ChartUtils = ChartUtils;
window.FormValidateUtils = FormValidateUtils;

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slideUp {
            from { opacity: 1; transform: translate(-50%, 0); }
            to { opacity: 0; transform: translate(-50%, -20px); }
        }
    `;
    document.head.appendChild(style);
});
