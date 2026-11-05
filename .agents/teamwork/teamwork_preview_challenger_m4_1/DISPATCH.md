# Task Assignment: Milestone 4 Adversarial Challenge

## Assigned Agent: `challenger_m4_1` (teamwork_preview_challenger)
## Timestamp: 2026-11-01T20:34:00Z

### Scope & Context
`test_writer_m4_1` has delivered Milestone 4: Comprehensive Automated E2E Testing Suite (`tests/e2e/`) with 87 tests across Tiers 1-4.

### Mandatory Files to Read First
1. `s:\murshid (1)\ORIGINAL_REQUEST.md` (authoritative user requirements)
2. `s:\murshid (1)\PROJECT.md`
3. `s:\murshid (1)\TEST_INFRA.md`
4. `s:\murshid (1)\TEST_READY.md`
5. `s:\murshid (1)\.agents\teamwork\teamwork_preview_test_writer_m4_1\handoff.md`

### Empirical Challenge Tasks
1. Execute `npm run test:e2e` (or `node tests/e2e/run-all-e2e.mjs`) 3 times consecutively back-to-back with zero delay.
   - Verify that all 3 runs pass 87/87 tests with exit code 0 and zero socket/throttling errors.
2. Verify Database State Drift:
   - Query MariaDB tables before Run 1 and after Run 3 to verify 0 database state drift.
3. Stress & Fault Injection:
   - Challenge negative test assertions (e.g. check that an invalid cookie indeed causes 401, check that an unmet prerequisite cannot enroll, check that student cannot call advisor or admin procedures).
   - Test that individual tier scripts (`node tests/e2e/tier1-features.mjs`, `tier2-boundaries.mjs`, etc.) run standalone cleanly.
4. Deliver an empirical verdict (`APPROVE` or `REQUEST_CHANGES`) with full execution logs.

### Working Directory
Write your handoff report to `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m4_1\handoff.md`.

## 2026-11-01T20:33:55Z
From: bd241cda-c8ae-4f16-b4be-daab58196b4d (parent)
You are challenger_m4_1. Your working directory is `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m4_1\`.

MANDATORY FIRST STEP: Read the following files before taking any action:
1. `s:\murshid (1)\ORIGINAL_REQUEST.md` (authoritative user requirements)
2. `s:\murshid (1)\PROJECT.md`
3. `s:\murshid (1)\TEST_INFRA.md`
4. `s:\murshid (1)\TEST_READY.md`
5. `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m4_1\DISPATCH.md`
6. `s:\murshid (1)\.agents\teamwork\teamwork_preview_test_writer_m4_1\handoff.md`

Tasks:
- Execute `npm run test:e2e` 3 times consecutively back-to-back with zero delay.
- Confirm all 3 runs pass 87/87 tests with exit code 0.
- Verify 0 database state drift before and after the 3 runs.
- Empirically test individual tiers and boundary rejections.
- Write your handoff report to `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m4_1\handoff.md` and send a message with your verdict (APPROVE or REQUEST_CHANGES).
