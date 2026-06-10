# Murshid Platform - Technical Documentation

**Source:** `c:\Users\user\Downloads\murshid-app` | **Date:** 2026-06-10

---

## 1. Executive Summary

Murshid is a full-stack AI-powered academic advising platform for Al-Zaytoonah University of Jordan. It serves Students, Academic Advisors, and Administrators with role-based dashboards and an AI chatbot using real student academic context.

**Tech Stack:** React 19 + Vite + Tailwind, Node.js + Express + tRPC 11, MySQL 8 + Drizzle ORM, PBKDF2 + JWT auth, Runpod-hosted LLM for chat, Resend for email OTP, AWS S3 for documents.

**AI Note:** The report claims "Qwen 3.6:35B." The code sends queries to `RUNPOD_API_URL`. The actual model is not verifiable from the codebase.

---

## 2. Architecture

**Server entry:** `server/_core/index.ts` creates Express app with:
- Security headers (CSP, X-Frame-Options, HSTS in prod)
- Rate limiting (5 req/min auth, 3 req/hour password reset)
- tRPC at `/api/trpc`
- Vite dev server (dev) or static files (production)

**Context:** `server/_core/context.ts` extracts cookie, verifies JWT, DB lookup -> `{ req, res, user }`

**Procedures (`server/_core/trpc.ts`):**
- `publicProcedure` - no auth
- `protectedProcedure` - any authenticated user
- `adminProcedure` - role === "admin"
- `advisorProcedure` - role === "advisor" or "admin"

**Related files:** `server/_core/index.ts`, `context.ts`, `trpc.ts`, `sdk.ts`, `env.ts`, `rateLimiter.ts`, `server/routers.ts`, `client/src/main.tsx`, `client/src/lib/trpc.ts`

---

## 3. Database

**Engine:** MySQL 8. **ORM:** Drizzle. **Schema:** `drizzle/schema.ts` (853 lines).

**Tables:** users, departments, courses, coursePrerequisites, studyPlans, studentCourses, courseSchedules, attendance, assignments, studentAssignments, aiConversations, chatMessages, faqs, documents, notifications, buildings, rooms, announcements, achievements, studentAchievements, advisorNotes, academicAlerts, recommendations, appointments, advisorReports, aiStatistics, passwordResetTokens, emailVerificationTokens.

**Relations:** users->studyPlans/aiConversations/notifications/studentCourses, departments->courses, courses->prerequisites, buildings->rooms, attendance->users/courses/schedules, studentAssignments->users/assignments.

**Data flow:** HTTP -> Express -> createContext (JWT verify + DB lookup) -> tRPC middleware -> Drizzle query -> superjson response.

---

## 4. Use Cases

| ID | Actor | Use Case | Status |
|----|-------|----------|--------|
| UC-01 | Student | Register with university email, verify OTP | Implemented |
| UC-02 | Student | Login | Implemented |
| UC-03 | Student | View dashboard | Implemented |
| UC-04 | Student | AI chat with academic context | Implemented |
| UC-05 | Student | View courses, grades, attendance, assignments | Implemented |
| UC-06 | Student | View study plan and analytics | Implemented |
| UC-07 | Student | Campus navigation | Implemented |
| UC-08 | Student | Read announcements | Implemented |
| UC-09 | Student | View achievements | Partially Implemented |
| UC-10 | Advisor | View assigned students | Implemented |
| UC-11 | Advisor | View detailed student profile | Implemented |
| UC-12 | Advisor | Create/resolve/delete alerts | Implemented |
| UC-13 | Advisor | Write recommendations | Implemented |
| UC-14 | Advisor | Schedule appointments | Implemented |
| UC-15 | Advisor | Write notes | Implemented |
| UC-16 | Advisor | Review AI chat history | Not Implemented |
| UC-17 | Admin | View system stats | Implemented |
| UC-18 | Admin | CRUD users | Implemented |
| UC-19 | Admin | Assign advisors | Implemented |
| UC-20 | Admin | Manage announcements/FAQs/documents | Implemented |
| UC-21 | Admin | Auth debug | Implemented |
| UC-22 | All | Reset password | Implemented |
| UC-23 | All | Switch EN/AR | Implemented |

