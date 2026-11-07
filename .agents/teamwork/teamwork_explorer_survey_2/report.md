# iOS Capacitor Native App Survey & Architecture Report

**Specialist Role:** Survey Explorer 2 (iOS Capacitor Specialist)  
**Date:** 2026-11-07  
**Scope:** `s:\murshid (1)\ios-app` & relevant integration points in `client/` and `server/`

---

## Executive Summary

The `ios-app/` project provides an isolated Capacitor 6.2 native iOS wrapper intended for iPhone deployment (targeting iOS 15.0+ on physical devices such as iPhone XS and iPhone XS Max). Currently, the app functions primarily as a packaged web simulator (`phone.html`) rather than a fully integrated native iOS application:
1. **Simulated Chrome**: The UI renders a simulated iPhone chassis with a hardcoded status bar ('9:41', fake Wi-Fi, fake battery) and a fake dynamic island pill overlay. On a physical iPhone, this creates duplicate status bars and conflicts with the real hardware notch.
2. **Camera & QR Scanning**: The QR scanner (`openPhoneScanner()`) is currently a static mockup displaying a camera emoji (`📷`) and simulated text. No camera feed or QR decoding plugin is active. However, `NSCameraUsageDescription` is already configured in `ios/App/App/Info.plist`.
3. **Audio & Haptics**: `@capacitor/haptics` is installed and declared in CocoaPods, but is never invoked from JavaScript. No audio sound effects or Web Audio synthesizer exist.
4. **Network & Backend**: Most data (assignments, chat AI responses) is hardcoded offline. API calls use relative paths (`/api/trpc/...`), which fail inside WKWebView (`capacitor://localhost`).
5. **Build & Sync**: Capacitor CLI 6.2.3 and sync scripts work cleanly. Web bundling script (`scripts/bundle-app.mjs`) builds `www/index.html`, and `npx cap sync ios` synchronizes web assets to `ios/App/App/public` and updates native plugin configurations.

---

## 1. Native Capacitor Configuration

### 1.1 `package.json` Analysis
**File Path:** `s:\murshid (1)\ios-app\package.json`

```json
{
  "name": "oliver-ios-app",
  "version": "1.0.0",
  "private": true,
  "description": "Oliver ZUJ Academic Advising & E-Learning iOS App",
  "type": "module",
  "scripts": {
    "sync": "cap sync ios",
    "build": "node scripts/bundle-app.mjs"
  },
  "dependencies": {
    "@capacitor/core": "^6.2.0",
    "@capacitor/ios": "^6.2.0",
    "@capacitor/app": "^6.0.2",
    "@capacitor/status-bar": "^6.0.2",
    "@capacitor/haptics": "^6.0.2",
    "@capacitor/splash-screen": "^6.0.3"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.2.0"
  }
}
```

* **Installed Core Packages:** Capacitor Core 6.2.3, Capacitor iOS 6.2.3, Capacitor CLI 6.2.3.
* **Installed Plugins:** `@capacitor/app@6.0.3`, `@capacitor/status-bar@6.0.3`, `@capacitor/haptics@6.0.3`, `@capacitor/splash-screen@6.0.4`.
* **Missing Plugins:** No camera / barcode scanning plugin is installed in `dependencies`.

### 1.2 `capacitor.config.json` Analysis
**File Path:** `s:\murshid (1)\ios-app\capacitor.config.json`

```json
{
  "appId": "jo.edu.zuj.oliver",
  "appName": "Oliver ZUJ",
  "webDir": "www",
  "server": {
    "cleartext": true,
    "allowNavigation": ["*"]
  },
  "ios": {
    "contentInset": "always",
    "preferredContentMode": "mobile",
    "scheme": "Oliver ZUJ",
    "limitsNavigationsToAppBoundDomains": false
  }
}
```

