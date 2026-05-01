@echo off
echo =========================================
echo   NYAYADARSI - Development Setup
echo   AI-Powered Procurement Justice Platform
echo =========================================
echo.

echo [1/4] Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..
echo   Backend dependencies installed.
echo.

echo [2/4] Initializing database...
cd backend
python -c "from database import init_db; init_db()"
cd ..
echo   Database initialized.
echo.

echo [3/4] Seeding demo data...
python scripts\seed_demo.py
echo.

echo [4/4] Setting up frontend...
cd frontend
call npm install
cd ..
echo   Frontend dependencies installed.
echo.

echo =========================================
echo   Setup Complete!
echo.
echo   Start backend:
echo     cd backend
echo     venv\Scripts\activate
echo     python -m uvicorn main:app --reload
echo.
echo   Start frontend (new terminal):
echo     cd frontend
echo     npm run dev
echo =========================================
