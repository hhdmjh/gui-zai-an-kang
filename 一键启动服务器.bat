@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - 一键启动服务器
echo ========================================
echo.

cd /d "%~dp0"

echo 正在检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

echo 正在安装依赖...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成
echo.

echo ========================================
echo ✅ 服务器启动成功！
echo ========================================
echo.
echo 🌐 访问地址：http://localhost:3000
echo 🔗 API 测试：http://localhost:3000/api/health
echo.
echo 💡 如何让外网访问？
echo 方法 1: 使用 ngrok (推荐)
echo   1. 下载 ngrok: https://ngrok.com/
echo   2. 运行：ngrok http 3000
echo   3. 复制生成的网址发给别人
echo.
echo 方法 2: 使用 localtunnel (免费)
echo   1. 安装：npm install -g localtunnel
echo   2. 运行：lt --port 3000
echo   3. 复制生成的网址
echo.
echo 方法 3: 使用 cpolar (国内速度快)
echo   1. 访问：https://www.cpolar.com/
echo   2. 下载并安装
echo   3. 运行：cpolar http 3000
echo.
echo ========================================
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

node full-server.js

pause
