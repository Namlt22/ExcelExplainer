@echo off
title Formula Explainer - Go cai dat
reg delete "HKCU\Software\Microsoft\Office\16.0\WEF\Developer" /v "3f6ef35b-24e8-407e-a373-ee5188e99cef" /f >nul 2>&1
rmdir /s /q "%LOCALAPPDATA%\FormulaExplainer" 2>nul
echo Da go Formula Explainer. Mo lai Excel de cap nhat.
pause
