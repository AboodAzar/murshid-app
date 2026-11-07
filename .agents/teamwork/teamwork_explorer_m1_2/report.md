# Bearer & Dual-Auth Technical Investigation Report
**Milestone:** Milestone 1 (Backend Network & Dual-Auth Readiness)  
**Investigator:** Explorer M1-2 (Bearer Auth Specialist)  
**Date:** 2026-11-07  
**Target Files:**  
- `server/_core/sdk.ts`
- `server/routers/auth.ts`
- `server/_core/context.ts`
- `server/_core/trpc.ts`
- `server/_core/sdk.test.ts`
- `server/routers/auth.test.ts`

---

## 1. Executive Summary

In a native iOS Capacitor application, the web frontend executes inside Apple's WKWebView under the native origin `capacitor://localhost`. When interacting with the backend server over a local network (`http://172.20.10.4:3000`), WebKit's Intelligent Tracking Prevention (ITP) drops or refuses to persist cross-origin HTTP-only cookies (`app_session_id`). 

Currently, the Murshid backend exclusively relies on cookies for authentication session extraction:
1. `server/_core/sdk.ts` extracts session tokens strictly from `req.headers.cookie` via `extractSessionCookie()` (line 36). It ignores the standard `Authorization: Bearer <token>` header entirely.
2. `server/routers/auth.ts` generates a valid JWT token on login (line 268), but omits the token from the mutation response JSON (lines 293-302), returning only `{ success: true, user }`. This prevents mobile clients from obtaining and storing the token in `localStorage`.
3. `auth.me` contains a secondary fallback (lines 147-156) that also only inspects cookies.

By implementing dual-mode authentication (supporting both `Authorization: Bearer <token>` and cookie-based sessions), both desktop web browsers (cookies) and native iOS Capacitor clients (Bearer tokens) achieve 100% reliable session persistence. Furthermore, because tRPC's `protectedProcedure` relies uniformly on `ctx.user` populated in `server/_core/context.ts`, updating `sdk.authenticateRequest` enables Bearer authentication across **all 11 protected routers** with zero breaking changes.

---

## 2. Deep Dive: `server/_core/sdk.ts` Analysis

### 2.1 Current Implementation & Exact Line References
- **File Path:** `server/_core/sdk.ts`
- **Lines 35–40 (`extractSessionCookie`):**
  ```typescript
  // Extract session cookie from request
  function extractSessionCookie(req: Request): string | null {
    const cookies = req.headers.cookie || "";
    const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
    return cookieMatch ? cookieMatch[1] : null;
  }
  ```
- **Lines 96–142 (`authenticateRequest`):**
  ```typescript
  // Authenticate request and return user from database
  async function authenticateRequest(req: Request): Promise<User | null> {
    const token = extractSessionCookie(req);
    if (!token) {
      return null;
    }

    // Try to verify as local JWT first
    const localPayload = await verifyLocalJWT(token);
    if (localPayload) {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, localPayload.userId))
          .limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("[SDK] Failed to fetch user by local JWT:", error);
        return null;
      }
    }

    // Try to verify as framework session (OAuth)
    const sessionPayload = await verifyFrameworkSession(token);
    if (sessionPayload) {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.openId, sessionPayload.openId))
          .limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("[SDK] Failed to fetch user by openId:", error);
        return null;
      }
    }

    return null;
  }
  ```
- **Lines 196–201 (`sdk` export):**
  ```typescript
  export const sdk = {
    authenticateRequest,
    createSessionToken,
    exchangeCodeForToken,
    getUserInfo,
  };
  ```

### 2.2 Defects Identified
1. **No Authorization Header Parsing:** Line 98 directly calls `extractSessionCookie(req)`. If `Authorization: Bearer <token>` is passed without a cookie, `token` resolves to `null` and `authenticateRequest` exits immediately.
2. **Missing `getUserFromRequest` alias:** Callers or interfaces looking for `getUserFromRequest` find only `authenticateRequest`. An alias should be exported on `sdk` to satisfy both conventions.
3. **No Header Normalization:** Express passes `req.headers.authorization` as either `string | string[] | undefined`. A robust extractor must handle string arrays, case-insensitivity (`bearer ` vs `Bearer `), and excess whitespace.

### 2.3 Drop-In Replacement for `server/_core/sdk.ts`

```typescript
// --- REPLACE LINES 35-40 IN server/_core/sdk.ts WITH: ---

// Extract Bearer token from Authorization header (case-insensitive)
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const trimmed = headerValue.trim();
  
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    const token = trimmed.slice(7).trim();
    return token.length > 0 ? token : null;
  }
  return null;
}

// Extract session cookie from request
export function extractSessionCookie(req: Request): string | null {
  const cookies = req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  return cookieMatch ? cookieMatch[1] : null;
}

// Unified token extractor: Prioritizes Authorization header, falls back to cookie
export function extractToken(req: Request): string | null {
  const bearerToken = extractBearerToken(req);
  if (bearerToken) return bearerToken;
  return extractSessionCookie(req);
}
```

