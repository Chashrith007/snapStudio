@echo off
cd /d "%~dp0"
echo Starting SnapStudio. Your browser will open automatically.
echo Keep this window open while using the booth. Close it to stop.
".venv\Scripts\python.exe" app.py
pause
