# Adversarial Backend Review Report: Milestone 1

**Reviewer:** Reviewer M1-2 (Adversarial Backend Reviewer)  
**Roles:** Reviewer, Critic  
**Date:** 2026-11-07  
**Verdict:** **APPROVE**  
**Overall Risk Assessment:** **LOW**

---

## 1. Review Summary

The implementation of Milestone 1 (Backend Network & Dual-Auth Readiness) across `server/_core/cors.ts`, `server/_core/index.ts`, `server/_core/sdk.ts`, and `server/routers/auth.ts` has been rigorously evaluated against functional requirements, architectural contracts (`PROJECT.md`), and adversarial stress vectors.

All 45 Milestone 1 unit tests pass (`cors.test.ts`, `sdk.test.ts`, `auth.test.ts`), all 75 repository vitest tests pass, and TypeScript compilation (`npm run check`) succeeds with 0 errors. Real live execution against the running backend server confirms genuine, non-fabricated functionality.

No integrity violations, facade implementations, or hardcoded shortcuts were found.

---

## 2. Integrity Verification

| Check | Result | Evidence |
|---|---|---|
| Hardcoded test results or outputs | **PASSED** | Inspected `server/_core/cors.ts`, `server/_core/sdk.ts`, `server/routers/auth.ts`. All functions execute dynamic logic (regex matching, JOSE JWT verification, MariaDB queries). |
| Dummy or facade implementations | **PASSED** | Real `jose` cryptographic verification, real Drizzle ORM database lookups against `users` table, real CORS headers and status codes. |
| Shortcuts bypassing intended task | **PASSED** | Dual-auth is integrated directly into `server/_core/context.ts` via `sdk.authenticateRequest`, properly cascading Bearer authentication across all 11 backend routers without shortcuts. |
| Fabricated verification logs/artifacts | **PASSED** | Independently executed `npx vitest run`, `npm run check`, live `curl.exe` preflight OPTIONS, and live `fetch` end-to-end auth queries. All logs reproduced independently. |
| Self-certifying work | **PASSED** | Independent adversarial test harness executed verifying edge cases not covered by worker's original test suite. |

---

## 3. Adversarial Edge Case Assessment

### 3.1 Wildcard Origins with Credentials
- **Vulnerability Checked:** Setting `Access-Control-Allow-Origin: *` while `Access-Control-Allow-Credentials: true` violates W3C CORS specification and causes browser network requests to fail.
- **Implementation Behavior:** `corsMiddleware` dynamically reflects the validated origin via `res.setHeader("Access-Control-Allow-Origin", origin)`. It **never** emits a wildcard `*`.
- **Production Validation:** In production (`NODE_ENV === "production"`), `isAllowedOrigin("*")` returns `false`. Unapproved origins receive no `Access-Control-Allow-Origin` header.
- **Verdict:** **ROBUST**

### 3.2 Missing `Origin` Header (Server-to-Server / Scripts / Native HTTP)
- **Vulnerability Checked:** Requests without an `Origin` header (such as CLI `curl`, native HTTP plugins, or server-to-server microservices) could be erroneously blocked or receive invalid CORS headers.
- **Implementation Behavior:**
  - `corsMiddleware` checks `if (origin && isAllowedOrigin(origin))`. If `origin` is `undefined`, no CORS headers are injected.
  - For standard methods (`GET`, `POST`, etc.), `next()` is called immediately.
  - For `OPTIONS` without origin, it terminates cleanly with `204 No Content`.
  - Independent testing confirmed 0 CORS headers set on non-origin requests, and the request chain continued seamlessly.
- **Verdict:** **ROBUST**

### 3.3 Malformed `Authorization` Headers
- **Vulnerability Checked:** Malformed headers causing runtime crashes (e.g. `TypeError: Cannot read properties of undefined`, unhandled exceptions).
- **Test Scenarios Evaluated:**
  1. Bare `'Bearer'` (no trailing space, no token) $\rightarrow$ Returns `null` (safely falls back).
  2. Trailing space only `'bearer '` $\rightarrow$ Returns `null` (`substring(7).trim() || null`).
  3. Multiple spaces only `'Bearer    '` $\rightarrow$ Returns `null`.
  4. Multiple spaces with valid token `'Bearer   xyz.123   '` $\rightarrow$ Returns `'xyz.123'` (properly trimmed).
  5. Tab delimiter `'bearer\ttoken'` $\rightarrow$ Returns `null` (safely rejected).
  6. Non-bearer scheme `'Basic dXNlcjpwYXNz'` $\rightarrow$ Returns `null`.
  7. Empty string `''` $\rightarrow$ Returns `null`.
  8. Header array `['Bearer first', 'Bearer second']` $\rightarrow$ Handled cleanly via `Array.isArray(authHeader) ? authHeader[0] : authHeader`, returning `'first'`.
  9. Corrupted/unparseable JWT string $\rightarrow$ `jwtVerify` throws, safely caught by `isExpectedTokenVerificationError` returning `null`.
