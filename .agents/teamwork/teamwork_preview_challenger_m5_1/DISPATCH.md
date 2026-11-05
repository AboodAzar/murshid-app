# Task Assignment: Milestone 5 Tier 5 Adversarial Coverage Hardening (Initiation)

## Assigned Agent: `challenger_m5_1` (teamwork_preview_challenger)
## Timestamp: 2026-11-01T20:42:00Z

### Scope & Context
All 87 tests in Tiers 1-4 pass 100%. We now initiate Phase 2 of the Final Milestone: Adversarial Coverage Hardening (Tier 5).
Challenger initiates the cycle:
1. Conduct a white-box source code audit across `server/routers/` (`aiChat.ts`, `student.ts`, `advisor.ts`, `admin.ts`, `courses.ts`, `navigation.ts`, etc.) and `server/_core/` to identify untested code paths, error re-wrapping bugs, edge conditions, and missing guards.
   * Specific gap already noted by Challenger M4: in `server/routers/aiChat.ts` (lines 106, 375, 422), catch blocks catch `error` without `if (error instanceof TRPCError) throw error;`, converting `NOT_FOUND` or `FORBIDDEN` into generic `INTERNAL_SERVER_ERROR` (500).
2. Author adversarial test cases in `tests/e2e/tier5-adversarial.mjs` exercising:
   - The `aiChat.ts` error status codes (`NOT_FOUND` vs `INTERNAL_SERVER_ERROR`).
   - Extreme boundary cases (e.g. invalid pagination offsets, negative limits, concurrent mutations, edge inputs).
   - Prerequisite edge paths and course enrollment concurrency.
   - RBAC privilege boundary probing.
3. Produce a clear gap report and adversarial test file so the Worker can apply any needed source fixes and integrate Tier 5 into the test suite.

### Mandatory Files to Read First
1. `s:\murshid (1)\ORIGINAL_REQUEST.md` (authoritative user requirements)
2. `s:\murshid (1)\PROJECT.md`
3. `s:\murshid (1)\TEST_INFRA.md`
4. `s:\murshid (1)\TEST_READY.md`
5. `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m4_1\handoff.md`

### Deliverables
- `tests/e2e/tier5-adversarial.mjs`: High-severity adversarial test suite.
- Handoff report at `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m5_1\handoff.md` detailing all identified gaps, test execution results, and recommended source fixes for the Worker.


## 2026-11-01T20:42:19Z
You are challenger_m5_1. Your working directory is `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m5_1\`.

MANDATORY FIRST STEP: Read the following files before taking any action:
1. `s:\murshid (1)\ORIGINAL_REQUEST.md` (authoritative user requirements)
2. `s:\murshid (1)\PROJECT.md`
3. `s:\murshid (1)\TEST_INFRA.md`
4. `s:\murshid (1)\TEST_READY.md`
5. `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m4_1\handoff.md`
6. `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m5_1\DISPATCH.md`

Tasks:
- White-box audit of backend routers (e.g. `server/routers/aiChat.ts`, `server/routers/courses.ts`, `server/routers/advisor.ts`, `server/routers/student.ts`, etc.) to discover untested error paths, specifically the `TRPCError` re-wrapping bug in `aiChat.ts` and any other unhandled edge conditions.
- Write a dedicated adversarial test file: `tests/e2e/tier5-adversarial.mjs`.
- Execute `node tests/e2e/tier5-adversarial.mjs` against `http://localhost:3000/api/trpc`.
- Document discovered gaps and required source code fixes in your handoff report at `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m5_1\handoff.md`.
- Send a completion message with summary of gaps and test cases.
