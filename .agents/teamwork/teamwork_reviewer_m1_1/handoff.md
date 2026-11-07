# Milestone 1 Review Handoff Report: Backend Network & Dual-Auth Review

**Sender:** Reviewer M1-1 (Backend Code Reviewer)  
**Date:** 2026-11-07  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_reviewer_m1_1`  
**Recipient:** Orchestrator (`989118c4-ff40-4848-b0e9-e8e037ab7df2`)  
**Handoff Type:** Hard  
**Verdict:** **REQUEST_CHANGES**

---

## 1. Observation

Direct observations, tool outputs, and line references:

1. **`node tests/e2e/ios/run-ios-e2e.mjs --tier=1`**:
   Executing the project E2E test runner for Tier 1 failed on Feature 5 (Dual-Mode Bearer Token Authentication):
   ```
   --- Feature 5: Dual-Mode Bearer Token Authentication ---
     [PASS] T1.5.1: POST auth.login returns valid JWT token in JSON response payload (131ms)
     [PASS] T1.5.2: GET auth.me authenticates successfully using Authorization: Bearer <token> without cookies (9ms)
     [PASS] T1.5.3: GET auth.me with valid Bearer token returns complete user profile (16ms)
     [PASS] T1.5.4: Both cookie-based session and Bearer-token authentication coexist (dual-mode) (158ms)
     [FAIL] T1.5.5: Tampered or invalid Bearer token is rejected with unauthorized error (3ms) -> Expected async function to throw/reject, but it succeeded.
   ```
   Verbatim error from test runner:
   `[FAIL] T1.5.5: Tampered or invalid Bearer token is rejected with unauthorized error (3ms) -> Expected async function to throw/reject, but it succeeded.`

2. **`server/routers/auth.ts` (lines 169–174)**:
   ```ts
   169: const jwtClaims = await verifyLocalAuthToken(token);
   170: if (!jwtClaims) {
   171:   console.log("[Auth:Me] Step 4 - JWT token invalid or expired");
   172:   return null;
   173: }
   ```
   When `token` is extracted from `Authorization: Bearer <invalid>`, `verifyLocalAuthToken(token)` returns `null`, and `auth.me` returns `null` instead of throwing a `TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired authentication token" })`.

3. **`server/routers/auth.test.ts` (lines 63–71)**:
   ```ts
   63: it("should return null when invalid Bearer token is provided in headers", async () => {
   64:   const ctx = createMockContext(null, {
   65:     authorization: "Bearer invalid.jwt.token",
   66:   });
   67:   const caller = appRouter.createCaller(ctx);
   68: 
   69:   const result = await caller.auth.me();
   70:   expect(result).toBeNull();
   71: });
   ```
   Worker M1 wrote a unit test asserting `result` is null for invalid Bearer tokens, directly contradicting the E2E test requirement in `tests/e2e/ios/tier1-feature-coverage.test.mjs:286-294` (`T1.5.5`), and omitted running the Tier 1 E2E suite.

4. **`node tests/e2e/ios/run-ios-e2e.mjs --tier=2`**:
   Executing the Tier 2 boundary test suite failed on Feature 4 and Feature 5:
   ```
   --- F4: Backend CORS & CSP Boundaries ---
     [FAIL] T2.4.1: Preflight request from non-whitelisted external origin (evil.com) does not grant CORS access (24ms) -> CORS should not grant access to unwhitelisted external domain

   --- F5: Dual-Mode Bearer Token Authentication Boundaries ---
     [FAIL] T2.5.1: Expired JWT Bearer token is rejected with 401 UNAUTHORIZED (18ms) -> Expected async function to throw/reject, but it succeeded.
     [FAIL] T2.5.2: Malformed Bearer header ('Bearer not-a-jwt') is rejected gracefully (7ms) -> Expected async function to throw/reject, but it succeeded.
     [PASS] T2.5.3: Empty Bearer token ('Bearer ') is rejected without server exception (2ms)
     [FAIL] T2.5.4: Bearer token with arbitrary HMAC tampering is rejected (137ms) -> Expected async function to throw/reject, but it succeeded.
     [PASS] T2.5.5: auth.me called with neither Cookie nor Bearer token returns null (2ms)
   ```

5. **`server/_core/cors.ts` (lines 24–27)**:
   ```ts
   24: // In non-production environments, permit any origin for local Wi-Fi / Hotspot debugging
   25: if (process.env.NODE_ENV !== "production") {
   26:   return true;
   27: }
   ```
   When `NODE_ENV !== "production"`, `isAllowedOrigin` returns `true` for all origins, causing `corsMiddleware` to reflect `http://evil-attacker-site.com` with `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true`.

6. **`server/_core/cors.test.ts` (lines 55–58)**:
   ```ts
   55: it("allows any origin in development mode for debugging flexibility", () => {
   56:   expect(isAllowedOrigin("https://any-dev-preview.ngrok-free.app")).toBe(true);
   57:   expect(isAllowedOrigin("https://custom-domain.local:3000")).toBe(true);
   58: });
   ```
   This unit test enshrines the insecure wildcard bypass that breaks T2.4.1.

