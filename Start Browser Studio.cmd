@echo off
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" preview_browser.py
) else (
  py -3 preview_browser.py
)
pause
