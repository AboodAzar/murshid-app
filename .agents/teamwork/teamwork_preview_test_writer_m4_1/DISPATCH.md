# Task Assignment: Milestone 4 (Comprehensive Automated E2E Testing Suite)

## Assigned Agent: `test_writer_m4_1` (teamwork_preview_test_writer)
## Timestamp: 2026-11-01T20:21:00Z

### Scope & Context
Murshid has reached Milestone 4: building the comprehensive automated E2E test suite adhering to the 4-tier methodology defined in `TEST_INFRA.md`. All domain features (Student, Advisor, Admin, Campus Navigation, AI Fallback, Auth/Security) are implemented and running on `http://localhost:3000`.

### Mandatory Files to Read First
1. `s:\murshid (1)\ORIGINAL_REQUEST.md` (authoritative user requirements)
2. `s:\murshid (1)\PROJECT.md` (architecture, interface contracts, feature inventory)
3. `s:\murshid (1)\TEST_INFRA.md` (detailed 4-tier test case specifications and coverage thresholds)
4. Existing modernized scripts in `s:\murshid (1)\scripts/` for reference on auth cookie forwarding, tRPC client instantiation, and dynamic state restoration (e.g. `scripts/smoke-test-all-apis.mjs`, `scripts/e2e-advisor-assignment.mjs`, `scripts/test-cookie-flow.mjs`).

### Deliverables to Create
1. Directory: `tests/e2e/`
2. Modular Test Suites or Unified Harness:
   - `tests/e2e/tier1-features.mjs`: All Tier 1 Feature Coverage tests (≥35 tests: ≥5 per feature across F1 to F7).
   - `tests/e2e/tier2-boundaries.mjs`: All Tier 2 Boundary & Corner Case tests (≥35 tests: ≥5 per feature across F1 to F7).
   - `tests/e2e/tier3-cross-feature.mjs`: All Tier 3 Pairwise Cross-Feature Integration tests (≥5 tests).
   - `tests/e2e/tier4-scenarios.mjs`: All Tier 4 Real-World Application Workflows (≥5 scenarios).
   - `tests/e2e/run-all-e2e.mjs`: Master test runner executing Tiers 1-4, summarizing per-tier and grand total stats, with exit code 0 on 100% pass, or code 1 on failure.
   - Or a single comprehensive runner `tests/e2e/comprehensive-e2e-suite.mjs` and `tests/e2e/run-all-e2e.mjs` that runs all tiers.
3. Package Script:
   - Add `"test:e2e": "node tests/e2e/run-all-e2e.mjs"` to `package.json` `scripts`.
4. Publish `TEST_READY.md`:
   - Create `TEST_READY.md` at project root documenting how to run the test suite, coverage metrics by tier, and feature checklist per `TEST_INFRA.md`.

### Core Technical Requirements
- **Opaque-Box**: Tests must execute HTTP requests against the live server at `http://localhost:3000/api/trpc` using `@trpc/client` or `fetch`.
- **Session Management**: Cookie jar properly forwards `app_session_id` cookie for authenticated roles.
- **Seeded Accounts**:
  - Admin: `abood@gmail.com` / `Abood#2004`
  - Advisor: `a.khalil@zuj.edu.jo` / `password123`
  - Student: `khaled.haddad@zuj.edu.jo` / `password123`
- **State Invariance / Cleanup**: Any created alerts, notes, or test student assignments must be cleaned up in `finally` blocks so database state drift is 0.
- **Resilience**: Wrap execution in async function with `.catch()` to prevent unhandled rejections.
- **Verification**: Run `npm run test:e2e` (or `node tests/e2e/run-all-e2e.mjs`) twice to verify 100% pass rate and 0 database state drift.

### Working Directory
Write your progress and handoff report to `s:\murshid (1)\.agents\teamwork\teamwork_preview_test_writer_m4_1\`.

### Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
