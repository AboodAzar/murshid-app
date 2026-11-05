# Milestone 2 Adversarial Challenge Report: Prerequisite Verification & Route Guards

**Challenger**: Challenger 1 (`teamwork_preview_challenger_m2_1`)  
**Parent Agent**: Orchestrator (`bd241cda-c8ae-4f16-b4be-daab58196b4d`)  
**Date**: 2026-11-01  
**Working Directory**: `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m2_1\`  
**Target Milestone**: Milestone 2 — Full-Stack Module Hardening & UX Polish  
**Verdict**: **`APPROVE`**

---

## 1. Observation

### 1.1 Course Prerequisite & Duplicate Enrollment Guards (`server/routers/courses.ts`)
- **Direct Code Inspection**:
  - `courses.ts:229`: Enforces student-only enrollment: `if (ctx.user.role !== "student") throw new TRPCError({ code: "UNAUTHORIZED" });`.
  - `courses.ts:241-246`: Enforces course existence verification: throws `TRPCError({ code: "NOT_FOUND", message: "Course not found" })`.
  - `courses.ts:259-267`: Enforces duplicate enrollment protection:
    - If previously completed: `TRPCError({ code: "BAD_REQUEST", message: "Cannot enroll: Course has already been completed" })`.
    - If in progress or planned: `TRPCError({ code: "BAD_REQUEST", message: "Already enrolled in this course" })`.
  - `courses.ts:275-304`: Enforces prerequisite verification against `coursePrerequisites` and `studentCourses` with `status = 'completed'`:
    - Filters prerequisite course IDs against completed courses.
    - If unsatisfied prerequisite IDs exist, queries missing course codes and throws: `TRPCError({ code: "BAD_REQUEST", message: \`Cannot enroll: Missing prerequisite course(s): \${missingCodes.join(", ")}\` })`.
  - `courses.ts:139-165`: Exposes `courses.getAllPrerequisites` returning mapped `{ courseId, prerequisiteId, prerequisiteCode, prerequisiteName, prerequisiteNameAr }` via an SQL `innerJoin`.
  - `courses.ts:317`: All catch blocks preserve explicit `TRPCError` via `if (error instanceof TRPCError) throw error;`.

### 1.2 Study Plan Visual Prerequisite Badges (`client/src/pages/StudyPlan.tsx`)
- **Direct Code Inspection**:
  - `StudyPlan.tsx:23`: Fetches curriculum prerequisites via `trpc.courses.getAllPrerequisites.useQuery()`.
  - `StudyPlan.tsx:100-107`: Filters prerequisites per course card and computes `allPrereqsMet` by matching against student courses with `status === 'completed'`.
  - `StudyPlan.tsx:125-135`: For planned courses, renders readiness pills: `"Ready to Enroll"` (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`) when all prerequisites are satisfied, or `"Prereqs Pending"` (`bg-amber-500/10 text-amber-300 border-amber-500/20`) when unmet.
  - `StudyPlan.tsx:142-176`: Renders prerequisite badges:
    - Satisfied: `bg-emerald-500/15 text-emerald-400 border-emerald-500/30` with `CheckCircle2` icon: `✓ Prereq: CS101`.
    - Unsatisfied: `bg-amber-500/15 text-amber-300 border-amber-500/30` with `AlertTriangle` icon: `⚠️ Prereq: CS101`.

### 1.3 Dedicated 403 Forbidden Page & Route Guards (`client/src/pages/Unauthorized.tsx` & `client/src/components/ProtectedRoute.tsx`)
- **Direct Code Inspection**:
  - `ProtectedRoute.tsx:25-38`: Evaluates user authentication and required roles. Unauthenticated requests redirect to `/login`. Unauthorized role requests redirect to `/unauthorized`.
  - `App.tsx:9, 216`: Imports `Unauthorized` and routes `<Route path={"/unauthorized"} component={Unauthorized} />`. Dead `Home` import removed.
  - `Unauthorized.tsx`: Renders dark-themed 403 screen featuring glowing `ShieldAlert` icon, status badge `403 • Forbidden / غير مصرح`, bilingual explanation in English and Arabic, current user pill (name, email, role badge), dynamic "Return to Dashboard" action pointing to `/dashboard` (student), `/advisor` (advisor), or `/admin` (admin), plus Home and Switch Account actions.

### 1.4 Bundle & Test Hygiene
- Orphan files `client/src/pages/StudentDashboard_backup.tsx` and `client/src/pages/ComponentShowcase.tsx` were confirmed permanently removed: `Test-Path` returned `False`.

### 1.5 Empirical Verification Tool Commands & Outputs
1. **TypeScript Typecheck**:
   ```powershell
   npm run check
   ```
   *Result*: Exited with code 0 (`tsc --noEmit` clean, 0 errors).
2. **Automated Vitest Suite**:
   ```powershell
   npm test
   ```
   *Result*: Exited with code 0: 6/6 test files passed, 33/33 tests passed (including `server/routers/courses.test.ts`).
3. **Production Build**:
   ```powershell
   npm run build
   ```
   *Result*: Exited with code 0: Vite client bundle built in 16.99s, esbuild backend bundle built in 367ms.
4. **Database Health Validation**:
   ```powershell
   node scripts/validate-db.mjs
   ```
   *Result*: Exited with code 0: MariaDB live, 29 tables present, reporting `ok: true`.
5. **Empirical Adversarial Challenge Suite (`scripts/adversarial-challenger-m2.ts`)**:
   ```powershell
   npx tsx scripts/adversarial-challenger-m2.ts
   ```
   *Result*: Exited with code 0: **37/37 empirical verification checks passed (100% success rate)**.

---

## 2. Logic Chain

1. **Prerequisite Blocking Integrity**:
   - Observations 1.1 and 1.5 demonstrate that when a student with 0 completed courses attempts to enroll in Course 37 (CS102), the system queries `coursePrerequisites`, detects missing prerequisite Course 33 (CS101), queries its course code, and raises a `BAD_REQUEST` TRPCError stating `Cannot enroll: Missing prerequisite course(s): CS101`.
   - Observation 1.5 Suite 2 proves that if the prerequisite is only in status `in_progress` or `planned`, enrollment is strictly rejected. Only status `completed` satisfies prerequisites.
   - Observation 1.5 Suite 2 proves that deep prerequisite chains (e.g., CS304 requiring CS301) are properly rejected when intermediate prerequisites are missing.

2. **Eligible Course Enrollment**:
   - Observation 1.5 Suite 3 demonstrates that once Course 33 (CS101) is updated to `status: 'completed'`, the exact same student calling `courses.enrollCourse({ courseId: 37 })` succeeds with `{ success: true }`.
   - Direct database inspection confirmed the new enrollment was inserted into `studentCourses` with `status: 'planned'` and assigned semester 2.
   - Enrolling in a course with no prerequisites (e.g., MATH101) also succeeds cleanly.

3. **Duplicate Enrollment Prevention**:
   - Observation 1.5 Suite 4 demonstrates that calling `enrollCourse` on an already planned course throws `BAD_REQUEST` with `"Already enrolled in this course"`.
   - Calling `enrollCourse` on an in-progress course throws `BAD_REQUEST` with `"Already enrolled in this course"`.
   - Calling `enrollCourse` on an already completed course throws `BAD_REQUEST` with `"Cannot enroll: Course has already been completed"`.

4. **Route Guard & Authorization Enforcement**:
   - Observations 1.1, 1.3, and 1.5 Suites 5 & 6 demonstrate that server tRPC procedures strictly enforce roles:
     - Non-student callers (advisor, admin) calling `courses.enrollCourse` are blocked with `UNAUTHORIZED`.
     - Anonymous callers calling `protectedProcedure` (e.g. `student.dashboard`) are blocked with `UNAUTHORIZED`.
     - Student callers calling `advisorProcedure` (e.g. `documents.getStats`) are blocked with `FORBIDDEN`.
     - Student callers and advisor callers calling `adminProcedure` (e.g. `admin.dashboard`) are blocked with `FORBIDDEN`.
   - Client `ProtectedRoute` and `Unauthorized` matrix (Suite 7) guarantees that unauthenticated users redirect to `/login`, unauthorized roles redirect to `/unauthorized`, and `/unauthorized` correctly routes back to the user's role-appropriate dashboard (`/dashboard`, `/advisor`, or `/admin`).

5. **Visual Prerequisite Transparency**:
   - Observation 1.2 demonstrates that `StudyPlan.tsx` queries all prerequisite relations in a single call (`courses.getAllPrerequisites`) and renders distinct green (met) vs. amber (pending) badges on course cards, providing immediate UX clarity.

---

## 3. Adversarial Review Challenge Report

### Challenge Summary
**Overall Risk Assessment**: **LOW**

### Challenges Evaluated

#### [Low] Challenge 1: In-Progress Prerequisite Premature Enrollment
- **Assumption Challenged**: Students currently enrolled in a prerequisite course (status `in_progress`) might bypass prerequisite validation before final grades are submitted.
- **Attack Scenario**: Student enrolled in CS101 with status `in_progress` attempts to register for CS102.
- **Result**: Passed. `courses.ts` explicitly checks `studentCourses.status === "completed"`. In-progress prerequisites are rejected with `BAD_REQUEST Cannot enroll: Missing prerequisite course(s): CS101`.

#### [Low] Challenge 2: Duplicate Enrollment on Mutated Statuses
- **Assumption Challenged**: Duplicate enrollment guards might only check `completed` courses or fail when a course is in `planned` state.
- **Attack Scenario**: Consecutive duplicate calls to `enrollCourse` for planned and in-progress courses.
- **Result**: Passed. All states (`completed`, `in_progress`, `planned`) are guarded with distinct, appropriate messages.

#### [Low] Challenge 3: Non-Student Role Execution of Student Actions
- **Assumption Challenged**: Advisors or administrators might inadvertently invoke `courses.enrollCourse`.
- **Attack Scenario**: Advisor and admin session contexts calling `courses.enrollCourse`.
- **Result**: Passed. Both are rejected with `UNAUTHORIZED`.

### Stress Test Results

| Test ID | Scenario / Endpoint | Expected Behavior | Actual Behavior | Result |
|---------|---------------------|-------------------|-----------------|--------|
| T01 | `courses.getAllPrerequisites` | Returns non-empty mapped array | Array of 20+ relations returned | **PASS** |
| T02 | `courses.enrollCourse` (0 prereqs completed) | BAD_REQUEST (Missing CS101) | BAD_REQUEST: Missing CS101 | **PASS** |
| T03 | `courses.enrollCourse` (Deep prereq missing) | BAD_REQUEST (Missing CS301) | BAD_REQUEST: Missing CS301 | **PASS** |
| T04 | `courses.enrollCourse` (Prereq `in_progress`) | BAD_REQUEST (Missing CS101) | BAD_REQUEST: Missing CS101 | **PASS** |
| T05 | `courses.enrollCourse` (Prereq `planned`) | BAD_REQUEST (Missing CS101) | BAD_REQUEST: Missing CS101 | **PASS** |
| T06 | `courses.enrollCourse` (Prereq completed) | Success `{ success: true }` | Inserted `planned` row in DB | **PASS** |
| T07 | `courses.enrollCourse` (Zero prereqs needed) | Success `{ success: true }` | Inserted `planned` row in DB | **PASS** |
| T08 | `courses.enrollCourse` (Duplicate planned) | BAD_REQUEST (Already enrolled) | BAD_REQUEST: Already enrolled | **PASS** |
| T09 | `courses.enrollCourse` (Duplicate completed) | BAD_REQUEST (Already completed) | BAD_REQUEST: Already completed | **PASS** |
| T10 | `courses.enrollCourse` (Duplicate in_progress) | BAD_REQUEST (Already enrolled) | BAD_REQUEST: Already enrolled | **PASS** |
| T11 | `courses.enrollCourse` (Course 999999) | NOT_FOUND (Course not found) | NOT_FOUND: Course not found | **PASS** |
| T12 | `courses.enrollCourse` (Advisor role) | UNAUTHORIZED | UNAUTHORIZED | **PASS** |
| T13 | `courses.enrollCourse` (Admin role) | UNAUTHORIZED | UNAUTHORIZED | **PASS** |
| T14 | `courses.enrollCourse` (Anonymous) | UNAUTHORIZED | UNAUTHORIZED | **PASS** |
| T15 | `student.dashboard` (Anonymous) | UNAUTHORIZED | UNAUTHORIZED | **PASS** |
| T16 | `student.dashboard` (Student role) | Allowed | Allowed | **PASS** |
| T17 | `documents.getStats` (Anonymous) | FORBIDDEN | FORBIDDEN | **PASS** |
| T18 | `documents.getStats` (Student role) | FORBIDDEN | FORBIDDEN | **PASS** |
| T19 | `documents.getStats` (Advisor role) | Allowed | Allowed | **PASS** |
| T20 | `documents.getStats` (Admin role) | Allowed | Allowed | **PASS** |
| T21 | `admin.dashboard` (Anonymous) | FORBIDDEN | FORBIDDEN | **PASS** |
| T22 | `admin.dashboard` (Student role) | FORBIDDEN | FORBIDDEN | **PASS** |
| T23 | `admin.dashboard` (Advisor role) | FORBIDDEN | FORBIDDEN | **PASS** |
| T24 | `admin.dashboard` (Admin role) | Allowed | Allowed | **PASS** |
| T25 | `ProtectedRoute` (Unauthenticated) | Redirect to `/login` | Redirects to `/login` | **PASS** |
| T26 | `ProtectedRoute` (Student on Advisor) | Redirect to `/unauthorized` | Redirects to `/unauthorized` | **PASS** |
| T27 | `ProtectedRoute` (Student on Admin) | Redirect to `/unauthorized` | Redirects to `/unauthorized` | **PASS** |
| T28 | `ProtectedRoute` (Advisor on Admin) | Redirect to `/unauthorized` | Redirects to `/unauthorized` | **PASS** |
| T29 | `ProtectedRoute` (Advisor on Advisor) | Allowed | Allowed | **PASS** |
| T30 | `ProtectedRoute` (Admin on Admin) | Allowed | Allowed | **PASS** |
| T31 | `Unauthorized.tsx` (Student user) | Return path `/dashboard` | `/dashboard` | **PASS** |
| T32 | `Unauthorized.tsx` (Advisor user) | Return path `/advisor` | `/advisor` | **PASS** |
| T33 | `Unauthorized.tsx` (Admin user) | Return path `/admin` | `/admin` | **PASS** |
| T34 | `Unauthorized.tsx` (Anonymous user) | Return path `/login` | `/login` | **PASS** |

---

## 4. Caveats

- **Curriculum Prerequisite Cycles**: The Al-Zaytoonah University CS curriculum graph is statically acyclic (DAG). Dynamic cycle detection is unnecessary as prerequisite relations are fixed.
- **Advisor Override Workflow**: Administrative prerequisite waivers are not part of Milestone 2 scope; prerequisite verification is strictly enforced for all student enrollments.

---

## 5. Conclusion

**Verdict: `APPROVE`**

Milestone 2 (Prerequisite Verification Guard, Study Plan UX, 403 Page, and Route Guards) satisfies all functional requirements and security invariants without defect:
1. Prerequisite verification correctly prevents unauthorized enrollment with descriptive error feedback.
2. Eligible students with completed prerequisites successfully enroll into planned courses.
3. Duplicate enrollments are prevented for completed, in-progress, and planned states.
4. Server tRPC procedure guards and client-side route guards strictly protect student, advisor, and admin surfaces.
5. All 37 empirical adversarial verification checks, vitest unit tests (33/33), type checks (0 errors), and production builds pass cleanly.

---

## 6. Verification Method

To independently reproduce all empirical verification results:

1. **Run Full Adversarial Challenger Suite**:
   ```powershell
   npx tsx scripts/adversarial-challenger-m2.ts
   ```
   *Expected Output*: Exits with code 0, reporting:
   `Total Empirical Checks: 37 | Passed: 37 | Failed: 0 | Success Rate: 100.0%`
   `✅ ALL 37 EMPIRICAL ADVERSARIAL CHECKS PASSED WITH 100% SUCCESS.`

2. **Run Vitest Test Suite**:
   ```powershell
   npm test
   ```
   *Expected Output*: Exits with code 0, 6 passed test files, 33 passed tests.

3. **Run TypeScript Check**:
   ```powershell
   npm run check
   ```
   *Expected Output*: Exits with code 0 (`tsc --noEmit` clean).

4. **Run Production Build**:
   ```powershell
   npm run build
   ```
   *Expected Output*: Exits with code 0, building client in `dist/public` and backend in `dist/index.js`.
