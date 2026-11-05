# Progress Tracker — Milestone 3 (Existing Test Scripts Modernization)

**Last visited**: 2026-11-01T19:52:00Z  
**Worker**: teamwork_preview_worker_m3_1  
**Status**: COMPLETED  

## Tasks Checklist
- [x] Read DISPATCH.md, ORIGINAL_REQUEST.md, PROJECT.md, and survey report.
- [x] Initialize BRIEFING.md and progress.md.
- [x] Inspect existing scripts under `scripts/` to be modernized.
- [x] Modernize `scripts/smoke-test-all-apis.mjs`:
  - Implement cookie jar forwarding (`headers: { cookie: cookieJar }`) in fetch / `httpBatchLink`.
  - Update `client.advisor.dashboard` to `client.advisor.getInsights.query()` and `client.advisor.getAssignedStudents.query()`.
  - Use verified seeded credentials (`abood@gmail.com`, `a.khalil@zuj.edu.jo`, `khaled.haddad@zuj.edu.jo`).
  - Verify clean exit code 0.
- [x] Modernize `scripts/final-smoke-test-v2.mjs` and `scripts/final-smoke-test.mjs`:
  - Replace obsolete hardcoded user IDs with seeded users and dynamic queries.
  - Fix cookie jar and procedure routes.
  - Verify clean exit code 0.
- [x] Modernize `scripts/smoke-test-full.mjs`:
  - Replace obsolete user emails with valid seeded credentials.
  - Verify clean exit code 0.
- [x] Modernize `scripts/test-advisor-workflow.mjs` and `scripts/e2e-advisor-assignment.mjs` (and `test-assignment-v2.mjs`, `test-advisor-assignment.mjs`):
  - Handle unassigned student dynamically with state restoration.
  - Verify clean exit code 0.
- [x] Modernize auxiliary smoke scripts (`smoke-test-student.mjs`, `smoke-test-cookies.mjs`, `test-roles.mjs`, `test-cookie-flow.mjs`).
- [x] Create master runner `scripts/run-all-smoke-tests.mjs`.
- [x] Verify all test scripts run cleanly and exit 0 (11/11 suites passed).
- [x] Run `npm run check` (`tsc --noEmit`) to verify 0 errors.
- [x] Run `npm run build` to verify production build succeeds cleanly.
- [x] Complete `handoff.md` and send completion message.