```typescript
// --- REPLACE LINES 96-142 IN server/_core/sdk.ts WITH: ---

// Authenticate request and return user from database
export async function authenticateRequest(req: Request): Promise<User | null> {
  // Check candidate tokens in order of priority:
  // 1. Authorization: Bearer <token> (mobile apps, WKWebView, external API clients)
  // 2. Cookie: app_session_id=<token> (browser sessions)
  const bearerToken = extractBearerToken(req);
  const cookieToken = extractSessionCookie(req);

  const tokensToTry = [bearerToken, cookieToken].filter(
    (t): t is string => Boolean(t)
  );

  if (tokensToTry.length === 0) {
    return null;
  }

  for (const token of tokensToTry) {
    // 1. Try to verify as local JWT
    const localPayload = await verifyLocalJWT(token);
    if (localPayload) {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, localPayload.userId))
          .limit(1);
        if (result[0]) return result[0];
      } catch (error) {
        console.error("[SDK] Failed to fetch user by local JWT:", error);
      }
    }

    // 2. Try to verify as framework session (OAuth)
    const sessionPayload = await verifyFrameworkSession(token);
    if (sessionPayload) {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.openId, sessionPayload.openId))
          .limit(1);
        if (result[0]) return result[0];
      } catch (error) {
        console.error("[SDK] Failed to fetch user by openId:", error);
      }
    }
  }

  return null;
}

// Alias for authenticateRequest matching caller conventions
export const getUserFromRequest = authenticateRequest;
```

```typescript
// --- REPLACE LINES 196-201 IN server/_core/sdk.ts WITH: ---

// Export as default object for compatibility
export const sdk = {
  authenticateRequest,
  getUserFromRequest,
  extractToken,
  extractBearerToken,
  extractSessionCookie,
  createSessionToken,
  exchangeCodeForToken,
  getUserInfo,
};
```

---

## 3. Deep Dive: `server/routers/auth.ts` Analysis

### 3.1 Current Implementation & Exact Line References
- **File Path:** `server/routers/auth.ts`
- **Lines 267–302 (`login` mutation):**
  ```typescript
  267: console.log("[Auth:Login] Step 7 - Generating JWT token for user:", user.id);
  268: const token = await generateLocalAuthToken({
  269:   userId: user.id,
  270:   email: user.email,
  271:   name: user.name || "",
  272:   role: user.role,
  273: });
  274: console.log("[Auth:Login] Step 7 - JWT token generated successfully");
  275: 
  276: const cookieOptions = getSessionCookieOptions(ctx.req);
  277: console.log("[Auth:Login] Step 8 - Setting cookie with options:", cookieOptions);
  278: ctx.res.cookie(COOKIE_NAME, token, {
  279:   ...cookieOptions,
  280:   maxAge: 604800000,
  281: });
  282: console.log("[Auth:Login] Step 8 - Cookie set successfully");
  283: 
  284: await db
  285:   .update(users)
  286:   .set({
  287:     lastSignedIn: new Date(),
  288:   })
  289:   .where(eq(users.id, user.id));
  290: console.log("[Auth:Login] Step 9 - User lastSignedIn updated");
  291: 
  292: console.log("[Auth:Login] SUCCESS - Login completed for:", input.email);
  293: return {
  294:   success: true,
  295:   user: {
  296:     id: user.id,
  297:     email: user.email,
  298:     name: user.name,
  299:     role: user.role,
  300:     language: user.language,
  301:   },
  302: };
  ```

### 3.2 Defects Identified
1. **Missing Token in JSON Body:** Line 268 generates `const token = await generateLocalAuthToken(...)`, and line 278 writes it to cookie. But line 293 only returns `{ success: true, user }`. In WKWebView on iOS, the cookie is not sent in cross-origin requests, and without `token` in the response body, the mobile app cannot store it in `localStorage` for `Authorization: Bearer <token>` headers.
2. **Same Gap in `verifyEmail`:** Lines 486–508 in `server/routers/auth.ts` also generate a token upon successful OTP verification and write it to cookie, but return `{ success: true, user }` without `token`.

### 3.3 Drop-In Replacement for `server/routers/auth.ts` (`login`)

```typescript
// --- REPLACE LINES 292-302 IN server/routers/auth.ts WITH: ---
        console.log("[Auth:Login] SUCCESS - Login completed for:", input.email);
        return {
          success: true,
          token, // <--- Exposed in response body for mobile Bearer authentication
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            language: user.language,
          },
        };
```

