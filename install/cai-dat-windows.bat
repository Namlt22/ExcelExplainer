@echo off
chcp 65001 >nul
title Formula Explainer - Cai dat
echo.
echo  Formula Explainer - cai dat cho Excel tren Windows
echo  ---------------------------------------------------
set "DIR=%LOCALAPPDATA%\FormulaExplainer"
if not exist "%DIR%" mkdir "%DIR%"
echo  [1/2] Tai manifest.xml ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol='Tls12'; Invoke-WebRequest -UseBasicParsing 'https://namlt22.github.io/ExcelExplainer/manifest.xml' -OutFile '%DIR%\manifest.xml'"
if not exist "%DIR%\manifest.xml" (
  echo  Khong tai duoc manifest. Kiem tra ket noi mang roi chay lai.
  pause & exit /b 1
)
echo  [2/2] Dang ky add-in voi Excel ...
reg add "HKCU\Software\Microsoft\Office\16.0\WEF\Developer" /v "3f6ef35b-24e8-407e-a373-ee5188e99cef" /t REG_SZ /d "%DIR%\manifest.xml" /f >nul
echo.
echo  XONG! Tiep theo:
echo   1. Dong Excel (neu dang mo) roi mo lai.
echo   2. Nut "Giai thich cong thuc" nam o cuoi tab Home. Neu chua thay:
echo      Home ^> Add-ins ^> More Add-ins ^> My Add-ins ^> Developer Add-ins ^> Formula Explainer.
echo.
pause
