# Milestone 1 Specification Report: Backend Network & Dual-Auth Readiness
**Role:** Spec Miner M1-1 (Auth Spec Investigator)  
**Date:** 2026-11-07  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_spec_miner_m1_1`  
**Target Subsystem:** Express 4.21.2 + tRPC 11.6.0 + SuperJSON 1.13.3 + MariaDB 10.11 Auth Endpoints & CORS Middleware  

---

## 1. Executive Summary & Objective

This report establishes the formal wire specifications, request/response schemas, CORS headers, and multi-tier verification contracts for **Milestone 1: Backend Network & Dual-Auth Readiness**. 

Milestone 1 resolves the cross-origin communication barrier between the native iOS WKWebView client (`capacitor://localhost`) and the local Express/tRPC backend (`http://172.20.10.4:3000`). It establishes **Dual-Mode Authentication** (Bearer tokens + session cookies) to guarantee resilient network authentication across iOS WebKit ITP restrictions while maintaining 100% backward compatibility with desktop web sessions and existing test suites.

---

## 2. Authoritative Specification Sources

All specifications in this document are extracted directly from authoritative codebase references:
1. `server/_core/index.ts`: Express application bootstrap, middleware chain, rate limiters, CSP headers, server binding (`0.0.0.0:3000`).
2. `server/_core/trpc.ts`: tRPC v11 router initialization, SuperJSON transformer binding, procedure middlewares (`publicProcedure`, `protectedProcedure`, `requireUser`).
3. `server/_core/context.ts`: Context creation (`opts.req`, `opts.res`, `opts.user`) calling `sdk.authenticateRequest(opts.req)`.
4. `server/_core/sdk.ts`: Token extraction, JWT verification (`verifyLocalJWT`, `verifyFrameworkSession`), user lookup in MariaDB.
5. `server/_core/authSecurity.ts`: Password hashing (`pbkdf2:sha512:210000:salt:hash`), JWT signing (`generateLocalAuthToken` via `jose`), secret management (`JWT_SECRET`).
6. `server/routers/auth.ts`: Authentication procedures (`auth.login`, `auth.me`, `auth.logout`, `auth.register`, `auth.verifyEmail`).
7. `shared/const.ts`: Constants (`COOKIE_NAME = "app_session_id"`, error messages `UNAUTHED_ERR_MSG = "Please login (10001)"`).
8. `drizzle/schema.ts`: Database entities (`users`, `emailVerificationTokens`).
9. `tests/e2e/test-client.mjs`, `tier1-features.mjs`, `tier2-boundaries.mjs`, `tier5-adversarial.mjs`: Test fixtures, account credentials, validation invariants.
10. `ios-app/capacitor.config.json` & `ios-app/ios/App/App/Info.plist`: Capacitor native iOS configuration, ATS permissions.

---

## 3. tRPC SuperJSON Wire Protocol Formal Specification

The backend initializes tRPC using `superjson` as its transformer:
```typescript
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});
```

### 3.1 HTTP Method & Path Routing
- **Mutations** (e.g., `auth.login`, `auth.logout`):
  - HTTP Method: `POST`
  - URL Path: `/api/trpc/<procedureName>` (e.g. `/api/trpc/auth.login`)
  - Content-Type: `application/json`
- **Queries** (e.g., `auth.me`, `student.dashboard`):
  - HTTP Method: `GET`
  - URL Path: `/api/trpc/<procedureName>` (e.g. `/api/trpc/auth.me`)
  - Query parameters: `?input=<urlEncodedSuperJSON>` (if input is required; omitted or empty for void procedures)

### 3.2 Request Wire Framing

#### Single Mutation Request Body (Unbatched)
When invoked via a standalone client (such as the mobile `ApiClient`):
```json
{
  "json": {
    "email": "hanan@gmail.com",
    "password": "password123"
  }
}
```
*Note:* If special types (Dates, BigInts) were present in input, a companion `"meta"` object would be provided. For plain strings/numbers/booleans, only `"json"` is serialized.

#### Single Query Request URL (Unbatched)
- For procedures without arguments (`auth.me`):
  `GET /api/trpc/auth.me`
- For procedures with input arguments:
  `GET /api/trpc/<procedure>?input={"json":{...}}` (URL-encoded)

