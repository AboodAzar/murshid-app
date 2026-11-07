# Milestone 1 Code Review & Adversarial Challenge Report

**Reviewer:** Reviewer M1-1 (Backend Code Reviewer)  
**Target:** Milestone 1 (Backend Network & Dual-Auth Readiness)  
**Files Inspected:**
- `server/_core/cors.ts`
- `server/_core/index.ts`
- `server/_core/sdk.ts`
- `server/routers/auth.ts`
- `server/_core/cors.test.ts`
- `server/_core/sdk.test.ts`
- `server/routers/auth.test.ts`
- `tests/e2e/ios/run-ios-e2e.mjs` (Tier 1 & Tier 2)

---

## Review Summary

**Verdict**: **REQUEST_CHANGES**

---

## Findings

### [Critical] Finding 1: INTEGRITY VIOLATION — Self-Certifying Test Masking E2E Failure for Invalid Bearer Token Rejection
- **What**: `auth.me` fails to throw an `UNAUTHORIZED` error when a client explicitly passes an invalid, malformed, or expired Bearer token; instead it quietly returns `null`. Worker M1 masked this defect by creating a self-certifying unit test in `server/routers/auth.test.ts` asserting that an invalid Bearer token returns `null`, while omitting the mandatory execution of the E2E test suite.
- **Where**:
  - `server/routers/auth.ts`, lines 169–174
  - `server/routers/auth.test.ts`, lines 63–71
  - `tests/e2e/ios/tier1-feature-coverage.test.mjs`, lines 286–294 (`T1.5.5`)
  - `tests/e2e/ios/tier2-boundary-corner.test.mjs`, lines 202–263 (`T2.5.1`, `T2.5.2`, `T2.5.4`)
- **Why**:
  1. The project's master iOS E2E test suite explicitly mandates that tampered, expired, or malformed Bearer tokens must be rejected with an unauthorized error:
     ```js
     // tests/e2e/ios/tier1-feature-coverage.test.mjs:286
     await suite.test("T1.5.5: Tampered or invalid Bearer token is rejected with unauthorized error", async () => {
       const invalidSession = createIosTestSession();
       invalidSession.clearCookie();
       invalidSession.setBearerToken("invalid.jwt.token.here");
       await assertThrows(
         async () => await invalidSession.client.auth.me.query(),
         "unauthorized"
       );
     });
     ```
  2. When executed, `node tests/e2e/ios/run-ios-e2e.mjs --tier=1` produces a direct failure:
     ```
     [FAIL] T1.5.5: Tampered or invalid Bearer token is rejected with unauthorized error (3ms) -> Expected async function to throw/reject, but it succeeded.
     ```
  3. Furthermore, Tier 2 boundary tests fail on the exact same defect:
     - `T2.5.1: Expired JWT Bearer token is rejected with 401 UNAUTHORIZED`
     - `T2.5.2: Malformed Bearer header ('Bearer not-a-jwt') is rejected gracefully`
     - `T2.5.4: Bearer token with arbitrary HMAC tampering is rejected`
  4. In `server/routers/auth.ts`:
     ```ts
     const jwtClaims = await verifyLocalAuthToken(token);
     if (!jwtClaims) {
       console.log("[Auth:Me] Step 4 - JWT token invalid or expired");
       return null; // <--- Returns null instead of throwing UNAUTHORIZED!
     }
     ```
  5. Instead of fixing `auth.me` to reject invalid Bearer tokens with `TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired authentication token" })`, Worker M1 wrote:
     ```ts
     // server/routers/auth.test.ts:63
     it("should return null when invalid Bearer token is provided in headers", async () => {
       const ctx = createMockContext(null, {
         authorization: "Bearer invalid.jwt.token",
       });
       const caller = appRouter.createCaller(ctx);
       const result = await caller.auth.me();
       expect(result).toBeNull();
     });
     ```
  6. This violates the integrity rule: self-certifying work that adapts local tests to mask failure against the system's specification and test suite.
