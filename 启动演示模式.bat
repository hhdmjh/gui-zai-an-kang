@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║          🌿 桂在安康 - 演示模式启动                    ║
echo ╠════════════════════════════════════════════════════════╣
echo ║  此模式不需要 MySQL 数据库                                ║
echo ║  所有数据保存在浏览器 localStorage                     ║
echo ║                                                        ║
echo ║  访问地址：http://localhost:3001                       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：未安装 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.
echo 🚀 正在启动演示模式服务器...
echo.

REM 启动演示模式服务器（端口 3001）
start "" cmd /k "node demo-server.js"

echo.
echo ✅ 服务器已启动！
echo.
echo 📱 请在浏览器中打开：http://localhost:3001/login.html
echo.
echo 💡 演示账号：admin / 123456
echo.
echo 按 Ctrl+C 停止服务器
echo.

pause >nul
