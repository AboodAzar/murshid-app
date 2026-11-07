# Explorer M1-R2-1 Investigation Report: `auth.me` Unauthorized Rejection & Drop-in Remediation

**Explorer:** Explorer M1-R2-1 (Auth Rejection Specialist)  
**Date:** 2026-11-07  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_r2_1`  
**Target Consumer:** Worker M1-2 & Orchestrator  

---

## Executive Summary

During Milestone 1 code review, Reviewer M1-1 identified that `server/routers/auth.ts` returned `null` instead of throwing `UNAUTHORIZED` when an invalid Bearer token was supplied in `Authorization: Bearer <token>`. This masked invalid authentication attempts and caused Tier 1 E2E test `T1.5.5` and Tier 2 boundary tests `T2.5.1`, `T2.5.2`, and `T2.5.4` to fail. Furthermore, the unit test in `server/routers/auth.test.ts` had been adjusted to expect `null` rather than asserting a rejection.

This report provides the complete root-cause analysis, boundary case verification, and **exact drop-in code snippets** for Worker M1-2 to remediate both `server/routers/auth.ts` and `server/routers/auth.test.ts`.

---

## 1. Problem Analysis & Code Inspection

### 1.1 Current Implementation in `server/routers/auth.ts` (Lines 138–200)

```typescript
me: publicProcedure.query(async opts => {
  console.log("[Auth:Me] Step 1 - Checking context user...");
  // First try to get from context (server-side authenticated)
  if (opts.ctx.user) {
    console.log("[Auth:Me] Step 2 - User found in context:", opts.ctx.user.email, "role:", opts.ctx.user.role);
    return opts.ctx.user;
  }
  console.log("[Auth:Me] Step 2 - No user in context");

  // If no context user, try to verify JWT from Bearer token or cookie
  let token: string | null = null;
  const authHeader = opts.ctx.req.headers.authorization;
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (headerValue && typeof headerValue === "string" && headerValue.toLowerCase().startsWith("bearer ")) {
    token = headerValue.substring(7).trim() || null;
  }

  if (!token) {
    const cookies = opts.ctx.req.headers.cookie || "";
    const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
    if (cookieMatch && cookieMatch[1]) {
      token = cookieMatch[1];
    }
  }

  if (!token) {
    console.log("[Auth:Me] Step 3 - No Bearer token or auth cookie found");
    return null;
  }
  console.log("[Auth:Me] Step 3 - Auth token found");

  const jwtClaims = await verifyLocalAuthToken(token);
  if (!jwtClaims) {
    console.log("[Auth:Me] Step 4 - JWT token invalid or expired");
    return null; // <--- DEFECT: returns null instead of throwing UNAUTHORIZED
  }
  ...
```

### 1.2 The Root Cause
1. In RFC 6750 Section 3.1 and `PROJECT.md` Section "Backend ↔ Mobile App (CORS & Authentication)", requests bearing explicit but invalid or tampered authorization credentials MUST be rejected with HTTP 401 `UNAUTHORIZED`.
2. When a client passes `Authorization: Bearer <invalid>`, `verifyLocalAuthToken(token)` returns `null`.
3. Instead of rejecting the request, `server/routers/auth.ts` returned `null`, returning HTTP 200 OK with `{ result: { data: null } }`.
4. As a result:
   - `T1.5.5` in `tests/e2e/ios/tier1-feature-coverage.test.mjs` failed:  
     `Expected async function to throw/reject, but it succeeded.`
   - `T2.5.1`, `T2.5.2`, and `T2.5.4` in `tests/e2e/ios/tier2-boundary-corner.test.mjs` failed:  
     `Expected async function to throw/reject, but it succeeded.`

---

## 2. Critical Substring Nuance: `assertThrows(..., "unauthorized")`

An essential subtlety was uncovered during dynamic analysis of the E2E test harness:

In `tests/e2e/ios/helpers/test-client.mjs` (lines 121–134):
```typescript
export async function assertThrows(fn, expectedSubstr = "") {
  try {
    await fn();
  } catch (err) {
    const msg = err.message || String(err);
    if (expectedSubstr && !msg.toLowerCase().includes(expectedSubstr.toLowerCase())) {
      throw new Error(
        `Expected rejection containing "${expectedSubstr}", but got: "${msg}"`
      );
    }
    return err;
  }
  throw new Error(`Expected async function to throw/reject, but it succeeded.`);
}
```

In tRPC client (`@trpc/client`), `err.message` is populated **only** with the server's error message string:
- If `new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired authorization token" })` is thrown, `err.message` is `"Invalid or expired authorization token"`.
- Tested in Node.js:
  `"Invalid or expired authorization token".toLowerCase().includes("unauthorized") === false`.
- If Worker M1-2 omitted the word "Unauthorized" from the message string, `assertThrows` would fail with:  
  `Expected rejection containing "unauthorized", but got: "Invalid or expired authorization token"`.

### The Harmonized Solution:
Use:
```typescript
throw new TRPCError({
  code: "UNAUTHORIZED",
  message: "Unauthorized: Invalid or expired authorization token",
});
```
This guarantees:
1. `err.message.toLowerCase().includes("unauthorized")` evaluates to `true`.
2. `err.message.toLowerCase().includes("invalid or expired authorization token")` evaluates to `true`.
3. `err.code` is `"UNAUTHORIZED"`.
4. Both the orchestrator prompt and test assertions pass simultaneously.

---

## 3. Boundary Matrix & Expected Behavior

| Case | Request Credentials | `auth.me` Behavior | Test Coverage |
| :--- | :--- | :--- | :--- |
| **A. Context Authenticated** | User populated in `ctx.user` (valid session) | Returns `ctx.user` | Unit tests, T1.5.2, T1.5.3, T1.5.4 |
| **B. Invalid Bearer Token** | `Authorization: Bearer invalid.jwt.token` | **Throws `TRPCError(UNAUTHORIZED)`** | Unit test, T1.5.5 |
| **C. Expired Bearer Token** | `Authorization: Bearer <expired-jwt>` | **Throws `TRPCError(UNAUTHORIZED)`** | T2.5.1 |
| **D. Malformed Bearer Header** | `Authorization: Bearer not-a-jwt` | **Throws `TRPCError(UNAUTHORIZED)`** | T2.5.2 |
| **E. Tampered Bearer Token** | Valid token with modified signature | **Throws `TRPCError(UNAUTHORIZED)`** | T2.5.4 |
| **F. User Not Found in DB** | Valid JWT payload, but user ID absent in DB | **Throws `TRPCError(UNAUTHORIZED)`** | Defensive RFC 6750 enforcement |
| **G. Empty Bearer Token** | `Authorization: Bearer ` (whitespace only) | Returns `null` (guest session) | T2.5.3 |
| **H. Guest / No Credentials** | Neither `Authorization` header nor cookie | Returns `null` (guest session) | Unit test, `routers.test.ts`, T2.5.5 |
| **I. Cookie Only (Valid)** | Valid session cookie in `Cookie: app_session_id=...` | Returns user from DB | T1.5.4 |
| **J. Cookie Only (Invalid)** | Expired or invalid cookie, no Bearer header | Returns `null` (guest session) | Standard web session fallback |

---

## 4. Drop-in Code Snippets for Worker M1-2

### 4.1 Target File 1: `server/routers/auth.ts`

**Location:** Lines 147–200. Replace the entire unauthenticated fallback block inside `me: publicProcedure.query(async opts => { ... })`:

```typescript
    // Extract Authorization header to check for explicit Bearer token
    const authHeader = opts.ctx.req?.headers?.authorization;
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    let bearerToken: string | null = null;
    let hasExplicitBearer = false;

    if (headerValue && typeof headerValue === "string" && headerValue.toLowerCase().startsWith("bearer ")) {
      hasExplicitBearer = true;
      bearerToken = headerValue.substring(7).trim() || null;
    }

    // 1. If an explicit Bearer header was provided
    if (hasExplicitBearer) {
      // Empty Bearer token (e.g. 'Bearer ') returns null for unauthenticated session per T2.5.3
      if (!bearerToken) {
        console.log("[Auth:Me] Step 3 - Empty Bearer token provided, returning null");
        return null;
      }

      console.log("[Auth:Me] Step 3 - Explicit Bearer token found, validating...");
      const jwtClaims = await verifyLocalAuthToken(bearerToken);
      if (!jwtClaims) {
        console.log("[Auth:Me] Step 4 - Bearer JWT invalid or expired, rejecting with UNAUTHORIZED");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized: Invalid or expired authorization token",
        });
      }

      console.log("[Auth:Me] Step 4 - Bearer JWT valid, userId:", jwtClaims.userId, "role:", jwtClaims.role);

      const db = await getDb();
      if (!db) {
        console.error("[Auth:Me] Step 5 - Database unavailable");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, jwtClaims.userId))
          .limit(1);
        const user = result[0] || null;
        if (!user) {
          console.warn("[Auth:Me] Step 5 - User not found in DB for userId:", jwtClaims.userId);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized: Invalid or expired authorization token",
          });
        }
        console.log("[Auth:Me] Step 5 - User loaded from DB:", user.email, "role:", user.role);
        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Auth:Me] Step 5 - Failed to fetch user from DB:", error);
        return null;
      }
    }

    // 2. Fall back to session cookie if no Bearer header was provided
    const cookies = opts.ctx.req?.headers?.cookie || "";
    const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
    const cookieToken = cookieMatch && cookieMatch[1] ? cookieMatch[1] : null;

    if (cookieToken) {
      console.log("[Auth:Me] Step 3 - Session cookie found, validating...");
      const jwtClaims = await verifyLocalAuthToken(cookieToken);
      if (!jwtClaims) {
        console.log("[Auth:Me] Step 4 - Cookie JWT invalid or expired, returning null for guest");
        return null;
      }

      const db = await getDb();
      if (!db) {
        console.error("[Auth:Me] Step 5 - Database unavailable");
        return null;
      }

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, jwtClaims.userId))
          .limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("[Auth:Me] Step 5 - Failed to fetch user from DB:", error);
        return null;
      }
    }

    // 3. Guest session (neither Bearer header nor session cookie)
    console.log("[Auth:Me] Step 3 - No credentials provided, guest session returning null");
    return null;
```

---

### 4.2 Target File 2: `server/routers/auth.test.ts`

**Location 1:** Top imports (around line 6), ensure `TRPCError` is imported:
```typescript
import { TRPCError } from "@trpc/server";
```

**Location 2:** Lines 63–71. Replace the invalid Bearer test:
```typescript
    it("should throw UNAUTHORIZED TRPCError when invalid Bearer token is provided in headers", async () => {
      const ctx = createMockContext(null, {
        authorization: "Bearer invalid.jwt.token",
      });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.me()).rejects.toThrow(TRPCError);
      await expect(caller.auth.me()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should throw UNAUTHORIZED TRPCError when malformed Bearer token is provided in headers", async () => {
      const ctx = createMockContext(null, {
        authorization: "Bearer not-a-jwt",
      });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.me()).rejects.toThrow(TRPCError);
      await expect(caller.auth.me()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should return null when empty Bearer token is provided in headers", async () => {
      const ctx = createMockContext(null, {
        authorization: "Bearer ",
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
```

---

## 5. Verification Commands

Following the application of these changes by Worker M1-2, run:

1. **Unit Tests (Vitest):**
   ```bash
   npx vitest run server/routers/auth.test.ts server/routers.test.ts
   ```
   *Expected:* All tests PASS.

2. **TypeScript Typecheck:**
   ```bash
   npm run check
   ```
   *Expected:* 0 errors.

3. **Tier 1 Feature Coverage (Feature 5):**
   ```bash
   node tests/e2e/ios/run-ios-e2e.mjs --tier=1
   ```
   *Expected:* All 5 tests for `Feature 5: Dual-Mode Bearer Token Authentication` (`T1.5.1` through `T1.5.5`) must PASS.

4. **Tier 2 Boundary & Corner Cases (Feature 5):**
   ```bash
   node tests/e2e/ios/run-ios-e2e.mjs --tier=2
   ```
   *Expected:* All 5 tests for `F5: Dual-Mode Bearer Token Authentication Boundaries` (`T2.5.1` through `T2.5.5`) must PASS.