---

## 5. Functional Requirements

**FR-AUTH:** Email domain restriction, OTP verification, PBKDF2 hashing, JWT sessions, cookie management, password reset, RBAC.

**FR-STU:** Dashboard, schedule, courses, grades, attendance, assignments, study plan, analytics, AI chat, demo data seed.

**FR-ADV:** Assigned students, student profile, alerts, recommendations, appointments, notes, insights.

**FR-ADM:** System stats, user CRUD, advisor assignment, announcements, FAQs, documents, auth debug.

**FR-NAV:** Buildings/rooms, static routes, Google Maps directions.

---

## 6. Non-Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-01 | HTTPS headers (HSTS, CSP, XSS) | Implemented |
| NFR-02 | Rate limiting | Implemented |
| NFR-03 | Lazy DB connection | Implemented |
| NFR-04 | Connection pooling | Basic |
| NFR-05 | Bilingual EN/AR RTL | Implemented |
| NFR-06 | Responsive design | Implemented |
| NFR-07 | Error boundaries | Implemented |
| NFR-08 | Loading states | Implemented |
| NFR-09 | Keyboard/ARIA | Partial |
| NFR-10 | TypeScript + tRPC | Implemented |
| NFR-11 | Browser log collection | Implemented |
| NFR-12 | AI response time | External dependency |

---

## 7. Security Overview

**Passwords:** PBKDF2-SHA512, 210k iterations, 16-byte salt, `crypto.timingSafeEqual`.

**JWT:** HS256, 7-day expiry. Secret from `JWT_SECRET` env (dev fallback hardcoded).

**Sessions:** Cookie `murshid-session`, httpOnly, secure in prod, sameSite lax, 7-day maxAge.

**Role Enforcement:** Frontend `ProtectedRoute` + backend `adminProcedure`/`advisorProcedure`. Advisors only access assigned students via `assertAssignedStudent()`.

**Input Validation:** All tRPC inputs use Zod. File uploads limited to 50MB. Drizzle prevents SQL injection.

**Headers:** CSP, X-Frame-Options DENY, nosniff, XSS protection, Referrer-Policy, Permissions-Policy, HSTS in prod.

**Known Notes:**
- `JWT_SECRET` placeholder in `.env` (gitignored) — must rotate for production.
- Debug endpoints (`auth.debug`, `auth.createTestUser`) require admin.
- `/auth-debug` route requires admin.
- Runpod API calls have no auth key — relies on URL obscurity.

---

## 8. API Documentation

### 8.1 Routers

| Router | File | Auth Level | Description |
|--------|------|------------|-------------|
| auth | `server/routers/auth.ts` | Public/Admin | Register, login, logout, verify, debug |
| passwordReset | `server/routers/passwordReset.ts` | Public | Request, verify, reset |
| student | `server/routers/student.ts` | Protected | Dashboard, courses, schedule, alerts, seed |
| courses | `server/routers/courses.ts` | Public/Protected | Catalog, enrollment, recommendations |
| analytics | `server/routers/analytics.ts` | Protected | Risk, health, GPA sim, planner, career paths |
| advisor | `server/routers/advisor.ts` | Protected/Advisor | Students, alerts, recommendations, notes, appointments |
| admin | `server/routers/admin.ts` | Admin | Stats, user CRUD, advisor assignment |
| aiChat | `server/routers/aiChat.ts` | Protected (student) | Conversations, messages, send, delete |
| faqs | `server/routers/faqs.ts` | Public/Advisor | List, create, update, delete |
| documents | `server/routers/documents.ts` | Advisor | List, upload, delete |
| announcements | `server/routers/announcements.ts` | Protected/Admin | List, create, update, delete |
| navigation | `server/routers/navigation.ts` | Protected | Campus buildings and rooms |
| notifications | `server/routers/notifications.ts` | Protected | List, mark read/unread |
| preferences | `server/routers/preferences.ts` | Protected | Get, update preferences |
| system | `server/_core/systemRouter.ts` | Public/Admin | Health, notify owner |

### 8.2 Key Endpoints

**Auth:** `debug` (Admin), `me` (Public), `register` (Public), `login` (Public), `logout` (Public), `verifyEmail` (Public), `resendVerification` (Public), `createTestUser` (Admin).

