# CORS Strictness Investigation & Remediation Report

**Investigator**: Explorer M1-R2-2 (CORS Strictness Specialist)  
**Date**: 2026-11-07  
**Target Milestone**: Milestone 1 Remediation (Backend Network & Dual-Auth Readiness)  
**Primary Files**:
- `server/_core/cors.ts` (lines 8–35)
- `server/_core/cors.test.ts` (lines 55–58, 234–252)
- `tests/e2e/ios/tier2-boundary-corner.test.mjs` (test `T2.4.1`, lines 137–151)

---

## 1. Executive Summary

Reviewer 1 flagged an insecure development shortcut in `server/_core/cors.ts` lines 24–27 where:
```typescript
if (process.env.NODE_ENV !== "production") {
  return true;
}
```
This shortcut allowed arbitrary external origins (such as `http://evil-attacker-site.com`) whenever `NODE_ENV !== "production"`. When `tests/e2e/ios/run-ios-e2e.mjs --tier=2` ran, `corsMiddleware` returned `Access-Control-Allow-Origin: http://evil-attacker-site.com` and `Access-Control-Allow-Credentials: true`, directly causing E2E test `T2.4.1` to fail.

The shortcut is both dangerous and completely unnecessary: `isAllowedOrigin` already possesses comprehensive regex coverage for all valid Capacitor and local development environments, including:
1. `capacitor://localhost` and `ionic://localhost` (iOS native webview)
2. `http://localhost(:\d+)?` and `https://localhost(:\d+)?` (local browser dev)
3. `http://127.0.0.1(:\d+)?` and `https://127.0.0.1(:\d+)?` (loopback)
4. RFC 1918 private IP subnets across all ports:
   - `172.16.0.0/12` (covers iOS Personal Hotspot `172.20.10.4:3000` and all `172.16–31.*.*`)
   - `192.168.0.0/16` (home and office local Wi-Fi)
   - `10.0.0.0/8` (university and enterprise campus networks)

By completely deleting lines 24–27 and updating `server/_core/cors.test.ts` to assert strict rejection of external/attacker domains regardless of `NODE_ENV`, `T2.4.1` passes without compromising local iOS development, Wi-Fi testing, or mobile hotspot communication.

---

## 2. Root Cause Analysis

### 2.1 The Vulnerability Mechanism
In `server/_core/cors.ts`:
```typescript
// Line 8:
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Direct non-browser requests / same-origin

  if (origin === "capacitor://localhost" || origin === "ionic://localhost") {
    return true;
  }

  // Localhost & 127.0.0.1 (any port)
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;

  // RFC 1918 Private networks (including iOS Hotspot 172.20.10.*)
  if (/^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return true;

  // In non-production environments, permit any origin for local Wi-Fi / Hotspot debugging
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}
```

In `corsMiddleware` (lines 39–41):
```typescript
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    ...
```

### 2.2 E2E Failure in `T2.4.1`
In `tests/e2e/ios/tier2-boundary-corner.test.mjs` (lines 137–151):
```javascript
  await suite.test("T2.4.1: Preflight request from non-whitelisted external origin (evil.com) does not grant CORS access", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        Origin: "http://evil-attacker-site.com",
        "Access-Control-Request-Method": "GET",
      },
    });
    const allowOrigin = res.headers.get("access-control-allow-origin");
    // Should NOT reflect evil-attacker-site.com
    assert(
      allowOrigin !== "http://evil-attacker-site.com",
      "CORS should not grant access to unwhitelisted external domain"
    );
  });
```
When running the E2E test runner, `process.env.NODE_ENV` defaults to `undefined` or `"development"`. The check `if (process.env.NODE_ENV !== "production")` evaluates to `true`, causing `res.setHeader("Access-Control-Allow-Origin", "http://evil-attacker-site.com")` and `Access-Control-Allow-Credentials: true` to be sent. The assertion fails immediately with:
`[FAIL] T2.4.1: Preflight request from non-whitelisted external origin (evil.com) does not grant CORS access -> CORS should not grant access to unwhitelisted external domain`

### 2.3 Lax Unit Test Masking
In `server/_core/cors.test.ts` lines 55–58:
```typescript
      it("allows any origin in development mode for debugging flexibility", () => {
        expect(isAllowedOrigin("https://any-dev-preview.ngrok-free.app")).toBe(true);
        expect(isAllowedOrigin("https://custom-domain.local:3000")).toBe(true);
      });
```
This unit test encoded the permissive bypass as expected behavior, preventing the unit test suite from catching the vulnerability.

---

## 3. Origin Whitelist Specification & Mathematical Evaluation

