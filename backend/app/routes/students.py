from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student, FaceData
from app.schemas import StudentCreate, StudentUpdate, StudentResponse
from app.services.attendance_service import attendance_service

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=List[StudentResponse])
def get_students(
    search: Optional[str] = Query(None, description="Search by name, email or department"),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(search_pattern)) |
            (Student.email.ilike(search_pattern)) |
            (Student.department.ilike(search_pattern)) |
            (Student.course.ilike(search_pattern))
        )
    
    students = query.order_by(Student.id.desc()).all()
    result = []
    
    for s in students:
        has_face = db.query(FaceData).filter(FaceData.student_id == s.id).first() is not None
        pct = attendance_service.calculate_student_percentage(db, s.id)
        
        s_dict = StudentResponse(
            id=s.id,
            name=s.name,
            email=s.email,
            phone=s.phone,
            department=s.department,
            course=s.course,
            semester=s.semester,
            status=s.status,
            created_at=s.created_at,
            has_face_registered=has_face,
            attendance_percentage=pct
        )
        result.append(s_dict)
        
    return result


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.email == student_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this email already exists")
    
    student = Student(**student_in.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)

    attendance_service.log_activity(
        db,
        event_type="Student created",
        description=f"Created new student {student.name} ({student.email}) in department {student.department or 'N/A'}"
    )

    return StudentResponse(
        id=student.id,
        name=student.name,
        email=student.email,
        phone=student.phone,
        department=student.department,
        course=student.course,
        semester=student.semester,
        status=student.status,
        created_at=student.created_at,
        has_face_registered=False,
        attendance_percentage=100.0
    )


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    has_face = db.query(FaceData).filter(FaceData.student_id == student.id).first() is not None
    pct = attendance_service.calculate_student_percentage(db, student.id)

    return StudentResponse(
        id=student.id,
        name=student.name,
        email=student.email,
        phone=student.phone,
        department=student.department,
        course=student.course,
        semester=student.semester,
        status=student.status,
        created_at=student.created_at,
        has_face_registered=has_face,
        attendance_percentage=pct
    )


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student_in: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    attendance_service.log_activity(
        db,
        event_type="Student updated",
        description=f"Updated details for student {student.name} (ID: {student.id})"
    )

    has_face = db.query(FaceData).filter(FaceData.student_id == student.id).first() is not None
    pct = attendance_service.calculate_student_percentage(db, student.id)

    return StudentResponse(
        id=student.id,
        name=student.name,
        email=student.email,
        phone=student.phone,
        department=student.department,
        course=student.course,
        semester=student.semester,
        status=student.status,
        created_at=student.created_at,
        has_face_registered=has_face,
        attendance_percentage=pct
    )


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_name = student.name
    db.delete(student)
    db.commit()

    attendance_service.log_activity(
        db,
        event_type="Student deleted",
        description=f"Deleted student {student_name} (ID: {student_id})"
    )
