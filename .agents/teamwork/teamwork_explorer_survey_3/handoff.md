# Handoff Report: Backend Network, Authentication & API Specialist

**Sender:** Survey Explorer 3 (Backend Network Specialist)  
**Recipient:** Orchestrator / Builder Agents  
**Date:** 2026-11-07  
**Artifacts Produced:**  
- `s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_3\report.md` (Detailed Investigation Report)  
- `s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_3\handoff.md` (5-Component Handoff)  
- `s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_3\BRIEFING.md` (Situational Awareness)  
- `s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_3\progress.md` (Heartbeat Log)

---

## 1. Observation

1. **Backend Server & Port Configuration**:
   - In `server/_core/index.ts` lines 116-120:
     ```typescript
     const port = parseInt(process.env.PORT || "3000");

     server.listen(port, "0.0.0.0", () => {
       console.log(`Server running on http://0.0.0.0:${port}/`);
     });
     ```
   - Express binds to `0.0.0.0:3000`, making it accessible across the local network.
   - Network adapter check (`Get-NetIPAddress -AddressFamily IPv4`) shows Wi-Fi adapter is currently assigned `172.20.10.3` (DHCP on iOS Personal Hotspot), while original target is `http://172.20.10.4:3000`.

2. **Database & Verified User Accounts**:
   - `npm run db:validate` executed with code 0: MariaDB 10.11 at `localhost:3306/murshid` contains 31 tables.
   - MariaDB query on `users` table revealed 27 active users. Passwords verified via `verifyPassword` (`server/_core/authSecurity.ts`):
     - `Hanan` (ID 240002, `hanan@gmail.com`): password is `password123`.
     - `Basma Hassan` (ID 210029, `basma.hassan@zuj.edu.jo`): password is `password123`.
     - `Khaled Haddad` (ID 210027, `khaled.haddad@zuj.edu.jo`): password is `password123`.
     - `Dr. Ahmad Khalil` (ID 210024, `a.khalil@zuj.edu.jo`): password is `password123`.
     - `Abood` (ID 1, `abood@gmail.com`): password is `password123`.
   - Verified student courses and study plan in DB: Hanan has 4 completed courses (`CS101`, `MATH101`, `ENG101`, `PHYS101`), 4 in-progress courses (`CS201`, `CS202`, `PHYS102`, `ENG102`), and active study plan (GPA 3.68, 78 completed credits). Over 400 assignment records exist in `studentAssignments`.

3. **CORS & Security Header Gap in Backend**:
   - In `server/_core/index.ts` lines 28-69:
     - Express sets strict CSP (`connect-src 'self' https:;`) without `http:`.
     - No CORS middleware exists (`app.use(cors(...))` is not present, no `Access-Control-Allow-Origin` headers are set, and HTTP `OPTIONS` preflight requests are unhandled).

4. **Authentication & Session Header Gap**:
   - In `server/_core/sdk.ts` lines 36-40:
     ```typescript
     function extractSessionCookie(req: Request): string | null {
       const cookies = req.headers.cookie || "";
       const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
       return cookieMatch ? cookieMatch[1] : null;
     }
     ```
     Only checks `req.headers.cookie`. `req.headers.authorization` is completely ignored.
   - In `server/routers/auth.ts` lines 293-302:
     ```typescript
     return {
       success: true,
       user: {
         id: user.id,
         email: user.email,
         name: user.name,
         role: user.role,
         language: user.language,
       },
     };
     ```
     `token` is generated on line 268 but omitted from the return payload, preventing mobile clients from extracting and saving it in `localStorage`.

5. **iOS App Mockup Inspection**:
   - In `client/public/phone.html` and `ios-app/www/index.html`:
     - Line 2750: `function sendInquiry(q)`: Hardcoded string checks (`qLower.includes('cs201')`) with `setTimeout` returning static template responses.
     - Lines 2700-2720: `openPhoneScanner()` displays static modal; `confirmMobileAttendance()` displays fake toast (`showToast("Attendance logged in Hall 41 for CS201!")`).
     - Line 2600: `const ASSIGNMENTS_DB = [...]` static in-memory array.
     - Line 3500: `loadDynamicRoadmap` contains the ONLY `fetch()` call: `fetch('/api/trpc/courses.getMajorDegreeRoadmap?...')`, which uses a relative URL that fails inside Capacitor WKWebView (`capacitor://localhost/`).
   - In `ios-app/scripts/bundle-app.mjs`:
     - Injects `#ios-server-modal` into `index.html`, but **zero buttons or triggers exist in the DOM to call `openServerConfigModal()`**.

6. **iOS Hardware & Permissions**:
   - `ios-app/ios/App/App/Info.plist`:
     - `NSAppTransportSecurity` already includes `NSAllowsArbitraryLoads: true` and `NSAllowsLocalNetworking: true`.
     - `NSCameraUsageDescription` is already present.

---

## 2. Logic Chain

1. **From Observation 1 & 3 to CORS Conclusion**:
   - The backend runs on `http://0.0.0.0:3000` and accepts network traffic.
   - However, iOS Capacitor serves the app web bundle from `capacitor://localhost`.
   - When WKWebView issues a cross-origin `fetch` to `http://172.20.10.4:3000/api/trpc/...`, WebKit issues an HTTP `OPTIONS` preflight.
   - Because `server/_core/index.ts` has no CORS middleware or `OPTIONS` handler, the preflight fails, and WebKit blocks all requests before they reach tRPC routers.
   - **Conclusion**: CORS middleware with origin reflection and OPTIONS handling must be added to Express.

