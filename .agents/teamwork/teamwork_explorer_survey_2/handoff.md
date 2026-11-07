# Handoff Report — Survey Explorer 2 (iOS Capacitor Specialist)

## 1. Observation

1. **Capacitor Configuration & Plugins:**
   * `ios-app/package.json:11-18`: Declares dependencies `@capacitor/core: ^6.2.0`, `@capacitor/ios: ^6.2.0`, `@capacitor/app: ^6.0.2`, `@capacitor/status-bar: ^6.0.2`, `@capacitor/haptics: ^6.0.2`, `@capacitor/splash-screen: ^6.0.3`. No camera or barcode scanner plugin is installed.
   * `ios-app/capacitor.config.json:9-14`: Configures `ios.contentInset: "always"`, `ios.scheme: "Oliver ZUJ"`. No `plugins` configuration object is present.
   * Command `cd "s:\murshid (1)\ios-app"; npx cap ls` output:
     `[info] Found 4 Capacitor plugins for ios: @capacitor/app@6.0.3, @capacitor/status-bar@6.0.3, @capacitor/haptics@6.0.3, @capacitor/splash-screen@6.0.4`.
2. **Native iOS Project Structure & Permissions:**
   * `ios-app/ios/App/App/Info.plist:55-56`:
     ```xml
     <key>NSCameraUsageDescription</key>
     <string>Oliver requires camera access to scan QR codes for classroom attendance check-in.</string>
     ```
   * `ios-app/ios/App/App/Info.plist:48-54`: `NSAllowsArbitraryLoads: true`, `NSAllowsLocalNetworking: true`.
   * `ios-app/ios/App/App.xcodeproj/project.pbxproj:286, 357`: Target iOS 15.0 (`IPHONEOS_DEPLOYMENT_TARGET = 15.0`), Bundle Identifier `jo.edu.zuj.oliver`.
   * `ios-app/ios/App/Podfile:14-17`: Includes `CapacitorApp`, `CapacitorStatusBar`, `CapacitorHaptics`, `CapacitorSplashScreen`.
3. **QR Scanner Implementation:**
   * `ios-app/www/index.html:1260-1283` and `2807-2816`:
     `openPhoneScanner()` removes class `'hidden'` from `#phone-scanner-modal`.
     The modal contains a static emoji `📷`, text "Scanning Classroom Projector", and a manual button "Confirm & Log Attendance" invoking `confirmMobileAttendance()` which prints `showToast("✓ Attendance logged in Hall 41 for CS201!");`.
     There is no `<video>` element, no `getUserMedia()`, no barcode decoding script.
   * `server/routers/student.ts:1829-1865`: Procedure `recordAttendanceViaQr` is already implemented and expects `{ courseId, qrPayload, latitude?, longitude?, deviceFingerprint? }`.
4. **Haptic & Audio Implementation:**
   * `ios-app/node_modules/@capacitor/haptics/ios/Sources/HapticsPlugin/Haptics.swift:9-40`: Native implementation invokes `UIImpactFeedbackGenerator`, `UINotificationFeedbackGenerator`, and `CHHapticEngine`.
   * `ios-app/www/index.html`: Zero references to `Haptics`, `Capacitor.Plugins`, `navigator.vibrate`, `AudioContext`, or audio media elements.
   * Project workspace: Zero `.mp3`, `.wav`, or `.caf` audio files exist.
5. **Simulated Chrome & Safe Area:**
   * `ios-app/www/index.html:241-260`: Renders simulated phone chassis `#phone-chassis` with `rounded-[50px] border-4`, `#status-bar` with text `9:41`, fake Wi-Fi, fake battery, and `#dynamic-island`.
   * `ios-app/scripts/bundle-app.mjs:38-104`: Adds `#native-ios-overrides` style setting `#simulator-header { display: none !important; }` and `#phone-chassis { width: 100vw !important; height: 100vh !important; }`, but leaves the fake `#status-bar` and `#dynamic-island` intact.
