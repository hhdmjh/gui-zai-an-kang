const jwt = require('jsonwebtoken');

// JWT 验证中间件
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: '未授权，请先登录' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token 验证失败:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Token 无效或已过期' 
    });
  }
}

// 管理员权限验证中间件
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: '权限不足，需要管理员权限' 
    });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