**Password Reset:** `requestReset` (Public), `verifyToken` (Public), `resetPassword` (Public).

**Student:** `dashboard`, `myCourses`, `todaySchedule`, `academicAlerts`, `assignments`, `grades`, `attendance`, `progress`, `studyPlan`, `fullSchedule`, `achievements`, `overview` (all Protected Query); `seed` (Protected Mutation).

**Courses:** `list` (Public), `getById` (Public), `enroll` (Protected), `getRecommendations` (Protected).

**Analytics:** `graduationRisk`, `gpaSimulator`, `academicHealth`, `successForecast`, `smartRecommendations`, `earlyWarnings`, `degreeRoadmap`, `semesterPlanner`, `careerPaths`, `advisorInsights` (all Protected Query).

**Advisor:** `getAssignedStudents`, `getStudentProfile`, `getAlerts`, `getRecommendations`, `getNotes`, `getAppointments`, `getInsights` (Protected Query); `createAlert`, `resolveAlert`, `deleteAlert`, `createRecommendation`, `updateRecommendationStatus`, `deleteRecommendation`, `addNote`, `deleteNote`, `scheduleAppointment`, `cancelAppointment` (Advisor Mutation).

**Admin:** `dashboard` (Admin Query); `updateUser`, `deleteUser`, `assignAdvisor` (Admin Mutation); `getAdvisorsWithStudents`, `getUnassignedStudents` (Admin Query).

**AI Chat:** `createConversation`, `getConversations`, `getMessages`, `sendMessage`, `deleteConversation` (Protected, student-only).

---

## 9. Dashboard Workflows

### 9.1 Student Dashboard

**Files:** `client/src/pages/StudentDashboard.tsx` (913 lines), `server/routers/student.ts`

- Calls `student.dashboard` on mount. If empty, auto-triggers `student.seed`.
- Displays: health score, GPA, credits, today's schedule, alerts, recommendations, appointments, course cards, GPA chart.
- Uses Framer Motion, Recharts, skeleton loading.

**Workflow:** Login -> /dashboard -> load data (seed if empty) -> view GPA/schedule/alerts -> navigate to courses/grades/chat.

### 9.2 Advisor Dashboard

**Files:** `client/src/pages/AdvisorDashboard.tsx` (321 lines), `server/routers/advisor.ts`

- Calls `getAssignedStudents`, `getInsights`, `getAppointments`, `getAlerts`, `advisorInsights`.
- Displays: total students, at-risk count, avg GPA, avg attendance, appointments, alerts, student list with risk badges.

**Workflow:** Login -> /advisor -> view students -> click student -> view profile -> create alert/recommendation/appointment.

### 9.3 Admin Dashboard

**Files:** `client/src/pages/AdminDashboard.tsx` (1357 lines), `server/routers/admin.ts`, `client/src/components/AdminAdvisorManager.tsx`

- Hash-based tabs: Overview, Users, Courses, Advisors, Content, AI Stats, Reports.
- Calls `admin.dashboard` for full system snapshot.
- Displays: stats cards, user table with CRUD, course management, advisor assignment interface, FAQ/doc/announcement management, analytics charts.

**Workflow:** Login -> /admin -> view stats -> manage users -> assign advisors -> manage content.

**Incomplete:** AI Stats and Reports tabs use **hardcoded mock data arrays** (`analyticsData`, `aiStatsData`). No backend time-series endpoints exist.

---

## 10. Admin Workflow

**Entry:** `/admin` (ProtectedRoute requiredRole="admin")

**Capabilities:**
- View system-wide statistics (user counts by role, courses, departments, FAQs, documents, announcements)
- User management: search, edit role (student/advisor/admin), toggle active status, delete. Prevents self-deletion and last-admin deletion.
- Advisor assignment: view advisors with assigned students, search students, assign/unassign.
- Content management: create/edit/delete FAQs, documents, announcements.
- Auth debug: view auth diagnostics via `auth.debug`.

**APIs:** `admin.dashboard`, `admin.updateUser`, `admin.deleteUser`, `admin.assignAdvisor`, `admin.getAdvisorsWithStudents`, `admin.getUnassignedStudents`.

