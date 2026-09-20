@echo off
chcp 65001 >nul
cd /d "%~dp0"
title TradeFlow 启动器

set "NODE=C:\Users\pengw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "NPMCLI=C:\Users\pengw\Documents\ChatGPT\彭\tooling\package\bin\npm-cli.js"

if not exist "%NODE%" (
  echo [错误] 未找到 Node.js：%NODE%
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 首次运行，正在安装依赖，请稍候...
  "%NODE%" "%NPMCLI%" ci
  if errorlevel 1 (
    echo [错误] 依赖安装失败。
    pause
    exit /b 1
  )
)

echo 正在启动 TradeFlow...
start "TradeFlow 服务" "%ComSpec%" /k ""%NODE%" "%NPMCLI%" run dev"
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173/"
echo 已在浏览器打开：http://localhost:5173/
exit /b 0