| Origin Pattern | Regex / Condition | Classification | Allowed? | Rationale |
|---|---|---|---|---|
| Direct cURL / Same-Origin | `!origin` (undefined or `""`) | Direct / Same-Origin | **YES** | Native non-browser requests or same-origin do not specify `Origin`. Handled safely in `corsMiddleware` because `origin && isAllowedOrigin(origin)` evaluates to falsy. |
| Capacitor iOS | `origin === "capacitor://localhost"` | Native App Scheme | **YES** | Mandatory origin for Capacitor 6 WKWebView on iOS hardware. |
| Ionic Fallback | `origin === "ionic://localhost"` | Native App Scheme | **YES** | Ionic webview scheme fallback. |
| Localhost | `/^https?:\/\/localhost(:\d+)?$/` | Local dev | **YES** | Localhost with or without port (e.g. `http://localhost`, `http://localhost:3000`, `https://localhost:5173`). |
| Loopback IPv4 | `/^https?:\/\/127\.0\.0\.1(:\d+)?$/` | Loopback IP | **YES** | Standard loopback IP with any port. |
| RFC 1918 Class B (`172.16.0.0/12`) | `/^https?:\/\/172\.(1[6-9]\|2\d\|3[01])\.\d+\.\d+(:\d+)?$/` | Private Subnet | **YES** | Accurately matches 172.16.0.0 to 172.31.255.255 across any port. Fully covers iOS Personal Hotspot (`http://172.20.10.4:3000`). |
| RFC 1918 Class C (`192.168.0.0/16`) | `/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/` | Private Subnet | **YES** | Accurately matches 192.168.0.0 to 192.168.255.255 across any port (home/office Wi-Fi networks). |
| RFC 1918 Class A (`10.0.0.0/8`) | `/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/` | Private Subnet | **YES** | Accurately matches 10.0.0.0 to 10.255.255.255 across any port (university campus networks). |
| Out-of-Range 172 IPs | e.g. `http://172.32.0.1:3000`, `http://172.15.0.1` | Public IP | **NO** | `1[6-9]|2\d|3[01]` correctly rejects 15 and 32+. |
| Arbitrary Public Domains | e.g. `http://evil.com`, `http://evil-attacker-site.com`, `https://attacker.example.com` | Untrusted | **NO** | Returns `false`. No CORS headers reflected. |
| Spoofed Attacker Subdomains | e.g. `http://172.20.10.4.attacker.com`, `http://localhost.attacker.com` | Untrusted | **NO** | Returns `false`. Regex boundaries (`^` and `$`) prevent prefix matching. |

---

## 4. Drop-In Code Snippets for Worker M1-2

### 4.1 Target File: `server/_core/cors.ts`

**Location**: Lines 3–30  
**Action**: Update JSDoc and remove lines 24–27 (`if (process.env.NODE_ENV !== "production") return true;`).

#### Diff Representation
```diff
--- a/server/_core/cors.ts
+++ b/server/_core/cors.ts
@@ -3,8 +3,8 @@ import type { Request, Response, NextFunction } from "express";
 /**
  * Validates whether an incoming HTTP Origin header is allowed for CORS.
- * Matches Capacitor, Ionic, localhost, loopback, RFC 1918 private subnets
- * (including iOS Hotspot 172.20.10.*), and allows all origins in development mode.
+ * Matches Capacitor, Ionic, localhost, loopback, and RFC 1918 private subnets
+ * (including iOS Hotspot 172.20.10.*). Disallows arbitrary external origins
+ * regardless of environment.
  */
 export function isAllowedOrigin(origin: string | undefined): boolean {
   if (!origin) return true; // Direct non-browser requests / same-origin
@@ -21,10 +21,6 @@ export function isAllowedOrigin(origin: string | undefined): boolean {
   if (/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
   if (/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
 
-  // In non-production environments, permit any origin for local Wi-Fi / Hotspot debugging
-  if (process.env.NODE_ENV !== "production") {
-    return true;
-  }
-
   return false;
 }
```

#### Exact Drop-In Replacement for `server/_core/cors.ts` (Lines 1–31)
```typescript
import type { Request, Response, NextFunction } from "express";

/**
 * Validates whether an incoming HTTP Origin header is allowed for CORS.
 * Matches Capacitor, Ionic, localhost, loopback, and RFC 1918 private subnets
 * (including iOS Hotspot 172.20.10.*). Disallows arbitrary external origins
 * regardless of environment.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Direct non-browser requests / same-origin

  if (origin === "capacitor://localhost" || origin === "ionic://localhost") {
    return true;
  }

  // Localhost & 127.0.0.1 (any port)
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;

  // RFC 1918 Private networks (including iOS Hotspot 172.20.10.*)
  if (/^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return true;

  return false;
}
```

---

### 4.2 Target File: `server/_core/cors.test.ts`

**Location**: Lines 55–58 and around line 234  
**Action**: Replace the development wildcard test with strict external domain rejection assertions, and add development-mode middleware rejection test.

