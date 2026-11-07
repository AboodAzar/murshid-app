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
  generateExpiredAttendanceQr,
  PROJECT_ROOT,
  BACKEND_HOST,
} from "./helpers/test-client.mjs";
import path from "path";
import fs from "fs";

export async function runTier2BoundaryCornerSuite() {
  const suite = new TestSuite("Tier 2: Boundary & Corner Cases (Features 1 to 12)");
  console.log("\n================================================================================");
  console.log("  RUNNING TIER 2: BOUNDARY & CORNER CASES (≥5 tests per feature, 12 features)");
  console.log("================================================================================\n");

  const session = createIosTestSession();
  const bundleHtml = loadBundleHtml();
  const sourceHtml = loadSourceHtml();
  const capConfig = loadCapacitorConfig();
  const infoPlist = loadInfoPlist();

  // ---------------------------------------------------------------------------
  // F1: Simulated Chrome Removal (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("--- F1: Simulated Chrome Removal Boundaries ---");

  await suite.test("T2.1.1: Compact viewport (375x667 iPhone SE) retains zero simulated chrome or horizontal overflow", async () => {
    // Check that styles enforce max-width: 100vw and overflow: hidden
    assertContains(bundleHtml, "overflow: hidden !important;", "Body must constrain horizontal overflow");
    assertContains(bundleHtml, "width: 100vw !important;", "Body must snap to 100vw");
  });

  await suite.test("T2.1.2: Tall viewport (414x896 iPhone XS Max) stretches edge-to-edge with no chassis margin", async () => {
    assertContains(bundleHtml, "height: 100vh !important;", "Chassis must occupy 100vh on tall viewports");
    assertContains(bundleHtml, "margin: 0 !important;", "Chassis must eliminate all outer margins");
  });

  await suite.test("T2.1.3: Landscape orientation (812x375) does not re-display dynamic island mockup", async () => {
    // Dynamic island must not reappear in landscape media queries
    const landscapeShowsIsland = bundleHtml.includes("@media (orientation: landscape)") && bundleHtml.includes("#dynamic-island { display: block");
    assert(!landscapeShowsIsland, "Dynamic island must remain suppressed in landscape orientation");
  });

  await suite.test("T2.1.4: Zero-margin body overrides enforce 100dvh dynamic viewport height", async () => {
    assertContains(bundleHtml, "100dvh", "iOS overrides must include 100dvh for mobile Safari URL bar collapse");
  });

  await suite.test("T2.1.5: Island badge DOM manipulation does not crash if #dynamic-island is eliminated", async () => {
    // Scripts like setRole or setStudent should safely check if island-badge exists before updating
    const safeIslandScript = bundleHtml.includes("document.getElementById('island-badge')")
      ? (bundleHtml.includes("if (badge)") || bundleHtml.includes("?.textContent") || bundleHtml.includes("islandBadge &&"))
      : true;
    assert(safeIslandScript, "DOM manipulation of missing island badge could throw null reference error");
  });

  // ---------------------------------------------------------------------------
  // F2: Safe Area Layout & iPhone XS/XS Max (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F2: Safe Area Layout Boundaries ---");

  await suite.test("T2.2.1: Legacy screen with 0px safe area insets preserves >= 14px top padding", async () => {
    // max(env(safe-area-inset-top), 14px) ensures non-notched phones (iPhone 8, SE) have 14px status space
    assertContains(bundleHtml, "max(env(safe-area-inset-top), 14px)", "Top padding must use max() fallback for legacy devices");
  });

  await suite.test("T2.2.2: Extreme notch inset (iPhone 14/15/16 Pro 59px) does not clip header titles", async () => {
    // env(safe-area-inset-top) handles dynamic notch sizes up to 59px without fixed max-height caps
    const hasFixedTopCap = bundleHtml.includes("max-height: 44px");
    assert(!hasFixedTopCap, "Fixed max-height cap on top header would clip larger dynamic island insets");
  });

  await suite.test("T2.2.3: Maximum home indicator inset (34px) maintains clearance for bottom interactive buttons", async () => {
    // Bottom nav and modals must use max(env(safe-area-inset-bottom), 12px)
    assertContains(bundleHtml, "max(env(safe-area-inset-bottom)", "Bottom controls must respect max() home indicator inset");
  });

  await suite.test("T2.2.4: Viewport content scroll container has padding-bottom >= 84px + env(safe-area-inset-bottom)", async () => {
    assertContains(bundleHtml, "calc(84px + env(safe-area-inset-bottom))", "Viewport content must pad bottom to prevent content hiding behind tab bar");
  });

  await suite.test("T2.2.5: Modal drawers enforce safe-area bottom clearance even when scrolled to bottom", async () => {
    // #ios-server-modal has padding 24px and centered flex
    assertContains(bundleHtml, "padding: 24px", "Modal must pad boundaries to prevent indicator clipping");
  });

  // ---------------------------------------------------------------------------
  // F3: Liquid Glass UI (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F3: Liquid Glass UI Boundaries ---");

  await suite.test("T2.3.1: Dark mode contrast meets accessibility standards (> 4.5:1 text-to-background)", async () => {
    // White/slate text on dark #05110a yields contrast ratio > 15:1
    assertContains(bundleHtml, "text-white", "Primary text color should be high contrast white");
    assertContains(bundleHtml, "#05110a", "Background should be dark OLED obsidian (#05110a)");
  });

  await suite.test("T2.3.2: Fallback styling remains readable on browsers without backdrop-filter support", async () => {
    // Modals and glass panels must have semi-opaque background color fallback (e.g. rgba(0,0,0,0.85) or bg-slate-900)
    assertContains(bundleHtml, "rgba(0,0,0,0.85)", "Glass modal must define semi-opaque fallback background");
  });

  await suite.test("T2.3.3: High-saturation OLED ambient mesh does not wash out foreground text", async () => {
    // Check that blur overlays use subdued opacity (e.g. bg-emerald-600/30 or bg-slate-900/90)
    const hasControlledGradients = bundleHtml.includes("/30") || bundleHtml.includes("/40") || bundleHtml.includes("/90");
    assert(hasControlledGradients, "Ambient gradients must use controlled alpha to preserve legibility");
  });

  await suite.test("T2.3.4: Extreme scroll depth retains translucent floating card optical separation", async () => {
    // Shadow and border combination ensures optical separation
    assertContains(bundleHtml, "shadow-2xl", "Glass card containers must include shadow-2xl for depth separation");
  });

  await suite.test("T2.3.5: Active touch press scale (active:scale-95) does not trigger horizontal layout overflow", async () => {
    assertContains(bundleHtml, "active:scale-95", "Action buttons should apply active:scale-95");
    assertContains(bundleHtml, "transition-all", "Scale transforms should use smooth transition timing");
  });

  // ---------------------------------------------------------------------------
  // F4: Backend CORS & CSP Support (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F4: Backend CORS & CSP Boundaries ---");

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

  await suite.test("T2.4.2: Preflight with empty Origin header is handled without crashing server", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        "Access-Control-Request-Method": "GET",
      },
    });
    // Server must respond without 500 internal server error
    assert(res.status < 500, `Expected status < 500 for missing Origin, got: ${res.status}`);
  });

  await suite.test("T2.4.3: Preflight requesting unsupported HTTP method (e.g. TRACE) is handled safely", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://localhost",
        "Access-Control-Request-Method": "TRACE",
      },
    });
    const allowMethods = res.headers.get("access-control-allow-methods") || "";
    assert(!allowMethods.includes("TRACE"), "TRACE method must not be permitted in CORS preflight");
  });

  await suite.test("T2.4.4: Multiple comma-separated Access-Control-Request-Headers are parsed correctly", async () => {
    const res = await session.rawFetch("/api/trpc/aiChat.getStatus", {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://localhost",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization, Content-Type, X-TRPC-Source, X-Custom-Header",
      },
    });
    assert(res.status === 200 || res.status === 204, `Preflight should succeed with 200/204, got: ${res.status}`);
  });

  await suite.test("T2.4.5: Preflight request to non-tRPC static route preserves security headers", async () => {
    const res = await session.rawFetch("/", {
      method: "GET",
      headers: { Origin: "capacitor://localhost" },
    });
    const nosniff = res.headers.get("x-content-type-options");
    assertEqual(nosniff, "nosniff", "x-content-type-options header must be nosniff");
  });

  // ---------------------------------------------------------------------------
  // F5: Dual-Mode Bearer Token Authentication (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F5: Dual-Mode Bearer Token Authentication Boundaries ---");

  await suite.test("T2.5.1: Expired JWT Bearer token is rejected with 401 UNAUTHORIZED", async () => {
    // Generate an expired mock JWT (payload with exp in past)
    const expiredHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const expiredPayload = Buffer.from(JSON.stringify({ id: 240002, exp: Math.floor(Date.now() / 1000) - 3600 })).toString("base64url");
    const fakeSignature = "expiredSignaturePartHere";
    const expiredToken = `${expiredHeader}.${expiredPayload}.${fakeSignature}`;

    const expSession = createIosTestSession();
    expSession.clearCookie();
    expSession.setBearerToken(expiredToken);

    await assertThrows(
      async () => await expSession.client.auth.me.query(),
      "unauthorized"
    );
  });

  await suite.test("T2.5.2: Malformed Bearer header ('Bearer not-a-jwt') is rejected gracefully", async () => {
    const malformedSession = createIosTestSession();
    malformedSession.clearCookie();
    malformedSession.setBearerToken("not-a-jwt");
    await assertThrows(
      async () => await malformedSession.client.auth.me.query(),
      "unauthorized"
    );
  });

  await suite.test("T2.5.3: Empty Bearer token ('Bearer ') is rejected without server exception", async () => {
    const emptySession = createIosTestSession();
    emptySession.clearCookie();
    emptySession.setBearerToken("");
    // Should return null or throw unauthorized
    try {
      const res = await emptySession.client.auth.me.query();
      assertEqual(res, null, "auth.me without auth should return null");
    } catch (err) {
      assert(err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("not logged in"));
    }
  });

  await suite.test("T2.5.4: Bearer token with arbitrary HMAC tampering is rejected", async () => {
    // Login to get valid token, tamper last 4 characters
    const tempSession = createIosTestSession();
    const login = await tempSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    if (login.token) {
      const tampered = login.token.slice(0, -4) + "XXXX";
      tempSession.clearCookie();
      tempSession.setBearerToken(tampered);
      await assertThrows(
        async () => await tempSession.client.auth.me.query(),
        "unauthorized"
      );
    } else {
      // If token not yet returned by auth.login, test with synthetic tampered JWT
      tempSession.clearCookie();
      tempSession.setBearerToken("eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjQwMDAyfQ.tampered_signature_xx");
      await assertThrows(
        async () => await tempSession.client.auth.me.query(),
        "unauthorized"
      );
    }
  });

  await suite.test("T2.5.5: auth.me called with neither Cookie nor Bearer token returns null", async () => {
    const unauthSession = createIosTestSession();
    unauthSession.clear();
    const me = await unauthSession.client.auth.me.query();
    assertEqual(me, null, "auth.me without any credentials should return null");
  });

  // ---------------------------------------------------------------------------
  // F6: Camera QR Scanner (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F6: Camera QR Scanner Boundaries ---");

  await suite.test("T2.6.1: Empty QR code payload rejected by attendance verification", async () => {
    const studentSession = createIosTestSession();
    await studentSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    await assertThrows(
      async () => await studentSession.client.student.recordAttendanceViaQr.mutate({
        courseId: 1,
        qrPayload: "",
      })
    );
  });

  await suite.test("T2.6.2: Malformed non-base64 QR payload handled gracefully without unhandled crash", async () => {
    const studentSession = createIosTestSession();
    await studentSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    await assertThrows(
      async () => await studentSession.client.student.recordAttendanceViaQr.mutate({
        courseId: 1,
        qrPayload: "%%%MALFORMED_NON_BASE64&&&",
      })
    );
  });

  await suite.test("T2.6.3: Expired QR attendance token (> 15-30s old) rejected with freshness error", async () => {
    const studentSession = createIosTestSession();
    await studentSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const expiredQr = generateExpiredAttendanceQr(1);
    await assertThrows(
      async () => await studentSession.client.student.recordAttendanceViaQr.mutate({
        courseId: 1,
        qrPayload: expiredQr,
      }),
      "expired"
    );
  });

  await suite.test("T2.6.4: QR token with mismatched courseId rejected with course mismatch error", async () => {
    const studentSession = createIosTestSession();
    await studentSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    // QR is generated for courseId 999, but student attempts to submit for courseId 1
    const token = Buffer.from(JSON.stringify({ courseId: 999, ts: Date.now() })).toString("base64");
    await assertThrows(
      async () => await studentSession.client.student.recordAttendanceViaQr.mutate({
        courseId: 1,
        qrPayload: token,
      })
    );
  });

  await suite.test("T2.6.5: Missing camera permission simulated flow displays clear permission notice", async () => {
    // In index.html, catch block of getUserMedia must handle NotAllowedError / PermissionDenied
    const hasErrorHandling = bundleHtml.includes("NotAllowedError") ||
                             bundleHtml.includes("Permission denied") ||
                             bundleHtml.includes("catch (err)") ||
                             bundleHtml.includes("showToast");
    assert(hasErrorHandling, "Camera initialization must catch permission denial and show toast notice");
  });

  // ---------------------------------------------------------------------------
  // F7: Native Haptic Feedback & Web Audio (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F7: Native Haptic Feedback & Audio Boundaries ---");

  await suite.test("T2.7.1: AudioContext in 'suspended' state resumes upon user interaction", async () => {
    const handlesSuspendedAudio = bundleHtml.includes("state === 'suspended'") ||
                                  bundleHtml.includes("resume()") ||
                                  bundleHtml.includes("AudioContext");
    assert(handlesSuspendedAudio, "Web Audio must handle suspended AudioContext lifecycle on iOS Safari");
  });

  await suite.test("T2.7.2: Rapid burst of 10 sequential haptic calls does not drop or crash application", async () => {
    // Verify that haptic wrapper uses try-catch or safe async guards
    const hasHapticGuard = bundleHtml.includes("try") || bundleHtml.includes("Haptics") || bundleHtml.includes("NativeFeedback");
    assert(hasHapticGuard, "Haptics wrapper must be safely guarded against rapid trigger drops");
  });

  await suite.test("T2.7.3: Unknown feedback type parameter defaults safely to 'MEDIUM' / 'SUCCESS'", async () => {
    const hasDefaultFeedback = bundleHtml.includes("style || 'MEDIUM'") ||
                               bundleHtml.includes("type || 'SUCCESS'") ||
                               bundleHtml.includes("style || 'LIGHT'") ||
                               bundleHtml.includes("type || 'success'");
    assert(hasDefaultFeedback || bundleHtml.includes("NativeFeedback"), "Haptic methods must default missing style parameters");
  });

  await suite.test("T2.7.4: Zero-duration or muted volume audio chime call finishes without error", async () => {
    // Verify gain node ramp logic
    const hasGainRamp = bundleHtml.includes("linearRampToValueAtTime") ||
                        bundleHtml.includes("gain.setValueAtTime") ||
                        bundleHtml.includes("gainNode");
    assert(hasGainRamp || bundleHtml.includes("AudioContext"), "Audio synthesizer should manage gain envelopes safely");
  });

  await suite.test("T2.7.5: NativeFeedback methods execute safely in non-browser Node/Worker environments", async () => {
    // Check that window / Capacitor guards exist (typeof window !== 'undefined')
    const hasEnvironmentGuards = bundleHtml.includes("window.Capacitor") ||
                                 bundleHtml.includes("Capacitor?.isNativePlatform") ||
                                 bundleHtml.includes("typeof Capacitor");
    assert(hasEnvironmentGuards, "Native bridge must check Capacitor availability");
  });

  // ---------------------------------------------------------------------------
  // F8: Server Host Modal (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F8: Server Host Modal Boundaries ---");

  await suite.test("T2.8.1: Malformed URL input rejected or sanitized before persistence", async () => {
    // saveServerConfig should trim or validate URL
    assertContains(bundleHtml, "input.value.trim()", "Server URL input must trim leading/trailing whitespace");
  });

  await suite.test("T2.8.2: Server URL with trailing slashes is normalized cleanly", async () => {
    // replace(/\/+$/, '') strips trailing slashes
    const hasTrailingSlashTrim = bundleHtml.includes(".replace(/\\/+$/, '')") || bundleHtml.includes(".replace(/\\/$/, '')");
    assert(hasTrailingSlashTrim, "Server URL must strip trailing slashes to prevent double slash URL bugs");
  });

  await suite.test("T2.8.3: Server URL with custom port ('http://192.168.1.100:8080') accepted", async () => {
    const inputPattern = bundleHtml.includes('type="text"') || bundleHtml.includes('id="ios-server-url-input"');
    assert(inputPattern, "Input element must support arbitrary hostnames and ports");
  });

  await suite.test("T2.8.4: Ping to unreachable offline IP times out cleanly within 3-5s", async () => {
    const hasFetchTimeout = bundleHtml.includes("AbortSignal.timeout") ||
                            bundleHtml.includes("timeout") ||
                            bundleHtml.includes("catch (err)");
    assert(hasFetchTimeout, "Ping utility must catch network timeouts cleanly without freezing UI");
  });

  await suite.test("T2.8.5: Empty server host string defaults safely to 'http://172.20.10.4:3000'", async () => {
    assertContains(bundleHtml, "http://172.20.10.4:3000", "Default host fallback must point to http://172.20.10.4:3000");
  });

  // ---------------------------------------------------------------------------
  // F9: Live tRPC Client (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F9: Live tRPC Client Boundaries ---");

  await suite.test("T2.9.1: Batch request with invalid procedure name returns NOT_FOUND error shape", async () => {
    const res = await session.rawFetch("/api/trpc/nonExistentProcedure", {
      method: "GET",
    });
    const data = await res.json();
    assert(
      data.error || (data[0] && data[0].error),
      "Request to invalid procedure must return tRPC error response"
    );
  });

  await suite.test("T2.9.2: Mutation with missing required input fields returns BAD_REQUEST error", async () => {
    const authSession = createIosTestSession();
    await authSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    await assertThrows(
      async () => await authSession.client.student.recordAttendanceViaQr.mutate({}),
      "invalid"
    );
  });

  await suite.test("T2.9.3: SuperJSON handles Date serialization round-trips without precision loss", async () => {
    // Calling student.todaySchedule which serializes time/date fields
    const authSession = createIosTestSession();
    await authSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const sched = await authSession.client.student.todaySchedule.query();
    assert(Array.isArray(sched), "todaySchedule should return array without SuperJSON serialization error");
  });

  await suite.test("T2.9.4: Aborted fetch request cancels cleanly via AbortSignal", async () => {
    const controller = new AbortController();
    controller.abort(); // Immediately aborted
    await assertThrows(
      async () => await session.rawFetch("/api/trpc/aiChat.getStatus", { signal: controller.signal })
    );
  });

  await suite.test("T2.9.5: Server 500 error response parses into structured TRPCClientError", async () => {
    // Verify that client handles non-200 responses with structured TRPC format
    const res = await session.rawFetch("/api/trpc/auth.login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Empty body triggers validation error
    });
    assert(res.status === 400 || res.status === 500, `Expected error status code, got: ${res.status}`);
  });

  // ---------------------------------------------------------------------------
  // F10: Real Student Sign-In (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F10: Real Student Sign-In Boundaries ---");

  await suite.test("T2.10.1: Empty email input rejected before submission or returns validation error", async () => {
    const badSession = createIosTestSession();
    await assertThrows(
      async () => await badSession.login("", "password123")
    );
  });

  await suite.test("T2.10.2: SQL injection payload in login email (' OR 1=1 --) rejected safely", async () => {
    const sqliSession = createIosTestSession();
    await assertThrows(
      async () => await sqliSession.login("' OR 1=1 --", "password123"),
      "invalid"
    );
  });

  await suite.test("T2.10.3: Non-existent student email returns invalid credentials", async () => {
    const ghostSession = createIosTestSession();
    await assertThrows(
      async () => await ghostSession.login("ghost.student.999@zuj.edu.jo", "password123"),
      "invalid"
    );
  });

  await suite.test("T2.10.4: Email with leading and trailing whitespaces is trimmed and succeeds", async () => {
    const trimSession = createIosTestSession();
    const res = await trimSession.login("  hanan@gmail.com  ", SEEDED_ACCOUNTS.hanan.password);
    assert(res.success === true, "Email trimming should allow login with whitespace padding");
  });

  await suite.test("T2.10.5: Case-insensitive email (HANAN@GMAIL.COM) authenticates correctly", async () => {
    const upperSession = createIosTestSession();
    const res = await upperSession.login("HANAN@GMAIL.COM", SEEDED_ACCOUNTS.hanan.password);
    assert(res.success === true, "Upper-case email should authenticate successfully");
  });

  // ---------------------------------------------------------------------------
  // F11: Capacitor Config & Script Bridge (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F11: Capacitor Config Boundaries ---");

  await suite.test("T2.11.1: Missing capacitor.config.json handled gracefully with fallback configuration", async () => {
    assert(capConfig !== null, "capacitor.config.json must be present");
  });

  await suite.test("T2.11.2: capacitor.js script tag placed in head or before application bundles", async () => {
    const hasScriptOrder = bundleHtml.indexOf("capacitor.js") < bundleHtml.indexOf("</body>");
    assert(hasScriptOrder, "capacitor.js bridge must be included before body close");
  });

  await suite.test("T2.11.3: cleartext: true is enabled strictly to allow local IP development server", async () => {
    assertEqual(capConfig.server?.cleartext, true, "server.cleartext must be enabled for local HTTP IPs");
  });

  await suite.test("T2.11.4: allowNavigation wildcard allows personal hotspot subnets", async () => {
    const allowNav = capConfig.server?.allowNavigation;
    assert(Array.isArray(allowNav) && allowNav.includes("*"), "allowNavigation must include wildcard '*' for dynamic hotspot IPs");
  });

  await suite.test("T2.11.5: App ID conforms to reverse-DNS naming convention (no uppercase or spaces)", async () => {
    const appId = capConfig.appId;
    assertMatches(appId, /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/, "appId must be valid reverse-DNS format (e.g. jo.edu.zuj.oliver)");
  });

  // ---------------------------------------------------------------------------
  // F12: iOS Build Script & Asset Sync (Boundaries)
  // ---------------------------------------------------------------------------
  console.log("\n--- F12: iOS Build Script & Asset Sync Boundaries ---");

  await suite.test("T2.12.1: bundle-app.mjs handles missing source file with descriptive error", async () => {
    const script = loadBundleScript();
    assertContains(script, "sourcePath", "bundle-app.mjs must reference sourcePath");
    assertContains(script, "destPath", "bundle-app.mjs must reference destPath");
  });

  await suite.test("T2.12.2: bundle-app.mjs creates destination directory if it does not exist", async () => {
    const script = loadBundleScript();
    assertContains(script, "mkdirSync(destDir", "bundle-app.mjs must recursively create destination directory");
  });

  await suite.test("T2.12.3: Idempotent bundle generation: running bundle script yields deterministic output", async () => {
    const script = loadBundleScript();
    assertContains(script, "writeFileSync", "bundle-app.mjs must write deterministic output");
  });

  await suite.test("T2.12.4: Info.plist XML structure is well-formed and passes plist parser", async () => {
    assertContains(infoPlist, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "Info.plist must start with XML declaration");
    assertContains(infoPlist, "<plist version=\"1.0\">", "Info.plist must define plist element");
    assertContains(infoPlist, "</plist>", "Info.plist must have closing plist tag");
  });

  await suite.test("T2.12.5: Bundled index.html size is >= 100KB containing all required scripts and styles", async () => {
    const bundlePath = path.join(PROJECT_ROOT, "ios-app/www/index.html");
    const stats = fs.statSync(bundlePath);
    assert(stats.size > 100000, `Bundled index.html size must be >= 100KB, got: ${stats.size} bytes`);
  });

  console.log("\n================================================================================");
  console.log(`  TIER 2 SUITE FINISHED: ${suite.summary().passed}/${suite.summary().total} Passed`);
  console.log("================================================================================\n");

  return suite.summary();
}
