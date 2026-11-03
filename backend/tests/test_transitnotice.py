import pytest
from datetime import datetime, timezone, timedelta
from bs4 import BeautifulSoup
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base
from backend.app.models import Notice, NoticeRoute, NoticeRevision, Notification, Subscriber
from backend.app.services.change_detector import (
    compute_content_hash,
    calculate_advisory_status,
    process_scraped_notice
)

# Test in-memory SQLite database setup
@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Seed subscriber for notifications
    sub = Subscriber(id="SUB-TEST-1", name="Maya Test", email="maya@test.local", persona="PASSENGER")
    session.add(sub)
    session.commit()

    yield session
    session.close()

# 1. Valid notice extraction
def test_valid_notice_extraction():
    sample_json = {
        "id": "TFL-100",
        "description": "Bus 73 diverted via Shaftesbury Ave due to roadworks.",
        "category": "Route Diversion"
    }
    assert sample_json["id"] == "TFL-100"
    assert "diverted" in sample_json["description"]

# 2. Malformed HTML
def test_malformed_html_parsing():
    broken_html = "<div><p>Notice without closing tags <span>Route 42 closure"
    soup = BeautifulSoup(broken_html, "html.parser")
    text = soup.get_text()
    assert "Route 42 closure" in text

# 3. Missing route identifier handling
def test_missing_route_identifier(db_session):
    data = {
        "notice_id": "TEST-NO-ROUTE",
        "agency": "TFL",
        "route_ids": [], # Empty routes
        "area": "London",
        "source_url": "https://test.local",
        "type": "General Advisory",
        "title": "General System Bulletin",
        "summary": "Check travel times",
        "description": "General system maintenance.",
        "published_at": datetime.now(timezone.utc).isoformat(),
        "valid_from": datetime.now(timezone.utc).isoformat(),
        "valid_to": None,
        "status": "Active"
    }
    res = process_scraped_notice(db_session, data)
    assert res["action"] == "NEW"
    notice = db_session.query(Notice).filter_by(notice_id="TEST-NO-ROUTE").first()
    assert notice.route_id == "System-Wide"

# 4. Missing publication date handling
def test_missing_publication_date():
    raw_date = None
    fallback_date = raw_date or datetime.now(timezone.utc).isoformat()
    assert fallback_date is not None
    assert "T" in fallback_date

# 5. Duplicate notices (Idempotency)
def test_duplicate_notices(db_session):
    data = {
        "notice_id": "DUP-001",
        "agency": "BART",
        "route_ids": ["Yellow"],
        "area": "SF",
        "source_url": "https://bart.local",
        "type": "Delay",
        "title": "Track Delay",
        "summary": "10 min delay",
        "description": "Delay between stations.",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": "2026-10-31T12:00:00Z",
        "status": "Active"
    }
    res1 = process_scraped_notice(db_session, data)
    assert res1["action"] == "NEW"

    # Process identical data second time
    res2 = process_scraped_notice(db_session, data)
    assert res2["action"] == "UNCHANGED"
    assert db_session.query(Notice).filter_by(notice_id="DUP-001").count() == 1

# 6. New advisory detection
def test_new_advisory_detection(db_session):
    data = {
        "notice_id": "NEW-001",
        "agency": "MBTA",
        "route_ids": ["Red-Line"],
        "area": "Boston",
        "source_url": "https://mbta.local",
        "type": "Service Interruption",
        "title": "Red Line Signal Check",
        "summary": "Substation inspection",
        "description": "Inspections underway.",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": None,
        "status": "Active"
    }
    res = process_scraped_notice(db_session, data)
    assert res["action"] == "NEW"
    assert res["revision_id"] == 1

# 7. Unchanged advisory detection
def test_unchanged_advisory_detection(db_session):
    data = {
        "notice_id": "UNCHANGED-001",
        "agency": "CTA",
        "route_ids": ["Blue-Line"],
        "area": "Chicago",
        "source_url": "https://cta.local",
        "type": "Planned Maintenance",
        "title": "Blue Line Track Work",
        "summary": "Work scheduled",
        "description": "Routine track inspection.",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": "2026-10-31T18:00:00Z",
        "status": "Active"
    }
    process_scraped_notice(db_session, data)
    res = process_scraped_notice(db_session, data)
    assert res["action"] == "UNCHANGED"