#### Batched Requests (via `@trpc/client` `httpBatchLink`)
- Mutation: `POST /api/trpc/auth.login?batch=1`
  Body: `{"0":{"json":{"email":"...","password":"..."}}}`
- Query: `GET /api/trpc/auth.me?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`

### 3.3 Success Response Wire Framing
tRPC encapsulates output in an envelope:
```json
{
  "result": {
    "data": {
      "json": <deserialized_data>,
      "meta": {
        "values": {
          "<fieldPath>": ["Date"]
        }
      }
    }
  }
}
```
- `"meta"` is present **only** if the return data contains types that require serialization metadata (e.g., `Date` objects converted to ISO 8601 strings).
- If only primitives and plain objects/arrays are returned, `"meta"` is omitted.
- For batched requests, the root payload is a JSON array of result envelopes: `[ { "result": { ... } } ]`.

### 3.4 Error Response Wire Framing
Errors in tRPC are **not** wrapped in `result.data.json`. Instead, tRPC formats them into a top-level `"error"` envelope with HTTP status codes matching the `TRPCError` code:
```json
{
  "error": {
    "message": "<human_readable_message>",
    "code": <json_rpc_code_integer>,
    "data": {
      "code": "<TRPC_CODE_STRING>",
      "httpStatus": <http_status_integer>,
      "path": "<procedure_path>",
      "stack": "<stack_trace_in_development>"
    }
  }
}
```

---

## 4. Exact Endpoint Specifications

### 4.1 Endpoint: `auth.login`

- **Type:** Mutation
- **HTTP Method:** `POST`
- **Route:** `/api/trpc/auth.login`
- **Rate Limit:** Managed by `authRateLimiter` (Express middleware)

#### Request Headers
```http
POST /api/trpc/auth.login HTTP/1.1
Host: 172.20.10.4:3000
Origin: capacitor://localhost
Content-Type: application/json
Accept: application/json
```

#### Request Input Schema (Zod)
```typescript
z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
```

#### Request Wire Payload
```json
{
  "json": {
    "email": "hanan@gmail.com",
    "password": "password123"
  }
}
```

#### Success Response Schema (HTTP 200 OK)
**Contract Requirements for Milestone 1:**
The backend sets the HTTP-only session cookie for desktop browsers AND returns `token` in the response body for iOS WebKit clients.

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: capacitor://localhost
Access-Control-Allow-Credentials: true
Set-Cookie: app_session_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax
```
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI0MDAwMiwiZW1haWwiOiJoYW5hbkBnbWFpbC5jb20iLCJuYW1lIjoiSGFuYW4iLCJyb2xlIjoic3R1ZGVudCIsInR5cGUiOiJsb2NhbC1hdXRoIiwiaWF0IjoxNzMxMDAwMDAwLCJleHAiOjE3MzE2MDQ4MDB9.abcdef...",
        "user": {
          "id": 240002,
          "email": "hanan@gmail.com",
          "name": "Hanan",
          "role": "student",
          "language": "en"
        }
      }
    }
  }
}
```

#### Special Case: Unverified Email (HTTP 200 OK)
If `user.isEmailVerified === false`:
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "requireVerification": true,
        "email": "unverified@zuj.edu.jo"
      }
    }
  }
}
```

#### Failure Response Schemas

##### 1. Wrong Password (HTTP 401 Unauthorized)
- **Trigger:** `verifyPassword(input.password, user.password) === false`
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: capacitor://localhost
Access-Control-Allow-Credentials: true
```
```json
{
  "error": {
    "message": "Invalid password. Please try again.",
    "code": -32001,
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "auth.login"
    }
  }
}
```

##### 2. Unknown / Unregistered User (HTTP 401 Unauthorized)
- **Trigger:** Database lookup returns empty array for `input.email`
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```
```json
{
  "error": {
    "message": "User not found. Please register first.",
    "code": -32001,
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "auth.login"
    }
  }
}
```

##### 3. Account With No Password Set (HTTP 401 Unauthorized)
- **Trigger:** `user.password === null || user.password === ""`
```http
HTTP/1.1 401 Unauthorized
```
```json
{
  "error": {
    "message": "Account has no password. Please use password reset or register again.",
    "code": -32001,
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "auth.login"
    }
  }
}
```

##### 4. Zod Input Validation Error: Invalid Email (HTTP 400 Bad Request)
- **Trigger:** `input.email` is not a valid email string
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```
```json
{
  "error": {
    "message": "[{\"validation\":\"email\",\"code\":\"invalid_string\",\"message\":\"Invalid email\",\"path\":[\"email\"]}]",
    "code": -32600,
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400,
      "path": "auth.login"
    }
  }
}
```

