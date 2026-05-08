@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    🌿 桂在安康 - 一键打包工具
echo ========================================
echo.

:: 检查是否安装 7-Zip
if exist "C:\Program Files\7-Zip\7z.exe" (
    set ZIP_CMD="C:\Program Files\7-Zip\7z.exe"
) else if exist "C:\Program Files (x86)\7-Zip\7z.exe" (
    set ZIP_CMD="C:\Program Files (x86)\7-Zip\7z.exe"
) else (
    echo ⚠️  未检测到 7-Zip，将使用 Windows 自带压缩功能
    echo.
    echo 📦 正在创建压缩包...
    echo.
    
    :: 使用 PowerShell 压缩
    powershell -Command "$sourceDir = '%CD%'; $zipFile = '%CD%\桂在安康 v1.0.zip'; if (Test-Path $zipFile) { Remove-Item $zipFile -Force }; Add-Type -AssemblyName System.IO.Compression.FileSystem; $compression = [System.IO.Compression.CompressionLevel]::Optimal; [System.IO.Compression.ZipFile]::CreateFromDirectory($sourceDir, $zipFile, $compression, $false)"
    
    if exist "桂在安康 v1.0.zip" (
        echo ✅ 安装包创建成功：桂在安康 v1.0.zip
        echo.
        echo 📂 文件大小：
        dir "桂在安康 v1.0.zip" | find "桂在安康 v1.0.zip"
        echo.
        echo 💡 使用说明：
        echo 1. 将压缩包分享给他人
        echo 2. 解压到任意位置
        echo 3. 双击"本地测试.bat"启动
        echo.
    ) else (
        echo ❌ 创建失败，请手动压缩文件夹
        echo.
    )
    
    goto :end
)

echo 📦 正在创建压缩包...
echo.

:: 使用 7-Zip 压缩
%ZIP_CMD% a -tzip "桂在安康 v1.0.zip" ".\" -x!*.zip -x!*.md -x!.git

if exist "桂在安康 v1.0.zip" (
    echo ✅ 安装包创建成功：桂在安康 v1.0.zip
    echo.
    echo 📂 文件大小：
    dir "桂在安康 v1.0.zip" | find "桂在安康 v1.0.zip"
    echo.
    echo 💡 使用说明：
    echo 1. 将压缩包分享给他人
    echo 2. 解压到任意位置
    echo 3. 双击"本地测试.bat"启动
    echo.
) else (
    echo ❌ 创建失败
    echo.
)

:end
echo 按任意键退出...
pause >nul
