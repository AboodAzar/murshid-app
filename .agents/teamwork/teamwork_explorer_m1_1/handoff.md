# Milestone 1 Handoff Report: Backend CORS, CSP & Dual-Auth Readiness

**Investigator:** Explorer M1-1 (Backend CORS Specialist)  
**Date:** 2026-11-07  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_1`  
**Handoff Target:** Worker M1 (or Orchestrator `989118c4-ff40-4848-b0e9-e8e037ab7df2`)  
**Status:** Hard Handoff (Investigation Complete)

---

## 1. Observation

Direct source observations and file audits:

1. **Missing CORS in `server/_core/index.ts`**:
   - `server/_core/index.ts` has zero CORS headers across all lines 1–124.
   - Line 26 configures proxy trust: `app.set("trust proxy", 1);`.
   - Lines 29–69 configure security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS) but omit any CORS headers.
   - Lines 72–73 register `express.json` and `express.urlencoded`.
   - Lines 76–81 register rate limiters (`authRateLimiter`, `generalRateLimiter`).
   - Lines 102–108 mount tRPC at `/api/trpc` via `createExpressMiddleware({ router: appRouter, createContext })`.

2. **Missing Preflight OPTIONS Short-Circuit**:
   - Neither `index.ts` nor `rateLimiter.ts` inspects or short-circuits HTTP `OPTIONS` requests.
   - When a preflight `OPTIONS` request is received, it hits `app.use("/api/trpc", generalRateLimiter)` and increments `entry.count++` (line 81 in `rateLimiter.ts`).
   - If it reaches tRPC middleware (line 102), tRPC returns a 404 or method unsupported response without CORS headers.

3. **CSP Restrictions in `server/_core/index.ts` (Line 38)**:
   - Line 38: `"connect-src 'self' https:; "`
   - Line 36: `"img-src 'self' data: https: blob:; "`
   - Omissions: `http:`, `capacitor:`, `ionic:`, `ws:`, `wss:`.

4. **Dual-Auth Protocol Gaps**:
   - `server/_core/sdk.ts` lines 36–40:
     ```typescript
     function extractSessionCookie(req: Request): string | null {
       const cookies = req.headers.cookie || "";
       const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
       return cookieMatch ? cookieMatch[1] : null;
     }
     ```
     Only checks cookies, ignoring `Authorization: Bearer <token>`.
   - `server/routers/auth.ts` lines 293–302:
     ```typescript
     return {
       success: true,
       user: {
         id: user.id,
         email: user.email,
         name: user.name,
         role: user.role,
         language: user.language,
       },
     };
     ```
     Generates `token` at line 268 but omits it from the return payload.

5. **Tool Invocations & Verified Baselines**:
   - Vitest: `npx vitest run server/_core/sdk.test.ts` passed (6 of 6 tests passed, 1.23s).
   - TypeScript Check: `npm run check` (`tsc --noEmit`) succeeded with exit code 0.

---

## 2. Logic Chain

1. **Step 1 (WebKit CORS Requirement)**:
   - Observation: iOS Capacitor WKWebView executes under `capacitor://localhost` and makes HTTP fetch calls to `http://172.20.10.4:3000`.
   - Inference: Browsers treat requests between different origins/schemes (`capacitor:` vs `http:`) as cross-origin.
   - Observation: When credentials (`credentials: 'include'`) are enabled, CORS specification strictly prohibits wildcard `Access-Control-Allow-Origin: *`.
   - Inference: The server must evaluate incoming origins against an allowed list (`capacitor://localhost`, `http://localhost`, `http://172.20.10.*`) and reflect the specific origin in `Access-Control-Allow-Origin` with `Access-Control-Allow-Credentials: true`.

2. **Step 2 (OPTIONS Preflight Flow)**:
   - Observation: Requests containing headers like `Content-Type: application/json` or `Authorization: Bearer ...` trigger preflight `OPTIONS` requests before the actual `POST`.
   - Observation: `rateLimiter.ts` increments IP counters on any received request.
   - Inference: If CORS and OPTIONS preflight handling are not placed at the very top of Express middleware (before body parsers and rate limiters), preflight requests will unnecessarily consume CPU, count towards rate limits, and fail when hitting tRPC.
   - Conclusion: Preflight `OPTIONS` requests must immediately respond with HTTP 204 No Content and appropriate CORS headers, terminating the request before downstream middleware runs.

