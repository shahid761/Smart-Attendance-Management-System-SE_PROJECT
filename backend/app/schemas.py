from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# Student Schemas
class StudentBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    status: Optional[str] = "Active"


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    status: Optional[str] = None


class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    has_face_registered: bool = False
    attendance_percentage: float = 0.0

    class Config:
        from_attributes = True


# Attendance Schemas
class AttendanceBase(BaseModel):
    student_id: int
    date: str
    time: str
    status: str = "Present"
    confidence: float = 1.0


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    id: int
    student_name: Optional[str] = None

    class Config:
        from_attributes = True


# Face Recognition Schemas
class FaceRegisterRequest(BaseModel):
    student_id: int
    image_data: str  # Base64 string from webcam or file upload


class FaceRecognizeRequest(BaseModel):
    image_data: str  # Base64 string captured from webcam frame


class FaceRecognizeResponse(BaseModel):
    recognized: bool
    student_id: Optional[int] = None
    student_name: Optional[str] = None
    confidence: float = 0.0
    message: str
    attendance_marked: bool = False


# Activity Log Schema
class ActivityLogResponse(BaseModel):
    id: int
    event_type: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas
class WeeklyAttendance(BaseModel):
    day: str
    present: int
    absent: int


class LowAttendanceStudent(BaseModel):
    id: int
    name: str
    department: str
    attendance_percentage: float


class DashboardStatsResponse(BaseModel):
    total_students: int
    present_today: int
    absent_today: int
    attendance_percentage: float
    weekly_attendance: List[WeeklyAttendance]
    recent_activity: List[ActivityLogResponse]
    low_attendance_students: List[LowAttendanceStudent]
