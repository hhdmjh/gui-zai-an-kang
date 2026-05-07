@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════╗
echo ║          🌿 桂在安康 - 一键安装程序                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1/5] 检查系统环境...

REM 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装 Node.js
    echo.
    echo 请先安装 Node.js: https://nodejs.org/
    echo 或运行：winget install OpenJS.NodeJS.LTS
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js 已安装 - 
node --version

REM 检查 MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装 MySQL
    echo.
    echo 请先安装 MySQL: https://dev.mysql.com/downloads/
    echo 或使用 XAMPP: https://www.apachefriends.org/
    echo.
    pause
    exit /b 1
)
echo ✅ MySQL 已安装 - 
mysql --version

echo.
echo [2/5] 进入后端目录...
cd backend
if %errorlevel% neq 0 (
    echo ❌ 无法进入 backend 目录
    pause
    exit /b 1
)
echo ✅ 当前目录：%CD%

echo.
echo [3/5] 配置环境变量...
if not exist .env (
    echo 正在创建配置文件...
    copy .env.example .env
    echo.
    echo ╔════════════════════════════════════════════════════════╗
    echo ║  ⚠️  重要：请配置 MySQL 密码                              ║
    echo ╠════════════════════════════════════════════════════════╣
    echo ║  1. 打开文件：backend\.env                             ║
    echo ║  2. 找到：DB_PASSWORD=                                 ║
    echo ║  3. 修改为你的 MySQL 密码                                ║
    echo ║  4. 保存并重新运行此脚本                               ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
    start notepad .env
    pause
    exit /b 1
) else (
    echo ✅ 配置文件已存在
)

echo.
echo [4/5] 安装项目依赖...
echo 这可能需要几分钟，请稍候...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ 依赖安装失败
    echo.
    echo 尝试使用淘宝镜像：
    echo npm config set registry https://registry.npmmirror.com
    echo npm install
    echo.
    pause
    exit /b 1
)
echo ✅ 依赖安装成功

echo.
echo [5/5] 初始化数据库...
call npm run init-db
if %errorlevel% neq 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════╗
    echo ║  ❌ 数据库初始化失败！                                   ║
    echo ╠════════════════════════════════════════════════════════╣
    echo ║  可能原因：                                             ║
    echo ║  1. MySQL 服务未启动                                    ║
    echo ║  2. .env 文件中的密码错误                               ║
    echo ║                                                        ║
    echo ║  解决方法：                                             ║
    echo ║  1. 启动 MySQL 服务                                     ║
    echo ║  2. 编辑 backend\.env 文件                              ║
    echo ║  3. 修改 DB_PASSWORD 为正确的密码                        ║
    echo ║  4. 重新运行本脚本                                     ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)
echo ✅ 数据库初始化成功

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║              🎉 安装完成！                              ║
echo ╠════════════════════════════════════════════════════════╣
echo ║  下一步操作：                                          ║
echo ║  1. 双击运行：start.bat（启动服务）                    ║
echo ║  2. 浏览器访问：http://localhost:3000                  ║
echo ║  3. 登录账号：admin / 123456                           ║
echo ║                                                        ║
echo ║  让别人也能用：                                        ║
echo ║  1. 查看你的 IP 地址：ipconfig                          ║
echo ║  2. 别人访问：http://你的 IP:3000                       ║
echo ║  3. 确保防火墙开放 3000 端口                             ║
echo ╚════════════════════════════════════════════════════════╝
echo.
pause
