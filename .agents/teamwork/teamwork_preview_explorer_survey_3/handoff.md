# Explorer 3 Survey Report: Feature Coverage, Test Scripts & AI Fallback

**Working Directory**: `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_survey_3\`  
**Target File**: `handoff.md`  
**Date**: 2026-10-27  

---

## 1. Observation

### 1.1 Build, Compilation & Database State
- **TypeScript Compilation Check (`npm run check`)**:
  - Command: `npm run check` -> `tsc --noEmit`
  - Output: Exit Code `0`. Zero type errors.
- **Production Build (`npm run build`)**:
  - Command: `vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
  - Output: Built client assets in 13.35s and bundled `dist/index.js` (268.8 kB) with exit code `0`.
- **Database Schema Validation (`node scripts/validate-db.mjs`)**:
  - Command: `node scripts/validate-db.mjs`
  - Output: Exit Code `0`.
    ```json
    {
      "ok": true,
      "url": "mysql://root:***@localhost:3306/murshid",
      "database": "murshid",
      "version": "10.11.16-MariaDB",
      "tableCount": 29,
      "requiredTableCount": 16
    }
    ```
- **Vitest Unit & Integration Tests (`npm run test`)**:
  - Command: `vitest run`
  - Output: `5 passed (5)` test files, `27 passed (27)` tests:
    - `server/_core/sdk.test.ts` (6 tests)
    - `server/routers/auth.test.ts` (3 tests)
    - `server/auth.logout.test.ts` (1 test)
    - `server/routers.test.ts` (10 tests)
    - `server/routers/passwordReset.test.ts` (7 tests)

---

### 1.2 Survey of All Scripts under `scripts/` (51 Files Total)

The `scripts/` directory contains 51 scripts categorized as follows:

| Category | Scripts | Analysis & Status |
|---|---|---|
| **Database Validation & Schema Verification** | `validate-db.mjs`, `check-all-tables-v2.mjs`, `check-all-tables.mjs`, `check-db-columns.mjs`, `check-migration-schema.mjs`, `check-migrations.mjs`, `check-tables.js`, `check-tables.mjs` | `validate-db.mjs` verifies all 16 required tables and columns. `check-all-tables-v2.mjs` inspects 29 tables; note that MariaDB on Windows returns lowercased table names (`academicalerts`), which causes exact camelCase `.includes()` in JS to falsely flag missing tables if not case-normalized. |
| **Data Seeding & Migration Utilities** | `seed-academic-data.mjs`, `seed-campus-data.mjs`, `fix-seed-passwords.mjs`, `rewrite-campus-nav.mjs`, `apply-0004.mjs`, `fix-migrations.mjs`, `deduplicate-enrollments.mjs`, `audit-duplicates.mjs`, `run-sql.mjs`, `setup-local-mysql.sql`, `mysql-root-reset.sql` | `seed-academic-data.mjs` populates 30+ courses, prerequisites, 3 advisors, 20 students, enrollments, schedules, and attendance. Passwords for all seeded students and advisors are hashed with PBKDF2 for `password123`. `audit-duplicates.mjs` confirms 0 duplicates across 408 enrollments. |
| **Diagnostics & DB Inspection** | `check-campus-data.mjs`, `check-nav-data.mjs`, `check-test-users.mjs`, `quick-check.mjs`, `debug-advisor.mjs`, `debug-studyplan.mjs`, `audit-trpc-calls.mjs`, `reset-advisor.mjs`, `restore-hanan.mjs`, `fix-admin-nav.mjs` | `check-campus-data.mjs` verifies 30 campus rooms (offices, labs, lecture halls). `audit-trpc-calls.mjs` audits frontend tRPC calls against backend routers. |
| **API Smoke & E2E Tests** | `smoke-test-all-apis.mjs`, `final-smoke-test.mjs`, `final-smoke-test-v2.mjs`, `smoke-test-cookies.mjs`, `smoke-test-full.mjs`, `smoke-test-student.mjs`, `e2e-advisor-assignment.mjs`, `test-advisor-assignment.mjs`, `test-advisor-workflow.mjs`, `test-assignment-v2.mjs`, `test-auth.mjs`, `test-cookie-flow.mjs`, `test-full-auth.mjs`, `test-full-auth-v2.mjs`, `test-full-auth-v3.mjs`, `test-login.mjs`, `test-login-client.mjs`, `test-register.mjs`, `test-roles.mjs`, `test-roles-v2.mjs`, `test-seed.mjs` | **Failure Root Causes Identified Below**. |

