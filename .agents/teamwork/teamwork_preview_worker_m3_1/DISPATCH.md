# DISPATCH: Milestone 3 Worker (Existing Test Scripts Modernization)

You are Worker 1 for Milestone 3: Existing Test Scripts Modernization.
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m3_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Input Findings to Read First:
1. `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_survey_3\handoff.md` (Survey of all 51 scripts in `scripts/`, failure root causes, and verified seeded credentials).
2. `s:\murshid (1)\PROJECT.md`
3. `s:\murshid (1)\TEST_INFRA.md`

## Verified Active Seeded Accounts in MariaDB `localhost:3306/murshid`:
- **Admin**: `abood@gmail.com` / `Abood#2004` (id: 1, role: 'admin')
- **Advisor**: `a.khalil@zuj.edu.jo` / `password123` (id: 210024, role: 'advisor')
  (also `s.mahmoud@zuj.edu.jo`, `o.hassan@zuj.edu.jo`)
- **Student**: `khaled.haddad@zuj.edu.jo` / `password123` (id: 210027, role: 'student')
  (also `lina.omar@zuj.edu.jo`, `basma.hassan@zuj.edu.jo`)

## Your Exclusive File Ownership:
- Files under `scripts/` (e.g. `scripts/smoke-test-all-apis.mjs`, `scripts/final-smoke-test-v2.mjs`, `scripts/final-smoke-test.mjs`, `scripts/smoke-test-full.mjs`, `scripts/test-advisor-workflow.mjs`, `scripts/test-assignment-v2.mjs`, `scripts/e2e-advisor-assignment.mjs`, `scripts/smoke-test-student.mjs`, etc.)
- A consolidated runner script `scripts/run-all-smoke-tests.mjs`

## Concrete Tasks to Execute:
1. Modernize `scripts/smoke-test-all-apis.mjs`:
   - Implement cookie jar forwarding (`headers: { cookie: cookieJar }`) in fetch / `httpBatchLink`.
   - Update `client.advisor.dashboard` to `client.advisor.getInsights.query()` and `client.advisor.getAssignedStudents.query()`.
   - Use verified seeded credentials (`abood@gmail.com`, `a.khalil@zuj.edu.jo`, `khaled.haddad@zuj.edu.jo`).
   - Ensure clean exit code 0.
2. Modernize `scripts/final-smoke-test-v2.mjs` and `scripts/final-smoke-test.mjs`:
   - Replace obsolete hardcoded user IDs (`180002`, `test1781037416495@std-zuj.edu.jo`, `nesreen@gmail.com`) with dynamic lookup or seeded users (`khaled.haddad@zuj.edu.jo`, `a.khalil@zuj.edu.jo`, `abood@gmail.com`).
   - Validate cookie propagation and test student, advisor, and admin procedures.
   - Ensure clean exit code 0.
3. Modernize `scripts/smoke-test-full.mjs`:
   - Replace obsolete user emails (`noorhussein@gmail.com`, `nesreen@gmail.com`) with valid seeded credentials.
   - Ensure clean exit code 0.
4. Modernize `scripts/test-advisor-workflow.mjs` and `scripts/e2e-advisor-assignment.mjs`:
   - Fix assumptions where `unassignedStudents.length === 0`: dynamically create an unassigned student or unassign one student temporarily, perform the advisor assignment test, and verify clean exit code 0.
5. Create a master script `scripts/run-all-smoke-tests.mjs`:
   - Executes the core smoke test scripts sequentially.
   - Prints clear assertions and verifies all scripts pass with exit code 0.
6. Verification:
   - Run `node scripts/validate-db.mjs` — must report `ok: true`.
   - Run `node scripts/smoke-test-all-apis.mjs` — must exit 0.
   - Run `node scripts/final-smoke-test-v2.mjs` — must exit 0.
   - Run `node scripts/smoke-test-full.mjs` — must exit 0.
   - Run `node scripts/run-all-smoke-tests.mjs` — must exit 0.
   - Run `npm run check` (`tsc --noEmit`) — must pass with 0 errors.

## Deliverable:
Write your structured completion report with verified terminal outputs into:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m3_1\handoff.md`
Report when done via `send_message`.

## 2026-11-01T19:41:16Z
[Message] timestamp=2026-11-01T19:41:16Z sender=bd241cda-c8ae-4f16-b4be-daab58196b4d priority=MESSAGE_PRIORITY_HIGH content=You are Worker 1 for Milestone 3 (Existing Test Scripts Modernization).
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m3_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md
Your dispatch instructions: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m3_1\DISPATCH.md

Read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive files to edit:
- Scripts under `scripts/` (e.g. `smoke-test-all-apis.mjs`, `final-smoke-test-v2.mjs`, `final-smoke-test.mjs`, `smoke-test-full.mjs`, `test-advisor-workflow.mjs`, `e2e-advisor-assignment.mjs`, etc.)
- Master runner `scripts/run-all-smoke-tests.mjs`

Execute the modernization tasks:
1. Fix stale test credentials (replace obsolete test1781037416495, noorhussein, nesreen with seeded abood@gmail.com, a.khalil@zuj.edu.jo, khaled.haddad@zuj.edu.jo).
2. Fix cookie persistence in httpBatchLink so protected tRPC procedures authenticate properly.
3. Fix obsolete procedure calls (e.g. advisor.dashboard).
4. Fix unassigned student assumption in advisor assignment tests.
5. Provide master runner scripts/run-all-smoke-tests.mjs.
6. Verify all test scripts run cleanly and exit 0.

Write your report to:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m3_1\handoff.md`
Report when done via send_message.