#### Diff Representation
```diff
--- a/server/_core/cors.test.ts
+++ b/server/_core/cors.test.ts
@@ -55,4 +55,8 @@ describe("CORS Module", () => {
-      it("allows any origin in development mode for debugging flexibility", () => {
-        expect(isAllowedOrigin("https://any-dev-preview.ngrok-free.app")).toBe(true);
-        expect(isAllowedOrigin("https://custom-domain.local:3000")).toBe(true);
-      });
+      it("rejects unauthorized external/attacker domains even in development mode", () => {
+        expect(isAllowedOrigin("http://evil-attacker-site.com")).toBe(false);
+        expect(isAllowedOrigin("https://any-dev-preview.ngrok-free.app")).toBe(false);
+        expect(isAllowedOrigin("https://custom-domain.local:3000")).toBe(false);
+        expect(isAllowedOrigin("https://attacker.example.com")).toBe(false);
+        expect(isAllowedOrigin("http://172.32.0.1:3000")).toBe(false);
+        expect(isAllowedOrigin("http://8.8.8.8:3000")).toBe(false);
+      });
@@ -234,6 +238,24 @@ describe("CORS Module", () => {
+    it("does not reflect disallowed origin in development mode", () => {
+      process.env.NODE_ENV = "development";
+      const req = {
+        method: "OPTIONS",
+        headers: {
+          origin: "http://evil-attacker-site.com",
+          "access-control-request-method": "GET",
+        },
+      } as unknown as Request;
+
+      const res = createMockRes();
+      let nextCalled = false;
+      corsMiddleware(req, res as unknown as Response, () => {
+        nextCalled = true;
+      });
+
+      expect(res.getStatusCode()).toBe(204);
+      expect(res.isEnded()).toBe(true);
+      expect(res.getHeaders()["access-control-allow-origin"]).toBeUndefined();
+      expect(res.getHeaders()["access-control-allow-credentials"]).toBeUndefined();
+    });
```

#### Exact Drop-In Replacement for `server/_core/cors.test.ts` (Lines 55–58)
```typescript
      it("rejects unauthorized external/attacker domains even in development mode", () => {
        expect(isAllowedOrigin("http://evil-attacker-site.com")).toBe(false);
        expect(isAllowedOrigin("https://any-dev-preview.ngrok-free.app")).toBe(false);
        expect(isAllowedOrigin("https://custom-domain.local:3000")).toBe(false);
        expect(isAllowedOrigin("https://attacker.example.com")).toBe(false);
        expect(isAllowedOrigin("http://172.32.0.1:3000")).toBe(false);
        expect(isAllowedOrigin("http://8.8.8.8:3000")).toBe(false);
      });
```

---

## 5. Verification Protocol for Implementer and Reviewer

Once Worker M1-2 applies the snippets:

1. **Vitest Unit Tests**:
   ```bash
   npx vitest run server/_core/cors.test.ts
   ```
   *Expected Result*: 100% pass (all 16+ tests pass, including strict development rejection).

2. **TypeScript Type Check**:
   ```bash
   npm run check
   ```
   *Expected Result*: Exited with code 0, 0 errors.

3. **E2E Tier 2 Boundary Tests (Specifically Feature 4 `T2.4.1`)**:
   ```bash
   node tests/e2e/ios/run-ios-e2e.mjs --tier=2
   ```
   *Expected Result*:
   ```
   --- F4: Backend CORS & CSP Boundaries ---
     [PASS] T2.4.1: Preflight request from non-whitelisted external origin (evil.com) does not grant CORS access
     [PASS] T2.4.2: Preflight with empty Origin header is handled without crashing server
     [PASS] T2.4.3: Preflight requesting unsupported HTTP method (e.g. TRACE) is handled safely
     [PASS] T2.4.4: Multiple comma-separated Access-Control-Request-Headers are parsed correctly
     [PASS] T2.4.5: Preflight request to non-tRPC static route preserves security headers
   ```
   All 5 Feature 4 tests pass!

4. **E2E Tier 1 Feature Coverage (Feature 4)**:
   ```bash
   node tests/e2e/ios/run-ios-e2e.mjs --tier=1
   ```
   *Expected Result*: All 5 tests under `Feature 4: Backend CORS & CSP Support` (`T1.4.1` – `T1.4.5`) continue to pass.

5. **Milestone 1 Adversarial Fuzzing Suite**:
   ```bash
   node tests/e2e/m1-adversarial-stress.mjs
   ```
   *Expected Result*: All 79 adversarial boundary tests pass.

---

## 6. Conclusion
The proposed changes completely resolve the security vulnerability identified by Reviewer 1 without breaking any legitimate development, Capacitor WKWebView, or local hotspot workflows. The implementation is ready for immediate drop-in execution by Worker M1-2.