* **Issues & Recommended Improvements:**
  1. `"scheme": "Oliver ZUJ"`: RFC 3986 forbids whitespace in URI schemes. Capacitor iOS `CAPInstanceDescriptor.swift:159` validates schemes against `^[a-z][a-z0-9.+-]*$`; because `"Oliver ZUJ"` fails this regex, Capacitor silently falls back to `"capacitor"`. Setting `"scheme": "capacitor"` or `"oliver-zuj"` avoids parsing ambiguity.
  2. `"contentInset": "always"`: In edge-to-edge layouts using `viewport-fit=cover` and CSS `env(safe-area-inset-top)`, WKWebView's automatic `contentInsetAdjustmentBehavior` can cause unexpected double margins or vertical jumping. Setting `"contentInset": "never"` or `"automatic"` is recommended.
  3. **Missing `plugins` configuration**: Adding configuration for `StatusBar`, `SplashScreen`, and `CapacitorHttp`:
     ```json
     "plugins": {
       "StatusBar": {
         "overlaysWebView": true,
         "style": "DARK"
       },
       "SplashScreen": {
         "launchShowDuration": 1500,
         "backgroundColor": "#05110a"
       },
       "CapacitorHttp": {
         "enabled": true
       }
     }
     ```
     Enabling `CapacitorHttp` natively routes `fetch` and `XMLHttpRequest` through iOS `URLSession`, avoiding CORS restrictions and cookie synchronization issues over local Wi-Fi.

### 1.3 Native iOS Project Structure (`ios/App`)
* **Xcode Project:** `ios/App/App.xcodeproj`
  * `IPHONEOS_DEPLOYMENT_TARGET`: `15.0` (supports iPhone XS, iPhone XS Max, iPhone 11 through 16 Pro on iOS 15, 16, 17, 18).
  * `PRODUCT_BUNDLE_IDENTIFIER`: `jo.edu.zuj.oliver`.
* **CocoaPods:** `ios/App/Podfile`
  * Platform: `platform :ios, '15.0'`.
  * Frameworks: `use_frameworks!`.
  * Included pods: `Capacitor`, `CapacitorCordova`, `CapacitorApp`, `CapacitorStatusBar`, `CapacitorHaptics`, `CapacitorSplashScreen`.
* **Application Info:** `ios/App/App/Info.plist`
  * `CFBundleDisplayName`: `Oliver ZUJ`
  * `NSCameraUsageDescription`: `Oliver requires camera access to scan QR codes for classroom attendance check-in.` (Already present).
  * `NSAppTransportSecurity`: `NSAllowsArbitraryLoads: true`, `NSAllowsLocalNetworking: true`.
  * `ITSAppUsesNonExemptEncryption`: `false`.

---

## 2. Native Camera Access for QR Code Scanning

### 2.1 Current Implementation State
* In `ios-app/www/index.html` (lines 1260–1283 and 2807–2816):
  * Tapping "Scan QR" invokes `openPhoneScanner()`.
  * `openPhoneScanner()` simply removes `.hidden` from `<div id="phone-scanner-modal">`.
  * The modal contains an emoji `📷` and text:
    ```html
    <div id="phone-scanner-content" class="text-center p-3 space-y-1">
      <div class="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">📷</div>
      <p class="text-[11px] text-white font-bold">Scanning Classroom Projector</p>
      <p class="text-[9px] text-slate-400">Checking 8-second dynamic token...</p>
    </div>
    ```
  * A button "Confirm & Log Attendance" triggers `confirmMobileAttendance()` which simply prints `showToast("✓ Attendance logged in Hall 41 for CS201!");`.
  * **Result**: There is no live camera stream, no QR code decoding, and no connection to the real backend attendance endpoint.

### 2.2 Camera Permissions & Capability
* `NSCameraUsageDescription` is already present in `ios/App/App/Info.plist` (line 55).
* In Capacitor iOS (iOS 15.0+), WKWebView supports WebRTC `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`. When requested, iOS natively triggers the system permission dialog: *"Oliver ZUJ Would Like to Access the Camera: Oliver requires camera access to scan QR codes for classroom attendance check-in."*