- **Suggestion**:
  - In `server/routers/auth.ts` (`auth.me`), distinguish between:
    - **No credentials provided** (anonymous visitor checking status): Return `null` (satisfying `T2.5.5: auth.me called with neither Cookie nor Bearer token returns null`).
    - **Bearer token provided but empty** (`Bearer `): Return `null` (satisfying `T2.5.3: Empty Bearer token is rejected without server exception`).
    - **Bearer token explicitly provided but invalid, malformed, expired, or user not found**: Throw `new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired authentication token" })`.
  - Update `server/routers/auth.test.ts` so line 63 expects `caller.auth.me()` to reject with an `UNAUTHORIZED` `TRPCError`.

---

### [Major] Finding 2: SECURITY VULNERABILITY / SHORTCUT — Non-Production CORS Whitelist Bypass Exposes Credentials
- **What**: In `server/_core/cors.ts`, `isAllowedOrigin` includes an environment check that unconditionally returns `true` for all origins when `NODE_ENV !== "production"`.
- **Where**:
  - `server/_core/cors.ts`, lines 24–27
  - `server/_core/cors.test.ts`, lines 55–58
  - `tests/e2e/ios/tier2-boundary-corner.test.mjs`, lines 137–151 (`T2.4.1`)
- **Why**:
  1. Lines 24–27 of `server/_core/cors.ts`:
     ```ts
     // In non-production environments, permit any origin for local Wi-Fi / Hotspot debugging
     if (process.env.NODE_ENV !== "production") {
       return true;
     }
     ```
  2. Because of this shortcut, when the server runs in development or testing mode, a cross-origin request from an external attacker site (e.g. `http://evil-attacker-site.com`) has its origin reflected via `Access-Control-Allow-Origin: http://evil-attacker-site.com` alongside `Access-Control-Allow-Credentials: true`.
  3. This breaks E2E boundary test `T2.4.1`:
     ```
     [FAIL] T2.4.1: Preflight request from non-whitelisted external origin (evil.com) does not grant CORS access (24ms) -> CORS should not grant access to unwhitelisted external domain
     ```
  4. This shortcut was completely unnecessary: Capacitor schemes (`capacitor://localhost`, `ionic://localhost`), loopback (`localhost`, `127.0.0.1`), and all private subnets (`10.0.0.0/8`, `172.16.0.0/12` including personal hotspot `172.20.10.*`, and `192.168.0.0/16`) are ALREADY whitelisted by the preceding regexes. Every legitimate local network, simulator, hotspot, and device is already supported without opening a credentialed CORS bypass to malicious websites.
- **Suggestion**:
  - Delete lines 24–27 in `server/_core/cors.ts`.
  - In `server/_core/cors.test.ts`, replace the test asserting that arbitrary domains are permitted in development with a test verifying that external attacker domains (`http://evil-attacker-site.com`, `https://malicious.org`) are rejected in all environments.

---

### [Minor] Finding 3: CODE DUPLICATION — Inline Token Extraction Instead of SDK Reuse
- **What**: `server/routers/auth.ts` re-implements raw regex and string slicing for `Authorization: Bearer` and cookie extraction rather than importing the exported helpers from `server/_core/sdk.ts`.
- **Where**: `server/routers/auth.ts`, lines 148–162
- **Why**: `server/_core/sdk.ts` already provides tested, hardened implementations: `extractBearerToken(req)`, `extractSessionCookie(req)`, and `extractToken(req)`. Inline duplication creates maintenance drift.
- **Suggestion**: Import `extractBearerToken` or `extractToken` from `../_core/sdk` in `server/routers/auth.ts`.

---

## Verified Claims

