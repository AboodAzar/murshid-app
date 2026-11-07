# Handoff Report: Dual-Auth Bearer Token Implementation
**Task:** Milestone 1 — Backend Network & Dual-Auth Readiness  
**Investigator:** Explorer M1-2 (Bearer Auth Specialist)  
**Date:** 2026-11-07  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_2`  
**Handoff Type:** Hard (Task complete)

---

## 1. Observation

1. **`server/_core/sdk.ts` lines 36–40:**
   ```typescript
   // Extract session cookie from request
   function extractSessionCookie(req: Request): string | null {
     const cookies = req.headers.cookie || "";
     const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
     return cookieMatch ? cookieMatch[1] : null;
   }
   ```
   No checking of `req.headers.authorization` exists in `sdk.ts`.
2. **`server/_core/sdk.ts` lines 97–101:**
   ```typescript
   async function authenticateRequest(req: Request): Promise<User | null> {
     const token = extractSessionCookie(req);
     if (!token) {
       return null;
     }
   ```
   `authenticateRequest` immediately returns `null` if no cookie is present, completely ignoring Bearer tokens.
3. **`server/routers/auth.ts` lines 268–302:**
   ```typescript
   const token = await generateLocalAuthToken({
     userId: user.id,
     email: user.email,
     name: user.name || "",
     role: user.role,
   });
   ...
   ctx.res.cookie(COOKIE_NAME, token, {
     ...cookieOptions,
     maxAge: 604800000,
   });
   ...
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
   `token` is generated at line 268 and set as a cookie at line 278, but omitted from the JSON return payload at line 293.
4. **`server/routers/auth.ts` lines 147–156 (`auth.me`):**
   ```typescript
   // If no context user, try to verify JWT from cookie
   const cookies = opts.ctx.req.headers.cookie || "";
   const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
   if (!cookieMatch || !cookieMatch[1]) {
     return null;
   }
   ```
   Fallback in `auth.me` also only inspects cookies, failing if context user is absent and only a Bearer token is provided.
5. **`server/_core/context.ts` lines 11–28:**
   `createContext` runs `user = await sdk.authenticateRequest(opts.req)`. This populates `ctx.user` for all tRPC procedures mounted on `/api/trpc`.
6. **`server/_core/trpc.ts` lines 13–28:**
   `protectedProcedure` enforces `if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG })`.
7. **`npx vitest run server/_core/sdk.test.ts` & `server/routers/auth.test.ts`:**
   Both test suites currently pass (6/6 SDK tests passed in 6ms; 3/3 Auth tests passed in 4ms).

---

## 2. Logic Chain

1. **Premise 1 (From Observation 1 & 2):** In iOS Capacitor running in WKWebView under `capacitor://localhost`, cross-origin requests to `http://172.20.10.4:3000` have cookies dropped by Apple WebKit ITP. Because `sdk.ts` only extracts tokens from cookies, all mobile requests without cookies result in `ctx.user = null`.
2. **Premise 2 (From Observation 3):** Even if the mobile client could store a Bearer token in `localStorage`, `auth.login` does not include `token` in its JSON return payload, making it impossible for the mobile client to obtain the token upon login.
3. **Premise 3 (From Observation 5 & 6):** Every protected procedure in the backend (`student.*`, `advisor.*`, `courses.*`, etc.) gates access purely through `ctx.user`, which is set in `createContext` via `sdk.authenticateRequest(req)`.
4. **Deduction 1:** Adding `extractBearerToken(req)` and prioritizing `extractBearerToken(req) || extractSessionCookie(req)` in `sdk.authenticateRequest` directly populates `ctx.user` for both mobile requests (Bearer) and desktop requests (Cookies).
5. **Deduction 2:** Once `ctx.user` is populated in `createContext`, all 11 protected routers immediately authenticate Bearer requests without requiring individual router modifications.
6. **Deduction 3 (From Observation 4):** Updating the fallback in `auth.me` (lines 147–156) to also check `req.headers.authorization` ensures `auth.me` behaves identically to cookies even in isolated or mocked contexts.
7. **Deduction 4 (From Observation 3):** Adding `token` to the return object of `auth.login` (`return { success: true, token, user }`) provides the necessary credential to mobile clients while remaining 100% backward-compatible with desktop clients.

---

## 3. Caveats

1. **Rate Limiting:** Express rate limiting on `/api/trpc/auth.login` (`authRateLimiter` in `server/_core/rateLimiter.ts`) tracks client IP. In testing on local hotspot (`172.20.10.4`), multiple test attempts from the same IP must remain within rate limits (5 requests per 15 minutes by default).
2. **CORS Preflight:** Bearer authentication requires an `Authorization` header in cross-origin HTTP requests. Express must have CORS middleware handling `OPTIONS` requests with status 204 and `Access-Control-Allow-Headers: Content-Type, Authorization, x-trpc-source`. This is handled in Milestone 1's CORS scope (`server/_core/index.ts`).
3. **No Database Schema Alterations Needed:** Both local JWTs and framework sessions verify against existing `users` table records (`users.id` and `users.openId`). No migration or database change is required.

---

## 4. Conclusion

The implementation path for Worker M1 is clear, localized, and low-risk:
1. In `server/_core/sdk.ts`: Add `extractBearerToken(req)`, replace `extractSessionCookie` call in `authenticateRequest` with a multi-source token parser (Bearer + Cookie), and export `getUserFromRequest = authenticateRequest`.
2. In `server/routers/auth.ts`: Return `token` in `auth.login` (line 294) and `auth.verifyEmail` (line 500); update `auth.me` fallback (line 148) to check Bearer tokens before cookies.
3. In test files: Add unit tests in `server/_core/sdk.test.ts` and `server/routers/auth.test.ts` verifying dual-auth extraction.

---

## 5. Verification Method

To independently verify the implementation:

### A. Run Vitest Unit & Router Tests
```powershell
npx vitest run server/_core/sdk.test.ts
npx vitest run server/routers/auth.test.ts
```
Expected: All tests pass with 0 failures.

### B. Live End-to-End Verification via Node Script
Run a script that performs:
1. `POST /api/trpc/auth.login` with JSON payload `{ email: "khaled.haddad@zuj.edu.jo", password: "password123" }`. Verify response contains `result.data.json.token`.
2. `GET /api/trpc/auth.me` with header `Authorization: Bearer <token>` and NO cookie. Verify response returns Khaled Haddad (student).
3. `GET /api/trpc/student.myCourses` with header `Authorization: Bearer <token>`. Verify HTTP 200 and list of courses.
4. `GET /api/trpc/student.myCourses` with NO headers. Verify HTTP 401 UNAUTHORIZED.
5. Repeat steps 2-3 using `Cookie: app_session_id=<token>` with NO Authorization header. Verify identical successful responses.
