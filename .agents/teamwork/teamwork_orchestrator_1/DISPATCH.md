# Dispatch Log

## 2026-11-07T17:20:34Z

Transform the iOS Capacitor app from a simulated web preview into a fully functional native iOS application featuring native camera QR scanning, native safe-area layout, real audio/haptic feedback, live backend network authentication, and an "iOS 27 Liquid Glass" UI design system.

Working directory: s:\murshid (1)\ios-app
Integrity mode: development

## Requirements

### R1. Native Layout and Chrome Removal
Remove all simulated phone chrome (the fake status bar displaying '9:41', fake battery, fake Wi-Fi, and fake dynamic island overlay). Replace with native iOS status bar integration, true edge-to-edge layout, and native safe area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`) dynamically matching actual device dimensions on physical iPhones (such as iPhone XS and iPhone XS Max).

### R2. Native Camera Access for QR Code Scanning
Provide real camera access on iOS devices for scanning QR codes with required iOS camera usage descriptions (`NSCameraUsageDescription` in Info.plist), opening the live camera feed and processing QR codes rather than showing a placeholder or failing to open.

### R3. Native Audio and Haptic Feedback
Implement real device haptic feedback and alert audio sounds on physical iOS hardware for attendance check-ins, alerts, and status notifications.

### R4. Live Backend Network Connectivity and Authentication
Ensure the iOS app communicates directly over the local network with the live backend server (defaulting to `http://172.20.10.4:3000` with an in-app configurable server host setting) instead of operating offline as a static mockup, enabling real user sign-in, active session handling, database queries, and live AI responses.

### R5. "iOS 27 Liquid Glass" Visual Aesthetic & UI System
Apply the "iOS 27 Liquid Glass" aesthetic across the application interface, featuring fluid glassmorphic surfaces, dynamic multi-layer backdrop blurs, specular refractive edges, floating translucent glass cards, fluid gradients, organic depth, and soft lighting on OLED while maintaining readable typography, high contrast, and responsive touch interactions.

### R6. Updated iOS Build and Sync
Synchronize web assets to the native iOS Capacitor project and ensure the Xcode project is configured and ready for building an updated package for sideloading.

## Acceptance Criteria

### Native Chrome & Layout
- [ ] No simulated or fake status bar, battery icon, Wi-Fi icon, or dynamic island mockups exist in the UI.
- [ ] The app renders edge-to-edge respecting native iOS safe-area insets without overlapping system indicators or notches on iPhone XS and iPhone XS Max.

### Camera & Hardware Access
- [ ] iOS `Info.plist` includes valid `NSCameraUsageDescription`.
- [ ] Triggering the QR code scanner activates the real camera feed on physical iOS hardware and captures QR codes.
- [ ] Alert and check-in events trigger native haptic feedback and notification sounds on the device.

### Networking & Authentication
- [ ] The app establishes live network communication with the backend server at `http://172.20.10.4:3000`.
- [ ] An in-app configuration setting allows updating or changing the backend server URL.
- [ ] User authentication (sign-in) completes against the live backend and stores real session credentials.
- [ ] Live data requests and AI endpoints return real server responses rather than offline mock data.

### UI Design System
- [ ] All primary screens incorporate the "iOS 27 Liquid Glass" aesthetic with fluid glassmorphic styling, dynamic multi-layer backdrop blur, specular refractive highlights, and translucent floating cards.
- [ ] Text contrast and interactive controls remain accessible, readable, and responsive across light and dark modes.

### Build & Verification
- [ ] Capacitor sync completes cleanly with no missing native iOS plugin dependencies or configuration errors.
- [ ] iOS project builds successfully and is ready for package export.
- [ ] Backend connectivity and authentication endpoints are verified via automated network checks.
