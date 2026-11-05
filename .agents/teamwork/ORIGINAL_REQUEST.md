# Original User Request

## 2026-10-27T11:00:49Z

Verify complete local operation of the Murshid academic guidance platform and finalize all full-stack web development features (frontend, backend, database, UI/UX, and workflows) across Student, Advisor, Admin, and Campus Navigation modules to production readiness. Defer the heavy Runpod LLM model integration for a later phase, providing graceful local mock/FAQ fallbacks so the chat interface remains fully functional without an external model server.

Working directory: S:\murshid (1)
Integrity mode: development

## Requirements

### R1. Full-Stack Local Environment & Build Pipeline
Ensure the full-stack web application runs seamlessly and reliably in the local Windows environment:
- Connects cleanly to the local MySQL/MariaDB database (`murshid` on `localhost:3306`).
- Express server and Vite frontend run and serve requests without errors on `http://localhost:3000`.
- TypeScript validation (`npm run check`) passes with zero errors.
- Production build (`npm run build`) builds all client and server assets cleanly.

### R2. Complete Full-Stack Module Finalization (Non-AI Focus)
Take full end-to-end ownership of all web application modules, ensuring high reliability, polished UX, and proper error handling:
- **Student Dashboard & Academic Features**: Study plan tracking, prerequisite verification logic, GPA tracking, course recommendations engine, assignments, and attendance logs.
- **Advisor Dashboard**: Advisee roster management, academic alert dispatching, advisor notes, student progress tracking, and document knowledge management.
- **Admin Dashboard**: User management (students, advisors, admins), role assignments, department management, and academic system metrics.
- **Campus Navigation**: Interactive map view, building search, and classroom routing.
- **Authentication & Security**: Robust cookie/session handling, role-based route guards (client & server tRPC middleware), and Zod input validation.

### R3. AI Chat Graceful Mock & Local Fallback
Since the external Runpod model server is offline (credits ended), decouple the web application from external LLM endpoints:
- Ensure the chat interface and tRPC procedures do NOT throw uncaught exceptions, freeze, or hang when `RUNPOD_API_URL` is unavailable.
- Provide a responsive local fallback mechanism (e.g., matching against database FAQs, rule-based academic guidance responses, or simulated mock advisor answers) with clear UI messaging indicating offline/mock mode.

### R4. Automated Testing & Verification Suite
- Verify and resolve all existing test scripts under `scripts/` (e.g., `validate-db.mjs`, `smoke-test-all-apis.mjs`, `final-smoke-test-v2.mjs`).
- Add comprehensive automated end-to-end tests for all student, advisor, admin, and navigation features.
- All tests must run independently, reliably, and exit with code 0.

## Acceptance Criteria

### Environment & Build
- [ ] `npm run check` passes with 0 TypeScript errors.
- [ ] `npm run build` succeeds without bundle or bundling errors.
- [ ] Database validation (`node scripts/validate-db.mjs`) reports `ok: true`.
- [ ] Local web server starts on `http://localhost:3000` and serves all client routes with HTTP 200.

### Web Application Features
- [ ] Student portal: Study plans and course prerequisite checking work accurately.
- [ ] Advisor portal: Managing assigned students, recording advisor notes, and dispatching academic alerts succeed without errors.
- [ ] Admin portal: User management, role updates, and system metrics operate reliably.
- [ ] Campus navigation: Building search and classroom queries return valid data.
- [ ] Chat UI: Loads cleanly, handles sending/receiving messages using local FAQ/fallback without hanging on external Runpod timeouts.

### Automated Testing
- [ ] All existing test scripts in `scripts/` execute cleanly and pass.
- [ ] New automated E2E test suite validates all primary user flows across Student, Advisor, and Admin roles.

### Final Verification Deliverable
- [ ] Verification report detailing all full-stack components tested, verified, and ready for user review.


## Follow-up — 2026-11-01T19:30:35Z

The server was restarted, which temporarily stopped background tasks. The local MySQL database on localhost:3306 has been verified and is active. Please resume the project workflow, check the status of Milestone 2 / Milestone 3, revive any necessary subagents/crons, and continue execution toward completing the remaining milestones and final verification.
