# Change Detection Engine Specification (WEB-07)

The Change Detection Engine is the core algorithmic component of TransitNotice. It guarantees idempotency, historical preservation, accurate lifecycle calculation, and deduplicated notification delivery.

---

## 1. Algorithmic Workflow

```
Scraped Item Received
         │
         ▼
Normalize Fields (Routes sorted, text trimmed, dates ISO-8601 UTC)
         │
         ▼
Calculate Lifecycle Status (Scheduled, Active, Expired, Cancelled, Withdrawn)
         │
         ▼
Compute SHA-256 Content Hash
         │
         ▼
Check Database by notice_id
         ├── Notice does NOT exist ──► [Action: NEW]
         │                               ├── Insert into `notices`
         │                               ├── Insert routes into `notice_routes`
         │                               ├── Archive initial record into `notice_revisions` (rev 1)
         │                               └── Dispatch deduplicated NEW_ADVISORY alert
         │
         └── Notice exists
                 │
                 ├── Content Hash Matches Previously Stored ──► [Action: UNCHANGED]
                 │                                                ├── Update last_confirmed_at & last_verified_at
                 │                                                └── Do NOT create duplicate revision or alert
                 │
                 └── Content Hash Differs ──► [Action: REVISED / EXTENDED / CANCELLED / WITHDRAWN]
                                                 ├── Evaluate Diff:
                                                 │     • valid_to extended to later time? -> EXTENDED
                                                 │     • status changed to Cancelled? -> CANCELLED
                                                 │     • status changed to Withdrawn? -> WITHDRAWN
                                                 │     • description/routes changed? -> REVISED
                                                 ├── Increment revision_id (v2, v3...)
                                                 ├── Update active `notices` record
                                                 ├── Insert immutable snapshot into `notice_revisions`
                                                 └── Dispatch ONE deduplicated notification event
```

---

## 2. Integrity Rules & Edge Cases Handled

1. **Advisories Without End Dates (Open-Ended)**:
   - When `valid_to` is `NULL` or open-ended, the engine marks the notice as `Active` (assuming `valid_from <= now`).
   - The expiration routine strictly checks `WHERE valid_to IS NOT NULL AND valid_to < now()`, ensuring open-ended advisories are never prematurely expired.

2. **Multi-Route Detours**:
   - Routes are sorted alphabetically during hash computation so differences in route order in the source feed do not trigger spurious revisions.
   - Associated routes are stored in the `notice_routes` table, allowing route-level queries to match multi-route announcements.

3. **Alert Deduplication**:
   - Each notification record includes a unique composite key:
     `DEDUP-{notice_id}-REV-{revision_id}-SUB-{subscriber_id}`
   - The database constraint `UNIQUE(dedup_key)` mathematically guarantees that repeated executions of the scraper or change detection pipeline will never send duplicate alerts for unchanged advisories.
