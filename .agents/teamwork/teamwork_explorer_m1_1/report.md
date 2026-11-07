# Milestone 1: Backend CORS, CSP & Network Readiness Report

**Investigator:** Explorer M1-1 (Backend CORS Specialist)  
**Date:** 2026-11-07  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_1`  
**Target File Under Investigation:** `server/_core/index.ts` (and related `server/_core/sdk.ts`, `server/routers/auth.ts`, `server/_core/rateLimiter.ts`)  
**Target Network Endpoints:** `http://172.20.10.4:3000`, `http://172.20.10.*`, `capacitor://localhost`

---

## 1. Executive Summary

A comprehensive investigation of `server/_core/index.ts` and the server middleware stack was performed to resolve cross-origin connectivity issues between native iOS Capacitor (`capacitor://localhost`), local hotspot devices (`http://172.20.10.*`), and the Express/tRPC backend.

### Primary Discoveries:
1. **Total Absence of CORS Headers**:
   - `server/_core/index.ts` contains **zero** CORS middleware.
   - Any HTTP request with `Origin: capacitor://localhost` or `Origin: http://172.20.10.*` receives responses completely lacking `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials`.
   - Apple WebKit inside iOS Capacitor WKWebView strictly enforces CORS and drops all responses where CORS headers are absent.
2. **Missing `OPTIONS` Preflight Termination**:
   - Browser and WKWebView clients send an HTTP `OPTIONS` preflight before any `POST` request with custom headers (such as `Content-Type: application/json`, `Authorization: Bearer <token>`, or `x-trpc-source: client`).
   - In `server/_core/index.ts`, `OPTIONS` requests fall through to `app.use("/api/trpc", createExpressMiddleware(...))` (line 103), which returns an unhandled route error or 404 without CORS headers.
   - Additionally, rate limiters at lines 76-81 (`authRateLimiter` and `generalRateLimiter`) intercept `/api/trpc` and do **not** exempt `OPTIONS` requests, causing preflight requests to increment rate limit counters.
3. **CSP `connect-src` Blocking Cleartext HTTP and Custom Schemes**:
   - In `server/_core/index.ts` line 38, `connect-src` is defined strictly as:
     ```text
     connect-src 'self' https:;
     ```
   - Cleartext HTTP (`http:`), Capacitor (`capacitor:`), Ionic (`ionic:`), and WebSockets (`ws:`, `wss:`) are omitted. When loading web previews (`/phone`, `/preview`) or connecting to local IP servers, the browser blocks all network requests.
4. **Dual-Auth Protocol Alignment**:
   - `server/_core/sdk.ts` line 36 only inspects `req.headers.cookie`. WKWebView ITP drops cross-origin cookies.
   - `server/routers/auth.ts` lines 293-302 omit the JWT `token` from the `auth.login` JSON response payload.
   - Supporting `Authorization: Bearer <token>` in `sdk.ts` and returning `token` from `auth.login` establishes a robust dual-auth system (browser cookies + native Bearer tokens).

---

## 2. Codebase Line-by-Line Audit (`server/_core/index.ts`)

| Line(s) | Current Code / Behavior | Identified Issue / Risk | Required Change |
|---|---|---|---|
| **Lines 28–40** | `res.setHeader("Content-Security-Policy", ...)` | CSP `connect-src` only allows `'self' https:`. Blocks `http://172.20.10.4:3000`, `capacitor://localhost`, and `ws:`. | Update `connect-src` to include `http: capacitor: ionic: ws: wss:`. Also update `img-src` to allow `http:` and `capacitor:`. |
| **Lines 28–69** | Security headers middleware block | Zero CORS headers are defined. | Insert CORS middleware handling `Origin` reflection, credentials, headers, and methods. |
| **Lines 70–74** | `app.use(express.json(...))` & `urlencoded` | JSON body parser runs on every incoming request, including OPTIONS preflights. | Place CORS & preflight OPTIONS short-circuit before body parser and rate limiters. |
| **Lines 76–81** | `authRateLimiter`, `generalRateLimiter` | `createRateLimiter` in `rateLimiter.ts` does not check for HTTP method. Preflight `OPTIONS` requests increment IP rate counters. | Terminating `OPTIONS` with `204` prior to line 76 prevents preflight pollution of rate limit counters. |
| **Lines 102–108**| `createExpressMiddleware({ router: appRouter, createContext })` | tRPC adapter receives unhandled `OPTIONS` calls, returning 404/405 without CORS headers, causing WebKit to abort network requests. | Handled upstream by preflight short-circuit. |

