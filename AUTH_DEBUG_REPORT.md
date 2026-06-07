# Authentication Session Loss - Deep Technical Analysis & Fix Report

## Executive Summary

**Issue:** Users are unexpectedly redirected to login during scrolling/navigation despite being authenticated.

**Root Cause:** Session cookie payload mismatch between local JWT authentication and framework session verification.

**Impact:** Critical - Authentication state is lost on any protected query after initial login.

**Severity:** P1 - Production-blocking

---

## Part 1: Root Cause Analysis

### 1.1 The Core Problem

The application has **two incompatible session systems**:

#### System A: Local JWT Authentication (`server/routers/auth.ts`)

```typescript
// Lines 75-78: Creates JWT and writes to app_session_id cookie
const token = generateJWT({ userId, email, name, role });
res.cookie("app_session_id", token, cookieOptions);
```

**JWT Format:**

```json
{
  "userId": 123,
  "email": "user@example.com",
  "name": "Suha",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234571490
}
```

#### System B: Framework Session Handler (`server/_core/sdk.ts`)

```typescript
// Lines 21-25: Expected session payload
type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

// Lines 200-233: Verifies session cookie
export async function verifySession(token: string): Promise<SessionPayload> {
  // Expects { openId, appId, name } format
  // Uses ENV.cookieSecret to verify
}
```

**Framework Expected Format:**

```json
{
  "openId": "oauth-id-123",
  "appId": "app-id-456",
  "name": "Suha"
}
```

### 1.2 Why Session Loss Occurs

**Timeline of Events:**

1. **User Logs In**
   - `POST /api/trpc/auth.login` called
   - Backend generates JWT with `{ userId, email, name, role }`
   - JWT written to `app_session_id` cookie
   - Frontend stores user data in localStorage
   - User sees authenticated UI ✅

2. **User Scrolls/Navigates**
   - React re-renders
   - `StudentDashboard` calls `trpc.courses.getStudentCourses.useQuery()`
   - Request includes `app_session_id` cookie
   - Backend's `createContext` calls `authenticateRequest(req)`
   - `authenticateRequest` tries to verify cookie with `verifySession()`
   - **Cookie verification FAILS** - JWT format ≠ expected format
   - `ctx.user = null` (falls back to anonymous)
   - Protected procedure throws `UNAUTHORIZED`
   - Frontend's `redirectToLoginIfUnauthorized()` triggers
   - User redirected to login ❌

3. **Redirect Loop**
   - User is back at login page
   - But localStorage still has user data
   - User logs in again
   - Same cycle repeats

### 1.3 Why It Happens on Scrolling/Navigation

**Trigger Points:**

1. **Protected Query Calls**
   - `StudentDashboard` calls multiple protected queries:
     - `trpc.courses.getStudentCourses.useQuery()`
     - `trpc.courses.getRecommendations.useQuery()`
     - `trpc.notifications.list.useQuery()`
   - Each query includes the cookie
   - Each query fails verification

2. **React Re-renders**
   - Scrolling triggers component re-renders
   - Re-renders call `useEffect` hooks
   - Hooks trigger query refetches
   - Queries fail, redirect fires

3. **Query Cache Updates**
   - `main.tsx` subscribes to query cache errors
   - Any UNAUTHORIZED error triggers redirect
   - Redirect happens immediately, no debouncing

---

## Part 2: Detailed Diagnosis Procedure

### 2.1 Browser DevTools Investigation

**Step 1: Check Application Storage**

```
DevTools → Application Tab → Storage
1. Cookies → app_session_id
   - Verify cookie exists
   - Check if it's a JWT (has 3 dot-separated parts)
   - Note the expiration time

2. Local Storage → Look for:
   - user (should contain { id, name, email, role })
   - token (should contain JWT)
   - userRole (should match user.role)
   - userName (should match user.name)
```

**Step 2: Check Network Tab**

```
1. Filter by XHR/Fetch
2. Look for /api/trpc requests
3. For each request:
   - Check Request Headers → Cookie header
   - Verify app_session_id is present
   - Check Response Status
   - If 401/403, look at error message
```

**Step 3: Check Console Errors**

```
Look for patterns:
- "[API Query Error] TRPCClientError: UNAUTHORIZED"
- "Error 1: [API Query Error] UNAUTHORIZED"
- Timing: Does it appear after scrolling?
```

### 2.2 Server-Side Debugging

**Check Auth Logs:**

```bash
# Look for session verification failures
grep -i "session\|verify\|unauthorized" /home/ubuntu/murshid/.manus-logs/devserver.log

# Look for cookie parsing issues
grep -i "cookie\|jwt\|token" /home/ubuntu/murshid/.manus-logs/devserver.log
```

**Add Debug Logging to `authenticateRequest`:**

```typescript
// In server/_core/sdk.ts
console.log("[AUTH DEBUG]", {
  cookieValue: opts.req.headers.cookie,
  sessionCookie: extractSessionCookie(opts.req),
  verifyAttempt: "starting",
});
```

### 2.3 Cookie Inspection

**What to Check:**

1. Cookie name: Should be `app_session_id` ✓
2. Cookie value: Should be JWT (3 parts separated by dots) ✓
3. Cookie domain: Should match current domain ✓
4. Cookie path: Should be `/` ✓
5. Cookie SameSite: Should be `none` ✓
6. Cookie Secure: Should be `true` ✓
7. Cookie HttpOnly: Should be `true` ✓
8. Cookie expiration: Should be future timestamp ✓

---

## Part 3: Comprehensive Fix Implementation

### 3.1 Solution Architecture

