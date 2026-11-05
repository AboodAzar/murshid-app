# Murshid Automated E2E Test Suite (Milestone 5 Delivery)

## Overview
Comprehensive 5-tier automated end-to-end (E2E) testing suite for the Murshid Academic Guidance Platform (Al-Zaytoonah University of Jordan). The suite executes opaque-box tests against the live HTTP / tRPC server on `http://localhost:3000/api/trpc` using cookie jar session persistence, verifies 100% test pass rate, and ensures 0 database state drift.

## Test Runner Commands

### Run Full 5-Tier Test Suite
```bash
npm run test:e2e
```
or
```bash
node tests/e2e/run-all-e2e.mjs
```

### Run Individual Tiers
```bash
# Tier 1: Feature Coverage (38 tests)
node tests/e2e/tier1-features.mjs

# Tier 2: Boundary & Corner Cases (39 tests)
node tests/e2e/tier2-boundaries.mjs

# Tier 3: Pairwise Cross-Feature Combinations (5 tests)
node tests/e2e/tier3-cross-feature.mjs

# Tier 4: Real-World Workload Scenarios (5 tests)
node tests/e2e/tier4-scenarios.mjs

# Tier 5: Adversarial Coverage Hardening (34 tests)
node tests/e2e/tier5-adversarial.mjs
```

---

## Tier Coverage Metrics & Results

| Tier | Description | Target | Implemented | Passed | Failed | Pass Rate |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tier 1** | Feature Coverage (F1 through F7) | ≥35 | 38 | 38 | 0 | **100%** |
| **Tier 2** | Boundary & Corner Cases (F1 through F7) | ≥35 | 39 | 39 | 0 | **100%** |
| **Tier 3** | Pairwise Cross-Feature Combinations | ≥5 | 5 | 5 | 0 | **100%** |
| **Tier 4** | Real-World Application Workflows | ≥5 | 5 | 5 | 0 | **100%** |
| **Tier 5** | Adversarial Coverage Hardening & Router Audit | ≥30 | 34 | 34 | 0 | **100%** |
| **Total** | **All Tiers Master Suite** | **≥110** | **121** | **121** | **0** | **100%** |

---

## Feature Coverage Matrix (F1 to F7)

| Feature | Feature Area | Tier 1 (Coverage) | Tier 2 (Boundaries) | Tier 3 (Cross-Feature) | Tier 4 (Workflows) | Status |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **F1** | Auth & Session Management | 5 tests | 6 tests | ✓ (T3.1) | ✓ (S1, S2, S5) | **VERIFIED** |
| **F2** | Student Academic Progress & Dashboard | 6 tests | 5 tests | ✓ (T3.3) | ✓ (S1, S2) | **VERIFIED** |
| **F3** | Course Enrollment & Prerequisite Guard | 5 tests | 6 tests | ✓ (T3.5) | ✓ (S1) | **VERIFIED** |
| **F4** | Advisor Roster & Alerts Workflow | 6 tests | 6 tests | ✓ (T3.2, T3.3, T3.4) | ✓ (S2) | **VERIFIED** |
| **F5** | Admin User & Advisor Assignment | 5 tests | 5 tests | ✓ (T3.1, T3.2) | ✓ (S5) | **VERIFIED** |
| **F6** | Campus Navigation & Room Finder | 5 tests | 5 tests | ✓ (T3.4) | ✓ (S4) | **VERIFIED** |
| **F7** | AI Chat Graceful Mock & Local Fallback | 6 tests | 6 tests | ✓ (T3.5) | ✓ (S3) | **VERIFIED** |

---

## Detailed Test Inventory

