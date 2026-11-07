## 2026-11-07T17:43:53Z

You are Worker M1 (Backend Network Builder).
Your working directory is: s:\murshid (1)\.agents\teamwork\teamwork_worker_m1_1
Read ORIGINAL_REQUEST.md at s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read PROJECT.md at s:\murshid (1)\PROJECT.md and the explorer handoffs:
- s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_1\handoff.md
- s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_2\handoff.md
- s:\murshid (1)\.agents\teamwork\teamwork_spec_miner_m1_1\handoff.md

Write ownership:
You exclusively own:
- server/_core/cors.ts
- server/_core/index.ts
- server/_core/sdk.ts
- server/routers/auth.ts
- server/_core/cors.test.ts
- server/_core/sdk.test.ts
- server/routers/auth.test.ts

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective for Milestone 1:
Implement the complete backend CORS, preflight OPTIONS, CSP update, and Dual-Auth Bearer token support per the specifications:
1. Create `server/_core/cors.ts` with origin matching (`capacitor://localhost`, `ionic://localhost`, `http://localhost`, `http://172.20.10.*`, private LAN subnets), origin reflection with `credentials: true`, and immediate HTTP 204 termination for preflight OPTIONS requests.
2. Mount `corsMiddleware` in `server/_core/index.ts` right after `app.set("trust proxy", 1);` before body parsers and rate limiters.
3. Update CSP in `server/_core/index.ts` line 38 (`connect-src 'self' https: http: capacitor: ionic: ws: wss:;`) and line 36 (`img-src 'self' data: https: http: blob: capacitor: ionic:;`).
4. Update `server/_core/sdk.ts` to add `extractBearerToken(req)`, prioritize Bearer over Cookie, and authenticate requests using either token source. Export `getUserFromRequest = authenticateRequest`.
5. Update `server/routers/auth.ts`: return `token` in `auth.login` mutation response `{ success: true, token, user }` (and in `verifyEmail`), and update `auth.me` fallback to check Bearer tokens before cookies.
6. Create unit tests in `server/_core/cors.test.ts`, update `server/_core/sdk.test.ts`, and run all tests with `npx vitest run`. Verify TypeScript with `npm run check`.

Output:
Write changes to the codebase.
Run tests and build checks.
Write your full implementation and test results to `s:\murshid (1)\.agents\teamwork\teamwork_worker_m1_1\report.md` and `handoff.md`.
Use `send_message` to report back to your parent orchestrator.
