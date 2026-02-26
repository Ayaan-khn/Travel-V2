@echo off
echo ========================================
echo Starting TravelSync Backend API...
echo ========================================
echo.
echo Make sure you have installed the requirements:
echo   pip install -r backend/requirements.txt
echo.
echo Starting server at http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