And in `verifyEmail` (lines 499–508):
```typescript
// --- REPLACE LINES 499-508 IN server/routers/auth.ts WITH: ---
        return {
          success: true,
          token, // <--- Exposed in response body for mobile OTP verification
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            language: user.language,
          },
        };
```

---

## 4. Analysis of `auth.me` and Protected Procedures

### 4.1 How Context & Authentication Flow Across the Server
1. **tRPC Request Pipeline:**
   When an HTTP request arrives at Express (`server/_core/index.ts` lines 102–108):
   ```typescript
   app.use(
     "/api/trpc",
     createExpressMiddleware({
       router: appRouter,
       createContext,
     })
   );
   ```
2. **Context Creation (`server/_core/context.ts` lines 11–28):**
   ```typescript
   export async function createContext(
     opts: CreateExpressContextOptions
   ): Promise<TrpcContext> {
     let user: User | null = null;
     try {
       user = await sdk.authenticateRequest(opts.req);
     } catch (error) {
       user = null;
     }
     return { req: opts.req, res: opts.res, user };
   }
   ```
3. **Protected Procedures Middleware (`server/_core/trpc.ts` lines 13–28):**
   ```typescript
   const requireUser = t.middleware(async opts => {
     const { ctx, next } = opts;
     if (!ctx.user) {
       throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
     }
     return next({
       ctx: { ...ctx, user: ctx.user },
     });
   });
   export const protectedProcedure = t.procedure.use(requireUser);
   ```

### 4.2 Behavior Consistency Analysis
- **Protected Procedures:** All protected procedures (`student.dashboard`, `student.myCourses`, `student.recordAttendanceViaQr`, `courses.*`, `advisor.*`, etc.) inspect `ctx.user`. Because `ctx.user` is populated by `sdk.authenticateRequest`, updating `sdk.authenticateRequest` guarantees that all protected procedures work seamlessly with Bearer tokens without altering individual procedure definitions.
- **`auth.me` Procedure (`server/routers/auth.ts` lines 138–188):**
  Lines 141–144 check `opts.ctx.user` first:
  ```typescript
  if (opts.ctx.user) {
    console.log("[Auth:Me] Step 2 - User found in context:", opts.ctx.user.email, "role:", opts.ctx.user.role);
    return opts.ctx.user;
  }
  ```
  If `ctx.user` is present, it returns it immediately.
  However, lines 147–156 contain a fallback:
  ```typescript
  const cookies = opts.ctx.req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  if (!cookieMatch || !cookieMatch[1]) {
    return null;
  }
  ```
  If `opts.ctx.user` was null (for example in a test mock where context authentication was bypassed), the fallback only checked cookies.
  To ensure complete consistency, the fallback in `auth.me` must also support Bearer tokens:

```typescript
// --- REPLACE LINES 147-156 IN server/routers/auth.ts WITH: ---
    // If no context user, try to extract token from Bearer header or cookie
    let token: string | null = null;
    const authHeader = opts.ctx.req.headers.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }
    if (!token) {
      const cookies = opts.ctx.req.headers.cookie || "";
      const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
      token = cookieMatch ? cookieMatch[1] : null;
    }

    if (!token) {
      console.log("[Auth:Me] Step 3 - No auth token found (checked Authorization header and cookie", COOKIE_NAME, ")");
      return null;
    }
    console.log("[Auth:Me] Step 3 - Auth token found");

    const jwtClaims = await verifyLocalAuthToken(token);
```

---

## 5. Summary Matrix: Authentication Scenarios

| Client Type | Request Headers | Context `ctx.user` | `auth.me` Output | Protected Procedures |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile App (WKWebView)** | `Authorization: Bearer <valid_jwt>` | User Object | User Object | Allowed (200 OK) |
| **Web Browser (Desktop)** | `Cookie: app_session_id=<valid_jwt>` | User Object | User Object | Allowed (200 OK) |
| **Dual Headers** | `Authorization: Bearer <valid>` + `Cookie: ...` | User Object (Bearer prioritized) | User Object | Allowed (200 OK) |
| **Unauthenticated** | None | `null` | `null` | 401 UNAUTHORIZED |
| **Invalid Bearer Token** | `Authorization: Bearer invalid.jwt` | `null` | `null` | 401 UNAUTHORIZED |
| **Expired Bearer Token** | `Authorization: Bearer expired.jwt` | `null` | `null` | 401 UNAUTHORIZED |

---

## 6. Verification Strategy & Test Blueprint for Worker M1

