from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student, FaceData
from app.schemas import FaceRegisterRequest, FaceRecognizeRequest, FaceRecognizeResponse
from app.services.face_service import face_service
from app.services.attendance_service import attendance_service

router = APIRouter(prefix="/api/recognition", tags=["Recognition"])


@router.post("/register", status_code=status.HTTP_200_OK)
def register_face(payload: FaceRegisterRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate image and crop face
    img = face_service.base64_to_image(payload.image_data)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image payload")

    cropped_face = face_service.detect_and_crop_face(img)
    if cropped_face is None:
        raise HTTPException(status_code=400, detail="No face detected in the provided image")

    face_b64 = face_service.image_to_base64(cropped_face)

    # Check existing face data for student
    existing = db.query(FaceData).filter(FaceData.student_id == student.id).first()
    if existing:
        existing.face_reference = face_b64
    else:
        new_face = FaceData(student_id=student.id, face_reference=face_b64)
        db.add(new_face)

    db.commit()

    attendance_service.log_activity(
        db,
        event_type="Face registered",
        description=f"Biometric face reference registered for {student.name} (ID: {student.id})"
    )

    return {
        "message": f"Face registered successfully for student {student.name}",
        "student_id": student.id,
        "student_name": student.name
    }


@router.post("/recognize", response_model=FaceRecognizeResponse)
def recognize_face(payload: FaceRecognizeRequest, db: Session = Depends(get_db)):
    # Fetch all registered face samples
    face_records = db.query(FaceData).all()
    if not face_records:
        return FaceRecognizeResponse(
            recognized=False,
            confidence=0.0,
            message="No registered student faces found in database",
            attendance_marked=False
        )

    registered_faces = [(fr.student_id, fr.face_reference) for fr in face_records]

    is_recognized, student_id, confidence = face_service.recognize_student(
        payload.image_data, registered_faces
    )

    if not is_recognized or student_id is None:
        return FaceRecognizeResponse(
            recognized=False,
            confidence=confidence,
            message="Face not recognized or low confidence score",
            attendance_marked=False
        )

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return FaceRecognizeResponse(
            recognized=False,
            confidence=confidence,
            message="Recognized student profile no longer exists",
            attendance_marked=False
        )

    # Log face recognition event
    attendance_service.log_activity(
        db,
        event_type="Face recognized",
        description=f"Identified student {student.name} with {int(confidence * 100)}% match confidence"
    )

    # Automatically mark attendance for today
    marked_success, msg, _ = attendance_service.mark_attendance(
        db, student_id=student.id, confidence=confidence
    )

    return FaceRecognizeResponse(
        recognized=True,
        student_id=student.id,
        student_name=student.name,
        confidence=confidence,
        message=msg,
        attendance_marked=marked_success
    )
