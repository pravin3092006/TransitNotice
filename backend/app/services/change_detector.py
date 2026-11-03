import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models import Notice, NoticeRoute, NoticeRevision, Notification, Subscriber, SubscriberFilter

def compute_content_hash(
    title: str,
    description: str,
    advisory_type: str,
    routes: List[str],
    valid_from: str,
    valid_to: Optional[str],
    status: str
) -> str:
    norm_routes = ",".join(sorted(routes))
    raw = f"{title.strip().lower()}||{description.strip().lower()}||{advisory_type.strip()}||{norm_routes}||{valid_from}||{valid_to or 'NO_END_DATE'}||{status}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def calculate_advisory_status(
    announced_status: Optional[str],
    valid_from_str: str,
    valid_to_str: Optional[str]
) -> str:
    """
    Mandatory Acceptance Test 1: Expired advisory is not marked active.
    Mandatory Acceptance Test 4: Timezone aware calculation.
    Mentor Challenge 2: Advisory without end date is NOT marked expired.
    """
    if announced_status:
        s = announced_status.lower()
        if "cancel" in s:
            return "Cancelled"
        if "withdrawn" in s or "clear" in s or "resolved" in s:
            return "Withdrawn"

    now = datetime.now(timezone.utc)
    try:
        valid_from = datetime.fromisoformat(valid_from_str.replace("Z", "+00:00"))
        if valid_from > now:
            return "Scheduled"
    except Exception:
        return "Unknown"

    if valid_to_str and valid_to_str.strip():
        try:
            valid_to = datetime.fromisoformat(valid_to_str.replace("Z", "+00:00"))
            if now > valid_to:
                return "Expired"
        except Exception:
            pass

    return "Active"

