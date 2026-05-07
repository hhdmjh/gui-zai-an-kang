@echo off
chcp 65001 >nul
echo ========================================
echo    桂在安康 - 修复版推送脚本
echo ========================================
echo.

cd /d "%~dp0"

echo 步骤 1: 添加所有修改的文件
git add -A
echo.

echo 步骤 2: 提交更改
git commit -m "修复社区服务登录问题"
echo.

echo 步骤 3: 设置远程分支
git branch -M main
echo.

echo 步骤 4: 推送到 GitHub
echo 正在推送，请稍候...
echo.
echo 如果需要输入密码，请使用：
echo - GitHub 账号密码 或
echo - Personal Access Token
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo 请等待 1-2 分钟，GitHub Pages 会自动更新
    echo 然后访问：https://hhdmjh.github.io/gui-zai-an-kang/
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo.
    echo 建议尝试以下方法：
    echo.
    echo 方法 1: 使用 GitHub Desktop
    echo   1. 下载并安装 GitHub Desktop
    echo   2. 克隆你的仓库
    echo   3. 将修改的文件复制到仓库目录
    echo   4. 使用 GitHub Desktop 提交并推送
    echo.
    echo 方法 2: 手动上传到 GitHub
    echo   1. 访问 https://github.com/hhdmjh/gui-zai-an-kang
    echo   2. 点击要更新的文件
    echo   3. 点击编辑按钮
    echo   4. 复制本地文件内容粘贴进去
    echo   5. 提交更改
    echo.
    echo 方法 3: 使用 VS Code 的 Git 功能
    echo   1. 用 VS Code 打开项目文件夹
    echo   2. 点击左侧 Git 图标
    echo   3. 点击 + 号暂存更改
    echo   4. 输入提交信息并提交
    echo   5. 点击"..."选择"推送"
    echo.
)

pause
