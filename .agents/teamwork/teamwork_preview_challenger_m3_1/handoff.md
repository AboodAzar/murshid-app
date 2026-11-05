# Milestone 3 Challenge Report: Existing Test Scripts Modernization

**Challenger**: `teamwork_preview_challenger_m3_1`  
**Milestone**: Milestone 3 (Existing Test Scripts Modernization)  
**Date**: 2026-11-01  
**Working Directory**: `s:\murshid (1)\.agents\teamwork\teamwork_preview_challenger_m3_1\`  
**Verdict**: `REQUEST_CHANGES`

---

## Challenge Summary

**Overall risk assessment**: HIGH

While the worker successfully addressed the primary modernization defects (adding cookie jar propagation, updating procedures to valid endpoints, replacing hardcoded credentials with verified seed accounts, and implementing deterministic state restoration in assignment scripts), **adversarial back-to-back stress testing revealed a critical operational vulnerability**:

1. **Localhost Request Rate Limit Exhaustion (`generalRateLimiter`)**:
   `server/_core/rateLimiter.ts` applies `generalRateLimiter` to all `/api/trpc` routes with `maxRequests: process.env.NODE_ENV === "production" ? 100 : 1000` per 15-minute window (`windowMs: 15 * 60 * 1000`), without exempting loopback/test traffic (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`). Because a single execution of `run-all-smoke-tests.mjs` issues ~200 requests, running the test suite repeatedly or executing consecutive test suites quickly exhausts the 1000-request quota, blocking all subsequent API calls with HTTP 429 (`TOO_MANY_REQUESTS`). In production mode (`NODE_ENV=production`), the 100-request limit causes the suite to fail on its very first run.
2. **Abrupt Process Abortion on Windows (libuv `UV_HANDLE_CLOSING`)**:
   Several test scripts (`scripts/e2e-advisor-assignment.mjs`, `scripts/smoke-test-all-apis.mjs`, `scripts/final-smoke-test-v2.mjs`, `scripts/test-roles.mjs`) execute top-level setup queries (e.g., `client.admin.getAdvisorsWithStudents.query()`) outside try/catch blocks. When HTTP 429 occurs, an unhandled promise rejection is thrown, causing Node.js to abort abruptly on Windows:
   `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76`
   and terminate with abnormal exit code `3221226505` (`0xC0000005`).

---

## 1. Observation

### 1.1 Individual Modernized Script Execution (Pass)
When executed individually in isolation, each modernized script ran cleanly and exited with code 0:
1. `node scripts/smoke-test-all-apis.mjs`:
   - Output: `Passed: 25, Failed: 0`
   - Exit code: `0`
2. `node scripts/final-smoke-test-v2.mjs`:
   - Output: `=== FINAL SUMMARY: 25 passed, 0 failed ===`
   - Exit code: `0`
3. `node scripts/smoke-test-full.mjs`:
   - Output: `=== Summary: 25 passed, 0 failed ===`
   - Exit code: `0`
4. `node scripts/e2e-advisor-assignment.mjs`:
   - Output: `=== E2E Summary: 16 passed, 0 failed ===`
   - Exit code: `0`
5. `node scripts/run-all-smoke-tests.mjs` (Run 1):
   - Output: `Total Suites: 11, Passed: 11, Failed: 0, Total Time: 6.89s`
   - Exit code: `0`

### 1.2 Database State Drift Verification (Pass)
Direct MariaDB snapshot before and after running `e2e-advisor-assignment.mjs`:
- Command:
  ```powershell
  @"
  import mysql from 'mysql2/promise';
  import 'dotenv/config';
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.query('SELECT id, email, role, advisorId FROM users WHERE role = "student" ORDER BY id');
  console.log(JSON.stringify(rows));
  await conn.end();
  "@ | node --input-type=module
  ```
- Result Before: Student `240002` had `advisorId: null`. Assigned students `210027`-`210046` assigned to advisors `210024`-`210026`.
- Result After: Student `240002` had `advisorId: null`. All assignments were identical bit-for-bit to pre-test state (0 state drift).
- Stress Test on Zero Unassigned Students Branch:
  - Temporarily updated `users SET advisorId = 210024 WHERE id IN (240001, 240002)` to make `unassignedStudents.length === 0`.
  - Executed `node scripts/e2e-advisor-assignment.mjs`:
    ```
    Found 3 advisors, 0 unassigned students
    Temporarily unassigning student 210030 from advisor 210024 for test...
    Target Advisor: Dr. Ahmad Khalil (id=210024)
    Target Student: id=210030
    ...
    Restoring student 210030 to original advisor 210024...
    ✅ admin.restoreOriginalAdvisor
    ✅ admin.verify.restored
    === E2E Summary: 16 passed, 0 failed ===
    ```
  - Verified student `210030` was restored to advisor `210024`: `[{"id":210030,"advisorId":210024}]`.

