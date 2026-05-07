# 🚀 一键启动脚本（已修复）

@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════╗
echo ║          🌿 桂在安康 - 启动检查工具                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd backend

REM 检查 .env 文件
echo [1/3] 检查配置文件...
if not exist .env (
    echo ❌ .env 文件不存在
    echo 正在创建 .env 文件...
    copy .env.example .env
    echo.
    echo ⚠️  请编辑 .env 文件，修改 DB_PASSWORD 为你的 MySQL 密码
    echo.
    echo 常见密码：
    echo - XAMPP 用户：留空（删除等号后面的内容）
    echo - 默认密码：root 或 123456
    echo.
    pause
    exit /b 1
) else (
    echo ✅ .env 文件已存在
)
echo.

REM 检查 node_modules
echo [2/3] 检查依赖...
if not exist node_modules (
    echo ❌ 依赖未安装
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已安装
)
echo.

REM 测试数据库连接
echo [3/3] 测试数据库连接...
echo 正在初始化数据库...
call npm run init-db
if %errorlevel% neq 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════╗
    echo ║  ❌ 数据库连接失败！                                    ║
    echo ╠════════════════════════════════════════════════════════╣
    echo ║  原因：MySQL 密码配置错误                               ║
    echo ║                                                        ║
    echo ║  解决方法：                                             ║
    echo ║  1. 打开 backend\.env 文件                              ║
    echo ║  2. 找到 DB_PASSWORD=这一行                             ║
    echo ║  3. 改成你的 MySQL 密码                                  ║
    echo ║                                                        ║
    echo ║  常见密码：                                             ║
    echo ║  - XAMPP 用户：留空（删除等号后面内容）                   ║
    echo ║  - 默认密码：root 或 123456                             ║
    echo ║  - 你自己设置的密码                                     ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║  ✅ 数据库连接成功！                                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo ════════════════════════════════════════════════════════
echo 正在启动服务器...
echo ════════════════════════════════════════════════════════
echo.

REM 启动服务器
call npm start

pause