---

## 3. iOS Capacitor & Local Network Origin Specifications

### 3.1 Target Origins
When the iOS app runs on a physical device (iPhone XS / iPhone XS Max) or simulator, requests originate from:
1. **`capacitor://localhost`**: Default origin for iOS Capacitor 6.2 inside WKWebView.
2. **`ionic://localhost`**: Capacitor/Ionic fallback scheme.
3. **`http://localhost` / `http://localhost:*`**: Local dev web preview, desktop simulator, Vite dev server.
4. **`http://127.0.0.1` / `http://127.0.0.1:*`**: Local IPv4 loopback.
5. **`http://172.20.10.*`**: Personal Hotspot subnet (default iPhone hotspot DHCP pool, e.g. `http://172.20.10.4:3000`, `http://172.20.10.3:3000`).
6. **RFC 1918 Private Ranges**:
   - `172.16.0.0/12` (`172.16.0.0` - `172.31.255.255`)
   - `192.168.0.0/16` (`192.168.0.0` - `192.168.255.255`)
   - `10.0.0.0/8` (`10.0.0.0` - `10.255.255.255`)
7. **Development Permissiveness**:
   - When `process.env.NODE_ENV !== "production"`, any requesting origin should be accepted and reflected to ensure seamless zero-friction local network debugging across varying Wi-Fi routers, hotspots, and Mac/PC host IPs.
8. **Null / Undefined Origin**:
   - Requests without an `Origin` header (e.g., standard curl, server-to-server health checks, direct browser navigation) must proceed normally through the middleware chain without errors.

### 3.2 Origin Matching Logic
```typescript
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Non-browser / curl / same-origin requests

  if (origin === "capacitor://localhost" || origin === "ionic://localhost") {
    return true;
  }

  // Localhost & loopback
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;

  // RFC 1918 Private networks (including iOS Hotspot 172.20.10.*)
  if (/^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return true;

  // Development mode: permit all origins for local Wi-Fi / Hotspot convenience
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}
```

### 3.3 Required CORS Headers
| Header | Value | Purpose |
|---|---|---|
| `Access-Control-Allow-Origin` | `<request origin>` (reflected) | Required by CORS specification when credentials are enabled. Wildcard `*` is prohibited when `Access-Control-Allow-Credentials: true`. |
| `Access-Control-Allow-Credentials` | `"true"` | Permits sending session cookies and Authorization headers from WKWebView. |
| `Access-Control-Allow-Methods` | `"GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"` | Permits all HTTP verbs utilized by tRPC queries (GET), mutations (POST), and storage proxies. |
| `Access-Control-Allow-Headers` | `"Content-Type, Authorization, x-trpc-source, Accept, Origin, X-Requested-With, Cookie"` | Allows custom headers sent by tRPC SuperJSON wire protocol (`Content-Type`, `x-trpc-source`) and Bearer auth (`Authorization`). |
| `Access-Control-Expose-Headers` | `"Set-Cookie, Authorization, Content-Disposition, X-RateLimit-Limit, X-RateLimit-Remaining"` | Exposes rate limit information and auth tokens to client JavaScript. |
| `Access-Control-Max-Age` | `"86400"` | Caches preflight OPTIONS verification for 24 hours, eliminating preflight network round-trip overhead on mobile. |
| `Vary` | `"Origin"` | Instructs intermediate proxies and browser caches not to reuse responses across different origins. |

### 3.4 Preflight OPTIONS Short-Circuit
When `req.method === "OPTIONS"`:
```typescript
if (req.method === "OPTIONS") {
  res.status(204).end();
  return;
}
```
- Returns HTTP 204 No Content immediately.
- Never invokes `next()`, shielding body parsers, authentication, rate limiters, and tRPC routers from preflight overhead.