**Option A: Use Framework Session System (Recommended)**

- Remove local JWT generation
- Use framework's `signSession()` to create proper session cookies
- Align with framework's `SessionPayload` format

**Option B: Create JWT Verification in Protected Procedures**

- Keep local JWT generation
- Add JWT verification middleware
- Bypass framework session verification for local auth

**Recommendation:** Option A - Simpler, more maintainable

### 3.2 Implementation Steps

#### Step 1: Fix Login Endpoint

```typescript
// OLD (BROKEN):
const token = generateJWT({ userId, email, name, role });
res.cookie("app_session_id", token, cookieOptions);

// NEW (FIXED):
const sessionToken = await signSession({
  openId: user.openId,
  appId: ENV.appId,
  name: user.name,
});
res.cookie("app_session_id", sessionToken, cookieOptions);

// Store JWT in database for later retrieval
await db
  .update(users)
  .set({
    jwtToken: generateJWT({ userId, email, name, role }),
  })
  .where(eq(users.id, user.id));
```

#### Step 2: Fix Protected Procedures

```typescript
// Add JWT extraction from context
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
```

#### Step 3: Fix Frontend Auth State

```typescript
// Ensure useAuth always checks server state first
const meQuery = trpc.auth.me.useQuery(undefined, {
  retry: 1, // Retry once on failure
  refetchOnWindowFocus: true, // Re-validate on window focus
  staleTime: 5 * 60 * 1000, // 5 minute cache
});
```

#### Step 4: Add Session Refresh Logic

```typescript
// Auto-refresh session before expiration
useEffect(() => {
  const interval = setInterval(
    () => {
      meQuery.refetch();
    },
    4 * 60 * 1000
  ); // Every 4 minutes (before 5 min expiry)

  return () => clearInterval(interval);
}, [meQuery]);
```

---

## Part 4: Error Messages & Diagnostics

### 4.1 Expected Error Messages

| Error                             | Cause                                 | Solution                     |
| --------------------------------- | ------------------------------------- | ---------------------------- |
| `TRPCClientError: UNAUTHORIZED`   | Session cookie invalid or expired     | Re-login                     |
| `Error: Invalid or expired token` | JWT verification failed               | Check token format           |
| `Error: Session not found`        | Cookie missing or corrupted           | Check cookie settings        |
| `Error: User not found`           | User deleted or session stale         | Clear localStorage, re-login |
| `Redirect to /login`              | Protected route accessed without auth | Check auth state             |

### 4.2 Diagnostic Checklist

- [ ] Cookie `app_session_id` exists in DevTools
- [ ] Cookie value is a valid JWT (3 dot-separated parts)
- [ ] Cookie is sent with every API request (Network tab)
- [ ] Cookie expiration is in the future
- [ ] localStorage contains `user` object
- [ ] localStorage contains `token` JWT
- [ ] No console errors about "UNAUTHORIZED"
- [ ] Protected queries return data (not 401)
- [ ] Scrolling doesn't trigger redirects
- [ ] Navigation between pages maintains auth state

---

## Part 5: Prevention & Best Practices

### 5.1 Session Management Best Practices

1. **Single Source of Truth**
   - Server session is authoritative
   - localStorage is cache only
   - Never trust frontend-only auth state

2. **Proper Cookie Configuration**

   ```typescript
   const cookieOptions = {
     httpOnly: true, // Prevent XSS access
     secure: true, // HTTPS only
     sameSite: "none", // Cross-site requests
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     path: "/",
   };
   ```

3. **Session Refresh Strategy**
   - Refresh before expiration (not after)
   - Use exponential backoff for retries
   - Clear localStorage on logout

4. **Error Handling**
   - Catch UNAUTHORIZED errors globally
   - Redirect to login (not external OAuth)
   - Show user-friendly error messages

### 5.2 Testing Strategy

```typescript
// Test 1: Session persists across page reloads
test("session persists after page reload", async () => {
  await login("user@test.com", "password");
  await page.reload();
  expect(await page.url()).toContain("/dashboard");
});

// Test 2: Session survives scrolling
test("session survives scrolling", async () => {
  await login("user@test.com", "password");
  await page.evaluate(() => window.scrollBy(0, 1000));
  expect(await page.url()).toContain("/dashboard");
});

// Test 3: Protected queries work
test("protected queries return data", async () => {
  await login("user@test.com", "password");
  const courses = await page.evaluate(() =>
    fetch("/api/trpc/courses.getStudentCourses").then(r => r.json())
  );
  expect(courses.result.data).toBeDefined();
});
```

---

## Part 6: Implementation Checklist

- [ ] Fix login endpoint to use framework session
- [ ] Fix register endpoint to use framework session
- [ ] Update useAuth hook to refetch on window focus
- [ ] Add session refresh interval
- [ ] Update protected procedures to verify user
- [ ] Add comprehensive error handling
- [ ] Test login flow
- [ ] Test scrolling behavior
- [ ] Test navigation between pages
- [ ] Test logout and re-login
- [ ] Test token expiration
- [ ] Test cross-tab session sync
- [ ] Document session management
- [ ] Add monitoring/logging

---

## Conclusion

The session loss issue is caused by a fundamental mismatch between the local JWT authentication system and the framework's session verification. The fix requires aligning both systems to use the same session format and verification logic.

**Expected Outcome After Fix:**

- ✅ Users stay logged in during scrolling
- ✅ Navigation between pages maintains auth state
- ✅ Protected queries work reliably
- ✅ Session persists across page reloads
- ✅ Logout clears all session data
- ✅ Token refresh happens automatically