### 6.1 Unit Test Expansion: `server/_core/sdk.test.ts`
Worker M1 should add the following tests to `server/_core/sdk.test.ts`:

```typescript
import { generateLocalAuthToken } from "./authSecurity";

describe("Bearer Token Authentication", () => {
  it("should extract Bearer token from authorization header", async () => {
    const req = {
      headers: {
        authorization: "Bearer test-token-123",
      },
    } as Request;

    const token = sdk.extractToken(req);
    expect(token).toBe("test-token-123");
  });

  it("should extract Bearer token case-insensitively", async () => {
    const req = {
      headers: {
        authorization: "bearer test-token-lowercase",
      },
    } as Request;

    const token = sdk.extractToken(req);
    expect(token).toBe("test-token-lowercase");
  });

  it("should prioritize Bearer header over cookie", async () => {
    const req = {
      headers: {
        authorization: "Bearer bearer-priority-token",
        cookie: "app_session_id=cookie-token",
      },
    } as Request;

    const token = sdk.extractToken(req);
    expect(token).toBe("bearer-priority-token");
  });

  it("should fall back to cookie when authorization header is absent", async () => {
    const req = {
      headers: {
        cookie: "app_session_id=fallback-cookie-token",
      },
    } as Request;

    const token = sdk.extractToken(req);
    expect(token).toBe("fallback-cookie-token");
  });

  it("should return null when Bearer token is malformed", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalid.jwt.string",
      },
    } as Request;

    const user = await sdk.authenticateRequest(req);
    expect(user).toBeNull();
  });
});
```

### 6.2 Router Test Expansion: `server/routers/auth.test.ts`
Worker M1 should add tests verifying that `auth.me` resolves when given an `authorization` header:

```typescript
it("should return user data when authenticated via Bearer token in headers", async () => {
  const token = await generateLocalAuthToken({
    userId: 1,
    email: "khaled.haddad@zuj.edu.jo",
    name: "Khaled Haddad",
    role: "student",
  });

  const ctx: TrpcContext = {
    user: null, // Test fallback extraction in procedure
    req: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as any,
    res: { setHeader: vi.fn(), clearCookie: vi.fn() } as any,
  };

  const caller = appRouter.createCaller(ctx);
  const result = await caller.auth.me();
  expect(result).not.toBeNull();
  expect(result?.email).toBe("khaled.haddad@zuj.edu.jo");
});
```

### 6.3 Automated End-to-End Test Script (Node.js)
Worker M1 can run this verification script against the live server:

```javascript
// verify-dual-auth.mjs
const BASE_URL = "http://127.0.0.1:3000/api/trpc";

async function verifyDualAuth() {
  console.log("1. Testing auth.login to verify token in JSON payload...");
  const loginRes = await fetch(`${BASE_URL}/auth.login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      json: { email: "khaled.haddad@zuj.edu.jo", password: "password123" }
    }),
  });
  const loginJson = await loginRes.json();
  const data = loginJson?.result?.data?.json ?? loginJson?.result?.data;
  
  if (!data?.token) {
    throw new Error("FAILED: token was not returned in auth.login response payload!");
  }
  console.log("✅ SUCCESS: auth.login returned token:", data.token.slice(0, 25) + "...");

  const token = data.token;

  console.log("2. Testing auth.me with Bearer token (no cookies)...");
  const meRes = await fetch(`${BASE_URL}/auth.me`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const meJson = await meRes.json();
  const meData = meJson?.result?.data?.json ?? meJson?.result?.data;
  if (!meData?.id || meData.email !== "khaled.haddad@zuj.edu.jo") {
    throw new Error(`FAILED: auth.me failed with Bearer token: ${JSON.stringify(meJson)}`);
  }
  console.log("✅ SUCCESS: auth.me succeeded with Bearer token for:", meData.name);

  console.log("3. Testing protected procedure student.myCourses with Bearer token...");
  const coursesRes = await fetch(`${BASE_URL}/student.myCourses`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!coursesRes.ok) {
    throw new Error(`FAILED: student.myCourses rejected Bearer token HTTP ${coursesRes.status}`);
  }
  console.log("✅ SUCCESS: student.myCourses accepted Bearer token (HTTP 200)");

  console.log("4. Testing protected procedure student.myCourses without token (expect 401)...");
  const anonRes = await fetch(`${BASE_URL}/student.myCourses`);
  if (anonRes.ok) {
    throw new Error("FAILED: protected procedure allowed unauthenticated request!");
  }
  console.log("✅ SUCCESS: protected procedure rejected unauthenticated request (HTTP 401)");

  console.log("🎉 ALL DUAL-AUTH VERIFICATION CHECKS PASSED!");
}

verifyDualAuth().catch(console.error);
```
