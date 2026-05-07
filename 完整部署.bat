@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - 完整部署脚本
echo ========================================
echo.
echo 正在检查服务器状态...
echo.

cd /d "%~dp0"

REM 检查端口 3000 是否被占用
netstat -ano | findstr :3000 >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ 服务器已在运行
) else (
    echo ❌ 服务器未运行，正在启动...
    start "" "cmd /c cd backend && node full-server.js"
    timeout /t 3 /nobreak >nul
)

echo.
echo ========================================
echo 正在启动外网穿透...
echo ========================================
echo.
echo 请使用以下任一方式访问：
echo.
echo 方法 1: localtunnel
echo 访问：https://guizaiankang.loca.lt
echo 输入 IP: 39.144.67.83
echo.
echo 方法 2: 本地访问
echo 访问：http://localhost:3000
echo.
echo ========================================
echo ✅ 系统已就绪！
echo ========================================
echo.
pause