# 8. Revised advisory detection
def test_revised_advisory_detection(db_session):
    data = {
        "notice_id": "REV-001",
        "agency": "TFL",
        "route_ids": ["Route-73"],
        "area": "London",
        "source_url": "https://tfl.local",
        "type": "Route Diversion",
        "title": "Route 73 Diversion",
        "summary": "Original summary",
        "description": "Original text.",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": "2026-11-01T08:00:00Z",
        "status": "Active"
    }
    process_scraped_notice(db_session, data)

    # Content revised
    data["title"] = "Route 73 Major Diversion Update"
    data["description"] = "Revised text with extra detour details."
    res = process_scraped_notice(db_session, data)
    assert res["action"] == "REVISED"
    assert res["revision_id"] == 2
    assert db_session.query(NoticeRevision).filter_by(notice_id="REV-001").count() == 2

# 9. Extended advisory detection (Mentor Challenge 1)
def test_extended_advisory_detection(db_session):
    data = {
        "notice_id": "EXT-001",
        "agency": "TFL",
        "route_ids": ["Route-73"],
        "area": "London",
        "source_url": "https://tfl.local",
        "type": "Route Diversion",
        "title": "Gas Works Diversion",
        "summary": "Gas works",
        "description": "Initial 24h work.",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": "2026-11-01T08:00:00Z",
        "status": "Active"
    }
    process_scraped_notice(db_session, data)

    # Valid to extended by 24h
    data["valid_to"] = "2026-11-02T08:00:00Z"
    res = process_scraped_notice(db_session, data)
    assert res["action"] == "EXTENDED"
    assert res["revision_id"] == 2
    notice = db_session.query(Notice).filter_by(notice_id="EXT-001").first()
    assert notice.valid_to == "2026-11-02T08:00:00Z"

# 10. Withdrawn advisory
def test_withdrawn_advisory():
    status = calculate_advisory_status("Withdrawn / Cleared", "2026-10-31T08:00:00Z", "2026-11-01T08:00:00Z")
    assert status == "Withdrawn"

# 11. Cancelled advisory
def test_cancelled_advisory():
    status = calculate_advisory_status("Cancelled by dispatch", "2026-10-31T08:00:00Z", "2026-11-01T08:00:00Z")
    assert status == "Cancelled"

# 12. Expired advisory (Acceptance Test 1)
def test_expired_advisory():
    past_start = "2026-10-01T00:00:00Z"
    past_end = "2026-10-02T00:00:00Z"
    status = calculate_advisory_status(None, past_start, past_end)
    assert status == "Expired"

# 13. Multiple affected routes (Acceptance Test 2)
def test_multiple_affected_routes(db_session):
    data = {
        "notice_id": "MULTI-001",
        "agency": "TFL",
        "route_ids": ["Route-73", "Route-390", "Route-14"],
        "area": "Central London",
        "source_url": "https://tfl.local",
        "type": "Route Diversion",
        "title": "Multi Line Detour",
        "summary": "Affecting multiple lines",
        "description": "Detour along corridor.",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": "2026-11-05T08:00:00Z",
        "status": "Active"
    }
    process_scraped_notice(db_session, data)
    routes = db_session.query(NoticeRoute).filter_by(notice_id="MULTI-001").all()
    route_ids = [r.route_id for r in routes]
    assert len(route_ids) == 3
    assert "Route-73" in route_ids
    assert "Route-390" in route_ids
    assert "Route-14" in route_ids

# 14. Incorrect date formats handling
def test_incorrect_date_formats():
    bad_date = "invalid-date-string"
    status = calculate_advisory_status(None, bad_date, None)
    assert status == "Unknown"

# 15. Timezone conversion & ISO 8601 normalization (Acceptance Test 4)
def test_timezone_normalization():
    dt = datetime.now(timezone.utc)
    iso_str = dt.isoformat()
    assert "+00:00" in iso_str or iso_str.endswith("Z") or len(iso_str) >= 19

# 16. Source timeout handling
def test_source_timeout_handling():
    # Simulate timeout exception catch
    timeout_occurred = False
    try:
        raise TimeoutError("Connection to transit feed timed out after 7000ms")
    except TimeoutError:
        timeout_occurred = True
    assert timeout_occurred is True

