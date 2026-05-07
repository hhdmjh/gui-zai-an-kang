@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - 全自动云端部署
echo ========================================
echo.
echo 正在准备部署到 GitHub...
echo.

cd /d "%~dp0"

REM 设置远程仓库
git remote set-url origin https://github.com/hhdmjh/gui-zai-an-kang.git 2>nul

REM 设置主分支
git branch -M main 2>nul

echo.
echo ========================================
echo ⚠️  重要提示
echo ========================================
echo.
echo 即将推送代码到 GitHub，需要你的账号认证
echo.
echo 浏览器会自动打开 GitHub 登录页面
echo 请输入你的 GitHub 账号：hhdmjh
echo 然后输入密码完成认证
echo.
echo 认证完成后会自动推送代码
echo.
pause

REM 推送代码
git push -f https://github.com/hhdmjh/gui-zai-an-kang.git main

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo.
    echo 请检查：
    echo 1. GitHub 账号是否正确
    echo 2. 密码是否正确
    echo 3. 网络连接是否正常
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 代码已成功推送到 GitHub！
echo ========================================
echo.
echo 你的代码仓库：
echo https://github.com/hhdmjh/gui-zai-an-kang
echo.

echo ========================================
echo 第 2 步：部署前端到 Vercel
echo ========================================
echo.
echo 请在浏览器打开：
echo https://vercel.com/new/clone?repository-url=https://github.com/hhdmjh/gui-zai-an-kang
echo.
echo 然后：
echo 1. 用 GitHub 登录
echo 2. 点击 Import
echo 3. 点击 Deploy
echo 4. 等待部署完成
echo.
echo 部署完成后你会得到网址：
echo https://gui-zai-an-kang.vercel.app
echo.
pause

echo ========================================
echo 第 3 步：部署后端到 Railway
echo ========================================
echo.
echo 请在浏览器打开：
echo https://railway.app/new
echo.
echo 然后：
echo 1. 用 GitHub 登录
echo 2. 点击 New Project
echo 3. 选择 Deploy from GitHub repo
echo 4. 选择 gui-zai-an-kang 项目
echo 5. 等待部署完成
echo.
echo 部署完成后你会得到后端地址：
echo https://gui-zai-an-kang-production.up.railway.app
echo.
pause

echo ========================================
echo 第 4 步：配置 API 地址
echo ========================================
echo.
echo 部署完成后，需要修改前端代码中的 API 地址
echo.
echo 修改以下文件：
echo - home.html
echo - login.html
echo - register.html
echo - profile.html
echo - notifications.html
echo - contacts.html
echo.
echo 找到这行代码：
echo const API_BASE_URL = 'http://localhost:3000/api';
echo.
echo 改为：
echo const API_BASE_URL = 'https://你的后端地址.up.railway.app/api';
echo.
echo 然后重新提交并部署：
echo git add .
echo git commit -m "更新 API 地址"
echo git push
echo.
echo 然后在 Vercel 点击 Redeploy
echo.
pause

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