---

## 4. Drop-in Implementation Blueprint for Worker M1

Worker M1 can implement this either as a modular middleware (`server/_core/cors.ts`) or directly inline in `server/_core/index.ts`. A modular middleware is recommended for clean code organization and ease of unit testing.

### 4.1 Modular CORS Middleware (`server/_core/cors.ts`)
Create `server/_core/cors.ts`:

```typescript
import type { Request, Response, NextFunction } from "express";

/**
 * Validates whether an origin is allowed for cross-origin requests.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Direct non-browser requests

  if (origin === "capacitor://localhost" || origin === "ionic://localhost") {
    return true;
  }

  // Localhost & 127.0.0.1
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;

  // RFC 1918 Private networks (including iOS Hotspot 172.20.10.*)
  if (/^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return true;

  // Permissive in non-production environments to avoid blocking mobile debugging
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}

/**
 * Express middleware for CORS and preflight OPTIONS handling.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-trpc-source, Accept, Origin, X-Requested-With, Cookie"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Set-Cookie, Authorization, Content-Disposition, X-RateLimit-Limit, X-RateLimit-Remaining"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Vary", "Origin");
  }

  // Immediately respond to preflight OPTIONS requests with 204
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
```

### 4.2 Updates to `server/_core/index.ts`
Apply the following edits in `server/_core/index.ts`:

1. **Import CORS middleware**:
   ```typescript
   import { corsMiddleware } from "./cors";
   ```

2. **Mount CORS middleware immediately after proxy configuration (Line 27)**:
   ```typescript
   app.set("trust proxy", 1);

   // Enable CORS for iOS Capacitor and local network origins
   app.use(corsMiddleware);
   ```

3. **Update CSP in Security Headers Middleware (Lines 31–40)**:
   ```typescript
   // Content Security Policy
   res.setHeader(
     "Content-Security-Policy",
     "default-src 'self'; " +
       "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net; " +
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
       "img-src 'self' data: https: http: blob: capacitor: ionic:; " +
       "font-src 'self' data: https://fonts.gstatic.com; " +
       "connect-src 'self' https: http: capacitor: ionic: ws: wss:; " +
       "frame-ancestors 'none';"
   );
   ```

---

## 5. Dual-Mode Authentication Readiness Details

To complete Milestone 1's "Backend Network & Dual-Auth Readiness" scope:

### 5.1 `server/_core/sdk.ts` (Bearer Token Support)
In `server/_core/sdk.ts`, update `authenticateRequest` and extract token helper:
```typescript
// Extract session token from Bearer header or cookie
function extractToken(req: Request): string | null {
  // 1. Check Authorization: Bearer <token> (Primary for iOS Capacitor / WebKit ITP)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // 2. Fall back to cookie (for standard browser sessions)
  const cookies = req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  return cookieMatch ? cookieMatch[1] : null;
}

// In authenticateRequest(req: Request):
async function authenticateRequest(req: Request): Promise<User | null> {
  const token = extractToken(req);
  if (!token) {
    return null;
  }
  // (Rest of local JWT and framework verification proceeds with the extracted token)
  ...
```

### 5.2 `server/routers/auth.ts` (Return Token on Login)
In `server/routers/auth.ts`, update `login` mutation return statement (lines 293–302):
```typescript
return {
  success: true,
  token, // <--- Return JWT token for client-side localStorage persistence
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
  },
};
```
And in `me` query (lines 147–155), support Bearer token fallback if context user is null:
```typescript
let token: string | null = null;
const authHeader = opts.ctx.req.headers.authorization;
if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
  token = authHeader.substring(7).trim();
} else {
  const cookies = opts.ctx.req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  token = cookieMatch ? cookieMatch[1] : null;
}

if (!token) {
  return null;
}
```

---

## 6. Independent Verification Strategy for Worker M1

Worker M1 can verify the implementation using three independent layers:

### Layer 1: Dedicated Unit Test (`server/_core/cors.test.ts`)
Run via `npx vitest run server/_core/cors.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { isAllowedOrigin, corsMiddleware } from "./cors";
import type { Request, Response } from "express";

describe("CORS Origin Validation", () => {
  it("allows Capacitor iOS origin", () => {
    expect(isAllowedOrigin("capacitor://localhost")).toBe(true);
    expect(isAllowedOrigin("ionic://localhost")).toBe(true);
  });

  it("allows localhost and 127.0.0.1", () => {
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:3000")).toBe(true);
  });

  it("allows iOS Hotspot 172.20.10.x subnet", () => {
    expect(isAllowedOrigin("http://172.20.10.4:3000")).toBe(true);
    expect(isAllowedOrigin("http://172.20.10.3:3000")).toBe(true);
  });

  it("handles empty origin gracefully", () => {
    expect(isAllowedOrigin(undefined)).toBe(true);
  });
});

describe("CORS Middleware", () => {
  it("short-circuits OPTIONS requests with 204 and CORS headers", () => {
    const headers: Record<string, string> = {};
    let statusSet = 0;
    let ended = false;
    let nextCalled = false;

    const req = {
      method: "OPTIONS",
      headers: { origin: "capacitor://localhost" },
    } as unknown as Request;

    const res = {
      setHeader(name: string, val: string) {
        headers[name.toLowerCase()] = val;
      },
      status(code: number) {
        statusSet = code;
        return this;
      },
      end() {
        ended = true;
      },
    } as unknown as Response;

    corsMiddleware(req, res, () => { nextCalled = true; });

    expect(statusSet).toBe(204);
    expect(ended).toBe(true);
    expect(nextCalled).toBe(false);
    expect(headers["access-control-allow-origin"]).toBe("capacitor://localhost");
    expect(headers["access-control-allow-credentials"]).toBe("true");
    expect(headers["access-control-allow-methods"]).toContain("OPTIONS");
    expect(headers["access-control-allow-headers"]).toContain("Authorization");
    expect(headers["access-control-allow-headers"]).toContain("x-trpc-source");
  });
});
```

### Layer 2: Live HTTP / Curl Invocations
With the server running (`npm run dev` or test server):
1. **Preflight OPTIONS Check**:
   ```bash
   curl -i -X OPTIONS http://localhost:3000/api/trpc/auth.login \
     -H "Origin: capacitor://localhost" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization, x-trpc-source"
   ```
   **Pass Condition**: `HTTP/1.1 204 No Content`, `Access-Control-Allow-Origin: capacitor://localhost`, `Access-Control-Allow-Credentials: true`.

2. **Hotspot Subnet Preflight Check**:
   ```bash
   curl -i -X OPTIONS http://localhost:3000/api/trpc/aiChat.getStatus \
     -H "Origin: http://172.20.10.4:3000" \
     -H "Access-Control-Request-Method: GET"
   ```
   **Pass Condition**: `HTTP/1.1 204 No Content`, `Access-Control-Allow-Origin: http://172.20.10.4:3000`.

3. **CSP Inspection Check**:
   ```bash
   curl -i http://localhost:3000/preview
   ```
   **Pass Condition**: `content-security-policy` contains `connect-src 'self' https: http: capacitor: ionic: ws: wss:;` and `img-src 'self' data: https: http: blob: capacitor: ionic:;`.

4. **Dual-Auth Bearer Token Check**:
   ```bash
   # 1. Login with password
   TOKEN=$(curl -s -X POST http://localhost:3000/api/trpc/auth.login \
     -H "Content-Type: application/json" \
     -d '{"json":{"email":"khaled.haddad@zuj.edu.jo","password":"password123"}}' | \
     node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(0)); console.log(d.result.data.json.token);')

   # 2. Query auth.me with Bearer token (no cookies)
   curl -s http://localhost:3000/api/trpc/auth.me \
     -H "Authorization: Bearer $TOKEN"
   ```
   **Pass Condition**: Response contains user profile object `{ id, email: "khaled.haddad@zuj.edu.jo", ... }`.

### Layer 3: TypeScript Typecheck & Regression Suite
- `npm run check` (`tsc --noEmit`): Must exit with code 0.
- `npx vitest run`: All existing test files (`server/_core/sdk.test.ts`, `server/routers/auth.test.ts`, etc.) must pass.
