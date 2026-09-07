from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ActivityLog
from app.schemas import ActivityLogResponse

router = APIRouter(prefix="/api/tracking", tags=["Tracking"])


@router.get("", response_model=List[ActivityLogResponse])
def get_tracking_logs(db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(100).all()
    return [
        ActivityLogResponse(
            id=log.id,
            event_type=log.event_type,
            description=log.description,
            created_at=log.created_at
        )
        for log in logs
    ]