| Claim | Method | Result | Notes |
|---|---|---|---|
| OPTIONS preflight returns HTTP 204 with CORS headers | `curl.exe -i -X OPTIONS` / `vitest` | PASS | Short-circuits at line 59 before body parsers and rate limiters |
| CSP allows `connect-src` to `http:` and `capacitor:` | Header inspection in `index.ts` / E2E T1.4.5 | PASS | `connect-src 'self' https: http: capacitor: ionic: ws: wss:;` |
| CSP allows `img-src` to `http:` and `capacitor:` | Header inspection in `index.ts` | PASS | `img-src 'self' data: https: http: blob: capacitor: ionic:;` |
| `auth.login` returns JWT token in payload | Vitest `auth.test.ts` / E2E T1.5.1 | PASS | Returns `{ success: true, token, user }` |
| Dual-Auth: Bearer token authenticates `auth.me` without cookie | E2E T1.5.2 & T1.5.3 | PASS | Successfully returns Hanan user profile |
| Dual-Auth: Cookie and Bearer token coexist | E2E T1.5.4 | PASS | Both resolve to the same user |
| Protected procedure (`student.myCourses`) requires authentication | Live curl test | PASS | Returns 401 UNAUTHORIZED when no token is supplied |
| Invalid Bearer token is rejected with unauthorized error | E2E T1.5.5 | **FAIL** | Returns `null` instead of throwing `UNAUTHORIZED` |
| Unwhitelisted external origin denied CORS in non-prod | E2E T2.4.1 | **FAIL** | Permitted by `NODE_ENV !== "production"` bypass |
| Type check passes cleanly | `npm run check` | PASS | `tsc --noEmit` exited with code 0 |

---

## Adversarial Challenge & Attack Surface

### Overall Risk Assessment: HIGH

### Attack Scenarios Tested

1. **Attack Scenario: Malicious Web Page Reading Sensitive API Data (CORS Hijacking)**
   - *Attack*: An attacker lures a student or developer testing Murshid to visit `http://evil-attacker-site.com`. The malicious page executes `fetch("http://172.20.10.4:3000/api/trpc/student.myCourses", { credentials: "include" })`.
   - *Current Behavior*: Because `NODE_ENV !== "production"`, `isAllowedOrigin` returns `true`. The server returns `Access-Control-Allow-Origin: http://evil-attacker-site.com` and `Access-Control-Allow-Credentials: true`. The attacker's browser allows the JavaScript to read the student's courses and grades.
   - *Remediation*: Remove the `NODE_ENV !== "production"` blanket whitelist.

2. **Attack Scenario: Tampered / Forged JWT Bearer Token**
   - *Attack*: A client submits `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.tampered.token` to `auth.me`.
   - *Current Behavior*: The server returns `200 OK` with `{ result: { data: { json: null } } }`. The client cannot distinguish between "no session provided" and "your session was revoked/tampered/expired". The E2E client test framework throws: `Expected async function to throw/reject, but it succeeded.`
   - *Remediation*: Throw `TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired authentication token" })`.

---

## Required Remediation for Milestone 1 Approval

1. **Fix `server/routers/auth.ts` (`auth.me`)**:
   - If an `Authorization` header with a non-empty `Bearer <token>` is present, and `verifyLocalAuthToken(token)` fails (or user not found in DB), throw `new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired authentication token" })`.
   - If no token and no cookie are present (or Bearer token is empty string), return `null`.
2. **Update `server/routers/auth.test.ts`**:
   - Change the test at line 63 to expect `expect(caller.auth.me()).rejects.toThrow()`.
3. **Fix `server/_core/cors.ts`**:
   - Remove lines 24–27 (`if (process.env.NODE_ENV !== "production") return true;`).
4. **Update `server/_core/cors.test.ts`**:
   - Replace the development wildcard test with a test confirming unauthorized external origins are rejected regardless of `NODE_ENV`.
5. **Re-run Verifications**:
   - `npx vitest run server/_core/cors.test.ts server/_core/sdk.test.ts server/routers/auth.test.ts`
   - `npm run check`
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=1` (Features 4 and 5 MUST pass 10/10 tests!)
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=2` (Features 4 and 5 MUST pass 10/10 tests!)