### Tier 1 — Feature Coverage (`tests/e2e/tier1-features.mjs`)
- `T1.1.1`: Admin login succeeds with valid credentials (`abood@gmail.com` / `Abood#2004`).
- `T1.1.2`: Advisor login succeeds with valid credentials (`a.khalil@zuj.edu.jo` / `password123`).
- `T1.1.3`: Student login succeeds with valid credentials (`khaled.haddad@zuj.edu.jo` / `password123`).
- `T1.1.4`: `auth.me` validates active session with correct role, email, and user ID.
- `T1.1.5`: `auth.logout` clears session cookie and invalidates session.
- `T1.2.1`: `student.dashboard` returns student profile, GPA, earned credits, and academic metrics.
- `T1.2.2`: `student.myCourses` returns enrolled courses list with course details.
- `T1.2.3`: `student.todaySchedule` returns timetable with lecture slots.
- `T1.2.4`: `student.attendance` returns attendance log with present/absent counts.
- `T1.2.5`: `student.assignments` returns course assignments with submission status.
- `T1.2.6`: `student.overview` returns degree progress metrics, streak, and achievements.
- `T1.3.1`: `courses.list` queries university course catalog with pagination metadata.
- `T1.3.2`: `courses.getById` retrieves course details and credit hours.
- `T1.3.3`: `courses.getPrerequisites` retrieves prerequisite courses for specified course.
- `T1.3.4`: `courses.getAllPrerequisites` retrieves full prerequisite mapping catalog.
- `T1.3.5`: `courses.getRecommendations` returns academic course suggestions.
- `T1.4.1`: `advisor.getAssignedStudents` lists advisees for logged-in advisor.
- `T1.4.2`: `advisor.getStudentProfile` retrieves detailed student academic record.
- `T1.4.3`: `advisor.getInsights` returns advisor aggregate statistics (totalStudents, atRisk, etc.).
- `T1.4.4`: `advisor.createAlert` creates academic alert, verified in `advisor.getAlerts`, and cleaned up.
- `T1.4.5`: `advisor.addNote` adds advisor note, verified in `advisor.getNotes`, and cleaned up.
- `T1.4.6`: `advisor.getAppointments` retrieves scheduled student advising sessions.
- `T1.5.1`: `admin.dashboard` returns user metrics and system health indicators.
- `T1.5.2`: `admin.getAdvisorsWithStudents` returns advisor roster with advisee counts.
- `T1.5.3`: `admin.getUnassignedStudents` queries students needing advisor pairing.
- `T1.5.4`: `admin.updateUser` updates user name and restores original name with zero state drift.
- `T1.5.5`: `announcements.create` creates announcement, verifies it in `announcements.list`, and deletes it.
- `T1.6.1`: `navigation.campus` returns campus buildings with geographic coordinates.
- `T1.6.2`: `navigation.campus` returns room directory across campus buildings.
- `T1.6.3`: Locate IT Faculty building and verify capacity and floor metadata.
- `T1.6.4`: Filter classroom rooms by type and verify floor assignment.
- `T1.6.5`: Verify room coordinates associate with parent building.
- `T1.7.1`: `aiChat.getStatus` returns AI status with `local_mock_fallback` mode.
- `T1.7.2`: `aiChat.createConversation` creates student chat session.
- `T1.7.3`: `aiChat.sendMessage` answers FAQ query with local fallback answer.
- `T1.7.4`: `aiChat.sendMessage` answers academic rules query with regulation text.
- `T1.7.5`: `aiChat.getMessages` retrieves stored message thread.
- `T1.7.6`: `aiChat.deleteConversation` cleans up conversation and messages with zero DB drift.

