# Official Source Approval Document (Cybernaut WEB-07)

This document formalizes the ethical, legal, and operational assessment of monitored transport authorities.

## 1. Ethical Web Scraping Policy
TransitNotice strictly complies with ethical data collection standards:
- **Zero Authentication Bypass**: Never bypass user logins, tokens, paywalls, or private intranet feeds.
- **Zero CAPTCHA Evasion**: No OCR, third-party solving services, or automated anti-bot avoidance.
- **Data Minimization**: No private passenger identifiers or contact details are scraped or recorded.
- **Respect for Server Load**: Polite request throttling, caching, exponential backoff (up to 300s), and custom User-Agent headers identifying the application administrator.

---

## 2. Monitored Authorities Matrix

| Agency | Authority Name | Endpoint URL | Source Type | Permission Status | robots.txt Status | Terms / License Review | Refresh Frequency |
|---|---|---|---|---|---|---|---|
| **MTC** | Metropolitan Transport Corporation (Chennai) Ltd. | `https://mtcbus.tn.gov.in/Home/citizencharter` | HTML Web Scraper | Approved | Allowed | Government of Tamil Nadu Open Public Data - Citizen Charter | 15 mins |
| **CMRL** | Chennai Metro Rail Limited | `https://chennaimetrorail.org/press-release/` | HTML Web Scraper | Approved | Allowed | CMRL Official Press & Passenger Communication Policy | 10 mins |
| **TNSTC** | Tamil Nadu State Transport Corporation | `https://www.tnstc.in/TNSTCOnline/` | HTML Web Scraper | Approved | Allowed | TNSTC Official Online Reservation & Public Announcement System | 20 mins |
| **CUMTA** | Chennai Unified Metropolitan Transport Authority | `https://cumta.tn.gov.in` | HTML Web Scraper | Approved | Allowed | CUMTA Statutory Authority Public Integration Directives | 30 mins |
| **TNTD** | Tamil Nadu Transport Department (TNSTA) | `https://transport.tn.gov.in` | HTML Web Scraper | Approved | Allowed | State Transport Authority Regulatory Circulars & Public Orders | 30 mins |

---

## 3. Extracted Fields Dictionary
- `notice_id`: Stable identifier supplied by source or derived deterministically.
- `agency`: Authority acronym (TFL, BART, MBTA, CTA).
- `route_id`: Primary route code or comma-separated route list.
- `area`: Affected borough, city district, or line segment.
- `source_url`: Verifiable provenance hyperlink to official bulletin.
- `type`: Standardized advisory classification (Route Diversion, Service Interruption, Planned Maintenance, Delay, Route Closure, Service Cancellation, Service Resumption, General Advisory).
- `title`: Short descriptive headline.
- `summary`: Concise passenger guidance.
- `description`: Complete announcement text.
- `published_at`: Announcement issuance timestamp in ISO-8601 UTC.
- `valid_from`: Beginning of effective outage window.
- `valid_to`: Scheduled restoration timestamp, or NULL if open-ended.
- `status`: Active, Scheduled, Expired, Cancelled, Withdrawn, Unknown.
- `observed_at`: Scraper detection timestamp.
- `last_confirmed_at`: Most recent cycle where source confirmed presence.
- `last_verified_at`: Timestamp of active validity verification.
- `content_hash`: SHA-256 hash of normalized content.
- `revision_id`: Monotonically increasing revision counter (starts at 1).
- `change_summary`: Human-readable audit diff message.