2. **From Observation 4 to Dual-Auth Conclusion**:
   - iOS WebKit Intelligent Tracking Prevention (ITP) drops cross-origin cookies between `capacitor://localhost` and `http://172.20.10.4:3000`.
   - Even if `auth.login` succeeds, `Set-Cookie` is unreliable in cross-origin WKWebView.
   - Because `auth.login` omits `token` from its response and `sdk.ts` ignores `Authorization: Bearer <token>`, the app cannot maintain an authenticated session via tokens.
   - **Conclusion**: `auth.login` must return `token` in its JSON payload, and `sdk.ts` / `auth.me` must accept `Authorization: Bearer <token>` headers.

3. **From Observation 2 & 5 to Mock Replacement Conclusion**:
   - All simulated student data (Hanan, Basma, Dr. Ahmad Khalil) already exist with matching courses, grades, study plans, and assignments in MariaDB.
   - Procedural endpoints in `server/routers/student.ts` (`student.dashboard`, `student.myCourses`, `student.todaySchedule`, `student.assignments`, `student.submitAssignment`, `student.recordAttendanceViaQr`) and `server/routers/aiChat.ts` (`aiChat.sendMessage`, `aiChat.getStatus`) are already fully implemented and verified in the backend.
   - **Conclusion**: Replacing the static JavaScript functions with standard tRPC calls through a vanilla JS `ApiClient` directly connects the app to real data.

4. **From Observation 5 to Server Host Config Conclusion**:
   - The user cannot open `#ios-server-modal` because no UI trigger exists.
   - The user needs to configure the server URL both before logging in and from inside the app, especially because Hotspot IPs fluctuate (`172.20.10.4` vs `172.20.10.3`).
   - **Conclusion**: Add a header network status pill (tap to open modal) and a Sign-In screen link, with a live latency ping pointing to `aiChat.getStatus`.

---

## 3. Caveats

1. **DHCP IP Fluctuation**: While `http://172.20.10.4:3000` is the default target, the host laptop's Wi-Fi IP was observed at `172.20.10.3` during investigation. The builder must ensure the in-app configurable server host setting and preset selector are fully functional so the user can easily select the active IP.
2. **Local AI Model Status**: `aiChat.sendMessage` connects to local Ollama on port 11434 when available, and automatically falls back to the responsive 3-tier offline engine (FAQ + academic rules + simulated advisor) if Ollama is not running. The network connection to port 3000 will succeed in either mode.
3. **No Code Modified**: In strict adherence to Explorer read-only guidelines, no source files were altered during this survey.

---

## 4. Conclusion

1. **Backend Readiness**: The Murshid backend server (`server/`) and MariaDB database (`localhost:3306/murshid`) are 100% operational, containing all necessary schemas, accounts, courses, and endpoints for native mobile execution.
2. **Three Mandatory Backend Fixes**:
   - Add CORS middleware and update CSP `connect-src` in `server/_core/index.ts`.
   - Update `server/_core/sdk.ts` to inspect `req.headers.authorization` for Bearer tokens.
   - Update `server/routers/auth.ts` to return `token` in `auth.login` and support Bearer tokens in `auth.me`.
3. **App Transformation Blueprint**:
   - Implement the lightweight `ApiClient` in `ios-app/www/index.html` (supporting tRPC SuperJSON wire protocol).
   - Add a real Sign-In screen with quick-fill test accounts and session persistence in `localStorage`.
   - Expose the Server Configuration modal via a persistent header pill and sign-in link, with latency pinging against `aiChat.getStatus`.
   - Replace mock functions (`sendInquiry`, `openPhoneScanner`, `renderAssignments`, `setStudent`) with live tRPC queries and mutations.

---

## 5. Verification Method

To independently verify these findings, execute the following commands in powershell:

1. **Verify Database Health & Seeded Accounts**:
   ```powershell
   npm run db:validate
   node .agents/teamwork/teamwork_explorer_survey_3/check_users.js
   ```
   *Expected Output*: MariaDB connection OK (31 tables), 27 users listed including Hanan (ID 240002) and Basma (ID 210029).

2. **Verify Password Authentication Against Real PBKDF2 Hashes**:
   ```powershell
   npx tsx .agents/teamwork/teamwork_explorer_survey_3/test_passwords.js
   ```
   *Expected Output*: `password123=true` for all test users.

3. **Verify App Transport Security (ATS) in Xcode Project**:
   Inspect `ios-app/ios/App/App/Info.plist`: lines 48-54 show `NSAllowsArbitraryLoads: true` and `NSAllowsLocalNetworking: true`.

4. **Verify Missing CORS & Bearer Support in Source Code**:
   - Inspect `server/_core/index.ts`: Observe absence of `cors` middleware and missing `http:` in `connect-src`.
   - Inspect `server/_core/sdk.ts`: Line 36 shows `extractSessionCookie` only parses `req.headers.cookie`.
   - Inspect `server/routers/auth.ts`: Line 293 shows `login` mutation does not return `token`.

5. **Invalidation Conditions**:
   - If Express already had CORS middleware allowing `capacitor://*` and `OPTIONS` preflight, finding #3 would be invalidated (confirmed absent).
   - If WKWebView reliably preserved cleartext HTTP cookies across cross-origin boundaries on iOS 15-18 without Bearer tokens, finding #4 would be invalidated (WebKit ITP guarantees failure).
