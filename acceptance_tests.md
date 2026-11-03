# Mandatory Acceptance Tests & Verification Report
**Cybernaut Internship Web Scraping | SRS 2026 | WEB-07**

This document provides test cases, verification steps, expected results, and actual results for the six mandatory acceptance tests specified in Section 11 of the project brief.

---

### TEST 1: An expired advisory must not be marked currently active
- **Requirement**: Calculate active status from announced time window. Past valid-until time must not appear active.
- **Test Steps**:
  1. Inspect record `MBTA-ALT-2026-319` or simulate a notice where `valid_to` is prior to the current UTC timestamp.
  2. Query `GET /api/notices?status=Active`.
  3. Verify whether expired advisories appear in the active list.
- **Expected Result**: The notice status is calculated as `'Expired'`. It does NOT appear in active filters.
- **Actual Result**: `PASS`. Notice `MBTA-ALT-2026-319` has `valid_to: 2026-10-30T08:00:00Z` and status is correctly `'Expired'`.

---

### TEST 2: Route ID filtering must work when multiple routes are affected by one advisory
- **Requirement**: An advisory can affect multiple routes (e.g., bus corridor detour). Filtering by any one of the affected route IDs must return the advisory.
- **Test Steps**:
  1. Query `GET /api/notices?route_id=Route-390`.
  2. Notice `TFL-NOT-2026-001` affects `Route-73`, `Route-390`, and `Route-14`.
  3. Verify that querying `Route-390` returns `TFL-NOT-2026-001`.
- **Expected Result**: Multi-route notice is returned via `notice_routes` many-to-many relational join.
- **Actual Result**: `PASS`. Querying by route `Route-390` successfully matches and returns `TFL-NOT-2026-001`.

---

### TEST 3: An extended advisory must update existing notice and preserve its history
- **Requirement**: When an authority extends an outage end date, update the notice, increment `revision_id`, generate an audit revision in `notice_revisions`, and generate exactly one alert.
- **Test Steps**:
  1. Trigger Mentor Challenge 1 (`POST /api/mentor/challenge-1`).
  2. Verify that `valid_to` is extended by 24 hours.
  3. Inspect `notice_revisions` table for `notice_id = 'TFL-NOT-2026-001'`.
- **Expected Result**: Revision count increases to 2 (or higher), old revision is preserved intact, change summary logs extension, exactly 1 alert is sent.
- **Actual Result**: `PASS`. Preserved revision 1 and created revision 2 with change summary: *"Service outage extended by 24 hours"*. Alert dispatched to subscribers with deduplication key.

---

### TEST 4: Timezone handling must be documented and reproducible
- **Requirement**: Consistent timezone normalization. Document original and normalized timezones.
- **Test Steps**:
  1. Verify timestamps across all tables (`notices`, `notice_revisions`, `scrape_logs`, `notifications`).
  2. Inspect date parsing in `calculate_advisory_status()` and `compute_content_hash()`.
- **Expected Result**: All timestamps stored in standardized ISO-8601 UTC format (`YYYY-MM-DDTHH:MM:SSZ` or with `+00:00`). Client displays adapt gracefully without desynchronization.
- **Actual Result**: `PASS`. All database records normalized to ISO-8601 UTC. Pytest test case `test_timezone_normalization` passed.

---

### TEST 5: A stale notice must clearly display its latest known verification time
- **Requirement**: Show last checked and source-page provenance. Never label stale snapshots as live.
- **Test Steps**:
  1. Inspect `notices` record columns: `observed_at`, `last_confirmed_at`, and `last_verified_at`.
  2. Inspect frontend NoticeCard and NoticeDetailModal.
- **Expected Result**: The UI explicitly renders "Verified at [time]" alongside the source link, preventing stale data from masquerading as instantaneous updates.
- **Actual Result**: `PASS`. Both card and modal views show explicit provenance timestamps and SHA-256 hashes.

---

### TEST 6: A source error must not turn old data into live data
- **Requirement**: When a source encounters a network failure or 5xx error, preserve previously collected notices, do not claim old data is live, and show degraded health.
- **Test Steps**:
  1. Simulate source network timeout or 503 error on adapter.
  2. Verify `consecutive_failures` increases in `sources` table.
  3. Verify previous notice records remain intact and are NOT wiped or marked falsely confirmed.
- **Expected Result**: Old notices are preserved with honest freshness timestamps. Source health degrades to `DEGRADED` or `FAILING`.
- **Actual Result**: `PASS`. Scraper retry backoff ceiling executes, historical notices are untouched, and error logs are stored in `scrape_logs`.