---

## 11. Advisor Workflow

**Entries:** `/advisor`, `/advisor/students`, `/advisor/student-profile`, `/advisor/appointments`, `/advisor/ai-review`

**Capabilities:**
- Dashboard: cohort overview with at-risk students, appointments, alerts.
- Students: list of assigned students with risk filters.
- Student Profile: detailed view (courses, GPA, attendance, alerts, notes, recommendations). Uses `localStorage.getItem("advisorSelectedStudentId")`.
- Appointments: schedule/cancel meetings.
- AI Review: Page exists but **no backend endpoint** for viewing student chat history.

**APIs:** `advisor.getAssignedStudents`, `advisor.getStudentProfile`, `advisor.getAlerts`, `advisor.createAlert`, `advisor.resolveAlert`, `advisor.deleteAlert`, `advisor.getRecommendations`, `advisor.createRecommendation`, `advisor.updateRecommendationStatus`, `advisor.deleteRecommendation`, `advisor.getNotes`, `advisor.addNote`, `advisor.deleteNote`, `advisor.getAppointments`, `advisor.scheduleAppointment`, `advisor.cancelAppointment`, `advisor.getInsights`.

**Incomplete:** AI Review page (`AdvisorAIReview.tsx`) has **no backend support**.

---

## 12. Student Workflow

**Entries:** `/dashboard`, `/courses`, `/schedule`, `/grades`, `/attendance`, `/assignments`, `/study-plan`, `/progress`, `/analytics`, `/chat`, `/campus`, `/announcements`, `/achievements`

**Capabilities:**
- Dashboard: GPA, credits, schedule, alerts, recommendations, quick actions.
- Courses: enrolled courses with stats.
- Schedule: weekly schedule with lecturers/rooms.
- Grades/Attendance/Assignments: academic records.
- Study Plan/Progress: degree tracking.
- Analytics: graduation risk, health score, GPA simulator, warnings, roadmap.
- Chat: AI conversations with real academic context.
- Campus: building/room browser.
- Announcements: system messages.
- Achievements: badge display.

**APIs:** `student.dashboard`, `student.myCourses`, `student.todaySchedule`, `student.fullSchedule`, `student.grades`, `student.attendance`, `student.assignments`, `student.studyPlan`, `student.progress`, `analytics.*`, `aiChat.*`, `navigation.campus`, `announcements.list`.

**Auto-seed:** If a student has no courses and no study plan, `StudentDashboard.tsx` automatically calls `student.seed` to generate demo data.

---

## 13. Murshid AI Workflow

**Entry:** `/chat` (ProtectedRoute requiredRole="student")

**Files:** `client/src/pages/AIChatPage.tsx`, `server/routers/aiChat.ts`

**Current Implementation:**
1. Student clicks "New Conversation" -> `aiChat.createConversation` creates row in `aiConversations`.
2. Student types message -> `aiChat.sendMessage`:
   - Verifies conversation belongs to student.
   - Saves user message to `chatMessages`.
   - Fetches full chat history.
   - **Fetches student academic context:** name, GPA, completed credits, total credits, attendance rate, current courses, pending assignments count, active alerts.
   - Sends payload to Runpod: `{ query, chat_history, student_context, uploaded_file_name, uploaded_file_context }`.
   - Receives AI response, saves to `chatMessages`.
   - Returns response to frontend.
3. Frontend displays conversation thread with streaming-like updates.

**Related tables:** `aiConversations`, `chatMessages`, `users`, `studyPlans`, `studentCourses`, `courses`, `attendance`, `assignments`, `studentAssignments`, `academicAlerts`.

**Data Flow:**
```
Student input -> aiChat.sendMessage -> verify ownership -> save message
  -> fetch student context (GPA, courses, attendance, assignments, alerts)
  -> POST to RUNPOD_API_URL/chat
  -> save AI response -> return to client
```

**Incomplete/Missing:**
- **Document upload for RAG:** The `runpodPayload` includes `uploaded_file_name: "None"` and `uploaded_file_context: null`. Document upload UI may exist but is not wired into the chat payload.
- **Advisor AI Review:** No backend endpoint for advisors to view student conversations.

