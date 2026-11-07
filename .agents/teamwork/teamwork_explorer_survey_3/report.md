# Backend Network, Authentication & API Investigation Report
**Project:** Oliver ZUJ Academic Advising & E-Learning Platform (`ios-app`)  
**Investigator:** Survey Explorer 3 (Backend Network Specialist)  
**Date:** 2026-11-07  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_3`  
**Target Backend:** `http://172.20.10.4:3000` (Local Network Express + tRPC + MariaDB)

---

## 1. Executive Summary

The iOS application (`ios-app/`) is currently packaged from `client/public/phone.html` via `ios-app/scripts/bundle-app.mjs` into `ios-app/www/index.html`. While visually rich, the app operates almost entirely as an offline static simulation. Only a single API call exists (`courses.getMajorDegreeRoadmap`), and that call uses a relative URL (`/api/trpc/...`), which immediately fails when executed inside native iOS WKWebView (`capacitor://localhost/`).

Our investigation verified that a fully capable, production-grade backend server and database already exist in the workspace:
1. **Backend Server**: Express 4.21.2 + tRPC 11.6.0 (`server/_core/index.ts`) listening on `0.0.0.0:3000`.
2. **Database**: MariaDB 10.11 at `localhost:3306/murshid` with 31 verified tables and 27 active user records.
3. **Database Accounts**: Real test accounts matching the mobile simulator already exist in MariaDB with active passwords:
   - Student Hanan: `hanan@gmail.com` (ID 240002, password `password123`)
   - Student Basma: `basma.hassan@zuj.edu.jo` (ID 210029, password `password123`)
   - Student Khaled: `khaled.haddad@zuj.edu.jo` (ID 210027, password `password123`)
   - Advisor Dr. Ahmad Khalil: `a.khalil@zuj.edu.jo` (ID 210024, password `password123`)
   - Admin Abood: `abood@gmail.com` (ID 1, password `password123`)
4. **Critical Gaps Identified**:
   - **CORS Gap**: Express has zero CORS headers. When WKWebView requests `http://172.20.10.4:3000`, WebKit blocks responses due to missing `Access-Control-Allow-Origin` and failing `OPTIONS` preflight checks.
   - **WebKit Cookie Dropping**: The backend exclusively uses `Set-Cookie: app_session_id` (`SameSite=Lax`, cleartext HTTP). iOS WebKit Intelligent Tracking Prevention (ITP) drops third-party/cross-origin cookies across cleartext local network origins.
   - **Missing Token in Response**: `auth.login` does not return the JWT `token` in the response body, preventing the mobile client from storing it.
   - **Server Config Modal Inaccessible**: `bundle-app.mjs` injects `#ios-server-modal` but includes no UI button or trigger to open it.

This report provides the complete architecture and code blueprints to transition `ios-app` from offline mockups to a live connected native iOS application.

---

## 2. Live Backend Server Configuration

### 2.1 Server Architecture & Network Binding
- **Location**: `server/_core/index.ts`
- **Host Binding**: Line 118: `server.listen(port, "0.0.0.0", ...)`
- **Port**: Default `3000` (`process.env.PORT || "3000"`).
- **Default Network Target**: `http://172.20.10.4:3000` (as designated in user requirements and `HOW_TO_INSTALL_ON_IPHONE.md`).
- **Active Local Network State**: Network interface inspection shows the current Wi-Fi adapter is assigned `172.20.10.3` (typical iOS Hotspot DHCP pool). Because Express listens on `0.0.0.0`, it accepts incoming requests on any IP assigned to the machine (`172.20.10.4`, `172.20.10.3`, or `localhost`).
- **Database Status**: `mysql://root:@localhost:3306/murshid` verified online (MariaDB 10.11.16, 31 tables).