### 1.3 Back-to-Back Stress Test Failure (Observed Defect)
When executing `node scripts/run-all-smoke-tests.mjs` consecutively back-to-back:
- Suites 1 through 8 passed.
- At Suite 9 (`scripts/e2e-advisor-assignment.mjs`), Suite 10 (`scripts/test-roles.mjs`), and Suite 11 (`scripts/test-cookie-flow.mjs`), execution failed with verbatim error:
  ```
  ▶ RUNNING: E2E Advisor Assignment & Roster (scripts/e2e-advisor-assignment.mjs)
  ========================================================
  === Admin Setup ===
  ❌ admin.login: Rate limit exceeded. Try again in 819 seconds.
  file:///S:/murshid%20(1)/node_modules/@trpc/client/dist/TRPCClientError-apv8gw59.mjs:40
                  if (isTRPCErrorResponse(cause)) return new TRPCClientError(cause.error.message, ...
                                                         ^

  TRPCClientError: Rate limit exceeded. Try again in 819 seconds.
      at TRPCClientError.from (file:///S:/murshid%20(1)/node_modules/@trpc/client/dist/TRPCClientError-apv8gw59.mjs:40:42)
      at file:///S:/murshid%20(1)/node_modules/@trpc/client/dist/httpBatchLink-LhidKAPw.mjs:228:38
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5) {
    cause: undefined,
    shape: {
      message: 'Rate limit exceeded. Try again in 819 seconds.',
      code: -32029,
      data: { code: 'TOO_MANY_REQUESTS', httpStatus: 429 }
    },
    data: { code: 'TOO_MANY_REQUESTS', httpStatus: 429 }
  }

  Node.js v24.14.0
  Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76

  ✖ FAILED: E2E Advisor Assignment & Roster (exit code 3221226505, 355ms)
  ...
  ========================================================
    SMOKE TEST EXECUTION SUMMARY
  ========================================================
    [✔ PASS]  Database Schema Validation               (190ms)
    [✔ PASS]  Full API Coverage Smoke Test             (809ms)
    [✔ PASS]  Multi-Role Workflow Smoke Test (v1)      (1203ms)
    [✔ PASS]  Multi-Role Workflow Smoke Test (v2)      (1098ms)
    [✔ PASS]  End-to-End Workflow Smoke Test           (788ms)
    [✔ PASS]  Student Portal Workflow Smoke Test       (515ms)
    [✔ PASS]  Cookie Persistence Smoke Test            (621ms)
    [✔ PASS]  Advisor Workflow & Boundary Check        (389ms)
    [✖ FAIL]  E2E Advisor Assignment & Roster          (355ms)
    [✖ FAIL]  Role Authentication Verification         (333ms)
    [✖ FAIL]  Raw Cookie Flow Verification             (270ms)
  --------------------------------------------------------
  Total Suites : 11
  Passed       : 8
  Failed       : 3
  Total Time   : 6.57s
  ========================================================
  ❌ ONE OR MORE SMOKE TEST SUITES FAILED.
  ```
  Process exit code: `1`.

