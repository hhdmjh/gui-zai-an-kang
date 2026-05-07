@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║          🌿 桂在安康 - 局域网服务器启动                ║
echo ╠════════════════════════════════════════════════════════╣
echo ║  其他设备可以通过局域网访问                            ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM 获取本机 IP 地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set IP=%%b
        goto :found
    )
)
:found

echo ✅ 正在启动服务器...
echo.
echo 📱 服务器已启动！
echo.
echo 🌐 访问地址：
echo   本机：http://localhost:3001
echo   局域网：http://%IP%:3001
echo.
echo 💡 同一 WiFi 下的手机/电脑可以访问：
echo   http://%IP%:3001
echo.
echo 按 Ctrl+C 停止服务器
echo.

start "" cmd /k "node backend/demo-server.js"

timeout /t 3 >nul
start http://localhost:3001/login.html

pause >nul