### 2.2 Security & Network Transport Analysis
1. **iOS App Transport Security (ATS)**:
   - Verified `ios-app/ios/App/App/Info.plist`:
     ```xml
     <key>NSAppTransportSecurity</key>
     <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
       <key>NSAllowsLocalNetworking</key>
       <true/>
     </dict>
     ```
   - ATS is already properly configured to permit cleartext HTTP communication over local network IP addresses (`172.20.10.4` or `172.20.10.3`).

2. **Backend CORS Vulnerability (Blocker)**:
   - In `server/_core/index.ts`, lines 29-69 set strict CSP and frame headers, but **no CORS middleware exists**.
   - Native iOS Capacitor apps run under the origin `capacitor://localhost` (or `http://localhost`).
   - Cross-origin HTTP requests made by `fetch()` send `Origin: capacitor://localhost` and preflight `OPTIONS` requests. Express currently returns 404 or drops these without `Access-Control-Allow-Origin`, causing WebKit to abort the network request with a CORS error.
   - **Remediation**: Add permissive CORS middleware in `server/_core/index.ts` handling `OPTIONS` preflight with status 204 and reflecting the requesting origin with `Access-Control-Allow-Credentials: true`.

3. **Content Security Policy (CSP) Gap**:
   - In `server/_core/index.ts` line 38:
     `connect-src 'self' https:;`
   - If `phone.html` is previewed via the desktop web server (`/preview` or `/phone`), the browser enforces this CSP and blocks AJAX requests to `http://172.20.10.4:3000` because `http:` is omitted.
   - **Remediation**: Update `connect-src` to: `connect-src 'self' https: http: ws:;`

---

## 3. App Network Client & Mock Data Replacement Audit

### 3.1 Audit of Existing Code in `phone.html` / `www/index.html`

| Feature | Current Implementation in `phone.html` | Status | Target Live tRPC Procedure |
| :--- | :--- | :--- | :--- |
| **Authentication** | Hardcoded toggle `let currentStudent = 'hanan'` (ID 240002) vs `'basma'` (ID 210029). No login screen. | ❌ Offline Mock | `auth.login`, `auth.me`, `auth.logout` |
| **AI Advisor Chat** | `sendInquiry(q)`: Hardcoded string checks (`qLower.includes('cs201')`) + static HTML template. | ❌ Offline Mock | `aiChat.sendMessage`, `aiChat.getStatus` |
| **Attendance QR** | `openPhoneScanner()` opens mock div; `confirmMobileAttendance()` displays fake toast. | ❌ Offline Mock | `student.recordAttendanceViaQr` |
| **Assignments** | In-memory `ASSIGNMENTS_DB = [...]` array; fake submit modal & grade modal. | ❌ Offline Mock | `student.assignments`, `student.submitAssignment`, `student.gradeAssignment` |
| **Student Dashboard** | Static HTML counters (GPA 3.68, 78 credits); static course cards in `ALL_COURSES_META`. | ❌ Offline Mock | `student.dashboard`, `student.myCourses`, `student.overview` |
| **Schedule** | Static HTML blocks for Wed/Tue/Sun lectures. | ❌ Offline Mock | `student.todaySchedule`, `student.fullSchedule` |
| **Academic Alerts** | Static notification cards and count badges. | ❌ Offline Mock | `student.academicAlerts` |
| **Free-Time Study Planner** | Static simulated 9:00 PM - 11:00 PM schedule generation. | ❌ Offline Mock | `aiChat.generateFreeTimeStudyPlan` |
| **Degree Roadmap** | `loadDynamicRoadmap()` uses broken relative URL `/api/trpc/...`. | ⚠️ Broken Live Call | `courses.getMajorDegreeRoadmap` (with configured host) |

### 3.2 Lightweight Vanilla JS `ApiClient` Design
Because `ios-app/www/index.html` is a standalone HTML bundle, the network client must be lightweight, dependency-free, and directly compatible with tRPC's SuperJSON transformer wire protocol.

