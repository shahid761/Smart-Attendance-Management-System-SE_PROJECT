from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    course = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    face_data = relationship("FaceData", back_populates="student", uselist=False, cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    time = Column(String, nullable=False)  # HH:MM:SS
    status = Column(String, default="Present")
    confidence = Column(Float, default=1.0)

    student = relationship("Student", back_populates="attendance_records")


class FaceData(Base):
    __tablename__ = "face_data"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, unique=True)
    face_reference = Column(Text, nullable=False)  # Base64 encoded crop or encoding string

    student = relationship("Student", back_populates="face_data")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)  # Student created, Student updated, Face recognized, Attendance marked
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
