@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - Cloudflare Tunnel 部署
echo ========================================
echo.
echo 正在安装 Cloudflared...
echo.

cd /d "%~dp0"

REM 下载 cloudflared
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe' -UseBasicParsing"

if %errorlevel% neq 0 (
    echo 下载失败，请手动下载
    echo 访问：https://github.com/cloudflare/cloudflared/releases
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Cloudflared 已下载
echo ========================================
echo.
echo 正在启动隧道...
echo.
echo 浏览器会打开 Cloudflare 登录页面
echo 登录后会自动生成一个永久的公网地址
echo.
pause

cloudflared tunnel --url http://localhost:3000

pause