### Tier 2 — Boundary & Corner Cases (`tests/e2e/tier2-boundaries.mjs`)
- `T2.1.1`: Login with invalid password fails with UNAUTHORIZED.
- `T2.1.2`: Login with unregistered email fails with UNAUTHORIZED.
- `T2.1.3`: Registration with non-ZUJ email rejected with BAD_REQUEST.
- `T2.1.4`: Registration with short password (<8 chars) rejected by Zod schema.
- `T2.1.5`: Accessing protected endpoint with malformed JWT cookie rejected with UNAUTHORIZED.
- `T2.1.6`: Accessing protected endpoint unauthenticated rejected with UNAUTHORIZED.
- `T2.2.1`: Student accessing admin route (`admin.dashboard`) throws FORBIDDEN (10002).
- `T2.2.2`: Student accessing advisor route (`advisor.createAlert`) throws FORBIDDEN (10003).
- `T2.2.3`: Student accessing advisor note route (`advisor.addNote`) throws FORBIDDEN (10003).
- `T2.2.4`: Student querying another student's dashboard throws FORBIDDEN / restricts to own ID.
- `T2.2.5`: Student querying non-existent course details returns null gracefully.
- `T2.3.1`: Enrolling in non-existent course ID (999999) rejected with NOT_FOUND.
- `T2.3.2`: Enrolling in course with missing prerequisite rejected with BAD_REQUEST.
- `T2.3.3`: Enrolling in already completed course rejected with BAD_REQUEST.
- `T2.3.4`: Duplicate enrollment in in-progress course rejected with BAD_REQUEST.
- `T2.3.5`: Advisor attempting `courses.enrollCourse` rejected with UNAUTHORIZED.
- `T2.3.6`: Admin attempting `courses.enrollCourse` rejected with UNAUTHORIZED.
- `T2.4.1`: Advisor accessing admin route (`admin.assignAdvisor`) throws FORBIDDEN (10002).
- `T2.4.2`: Advisor attempting to create alert for unassigned/foreign student throws FORBIDDEN.
- `T2.4.3`: Advisor attempting to add note for unassigned/foreign student throws FORBIDDEN.
- `T2.4.4`: Advisor attempting to schedule appointment for foreign student throws FORBIDDEN.
- `T2.4.5`: Advisor resolving non-existent alert ID throws NOT_FOUND.
- `T2.4.6`: Advisor deleting non-existent note ID throws NOT_FOUND.
- `T2.5.1`: Admin self-deletion attempt rejected with BAD_REQUEST.
- `T2.5.2`: Admin updating non-existent user ID rejected with NOT_FOUND.
- `T2.5.3`: Admin assigning non-existent advisor ID rejected with NOT_FOUND.
- `T2.5.4`: Admin assigning advisor to non-existent student ID rejected with NOT_FOUND.
- `T2.5.5`: Announcement creation with empty title rejected by schema validation.
- `T2.6.1`: Campus navigation query without auth rejected with UNAUTHORIZED.
- `T2.6.2`: Searching non-existent room code yields no matches gracefully.
- `T2.6.3`: Buildings list contains only valid finite numeric coordinates (no null/NaN).
- `T2.6.4`: Rooms list contains valid positive capacity values.
- `T2.6.5`: Navigation handles special characters and XSS safely in queries.
- `T2.7.1`: AI chat request returns response in <1500ms under offline fallback.
- `T2.7.2`: Accessing AI chat messages for non-existent conversation returns NOT_FOUND.
- `T2.7.3`: Rating a non-existent message ID returns NOT_FOUND.
- `T2.7.4`: Non-student role (Advisor) attempting `createConversation` rejected with UNAUTHORIZED.
- `T2.7.5`: Non-student role (Admin) attempting `createConversation` rejected with UNAUTHORIZED.
- `T2.7.6`: Deleting a non-existent conversation ID returns NOT_FOUND.

### Tier 3 — Pairwise Cross-Feature Combinations (`tests/e2e/tier3-cross-feature.mjs`)
- `T3.1`: Admin creates announcement → Student and Advisor dashboards immediately reflect the announcement; cleaned up via `announcements.delete`.
- `T3.2`: Admin assigns student to Advisor → Advisor advisee roster and insights immediately reflect the student; restored to original state.
- `T3.3`: Advisor creates academic alert → Student dashboard reflects alert in `advisorAlerts`; Advisor resolves alert and deletes it.
- `T3.4`: Advisor schedules advising appointment → Student timetable reflects appointment and room matches campus navigation directory; cancelled and cleaned up.
- `T3.5`: Student asks AI about prerequisite rule → AI returns university regulation policy → Student inspects study plan catalog.