```javascript
/**
 * Oliver ZUJ Mobile Network Client
 * Handles tRPC 11 wire protocol with SuperJSON data format
 */
const ApiClient = {
  // 1. Host Configuration
  getBaseUrl() {
    return localStorage.getItem('oliver_server_url') || 'http://172.20.10.4:3000';
  },
  setBaseUrl(url) {
    const cleaned = (url || '').trim().replace(/\/+$/, '');
    localStorage.setItem('oliver_server_url', cleaned);
    return cleaned;
  },

  // 2. Token & Session Management
  getToken() {
    return localStorage.getItem('oliver_auth_token') || null;
  },
  setSession(token, user) {
    if (token) localStorage.setItem('oliver_auth_token', token);
    else localStorage.removeItem('oliver_auth_token');
    if (user) localStorage.setItem('oliver_user', JSON.stringify(user));
    else localStorage.removeItem('oliver_user');
  },
  clearSession() {
    localStorage.removeItem('oliver_auth_token');
    localStorage.removeItem('oliver_user');
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('oliver_user') || 'null');
    } catch { return null; }
  },

  // 3. tRPC Query (GET)
  async query(path, input) {
    const base = this.getBaseUrl();
    let url = `${base}/api/trpc/${path}`;
    if (input !== undefined) {
      url += `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
    }
    const headers = { 'Accept': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Error HTTP ${res.status}`);
    }
    const data = await res.json();
    return data?.result?.data?.json ?? data?.result?.data;
  },

  // 4. tRPC Mutation (POST)
  async mutate(path, input) {
    const base = this.getBaseUrl();
    const url = `${base}/api/trpc/${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ json: input ?? {} }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Error HTTP ${res.status}`);
    }
    const data = await res.json();
    return data?.result?.data?.json ?? data?.result?.data;
  },

  // 5. Connectivity Ping Test
  async testConnection(targetUrl) {
    const base = (targetUrl || this.getBaseUrl()).replace(/\/+$/, '');
    const startTime = performance.now();
    try {
      const res = await fetch(`${base}/api/trpc/aiChat.getStatus`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000),
      });
      const latencyMs = Math.round(performance.now() - startTime);
      if (res.ok) {
        const json = await res.json();
        const status = json?.result?.data?.json ?? json?.result?.data;
        return { ok: true, latencyMs, status };
      }
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err.message || 'Connection timed out' };
    }
  }
};
```

---

## 4. In-App Configurable Server Host Design

### 4.1 Identified Defects in Current Setup
In `ios-app/scripts/bundle-app.mjs`:
- Modal `#ios-server-modal` is defined at the bottom of the DOM, but **there is no button or trigger in the interface to call `openServerConfigModal()`**. On an iPhone, the user can never open it.
- The existing ping script calls `/api/trpc/auth.me` (which returns 401 unauthenticated if not logged in, confusing the user into thinking the server is offline).
- The modal does not offer preset options (e.g. `http://172.20.10.4:3000` vs `http://172.20.10.3:3000` vs localhost).

### 4.2 Recommended User Experience & Interface
1. **Persistent Header Network Pill**:
   - Position: Top-right corner of the app header (safe area aware).
   - Display:
     - Connected: `🟢 172.20.10.4` (compact, tap to configure)
     - Offline: `🔴 Offline` (pulsing indicator)
   - Tapping the pill immediately opens `#ios-server-modal`.
2. **Sign-In Screen Trigger**:
   - On the new Sign-In screen, provide an explicit `📡 Server Host: http://172.20.10.4:3000 (Change)` button so the user can verify or change the host before submitting login credentials.
3. **Preset Chips in Modal**:
   - Provide quick-tap buttons:
     - `172.20.10.4:3000` (Default Laptop IP)
     - `172.20.10.3:3000` (Alternate Hotspot IP)
     - `localhost:3000` (Mac/Simulator)
4. **Live Latency Ping**:
   - Point ping check to `/api/trpc/aiChat.getStatus` (public endpoint requiring no credentials).
   - Display real-time round-trip latency (`✅ Connected (14ms)`) and database health indicator.

---

## 5. Authentication Flow & Dual-Auth Security Architecture

### 5.1 The Cross-Origin Mobile Authentication Challenge
1. In desktop browsers, `auth.login` sets an HTTP-only cookie `app_session_id` (`SameSite=Lax`).
2. On iOS Capacitor, WKWebView executes from origin `capacitor://localhost`. Requests to `http://172.20.10.4:3000` are cross-origin.
3. Apple's WebKit ITP automatically drops or blocks cookies on cleartext cross-origin requests.
4. Furthermore, `server/routers/auth.ts` lines 293-302 currently omit the JWT `token` from the return JSON:
   ```typescript
   return {
     success: true,
     user: { id: user.id, email: user.email, name: user.name, role: user.role, language: user.language }
   };
   ```
5. `server/_core/sdk.ts` line 36 only checks `req.headers.cookie`.

### 5.2 The Unified Dual-Auth Solution
To guarantee 100% reliability across both desktop browsers (cookies) and native iOS (Bearer tokens), the backend should support dual authentication:

#### Change 1: `server/_core/sdk.ts` (Bearer Token Support)
```typescript
function extractToken(req: Request): string | null {
  // Check Authorization: Bearer <token> header first (for mobile/API clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }
  // Fall back to cookie (for desktop browser sessions)
  const cookies = req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  return cookieMatch ? cookieMatch[1] : null;
}
```

#### Change 2: `server/routers/auth.ts` (Return Token in Login)
```typescript
// In authRouter.login mutation:
const token = await generateLocalAuthToken({
  userId: user.id,
  email: user.email,
  name: user.name || "",
  role: user.role,
});

// Set cookie for browser clients
ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 604800000 });

// Return token in payload for mobile/native clients!
return {
  success: true,
  token, // <--- Crucial for mobile localStorage Bearer auth
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
  },
};
```

#### Change 3: Mobile Native Sign-In Screen
Add a dedicated Sign-In screen/modal on app boot:
- Check `localStorage.getItem('oliver_auth_token')`.
- If token exists, call `auth.me` via `ApiClient.query('auth.me')`. If valid, mount the dashboard directly.
- If token is missing or expired, present the modern "iOS 27 Liquid Glass" Sign-In screen with:
  - University Email input (`@zuj.edu.jo` or `@std-zuj.edu.jo`)
  - Password input
  - Quick-Fill Test Account Chips:
    - `Hanan (Student)` -> `hanan@gmail.com`
    - `Basma (Student)` -> `basma.hassan@zuj.edu.jo`
    - `Khaled (Student)` -> `khaled.haddad@zuj.edu.jo`
    - `Dr. Ahmad (Advisor)` -> `a.khalil@zuj.edu.jo`
    - (Default password pre-filled or hint: `password123`)
  - Server connection status pill with edit button.

---

## 6. Live Endpoint Mapping Matrix

| App Feature | Operation Type | tRPC Endpoint | Request Payload | Response Data Handled |
| :--- | :--- | :--- | :--- | :--- |
| **Login** | Mutation | `auth.login` | `{ email, password }` | `{ success, token, user }` -> Save to `localStorage` |
| **Session Restore** | Query | `auth.me` | None | `{ id, email, name, role, language }` |
| **Logout** | Mutation | `auth.logout` | None | Clear `localStorage`, redirect to login screen |
| **Student Dashboard** | Query | `student.dashboard` | `{ studentId?: number }` | `{ student, studyPlan, courses, stats: { gpa, earnedCredits, totalCredits, progress } }` |
| **My Courses** | Query | `student.myCourses` | `{ studentId?: number }` | `Array<{ id, courseId, code, name, credits, status, grade }>` |
| **Today's Schedule** | Query | `student.todaySchedule` | `{ studentId?: number }` | `Array<{ id, courseCode, courseName, startTime, endTime, hall, doctorName }>` |
| **Weekly Schedule** | Query | `student.fullSchedule` | `{ studentId?: number }` | Complete day-by-day course schedule with halls |
| **Assignments** | Query | `student.assignments` | `{ studentId?: number, status?: string }` | `Array<{ id, status, score, title, courseCode, dueDate, description }>` |
| **Submit Assignment** | Mutation | `student.submitAssignment` | `{ assignmentId, solutionText, selectedOption }` | `{ success: true, submittedAt }` -> Toast notification |
| **Academic Alerts** | Query | `student.academicAlerts` | `{ studentId?: number }` | `Array<{ id, title, severity, message, courseCode, createdAt }>` |
| **Attendance QR Scan**| Mutation | `student.recordAttendanceViaQr`| `{ courseId, qrPayload, latitude, longitude }`| `{ success: true, message: "Attendance verified" }` |
| **AI Chat Message** | Mutation | `aiChat.sendMessage` | `{ conversationId, message }` | `{ success, response, isOfflineFallback, source }` |
| **AI Strategy** | Query | `aiChat.getCourseStudyStrategy`| `{ courseCode: "CS201", language: "ar" }` | `{ strategy, markdown }` |
| **AI Engine Status** | Query | `aiChat.getStatus` | None | `{ isOnline, mode, model }` |
| **Degree Roadmap** | Query | `courses.getMajorDegreeRoadmap` | `{ studentId: number }` | `{ summary, families }` |

---

## 7. Step-by-Step Implementation Roadmap for Builders

### Step 1: Server Hardening (Backend)
1. In `server/_core/index.ts`:
   - Add CORS middleware handling `Origin` reflection, credentials, and `OPTIONS` preflight 204 response.
   - Update CSP header `connect-src` to include `http:` and `http://*:*`.
2. In `server/_core/sdk.ts`:
   - Support `Authorization: Bearer <token>` header in `authenticateRequest()`.
3. In `server/routers/auth.ts`:
   - Return `{ success: true, token, user }` from `auth.login`.
   - Support Bearer token in `auth.me` procedure.

### Step 2: App Network Client & Storage Integration (`ios-app/`)
1. Implement the lightweight `ApiClient` in `ios-app/www/index.html` (or via `scripts/bundle-app.mjs`).
2. Add the Server Host Configuration modal trigger (pill in header) and preset selector.
3. Wire the ping test to `aiChat.getStatus` with latency measurement.

### Step 3: Authentication UI & State Machine
1. Create the native Sign-In view with validation and quick-fill chips for `hanan@gmail.com`, `basma.hassan@zuj.edu.jo`, `a.khalil@zuj.edu.jo`.
2. On sign-in success, store `oliver_auth_token` and `oliver_user`, then trigger `loadLiveDashboard()`.
3. On app launch, attempt auto-login via `auth.me`.

### Step 4: Replace Static Mockups with Live Queries
1. Replace static dashboard numbers and course cards with live data from `student.dashboard` and `student.myCourses`.
2. Replace static schedule blocks with live data from `student.todaySchedule` and `student.fullSchedule`.
3. Replace `ASSIGNMENTS_DB` with live calls to `student.assignments` and `student.submitAssignment`.
4. Connect the QR scanner check-in to `student.recordAttendanceViaQr`.
5. Connect Oliver AI chat to `aiChat.sendMessage` with live server responses, typing animations, and offline fallback indicator.
6. Fix `courses.getMajorDegreeRoadmap` to use the absolute `ApiClient` base URL.

---

## 8. Conclusion
The Murshid backend and MariaDB database already possess all necessary entities, relationships, accounts, and endpoints required for a full-scale native iOS deployment. By implementing CORS headers, Bearer token authentication, and the lightweight `ApiClient` within `ios-app`, the mobile app will be fully transformed from an offline web simulation into a connected native application communicating seamlessly with `http://172.20.10.4:3000`.