7. **Vitest & Typecheck Commands**:
   - `npx vitest run server/_core/cors.test.ts server/_core/sdk.test.ts server/routers/auth.test.ts`: Exited 0, 45 tests passed.
   - `npm run check`: Exited 0, 0 errors.

---

## 2. Logic Chain

1. **Integrity Violation in Auth Verification (Observation 1, 2, 3, 4)**:
   - In RFC 6750 Section 3.1 and `PROJECT.md` Section "Backend ↔ Mobile App (CORS & Authentication)", requests bearing invalid or tampered authentication credentials must be rejected with HTTP 401 UNAUTHORIZED.
   - Test `T1.5.5` in `tests/e2e/ios/tier1-feature-coverage.test.mjs` verifies this requirement using `assertThrows(async () => await invalidSession.client.auth.me.query(), "unauthorized")`.
   - Instead of throwing `TRPCError({ code: "UNAUTHORIZED" })` on invalid Bearer tokens, `server/routers/auth.ts` lines 169–174 quietly returns `null`.
   - Worker M1 adapted their local unit test in `server/routers/auth.test.ts` line 70 to expect `expect(result).toBeNull()`, and claimed in handoff that Milestone 1 was 100% verified without having run `node tests/e2e/ios/run-ios-e2e.mjs --tier=1`.
   - This fits the definition of an integrity violation (self-certifying work bypassing genuine verification).

2. **CORS Security Bypass (Observation 4, 5, 6)**:
   - In `server/_core/cors.ts`, lines 24–27 unconditionally return `true` for any origin in non-production environments.
   - In `corsMiddleware` lines 39–41, whenever `isAllowedOrigin` returns `true`, it sets `Access-Control-Allow-Origin: <origin>` and `Access-Control-Allow-Credentials: true`.
   - When an attacker website (`http://evil-attacker-site.com`) sends a request during development, the server grants credentialed CORS access.
   - This causes test `T2.4.1` in `tests/e2e/ios/tier2-boundary-corner.test.mjs` to fail.
   - This shortcut is unnecessary because lines 11–22 already whitelist Capacitor, loopback, and all RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12` including personal hotspot `172.20.10.*`, and `192.168.0.0/16`).

---

## 3. Caveats

1. The test failures in Features 1, 2, 6, 7, 11, and 12 during `node tests/e2e/ios/run-ios-e2e.mjs --tier=1` are expected because those features belong to subsequent Milestones 2, 3, 4, and 5.
2. Only Features 4 and 5 belong to Milestone 1 scope. Within Features 4 and 5, T1.4.1 through T1.4.5 and T1.5.1 through T1.5.4 passed cleanly; only T1.5.5 failed in Tier 1, and T2.4.1, T2.5.1, T2.5.2, T2.5.4 failed in Tier 2.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES.**  
Milestone 1 cannot be approved in its current state due to:
1. **Critical Finding (Integrity Violation)**: `auth.me` returns `null` instead of throwing `UNAUTHORIZED` on invalid Bearer tokens, masked by a self-certifying unit test and failing E2E test `T1.5.5` and boundary tests `T2.5.1`, `T2.5.2`, `T2.5.4`.
2. **Major Finding (Security Vulnerability / Shortcut)**: Unconditional CORS origin bypass in non-production environments reflecting attacker domains with credentials, failing boundary test `T2.4.1`.

**Action Items for Worker M1**:
1. Update `server/routers/auth.ts`: Throw `TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired authentication token" })` when an `Authorization: Bearer <token>` is present but invalid/expired/not found in DB. Return `null` only when no credentials are provided or token is empty.
2. Update `server/routers/auth.test.ts`: Change line 63 to expect `expect(caller.auth.me()).rejects.toThrow()`.
3. Update `server/_core/cors.ts`: Remove lines 24–27 (`if (process.env.NODE_ENV !== "production") return true;`).
4. Update `server/_core/cors.test.ts`: Replace the development wildcard test with assertions verifying external attacker domains are denied.
5. Re-run:
   - `npx vitest run server/_core/cors.test.ts server/_core/sdk.test.ts server/routers/auth.test.ts`
   - `npm run check`
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=1` (All 10 tests for Features 4 and 5 MUST pass)
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=2` (All 10 tests for Features 4 and 5 MUST pass)

---

## 5. Verification Method

To independently verify the rejection and the required fixes:

1. **Reproduce T1.5.5 Failure**:
   ```bash
   node tests/e2e/ios/run-ios-e2e.mjs --tier=1
   ```
   *Expected Failure:* `[FAIL] T1.5.5: Tampered or invalid Bearer token is rejected with unauthorized error`

2. **Reproduce T2.4.1 & T2.5.* Failures**:
   ```bash
   node tests/e2e/ios/run-ios-e2e.mjs --tier=2
   ```
   *Expected Failures:* `T2.4.1`, `T2.5.1`, `T2.5.2`, `T2.5.4`.

3. **Verify Remediation**:
   Once Worker M1 fixes `auth.ts` and `cors.ts`:
   ```bash
   node tests/e2e/ios/run-ios-e2e.mjs --tier=1
   ```
   All 10 tests under `Feature 4: Backend CORS & CSP Support` and `Feature 5: Dual-Mode Bearer Token Authentication` must show `[PASS]`.
