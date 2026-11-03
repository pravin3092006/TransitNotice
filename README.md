# TransitNotice (WEB-07) - Public Transport Service Update Tracker
**Cybernaut Internship Web Scraping & Full-Stack Engineering Capstone Project**

TransitNotice is a full-stack, enterprise-grade public transport monitoring and advisory intelligence platform for Chennai and Tamil Nadu. It collects official notices from transit authorities (Metropolitan Transport Corporation - MTC Chennai, Chennai Metro Rail Limited - CMRL, Tamil Nadu State Transport Corporation - TNSTC, Chennai Unified Metropolitan Transport Authority - CUMTA, and the Tamil Nadu Transport Department - TNSTA), performs automated change detection with SHA-256 content hashing, maintains an immutable revision audit trail, and computes active lifecycle states based on announced validity windows.

---

## 🚀 Key Features

1. **Real-World Scraper Architecture**:
   - Modular adapters for REST APIs, RSS feeds, and permitted HTML pages.
   - Respects `robots.txt`, open data license agreements, rate limits, and exponential backoff retry ceilings.
   - Never bypasses logins, CAPTCHAs, or access restrictions.

2. **Core Change Detection Engine**:
   - Computes SHA-256 hashes over normalized content (title, description, routes, validity window, status).
   - Classifies change events: **NEW**, **UNCHANGED**, **REVISED**, **EXTENDED**, **WITHDRAWN**, **CANCELLED**, and **EXPIRED**.
   - Preserves previous versions in `notice_revisions` before updating the active record.

3. **Status Lifecycle & Integrity Rules**:
   - Mandatory Rule: Expired advisories are never marked active.
   - Mandatory Rule: Open-ended advisories without an end date (`valid_to = NULL`) are never automatically expired.
   - Multi-Route Junctions: Filtering by route ID correctly matches advisories affecting multiple routes via normalized relations.
   - Source Provenance: Distinguishes last attempted check, last successful fetch, last confirmed time, and last verified time.

4. **Event-Driven Alert System**:
   - Deduplicated alert generation (exactly ONE notification per new or revised advisory).
   - In-app delivery logs with subscriber preferences (Maya Lin - Passenger vs. Alex Vance - Operations Monitor).
   - Safe demo notification mode prevents unsolicited external spam.

5. **Cybernaut Live Mentor Viva & Acceptance Console**:
   - Interactive UI to execute **Mentor Challenge 1** (24h Outage Extension), **Mentor Challenge 2** (Open-Ended No-End-Date Notice), **Mentor Challenge 3** (SQL query & parser explainer), and the **6 Mandatory Acceptance Tests**.

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts
- **Backend & Server**: Node.js / Express (TypeScript), Python 3.11 FastAPI, SQLAlchemy, Pydantic, BeautifulSoup4, HTTPX, APScheduler
- **Database**: SQLite with WAL mode, foreign keys, indexes, and full relational tables (`transitnotice.db`)
- **Testing**: Pytest automated test suite (24 passing test cases)

---

## 🏁 Quick Start (Windows / VS Code)

### 1. Automated Setup
Double-click `scripts\setup.bat` or run:
```cmd
scripts\setup.bat
```

### 2. Start Application
Double-click `scripts\start.bat` or run:
```cmd
scripts\start.bat
```
Navigate to `http://localhost:3000` in your browser.

### 3. Run Automated Tests
Double-click `scripts\test.bat` or run:
```cmd
scripts\test.bat
```
Runs the 24 Pytest unit and integration test cases covering extraction, change detection, extensions, and acceptance criteria.
