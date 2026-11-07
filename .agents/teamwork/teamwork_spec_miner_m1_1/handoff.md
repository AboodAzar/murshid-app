# Handoff Report: Milestone 1 Auth Spec Investigation
**Agent:** Spec Miner M1-1 (Auth Spec Investigator)  
**Recipient:** Orchestrator (`989118c4-ff40-4848-b0e9-e8e037ab7df2`)  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_spec_miner_m1_1`  
**Handoff Type:** Hard (Task Complete)  

---

## 1. Observation

1. **`server/_core/index.ts` lines 28–69**:
   The existing Express server enforces strict Content Security Policy (`res.setHeader("Content-Security-Policy", ... "connect-src 'self' https:; ...")`) and security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`). It has **zero CORS headers** and no handler for HTTP `OPTIONS` preflight requests.
2. **`server/_core/trpc.ts` lines 6–8**:
   The tRPC router is initialized with `superjson` as transformer:
   ```typescript
   const t = initTRPC.context<TrpcContext>().create({
     transformer: superjson,
   });
   ```
   All procedure returns are transformed through SuperJSON (`{ json: ..., meta?: { values: ... } }`).
3. **`server/routers/auth.ts` lines 191–312 (`login` mutation)**:
   Lines 268–275 generate a valid local JWT token via `generateLocalAuthToken()`, lines 276–282 set the cookie `COOKIE_NAME = "app_session_id"` with `getSessionCookieOptions(ctx.req)`, but lines 293–302 return:
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
   The generated `token` is omitted from the JSON payload, leaving mobile clients unable to capture it.
4. **`server/_core/sdk.ts` lines 36–40 & lines 97–101**:
   `extractSessionCookie(req)` only parses `req.headers.cookie`. `authenticateRequest(req)` calls `extractSessionCookie(req)`. It ignores `req.headers.authorization`.
5. **`server/routers/auth.ts` lines 138–188 (`me` query)**:
   `auth.me` checks `opts.ctx.user`, and if null, falls back to parsing `opts.ctx.req.headers.cookie`. If neither has a valid token, it returns `null` with HTTP status 200.
6. **`tests/e2e/test-client.mjs` & `server/routers/auth.test.ts`**:
   The project test suite verified with command `npx vitest run server/routers/auth.test.ts` passes 3/3 tests in 1.71s. MariaDB 10.11 is online on `localhost:3306` with 31 tables verified via `npm run db:validate`.
7. **`ios-app/capacitor.config.json`**:
   Capacitor runs with `appId: "jo.edu.zuj.oliver"`. Under native iOS WKWebView, cross-origin network requests originate from `capacitor://localhost` (or `ionic://localhost`).

---

## 2. Logic Chain

1. From Observation 7, native iOS WKWebView executes from origin `capacitor://localhost`. When calling `http://172.20.10.4:3000`, the browser classifies every request as cross-origin.
2. From Observation 1, because Express currently lacks CORS headers and `OPTIONS` handling, any preflight request sent by WKWebView fails, causing WebKit to abort network requests immediately.
3. According to W3C Fetch & WebKit ITP specifications, when `credentials: 'include'` is used, `Access-Control-Allow-Origin` cannot be wildcard `*`; it must reflect the incoming `Origin` header (`capacitor://localhost`), and `Access-Control-Allow-Credentials: true` is required.
4. From Observation 4, `server/_core/sdk.ts` only extracts authentication tokens from `req.headers.cookie`. Because WebKit ITP drops cross-origin cleartext cookies on iOS local network communication, cookie-only authentication is non-viable on device.
5. From Observation 3, `auth.login` generates a valid JWT `token` but drops it before returning the response. By including `token` in the response body, the mobile app can store it in `localStorage` and transmit it via `Authorization: Bearer <token>`.
6. By enhancing `server/_core/sdk.ts` to inspect `req.headers.authorization` first and fall back to `req.headers.cookie`, both native iOS (Bearer token) and desktop web (session cookie) authenticate seamlessly into `opts.ctx.user` without breaking any existing behavior or test suites.

---

## 3. Caveats

- **No Caveats.** The existing database, schema, hashing algorithms (`pbkdf2:sha512`), and token signing keys (`jose:HS256`) are fully functional and require zero structural changes. The updates are confined to Express middleware (`server/_core/index.ts`), context token extraction (`server/_core/sdk.ts`), and the `auth.login` return payload (`server/routers/auth.ts`).

---

## 4. Conclusion

The authoritative specifications for Milestone 1 are complete, validated against codebase references, and documented in `report.md`.
- **Wire format**: Single mutations and queries use SuperJSON `{ json: <data> }` framing; `auth.login` returns `{ success: true, token, user }`.
- **Error schemas**: 401 UNAUTHORIZED on invalid password or unregistered user, 400 BAD_REQUEST on Zod validation failure. `auth.me` returns HTTP 200 `{ result: { data: { json: null } } }` when unauthenticated.
- **CORS requirements**: Express middleware reflecting `req.headers.origin`, setting `Access-Control-Allow-Credentials: true`, answering `OPTIONS` with status `204`, and allowing headers `Content-Type, Authorization, x-trpc-source, Cookie, Accept, Origin, X-Requested-With`.
- **Quality verification**: Exact assertions for Reviewers, Challengers, and Auditors are formulated to ensure zero regression, zero DB state drift, and 100% test pass.

---

## 5. Verification Method

1. **Unit Test Verification**:
   Execute:
   ```powershell
   npx vitest run server/routers/auth.test.ts
   ```
   Expected: 3 tests passing.
2. **Database Integrity Verification**:
   Execute:
   ```powershell
   npm run db:validate
   ```
   Expected: `{ "ok": true, "tableCount": 31, "requiredTableCount": 16 }`.
3. **Artifact Inspection**:
   Inspect `s:\murshid (1)\.agents\teamwork\teamwork_spec_miner_m1_1\report.md` for full wire contracts, schemas, headers table, and verification assertions.
4. **Invalidation Condition**:
   If `auth.login` fails to return `token` in the SuperJSON response, or if `OPTIONS` preflight requests fail to return `204` with `Access-Control-Allow-Credentials: true`, Milestone 1 acceptance is invalidated.