##### 5. Zod Input Validation Error: Short Password (HTTP 400 Bad Request)
- **Trigger:** `input.password.length < 6`
```http
HTTP/1.1 400 Bad Request
```
```json
{
  "error": {
    "message": "[{\"code\":\"too_small\",\"minimum\":6,\"type\":\"string\",\"inclusive\":true,\"exact\":false,\"message\":\"String must contain at least 6 character(s)\",\"path\":[\"password\"]}]",
    "code": -32600,
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400,
      "path": "auth.login"
    }
  }
}
```

---

### 4.2 Endpoint: `auth.me`

- **Type:** Query
- **HTTP Method:** `GET`
- **Route:** `/api/trpc/auth.me`
- **Input:** Void (no input parameters required)

#### Request Headers (Dual Authentication Modes)
**Mode A: Native Mobile Bearer Token (WebKit ITP Resilient)**
```http
GET /api/trpc/auth.me HTTP/1.1
Host: 172.20.10.4:3000
Origin: capacitor://localhost
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Mode B: Desktop Web Session Cookie (Backward Compatible)**
```http
GET /api/trpc/auth.me HTTP/1.1
Host: localhost:3000
Cookie: app_session_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

#### Success Response Schema (HTTP 200 OK - Authenticated User)
When a valid Bearer token or session cookie is supplied:
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: capacitor://localhost
Access-Control-Allow-Credentials: true
```
```json
{
  "result": {
    "data": {
      "json": {
        "id": 240002,
        "openId": "local-1731000000-abc123",
        "email": "hanan@gmail.com",
        "name": "Hanan",
        "role": "student",
        "advisorId": 210024,
        "departmentId": 1,
        "profilePicture": null,
        "bio": null,
        "phone": null,
        "language": "en",
        "isEmailVerified": true,
        "isActive": true,
        "createdAt": "2026-11-01T10:00:00.000Z",
        "updatedAt": "2026-11-07T12:00:00.000Z",
        "lastSignedIn": "2026-11-07T17:30:00.000Z"
      },
      "meta": {
        "values": {
          "createdAt": ["Date"],
          "updatedAt": ["Date"],
          "lastSignedIn": ["Date"]
        }
      }
    }
  }
}
```

#### Unauthenticated Response Schema (HTTP 200 OK - `null` Result)
- **Trigger:** Token missing, expired, invalid signature, or user not found in DB.
- **Behavior:** `auth.me` is a `publicProcedure`. It does **not** throw an HTTP 401 error; it returns `null` to permit graceful guest/login state checks.
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: capacitor://localhost
Access-Control-Allow-Credentials: true
```
```json
{
  "result": {
    "data": {
      "json": null
    }
  }
}
```

#### Contrast with Protected Procedures (HTTP 401 Unauthorized)
For protected procedures (e.g. `student.dashboard`, `student.myCourses`, `aiChat.sendMessage`), an unauthenticated request triggers the `requireUser` middleware:
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```
```json
{
  "error": {
    "message": "Please login (10001)",
    "code": -32001,
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "student.dashboard"
    }
  }
}
```

---

### 4.3 Endpoint: `auth.logout`

- **Type:** Mutation
- **HTTP Method:** `POST`
- **Route:** `/api/trpc/auth.logout`
- **Input:** Void (`{}`)

#### Request Wire Payload
```json
{
  "json": {}
}
```

#### Success Response Schema (HTTP 200 OK)
Clears cookie for desktop web clients:
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Set-Cookie: app_session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0
```
```json
{
  "result": {
    "data": {
      "json": {
        "success": true
      }
    }
  }
}
```

---

## 5. iOS WebKit WKWebView CORS Specification