### 2.3 Real QR Scanning Solution Architecture
To achieve high-reliability scanning without introducing heavy native CocoaPods dependencies (which can break unsigned IPA builds or Windows tooling):
1. **Live Camera Feed**:
   Use `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } })`.
   Render directly inside `<video id="scanner-video" playsinline autoplay muted>` inside the Liquid Glass modal.
2. **Real-Time QR Decoding Engine**:
   Embed a high-performance zero-dependency QR matrix decoder (such as `jsQR` via canvas `ctx.getImageData()`, with modern `window.BarcodeDetector` fallback if available).
3. **Scan Flow**:
   * Scanner opens -> Camera stream starts -> Animation frame loop scans canvas frames at ~30 fps.
   * Frame matches valid QR pattern -> Stop stream -> Play native haptic notification (`SUCCESS`) + audio chime.
   * Parse token payload (e.g. JSON `{ courseId, hall, window, totp, ts }|sig_...`).
   * Post to backend endpoint: `student.recordAttendanceViaQr`.
   * Display server confirmation toast and refresh attendance records.
4. **Simulator/Fallback Mode**:
   If `getUserMedia` fails (e.g., desktop browser testing or camera permission denied), provide a clean fallback with a manual scan test button so developers and users can still test attendance.

---

## 3. Native Audio and Haptic Feedback

### 3.1 Haptic Feedback State
* `@capacitor/haptics` is installed in `ios-app/node_modules/@capacitor/haptics` and declared in `ios/App/Podfile`.
* Native iOS Swift implementation (`Haptics.swift`) wraps Apple's `UIImpactFeedbackGenerator`, `UINotificationFeedbackGenerator`, `UISelectionFeedbackGenerator`, and `CHHapticEngine`.
* **Current Gap:** There are zero calls to `Capacitor.Plugins.Haptics` or `navigator.vibrate` anywhere in `www/index.html` or `client/public/phone.html`.

### 3.2 Audio Sound Effects State
* There are zero audio files (`.mp3`, `.wav`, `.caf`) in the repository.
* There are zero references to Web Audio API (`AudioContext`) or `HTMLAudioElement`.

### 3.3 Implementation Architecture
A unified `NativeFeedback` helper should be exposed to JavaScript:
```javascript
const NativeFeedback = {
  // Haptic feedback using @capacitor/haptics with Web fallback
  haptics: {
    impact: async (style = 'LIGHT') => {
      try {
        if (window.Capacitor?.Plugins?.Haptics) {
          await window.Capacitor.Plugins.Haptics.impact({ style });
        } else if (navigator?.vibrate) {
          navigator.vibrate(15);
        }
      } catch (e) { console.debug('Haptics error', e); }
    },
    notification: async (type = 'SUCCESS') => {
      try {
        if (window.Capacitor?.Plugins?.Haptics) {
          await window.Capacitor.Plugins.Haptics.notification({ type });
        } else if (navigator?.vibrate) {
          navigator.vibrate([30, 50, 30]);
        }
      } catch (e) { console.debug('Haptics error', e); }
    },
    selection: async () => {
      try {
        if (window.Capacitor?.Plugins?.Haptics) {
          await window.Capacitor.Plugins.Haptics.selectionChanged();
        }
      } catch (e) { console.debug('Haptics error', e); }
    }
  },

  // Audio sounds synthesized via Web Audio API (zero audio files needed, 0ms latency)
  audio: {
    ctx: null,
    getCtx: function() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    },
    playSuccess: function() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Ascending two-tone chime (D5 587Hz -> A5 880Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
    },
    playBeep: function() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6 crisp ping
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    },
    playError: function() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }
};
```
* **Event Integration Points:**
  * **QR Attendance Success:** `NativeFeedback.haptics.notification('SUCCESS'); NativeFeedback.audio.playSuccess();`
  * **Bottom Hotkey Tab Switch:** `NativeFeedback.haptics.impact('LIGHT');`
  * **QR Code Detection Chirp:** `NativeFeedback.audio.playBeep();`
  * **Alert / Warning / Article 14 Warning:** `NativeFeedback.haptics.notification('WARNING'); NativeFeedback.audio.playError();`

