# Project: Murshid Academic Guidance Platform

## Architecture
Murshid is a full-stack academic guidance web application built for Al-Zaytoonah University of Jordan (ZUJ).
- **Backend**: Node.js v24 + Express 4.21.2 + tRPC 11.6.0 server mounted at `/api/trpc`.
- **Database & ORM**: MariaDB 10.11 on `localhost:3306/murshid` accessed via `drizzle-orm` + `mysql2`.
- **Security & Authentication**: HTTP-only cookie (`app_session_id`) containing a signed JOSE HS256 JWT, verified via PBKDF2 (SHA-512, 210,000 iterations). Middleware guards: `publicProcedure`, `protectedProcedure`, `advisorProcedure`, `adminProcedure`.
- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4 + Radix UI + TanStack Query 5 + tRPC client + Wouter router.
- **AI Chat Architecture**: Decoupled from offline Runpod model server. Features a responsive 3-tier local fallback engine (FAQ matching, student academic rules guidance, simulated advisor responses) with clear UI offline badges.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Full-Stack Local Environment & Build Pipeline | Clean `npm run check` (0 errors), clean `npm run build`, verified DB `validate-db.mjs`, Express+Vite on `http://localhost:3000` | M1 | R1 | DONE |
| 2 | AI Chat Decoupling & Fast Timeout | Add 1500ms AbortSignal / offline mode to `aiChat.sendMessage`, `faqs.ts`, `documents.ts` to prevent hangs | M1 | R3 | DONE |
| 3 | AI Local Mock & FAQ Fallback Engine | 3-tier offline engine: Tier 1 FAQ matching, Tier 2 student academic rules guidance, Tier 3 simulated advisor responses | M1 | R3 | DONE |
| 4 | AI Chat UI Offline Indicator & Banner | Replace static "AI Online" with dynamic status indicator and clear "Local Fallback / Mock Mode" banner | M1 | R3 | DONE |
| 5 | Student Portal Academic Features | Study plan, GPA tracking, attendance logs, assignments, schedule, and degree analytics | M2 | R2 | DONE |
| 6 | Course Prerequisite Verification Guard | Enforce prerequisite check in `courses.enrollCourse` to reject enrollment if prerequisites are not completed | M2 | R2 | DONE |
| 7 | Study Plan Prerequisite Visualization | Add visual prerequisite badges to course cards in `StudyPlan.tsx` | M2 | R2 | DONE |
| 8 | Advisor Portal Workflows | Advisee roster management, academic alert dispatch/resolution, advisor notes, appointments, document center | M2 | R2 | DONE |
| 9 | Admin Portal Governance | User management, active status toggle, role switching, advisor-student pairing manager, bilingual announcements, system metrics | M2 | R2 | DONE |
| 10 | Campus Navigation & Classroom Routing | Interactive ZUJ campus map, building search, room finder, today's lecture locator, route planner, missing Maps key fallback | M2 | R2 | DONE |
| 11 | Authentication, Security & Route Guards | Cookie/session handling, PBKDF2 hashing, server tRPC guards, client `ProtectedRoute`, dedicated 403 `Unauthorized.tsx` page | M2 | R2 | DONE |
| 12 | Router & Bundle Hygiene | Remove unused `Home` import in `App.tsx`, clean up orphan backup files | M2 | R2 | DONE |
| 13 | Existing Test Scripts Modernization | Fix existing scripts in `scripts/` (`validate-db.mjs`, `smoke-test-all-apis.mjs`, `final-smoke-test-v2.mjs`) to use valid seeded credentials and cookie persistence; all exit 0 | M3 | R4 | DONE |
| 14 | Automated E2E Testing Suite (Tiers 1-4) | Comprehensive automated test suite covering all user flows across Student, Advisor, Admin, Nav, and AI Fallback with exit 0 | M4 | R4 | DONE |
| 15 | Tier 5 Adversarial Coverage Hardening & Audit | Adversarial edge testing, stress verification, and forensic integrity audit | M5 | R4 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | AI Chat Graceful Mock & Local Fallback Engine | Decouple from Runpod, implement 3-tier local fallback engine (FAQ + academic rules + simulated advisor), add dynamic AI status and offline banner | none | DONE |
| M2 | Full-Stack Module Hardening & UX Polish | Prerequisite guard in `enrollCourse`, visual prerequisite badges in `StudyPlan.tsx`, dedicated 403 `Unauthorized.tsx` page, router hygiene | none | DONE |
| M3 | Existing Test Scripts Modernization | Fix existing scripts in `scripts/` (`smoke-test-all-apis.mjs`, `final-smoke-test-v2.mjs`, etc.) with valid seeded credentials and cookie jar; exit 0 | M1, M2 | DONE |
| M4 | Comprehensive E2E Testing Suite (Tiers 1-4) | Requirement-driven test harness and test cases (Tiers 1-4: Unit/Feature, Boundaries, Pairwise, Real-world workflows) | M1, M2 | DONE |
| M5 | 100% E2E Pass, Tier 5 Hardening & Forensic Audit | Pass 100% E2E tests, Tier 5 adversarial testing, forensic integrity audit, final deliverable verification report | M3, M4 | DONE |

## Interface Contracts
### AI Chat Service ↔ Client
- Query: `aiChat.getStatus`
  - Output: `{ isOnline: boolean, mode: "local_mock_fallback" | "external_model", model: string }`
- Mutation: `aiChat.sendMessage`
  - Input: `{ conversationId: number, message: string }`
  - Output: `{ success: boolean, response: string, isOfflineFallback: boolean, source: "faq" | "academic_rules" | "local_advisor" | "external_llm" }`

### Course Enrollment ↔ Prerequisite Verification
- Mutation: `courses.enrollCourse`
  - Input: `{ courseId: number, semester?: string }`
  - Guard: Checks if student has completed all prerequisites in `courseprerequisites`.
  - Throws `BAD_REQUEST` if unmet prerequisites exist with informative message listing missing prerequisites.

### HTTP Session ↔ Authenticated Context
- Cookie: `app_session_id` (HTTP-only, SameSite=Lax, Max-Age=7d)
- Payload: `{ userId: number, email: string, name: string, role: "student" | "advisor" | "admin", type: "local-auth" }`

## Code Layout
- `server/_core/`: Server entrypoint (`index.ts`), context (`context.ts`), auth security (`authSecurity.ts`), cookies (`cookies.ts`), tRPC initialization (`trpc.ts`).
- `server/routers/`: Domain tRPC routers (`aiChat.ts`, `student.ts`, `advisor.ts`, `admin.ts`, `courses.ts`, `navigation.ts`, `faqs.ts`, `documents.ts`, `announcements.ts`, `analytics.ts`, `preferences.ts`, `passwordReset.ts`).
- `server/utils/`: Backend utilities (`aiFallback.ts` for offline mock & FAQ engine).
- `client/src/pages/`: Frontend routes (`StudentDashboard.tsx`, `StudyPlan.tsx`, `AdvisorDashboard.tsx`, `AdvisorStudentProfile.tsx`, `AdminDashboard.tsx`, `CampusNavigation.tsx`, `AIChatPage.tsx`, `Unauthorized.tsx`).
- `client/src/components/`: Reusable UI components (`DashboardLayout.tsx`, `ProtectedRoute.tsx`, `AdminAdvisorManager.tsx`, `Map.tsx`).
- `shared/`: Shared schemas, types, constants (`schema.ts`, `const.ts`).
- `scripts/`: Operational, verification, and testing scripts.
- `tests/e2e/`: Automated E2E test suite.
