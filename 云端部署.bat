@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - 云端部署脚本
echo ========================================
echo.
echo 这个脚本会帮你：
echo 1. 推送代码到 GitHub
echo 2. 部署前端到 Vercel
echo 3. 部署后端到 Railway
echo.
echo 在开始之前，请确保：
echo ✅ 你已经注册了 GitHub 账号
echo ✅ 你已经安装了 Git
echo.
pause

cd /d "%~dp0"

echo.
echo ========================================
echo 第 1 步：初始化 Git 仓库
echo ========================================
echo.

git init
git add .
git commit -m "桂在安康 - 云端部署"

echo.
echo ✅ Git 仓库已准备就绪！
echo.

echo ========================================
echo 第 2 步：设置 GitHub 远程仓库
echo ========================================
echo.
echo 请先在 GitHub 上创建一个新仓库：
echo 1. 访问：https://github.com/new
echo 2. 仓库名：gui-zai-an-kang
echo 3. 点击 Create repository
echo.
pause

set /p GITHUB_USER="请输入你的 GitHub 用户名："

if "%GITHUB_USER%"=="" (
    echo ❌ 错误：未输入用户名
    pause
    exit /b 1
)

echo.
echo 正在配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/gui-zai-an-kang.git
git branch -M main

echo.
echo ========================================
echo 第 3 步：推送代码到 GitHub
echo ========================================
echo.
echo 即将推送代码到 GitHub...
echo 如果提示输入账号密码，请使用你的 GitHub 账号
echo 或者使用 Personal Access Token
echo.
pause

git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 需要配置 Git 凭证
    echo 3. 仓库不存在
    echo.
    echo 请检查后重试
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 代码已成功推送到 GitHub！
echo ========================================
echo.
echo 你的代码仓库地址：
echo https://github.com/%GITHUB_USER%/gui-zai-an-kang
echo.

echo ========================================
echo 第 4 步：部署前端到 Vercel
echo ========================================
echo.
echo 请按以下步骤操作：
echo.
echo 1. 访问：https://vercel.com
echo 2. 用 GitHub 账号登录
echo 3. 点击 "Import Project"
echo 4. 找到 "gui-zai-an-kang" 项目
echo 5. 点击 "Import"
echo 6. 点击 "Deploy"
echo 7. 等待部署完成（约 1-2 分钟）
echo.
echo 部署完成后，你会得到一个网址：
echo https://gui-zai-an-kang.vercel.app
echo.
pause

echo.
echo ========================================
echo 第 5 步：部署后端到 Railway
echo ========================================
echo.
echo 请按以下步骤操作：
echo.
echo 1. 访问：https://railway.app
echo 2. 用 GitHub 账号登录
echo 3. 点击 "New Project"
echo 4. 选择 "Deploy from GitHub repo"
echo 5. 选择 "gui-zai-an-kang" 项目
echo 6. 等待自动部署
echo.
echo 部署完成后，你会得到后端地址：
echo https://gui-zai-an-kang-production.up.railway.app
echo.
pause

echo.
echo ========================================
echo 第 6 步：配置 API 地址
echo ========================================
echo.
echo 部署完成后，需要修改前端配置：
echo.
echo 1. 打开这些文件：
echo    - home.html
echo    - login.html
echo    - register.html
echo    - profile.html
echo    - notifications.html
echo    - contacts.html
echo.
echo 2. 找到这行代码：
echo    const API_BASE_URL = 'http://localhost:3000/api';
echo.
echo 3. 改为：
echo    const API_BASE_URL = 'https://你的后端地址.up.railway.app/api';
echo.
echo 4. 重新提交并部署：
echo    git add .
echo    git commit -m "更新 API 地址"
echo    git push
echo.
echo 5. 在 Vercel 点击 "Redeploy"
echo.
pause

echo.
echo ========================================
echo 🎉 部署完成！
echo ========================================
echo.
echo 你的系统现在：
echo ✅ 前端部署在 Vercel
echo ✅ 后端部署在 Railway
echo ✅ 全球各地都能访问
echo ✅ 7×24 小时在线
echo.
echo 访问地址：
echo https://gui-zai-an-kang.vercel.app
echo.
echo 祝你比赛顺利！🏆
echo.
pause