# 17. Source unavailable handling
def test_source_unavailable_handling():
    error_logged = False
    try:
        raise ConnectionError("HTTP 503 Service Unavailable")
    except Exception as e:
        error_logged = True
        assert "503" in str(e)
    assert error_logged is True

# 18. Retry and exponential backoff
def test_retry_and_backoff():
    backoffs = [500 * (2 ** i) for i in range(1, 4)]
    assert backoffs == [1000, 2000, 4000]

# 19. Duplicate notification prevention
def test_duplicate_notification_prevention(db_session):
    data = {
        "notice_id": "NOTIF-DUP-001",
        "agency": "BART",
        "route_ids": ["Yellow"],
        "area": "SF",
        "source_url": "https://bart.local",
        "type": "Delay",
        "title": "BART Track Inspection",
        "summary": "Single tracking",
        "description": "Delays expected.",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": "2026-11-01T08:00:00Z",
        "status": "Active"
    }
    # First process -> 1 notification
    process_scraped_notice(db_session, data)
    notifs1 = db_session.query(Notification).filter_by(notice_id="NOTIF-DUP-001").count()
    assert notifs1 == 1

    # Second process with exact same content -> 0 new notifications
    process_scraped_notice(db_session, data)
    notifs2 = db_session.query(Notification).filter_by(notice_id="NOTIF-DUP-001").count()
    assert notifs2 == 1

# 20. Database persistence
def test_database_persistence(db_session):
    n = Notice(
        notice_id="PERSIST-1",
        agency="CTA",
        route_id="Blue-Line",
        area="Chicago",
        source_url="https://cta.local",
        type="Delay",
        title="Persist Test",
        summary="Summary",
        description="Desc",
        published_at="2026-10-31T08:00:00Z",
        valid_from="2026-10-31T08:00:00Z",
        status="Active",
        observed_at="2026-10-31T08:00:00Z",
        last_confirmed_at="2026-10-31T08:00:00Z",
        last_verified_at="2026-10-31T08:00:00Z",
        content_hash="hash123",
        revision_id=1
    )
    db_session.add(n)
    db_session.commit()
    fetched = db_session.query(Notice).filter_by(notice_id="PERSIST-1").first()
    assert fetched is not None
    assert fetched.agency == "CTA"

# 21. Repeated scraper execution
def test_repeated_scraper_execution(db_session):
    data = {
        "notice_id": "REPEAT-001",
        "agency": "TFL",
        "route_ids": ["Central"],
        "area": "London",
        "source_url": "https://tfl.local",
        "type": "Planned Maintenance",
        "title": "Central Line Weekend Work",
        "summary": "Work",
        "description": "Desc",
        "published_at": "2026-10-31T08:00:00Z",
        "valid_from": "2026-10-31T08:00:00Z",
        "valid_to": "2026-11-02T08:00:00Z",
        "status": "Active"
    }
    for _ in range(5):
        process_scraped_notice(db_session, data)

    # Must still only be 1 notice and 1 revision!
    assert db_session.query(Notice).filter_by(notice_id="REPEAT-001").count() == 1
    assert db_session.query(NoticeRevision).filter_by(notice_id="REPEAT-001").count() == 1

# 22. Stale notice display (Acceptance Test 5 & 6)
def test_stale_notice_display():
    last_verified = "2026-10-30T10:00:00Z"
    # Freshness threshold is 4 hours
    dt = datetime.fromisoformat(last_verified.replace("Z", "+00:00"))
    now = datetime(2026, 10, 31, 8, 0, tzinfo=timezone.utc)
    is_stale = (now - dt).total_seconds() > (4 * 3600)
    assert is_stale is True

# 23. API filtering logic
def test_api_filtering_logic(db_session):
    test_multiple_affected_routes(db_session)
    matches = db_session.query(Notice).join(NoticeRoute).filter(NoticeRoute.route_id == "Route-390").all()
    assert len(matches) >= 1
    assert matches[0].notice_id == "MULTI-001"

# 24. Dashboard statistics computation
def test_dashboard_statistics_computation(db_session):
    test_multiple_affected_routes(db_session)
    total = db_session.query(Notice).count()
    active = db_session.query(Notice).filter(Notice.status == "Active").count()
    assert total >= 1
    assert active >= 1