3. **Step 3 (CSP Enforcement)**:
   - Observation: `phone.html` can be loaded via the server's preview routes (`/preview`, `/phone`).
   - Observation: CSP header line 38 restricts connections to `'self' https:`.
   - Inference: Any `fetch()` to `http://172.20.10.4:3000` or `capacitor://localhost` from the web preview or mobile browser will be blocked by the browser's CSP engine before leaving the network stack.
   - Conclusion: `connect-src` must be updated to include `http: capacitor: ionic: ws: wss:`.

4. **Step 4 (Dual-Auth Compatibility)**:
   - Observation: Apple's WebKit ITP automatically drops or blocks cookies on cross-origin cleartext HTTP requests from `capacitor://localhost` to local IP addresses.
   - Inference: Session-cookie-only authentication cannot reliably maintain sessions on native iOS.
   - Observation: `server/_core/sdk.ts` already implements local JWT verification (`verifyLocalJWT`) using `jose`.
   - Conclusion: Updating `extractToken` in `sdk.ts` to inspect `Authorization: Bearer <token>` and returning `token` from `auth.login` enables persistent mobile authentication via `localStorage` while remaining 100% backward-compatible with desktop cookie sessions.

---

## 3. Caveats

1. **Local Network IP Variations**:
   - The user specified `http://172.20.10.4:3000`. However, local hotspot DHCP can assign alternate IPs (e.g., `172.20.10.3`). The regex in `isAllowedOrigin` handles all `172.16.0.0/12`, `192.168.0.0/16`, and `10.0.0.0/8` addresses, and permits any origin in development mode (`process.env.NODE_ENV !== "production"`).
2. **Read-Only Scope**:
   - Explorer M1-1 performed read-only static analysis and test validation. No source files outside the agent's folder were modified.
   - Implementation must be performed by Worker M1.

---

## 4. Conclusion

The backend requires four targeted modifications to achieve full CORS, preflight, and Dual-Auth readiness:
1. Create `server/_core/cors.ts` (or inline middleware) to validate origins, set CORS headers, and terminate `OPTIONS` preflights with HTTP 204.
2. Mount `corsMiddleware` in `server/_core/index.ts` right after `app.set("trust proxy", 1);` (before body parsers, rate limiters, and tRPC).
3. Update CSP headers in `server/_core/index.ts` line 38 (`connect-src 'self' https: http: capacitor: ionic: ws: wss:;`) and line 36 (`img-src 'self' data: https: http: blob: capacitor: ionic:;`).
4. Update `server/_core/sdk.ts` to extract Bearer tokens from `Authorization` headers, and update `server/routers/auth.ts` to return `token` in `auth.login`.

All detailed drop-in code snippets are documented in `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_1\report.md`.

---

## 5. Verification Method

Worker M1 can independently verify the implementation with the following steps:

1. **Unit Test Verification**:
   - Create `server/_core/cors.test.ts` (as specified in `report.md`).
   - Run:
     ```bash
     npx vitest run server/_core/cors.test.ts
     ```
   - Expect: All tests pass.

2. **Preflight OPTIONS Live Check**:
   - Run:
     ```bash
     curl -i -X OPTIONS http://localhost:3000/api/trpc/auth.login \
       -H "Origin: capacitor://localhost" \
       -H "Access-Control-Request-Method: POST" \
       -H "Access-Control-Request-Headers: Content-Type, Authorization, x-trpc-source"
     ```
   - Expect:
     - `HTTP/1.1 204 No Content`
     - `access-control-allow-origin: capacitor://localhost`
     - `access-control-allow-credentials: true`
     - `access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD`
     - `access-control-allow-headers: Content-Type, Authorization, x-trpc-source, Accept, Origin, X-Requested-With, Cookie`

3. **CSP Live Check**:
   - Run:
     ```bash
     curl -i http://localhost:3000/preview
     ```
   - Expect: `content-security-policy` contains `connect-src 'self' https: http: capacitor: ionic: ws: wss:;`.

4. **Bearer Token Live Check**:
   - Send `POST /api/trpc/auth.login` with valid student credentials (`khaled.haddad@zuj.edu.jo` / `password123`).
   - Expect: Response JSON contains `token` string.
   - Send `GET /api/trpc/auth.me` with header `Authorization: Bearer <token>` and no cookies.
   - Expect: Successful user profile response.

5. **Invalidation Conditions**:
   - If preflight returns 404 or any status other than 204.
   - If `Access-Control-Allow-Origin: *` is returned with credentials.
   - If `npm run check` reports type errors.
