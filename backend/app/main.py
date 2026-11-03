from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from .database import engine, get_db, Base
from .models import Notice, NoticeRoute, NoticeRevision, Source, Agency, ScrapeRun, ScrapeLog, Notification, ApplicationSetting
from .services.change_detector import process_scraped_notice

app = FastAPI(
    title="TransitNotice API",
    description="Public Transport Service Update Tracker API - Cybernaut WEB-07",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "TransitNotice Python FastAPI", "version": "1.0.0"}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(Notice).count()
    active = db.query(Notice).filter(Notice.status == "Active").count()
    planned = db.query(Notice).filter(Notice.type.in_(["Planned Maintenance", "Service Interruption"])).count()
    diversions = db.query(Notice).filter(Notice.type == "Route Diversion").count()
    cancelled = db.query(Notice).filter(Notice.status == "Cancelled").count()
    expired = db.query(Notice).filter(Notice.status == "Expired").count()
    revised = db.query(Notice).filter(Notice.revision_id > 1).count()

    last_run = db.query(ScrapeRun).filter(ScrapeRun.status == "SUCCESS").order_by(ScrapeRun.started_at.desc()).first()

    return {
        "totalNotices": total,
        "activeAdvisories": active,
        "plannedInterruptions": planned,
        "routeDiversions": diversions,
        "cancelledNotices": cancelled,
        "expiredNotices": expired,
        "revisedNotices": revised,
        "lastSuccessfulRefresh": last_run.completed_at if last_run else "2026-10-31T08:00:00Z",
        "totalAgencies": db.query(Agency).count(),
        "totalSources": db.query(Source).count(),
        "healthySources": db.query(Source).filter(Source.health_status == "HEALTHY").count()
    }

@app.get("/api/notices")
def get_notices(
    search: Optional[str] = None,
    agency: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    route_id: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Notice)

    if search:
        query = query.filter(
            (Notice.title.ilike(f"%{search}%")) |
            (Notice.summary.ilike(f"%{search}%")) |
            (Notice.description.ilike(f"%{search}%")) |
            (Notice.area.ilike(f"%{search}%"))
        )

    if agency and agency != "ALL":
        query = query.filter(Notice.agency == agency)

    if type and type != "ALL":
        query = query.filter(Notice.type == type)

    if status and status != "ALL":
        query = query.filter(Notice.status == status)

    if route_id:
        query = query.join(NoticeRoute).filter(NoticeRoute.route_id == route_id)

    total = query.count()
    offset = (page - 1) * limit
    notices = query.order_by(Notice.published_at.desc()).offset(offset).limit(limit).all()

    return {
        "notices": notices,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit if limit else 1
        }
    }

@app.get("/api/notices/{notice_id}")
def get_notice_detail(notice_id: str, db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.notice_id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    routes = db.query(NoticeRoute).filter(NoticeRoute.notice_id == notice_id).all()
    revisions = db.query(NoticeRevision).filter(NoticeRevision.notice_id == notice_id).order_by(NoticeRevision.revision_id.desc()).all()
    return {
        **notice.__dict__,
        "affected_routes": routes,
        "revisions": revisions
    }

@app.get("/api/agencies")
def get_agencies(db: Session = Depends(get_db)):
    agencies = db.query(Agency).all()
    return {"agencies": agencies}

@app.get("/api/sources")
def get_sources(db: Session = Depends(get_db)):
    sources = db.query(Source).all()
    return {"sources": sources}

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifications = db.query(Notification).order_by(Notification.timestamp.desc()).all()
    unread = db.query(Notification).filter(Notification.is_read == 0).count()
    return {"notifications": notifications, "unreadCount": unread}