---

## 14. Campus Navigation Workflow

**Entry:** `/campus` (Protected)

**Files:** `client/src/pages/CampusNavigation.tsx`, `server/routers/navigation.ts`

**Current Implementation:**
- Fetches `navigation.campus` which returns all buildings and rooms from DB.
- Displays buildings with name, code, coordinates, floor count, total capacity.
- Room browser with search, filter by type (classroom, lab, lecture_hall, office).
- Static route examples: "Main Entrance -> CS Lab", "Library -> Auditorium".
- "Get Directions" button opens Google Maps with building coordinates.

**Related tables:** `buildings`, `rooms`.

**Data Flow:**
1. `navigation.campus` query selects all buildings and rooms (joined)
2. Frontend calculates floor count and capacity per building
3. User can search rooms, view details, get directions

**Incomplete:** No real-time indoor navigation or interactive floor plans. Routes are hardcoded strings.

---

## 15. System Demo Walkthrough

### Scenario 1: New Student Onboarding
1. Student visits landing page (`/`), clicks "Register".
2. Enters name, university email (`@std-zuj.edu.jo`), password.
3. System sends 6-digit OTP via Resend.
4. Student enters OTP -> `auth.verifyEmail` -> account activated.
5. Student logs in -> redirected to `/dashboard`.
6. Dashboard detects no courses/study plan -> auto-calls `student.seed`.
7. Demo data created: study plan (132 credits, 15 completed, GPA 3.2), 5 courses, assignments, attendance records, course schedules, announcements.
8. Student views dashboard with seeded data.

### Scenario 2: Student Uses AI Chat
1. Student navigates to `/chat`.
2. Clicks "New Conversation" -> `aiChat.createConversation`.
3. Types: "What courses should I take next semester?"
4. Backend fetches student's GPA, completed credits, current courses, attendance rate, pending assignments, active alerts.
5. Payload sent to Runpod AI with full context.
6. AI responds with personalized recommendation based on actual academic standing.
7. Response saved and displayed in chat thread.

### Scenario 3: Advisor Monitors Students
1. Advisor logs in -> `/advisor`.
2. Dashboard shows 8 assigned students, 2 at-risk (high risk).
3. Advisor clicks at-risk student -> `/advisor/student-profile`.
4. Views: GPA 1.8, attendance 45%, 3 overdue assignments, 1 active alert.
5. Advisor clicks "Create Alert" -> enters title/message -> `advisor.createAlert`.
6. Student sees alert on next dashboard visit.
7. Advisor schedules appointment: `advisor.scheduleAppointment`.
8. Appointment appears on both dashboards.

### Scenario 4: Admin Manages System
1. Admin logs in -> `/admin`.
2. Overview tab shows: 150 students, 12 advisors, 45 courses, 20 FAQs.
3. Users tab: searches for student, changes role to advisor.
4. Advisors tab: assigns 5 unassigned students to advisor.
5. Content tab: creates new announcement for all students.
6. Students see announcement on next login.

---

## 16. Gaps and Incomplete Features

| Area | Status | Details |
|------|--------|---------|
| Admin analytics charts | **Not Real Data** | Uses hardcoded `analyticsData` and `aiStatsData` arrays |
| Advisor AI review | **Not Implemented** | Page exists, no backend endpoint for chat history access |
| Achievement auto-unlock | **Cannot Verify** | UI exists; no verified backend trigger logic |
| Document upload in chat | **Not Wired** | `uploaded_file_name` hardcoded to "None" in Runpod payload |
| Real-time notifications | **Not Implemented** | Notifications table exists; no WebSocket or polling for real-time delivery |
| Career paths | **Hardcoded** | `CAREER_PATHS` array in `analytics.ts` — not dynamic |
| OAuth login | **Placeholder** | `exchangeCodeForToken` and `getUserInfo` return placeholder values |
| Document RAG processing | **Partial** | Documents stored with extracted text; not verified if used by AI |
| Student-advisor messaging | **Not Implemented** | No direct messaging outside of alerts/recommendations/appointments |
| Grade entry by advisor | **Not Implemented** | Advisors cannot enter grades; only view existing ones |

---

*End of Documentation*
