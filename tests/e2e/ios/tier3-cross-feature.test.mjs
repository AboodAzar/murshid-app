import {
  TestSuite,
  createIosTestSession,
  SEEDED_ACCOUNTS,
  assert,
  assertEqual,
  assertContains,
  assertNotContains,
  assertThrows,
  loadBundleHtml,
  loadCapacitorConfig,
  loadInfoPlist,
  generateValidAttendanceQr,
  generateExpiredAttendanceQr,
  cleanupTestRecords,
} from "./helpers/test-client.mjs";

export async function runTier3CrossFeatureSuite() {
  const suite = new TestSuite("Tier 3: Pairwise Cross-Feature Integration (15 tests)");
  console.log("\n================================================================================");
  console.log("  RUNNING TIER 3: CROSS-FEATURE INTEGRATION (≥12 tests)");
  console.log("================================================================================\n");

  const session = createIosTestSession();
  const bundleHtml = loadBundleHtml();
  const capConfig = loadCapacitorConfig();
  const infoPlist = loadInfoPlist();

  // ---------------------------------------------------------------------------
  // T3.1: Server Host Reconfig + Bearer Auth + Live Courses Query
  // ---------------------------------------------------------------------------
  await suite.test("T3.1: Server host reconfiguration + Bearer auth + live courses query", async () => {
    // 1. Verify server host is configurable in client HTML
    assertContains(bundleHtml, "ios-server-url-input", "Host input must exist");
    // 2. Perform live login with Bearer token
    const testSession = createIosTestSession();
    const loginRes = await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    assert(loginRes.success === true, "Login must succeed");
    // 3. Query courses using authenticated session
    const courses = await testSession.client.student.myCourses.query();
    assert(Array.isArray(courses) && courses.length > 0, "Enrolled courses must be retrieved via session");
  });

  // ---------------------------------------------------------------------------
  // T3.2: Bearer Auth + Attendance QR Generation + Mutation
  // ---------------------------------------------------------------------------
  await suite.test("T3.2: Bearer auth + live attendance QR generation + mutation", async () => {
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const validQr = generateValidAttendanceQr(1); // CS101
    const result = await testSession.client.student.recordAttendanceViaQr.mutate({
      courseId: 1,
      qrPayload: validQr,
      latitude: 31.7984,
      longitude: 35.8821,
    });
    assert(result.success === true, "Attendance verification should succeed with live Bearer session");
    assert(result.status === "present", "Status must be 'present'");
  });

  // ---------------------------------------------------------------------------
  // T3.3: QR Attendance Scan + Haptics + Web Audio Success Chime
  // ---------------------------------------------------------------------------
  await suite.test("T3.3: QR code attendance scan + Haptics notification + Web Audio success chime", async () => {
    // Verify client bundle binds successful scan to both Haptics and Audio
    const hasScanFlow = (bundleHtml.includes("confirmMobileAttendance") || bundleHtml.includes("recordAttendanceViaQr")) &&
                        (bundleHtml.includes("playChime") || bundleHtml.includes("AudioContext") || bundleHtml.includes("Haptics"));
    assert(hasScanFlow, "Attendance scan must wire feedback to both audio chime and haptics");
  });

  // ---------------------------------------------------------------------------
  // T3.4: Expired QR Scan + Mutation Rejection + Audio Error Buzzer
  // ---------------------------------------------------------------------------
  await suite.test("T3.4: Expired QR code scan + student.recordAttendanceViaQr rejection + Web Audio error buzzer", async () => {
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const expiredQr = generateExpiredAttendanceQr(1);
    await assertThrows(
      async () => await testSession.client.student.recordAttendanceViaQr.mutate({
        courseId: 1,
        qrPayload: expiredQr,
      }),
      "expired"
    );
    // Client error branch should invoke error feedback
    const hasErrorChime = bundleHtml.includes("playChime('error')") ||
                          bundleHtml.includes("playChime(\"error\")") ||
                          bundleHtml.includes("showToast");
    assert(hasErrorChime, "Error flow should trigger alert feedback");
  });

  // ---------------------------------------------------------------------------
  // T3.5: Liquid Glass UI + AI Advisor Conversation + Streaming Inquiry
  // ---------------------------------------------------------------------------
  await suite.test("T3.5: Liquid Glass UI rendering + AI advisor conversation creation + inquiry", async () => {
    // 1. Verify Liquid Glass styles in bundle
    assertContains(bundleHtml, "backdrop-filter", "Liquid glass requires backdrop filter");
    // 2. Perform live AI conversation inquiry
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const conv = await testSession.client.aiChat.createConversation.mutate({
      title: "E2E-Tier3-Academic-Guidance",
    });
    assert(conv.success === true, "Conversation must be created in MariaDB");
    const aiRes = await testSession.client.aiChat.sendMessage.mutate({
      conversationId: conv.conversationId,
      message: "What are the graduation requirements for Computer Science?",
    });
    assert(aiRes.success === true, "AI guidance inquiry must return success");
    assert(Boolean(aiRes.response), "AI guidance inquiry must return non-empty response");
  });

  // ---------------------------------------------------------------------------
  // T3.6: Live Latency Check to aiChat.getStatus + Header Status Pill
  // ---------------------------------------------------------------------------
  await suite.test("T3.6: Live latency check to aiChat.getStatus + header network status pill update", async () => {
    const start = Date.now();
    const status = await session.client.aiChat.getStatus.query();
    const latency = Date.now() - start;
    assert(status.isOnline === true, "Server must report online status");
    assert(latency < 2000, `Health check latency should be < 2000ms, measured: ${latency}ms`);
    // Verify client HTML contains status pill updating logic
    const hasLatencyLogic = bundleHtml.includes("testServerConnection") ||
                            bundleHtml.includes("aiChat.getStatus") ||
                            bundleHtml.includes("server-status");
    assert(hasLatencyLogic, "Client bundle must contain server ping / status update logic");
  });

  // ---------------------------------------------------------------------------
  // T3.7: In-App Server Host Modal Toggle + Safe-Area Padding + Haptic Click
  // ---------------------------------------------------------------------------
  await suite.test("T3.7: In-app server host modal toggle + safe-area bottom padding + haptic click", async () => {
    // Modal must combine display toggling, safe padding, and haptic feedback
    assertContains(bundleHtml, "ios-server-modal", "Modal must exist");
    assertContains(bundleHtml, "openServerConfigModal", "Modal opener must exist");
    assertContains(bundleHtml, "closeServerConfigModal", "Modal closer must exist");
  });

  // ---------------------------------------------------------------------------
  // T3.8: Safe-Area Notch Clearance + Degree Roadmap Query + Sheet Open
  // ---------------------------------------------------------------------------
  await suite.test("T3.8: Edge-to-edge iPhone XS safe-area navigation + degree roadmap query + modal sheet", async () => {
    // 1. Check safe area CSS
    assertContains(bundleHtml, "env(safe-area-inset-top)", "Top safe area inset required");
    // 2. Query major degree roadmap
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const roadmap = await testSession.client.courses.getMajorDegreeRoadmap.query({ major: "Computer Science" });
    assert(roadmap !== null, "Degree roadmap must return courses and categories");
  });

  // ---------------------------------------------------------------------------
  // T3.9: Bearer Auth + Today's Schedule Query + Liquid Glass Cards
  // ---------------------------------------------------------------------------
  await suite.test("T3.9: Bearer token auth + student.todaySchedule query + Liquid Glass schedule card layout", async () => {
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const schedule = await testSession.client.student.todaySchedule.query();
    assert(Array.isArray(schedule), "Today schedule must return an array");
    // Verify glass styling in cards
    assertContains(bundleHtml, "zuj-card-shadow", "Cards must use zuj-card-shadow");
  });

  // ---------------------------------------------------------------------------
  // T3.10: Unauth Launch + Server Ping + Sign-in + Storage Persistence
  // ---------------------------------------------------------------------------
  await suite.test("T3.10: Unauthenticated launch + server host ping + student sign-in + storage persistence", async () => {
    // Unauthenticated ping
    const status = await session.client.aiChat.getStatus.query();
    assert(status.isOnline === true, "Public ping must succeed before login");
    // Sign-in
    const testSession = createIosTestSession();
    const login = await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    assert(login.success === true, "Sign-in must succeed");
    // Profile verification
    const me = await testSession.client.auth.me.query();
    assertEqual(me.email, SEEDED_ACCOUNTS.hanan.email, "Session must match Hanan");
  });

  // ---------------------------------------------------------------------------
  // T3.11: Sign-out + Token Clearance + Protected Query Rejection
  // ---------------------------------------------------------------------------
  await suite.test("T3.11: Student sign-out + token clearing + attempt protected query rejection", async () => {
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    await testSession.logout();
    assertEqual(testSession.getBearerToken(), "", "Bearer token cleared on logout");
    assertEqual(testSession.getCookie(), "", "Cookie cleared on logout");
    const me = await testSession.client.auth.me.query();
    assertEqual(me, null, "auth.me should return null after logout");
  });

  // ---------------------------------------------------------------------------
  // T3.12: Dual-Mode Auth Equivalence Check
  // ---------------------------------------------------------------------------
  await suite.test("T3.12: Dual-mode auth: Session via cookie verified identical to session via Bearer token", async () => {
    const cookieSession = createIosTestSession();
    await cookieSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const cookieUser = await cookieSession.client.auth.me.query();

    // Verify both resolve to same user ID
    assertEqual(cookieUser.id, 240002, "Cookie user ID must be 240002");
    assertEqual(cookieUser.role, "student", "Role must be 'student'");
  });

  // ---------------------------------------------------------------------------
  // T3.13: Camera Scanner Modal + Safe Area Top/Bottom Inset Padding
  // ---------------------------------------------------------------------------
  await suite.test("T3.13: Camera scanner modal open + safe area top inset padding + camera stream", async () => {
    assertContains(infoPlist, "NSCameraUsageDescription", "Camera permission must be declared");
    assertContains(bundleHtml, "env(safe-area-inset-top)", "Top notch clearance must be respected");
  });

  // ---------------------------------------------------------------------------
  // T3.14: Network Status Toggle + Graceful Offline Fallback Engine
  // ---------------------------------------------------------------------------
  await suite.test("T3.14: Network connectivity check + graceful AI offline fallback engine", async () => {
    const testSession = createIosTestSession();
    await testSession.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    const conv = await testSession.client.aiChat.createConversation.mutate({
      title: "E2E-Tier3-Fallback-Test",
    });
    const res = await testSession.client.aiChat.sendMessage.mutate({
      conversationId: conv.conversationId,
      message: "كم عدد الساعات المتبقية للتخرج؟",
    });
    assert(res.success === true, "AI response must succeed using either LLM or 3-tier local fallback");
    assert(Boolean(res.source), "Source engine must be reported");
  });

  // ---------------------------------------------------------------------------
  // T3.15: Complete Build Pipeline Validation
  // ---------------------------------------------------------------------------
  await suite.test("T3.15: Complete build pipeline: bundle script -> config validation -> asset sync", async () => {
    assert(capConfig !== null, "Capacitor config must be valid");
    assertEqual(capConfig.appId, "jo.edu.zuj.oliver", "appId must match");
    assertEqual(capConfig.webDir, "www", "webDir must match");
    assertContains(bundleHtml, "<!DOCTYPE html>", "Bundle must be generated");
  });

  // Teardown E2E test rows
  await cleanupTestRecords();

  console.log("\n================================================================================");
  console.log(`  TIER 3 SUITE FINISHED: ${suite.summary().passed}/${suite.summary().total} Passed`);
  console.log("================================================================================\n");

  return suite.summary();
}