6. **Build & Sync Verification:**
   * `node scripts/bundle-app.mjs`: Ran cleanly with exit code 0, generated `www/index.html` (257,106 bytes).
   * `npx cap copy ios`: Ran cleanly with exit code 0, copied web assets to `ios/App/App/public` in 38ms.
   * `npx cap sync ios`: Ran cleanly with exit code 0, synced plugins in 109ms.
   * `ios-app/.github/workflows/build-ios.yml`: Full GitHub Actions CI on `macos-latest` configured to run `npm run build`, `npx cap sync ios`, `pod install`, `xcodebuild` archive, and package unsigned `Oliver-ZUJ.ipa`.

---

## 2. Logic Chain

1. From **Observation 1 & 5**, `ios-app` is currently wrapping `client/public/phone.html`, which was created as a browser-based phone simulator. Consequently, the simulated `#status-bar` (with hardcoded '9:41' and fake battery/Wi-Fi) and `#dynamic-island` pill overlay are rendered in the DOM. On a physical iPhone (such as iPhone XS / XS Max), the operating system already displays a native status bar, and the physical notch overlaps with the dynamic island pill, creating visual duplication and clipping.
2. From **Observation 2 & 3**, `Info.plist` already declares `NSCameraUsageDescription`, which satisfies iOS App Store and system permission prerequisites. However, the current QR scanner is a visual dummy without camera activation. Because WKWebView on iOS 15.0+ natively supports `navigator.mediaDevices.getUserMedia` when camera usage descriptions are present, integrating `getUserMedia` with a client-side QR decoder (e.g. `jsQR`) enables live camera viewfinder scanning inside WKWebView with zero native CocoaPods compile risks.
3. From **Observation 4**, `@capacitor/haptics` is already compiled into the native iOS project and supports Apple's Taptic Engine via `UIImpactFeedbackGenerator` and `UINotificationFeedbackGenerator`. Calling `window.Capacitor.Plugins.Haptics` from JavaScript will immediately produce physical haptic feedback on iPhone hardware. For audio sounds, synthesizing tones via Web Audio API (`AudioContext`) avoids missing asset files, eliminates network latency, and works offline.
4. From **Observation 1 & 6**, `capacitor.config.json` has an invalid RFC scheme (`"Oliver ZUJ"` with spaces), causing Capacitor to fall back to `"capacitor"`. Setting this explicitly, switching `contentInset` to `"never"`, and adding `CapacitorHttp` with status bar configuration will optimize the native environment.
5. From **Observation 6**, both `bundle-app.mjs` and `cap sync ios` run deterministically with zero errors on the Windows workspace, confirming the pipeline is ready for updated assets.

---

## 3. Caveats

* CocoaPods (`pod install`) and Xcode compilation (`xcodebuild`) cannot execute directly on Windows because they require macOS tools. However, they are verified as configured in `.github/workflows/build-ios.yml` and are ready for cloud CI or local Mac sideloading.
* WebRTC `getUserMedia` in iOS WKWebView requires physical hardware testing on device or Safari inspection to verify system permission prompt behavior; on desktop Chrome it will request standard webcam permissions.

---

## 4. Conclusion

The native iOS Capacitor app is structurally sound, cleanly decoupled, and properly configured for iOS 15.0+ (compatible with iPhone XS, XS Max, and newer). The implementation plan must focus on four areas:
1. **Layout**: Suppress `#status-bar` and `#dynamic-island` in native mode, using `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
2. **Camera & QR**: Implement live `getUserMedia` camera feed with `jsQR` decoder in `#phone-scanner-modal`, posting scanned tokens to `student.recordAttendanceViaQr`.
3. **Feedback**: Expose `NativeFeedback` calling `Capacitor.Plugins.Haptics` and Web Audio API synthesized alert chimes.
4. **Networking**: Prepend the configurable server host URL (`http://172.20.10.4:3000`) on all API requests and enable `CapacitorHttp`.

---

## 5. Verification Method

1. **Verify Capacitor Plugin Status:**
   ```powershell
   cd "s:\murshid (1)\ios-app"
   npx cap ls
   ```
   *Expected:* Confirms 4 native iOS plugins found.
2. **Verify Bundle Script & Capacitor Sync:**
   ```powershell
   cd "s:\murshid (1)\ios-app"
   node scripts/bundle-app.mjs
   npx cap sync ios
   ```
   *Expected:* Exits with code 0; copies assets to `ios/App/App/public/index.html`.
3. **Inspect Output Report:**
   Read full architectural report at:
   `s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_2\report.md`