### Tier 4 — Real-World Workload Scenarios (`tests/e2e/tier4-scenarios.mjs`)
- `Scenario 1`: **New Semester Academic Onboarding**
  - Student logs in, reviews transcript and GPA in dashboard, queries course recommendations, checks prerequisite requirements from catalog, inspects weekly timetable, and validates student announcements.
- `Scenario 2`: **At-Risk Student Advisor Intervention**
  - Advisor logs in, inspects advisee roster & insights, flags at-risk student, dispatches high-severity academic alert, records private clinical note (verified invisible to student), schedules advising appointment. Student logs in, verifies alert in dashboard and scheduled session. Advisor resolves alert and deletes test rows.
- `Scenario 3`: **Offline Academic Advisory Assistance**
  - Student opens AI Chat when model server is offline, verifies offline fallback indicator status, queries AI about minimum GPA rules and graduation credit requirements, receives deterministic local university policy guidance, rates assistant message, and cleans up conversation.
- `Scenario 4`: **Campus Lecture Navigation**
  - Student loads full weekly schedule, extracts lecture room code, queries campus navigation directory, locates faculty building and floor, verifies building coordinates, and checks room capacity.
- `Scenario 5`: **Administrative Faculty Governance**
  - Admin audits system metrics via `admin.dashboard`, lists unassigned students, pairs student with advisor, creates campus announcement, verifies announcement visible across roles, removes test announcement, and restores original advisor assignment.

### Tier 5 — Adversarial Coverage Hardening (`tests/e2e/tier5-adversarial.mjs`)
#### Category 1: TRPCError Code Preservation & Bug Verification
- `T5.1.1`: `aiChat.getMessages` with non-existent conversation returns `NOT_FOUND` (not `INTERNAL_SERVER_ERROR`).
- `T5.1.2`: `aiChat.rateMessage` with non-existent message returns `NOT_FOUND` (not `INTERNAL_SERVER_ERROR`).
- `T5.1.3`: `aiChat.deleteConversation` with non-existent conversation returns `NOT_FOUND` (not `INTERNAL_SERVER_ERROR`).
- `T5.1.4`: `aiChat.sendMessage` with non-existent conversation rejects with `NOT_FOUND` (not swallowed with fallback).
- `T5.1.5`: `aiChat.rateMessage` IDOR check: student cannot rate messages belonging to another student's conversation.
- `T5.1.6`: `documents.delete` with non-existent ID throws `FORBIDDEN` / `NOT_FOUND` (not `INTERNAL_SERVER_ERROR`).
- `T5.1.7`: `documents.retryDocumentIndexing` with non-existent ID throws `NOT_FOUND` (not `INTERNAL_SERVER_ERROR`).

#### Category 2: Boundary Value Analysis & Schema Guards
- `T5.2.1`: `courses.list` with `page: 0` rejected by Zod schema with `BAD_REQUEST`.
- `T5.2.2`: `courses.list` with negative page (`page: -1`) rejected by Zod schema.
- `T5.2.3`: `courses.list` with `limit: 0` rejected by Zod schema.
- `T5.2.4`: `courses.list` with excessive limit (`limit: 500` > 100 max) rejected by Zod schema.
- `T5.2.5`: `faqs.list` with `page: 0` rejected by Zod schema.
- `T5.2.6`: `announcements.create` with massive 50KB payload handled safely.
- `T5.2.7`: `advisor.scheduleAppointment` with `durationMinutes: 1` (< 5 min) rejected.
- `T5.2.8`: `advisor.scheduleAppointment` with `durationMinutes: 500` (> 240 max) rejected.

