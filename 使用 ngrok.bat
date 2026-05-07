@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - 使用 ngrok 部署
echo ========================================
echo.
echo 正在安装 ngrok...
echo.

cd /d "%~dp0\backend"

npm install -g ngrok

if %errorlevel% neq 0 (
    echo 安装失败，请手动安装
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ ngrok 已安装
echo ========================================
echo.
echo 现在运行：
echo ngrok http 3000
echo.
echo 会生成一个稳定的网址
echo 没有安全提示页面
echo.
pause

ngrok http 3000

pause
