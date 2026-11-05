# E2E Test Infra: Murshid Academic Guidance Platform

## Test Philosophy
- Requirement-driven, opaque-box testing derived from `ORIGINAL_REQUEST.md` (R1 to R4).
- Independent of internal implementation details, exercising the application through authenticated HTTP / tRPC client interfaces.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Scenarios.

## Feature Inventory & Test Coverage
| # | Feature Area | Requirement | Tier 1 (Coverage) | Tier 2 (Boundaries) | Tier 3 (Cross-Feature) | Tier 4 (Workflows) |
|---|--------------|-------------|:-----------------:|:-------------------:|:----------------------:|:------------------:|
| F1 | Auth & Session Management | R1, R2 | ≥5 | ≥5 | ✓ | ✓ |
| F2 | Student Academic Progress & Dashboard | R2 | ≥5 | ≥5 | ✓ | ✓ |
| F3 | Course Enrollment & Prerequisite Check | R2 | ≥5 | ≥5 | ✓ | ✓ |
| F4 | Advisor Roster & Alerts Workflow | R2 | ≥5 | ≥5 | ✓ | ✓ |
| F5 | Admin User & Advisor Assignment | R2 | ≥5 | ≥5 | ✓ | ✓ |
| F6 | Campus Navigation & Room Finder | R2 | ≥5 | ≥5 | ✓ | ✓ |
| F7 | AI Chat Graceful Mock & Local Fallback | R3 | ≥5 | ≥5 | ✓ | ✓ |

## Test Architecture
- **Location**: `tests/e2e/` and modernized scripts in `scripts/`.
- **Test Runner**: Node.js automated test runner (`node tests/e2e/run-all-tests.mjs`).
- **Pass/Fail Semantics**: Every test suite outputs structured assertions (`[PASS] ...` / `[FAIL] ...`), summarizes totals, and exits with code `0` on 100% pass, or code `1` on any failure.
- **Fixtures & Authentication**:
  - Uses verified seeded credentials:
    - Admin: `abood@gmail.com` / `Abood#2004`
    - Advisor: `a.khalil@zuj.edu.jo` / `password123`
    - Student: `khaled.haddad@zuj.edu.jo` / `password123`
  - Automated cookie jar maintains `app_session_id` session across calls.

## Test Tiers Detail

### Tier 1 - Feature Coverage (≥5 per feature)
1. **Auth & Session**: Login as Admin, Login as Advisor, Login as Student, `auth.me` session validation, Logout cookie clearance.
2. **Student Dashboard**: Load overview metrics, fetch course list, fetch weekly timetable, fetch attendance logs, fetch assignments list.
3. **Course Prerequisite**: Query course catalog, inspect course prerequisites, list enrolled courses, calculate GPA progress, fetch recommended courses.
4. **Advisor Roster**: Fetch advisee list, fetch advisee profile, create academic alert, add advisor note, schedule appointment.
5. **Admin Console**: Fetch system dashboard stats, list users by role, update user active status, assign student to advisor, create announcement.
6. **Campus Navigation**: Fetch campus buildings, list rooms for IT faculty, search room by code, locate lecture room, plan route between buildings.
7. **AI Chat Mock**: Query AI status (`aiChat.getStatus` returns mock mode), create conversation, send FAQ query and get local answer, send academic query and get rules guidance, verify zero unhandled exceptions.

### Tier 2 - Boundary & Corner Cases (≥5 per feature)
1. **Auth**: Invalid password, unregistered email, non-university email domain rejection, malformed JWT cookie, expired session rejection.
2. **Role Boundaries**: Student attempting admin route (throws 403), Advisor attempting admin route (throws 403), Student attempting advisor route (throws 403), Unauthenticated access to protected route (throws 401), Cross-student profile access by unauthorized advisor (throws 403).
3. **Course Enrollment Boundaries**: Attempting enrollment in course without prerequisites (rejected), duplicate enrollment attempt (rejected), non-existent course ID.
4. **Input Validation**: Empty strings, XSS payload strings, excessively long strings, out-of-range semester values.
5. **AI Chat Offline Resilience**: Message when Runpod is offline (fast response under 1000ms), empty message rejection, conversation with 0 messages, rate feedback with invalid ID.

### Tier 3 - Cross-Feature Combinations (Pairwise Integration)
1. Admin creates announcement → Student receives announcement in dashboard.
2. Admin assigns unassigned student to Advisor → Advisor advisee roster immediately reflects newly assigned student.
3. Advisor creates academic alert for student → Student dashboard highlights alert in alerts card.
4. Advisor schedules appointment with student → Student timetable reflects appointment and campus nav highlights office room.
5. Student asks AI about prerequisite rule → AI returns local regulation rule → Student checks study plan.

### Tier 4 - Real-World Application Scenarios
1. **Scenario 1: New Semester Academic Onboarding**
   - Student logs in, reviews transcript and GPA, checks course recommendations, inspects prerequisite requirements, enrolls in eligible courses, and views new weekly timetable.
2. **Scenario 2: At-Risk Student Advisor Intervention**
   - Advisor logs in, inspects advisee roster sorted by risk level, flags student with low attendance (<80%), creates high-severity academic alert, adds private note, and books advisory appointment. Student logs in, views alert and scheduled appointment.
3. **Scenario 3: Offline Academic Advisory Assistance**
   - Student with disconnected external model server opens AI Chat, receives local mock mode indicator banner, asks about graduation requirements and minimum GPA regulations, receives accurate deterministic local answers matching university policy.
4. **Scenario 4: Campus Lecture Navigation**
   - Student checks today's lecture schedule, clicks "Navigate to Room", campus navigation loads faculty building, room floor, and walking directions.
5. **Scenario 5: Admin Faculty Governance**
   - Admin reviews system usage, audits registered users, updates advisor assignments, and broadcasts campus-wide announcement.

## Coverage Goals
- Tier 1: ≥35 tests (≥5 per feature across 7 features)
- Tier 2: ≥35 tests (boundary conditions)
- Tier 3: ≥5 cross-feature integration flows
- Tier 4: ≥5 end-to-end real-world scenarios
- Total Target: ≥80 test cases, 100% passing, exit code 0.