#### Key Failures in Existing Smoke Test Scripts
1. **Hardcoded Non-Existent Users & IDs**:
   - `scripts/final-smoke-test.mjs` (lines 67, 91, 102): Hardcodes student `test1781037416495@std-zuj.edu.jo`, advisor `nesreen@gmail.com`, and `studentId: 2`. These users do not exist in the current seeded DB.
   - `scripts/final-smoke-test-v2.mjs` (lines 53, 59): Hardcodes `id: 180002` and `test1781037416495@std-zuj.edu.jo`.
   - `scripts/smoke-test-full.mjs` (lines 70, 82): Hardcodes `noorhussein@gmail.com` and `nesreen@gmail.com`.
   - `scripts/test-advisor-workflow.mjs` (line 53): Mutates user `180002`.
2. **Missing Cookie Persistence in Fetch Wrapper**:
   - `scripts/smoke-test-all-apis.mjs` (line 4-11): Uses standard `httpBatchLink` without saving/forwarding `Set-Cookie`. Consequently, after calling `client.auth.login`, all subsequent calls (`auth.me`, `admin.dashboard`, `student.dashboard`, `advisor.dashboard`) fail with `UNAUTHORIZED`.
3. **Precondition Assumptions in Advisor Assignment**:
   - `scripts/test-assignment-v2.mjs` (line 59) & `scripts/e2e-advisor-assignment.mjs` (line 59): Both check `unassigned.length === 0`. Because `seed-academic-data.mjs` (line 220) automatically assigns all 20 seeded students to the 3 seeded advisors, `unassignedStudents` returns `0`, causing the test to abort.
4. **Hanging Database Connections in Standalone Scripts**:
   - Standalone scripts that import `drizzle(process.env.DATABASE_URL)` (like `check-test-users.mjs`) without calling `process.exit(0)` or closing the pool hang indefinitely in Node.js.

#### Verified Working Test Accounts in Database
- **Admin**: `abood@gmail.com` / `Abood#2004` (ID: 1, `role: admin`, `isEmailVerified: 1`)
- **Advisors**: `a.khalil@zuj.edu.jo`, `s.mahmoud@zuj.edu.jo`, `o.hassan@zuj.edu.jo` / `password123` (`role: advisor`, `isEmailVerified: 1`)
- **Students**: `khaled.haddad@zuj.edu.jo` (ID: 210027), `lina.omar@zuj.edu.jo`, `basma.hassan@zuj.edu.jo`, etc. / `password123` (`role: student`, `isEmailVerified: 1`)

---

### 1.3 AI Chat Implementation & External Runpod Integration

1. **External Endpoint Configuration**:
   - `.env` (line 8): `RUNPOD_API_URL=https://w3826qxum4rug3-8000.proxy.runpod.net/`
   - Real-world reachability test: `fetch('https://w3826qxum4rug3-8000.proxy.runpod.net/chat')` timed out. The external Runpod container is completely offline.

