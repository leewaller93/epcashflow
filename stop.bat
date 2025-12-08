@echo off
echo Stopping Cash Flow Application...

taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo Application stopped!
pause