#### Category 3: Course Enrollment Prerequisite & Concurrency Boundaries
- `T5.3.1`: `courses.enrollCourse` with missing intermediate prerequisite rejected with `BAD_REQUEST`.
- `T5.3.2`: `courses.enrollCourse` for already completed course rejected with `BAD_REQUEST`.
- `T5.3.3`: `courses.enrollCourse` for already in-progress course rejected with `BAD_REQUEST`.
- `T5.3.4`: `courses.enrollCourse` for non-existent course ID (999999) rejected with `NOT_FOUND`.
- `T5.3.5`: `courses.enrollCourse` sequential double-enrollment idempotency.

#### Category 4: RBAC & Multi-Tenant Scoping Boundaries
- `T5.4.1`: Student accessing advisor route (`advisor.getAssignedStudents`) rejected with `FORBIDDEN`.
- `T5.4.2`: Student accessing admin route (`admin.dashboard`) rejected with `FORBIDDEN`.
- `T5.4.3`: Advisor accessing admin route (`admin.assignAdvisor`) rejected with `FORBIDDEN`.
- `T5.4.4`: Advisor 1 cannot create academic alert for Advisor 2's student (Lina Omar).
- `T5.4.5`: Advisor 1 cannot add note for Advisor 2's student (Lina Omar).
- `T5.4.6`: Advisor 1 cannot schedule appointment for Advisor 2's student (Lina Omar).
- `T5.4.7`: Advisor resolving non-existent alert ID rejected with `NOT_FOUND`.
- `T5.4.8`: Admin self-deletion rejected with `BAD_REQUEST`.
- `T5.4.9`: Admin assigning non-existent advisor ID rejected with `NOT_FOUND`.

#### Category 5: Authentication Token Security & Concurrency Burst
- `T5.5.1`: Session cookie with tampered JWT signature rejected with `UNAUTHORIZED`.
- `T5.5.2`: Session cookie with invalid payload type rejected with `UNAUTHORIZED`.
- `T5.5.3`: Session cookie with non-existent userId (999999) rejected with `UNAUTHORIZED`.
- `T5.5.4`: SQL injection payload in login email rejected cleanly with `UNAUTHORIZED`.
- `T5.5.5`: High concurrency burst (30 simultaneous requests across 5 endpoints).

---

## Database State Invariance (Zero State Drift)

Before and after executing the entire test suite, a database snapshot is captured across all 16 monitored tables:

| Monitored Table | Row Count Before | Row Count After | Delta | Drift Status |
|---|:---:|:---:|:---:|:---:|
| `users` | 26 | 26 | 0 | **ZERO DRIFT** |
| `departments` | 1 | 1 | 0 | **ZERO DRIFT** |
| `courses` | 32 | 32 | 0 | **ZERO DRIFT** |
| `coursePrerequisites` | 10 | 10 | 0 | **ZERO DRIFT** |
| `studyPlans` | 27 | 27 | 0 | **ZERO DRIFT** |
| `studentCourses` | 408 | 408 | 0 | **ZERO DRIFT** |
| `aiConversations` | 59 | 59 | 0 | **ZERO DRIFT** |
| `chatMessages` | 58 | 58 | 0 | **ZERO DRIFT** |
| `faqs` | 2 | 2 | 0 | **ZERO DRIFT** |
| `documents` | 0 | 0 | 0 | **ZERO DRIFT** |
| `buildings` | 1 | 1 | 0 | **ZERO DRIFT** |
| `rooms` | 56 | 56 | 0 | **ZERO DRIFT** |
| `announcements` | 1 | 1 | 0 | **ZERO DRIFT** |
| `academicAlerts` | 0 | 0 | 0 | **ZERO DRIFT** |
| `advisorNotes` | 0 | 0 | 0 | **ZERO DRIFT** |
| `appointments` | 0 | 0 | 0 | **ZERO DRIFT** |

---

## Conclusion
The Milestone 5 automated test suite is complete, fully functional, opaque-box, and compliant with all project requirements. All 121 test cases pass deterministically on back-to-back runs with 0 database state drift and exit code 0.
