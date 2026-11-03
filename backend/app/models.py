from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    jurisdiction = Column(String, nullable=False)
    website = Column(String, nullable=False)
    contact_email = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    sources = relationship("Source", back_populates="agency")

class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True, index=True)
    agency_id = Column(String, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    source_type = Column(String, nullable=False) # 'API', 'RSS', 'HTML'
    permission_status = Column(String, nullable=False) # 'Approved', 'Conditional', 'Unverified'
    robots_txt_status = Column(String, nullable=False)
    terms_of_use_status = Column(String, nullable=False)
    refresh_frequency_minutes = Column(Integer, default=15)
    is_active = Column(Integer, default=1)
    last_attempted_at = Column(String, nullable=True)
    last_successful_fetch_at = Column(String, nullable=True)
    last_error = Column(Text, nullable=True)
    consecutive_failures = Column(Integer, default=0)
    health_status = Column(String, default="HEALTHY")
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    agency = relationship("Agency", back_populates="sources")

class Notice(Base):
    __tablename__ = "notices"

    notice_id = Column(String, primary_key=True, index=True)
    agency = Column(String, nullable=False, index=True)
    route_id = Column(String, nullable=False) # Comma-separated or primary route
    area = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    type = Column(String, nullable=False, index=True) # Route Diversion, Service Interruption, etc.
    is_type_inferred = Column(Integer, default=0)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    published_at = Column(String, nullable=False)
    valid_from = Column(String, nullable=False)
    valid_to = Column(String, nullable=True)
    status = Column(String, nullable=False, index=True) # Active, Scheduled, Expired, Cancelled, Withdrawn
    observed_at = Column(String, nullable=False)
    last_confirmed_at = Column(String, nullable=False)
    last_verified_at = Column(String, nullable=False)
    content_hash = Column(String, nullable=False)
    revision_id = Column(Integer, default=1)
    change_summary = Column(Text, nullable=True)
    source_id = Column(String, ForeignKey("sources.id", ondelete="SET NULL"), nullable=True)
    subscriber_filter = Column(String, nullable=True)
    alert_status = Column(String, default="SENT")
    alerted_at = Column(String, nullable=True)
    is_demo = Column(Integer, default=0)

    routes = relationship("NoticeRoute", back_populates="notice", cascade="all, delete-orphan")
    revisions = relationship("NoticeRevision", back_populates="notice", cascade="all, delete-orphan")

class NoticeRoute(Base):
    __tablename__ = "notice_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    notice_id = Column(String, ForeignKey("notices.notice_id", ondelete="CASCADE"), nullable=False, index=True)
    route_id = Column(String, nullable=False, index=True)
    route_name = Column(String, nullable=False)
    route_mode = Column(String, default="BUS")
    direction = Column(String, nullable=True)

    __table_args__ = (UniqueConstraint("notice_id", "route_id", name="uq_notice_route"),)
    notice = relationship("Notice", back_populates="routes")

class NoticeRevision(Base):
    __tablename__ = "notice_revisions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    notice_id = Column(String, ForeignKey("notices.notice_id", ondelete="CASCADE"), nullable=False, index=True)
    revision_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    valid_from = Column(String, nullable=False)
    valid_to = Column(String, nullable=True)
    content_hash = Column(String, nullable=False)
    change_type = Column(String, nullable=False) # NEW, REVISED, EXTENDED, WITHDRAWN, CANCELLED, EXPIRED
    change_summary = Column(Text, nullable=False)
    detected_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    affected_routes_json = Column(Text, nullable=False)

    notice = relationship("Notice", back_populates="revisions")

class ScrapeRun(Base):
    __tablename__ = "scrape_runs"

    id = Column(String, primary_key=True, index=True)
    source_id = Column(String, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(String, nullable=False)
    completed_at = Column(String, nullable=True)
    status = Column(String, nullable=False)
    notices_observed = Column(Integer, default=0)
    notices_new = Column(Integer, default=0)
    notices_updated = Column(Integer, default=0)
    notices_unchanged = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)

class ScrapeLog(Base):
    __tablename__ = "scrape_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String, nullable=True)
    source_id = Column(String, nullable=True, index=True)
    timestamp = Column(String, default=lambda: datetime.utcnow().isoformat())
    level = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    details_json = Column(Text, nullable=True)

class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    persona = Column(String, default="PASSENGER")
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    filters = relationship("SubscriberFilter", back_populates="subscriber", cascade="all, delete-orphan")

class SubscriberFilter(Base):
    __tablename__ = "subscriber_filters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subscriber_id = Column(String, ForeignKey("subscribers.id", ondelete="CASCADE"), nullable=False)
    agency = Column(String, nullable=True)
    route_id = Column(String, nullable=True)
    area = Column(String, nullable=True)
    advisory_type = Column(String, nullable=True)

    subscriber = relationship("Subscriber", back_populates="filters")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    notice_id = Column(String, ForeignKey("notices.notice_id", ondelete="CASCADE"), nullable=False)
    subscriber_id = Column(String, ForeignKey("subscribers.id", ondelete="CASCADE"), nullable=True)
    channel = Column(String, default="IN_APP")
    event_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    delivery_status = Column(String, default="DELIVERED")
    timestamp = Column(String, default=lambda: datetime.utcnow().isoformat())
    is_read = Column(Integer, default=0)
    dedup_key = Column(String, unique=True, nullable=False)

class ApplicationSetting(Base):
    __tablename__ = "application_settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())
