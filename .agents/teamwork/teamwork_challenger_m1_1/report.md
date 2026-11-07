# Empirical Challenge Report: Milestone 1 (Backend Network & Dual-Auth Readiness)

**Challenger:** M1-1 (Live HTTP Verifier)  
**Date:** 2026-11-07  
**Target Server:** `http://localhost:3000` (PID 4716, Node.js + Express + tRPC)  
**Formal Verdict:** **APPROVE**  

---

## Executive Summary

As the Empirical Challenger, I have independently stress-tested, verified, and challenged the live backend server on `http://localhost:3000`. No claims from Worker M1 were accepted without direct empirical reproduction.

All 5 core dispatch requirements and 5 additional adversarial stress categories (totaling 34 automated assertions) were executed against the live server. **All 34 assertions passed (100% success rate)**. The server accurately handles CORS preflight short-circuiting with HTTP 204, issues valid JWT tokens upon login, honors `Authorization: Bearer <token>` headers without requiring cookies, rejects unauthenticated/malformed requests with HTTP 401 UNAUTHORIZED, and allows iOS Capacitor origins and local hotspot private IP subnets.

---

## 1. Primary Milestone 1 Verification Objectives

### Objective 1: HTTP `OPTIONS` Preflight Request
- **Command Executed:**
  ```bash
  curl.exe -i -X OPTIONS http://localhost:3000/api/trpc/auth.login \
    -H "Origin: capacitor://localhost" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type, Authorization, x-trpc-source"
  ```
- **Verbatim Server Response:**
  ```http
  HTTP/1.1 204 No Content
  X-Powered-By: Express
  Access-Control-Allow-Origin: capacitor://localhost
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
  Access-Control-Allow-Headers: Content-Type, Authorization, x-trpc-source, Accept, Origin, X-Requested-With, Cookie
  Access-Control-Expose-Headers: Set-Cookie, Authorization, Content-Disposition, X-RateLimit-Limit, X-RateLimit-Remaining
  Access-Control-Max-Age: 86400
  Vary: Origin
  Date: Sat, 07 Nov 2026 17:58:41 GMT
  Connection: keep-alive
  Keep-Alive: timeout=5
  ```
- **Evaluation:**
  - Status is **204 No Content** (PASS).
  - `Access-Control-Allow-Origin` matches `capacitor://localhost` (PASS).
  - `Access-Control-Allow-Credentials` is `true` (PASS).
  - `Access-Control-Allow-Headers` includes `Content-Type, Authorization, x-trpc-source` (PASS).
  - Body payload length is 0 (PASS).

---

### Objective 2: Real User Login (`POST /api/trpc/auth.login`)
- **Credentials Tested:**
  1. `khaled.haddad@zuj.edu.jo` / `password123`
  2. `hanan@gmail.com` / `password123`
- **Command Executed:**
  ```bash
  curl.exe -i -X POST http://localhost:3000/api/trpc/auth.login \
    -H "Content-Type: application/json" \
    -H "Origin: capacitor://localhost" \
    -d '{\"json\":{\"email\":\"khaled.haddad@zuj.edu.jo\",\"password\":\"password123\"}}'
  ```
- **Verbatim Server Response (excerpts):**
  ```http
  HTTP/1.1 200 OK
  X-Powered-By: Express
  Access-Control-Allow-Origin: capacitor://localhost
  Access-Control-Allow-Credentials: true
  content-type: application/json

  {"result":{"data":{"json":{"success":true,"token":"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIxMDAyNywiZW1haWwiOiJraGFsZWQuaGFkZGFkQHp1ai5lZHUuam8iLCJuYW1lIjoiS2hhbGVkIEhhZGRhZCIsInJvbGUiOiJzdHVkZW50IiwidHlwZSI6ImxvY2FsLWF1dGgiLCJpYXQiOjE3OTQwNzQzMjksImV4cCI6MTc5NDY3OTEyOX0.zFCgttnCyGtloYXk-SKEvlW3SRJvrWvEskQv-ySOQbw","user":{"id":210027,"email":"khaled.haddad@zuj.edu.jo","name":"Khaled Haddad","role":"student","language":"en"}}}}}
  ```
- **Evaluation:**
  - Status is **200 OK** (PASS).
  - Response contains `success: true` (PASS).
  - Returned `token` is a valid 3-part HS256 JWT string (PASS).
  - Returned `user` object contains `id: 210027`, `email`, `name: "Khaled Haddad"`, `role: "student"`, `language: "en"` (PASS).
  - Secondary user `hanan@gmail.com` also returns status 200, valid JWT token, and profile `id: 240002` (PASS).

---

### Objective 3: `GET /api/trpc/auth.me` with Bearer Token & NO Cookie
- **Request Configuration:**
  - Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`
  - Header: `Origin: capacitor://localhost`
  - Explicitly **no `Cookie` header** sent.
- **Command Executed:**
  ```bash
  curl.exe -i http://localhost:3000/api/trpc/auth.me \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIxMDAyNywiZW1haWwiOiJraGFsZWQuaGFkZGFkQHp1ai5lZHUuam8iLCJuYW1lIjoiS2hhbGVkIEhhZGRhZCIsInJvbGUiOiJzdHVkZW50IiwidHlwZSI6ImxvY2FsLWF1dGgiLCJpYXQiOjE3OTQwNzQzMjksImV4cCI6MTc5NDY3OTEyOX0.zFCgttnCyGtloYXk-SKEvlW3SRJvrWvEskQv-ySOQbw" \
    -H "Origin: capacitor://localhost"
  ```
