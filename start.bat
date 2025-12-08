@echo off
echo Starting Cash Flow Application...

REM Start backend
cd backend
cmd /c start "Backend" cmd /k "Scripts\python.exe app.py"
cd ..

REM Wait a moment
timeout /t 3 >nul

REM Start frontend
cd frontend
cmd /c start "Frontend" cmd /k "npm start"
cd ..

REM Wait and open browser
timeout /t 5 >nul
start http://localhost:3000

echo Application started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
