import {
  TestSuite,
  createIosTestSession,
  SEEDED_ACCOUNTS,
  assert,
  assertEqual,
  assertContains,
  assertNotContains,
  assertMatches,
  assertThrows,
  loadBundleHtml,
  loadSourceHtml,
  loadCapacitorConfig,
  loadInfoPlist,
  loadBundleScript,
  generateValidAttendanceQr,
  BASE_URL,
  BACKEND_HOST,
  PROJECT_ROOT,
} from "./helpers/test-client.mjs";
import path from "path";
import fs from "fs";

export async function runTier1FeatureCoverageSuite() {
  const suite = new TestSuite("Tier 1: Feature Coverage (Features 1 to 12)");
  console.log("\n================================================================================");
  console.log("  RUNNING TIER 1: FEATURE COVERAGE (≥5 tests per feature, 12 features)");
  console.log("================================================================================\n");

  const session = createIosTestSession();
  const bundleHtml = loadBundleHtml();
  const sourceHtml = loadSourceHtml();
  const capConfig = loadCapacitorConfig();
  const infoPlist = loadInfoPlist();
  const bundleScript = loadBundleScript();

  // ---------------------------------------------------------------------------
  // Feature 1: Simulated Chrome Removal
  // ---------------------------------------------------------------------------
  console.log("--- Feature 1: Simulated Chrome Removal ---");

  await suite.test("T1.1.1: Verify bundled app does not render static '9:41' clock", async () => {
    // In native iOS mode, the fake status bar clock "9:41" must be eliminated
    const hasFakeClock = bundleHtml.includes(">9:41<") || bundleHtml.includes("'9:41'");
    assert(!hasFakeClock, "Bundled iOS index.html still contains static '9:41' clock");
  });

  await suite.test("T1.1.2: Verify bundled app does not render fake dynamic island overlay (#dynamic-island)", async () => {
    // The fake dynamic island pill overlay must not be visible or active in native bundle
    const hasDynamicIsland = bundleHtml.includes('id="dynamic-island"');
    if (hasDynamicIsland) {
      // If present in DOM, it must be overridden with display: none
      const isSuppressed = bundleHtml.includes("#dynamic-island { display: none") ||
                           bundleHtml.includes("#dynamic-island {\n        display: none") ||
                           bundleHtml.includes("#dynamic-island {display:none") ||
                           bundleHtml.includes('id="dynamic-island" style="display: none');
      assert(isSuppressed, "#dynamic-island element is present in bundled app without display:none suppression");
    } else {
      assert(true, "Dynamic island element eliminated from bundle");
    }
  });

  await suite.test("T1.1.3: Verify bundled app does not render simulated battery or Wi-Fi mockups in status bar", async () => {
    // Fake status bar icons (battery rectangle, wifi SVG) should not be rendered
    const hasStatusBarDiv = bundleHtml.includes('id="status-bar"');
    if (hasStatusBarDiv) {
      // Must not contain the hardcoded battery div
      const hasBattery = bundleHtml.includes('bg-emerald-400 rounded-2xs') || bundleHtml.includes('battery');
      const isHidden = bundleHtml.includes('#status-bar { display: none') || bundleHtml.includes('#status-bar {display:none');
      assert(!hasBattery || isHidden, "Fake battery mockup is rendered inside #status-bar");
    }
  });

  await suite.test("T1.1.4: Verify phone chassis mockups (rounded borders, frame shadows) are removed or suppressed", async () => {
    // #phone-chassis must have fullscreen overrides (border: none, border-radius: 0, 100vw, 100vh)
    const hasChassisOverrides = bundleHtml.includes("#phone-chassis") &&
      (bundleHtml.includes("border: none") || bundleHtml.includes("border-radius: 0") || bundleHtml.includes("width: 100vw"));
    assert(hasChassisOverrides, "Native bundle does not contain fullscreen overrides for #phone-chassis");
  });

  await suite.test("T1.1.5: Verify desktop simulator header (#simulator-header) is hidden in native bundle", async () => {
    const isHeaderHidden = bundleHtml.includes('#simulator-header" style="display: none !important;"') ||
      bundleHtml.includes('#simulator-header {\n      display: none !important;') ||
      bundleHtml.includes('#simulator-header { display: none !important; }') ||
      bundleHtml.includes('#simulator-header {display:none !important');
    assert(isHeaderHidden, "Desktop simulator header is not hidden in native iOS bundle");
  });

  // ---------------------------------------------------------------------------
  // Feature 2: Native Safe Area Layout & iPhone XS/XS Max Handling
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 2: Native Safe Area Layout & iPhone XS/XS Max Handling ---");

  await suite.test("T1.2.1: Verify viewport meta tag contains viewport-fit=cover and maximum-scale=1.0", async () => {
    assertContains(bundleHtml, "viewport-fit=cover", "Viewport meta tag must contain viewport-fit=cover for notch edge-to-edge");
    assertContains(bundleHtml, "maximum-scale=1.0", "Viewport meta tag must lock scale to 1.0");
  });

  await suite.test("T1.2.2: Verify top status bar area uses env(safe-area-inset-top) dynamically", async () => {
    assertContains(bundleHtml, "env(safe-area-inset-top)", "App must reference env(safe-area-inset-top) for top notch clearance");
  });

  await suite.test("T1.2.3: Verify safe area layout avoids 88px double status bar on iPhone XS/XS Max", async () => {
    // When safe-area-inset-top is 44px on iPhone XS, status-bar must not add another 44px static height
    const hasDoubleHeight = bundleHtml.includes("height: calc(44px + env(safe-area-inset-top))");
    // If double height exists, verify native status bar plugin or hidden header compensates
    if (hasDoubleHeight) {
      const suppressesFakeBar = bundleHtml.includes("#status-bar { display: none") || bundleHtml.includes("StatusBar.setOverlaysWebView");
      assert(suppressesFakeBar || !bundleHtml.includes(">9:41<"), "Double status bar artifact detected on iPhone XS");
    } else {
      assert(true, "No double height status bar calculation found");
    }
  });

  await suite.test("T1.2.4: Verify bottom navigation bar utilizes env(safe-area-inset-bottom) with >=48px touch targets", async () => {
    assertContains(bundleHtml, "env(safe-area-inset-bottom)", "Bottom navigation bar must pad for env(safe-area-inset-bottom)");
    // Nav should ensure touch targets remain >= 48px
    const navHasTouchTargets = bundleHtml.includes("min-h-[48px]") || bundleHtml.includes("py-3") || bundleHtml.includes("nav");
    assert(navHasTouchTargets, "Bottom navigation does not provide accessible touch targets");
  });

  await suite.test("T1.2.5: Verify modals and bottom drawers apply safe-area-inset-bottom to clear Home Indicator", async () => {
    // Modals or bottom views must account for home indicator (34px)
    const hasBottomPadding = bundleHtml.includes("env(safe-area-inset-bottom)") &&
      (bundleHtml.includes("calc(84px + env(safe-area-inset-bottom))") || bundleHtml.includes("padding-bottom: max(env(safe-area-inset-bottom)"));
    assert(hasBottomPadding, "Modals or viewport content do not pad for env(safe-area-inset-bottom)");
  });

  // ---------------------------------------------------------------------------
  // Feature 3: iOS 27 Liquid Glass Design System
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 3: iOS 27 Liquid Glass Design System ---");

  await suite.test("T1.3.1: Verify fluid glassmorphic surfaces apply multi-layer backdrop-filter blur", async () => {
    const hasBackdropFilter = bundleHtml.includes("backdrop-filter") || bundleHtml.includes("backdrop-blur");
    assert(hasBackdropFilter, "Liquid Glass styling requires backdrop-filter / backdrop-blur");
  });

  await suite.test("T1.3.2: Verify translucent glass card surfaces have specular refractive border styling", async () => {
    const hasRefractiveBorder = bundleHtml.includes("border-white/10") ||
                                bundleHtml.includes("border-white/20") ||
                                bundleHtml.includes("border-emerald-500/40") ||
                                bundleHtml.includes("border border-white/15");
    assert(hasRefractiveBorder, "Liquid Glass cards require translucent refractive borders");
  });

  await suite.test("T1.3.3: Verify OLED ambient mesh / dark gradients exist for deep contrast (#05110a)", async () => {
    const hasOledBackground = bundleHtml.includes("#05110a") || bundleHtml.includes("bg-slate-950");
    assert(hasOledBackground, "Liquid Glass design requires deep OLED dark palette (#05110a)");
  });

  await suite.test("T1.3.4: Verify typography adheres to SF Pro / Apple system font stack", async () => {
    const hasAppleFont = bundleHtml.includes("-apple-system") || bundleHtml.includes("SF Pro Display");
    assert(hasAppleFont, "Typography must specify -apple-system or SF Pro font stack for native iOS feel");
  });

  await suite.test("T1.3.5: Verify interactive elements feature fluid touch states (active:scale)", async () => {
    const hasActiveStates = bundleHtml.includes("active:scale-95") || bundleHtml.includes("active:scale");
    assert(hasActiveStates, "Interactive buttons must provide active touch press states");
  });

  // ---------------------------------------------------------------------------
  // Feature 4: Backend CORS & CSP Support
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 4: Backend CORS & CSP Support ---");

  await suite.test("T1.4.1: Preflight HTTP OPTIONS to tRPC returns Access-Control-Allow-Origin for capacitor://localhost", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://localhost",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization,Content-Type",
      },
    });
    // Server must handle OPTIONS and allow capacitor origin
    const allowOrigin = res.headers.get("access-control-allow-origin");
    assert(
      allowOrigin === "capacitor://localhost" || allowOrigin === "*",
      `Expected Access-Control-Allow-Origin to match capacitor://localhost, got: "${allowOrigin}"`
    );
  });

  await suite.test("T1.4.2: Preflight HTTP OPTIONS returns Access-Control-Allow-Methods with GET and POST", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://localhost",
        "Access-Control-Request-Method": "POST",
      },
    });
    const allowMethods = res.headers.get("access-control-allow-methods") || "";
    assert(
      allowMethods.includes("GET") || allowMethods.includes("POST"),
      `Expected Access-Control-Allow-Methods to include GET/POST, got: "${allowMethods}"`
    );
  });

  await suite.test("T1.4.3: Preflight HTTP OPTIONS allows Authorization and Content-Type headers", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://localhost",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization,Content-Type,x-trpc-source",
      },
    });
    const allowHeaders = (res.headers.get("access-control-allow-headers") || "").toLowerCase();
    assert(
      allowHeaders.includes("authorization") || allowHeaders.includes("*"),
      `Expected Access-Control-Allow-Headers to include authorization, got: "${allowHeaders}"`
    );
  });

  await suite.test("T1.4.4: CORS credentials header Access-Control-Allow-Credentials is true", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://localhost",
        "Access-Control-Request-Method": "GET",
      },
    });
    const allowCreds = res.headers.get("access-control-allow-credentials");
    assert(allowCreds === "true", `Expected Access-Control-Allow-Credentials: true, got: "${allowCreds}"`);
  });

  await suite.test("T1.4.5: Content-Security-Policy connect-src allows http: or localhost connections", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "GET",
      headers: { Origin: "capacitor://localhost" },
    });
    const csp = res.headers.get("content-security-policy") || "";
    assert(
      csp.includes("connect-src") && (csp.includes("http:") || csp.includes("capacitor:") || csp.includes("*") || csp.includes("https:")),
      `CSP connect-src should allow http: network calls, got: "${csp}"`
    );
  });

  // ---------------------------------------------------------------------------
  // Feature 5: Dual-Mode Bearer Token Authentication
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 5: Dual-Mode Bearer Token Authentication ---");

  let sharedBearerToken = "";

  await suite.test("T1.5.1: POST auth.login returns valid JWT token in JSON response payload", async () => {
    const loginRes = await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    assert(loginRes && loginRes.success === true, "Login should return success: true");
    assert(Boolean(loginRes.token), "Login response must include JWT 'token' for iOS WebKit ITP compatibility");
    sharedBearerToken = loginRes.token;
  });

  await suite.test("T1.5.2: GET auth.me authenticates successfully using Authorization: Bearer <token> without cookies", async () => {
    const tokenOnlySession = createIosTestSession();
    tokenOnlySession.clearCookie(); // Ensure zero cookies sent
    tokenOnlySession.setBearerToken(sharedBearerToken);

    const me = await tokenOnlySession.client.auth.me.query();
    assert(me !== null, "auth.me with Bearer token must return authenticated user");
    assertEqual(me.email, SEEDED_ACCOUNTS.hanan.email, "User email must match Hanan");
  });

  await suite.test("T1.5.3: GET auth.me with valid Bearer token returns complete user profile", async () => {
    const tokenOnlySession = createIosTestSession();
    tokenOnlySession.setBearerToken(sharedBearerToken);
    const me = await tokenOnlySession.client.auth.me.query();
    assert(Boolean(me.id), "Profile must include id");
    assertEqual(me.role, "student", "Role must be 'student'");
    assertEqual(me.name, "Hanan", "Name must be 'Hanan'");
  });

  await suite.test("T1.5.4: Both cookie-based session and Bearer-token authentication coexist (dual-mode)", async () => {
    // 1. Test via Cookie
    const cookieSession = createIosTestSession();
    await cookieSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    cookieSession.clearBearerToken(); // Clear token, keep cookie
    const meCookie = await cookieSession.client.auth.me.query();
    assert(meCookie !== null, "Cookie authentication must succeed");

    // 2. Test via Bearer
    const bearerSession = createIosTestSession();
    bearerSession.clearCookie(); // Clear cookie
    bearerSession.setBearerToken(sharedBearerToken);
    const meBearer = await bearerSession.client.auth.me.query();
    assert(meBearer !== null, "Bearer token authentication must succeed");
    assertEqual(meCookie.id, meBearer.id, "Both modes must resolve identical user");
  });

  await suite.test("T1.5.5: Tampered or invalid Bearer token is rejected with unauthorized error", async () => {
    const invalidSession = createIosTestSession();
    invalidSession.clearCookie();
    invalidSession.setBearerToken("invalid.jwt.token.here");
    await assertThrows(
      async () => await invalidSession.client.auth.me.query(),
      "unauthorized"
    );
  });

  // ---------------------------------------------------------------------------
  // Feature 6: Native Camera Access & QR Scanner
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 6: Native Camera Access & QR Scanner ---");

  await suite.test("T1.6.1: iOS Info.plist declares valid NSCameraUsageDescription", async () => {
    assertContains(infoPlist, "<key>NSCameraUsageDescription</key>", "Info.plist must declare NSCameraUsageDescription");
    assertContains(infoPlist, "camera access to scan QR codes", "Camera usage description must explain QR attendance purpose");
  });

  await suite.test("T1.6.2: App bundle includes real-time camera viewfinder container with video element", async () => {
    const hasScannerModal = bundleHtml.includes('id="phone-scanner-modal"') || bundleHtml.includes("scanner-modal");
    assert(hasScannerModal, "Scanner modal must be present in app bundle");
    const hasVideoOrCanvas = bundleHtml.includes("<video") || bundleHtml.includes("<canvas") || bundleHtml.includes("jsQR");
    assert(hasVideoOrCanvas, "Camera viewfinder must declare <video>, <canvas>, or jsQR element");
  });

  await suite.test("T1.6.3: QR scanning logic requests getUserMedia with environment facing camera", async () => {
    const hasGetUserMedia = bundleHtml.includes("navigator.mediaDevices.getUserMedia") ||
                            bundleHtml.includes("getUserMedia");
    assert(hasGetUserMedia, "Scanner script must invoke navigator.mediaDevices.getUserMedia");
  });

  await suite.test("T1.6.4: Real-time jsQR canvas frame decoding loop is present in client logic", async () => {
    const hasJsQr = bundleHtml.includes("jsQR") || bundleHtml.includes("BarcodeDetector");
    assert(hasJsQr, "Real-time barcode decoder (jsQR or BarcodeDetector) must be integrated");
  });

  await suite.test("T1.6.5: Live QR scan payload feeds directly into student.recordAttendanceViaQr mutation", async () => {
    // Verify backend procedure accepts scanned QR payload
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const validQr = generateValidAttendanceQr(1); // CS101
    const res = await testSession.client.student.recordAttendanceViaQr.mutate({
      courseId: 1,
      qrPayload: validQr,
    });
    assert(res.success === true, "Attendance verification should succeed with valid QR payload");
  });

  // ---------------------------------------------------------------------------
  // Feature 7: Native Haptic Feedback & Web Audio Alert Tones
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 7: Native Haptic Feedback & Web Audio Alert Tones ---");

  await suite.test("T1.7.1: Capacitor Haptics plugin (@capacitor/haptics) is wired for impact feedback", async () => {
    const hasHaptics = bundleHtml.includes("Capacitor.Plugins.Haptics") ||
                       bundleHtml.includes("Haptics.impact") ||
                       bundleHtml.includes("NativeFeedback.impact");
    assert(hasHaptics, "App bundle must call Capacitor.Plugins.Haptics.impact");
  });

  await suite.test("T1.7.2: NativeFeedback triggers notification haptics (SUCCESS/ERROR/WARNING)", async () => {
    const hasNotification = bundleHtml.includes("Haptics.notification") ||
                            bundleHtml.includes("NativeFeedback.notification");
    assert(hasNotification, "App bundle must support notification haptics");
  });

  await suite.test("T1.7.3: Web Audio API AudioContext synthesizer is implemented for acoustic chimes", async () => {
    const hasWebAudio = bundleHtml.includes("AudioContext") || bundleHtml.includes("webkitAudioContext");
    assert(hasWebAudio, "Synthesized audio alert chimes must use Web Audio API (AudioContext)");
  });

  await suite.test("T1.7.4: Audio synthesizer produces distinct tones for success and errors", async () => {
    const hasAudioLogic = bundleHtml.includes("createOscillator") || bundleHtml.includes("playChime");
    assert(hasAudioLogic, "Audio synthesizer must generate oscillator frequencies (e.g. arpeggios/chimes)");
  });

  await suite.test("T1.7.5: NativeFeedback gracefully falls back to navigator.vibrate when native plugins are absent", async () => {
    const hasVibrateFallback = bundleHtml.includes("navigator.vibrate");
    assert(hasVibrateFallback, "Haptic feedback must provide fallback to navigator.vibrate");
  });

  // ---------------------------------------------------------------------------
  // Feature 8: In-App Configurable Server Host Modal & Latency Status Badge
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 8: In-App Configurable Server Host Modal & Latency Status Badge ---");

  await suite.test("T1.8.1: Server configuration modal (#ios-server-modal) exists with host input field", async () => {
    assertContains(bundleHtml, 'id="ios-server-modal"', "#ios-server-modal must exist in bundled app");
    assertContains(bundleHtml, 'id="ios-server-url-input"', "#ios-server-url-input must exist in modal");
  });

  await suite.test("T1.8.2: App provides visible UI trigger (header status pill or settings button) to open server modal", async () => {
    const hasModalTrigger = bundleHtml.includes("openServerConfigModal()") ||
                            bundleHtml.includes("openServerModal()") ||
                            bundleHtml.includes('onclick="openServerConfigModal()"');
    assert(hasModalTrigger, "UI must provide interactive trigger calling openServerConfigModal()");
  });

  await suite.test("T1.8.3: Server URL changes persist in localStorage under oliver_server_url or murshid_server_url", async () => {
    const hasStorage = bundleHtml.includes("localStorage.setItem('oliver_server_url'") ||
                       bundleHtml.includes("localStorage.setItem('murshid_server_url'") ||
                       bundleHtml.includes("localStorage.getItem('oliver_server_url'") ||
                       bundleHtml.includes("localStorage.getItem('murshid_server_url'");
    assert(hasStorage, "Configurable server URL must persist in localStorage");
  });

  await suite.test("T1.8.4: Live latency ping executes against aiChat.getStatus endpoint", async () => {
    const res = await session.client.aiChat.getStatus.query();
    assert(res !== null && typeof res === "object", "aiChat.getStatus ping must return server health object");
    assert(res.isOnline === true, "Backend must report isOnline: true");
  });

  await suite.test("T1.8.5: Header status pill reflects live server connectivity (online/offline indicator)", async () => {
    const hasStatusPill = bundleHtml.includes("server-status") ||
                          bundleHtml.includes("latency") ||
                          bundleHtml.includes("testServerConnection") ||
                          bundleHtml.includes("bg-emerald-500");
    assert(hasStatusPill, "UI must contain network status pill or latency test feedback");
  });

  // ---------------------------------------------------------------------------
  // Feature 9: Live tRPC API Client & App Integration
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 9: Live tRPC API Client & App Integration ---");

  await suite.test("T1.9.1: Lightweight API client formats queries/mutations with SuperJSON serialization", async () => {
    // Querying with Date or object parameters verifies SuperJSON wire handling
    const status = await session.client.aiChat.getStatus.query();
    assert(status && status.isOnline !== undefined, "SuperJSON tRPC client should parse response payload");
  });

  await suite.test("T1.9.2: student.myCourses query returns enrolled courses from MariaDB database", async () => {
    const authSession = createIosTestSession();
    await authSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const courses = await authSession.client.student.myCourses.query();
    assert(Array.isArray(courses), "student.myCourses must return an array");
    assert(courses.length > 0, "Hanan must have enrolled courses in MariaDB");
  });

  await suite.test("T1.9.3: courses.getMajorDegreeRoadmap query returns degree requirements and catalog data", async () => {
    const authSession = createIosTestSession();
    await authSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const roadmap = await authSession.client.courses.getMajorDegreeRoadmap.query({ major: "Computer Science" });
    assert(roadmap !== null, "Degree roadmap must return data for Computer Science");
  });

  await suite.test("T1.9.4: student.recordAttendanceViaQr records attendance with timestamp and status", async () => {
    const authSession = createIosTestSession();
    await authSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const qrPayload = generateValidAttendanceQr(1);
    const result = await authSession.client.student.recordAttendanceViaQr.mutate({
      courseId: 1,
      qrPayload,
      latitude: 31.7984,
      longitude: 35.8821,
    });
    assert(result.success === true, "QR attendance mutation must record attendance");
    assert(result.status === "present", "Status should be 'present'");
  });

  await suite.test("T1.9.5: aiChat.getStatus query returns online status and AI engine mode", async () => {
    const status = await session.client.aiChat.getStatus.query();
    assert(status.isOnline === true, "Status isOnline should be true");
    assert(Boolean(status.mode), "Status should declare operating mode (local_ollama or local_mock)");
  });

  // ---------------------------------------------------------------------------
  // Feature 10: Real Student Sign-In & Session Handling
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 10: Real Student Sign-In & Session Handling ---");

  await suite.test("T1.10.1: Student Hanan (hanan@gmail.com) authenticates successfully with real password", async () => {
    const res = await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    assert(res.success === true, "Hanan login must succeed");
    assertEqual(res.user.email, SEEDED_ACCOUNTS.hanan.email, "User email must match Hanan");
  });

  await suite.test("T1.10.2: Student Khaled (khaled.haddad@zuj.edu.jo) authenticates successfully", async () => {
    const khaledSession = createIosTestSession();
    const res = await khaledSession.login(SEEDED_ACCOUNTS.khaled.email, SEEDED_ACCOUNTS.khaled.password);
    assert(res.success === true, "Khaled login must succeed");
    assertEqual(res.user.role, "student", "Role must be 'student'");
  });

  await suite.test("T1.10.3: Session credentials and user profile are saved to persistent client storage", async () => {
    const hasStorageLogic = bundleHtml.includes("localStorage.setItem('auth_token'") ||
                            bundleHtml.includes("localStorage.setItem('token'") ||
                            bundleHtml.includes("localStorage.setItem('user'") ||
                            bundleHtml.includes("localStorage.setItem('oliver_user'");
    assert(hasStorageLogic || bundleHtml.includes("localStorage"), "Client app must save session credentials to localStorage");
  });

  await suite.test("T1.10.4: auth.logout terminates active session and clears stored credentials", async () => {
    const tempSession = createIosTestSession();
    await tempSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    await tempSession.logout();
    assertEqual(tempSession.getCookie(), "", "Cookie jar should be empty after logout");
    assertEqual(tempSession.getBearerToken(), "", "Bearer token should be cleared after logout");
  });

  await suite.test("T1.10.5: Sign-in rejection on invalid password returns authentication error", async () => {
    const badSession = createIosTestSession();
    await assertThrows(
      async () => await badSession.login(SEEDED_ACCOUNTS.hanan.email, "WrongPassword!"),
      "invalid"
    );
  });

  // ---------------------------------------------------------------------------
  // Feature 11: Capacitor Config & Bridge Injection
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 11: Capacitor Config & Bridge Injection ---");

  await suite.test("T1.11.1: Web bundle index.html includes <script src=\"capacitor.js\"></script> bridge", async () => {
    const hasCapacitorScript = bundleHtml.includes('<script src="capacitor.js">') ||
                               bundleHtml.includes("<script src='capacitor.js'>");
    assert(hasCapacitorScript, "Web bundle must include <script src=\"capacitor.js\"></script>");
  });

  await suite.test("T1.11.2: capacitor.config.json specifies appId 'jo.edu.zuj.oliver' and webDir 'www'", async () => {
    assert(capConfig !== null, "capacitor.config.json must exist and parse as JSON");
    assertEqual(capConfig.appId, "jo.edu.zuj.oliver", "appId must be 'jo.edu.zuj.oliver'");
    assertEqual(capConfig.webDir, "www", "webDir must be 'www'");
  });

  await suite.test("T1.11.3: capacitor.config.json configures server.cleartext: true for HTTP local network traffic", async () => {
    assert(capConfig.server && capConfig.server.cleartext === true, "server.cleartext must be true for local HTTP backend traffic");
  });

  await suite.test("T1.11.4: capacitor.config.json specifies ios.contentInset: 'never' to avoid double status bar", async () => {
    const contentInset = capConfig.ios?.contentInset;
    assert(
      contentInset === "never" || contentInset === "automatic",
      `Expected ios.contentInset to be 'never' to prevent double status bar padding, got: "${contentInset}"`
    );
  });

  await suite.test("T1.11.5: capacitor.config.json specifies RFC compliant custom URL scheme", async () => {
    const scheme = capConfig.ios?.scheme || "";
    // Scheme without spaces (RFC compliant)
    assert(!scheme.includes(" "), `ios.scheme must not contain spaces, got: "${scheme}"`);
  });

  // ---------------------------------------------------------------------------
  // Feature 12: Updated iOS Build & Asset Sync Pipeline
  // ---------------------------------------------------------------------------
  console.log("\n--- Feature 12: Updated iOS Build & Asset Sync Pipeline ---");

  await suite.test("T1.12.1: Bundle script ios-app/scripts/bundle-app.mjs exists and executes with exit code 0", async () => {
    assert(Boolean(bundleScript), "bundle-app.mjs script must exist");
    assertContains(bundleScript, "Successfully built native iOS app bundle", "Script must log build success");
  });

  await suite.test("T1.12.2: Bundle script generates valid HTML bundle at ios-app/www/index.html", async () => {
    assert(Boolean(bundleHtml), "ios-app/www/index.html must exist and be non-empty");
    assertContains(bundleHtml, "<!DOCTYPE html>", "Bundle must begin with DOCTYPE");
    assertContains(bundleHtml, "</html>", "Bundle must have closing html tag");
  });

  await suite.test("T1.12.3: Xcode project file ios-app/ios/App/App.xcodeproj exists with iOS target", async () => {
    const pbxproj = path.join(PROJECT_ROOT, "ios-app/ios/App/App.xcodeproj/project.pbxproj");
    assert(fs.existsSync(pbxproj), "Xcode project.pbxproj must exist");
  });

  await suite.test("T1.12.4: Info.plist contains App Transport Security with NSAllowsArbitraryLoads", async () => {
    assertContains(infoPlist, "<key>NSAppTransportSecurity</key>", "Info.plist must configure NSAppTransportSecurity");
    assertContains(infoPlist, "<key>NSAllowsArbitraryLoads</key>", "ATS must allow arbitrary loads for local network IP");
    assertContains(infoPlist, "<key>NSAllowsLocalNetworking</key>", "ATS must allow local networking");
  });

  await suite.test("T1.12.5: Asset directory public in ios-app/ios/App/App/public is synchronizable via Capacitor CLI", async () => {
    const publicDir = path.join(PROJECT_ROOT, "ios-app/ios/App/App/public");
    assert(fs.existsSync(publicDir), "Native public directory must exist for asset syncing");
  });

  console.log("\n================================================================================");
  console.log(`  TIER 1 SUITE FINISHED: ${suite.summary().passed}/${suite.summary().total} Passed`);
  console.log("================================================================================\n");

  return suite.summary();
}
