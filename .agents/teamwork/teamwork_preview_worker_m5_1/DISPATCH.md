# Task Assignment: Milestone 5 Tier 5 Bug Remediation & Integration Worker

## Assigned Agent: `worker_m5_1` (teamwork_preview_worker)
## Timestamp: 2026-11-01T20:54:00Z

### Scope & Context
Challenger `challenger_m5_1` authored `tests/e2e/tier5-adversarial.mjs` (34 tests) and identified 7 concrete vulnerabilities/bugs in backend routers:
1. `server/routers/aiChat.ts`:
   - `getMessages` (line 106), `rateMessage` (line 375), `deleteConversation` (line 422): missing `if (error instanceof TRPCError) throw error;`, causing thrown `NOT_FOUND` to be converted to `INTERNAL_SERVER_ERROR` (500).
   - `sendMessage` (line 291): missing `if (error instanceof TRPCError) throw error;`, causing `NOT_FOUND` for non-existent conversation to be swallowed and return `{ success: false }` with HTTP 200 instead of rejecting with `NOT_FOUND`.
   - `rateMessage` (line 318): IDOR vulnerability — students can rate messages in other students' conversations because the query does not check that the message belongs to a conversation where `studentId === ctx.user.id`.
2. `server/routers/documents.ts`:
   - `delete` (line 209) and `retryDocumentIndexing` (line 532): missing `if (error instanceof TRPCError) throw error;`, converting `FORBIDDEN` / `NOT_FOUND` into `INTERNAL_SERVER_ERROR` (500).
3. `server/routers/preferences.ts`:
   - `getNotificationPreferences` (line 39): missing `if (error instanceof TRPCError) throw error;`, converting `NOT_FOUND` into `INTERNAL_SERVER_ERROR` (500).
4. `tests/e2e/tier2-boundaries.mjs`:
   - Update tests `T2.7.2`, `T2.7.3`, `T2.7.6` to assert exact error code `"NOT_FOUND"`.
5. Integration into Master Test Runner:
   - In `tests/e2e/run-all-e2e.mjs`, import and run `tier5-adversarial.mjs` as Tier 5: Adversarial Coverage Hardening alongside Tiers 1-4, so `npm run test:e2e` executes all 5 tiers (121 total tests).
   - Update `TEST_READY.md` to document Tier 5 and the updated grand total (121 tests).

### Mandatory Files to Read First
1. `s:\murshid (1)\ORIGINAL_REQUEST.md` (authoritative user requirements)
2. `s:\murshid (1)\PROJECT.md`
3. `s:\murshid (1)\TEST_INFRA.md`
4. `s:\murshid (1)\TEST_READY.md`
5. `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m5_1\handoff.md` (Contains exact code diffs and lines to fix!)

### Execution Tasks
1. Apply fixes in `server/routers/aiChat.ts`, `server/routers/documents.ts`, `server/routers/preferences.ts`, and `tests/e2e/tier2-boundaries.mjs`.
2. Update `tests/e2e/run-all-e2e.mjs` to execute Tier 5.
3. Update `TEST_READY.md` with Tier 5 details.
4. Verify build: `npm run check` (0 errors), `npm run build` (clean compilation).
5. Restart the server running on port 3000 with the new build.
6. Verify Tier 5: `node tests/e2e/tier5-adversarial.mjs` (must pass 34/34 tests, exit code 0).
7. Verify all tiers: `npm run test:e2e` (must pass all 121 tests across Tiers 1-5 with 0 database state drift, exit code 0).
8. Run `npm test` (33/33 Vitest tests pass).
9. Write handoff report to `s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m5_1\handoff.md`.

### Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T20:52:36Z
[Message] timestamp=2026-11-01T20:52:36Z sender=bd241cda-c8ae-4f16-b4be-daab58196b4d priority=MESSAGE_PRIORITY_HIGH
Tasks:
1. Fix `server/routers/aiChat.ts`:
   - Add `if (error instanceof TRPCError) throw error;` to catch blocks of `getMessages`, `sendMessage`, `rateMessage`, and `deleteConversation`.
   - In `rateMessage`, add ownership check using `innerJoin` with `aiConversations` on `eq(aiConversations.studentId, ctx.user.id)` to close the IDOR flaw.
2. Fix `server/routers/documents.ts`:
   - Add `if (error instanceof TRPCError) throw error;` to catch blocks of `delete` and `retryDocumentIndexing`.
3. Fix `server/routers/preferences.ts`:
   - Add `if (error instanceof TRPCError) throw error;` to catch block of `getNotificationPreferences`.
4. Fix `tests/e2e/tier2-boundaries.mjs`:
   - Tighten `T2.7.2`, `T2.7.3`, `T2.7.6` to assert exact error code `"NOT_FOUND"`.
5. Integrate Tier 5 into Master Runner:
   - In `tests/e2e/run-all-e2e.mjs`, import and run `tier5-adversarial.mjs` as Tier 5: Adversarial Coverage Hardening alongside Tiers 1-4.
   - Update `TEST_READY.md` with Tier 5 summary (34 tests) and grand total (121 tests).
6. Build & Restart Server:
   - `npm run check` (0 errors), `npm run build` (clean compilation).
   - Restart the server process on port 3000 running `dist/index.js`.
7. Verify:
   - `node tests/e2e/tier5-adversarial.mjs` (must pass 34/34, exit code 0).
   - `npm run test:e2e` (must pass 121/121 across all 5 tiers with 0 DB drift, exit code 0).
   - `npm test` (33/33 Vitest tests pass).
8. Write detailed handoff report to `s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m5_1\handoff.md`.