### 1.4 Code Inspection of Rate Limiter (`server/_core/rateLimiter.ts`)
Lines 92-111:
```typescript
// Pre-configured rate limiters for different use cases
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5000, // Increased drastically for presentation/demo purposes
  keyGenerator: req => {
    return req.ip || "unknown";
  },
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: process.env.NODE_ENV === "production" ? 100 : 1000,
  keyGenerator: req => req.ip || "unknown",
});
```
`server/_core/index.ts` line 79:
```typescript
  // Apply general rate limiting to all API endpoints
  app.use("/api/trpc", generalRateLimiter);
```
- `authRateLimiter` was set to 5000, but `generalRateLimiter` was left at 1000 (and 100 in production).
- Because `app.use("/api/trpc", generalRateLimiter)` wraps all routes, including `/api/trpc/auth.login`, the 1000 limit takes precedence over the 5000 limit.
- There is no exemption for localhost (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`) or test mode (`process.env.NODE_ENV === "test"`).

---

## 2. Logic Chain

1. **Premise 1 (Observation 1.1)**: Individual modernized scripts run cleanly and pass when the rate limiter has capacity.
2. **Premise 2 (Observation 1.2)**: Dynamic assignment cleanup is mathematically sound and leaves zero database state drift.
3. **Premise 3 (Observation 1.3 & 1.4)**: In `server/_core/rateLimiter.ts`, `generalRateLimiter` restricts all requests under `/api/trpc` to 1000 requests per 15 minutes (or 100 in production).
4. **Step 4**: A single run of `scripts/run-all-smoke-tests.mjs` issues ~200 HTTP requests.
5. **Step 5**: When running `run-all-smoke-tests.mjs` multiple times back-to-back, or when automated E2E tests run sequentially after unit tests, total requests from `127.0.0.1` rapidly cross the 1000-request threshold within the 15-minute window.
6. **Step 6**: Once `entry.count > maxRequests`, `sendRateLimitResponse` rejects all requests with HTTP 429 (`TOO_MANY_REQUESTS`).
7. **Step 7**: Test scripts that perform setup queries outside a handled `try/catch` block throw unhandled promise rejections on HTTP 429, which in Node.js on Windows causes libuv to trigger `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` and abort with exit code `3221226505`.
8. **Conclusion**: The requirement "Confirm all scripts exit 0" in back-to-back runs is empirically violated under consecutive execution due to unexempted localhost rate-limiting and missing top-level rejection handling in test scripts.

---

## 3. Caveats

1. The underlying domain business logic (student study plan, advisor assignment, admin dashboard, auth token cookies) is completely functional and correct.
2. The database schema, seed data, and relationships are sound.
3. The issue is purely transport/infrastructure-layer rate limiting and test harness unhandled exception resiliency.

---

## 4. Challenges & Concrete Required Mitigations

### Challenge 1 (High): Localhost / Test Environment Throttling in `server/_core/rateLimiter.ts`
- **Assumption Challenged**: `generalRateLimiter` will not interfere with automated test execution.
- **Attack Scenario**: Running `scripts/run-all-smoke-tests.mjs` twice in succession or running E2E suites (Milestones 4-5) against the local server.
- **Blast Radius**: All test scripts crash with HTTP 429; CI/CD or automated verification fails.
- **Required Mitigation**:
  In `server/_core/rateLimiter.ts`, exempt localhost / loopback IPs or test environments:
  ```typescript
  export function createRateLimiter(options: RateLimitOptions) {
    ...
    return (req: Request, res: Response, next: NextFunction) => {
      // Exempt loopback and local test traffic from rate limiting
      const ip = req.ip || req.socket.remoteAddress || "";
      if (
        ip === "127.0.0.1" ||
        ip === "::1" ||
        ip.includes("127.0.0.1") ||
        process.env.NODE_ENV === "test"
      ) {
        return next();
      }
      ...
  ```
  Alternatively, increase `generalRateLimiter.maxRequests` to `10000` for development / non-production environments.

### Challenge 2 (Medium): Top-Level Unhandled Promise Rejections in Test Scripts
- **Assumption Challenged**: `client.admin.getAdvisorsWithStudents.query()` or `client.auth.login.mutate()` will never reject unexpectedly.
- **Attack Scenario**: Any network hiccup, HTTP 429, or connection timeout causes an unhandled promise rejection at top level, crashing Node.js with libuv `UV_HANDLE_CLOSING` assertion abort.
- **Blast Radius**: Process aborts with Windows crash code `3221226505` rather than clean error reporting.
- **Required Mitigation**:
  In `scripts/e2e-advisor-assignment.mjs`, `scripts/smoke-test-all-apis.mjs`, `scripts/test-assignment-v2.mjs`, and `scripts/test-roles.mjs`, wrap top-level execution in an `async function main() { ... }` with a `.catch(err => { console.error(err); process.exitCode = 1; })` block to ensure graceful exit without libuv socket assertions.

---

## 5. Conclusion

**Verdict**: `REQUEST_CHANGES`

Milestone 3 cannot be approved in its current state because back-to-back empirical execution of `run-all-smoke-tests.mjs` fails with exit code 1.

Once the worker implements the two targeted mitigations:
1. Exempt localhost / test requests from `generalRateLimiter` in `server/_core/rateLimiter.ts` (and rebuild `dist/index.js` via `npm run build`),
2. Wrap top-level script execution in test scripts to handle unexpected rejections cleanly,
Milestone 3 can be immediately re-verified and approved.

---

## 6. Verification Method for Re-Test

1. **Verify Rate Limiter Exemption**:
   Execute 3 consecutive runs of the master test runner back-to-back:
   ```powershell
   node scripts/run-all-smoke-tests.mjs
   node scripts/run-all-smoke-tests.mjs
   node scripts/run-all-smoke-tests.mjs
   ```
   *Expected*: All 3 runs complete with 11/11 passing suites and exit code `0`.
2. **Verify Database Integrity**:
   Verify student assignment state matches seeded values:
   ```powershell
   @"
   import mysql from 'mysql2/promise';
   import 'dotenv/config';
   const conn = await mysql.createConnection(process.env.DATABASE_URL);
   const [rows] = await conn.query('SELECT count(*) as unassignedCount FROM users WHERE role = "student" AND advisorId IS NULL');
   console.log('Unassigned count:', rows[0].unassignedCount);
   await conn.end();
   "@ | node --input-type=module
   ```
   *Expected*: `Unassigned count: 2`.
3. **Verify TypeScript & Vitest**:
   ```powershell
   npm run check
   npm run test
   ```
   *Expected*: 0 TypeScript errors and 33/33 tests passing.
