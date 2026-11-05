# DISPATCH: Milestone 2 Worker (Full-Stack Module Hardening & UX Polish)

You are the Implementation Worker for Milestone 2: Full-Stack Module Hardening & UX Polish.
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m2_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Input References to Read:
1. `s:\murshid (1)\PROJECT.md`
2. `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_survey_2\handoff.md` (Frontend Survey: Unauthorized page, StudyPlan prerequisite badges, dead import cleanup)
3. `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_survey_3\handoff.md` (Feature Survey: Prerequisite guard in `courses.enrollCourse`)

## Your Exclusive File Ownership:
- `server/routers/courses.ts`
- `client/src/pages/StudyPlan.tsx`
- `client/src/pages/Unauthorized.tsx` (new file)
- `client/src/App.tsx`
- Deletion of orphan files: `client/src/pages/StudentDashboard_backup.tsx`, `client/src/pages/ComponentShowcase.tsx`

## Tasks to Execute:
1. **Course Prerequisite Verification Guard** in `server/routers/courses.ts`:
   - In `courses.enrollCourse`:
     * Before inserting into `studentcourses`, query `courseprerequisites` for `courseId`.
     * Check if student has completed all required prerequisites in `studentcourses` (with `status = 'completed'`).
     * Also check if the student is already enrolled or completed this course (prevent duplicate enrollments).
     * If unmet prerequisites exist, fetch their course codes/names and throw a clean `TRPCError({ code: "BAD_REQUEST", message: `Cannot enroll: Missing prerequisite course(s): ${missingCodes.join(", ")}` })`.
2. **Study Plan Prerequisite Visualization** in `client/src/pages/StudyPlan.tsx`:
   - Display prerequisite requirement badges on course cards.
   - For each course with prerequisites, display a small badge/pill indicating prerequisite course code (e.g., "Prereq: CS101"), color-coded green if completed or amber/red if not yet completed.
3. **Dedicated 403 Page** `client/src/pages/Unauthorized.tsx`:
   - Build a clean, professional, responsive 403 Forbidden page featuring:
     * ShieldAlert icon with styling matching Murshid theme.
     * Bilingual (Arabic/English) message explaining that this area requires specific role privileges (e.g. Advisor or Admin).
     * "Return to Dashboard" action button that navigates back to `/dashboard` (or user's appropriate home route).
4. **Router & Bundle Hygiene** in `client/src/App.tsx`:
   - Remove dead import `import Home from "./pages/Home";`.
   - Route `<Route path="/unauthorized" component={Unauthorized} />` to the new `Unauthorized` page instead of `NotFound`.
   - Remove orphan backup files: `client/src/pages/StudentDashboard_backup.tsx` and `client/src/pages/ComponentShowcase.tsx`.
5. **Verification**:
   - Run `npm run check` (`tsc --noEmit`) — MUST PASS WITH ZERO ERRORS.
   - Run `npm run build` — MUST PASS CLEANLY.
   - Run `npm test` — MUST PASS ALL TESTS.

## Deliverable:
Write your structured completion report with verified test output into:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m2_1\handoff.md`
Report when done via `send_message`.


## 2026-10-27T11:58:34Z
You are Worker 1 for Milestone 2 (Full-Stack Module Hardening & UX Polish).
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m2_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md
Your dispatch instructions: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m2_1\DISPATCH.md

Execute the tasks in DISPATCH.md:
1. Prerequisite verification in courses.enrollCourse (prevent enrollment if prerequisites are not completed, and prevent duplicate enrollments).
2. Visual prerequisite requirement badges in StudyPlan.tsx.
3. Build dedicated Unauthorized.tsx (403 page) with role explanation and return navigation.
4. Clean up dead Home import, route /unauthorized to Unauthorized, delete orphan files.
5. Verify with npm run check, npm run build, and npm test.
