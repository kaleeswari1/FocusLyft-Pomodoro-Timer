---
name: FocusLyft Feature Additions (Auth + Analytics + QR Login)
description: DB-backed student auth, weekly productivity analytics, QR quick-login added to FocusLyft Pomodoro app.
---

## What was added

Three backend-powered features layered onto the existing client-side Pomodoro app:

1. **Student Auth** — Flask-Login + PostgreSQL (User model). Register/login via `/api/auth/register` and `/api/auth/login`. Session persists via Flask sessions.

2. **Productivity Analytics** — `analytics.js` reads localStorage session_history and renders a daily report (sessions, focus minutes, score, top subject) + a 7-day Chart.js bar chart. When logged in, sessions are also saved to the `study_session` table via `/api/sessions/save`.

3. **QR Login** — Generates a one-time token (expires 10 min) stored in `qr_token` table. URL `/qr-login/<token>` auto-logs user in on scan.

## Key files
- `app.py` — all routes (auth, sessions, analytics, QR)
- `models.py` — User, StudySession, QRToken models
- `static/js/auth.js` — AuthManager class
- `static/js/analytics.js` — AnalyticsManager class (Chart.js)
- `templates/index.html` — analytics card + auth modal added

## Why
- Data is stored in localStorage (existing pattern) for offline use
- Backend sync happens silently when logged in (non-blocking fetch with .catch(()=>{}))
- QR tokens are single-use and expire to prevent replay attacks

## How to apply
- Chart.js and qrcodejs loaded from CDN
- analyticsManager.init() called on DOMContentLoaded
- timer.js logSession() now also calls authManager.syncSessionToBackend() and analyticsManager.renderDailyReport()
