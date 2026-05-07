@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - 一键推送 GitHub
echo ========================================
echo.
echo 正在推送代码到 GitHub...
echo.

cd /d "%~dp0"

echo 正在设置远程仓库...
git remote set-url origin https://github.com/hhdmjh/gui-zai-an-kang.git

echo 正在设置主分支...
git branch -M main

echo.
echo ========================================
echo 正在推送代码...
echo ========================================
echo.
echo 如果提示输入账号密码：
echo 1. 输入你的 GitHub 账号
echo 2. 输入 GitHub 密码或 Personal Access Token
echo.
echo Personal Access Token 获取地址：
echo https://github.com/settings/tokens
echo.
pause

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo 你的代码仓库地址：
    echo https://github.com/hhdmjh/gui-zai-an-kang
    echo.
    echo 接下来请部署到 Vercel 和 Railway
    echo 打开文件：云端部署完成指南.md
    echo 按照里面的步骤继续操作
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 仓库不存在（请先在 GitHub 创建仓库）
    echo 3. 需要配置 Git 凭证
    echo.
    echo 请检查后重试
    echo.
)

pause
