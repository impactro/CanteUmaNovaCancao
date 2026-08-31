@echo off
setlocal
if /I "%~1"=="initialize" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0initialize-android-dependencies.ps1" %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
if /I "%~1"=="finalize" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0finalize-android-dependencies.ps1" %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
echo Uso: %~nx0 initialize [-IncludeAvdImage] ou finalize [-RemoveAvd] [-RemoveSdk] [-RemoveArtifacts]
exit /b 2
