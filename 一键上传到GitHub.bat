@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"
title TradeFlow 一键上传到 GitHub

echo ==============================================
echo       TradeFlow 一键上传到 GitHub
echo ==============================================
echo.
echo 请先在 GitHub 新建一个空仓库：
echo https://github.com/new
echo.
echo 建议仓库名：tradeflow-platform
echo 请不要勾选 README、.gitignore 或 License。
echo.
set /p REPO_URL=请粘贴仓库地址（例如 https://github.com/用户名/tradeflow-platform.git）：

if "%REPO_URL%"=="" (
  echo.
  echo 未输入仓库地址，操作已取消。
  pause
  exit /b 1
)

git --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo 未检测到 Git，请先安装 Git for Windows。
  pause
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  git init
  git branch -M main
)

git add -A
git diff --cached --quiet
if errorlevel 1 git commit -m "Update TradeFlow platform"

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin "%REPO_URL%"
) else (
  git remote set-url origin "%REPO_URL%"
)

echo.
echo 正在上传。首次使用时，Git 可能打开浏览器要求登录 GitHub。
git push -u origin main

if errorlevel 1 (
  echo.
  echo 上传失败。请检查仓库地址、GitHub 登录状态和网络后重试。
  pause
  exit /b 1
)

echo.
echo 上传成功：%REPO_URL%
start "" "%REPO_URL:.git=%"
pause
