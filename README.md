# Smart Management System Prototype

A lightweight, web-based prototype demonstrating core student management, biometric face-recognition attendance, and activity tracking built with **React**, **FastAPI**, **SQLite**, and **OpenCV**.

---

## Capabilities & Architecture

1. **Student Management**: Full CRUD operations for student profiles, contact information, department classification, and attendance records.
2. **Biometric Face Recognition**: Real-time webcam streaming & frame processing powered by OpenCV for face detection and matching.
3. **Automated Attendance**: Automatic attendance marking on face match with same-day duplicate prevention.
4. **Attendance Analytics & Flagging**: Calculates live attendance percentages and flags students falling below the 75% threshold.
5. **Activity & Audit Logging**: Real-time activity timeline tracking key system events.
6. **Reports & Export**: Interactive data breakdown with CSV export capabilities.

---

## Directory Structure

```text
smart-management-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StudentModal.jsx
│   │   │   ├── WebcamCapture.jsx
│   │   │   └── AttendanceChart.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Recognition.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Tracking.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routes/
│   │   │   ├── students.py
│   │   │   ├── attendance.py
│   │   │   ├── recognition.py
│   │   │   ├── tracking.py
│   │   │   └── dashboard.py
│   │   └── services/
│   │       ├── face_service.py
│   │       └── attendance_service.py
│   └── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## Quick Start & Setup Instructions

### 1. Backend Setup (FastAPI & Python)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

FastAPI interactive documentation will be accessible at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 2. Frontend Setup (React & Vite)

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your web browser at [http://localhost:5173](http://localhost:5173).

---

## Complete Workflow Demonstration

1. Navigate to **Students** and click **Add Student**.
2. Capture or upload a face reference image for the student.
3. Open **Biometric Recognition** and click **Capture & Recognize** (or enable Auto Scan).
4. The system detects the face, matches the registered student, auto-marks attendance, and prevents duplicate logs.
5. Check updated metrics on **Dashboard**, event history on **Tracking**, and export formatted CSV reports on **Reports**.