- **Verdict:** **ROBUST**

### 3.4 Preflight OPTIONS & Rate Limiter Bypass
- **Vulnerability Checked:** Preflight `OPTIONS` requests incrementing rate limit counters or being blocked with HTTP 429 Too Many Requests; or unhandled `OPTIONS` reaching tRPC returning 404/415.
- **Implementation Behavior:**
  - `corsMiddleware` is registered at line 29 of `server/_core/index.ts`, ahead of `authRateLimiter`, `generalRateLimiter`, and body parsers.
  - When `req.method === "OPTIONS"`, it executes `res.status(204).end(); return;`.
  - `next()` is strictly **not called**.
  - Rate limit counters are never incremented by browser preflights.
  - Zero side effects on database, sessions, or rate limiting state.
- **Verdict:** **ROBUST**

### 3.5 `auth.me` Handling of Null, Expired, and Corrupted Tokens
- **Vulnerability Checked:** Expired or forged tokens throwing 500 errors or leaving sessions in undefined state.
- **Test Scenarios Evaluated:**
  1. No credentials provided $\rightarrow$ Returns `null` (HTTP 200 with `null` body).
  2. Corrupted token string $\rightarrow$ Returns `null`.
  3. Expired token (1 hour past expiration) $\rightarrow$ Handled by `jose` expiration check, returns `null`.
  4. Token with forged HMAC signature (wrong secret key) $\rightarrow$ Signature validation fails, returns `null`.
  5. Valid token signature for non-existent database user (`userId: 99999999`) $\rightarrow$ Database query returns empty array, returns `null`.
  6. Legitimate token for enrolled user (`khaled.haddad@zuj.edu.jo`) $\rightarrow$ Returns user object with ID `210027`.
- **Verdict:** **ROBUST**

---

## 4. Test Suite Execution Results

### 4.1 Vitest Unit Tests
Command: `npx vitest run server/_core/cors.test.ts server/_core/sdk.test.ts server/routers/auth.test.ts`
- `server/_core/cors.test.ts`: 16 passed
- `server/_core/sdk.test.ts`: 23 passed
- `server/routers/auth.test.ts`: 6 passed
- **Total:** 45 passed, 0 failed.

### 4.2 Full Repository Vitest Suite
Command: `npx vitest run`
- 8 test files, 75 tests passed, 0 failed.

### 4.3 TypeScript Type Check
Command: `npm run check` (`tsc --noEmit`)
- Exit code 0, 0 diagnostic errors.

### 4.4 Live Server End-to-End Test
- Preflight `OPTIONS /api/trpc/auth.login` with `Origin: capacitor://localhost` $\rightarrow$ `HTTP/1.1 204 No Content`, CORS headers verified.
- `POST /api/trpc/auth.login` $\rightarrow$ Issued JWT token (length 260).
- `GET /api/trpc/auth.me` with `Authorization: Bearer <token>` $\rightarrow$ Returned `Khaled Haddad` (`khaled.haddad@zuj.edu.jo`).
- `GET /api/trpc/student.myCourses` with `Authorization: Bearer <token>` $\rightarrow$ Returned 25 enrolled courses.

---

## 5. Findings & Recommendations

### [Minor] Production Allowed Origin Extension
- **Observation:** In `server/_core/cors.ts`, allowed origins in production are strictly scoped to `capacitor://localhost`, `ionic://localhost`, localhost/loopback, and RFC 1918 subnets (`172.16.0.0/12`, `192.168.0.0/16`, `10.0.0.0/8`).
- **Impact:** If the backend is later deployed behind a public production domain (e.g. `https://murshid.zuj.edu.jo`), that public domain would need to be added to `isAllowedOrigin`.
- **Recommendation:** Acceptable as designed for current local network / mobile app hotspot architecture. Can easily be augmented in production via an environment variable (e.g. `ALLOWED_ORIGINS`).

---

## 6. Formal Verdict

**APPROVE**

Milestone 1 satisfies all functional, architectural, and security requirements. The backend network and authentication layers are robust against adversarial inputs and fully prepared for downstream mobile integration (Milestones 2 through 5).
