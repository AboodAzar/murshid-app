# Project: Murshid Native iOS Capacitor Transformation

## Architecture
- **Client**: Native iOS Capacitor 6.2 Application (`ios-app/`) wrapping responsive HTML5/Tailwind/Vanilla JS bundle (`www/index.html`) running inside WKWebView.
- **UI Design System**: "iOS 27 Liquid Glass" — fluid glassmorphic surfaces, multi-layer backdrop blurs, specular refractive edges, floating translucent glass cards, OLED ambient mesh gradients, and native safe-area layout (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
- **Native Hardware Integration**:
  - Live Camera QR Code Scanner: WebRTC `getUserMedia` with real-time `jsQR` canvas decoder inside WKWebView, backed by `NSCameraUsageDescription` in `Info.plist`.
  - Native Feedback: Apple Taptic Engine via `@capacitor/haptics` combined with Web Audio API synthesized alert audio chimes.
  - Native Status Bar: Edge-to-edge layout with `@capacitor/status-bar` and zero simulated chrome.
- **Backend**: Express + tRPC + MariaDB (`server/`), binding to `0.0.0.0:3000` with default target `http://172.20.10.4:3000`.
  - CORS middleware allowing `capacitor://localhost` and origin reflection.
  - Dual-mode authentication: Session cookies + `Authorization: Bearer <token>` for reliable iOS WebKit ITP cross-origin communication.
  - Configurable server host URL via in-app UI modal, persisted in `localStorage`.
- **Packaging**: Capacitor CLI sync pipeline (`npx cap sync ios`) generating Xcode project ready for sideloading / GitHub Actions Mac CI packaging.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Simulated Chrome Removal | Eliminate fake status bar (9:41, fake battery, fake wifi), fake dynamic island pill, and phone chassis mockups | M2 | R1, Survey E1 |
| 2 | True Edge-to-Edge Safe-Area Layout | Apply dynamic safe area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`), fix double status bar (88px) on iPhone XS/XS Max, fix tab bar squishing, and pad bottom modals | M2 | R1, Survey E1 |
| 3 | iOS 27 Liquid Glass Design System | Fluid glassmorphic surfaces, multi-layer backdrop blurs, specular refractive borders, floating cards, OLED ambient gradients, and responsive touch states | M2 | R5, Survey E1 |
| 4 | Backend CORS & CSP Support | Express CORS middleware with OPTIONS handling and CSP `connect-src` allowing `http:` and `capacitor://localhost` | M1 | R4, Survey E3 |
| 5 | Dual-Mode Bearer Token Authentication | JWT token returned in `auth.login`, parsed from `Authorization: Bearer <token>` in `sdk.ts` and `auth.me` for WebKit ITP compatibility | M1 | R4, Survey E3 |
| 6 | Native Camera Access & QR Scanner | Real live camera feed via `getUserMedia` and `jsQR` canvas decoder in `#phone-scanner-modal` with `NSCameraUsageDescription` | M3 | R2, Survey E2 |
| 7 | Native Haptic & Audio Feedback | Physical Taptic Engine feedback via `@capacitor/haptics` and Web Audio API synthesized alert chimes for check-ins and alerts | M3 | R3, Survey E2 |
| 8 | Configurable Server Host & Network Pill | In-app settings modal to view/update server URL (`http://172.20.10.4:3000` default), live latency ping to `aiChat.getStatus`, and header status pill | M4 | R4, Survey E3 |
| 9 | Live tRPC API Client & App Integration | Vanilla tRPC ApiClient with SuperJSON wire protocol replacing all static mockups (courses, schedule, assignments, study plan, AI chat, QR attendance) | M4 | R4, Survey E3 |
| 10 | Real User Sign-In & Session Handling | Real login against backend MariaDB accounts (`password123`), session persistence in `localStorage`, and logout flow | M4 | R4, Survey E3 |
| 11 | Capacitor Config & Bridge Injection | Add `<script src="capacitor.js"></script>`, configure `capacitor.config.json` (`contentInset: "never"`, scheme, plugins) | M3, M5 | R6, Survey E1/E2 |
| 12 | Updated iOS Build & Asset Sync | Clean `bundle-app.mjs` and `npx cap sync ios` sync to `ios/App/App/public`, Xcode project readiness for packaging | M5 | R6, Survey E2 |
| 13 | Comprehensive E2E Verification & Hardening | Full 5-tier opaque-box and adversarial testing verifying all native features, network authentication, and edge cases | M6 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Backend Network & Dual-Auth Readiness | Add CORS middleware, CSP `http:`, and Bearer token auth in `server/` | none | **DONE** |
| 2 | Native Layout, Chrome Removal & Liquid Glass | Remove fake chrome/mockups, fix safe areas on iPhone XS/XS Max, implement iOS 27 Liquid Glass UI | none | **DONE** |
| 3 | Native Hardware: Camera QR, Haptics & Audio | Live camera feed + jsQR decoding, Capacitor Haptics + Web Audio synthesizer | none | **DONE** |
| 4 | Live API Client, Server Host Config & Features | Vanilla tRPC client, server config modal, real sign-in, live courses/chat/attendance | M1, M2, M3 | **DONE** |
| 5 | Capacitor Sync & iOS Build Pipeline | Capacitor config optimization, asset bundling, `cap sync ios`, Xcode config check | M2, M3, M4 | **DONE** |
| 6 | Final Milestone: E2E Pass & Adversarial Hardening | Pass 100% of E2E test suite (Tiers 1-4) and adversarial coverage hardening (Tier 5) | M1-M5, TEST_READY | **DONE** |

## Interface Contracts

### Backend ↔ Mobile App (CORS & Authentication)
- **Origin Allowed**: `capacitor://localhost`, `http://localhost`, `http://172.20.10.*`
- **Headers Allowed**: `Content-Type`, `Authorization`, `x-trpc-source`, `Cookie`
- **Auth Token Protocol**:
  - `POST /api/trpc/auth.login`: Returns `{ success: true, token: string, user: { id, email, name, role, language } }`
  - `GET /api/trpc/auth.me`: Checks `Authorization: Bearer <token>` header in addition to session cookie; returns user profile.

### Mobile App ↔ Backend (tRPC Endpoints)
- **Base URL**: Configurable from `localStorage.getItem('murshid_server_url') || 'http://172.20.10.4:3000'`
- **Attendance Scan**:
  - `POST /api/trpc/student.recordAttendanceViaQr`
  - Input: `{ courseId: number, qrPayload: string, latitude?: number, longitude?: number }`
  - Output: `{ success: true, message: string, hall: string, courseCode: string }`
- **Live AI Guidance**:
  - `POST /api/trpc/aiChat.sendMessage`
  - Input: `{ message: string, history?: Array<{ role, content }> }`
  - Output: `{ message: string, sources?: Array<any> }`
- **Health / Latency Check**:
  - `GET /api/trpc/aiChat.getStatus`
  - Returns backend status and confirms server reachability.

### Hardware Feedback Contract (`NativeFeedback`)
- **Haptic Trigger**:
  - `NativeFeedback.impact(style)`: calls `Capacitor.Plugins.Haptics.impact({ style: style || 'MEDIUM' })` with fallback to `navigator.vibrate(20)`.
  - `NativeFeedback.notification(type)`: calls `Capacitor.Plugins.Haptics.notification({ type: type || 'SUCCESS' })`.
- **Audio Synthesizer**:
  - `NativeFeedback.playChime(type)`: generates pure Web Audio tones (`'success'` = 523Hz/659Hz/784Hz arpeggio, `'error'` = 220Hz/196Hz buzzer, `'scan'` = 880Hz crisp chirp, `'click'` = 1200Hz 10ms click).

## Code Layout
- `server/_core/index.ts` — Express server initialization, CORS, CSP, middleware.
- `server/_core/sdk.ts` — Authentication session extraction (Cookie + Bearer token).
- `server/routers/auth.ts` — Login mutation and profile queries.
- `ios-app/capacitor.config.json` — Capacitor native iOS configuration.
- `ios-app/scripts/bundle-app.mjs` — Web app bundling script generating `www/index.html`.
- `client/public/phone.html` — Source mobile UI template.
- `ios-app/www/index.html` — Bundled iOS web application.
- `ios-app/ios/App/App/Info.plist` — iOS native configuration, camera permissions, ATS.
- `tests/e2e/ios/` — E2E test suite for native iOS app and backend integration.
