# Changelog

## 2025-12-23 — Updates by automation

- Backend:
  - Added `portfolios` table creation.
  - Implemented endpoints: `GET /api/portfolios`, `POST /api/portfolios`, `DELETE /api/portfolios/:id`.
  - Added `GET /api/holdings/:id`.
  - Exported Express `app` to support tests; adjusted server start logic.
  - Added dev dependencies and basic tests using Jest + Supertest.

- Frontend / Infra:
  - Fixed global variable collisions in `enhancements.js` (IIFE + renamed internal state).
  - Adjusted `api-client.js` base URL handling and health check.
  - Added placeholder `favicon.ico` to avoid 404 noise.
  - Removed obsolete `version:` from `docker-compose.yml`.
  - Added `.env.example` with recommended variables.

- Tools:
  - Added `tools/check_frontend.js` for headless console capture and screenshot.

All changes were validated locally: Docker services started, endpoints tested, and backend tests passed.
