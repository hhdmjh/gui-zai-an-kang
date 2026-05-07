@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════╗
echo ║          🌿 桂在安康 - 后端服务一键安装脚本            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js 是否已安装
echo [1/5] 检查 Node.js 安装状态...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装
    echo.
    echo 正在安装 Node.js，请稍候...
    echo.
    winget install OpenJS.NodeJS.LTS
    if %errorlevel% neq 0 (
        echo.
        echo ⚠️  自动安装失败，请手动安装 Node.js
        echo.
        echo 下载地址：https://nodejs.org/
        echo 或运行：winget install OpenJS.NodeJS.LTS
        echo.
        pause
        exit /b 1
    )
) else (
    echo ✅ Node.js 已安装
    node --version
)
echo.

REM 检查 MySQL 是否已安装
echo [2/5] 检查 MySQL 安装状态...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MySQL 未安装或不在系统路径中
    echo.
    echo 请手动安装 MySQL：
    echo 1. 访问：https://dev.mysql.com/downloads/mysql/
    echo 2. 下载并安装 MySQL for Windows
    echo 3. 或使用 XAMPP：https://www.apachefriends.org/
    echo.
    pause
) else (
    echo ✅ MySQL 已安装
    mysql --version
)
echo.

REM 进入 backend 目录
echo [3/5] 进入后端目录...
cd backend
if %errorlevel% neq 0 (
    echo ❌ 无法进入 backend 目录
    pause
    exit /b 1
)
echo ✅ 当前目录：%CD%
echo.

REM 复制环境配置文件
echo [4/5] 配置环境变量...
if not exist .env (
    copy .env.example .env
    echo ✅ 已创建 .env 文件
    echo ⚠️  请编辑 backend\.env 文件，配置 MySQL 数据库连接信息
    echo.
) else (
    echo ✅ .env 文件已存在
)
echo.

REM 安装依赖
echo [5/5] 安装项目依赖...
echo 这可能需要几分钟时间，请稍候...
echo.
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    echo.
    echo 尝试使用淘宝镜像重新安装：
    echo npm config set registry https://registry.npmmirror.com
    echo npm install
    pause
    exit /b 1
)
echo ✅ 依赖安装成功
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║              安装完成！                                ║
echo ╠════════════════════════════════════════════════════════╣
echo ║  下一步操作：                                          ║
echo ║  1. 编辑 backend\.env 文件配置数据库连接               ║
echo ║  2. 确保 MySQL 服务已启动                              ║
echo ║  3. 运行：npm run init-db (初始化数据库)               ║
echo ║  4. 运行：npm start (启动后端服务)                     ║
echo ║  5. 浏览器访问：http://localhost:3000                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.
pause