def process_scraped_notice(db: Session, data: Dict[str, Any]) -> Dict[str, Any]:
    now_iso = datetime.now(timezone.utc).isoformat()
    status = calculate_advisory_status(data.get("status"), data["valid_from"], data.get("valid_to"))

    route_ids = [r.strip() for r in data.get("route_ids", []) if r.strip()]
    if not route_ids:
        route_ids = [data.get("route_id", "System-Wide")]
    primary_route = ", ".join(route_ids)

    content_hash = compute_content_hash(
        data["title"],
        data["description"],
        data["type"],
        route_ids,
        data["valid_from"],
        data.get("valid_to"),
        status
    )

    existing = db.query(Notice).filter(Notice.notice_id == data["notice_id"]).first()

    if not existing:
        # 1. NEW ADVISORY
        rev_id = 1
        change_summary = f"Initial advisory recorded for route(s) {primary_route}."
        notice = Notice(
            notice_id=data["notice_id"],
            agency=data["agency"],
            route_id=primary_route,
            area=data["area"],
            source_url=data["source_url"],
            type=data["type"],
            is_type_inferred=1 if data.get("is_type_inferred") else 0,
            title=data["title"],
            summary=data["summary"],
            description=data["description"],
            published_at=data["published_at"],
            valid_from=data["valid_from"],
            valid_to=data.get("valid_to"),
            status=status,
            observed_at=now_iso,
            last_confirmed_at=now_iso,
            last_verified_at=now_iso,
            content_hash=content_hash,
            revision_id=rev_id,
            change_summary=change_summary,
            source_id=data.get("source_id"),
            subscriber_filter=data["area"],
            alert_status="SENT",
            alerted_at=now_iso,
            is_demo=1 if data.get("is_demo") else 0
        )
        db.add(notice)

        # Multi-routes
        for r_id in route_ids:
            db.add(NoticeRoute(
                notice_id=data["notice_id"],
                route_id=r_id,
                route_name=f"Route {r_id}",
                route_mode="BUS"
            ))

        # Revision v1
        db.add(NoticeRevision(
            notice_id=data["notice_id"],
            revision_id=rev_id,
            title=data["title"],
            summary=data["summary"],
            description=data["description"],
            type=data["type"],
            status=status,
            valid_from=data["valid_from"],
            valid_to=data.get("valid_to"),
            content_hash=content_hash,
            change_type="NEW",
            change_summary=change_summary,
            detected_at=now_iso,
            affected_routes_json=json.dumps(route_ids)
        ))

        # Alert dispatch
        _dispatch_alerts(db, data["notice_id"], rev_id, "NEW_ADVISORY", f"New Advisory: {data['title']}", change_summary)
        db.commit()

        return {
            "action": "NEW",
            "notice_id": data["notice_id"],
            "revision_id": rev_id,
            "change_summary": change_summary,
            "alert_generated": True
        }

    # 2. UNCHANGED
    if existing.content_hash == content_hash:
        existing.last_confirmed_at = now_iso
        existing.last_verified_at = now_iso
        db.commit()
        return {
            "action": "UNCHANGED",
            "notice_id": data["notice_id"],
            "revision_id": existing.revision_id,
            "change_summary": "Unchanged advisory confirmed in source feed.",
            "alert_generated": False
        }

    # 3. CHANGED: EXTENDED, REVISED, CANCELLED, OR WITHDRAWN
    change_type = "REVISED"
    diff_msg = []

    if data.get("valid_to") and existing.valid_to:
        if data["valid_to"] > existing.valid_to:
            change_type = "EXTENDED"
            diff_msg.append("Service outage extended by transit agency.")
    elif status == "Cancelled" and existing.status != "Cancelled":
        change_type = "CANCELLED"
        diff_msg.append("Service notice officially cancelled.")

    if not diff_msg:
        diff_msg.append("Advisory details modified by source.")

    new_rev = existing.revision_id + 1
    full_summary = " ".join(diff_msg)

    # Update notice
    existing.title = data["title"]
    existing.summary = data["summary"]
    existing.description = data["description"]
    existing.type = data["type"]
    existing.valid_to = data.get("valid_to")
    existing.status = status
    existing.content_hash = content_hash
    existing.revision_id = new_rev
    existing.change_summary = full_summary
    existing.last_confirmed_at = now_iso
    existing.last_verified_at = now_iso
    existing.alerted_at = now_iso

    # Append Revision
    db.add(NoticeRevision(
        notice_id=data["notice_id"],
        revision_id=new_rev,
        title=data["title"],
        summary=data["summary"],
        description=data["description"],
        type=data["type"],
        status=status,
        valid_from=data["valid_from"],
        valid_to=data.get("valid_to"),
        content_hash=content_hash,
        change_type=change_type,
        change_summary=full_summary,
        detected_at=now_iso,
        affected_routes_json=json.dumps(route_ids)
    ))

    _dispatch_alerts(db, data["notice_id"], new_rev, f"{change_type}_ADVISORY", f"Update: {data['title']}", full_summary)
    db.commit()

    return {
        "action": change_type,
        "notice_id": data["notice_id"],
        "revision_id": new_rev,
        "change_summary": full_summary,
        "alert_generated": True
    }

def _dispatch_alerts(db: Session, notice_id: str, rev_id: int, event_type: str, title: str, message: str):
    subscribers = db.query(Subscriber).all()
    now_iso = datetime.now(timezone.utc).isoformat()
    for sub in subscribers:
        dedup = f"DEDUP-{notice_id}-REV-{rev_id}-SUB-{sub.id}"
        exists = db.query(Notification).filter(Notification.dedup_key == dedup).first()
        if not exists:
            db.add(Notification(
                id=f"NOTIF-{uuid.uuid4().hex[:12]}-{sub.id}",
                notice_id=notice_id,
                subscriber_id=sub.id,
                channel="IN_APP",
                event_type=event_type,
                title=title,
                message=message,
                delivery_status="DELIVERED",
                timestamp=now_iso,
                is_read=0,
                dedup_key=dedup
            ))