2. **Call Sites in Codebase**:
   - `server/routers/aiChat.ts` (lines 207–238):
     ```typescript
     const runpodUrl = process.env.RUNPOD_API_URL;
     ...
     const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/chat`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(runpodPayload),
     });
     ```
   - `server/routers/faqs.ts` (lines 134–148):
     `fetch(`${runpodUrl.replace(/\/$/, '')}/add_faq`, ...)` called on FAQ create.
   - `server/routers/documents.ts` (lines 130–144, 350, 427, 488):
     `fetch(`${runpodUrl.replace(/\/$/, '')}/upload_document`, ...)` and `/add_url` called on document uploads and official resource links.

3. **Failure Modes When Runpod is Offline**:
   - **No Request Timeout**: None of the `fetch` calls use `AbortSignal.timeout(...)`. The Node.js process hangs for 60–120+ seconds waiting for socket termination.
   - **Uncaught Flow / Raw Error Leak**: In `aiChat.ts` line 269–272:
     ```typescript
     catch (error: any) {
       console.error("[AI Chat] Failed to send message:", error);
       return { success: false, response: `Exact Error: ${error.message}` };
     }
     ```
     The client receives `Exact Error: fetch failed` as the response text.
   - **Misleading UI State**: In `client/src/pages/AIChatPage.tsx` (lines 201–202):
     ```tsx
     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
     <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">AI Online</span>
     ```
     Displays "AI Online" with a green pulse unconditionally, even when the server cannot reach Runpod.

4. **Available Local Knowledge Base Data**:
   - **Database Tables**:
     - `faqs` table: Contains FAQ entries (`question`, `questionAr`, `answer`, `answerAr`, `category`, `isActive`).
     - `studyPlans`, `studentCourses`, `courses`, `coursePrerequisites`: Full curriculum, prerequisites, semester plans.
     - `attendance`, `assignments`, `studentAssignments`, `academicAlerts`: Real-time student academic standing.
   - **Repository Files in `Runpod/data/`**:
     - `AI_Materials_Descriptions.csv`, `CS_Materials_Descriptions.csv`, `SE_Materials_Descriptions.csv`
     - `AI_Study_Plan_1.csv`, `CS_Study_Plan_1.csv`, `SE_Study_Plan_1.csv`
     - `Facility_Fees.csv`, `Unversity_Fees.csv`
     - `Faculty_Guide.pdf`, `Rules_and_Regulations.pdf`, `University_Guide.pdf`

---

### 1.4 Authentication & Security Architecture

1. **Password Hashing & Verification**:
   - File: `server/_core/authSecurity.ts` (lines 44–87)
   - Algorithm: PBKDF2 with SHA-512, 210,000 iterations, 64-byte key length, and 16-byte random salt (`pbkdf2:sha512:210000:<salt>:<hash>`).
   - Comparison: Constant-time comparison using `crypto.timingSafeEqual` preventing timing attacks. Legacy 2-part hashes (`salt:hash`) also supported for backward compatibility.

2. **Session & Cookie Management**:
   - File: `server/_core/cookies.ts` (lines 24–50) & `server/_core/sdk.ts` (lines 36–40)
   - Cookie Name: `COOKIE_NAME = "app_session_id"`
   - Cookie Options: `httpOnly: true`, `path: "/"`, `sameSite: "lax"` (or `"none"` if secure HTTPS), `maxAge: 7 days` (604,800,000 ms).
   - Session Token: Signed JWT via `jose` library with HS256 (`getJwtSecretKey()`).
   - Request Authentication: `sdk.authenticateRequest(req)` parses `app_session_id`, verifies JWT signature and payload type (`"local-auth"`), loads user from MySQL, and injects into `opts.ctx.user`.

3. **Role-Based Guards (Client & Server)**:
   - **Server tRPC Middleware (`server/_core/trpc.ts`)**:
     - `publicProcedure`: No authentication required.
     - `protectedProcedure`: Throws `UNAUTHORIZED` (`UNAUTHED_ERR_MSG`) if `!ctx.user`.
     - `adminProcedure`: Throws `FORBIDDEN` (`NOT_ADMIN_ERR_MSG`) if `!ctx.user || ctx.user.role !== "admin"`.
     - `advisorProcedure`: Throws `FORBIDDEN` (`NOT_ADVISOR_ERR_MSG`) if `!ctx.user || (ctx.user.role !== "advisor" && ctx.user.role !== "admin")`.
   - **Data-Level Ownership Guards (`server/routers/student.ts`)**:
     - Helper `resolveTargetStudent`:
       - Student role: Forced to view only their own record (`user.id`).
       - Advisor role: Forced to view only students where `student.advisorId === user.id`. Unauthorized access throws `FORBIDDEN`.
       - Admin role: Permitted to view any student.
   - **Client Route Guards (`client/src/components/ProtectedRoute.tsx`)**:
     - Wraps protected routes in `App.tsx`.
     - Intercepts unauthenticated state and redirects to `/login`.
     - Compares `user.role` with `requiredRole`; redirects to `/unauthorized` if mismatched.

4. **Input Validation (Zod)**:
   - Every procedure in `server/routers/*.ts` defines a strict Zod input schema (`z.object({...})`).
   - Registration enforces university domains (`@zuj.edu.jo` or `@std-zuj.edu.jo`) and minimum password length (8 chars).
   - Rate limiting middleware applied in `server/_core/index.ts` (`authRateLimiter`, `passwordResetRateLimiter`, `generalRateLimiter`).

---

### 1.5 Feature Inventory vs Requirements R1–R4

| Requirement | Area | Feature Details | Verification / Current State |
|---|---|---|---|
| **R1** | Database | Local MariaDB/MySQL connection | `ok: true`, 29 tables, MariaDB 10.11 on port 3306. |
| **R1** | Web Server | Express + Vite on port 3000 | Configured in `server/_core/index.ts`. Port 3000 free and verified. |
| **R1** | Type Checking | TypeScript compilation | `npm run check` passes with 0 errors. |
| **R1** | Build | Client & Server bundle | `npm run build` succeeds cleanly in 13.35s. |
| **R2** | Student Portal | Study plan tracking | Implemented in `student.dashboard`, `student.myCourses`, `StudyPlan.tsx`. |
| **R2** | Student Portal | Prerequisite verification | `coursePrerequisites` seeded; checked in `analytics.smartRecommendations` and `courses.getPrerequisites`. (`courses.enrollCourse` should add direct prereq check). |
| **R2** | Student Portal | GPA & Progress tracking | Computed via `studentCourses` and stored in `studyPlans`. Displayed in dashboard. |
| **R2** | Student Portal | Course recommendations | `analytics.smartRecommendations` scores courses based on prerequisites and GPA. |
| **R2** | Student Portal | Assignments & Attendance | `student.assignments`, `student.attendance` returning full records. |
| **R2** | Advisor Portal | Advisee roster management | `advisor.getAssignedStudents`, `advisor.getStudentProfile`, `AdvisorStudents.tsx`. |
| **R2** | Advisor Portal | Academic alert dispatching | `advisor.createAlert`, `advisor.resolveAlert`, `advisor.getAlerts`. |
| **R2** | Advisor Portal | Advisor notes & appointments | `advisor.getNotes`, `advisor.addNote`, `advisor.getAppointments`. |
| **R2** | Advisor Portal | Knowledge management | `faqs` and `documents` routers with full CRUD. |
| **R2** | Admin Portal | User management & roles | `admin.dashboard`, `admin.updateUser`, `admin.deleteUser`. |
| **R2** | Admin Portal | Advisor assignments | `admin.assignAdvisor`, `admin.getAdvisorsWithStudents`, `admin.getUnassignedStudents`. |
| **R2** | Admin Portal | System metrics | `admin.dashboard` aggregates counts for users, courses, departments, FAQs. |
| **R2** | Campus Nav | Building & room search, routes | `navigation.campus` returns 30+ rooms across floors. `CampusNavigation.tsx` has interactive map, step-by-step route directions, services directory. |
| **R2** | Auth & Security | Session, cookies, guards, Zod | Fully implemented across `authSecurity.ts`, `cookies.ts`, `trpc.ts`, `ProtectedRoute.tsx`. |
| **R3** | AI Chat Fallback | Decouple from external Runpod | **Missing**: Calls `RUNPOD_API_URL` without timeout. Needs local offline fallback. |
| **R3** | AI Chat Fallback | Local FAQ & Academic Rules fallback | **Missing**: Needs local fallback engine returning FAQ matches and student context guidance. |
| **R3** | AI Chat Fallback | Offline UI Messaging | **Missing**: Needs badge update in `AIChatPage.tsx` indicating offline local fallback mode. |
| **R4** | Automated Testing | Fix existing test scripts in `scripts/` | **Identified**: Existing smoke scripts fail due to obsolete credentials/IDs and missing cookie headers. |
| **R4** | Automated Testing | Comprehensive E2E Test Suite | **Needed**: Unified E2E test script testing Student, Advisor, Admin, Nav, and AI Fallback using seeded credentials. |

---

## 2. Logic Chain

1. **Premise 1 (Build & Environment Stability)**:
   - Observation: `npm run check` exits 0 with 0 errors, `npm run build` exits 0 bundling client and server cleanly, `validate-db.mjs` exits 0 with all required tables and columns present, and Vitest passes 27/27 tests.
   - Inference: Requirement R1 (Local Environment & Build Pipeline) is fundamentally sound and ready.

2. **Premise 2 (Why Existing Smoke Scripts Fail)**:
   - Observation: Scripts `final-smoke-test.mjs`, `final-smoke-test-v2.mjs`, and `smoke-test-full.mjs` fail on user logins (`test1781037416495@std-zuj.edu.jo`, `nesreen@gmail.com`) or IDs (`180002`). Checking the database confirms these users do not exist; instead, `seed-academic-data.mjs` created `a.khalil@zuj.edu.jo`, `s.mahmoud@zuj.edu.jo`, and `khaled.haddad@zuj.edu.jo`.
   - Observation: `smoke-test-all-apis.mjs` does not pass cookies between requests, causing all protected tRPC queries to fail.
   - Observation: `test-assignment-v2.mjs` fails because the seeder assigns 100% of students to advisors, leaving `0` unassigned students.
   - Inference: The application backend logic is functional; the test scripts are failing because of obsolete hardcoded fixtures and missing cookie headers. Aligning the test scripts to dynamic or valid seeded credentials will achieve 100% test pass rates.

3. **Premise 3 (Runpod Dependency & AI Fallback Architecture)**:
   - Observation: `.env` points to `RUNPOD_API_URL=https://w3826qxum4rug3-8000.proxy.runpod.net/`, which is completely offline. In `aiChat.ts`, `fetch` has no timeout and catches errors to return `Exact Error: fetch failed`. In `AIChatPage.tsx`, the UI displays a green "AI Online" badge.
   - Observation: The database already has `faqs`, `studyPlans`, `studentCourses`, `coursePrerequisites`, and student attendance/assignments. Rich academic guides exist in `Runpod/data/`.
   - Inference: To fulfill Requirement R3:
     1. Add an `AbortSignal.timeout(2000)` (2 seconds) to `fetch(RUNPOD_API_URL)` with a try-catch fallback.
     2. Create a local fallback engine (`server/utils/aiFallback.ts` or inside `aiChat.ts`) implementing a 3-tier strategy:
        - **Tier 1 (FAQ Matcher)**: Query MySQL `faqs` for keyword/phrase overlap in Arabic and English.
        - **Tier 2 (Student Academic Rules Guidance)**: Detect intents (GPA, current schedule, prerequisites, attendance warnings, assignments, graduation requirements) and generate personalized responses based on `studentContext`.
        - **Tier 3 (Academic Advisor Simulation)**: Provide helpful academic advisory guidance in student's preferred language.
     3. Return an explicit flag: `{ success: true, response: aiMessage, isOfflineFallback: true, source: "faq" | "academic_rules" | "local_advisor" }`.
     4. Update `client/src/pages/AIChatPage.tsx` to detect offline mode and render an Amber/Violet "Offline Mode (Local Knowledge Base)" indicator with an informative advisory banner.
     5. Make Runpod sync in `documents.ts` and `faqs.ts` non-blocking with short timeouts so file uploads and FAQ editing never hang.

4. **Premise 4 (Security & Feature Completeness)**:
   - Observation: PBKDF2 hashing, JOSE HS256 tokens, HTTP-only cookie management, server-side tRPC middleware guards (`adminProcedure`, `advisorProcedure`, `protectedProcedure`), data isolation in `studentRouter`, and client-side `ProtectedRoute` guards are fully implemented.
   - Inference: Requirement R2 is production-ready, requiring only minor safeguard enhancements (e.g., prerequisite verification at enrollment in `courses.enrollCourse`).

---

## 3. Caveats

1. **Third-Party Email Dispatch**: `RESEND_API_KEY` is configured in `.env`. In local development, `sendVerificationEmail` logs to console if Resend fails, so local testing is unaffected.
2. **Browser Storage State**: Some client components write to `localStorage` (`manus-runtime-user-info`). This is supplementary to the authoritative HTTP-only session cookie.
3. **Database Case Sensitivity**: Windows MariaDB/MySQL is case-insensitive for table names, returning them as lowercased strings (`academicalerts`). Any test scripts querying `information_schema.TABLES` must normalize strings with `.toLowerCase()`.

---

## 4. Conclusion

1. **System Health**: The Murshid platform's core architecture (Express, Vite, tRPC, Drizzle, MariaDB, React 19, Tailwind) compiles cleanly (`npm run check` passes, `npm run build` succeeds, `validate-db.mjs` passes, Vitest passes 27/27).
2. **Primary Blockers to Production Readiness**:
   - **External LLM Decoupling (R3)**: AI Chat, FAQ sync, and Document upload hang or fail when `RUNPOD_API_URL` is offline. Implementing a fast timeout with a 3-tier local FAQ/rules fallback and UI offline badge will make the chat interface 100% resilient offline.
   - **Test Suite Modernization (R4)**: Existing scripts in `scripts/` fail due to stale user credentials and missing cookie persistence. A unified end-to-end test script using real seeded accounts (`abood@gmail.com`, `a.khalil@zuj.edu.jo`, `khaled.haddad@zuj.edu.jo`) will validate all Student, Advisor, Admin, Navigation, and AI Chat workflows cleanly.
   - **Enrollment Prerequisite Guard (R2)**: Add prerequisite verification check inside `courses.enrollCourse` to prevent students from registering for courses without completed prerequisites.

---

## 5. Verification Method

To independently verify the observations and conclusions in this report:

1. **Verify Compilation & Build**:
   ```bash
   npm run check
   npm run build
   ```
   *Expected*: Both exit with code 0.

2. **Verify Database Connectivity**:
   ```bash
   node scripts/validate-db.mjs
   ```
   *Expected*: Outputs `{"ok": true, ...}` with exit code 0.

3. **Verify Vitest Test Suite**:
   ```bash
   npm run test
   ```
   *Expected*: All 5 test files pass (27/27 tests).

4. **Verify Seeded Credentials**:
   ```bash
   node -e "import('dotenv/config'); import('./server/_core/authSecurity.ts').then(async m => { const conn = await (await import('mysql2/promise')).createConnection(process.env.DATABASE_URL); const [rows] = await conn.query('SELECT id, email, password, role FROM users WHERE email IN (\'abood@gmail.com\', \'a.khalil@zuj.edu.jo\', \'khaled.haddad@zuj.edu.jo\')'); for (const r of rows) { const ok = m.verifyPassword(r.role === 'admin' ? 'Abood#2004' : 'password123', r.password); console.log(r.email, r.role, 'Password check:', ok); } await conn.end(); })"
   ```
   *Expected*: Outputs `true` for all 3 roles.

5. **Verify Runpod Offline Timeout**:
   ```bash
   node -e "fetch('https://w3826qxum4rug3-8000.proxy.runpod.net/chat', { method: 'POST', body: '{}', headers: {'Content-Type': 'application/json'}, signal: AbortSignal.timeout(3000) }).catch(e => console.log('Runpod status:', e.message))"
   ```
   *Expected*: Aborts with timeout, confirming Runpod model endpoint is offline.

*Invalidation Conditions*:
- If `npm run check` or `npm run build` fails with bundle or typing errors.
- If `validate-db.mjs` fails to connect or finds missing tables.
- If Runpod becomes responsive and returns HTTP 200 with valid LLM chat tokens.
