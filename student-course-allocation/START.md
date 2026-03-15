# HOW TO RUN

## ONE-TIME SETUP

### Terminal 1 - Backend Setup
```powershell
cd "C:\Users\User\Documents\student course allocation system\student-course-allocation\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd database
python setup.py
cd ..
python app.py
```

### Terminal 2 - Frontend Setup
```powershell
cd "C:\Users\User\Documents\student course allocation system\student-course-allocation\frontend"
npm install
npm run dev
```

## EVERY TIME AFTER THAT

### Terminal 1
```powershell
cd "C:\Users\User\Documents\student course allocation system\student-course-allocation\backend"
.\venv\Scripts\Activate.ps1
python app.py
```

### Terminal 2
```powershell
cd "C:\Users\User\Documents\student course allocation system\student-course-allocation\frontend"
npm run dev
```

## OPEN BROWSER
http://localhost:3000

## LOGIN
- Admin: admin@university.edu / admin123
- Or register a new student account
