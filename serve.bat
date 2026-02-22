@echo off
echo Starting TravelSync server at http://localhost:8000
echo Open: http://localhost:8000/frontend/html/mainpage.html
echo.
cd /d "%~dp0frontend\html"
python -m http.server 8000
