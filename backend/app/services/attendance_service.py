from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models import Student, Attendance, ActivityLog, FaceData
from app.schemas import DashboardStatsResponse, WeeklyAttendance, LowAttendanceStudent, ActivityLogResponse


class AttendanceService:
    @staticmethod
    def log_activity(db: Session, event_type: str, description: str):
        """Record an action in activity_logs."""
        log = ActivityLog(event_type=event_type, description=description, created_at=datetime.utcnow())
        db.add(log)
        db.commit()

    @staticmethod
    def mark_attendance(db: Session, student_id: int, confidence: float = 1.0) -> Tuple[bool, str, Any]:
        """
        Mark attendance for a student for today.
        Prevents duplicate attendance entries on the same day.
        """
        today_str = date.today().isoformat()  # YYYY-MM-DD
        time_str = datetime.now().strftime("%H:%M:%S")

        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return False, "Student not found", None

        existing = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.date == today_str
        ).first()

        if existing:
            return False, f"Attendance already marked for {student.name} today ({today_str})", existing

        new_attendance = Attendance(
            student_id=student_id,
            date=today_str,
            time=time_str,
            status="Present",
            confidence=confidence
        )
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)

        # Log Activity
        AttendanceService.log_activity(
            db,
            event_type="Attendance marked",
            description=f"Attendance marked as Present for {student.name} (ID: {student.id}) with confidence {int(confidence*100)}%"
        )

        return True, f"Attendance marked for {student.name}", new_attendance

    @staticmethod
    def calculate_student_percentage(db: Session, student_id: int) -> float:
        """Calculate student attendance percentage based on total unique class days recorded."""
        # Total distinct dates recorded in the attendance system
        distinct_dates_count = db.query(Attendance.date).distinct().count()
        if distinct_dates_count == 0:
            # If no attendance has been conducted yet, default to 100%
            return 100.0

        student_present_count = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.status == "Present"
        ).count()

        percentage = (student_present_count / distinct_dates_count) * 100.0
        return round(min(percentage, 100.0), 1)

    @staticmethod
    def get_dashboard_data(db: Session) -> Dict[str, Any]:
        """Compile complete dashboard statistics and analytics."""
        today_str = date.today().isoformat()
        total_students = db.query(Student).count()

        # Present today count
        present_today = db.query(Attendance).filter(
            Attendance.date == today_str,
            Attendance.status == "Present"
        ).count()

        absent_today = max(0, total_students - present_today)

        overall_attendance_pct = 0.0
        if total_students > 0:
            overall_attendance_pct = round((present_today / total_students) * 100.0, 1)

        # Weekly attendance (last 7 days)
        weekly_data: List[WeeklyAttendance] = []
        for i in range(6, -1, -1):
            day_date = date.today() - timedelta(days=i)
            day_str = day_date.isoformat()
            day_label = day_date.strftime("%a")

            p_count = db.query(Attendance).filter(
                Attendance.date == day_str,
                Attendance.status == "Present"
            ).count()

            a_count = max(0, total_students - p_count) if total_students > 0 else 0
            weekly_data.append(WeeklyAttendance(day=day_label, present=p_count, absent=a_count))

        # Recent activities (last 10)
        recent_logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10).all()
        recent_activity = [
            ActivityLogResponse(
                id=log.id,
                event_type=log.event_type,
                description=log.description,
                created_at=log.created_at
            )
            for log in recent_logs
        ]

        # Low attendance students (< 75%)
        low_attendance_students: List[LowAttendanceStudent] = []
        all_students = db.query(Student).all()
        for student in all_students:
            pct = AttendanceService.calculate_student_percentage(db, student.id)
            if pct < 75.0:
                low_attendance_students.append(
                    LowAttendanceStudent(
                        id=student.id,
                        name=student.name,
                        department=student.department or "N/A",
                        attendance_percentage=pct
                    )
                )

        return {
            "total_students": total_students,
            "present_today": present_today,
            "absent_today": absent_today,
            "attendance_percentage": overall_attendance_pct,
            "weekly_attendance": weekly_data,
            "recent_activity": recent_activity,
            "low_attendance_students": low_attendance_students
        }


attendance_service = AttendanceService()