---

## 4. Native Layout and Chrome Removal (Requirement R1)

### 4.1 Identified Simulated Chrome
* In `client/public/phone.html` and `ios-app/www/index.html`:
  * **Outer chassis:** `#phone-chassis` with `w-[392px] h-[835px] rounded-[50px] border-4 border-[#3a493c]`.
  * **Inner screen:** `#phone-screen` with `rounded-[42px] border border-white/10`.
  * **Fake Status Bar:** `#status-bar` with text `9:41`, fake Wi-Fi SVG, and fake battery meter.
  * **Fake Dynamic Island:** `#dynamic-island` with camera circle cutout and simulated badge (`Hanan • ZUJ`).
  * **Simulator Header:** `#simulator-header` (desktop controls).

### 4.2 Problems on Physical iPhones (iPhone XS / XS Max)
* iPhone XS / XS Max features a physical hardware notch (display sensor housing), **not** a dynamic island pill. Displaying a simulated dynamic island pill directly beneath the physical notch creates a jarring double-notch visual glitch.
* The physical iPhone displays the real system status bar (current time, carrier, cellular/Wi-Fi, battery level). The simulated status bar ('9:41') results in duplicate status indicators.

### 4.3 Native Layout Architecture
1. **Remove simulated elements** in native packaging:
   * Suppress `#dynamic-island` permanently.
   * Replace fake `#status-bar` content with a sleek native app brand header or let the native iOS status bar sit above the header.
   * Strip chassis borders, rounded outer chassis padding, and fixed width/height constraints.
2. **Safe-Area Insets**:
   * Apply `viewport-fit=cover` in `<meta name="viewport">`.
   * App header: `padding-top: max(env(safe-area-inset-top), 20px)`.
   * Bottom hotkey navigation: `padding-bottom: max(env(safe-area-inset-bottom), 16px); height: calc(60px + env(safe-area-inset-bottom));`.
   * Edge-to-edge scroll view: `#viewport-content { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }`.
3. **Capacitor Status Bar Configuration**:
   * Configure `@capacitor/status-bar` to overlay webview with dark/light content matching the theme.

---

## 5. Live Backend Network Connectivity & Authentication (Requirement R4)

### 5.1 Current Backend State & Deficiencies
1. **Server Host Setting:**
   * `bundle-app.mjs` injected an `#ios-server-modal` that saves `oliver_server_url` to `localStorage` (defaulting to `http://172.20.10.4:3000`).
   * However, the rest of the application code does **not** use `localStorage.getItem('oliver_server_url')`.
2. **Relative URLs in WKWebView:**
   * `loadDynamicRoadmap()` calls `fetch('/api/trpc/courses.getMajorDegreeRoadmap?...')`. In WKWebView on iOS, relative requests resolve to `capacitor://localhost/api/trpc/...`, which yields 404 or fails silently.
3. **Mock Offline Data:**
   * AI Chat (`sendInquiry()`): Hardcoded if-else statements with canned responses; does not call Ollama or `trpc.aiChat.sendMessage`.
   * Assignments: Stored in static in-memory array `ASSIGNMENTS_DB`.
   * Authentication: No login flow exists; active student is toggled via hardcoded strings (`'hanan'`, `'basma'`, `'abood'`).

### 5.2 Required Live Integration Architecture
1. **Global API Client Helper**:
   ```javascript
   function getServerUrl() {
     return (localStorage.getItem('oliver_server_url') || 'http://172.20.10.4:3000').replace(/\/+$/, '');
   }
   async function apiRequest(endpoint, options = {}) {
     const base = getServerUrl();
     const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
     const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
     const token = localStorage.getItem('oliver_auth_token');
     if (token) headers['Authorization'] = `Bearer ${token}`;
     return fetch(url, { ...options, headers, credentials: 'include' });
   }
   ```
