from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Attendance, Student
from app.schemas import AttendanceCreate, AttendanceResponse
from app.services.attendance_service import attendance_service

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.get("", response_model=List[AttendanceResponse])
def get_attendance(
    date: Optional[str] = Query(None, description="Filter by YYYY-MM-DD"),
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    db: Session = Depends(get_db)
):
    query = db.query(Attendance)
    if date:
        query = query.filter(Attendance.date == date)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)

    records = query.order_by(Attendance.id.desc()).all()
    result = []

    for r in records:
        student = db.query(Student).filter(Student.id == r.student_id).first()
        res = AttendanceResponse(
            id=r.id,
            student_id=r.student_id,
            date=r.date,
            time=r.time,
            status=r.status,
            confidence=r.confidence,
            student_name=student.name if student else f"Student #{r.student_id}"
        )
        result.append(res)

    return result


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance_manual(attendance_in: AttendanceCreate, db: Session = Depends(get_db)):
    success, msg, record = attendance_service.mark_attendance(
        db,
        student_id=attendance_in.student_id,
        confidence=attendance_in.confidence
    )

    if not success and not record:
        raise HTTPException(status_code=400, detail=msg)

    if not success and record:
        # Already marked today
        student = db.query(Student).filter(Student.id == record.student_id).first()
        return AttendanceResponse(
            id=record.id,
            student_id=record.student_id,
            date=record.date,
            time=record.time,
            status=record.status,
            confidence=record.confidence,
            student_name=student.name if student else f"Student #{record.student_id}"
        )

    student = db.query(Student).filter(Student.id == record.student_id).first()
    return AttendanceResponse(
        id=record.id,
        student_id=record.student_id,
        date=record.date,
        time=record.time,
        status=record.status,
        confidence=record.confidence,
        student_name=student.name if student else f"Student #{record.student_id}"
    )
