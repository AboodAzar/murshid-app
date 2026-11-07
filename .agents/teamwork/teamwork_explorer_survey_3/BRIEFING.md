# BRIEFING — 2026-11-07T17:33:00Z

## Mission
Investigate live backend network connectivity, authentication, and API endpoints for ios-app to replace offline mockups with live backend at http://172.20.10.4:3000 and support in-app configurable server host.

## 🔒 My Identity
- Archetype: explorer
- Roles: Backend Network Specialist
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_3
- Original parent: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Milestone: Survey & Investigation Phase

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze problems, synthesize findings, produce structured reports
- Files for content delivery, send_message for coordination
- Report written to report.md and handoff.md

## Current Parent
- Conversation ID: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Updated: 2026-11-07T17:33:00Z

## Investigation State
- **Explored paths**:
  - `server/_core/index.ts`, `context.ts`, `sdk.ts`, `authSecurity.ts`, `cookies.ts`, `trpc.ts`
  - `server/routers/auth.ts`, `student.ts`, `aiChat.ts`, `courses.ts`
  - `ios-app/package.json`, `capacitor.config.json`, `Podfile`, `Info.plist`, `scripts/bundle-app.mjs`, `www/index.html`
  - `client/public/phone.html`, `client/src/main.tsx`, `client/src/_core/hooks/useAuth.ts`
  - MariaDB schema and database tables (`users`, `studentCourses`, `studyPlans`, `studentAssignments`, `attendance`, `assignments`)
  - Local network adapters and IP configurations (`172.20.10.3` active Wi-Fi IP)
- **Key findings**:
  1. Express binds to `0.0.0.0:3000`. Target default `http://172.20.10.4:3000` is on local network, with `172.20.10.3` currently active on Wi-Fi adapter.
  2. Severe CORS & Header Gap: `server/_core/index.ts` has NO CORS middleware and CSP lacks `http:`. Cross-origin requests from `capacitor://localhost` will be blocked by WebKit unless CORS middleware is added.
  3. Auth Gap: `auth.login` sets cookie but does not return JWT `token` in JSON body. WebKit ITP on iOS drops cleartext HTTP cross-origin cookies. Solution: Return `token` in `auth.login` and support `Authorization: Bearer <token>` in `sdk.ts` and `auth.me`.
  4. App Mockups: `phone.html` / `www/index.html` is 100% offline mockups (except 1 broken relative fetch for roadmap). Chat, scanner, assignments, schedule, and dashboard stats are hardcoded simulations.
  5. Configurable Host: `bundle-app.mjs` injected a modal, but omitted any UI trigger/button to open it. Designed a prominent header status pill + sign-in screen link + latency ping against `aiChat.getStatus`.
  6. Real Accounts: Real accounts exist in MariaDB with `password123`: Hanan (`hanan@gmail.com`), Basma (`basma.hassan@zuj.edu.jo`), Dr. Ahmad Khalil (`a.khalil@zuj.edu.jo`), Abood (`abood@gmail.com`).
- **Unexplored areas**: None. Complete investigation conducted across all 4 requirements.

## Key Decisions Made
- Recommend dual-auth architecture (cookies for desktop, Bearer tokens for mobile).
- Recommend lightweight vanilla JS `ApiClient` for `ios-app` supporting tRPC `superjson` format (`{ json: ... }`).
- Recommend replacing mock functions with live tRPC procedures (`student.dashboard`, `student.myCourses`, `student.todaySchedule`, `student.assignments`, `student.submitAssignment`, `student.recordAttendanceViaQr`, `aiChat.sendMessage`).

## Artifact Index
- DISPATCH.md — Received dispatch message log
- BRIEFING.md — Persistent working memory
- progress.md — Liveness heartbeat and step tracking
- report.md — Comprehensive backend network investigation report
- handoff.md — 5-component handoff report
