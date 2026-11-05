# Task Assignment: Milestone 3 Iteration 2 (Rate Limiter Exemption & Script Resiliency)

## Assigned Agent: `worker_m3_2` (teamwork_preview_worker)
## Timestamp: 2026-11-01T20:05:00Z

### Context & Problem Statement
During Milestone 3 verification, Reviewer M3 approved and Forensic Auditor M3 reported CLEAN. However, Challenger M3 (`bdf24c01-2629-477f-8a01-35cb48859e36`) reported `REQUEST_CHANGES` after running back-to-back stress tests:
1. `generalRateLimiter` in `server/_core/rateLimiter.ts` limits all `/api/trpc` routes to 1000 requests per 15 min (and 100 in production). It does not exempt loopback/test traffic (`127.0.0.1`, `::1`, `::ffff:127.0.0.1` or `NODE_ENV === "test"`). Running `scripts/run-all-smoke-tests.mjs` back-to-back quickly exhausts this quota, causing HTTP 429 (`TOO_MANY_REQUESTS`).
2. Test scripts (`scripts/e2e-advisor-assignment.mjs`, `scripts/smoke-test-all-apis.mjs`, `scripts/final-smoke-test-v2.mjs`, `scripts/test-roles.mjs`) execute top-level queries outside try/catch blocks. When HTTP 429 occurs, an unhandled promise rejection causes Node on Windows to crash with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` (crash exit code 3221226505).

### Key Files to Inspect
- `s:\murshid (1)\ORIGINAL_REQUEST.md` (MUST read first)
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m3_1\handoff.md` (Challenger report with exact error logs and required mitigations)
- `server/_core/rateLimiter.ts`
- `server/_core/index.ts`
- `scripts/*.mjs`

### Mandatory Requirements
1. In `server/_core/rateLimiter.ts`:
   - In `createRateLimiter`, check the client IP (`req.ip`, `req.socket.remoteAddress`, headers). If the request originates from localhost (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`) or if `process.env.NODE_ENV === "test"`, bypass the rate limiter check and immediately call `next()`.
   - Also ensure `generalRateLimiter.maxRequests` is generous (e.g., 10000 in dev/test) so external loopback tools never hit artificial bottlenecks.
2. In `scripts/e2e-advisor-assignment.mjs`, `scripts/smoke-test-all-apis.mjs`, `scripts/final-smoke-test-v2.mjs`, `scripts/test-roles.mjs`, and any other scripts that execute async setup queries at top level:
   - Wrap top-level execution in an async function and add a `.catch(err => { console.error(err); process.exit(1); })` handler to ensure graceful termination without unhandled promise rejections.
3. Build and Server Restart:
   - Run `npm run check` to ensure 0 TypeScript errors.
   - Run `npm run build` to compile the updated server into `dist/`.
   - If the server is running as a background node process, ensure the running server instance uses the updated code (restart the server on port 3000 if needed).
4. Verification:
   - Run `node scripts/run-all-smoke-tests.mjs` 3 times consecutively back-to-back.
   - Verify that all 3 runs pass 11/11 suites with exit code 0 and zero HTTP 429 errors.
   - Verify database state integrity using MariaDB query (ensure unassigned student count remains 2 and no state drift exists).
   - Run `npm test` (vitest) to ensure all unit tests continue to pass (33/33).

### Working Directory
Write your progress and handoff report to `s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m3_2\`.

### Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