- **Verbatim Server Response (excerpts):**
  ```http
  HTTP/1.1 200 OK
  X-Powered-By: Express
  Access-Control-Allow-Origin: capacitor://localhost
  content-type: application/json

  {"result":{"data":{"json":{"id":210027,"openId":"student_20230001","email":"khaled.haddad@zuj.edu.jo","name":"Khaled Haddad","role":"student","advisorId":210024,"departmentId":2,"language":"en","isEmailVerified":true,"isActive":true,...}}}}
  ```
- **Evaluation:**
  - Status is **200 OK** (PASS).
  - Accurately resolves Khaled Haddad's identity purely via Bearer token (PASS).
  - Zero session cookies required, solving iOS WebKit ITP cookie drop restrictions (PASS).

---

### Objective 4: `GET /api/trpc/student.myCourses` with Bearer Token
- **Command Executed:**
  ```bash
  curl.exe -i http://localhost:3000/api/trpc/student.myCourses \
    -H "Authorization: Bearer <khaledToken>" \
    -H "Origin: capacitor://localhost"
  ```
- **Verbatim Server Response (excerpts):**
  ```http
  HTTP/1.1 200 OK
  X-Powered-By: Express
  Access-Control-Allow-Origin: capacitor://localhost
  content-type: application/json

  {"result":{"data":{"json":[{"id":421,"courseId":33,"semester":1,"grade":"B","status":"completed","code":"CS101","name":"Introduction to Computing",...},...25 courses total]}}}
  ```
- **Evaluation:**
  - Status is **200 OK** (PASS).
  - Returns complete array of 25 enrolled course records from MariaDB (PASS).

---

### Objective 5: Rejection of Unauthenticated & Invalid Requests
- **5a. No Credentials (No Cookie, No Authorization Header):**
  ```bash
  curl.exe -i http://localhost:3000/api/trpc/student.myCourses -H "Origin: capacitor://localhost"
  ```
  - **Status:** `HTTP/1.1 401 Unauthorized`
  - **Body:** `{"error":{"json":{"message":"Please login (10001)","code":-32001,"data":{"code":"UNAUTHORIZED","httpStatus":401,"path":"student.myCourses"}}}}`
  - **Evaluation:** Accurately rejected with HTTP 401 and tRPC code `UNAUTHORIZED` (PASS).

- **5b. Invalid / Malformed Token:**
  ```bash
  curl.exe -i http://localhost:3000/api/trpc/student.myCourses \
    -H "Authorization: Bearer bad.jwt.token" \
    -H "Origin: capacitor://localhost"
  ```
  - **Status:** `HTTP/1.1 401 Unauthorized`
  - **Body:** `{"error":{"json":{"message":"Please login (10001)","code":-32001,"data":{"code":"UNAUTHORIZED","httpStatus":401,"path":"student.myCourses"}}}}`
  - **Evaluation:** Accurately rejected with HTTP 401 without throwing 500 or crashing server (PASS).

---

## 2. Adversarial Challenge & Stress Tests

| # | Stress Test Scenario | Tested Payload / Condition | Expected Behavior | Actual Behavior | Result |
|---|----------------------|---------------------------|-------------------|-----------------|--------|
| 1 | Whitespace-only Bearer | `Authorization: Bearer    ` | 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| 2 | Non-Bearer Scheme | `Authorization: Basic dXNlcjpwYXNz` | 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| 3 | Lowercase Header & Scheme | `authorization: bearer <token>` | 200 OK (Case-insensitive) | HTTP 200 OK (Khaled Haddad) | **PASS** |
| 4 | Origin Matrix: Ionic | `Origin: ionic://localhost` | 204 No Content | HTTP 204 Allow-Origin reflected | **PASS** |
| 5 | Origin Matrix: Hotspot IP | `Origin: http://172.20.10.4:3000` | 204 No Content | HTTP 204 Allow-Origin reflected | **PASS** |
| 6 | Origin Matrix: Hotspot Gateway | `Origin: http://172.20.10.1:3000` | 204 No Content | HTTP 204 Allow-Origin reflected | **PASS** |
| 7 | Origin Matrix: LAN Subnet | `Origin: http://192.168.1.50:3000` | 204 No Content | HTTP 204 Allow-Origin reflected | **PASS** |
| 8 | Origin Matrix: 10.x Subnet | `Origin: http://10.0.0.1:3000` | 204 No Content | HTTP 204 Allow-Origin reflected | **PASS** |
| 9 | Dual-Auth Conflict Priority | Bearer token (Khaled) + Invalid Cookie | Bearer token takes priority (200 OK) | HTTP 200 OK for Khaled | **PASS** |
| 10 | Wrong Password | `khaled.haddad@zuj.edu.jo` / `WRONG_PW` | 401 Client Error, no 500 crash | HTTP 401 "Invalid password." | **PASS** |
| 11 | Unknown User | `nonexistent@zuj.edu.jo` / `password123` | 401 Client Error, no 500 crash | HTTP 401 "User not found." | **PASS** |
| 12 | CSP Directives | `GET /api/trpc/aiChat.getStatus` | CSP permits `http:`, `capacitor:`, `ionic:` | Present in `connect-src` and `img-src` | **PASS** |
| 13 | Multi-Router Protection | `aiChat.getCourseStudyStrategy` with Bearer | 200 OK | HTTP 200 OK (Strategy returned) | **PASS** |

---

## 3. Test Automation Suite Execution

- **Script:** `tests/live-http-challenge-m1.mjs`
- **Total Tests:** 34
- **Passed:** 34
- **Failed:** 0
- **Pass Rate:** 100.0%
- **Vitest Unit Suite:** 8 test files, 75 tests passing (0 failures).
- **TypeScript Compiler (`tsc --noEmit`):** 0 errors.

---

## 4. Formal Verdict

**VERDICT: APPROVE**

The backend implementation for Milestone 1 satisfies all functional, architectural, security, and networking requirements for native iOS Capacitor operation.