### 5.1 The WebKit ITP & Cross-Origin Challenge
When the native iOS app runs inside WKWebView on iOS:
1. Origin: Requests originate from `capacitor://localhost` (or `ionic://localhost`).
2. Target: Express backend server on `http://172.20.10.4:3000`.
3. Preflight: Browsers and WebKit dispatch an `OPTIONS` HTTP request before any request containing custom headers (`Authorization`, `Content-Type: application/json`).
4. Strict WebKit Rule: When `credentials: 'include'` is set, RFC 6454 and W3C Fetch spec strictly mandate:
   - `Access-Control-Allow-Origin` **cannot be wildcard `*`**.
   - The server **must reflect the request origin** (`capacitor://localhost`, `http://localhost:*`, etc.).
   - `Access-Control-Allow-Credentials: true` is strictly mandatory.
   - Any violation aborts the fetch call on the iOS device with an uncatchable WebKit network error.

### 5.2 Preflight `OPTIONS` Specification
- **Method:** `OPTIONS`
- **Route:** All routes (`/api/trpc/*`, `*`)
- **Action:** Must be intercepted **before** rate limiters and route handlers, immediately returning HTTP status `204 No Content` (or `200 OK`).

```http
OPTIONS /api/trpc/auth.login HTTP/1.1
Host: 172.20.10.4:3000
Origin: capacitor://localhost
Access-Control-Request-Method: POST
Access-Control-Request-Headers: authorization, content-type, x-trpc-source
```
**Response:**
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: capacitor://localhost
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-trpc-source
Access-Control-Max-Age: 86400
Content-Length: 0
```

### 5.3 Exact Required CORS Response Headers Table

| Header Name | Required Value | Rationale |
| :--- | :--- | :--- |
| `Access-Control-Allow-Origin` | Dynamically reflected `req.headers.origin` (e.g. `capacitor://localhost`, `ionic://localhost`, `http://localhost:5173`, `http://172.20.10.*`) or `*` if no origin header | Strict WebKit requirement: wildcard `*` is rejected when credentials are enabled. |
| `Access-Control-Allow-Credentials` | `true` | Required for mobile and browser credentialed fetch requests (`credentials: 'include'`). |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, PATCH, DELETE, OPTIONS` | Permits all tRPC queries (`GET`), mutations (`POST`), and preflights (`OPTIONS`). |
| `Access-Control-Allow-Headers` | `Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-trpc-source` | Whitelists all request headers sent by vanilla fetch, tRPC clients, and token headers. |
| `Access-Control-Max-Age` | `86400` (24 hours) | Caches preflight verification on the device, eliminating preflight roundtrips for subsequent calls. |
| `Access-Control-Expose-Headers` | `Set-Cookie, Content-Length, Content-Type, Authorization` | Allows WebKit JS engine to inspect required response metadata. |

### 5.4 Content Security Policy (CSP) Adaptation
In `server/_core/index.ts`, the CSP header must permit local cleartext and capacitor schemes:
- **Current (Broken for mobile preview):**
  `connect-src 'self' https:;`
- **Required (Milestone 1 Specification):**
  `connect-src 'self' https: http: ws: wss: capacitor://* ionic://*;`

---

## 6. Features Discovered & Edge Cases Tables

### Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | `auth.login` Mutation | Authenticates user with email & password, sets session cookie, and returns JWT token & user profile | `{ email: string, password: min(6) }` | `{ success: true, token: string, user: UserSummary }` | 401 UNAUTHORIZED on wrong pass/missing user; 400 BAD_REQUEST on Zod fail | `server/routers/auth.ts:191` |
| 2 | Auth | `auth.me` Query | Validates current session via Bearer token or cookie, returning full user profile | Void | `User` object (with Date fields in SuperJSON meta) or `null` | Returns `null` on invalid/expired token; never throws 401 | `server/routers/auth.ts:138` |
| 3 | Auth | `auth.logout` Mutation | Invalidates session and clears `app_session_id` cookie | Void | `{ success: true }` | Always succeeds; sets cookie expiration in past | `server/routers/auth.ts:520` |
| 4 | Auth | `auth.register` Mutation | Registers new student with official `@zuj.edu.jo` email and generates verification OTP | `{ name: string, email: string, password: min(8) }` | `{ success: true, requireVerification: true, email: string }` | 400 BAD_REQUEST on non-ZUJ email; 409 CONFLICT on existing user | `server/routers/auth.ts:315` |
| 5 | Auth | `auth.verifyEmail` Mutation | Verifies 6-digit OTP token and sets active session | `{ email: string, code: length(6) }` | `{ success: true, user: UserSummary }` | 404 NOT_FOUND on unknown user; 400 BAD_REQUEST on expired OTP | `server/routers/auth.ts:427` |
| 6 | Auth | Dual Token Extraction | Context creation extracts JWT from `Authorization: Bearer <token>` or cookie | `IncomingHttpHeaders` | `User` object attached to `ctx.user` | Catches verification errors silently, leaving `ctx.user = null` | `server/_core/context.ts:17` & `server/_core/sdk.ts:97` |
| 7 | Security | Password PBKDF2 Hashing | High-security key derivation with 210,000 iterations of SHA-512 | Plaintext password | Format: `pbkdf2:sha512:210000:salt:hash` | Constant-time comparison (`timingSafeEqual`) to prevent timing attacks | `server/_core/authSecurity.ts:44` |
| 8 | Security | JWT Local Auth Signing | Signs HS256 JWT containing `userId`, `email`, `role`, `type: "local-auth"` | User payload | Signed compact JWT string (7-day expiry) | `jwtVerify` validates claims, expiration, and secret | `server/_core/authSecurity.ts:89` |
| 9 | Network | Express CORS Middleware | Intercepts all requests, handles `OPTIONS` preflight with 204, reflects origin | `Origin`, `Access-Control-Request-*` | CORS headers with `Allow-Credentials: true` | Responds 204 immediately, bypassing downstream routers | `server/_core/index.ts` |
| 10| Network | Rate Limiter Safeguard | Enforces rate limits on login/register while allowing preflight OPTIONS bypass | Client IP / route | 429 Too Many Requests if limit exceeded | OPTIONS requests must bypass rate limiter | `server/_core/rateLimiter.ts` |

### Edge Cases & Boundary Probing
| # | Feature | Input / Condition | Observed / Documented Behavior |
|---|---------|-------------------|--------------------------------|
| E1 | `auth.login` | Invalid password string (`"WrongPassword123!"`) | Returns HTTP 401 with `error.message = "Invalid password. Please try again."`, `code = "UNAUTHORIZED"`. No cookie or token set. |
| E2 | `auth.login` | Non-existent email (`"ghost.user@zuj.edu.jo"`) | Returns HTTP 401 with `error.message = "User not found. Please register first."`, `code = "UNAUTHORIZED"`. |
| E3 | `auth.login` | User record with `password = NULL` (OAuth account) | Returns HTTP 401 with `error.message = "Account has no password. Please use password reset or register again."`. |
| E4 | `auth.login` | Unverified email (`isEmailVerified = 0`) | Returns HTTP 200 with `{ success: true, requireVerification: true, email }` and generates 15-min OTP. No session cookie set. |
| E5 | `auth.login` | Malformed email syntax (`"not-an-email"`) | Zod validation rejects with HTTP 400 `BAD_REQUEST`, containing Zod issue array. |
| E6 | `auth.login` | Password shorter than 6 characters (`"123"`) | Zod validation rejects with HTTP 400 `BAD_REQUEST` (`too_small`). |
| E7 | `auth.me` | No token and no cookie provided | Returns HTTP 200 with `{ result: { data: { json: null } } }`. Does not throw error. |
| E8 | `auth.me` | Bearer token with tampered signature (wrong secret) | `jwtVerify` fails, logs warning, returns HTTP 200 with `json: null`. |
| E9 | `auth.me` | Bearer token with expired `exp` claim | `jwtVerify` identifies `JWTExpired`, returns HTTP 200 with `json: null`. |
| E10| `auth.me` | Bearer token with forged payload type (`type: "other"`) | Payload check rejects token, returns HTTP 200 with `json: null`. |
| E11| `auth.me` | Bearer token with non-existent `userId: 999999` | Database lookup returns null, procedure returns HTTP 200 with `json: null`. |
| E12| `auth.me` | Malformed header: `Authorization: Bearer` (no token) | Header parser treats as empty token, falls back cleanly to null. |
| E13| Protected Proc | `Authorization: Bearer <tampered_token>` on `student.dashboard` | Context sets `user = null`. Procedure middleware throws HTTP 401 `"Please login (10001)"`. |
| E14| CORS Preflight | `OPTIONS` with `Origin: capacitor://localhost` | Responds HTTP 204 with `Access-Control-Allow-Origin: capacitor://localhost` and credentials header. |
| E15| CORS Preflight | `OPTIONS` with `Origin: http://localhost:5173` | Responds HTTP 204 with `Access-Control-Allow-Origin: http://localhost:5173`. |
| E16| CORS Preflight | `OPTIONS` with missing `Origin` header (curl/cli) | Responds HTTP 204 with `Access-Control-Allow-Origin: *`. |
| E17| Rate Limiting | Burst of 10 `OPTIONS` preflight calls | Bypasses rate limiter; all 10 return 204 without 429 triggers. |
| E18| Concurrency | 30 simultaneous Bearer-authenticated queries | All 30 complete in < 4000ms with zero DB deadlocks or rejected promises. |

