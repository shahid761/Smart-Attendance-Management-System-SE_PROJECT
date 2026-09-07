from datetime import datetime, date, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.models import Student, Attendance, ActivityLog
from app.routes import students, attendance, recognition, tracking, dashboard

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Management System API",
    description="Backend API for Smart Management System with Biometric Attendance Tracking",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev prototype
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(recognition.router)
app.include_router(tracking.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def startup_event():
    """Seed initial sample data if the database is empty."""
    db = SessionLocal()
    try:
        if db.query(Student).count() == 0:
            sample_students = [
                Student(
                    name="Shahid Jamil",
                    email="alex.johnson@university.edu",
                    phone="+1 555-0192",
                    department="Computer Science",
                    course="B.Tech CS",
                    semester="6th",
                    status="Active"
                ),
                Student(
                    name="Sophia Martinez",
                    email="sophia.m@university.edu",
                    phone="+1 555-0184",
                    department="Electrical Engineering",
                    course="B.Tech EE",
                    semester="4th",
                    status="Active"
                ),
                Student(
                    name="Ethan Smith",
                    email="ethan.smith@university.edu",
                    phone="+1 555-0143",
                    department="Mechanical Engineering",
                    course="B.Tech ME",
                    semester="6th",
                    status="Active"
                ),
                Student(
                    name="Emma Watson",
                    email="emma.w@university.edu",
                    phone="+1 555-0111",
                    department="Computer Science",
                    course="M.Tech CS",
                    semester="2nd",
                    status="Active"
                ),
                Student(
                    name="Liam Brown",
                    email="liam.b@university.edu",
                    phone="+1 555-0199",
                    department="Information Technology",
                    course="B.Tech IT",
                    semester="8th",
                    status="Active"
                )
            ]
            db.add_all(sample_students)
            db.commit()

            # Seed past attendance records for demo statistics
            today = date.today()
            for s in db.query(Student).all():
                # Mark present for last few days
                for days_ago in range(1, 6):
                    # Give Liam low attendance for demo flagging
                    if s.name == "Liam Brown" and days_ago in [1, 2, 4]:
                        continue
                    past_date = (today - timedelta(days=days_ago)).isoformat()
                    att = Attendance(
                        student_id=s.id,
                        date=past_date,
                        time="09:00:00",
                        status="Present",
                        confidence=0.96
                    )
                    db.add(att)

            # Seed activity logs
            logs = [
                ActivityLog(
                    event_type="System initialized",
                    description="Smart Management System backend database initialized.",
                    created_at=datetime.utcnow() - timedelta(hours=2)
                ),
                ActivityLog(
                    event_type="Student created",
                    description="Demo student profiles loaded into system.",
                    created_at=datetime.utcnow() - timedelta(hours=1)
                )
            ]
            db.add_all(logs)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Smart Management System API is running",
        "docs_url": "/docs"
    }