2. **Live Authentication Flow**:
   * Provide an in-app native login drawer or screen against `POST /api/trpc/auth.login`.
   * Store session token and user profile in `localStorage`.
   * Check active session on startup via `GET /api/trpc/auth.me`.
3. **Live Attendance QR Verification**:
   * Post scanned QR payload to `POST /api/trpc/student.recordAttendanceViaQr`.
   * Backend verifies token freshness (within 15 seconds) and registers attendance directly into MySQL.
4. **Live Oliver AI Chat**:
   * Post questions to `POST /api/trpc/aiChat.sendMessage` with live streaming / response rendering from the RTX 3050 Ollama model (`oliver-zuj:latest`).

---

## 6. "iOS 27 Liquid Glass" UI Design System (Requirement R5)

Applying the tokens and patterns from `ui-ux-pro-max`:
* **Surface Materials**:
  * Multi-layer frosted glass: `backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);`
  * Liquid tint: `background: rgba(15, 23, 42, 0.65)` layered with subtle emerald glow `radial-gradient(ellipse at top, rgba(16, 185, 129, 0.12), transparent 70%)`.
* **Specular Refractive Edges**:
  * `border: 1px solid rgba(255, 255, 255, 0.14);`
  * `box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.45);`
* **Translucent Floating Cards**:
  * Soft pill shapes (`rounded-3xl`), floating bottom nav with glass capsule styling (`rounded-full mx-4 mb-2`).
* **Contrast & Typography**:
  * High-contrast SF Pro text against deep OLED blacks (`#030705`).
  * Text contrast adheres to WCAG 4.5:1.

---

## 7. iOS Build and Sync Pipeline (Requirement R6)

### 7.1 Build Verification Results
1. **Bundle Script Execution**:
   * Executed: `cd "s:\murshid (1)\ios-app"; node scripts/bundle-app.mjs`
   * Result: Exit code 0, generated `www/index.html` (257,106 bytes).
2. **Capacitor Copy Execution**:
   * Executed: `npx cap copy ios`
   * Result: Exit code 0, web assets copied to `ios/App/App/public` in 38ms.
3. **Capacitor Sync Execution**:
   * Executed: `npx cap sync ios`
   * Result: Exit code 0, updated iOS plugins (`@capacitor/app`, `@capacitor/status-bar`, `@capacitor/haptics`, `@capacitor/splash-screen`), skipped CocoaPods gracefully on Windows.
4. **GitHub Actions Workflow**:
   * Workflow file: `ios-app/.github/workflows/build-ios.yml`
   * Trigger: `push` on `main`/`master` (paths `ios-app/**`) or manual `workflow_dispatch`.
   * Environment: `macos-latest` with Node 20, Xcode, CocoaPods.
   * Output: Builds and packages unsigned `Oliver-ZUJ.ipa` suitable for Sideloadly or AltStore installation.

---

## Conclusion & Implementation Roadmap

The iOS Capacitor native infrastructure is sound, cleanly isolated, and ready for transformation:
* **Step 1 (Layout & Chrome):** Remove fake `#status-bar` and `#dynamic-island`; implement true safe-area padding matching iPhone XS / XS Max physical notch dimensions.
* **Step 2 (Camera & QR):** Implement WebRTC `getUserMedia` with HTML5 canvas QR decoding inside `#phone-scanner-modal` using `NSCameraUsageDescription`, linking directly to `student.recordAttendanceViaQr`.
* **Step 3 (Feedback):** Implement `NativeFeedback` wrapper combining `@capacitor/haptics` and Web Audio API synthesizer for check-in sounds and haptic taps.
* **Step 4 (Network & Auth):** Wire all API endpoints to `getServerUrl()` (`http://172.20.10.4:3000`), enabling live authentication, AI chat via Ollama, and real attendance tracking.
* **Step 5 (Liquid Glass UI):** Apply the "iOS 27 Liquid Glass" styling across cards, modals, and navigation.
* **Step 6 (Sync & Verification):** Run `npm run build` and `npx cap sync ios`, verifying clean packaging.