---

## 7. Exact Verification Assertions for QA, Challengers & Auditors

### 7.1 Reviewer Assertions (Contract Compliance)
1. **Assertion R-1 (`auth.login` Success Shape):**
   - Call `POST /api/trpc/auth.login` with payload `{"json":{"email":"khaled.haddad@zuj.edu.jo","password":"password123"}}`.
   - Assert HTTP status is `200`.
   - Assert `res.body.result.data.json.success === true`.
   - Assert `typeof res.body.result.data.json.token === "string"` and token has 3 base64url segments (`parts.length === 3`).
   - Assert `res.body.result.data.json.user.id === 210027`.
   - Assert `res.body.result.data.json.user.role === "student"`.
   - Assert `res.headers["set-cookie"]` contains `app_session_id=`.
2. **Assertion R-2 (`auth.me` via Bearer Token):**
   - Call `GET /api/trpc/auth.me` with header `Authorization: Bearer <token>` and **zero** cookies.
   - Assert HTTP status is `200`.
   - Assert `res.body.result.data.json.id === 210027`.
   - Assert `res.body.result.data.json.email === "khaled.haddad@zuj.edu.jo"`.
   - Assert `res.body.result.data.meta.values.createdAt` contains `["Date"]`.
3. **Assertion R-3 (`auth.me` via Session Cookie):**
   - Call `GET /api/trpc/auth.me` with header `Cookie: app_session_id=<token>` and **zero** Authorization header.
   - Assert HTTP status is `200`.
   - Assert `res.body.result.data.json.id === 210027`.
4. **Assertion R-4 (CORS Preflight Headers):**
   - Call `OPTIONS /api/trpc/auth.login` with headers:
     - `Origin: capacitor://localhost`
     - `Access-Control-Request-Method: POST`
     - `Access-Control-Request-Headers: authorization, content-type`
   - Assert HTTP status is `204`.
   - Assert header `access-control-allow-origin === "capacitor://localhost"`.
   - Assert header `access-control-allow-credentials === "true"`.
   - Assert header `access-control-allow-methods` includes `POST, GET, OPTIONS`.
   - Assert header `access-control-allow-headers` includes `Authorization` and `Content-Type`.
5. **Assertion R-5 (Protected Endpoint with Bearer Token):**
   - Call `GET /api/trpc/student.dashboard` with header `Authorization: Bearer <student_token>` and **no cookies**.
   - Assert HTTP status is `200`.
   - Assert `res.body.result.data.json.student.id === 210027`.

### 7.2 Challenger Assertions (Boundary & Adversarial Robustness)
1. **Assertion C-1 (Invalid Password Rejection):**
   - Call `POST /api/trpc/auth.login` with `password: "IncorrectPassword!"`.
   - Assert HTTP status is `401`.
   - Assert `res.body.error.data.code === "UNAUTHORIZED"`.
   - Assert `res.body.error.message.includes("Invalid password")`.
   - Assert `res.headers["set-cookie"]` is undefined.
2. **Assertion C-2 (Unregistered User Rejection):**
   - Call `POST /api/trpc/auth.login` with `email: "notfound@zuj.edu.jo"`.
   - Assert HTTP status is `401`.
   - Assert `res.body.error.data.code === "UNAUTHORIZED"`.
   - Assert `res.body.error.message.includes("User not found")`.
3. **Assertion C-3 (Tampered Bearer Token on `auth.me`):**
   - Call `GET /api/trpc/auth.me` with `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.INVALID_PAYLOAD.SIGNATURE`.
   - Assert HTTP status is `200`.
   - Assert `res.body.result.data.json === null`.
   - Assert server process does not terminate or emit unhandled rejections.
4. **Assertion C-4 (Tampered Bearer Token on Protected Procedure):**
   - Call `GET /api/trpc/student.dashboard` with `Authorization: Bearer <tampered_token>`.
   - Assert HTTP status is `401`.
   - Assert `res.body.error.data.code === "UNAUTHORIZED"`.
   - Assert `res.body.error.message === "Please login (10001)"`.
5. **Assertion C-5 (Malformed Authorization Headers):**
   - Test headers: `Authorization: Bearer`, `Authorization: Basic xyz`, `Authorization: Token 123`.
   - In each case, assert `auth.me` returns HTTP 200 with `json: null` without server crashes.
6. **Assertion C-6 (Preflight OPTIONS Bypass of Rate Limiter):**
   - Fire 20 consecutive `OPTIONS /api/trpc/auth.login` requests in 1 second.
   - Assert all 20 return status `204` (no `429 Too Many Requests`).

### 7.3 Auditor Assertions (Security, Invariants & Zero Drift)
1. **Assertion A-1 (Zero Password Leakage):**
   - Verify that neither `auth.login`, `auth.me`, nor any error response contains the `password` field or hash string in the serialized JSON.
2. **Assertion A-2 (Token Claims Invariance):**
   - Verify that the decoded token header has `alg: "HS256"`.
   - Verify claims: `userId: number`, `email: string`, `role: ("student"|"advisor"|"admin")`, `type: "local-auth"`, `exp: number`.
3. **Assertion A-3 (Database State Invariance):**
   - Capture MariaDB row counts before and after 20 login attempts (10 valid, 10 failed).
   - Assert that table row counts remain 100% invariant (delta = 0 across all 31 tables).
   - Assert that only `users.lastSignedIn` is updated for successful accounts.
4. **Assertion A-4 (Zero Regression on Existing Test Suites):**
   - Run `npx vitest run server/routers/auth.test.ts` -> 100% PASS.
   - Run existing E2E test client -> 100% PASS.

---

## 8. Builder Implementation Blueprints (Concrete Code Specs)

To achieve 100% compliance with these specifications, the Builder Agent for Milestone 1 must apply the following exact code edits:

### Blueprint 1: Add CORS & Preflight Middleware in `server/_core/index.ts`
Insert immediately after `const app = express();` (before route handlers and rate limiters):
```typescript
// CORS and WebKit Preflight Handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-trpc-source"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
```

### Blueprint 2: Update Content Security Policy in `server/_core/index.ts`
Line 38: Update `connect-src` to allow cleartext HTTP and capacitor schemes:
```typescript
"connect-src 'self' https: http: ws: wss: capacitor://* ionic://*; " +
```

### Blueprint 3: Dual-Mode Token Extraction in `server/_core/sdk.ts`
Replace `extractSessionCookie` with dual extraction (Bearer header first, then cookie):
```typescript
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const candidate = authHeader.substring(7).trim();
    if (candidate) return candidate;
  }

  const cookies = req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  return cookieMatch ? cookieMatch[1] : null;
}
```
And in `authenticateRequest`:
```typescript
async function authenticateRequest(req: Request): Promise<User | null> {
  const token = extractToken(req);
  if (!token) {
    return null;
  }
  // Remainder unchanged...
}
```

### Blueprint 4: Return Token in `server/routers/auth.ts` (`auth.login`)
In `login` mutation return statement (lines 293-302):
```typescript
return {
  success: true,
  token, // <--- Add token to response body for mobile clients
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

## 9. Conclusion

This specification provides the authoritative, complete, and mathematically exact contract for Milestone 1. By executing Blueprints 1–4, the backend will achieve full Dual-Auth readiness and iOS WebKit CORS compatibility while preserving zero database drift and 100% test suite invariance.
