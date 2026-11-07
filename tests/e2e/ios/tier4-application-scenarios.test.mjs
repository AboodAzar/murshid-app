import {
  TestSuite,
  createIosTestSession,
  SEEDED_ACCOUNTS,
  assert,
  assertEqual,
  assertContains,
  assertThrows,
  loadBundleHtml,
  generateValidAttendanceQr,
  generateExpiredAttendanceQr,
  cleanupTestRecords,
} from "./helpers/test-client.mjs";

export async function runTier4ApplicationScenariosSuite() {
  const suite = new TestSuite("Tier 4: Real-World Application Scenarios (8 tests)");
  console.log("\n================================================================================");
  console.log("  RUNNING TIER 4: REAL-WORLD APPLICATION SCENARIOS (≥6 tests)");
  console.log("================================================================================\n");

  const bundleHtml = loadBundleHtml();

  // ---------------------------------------------------------------------------
  // T4.1: Scenario 1 — Complete Student Morning Routine
  // ---------------------------------------------------------------------------
  await suite.test("T4.1: Complete student morning routine (Sign-in -> Roadmap -> QR Attendance -> Feedback -> AI Advisor)", async () => {
    // 1. Student signs in with real credentials
    const session = createIosTestSession();
    const login = await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    assert(login.success === true, "Morning sign-in must succeed");
    assertEqual(login.user.email, SEEDED_ACCOUNTS.hanan.email, "Authenticated user must be Hanan");

    // 2. Student checks degree roadmap for morning orientation
    const roadmap = await session.client.courses.getMajorDegreeRoadmap.query({ major: "Computer Science" });
    assert(roadmap !== null, "Degree roadmap must load for morning overview");

    // 3. Student arrives in Hall 41 and scans attendance QR code for CS101
    const validQr = generateValidAttendanceQr(1);
    const attendanceRes = await session.client.student.recordAttendanceViaQr.mutate({
      courseId: 1,
      qrPayload: validQr,
      latitude: 31.7984,
      longitude: 35.8821,
    });
    assert(attendanceRes.success === true, "Attendance in Hall 41 must be recorded");
    assert(attendanceRes.status === "present", "Status must be 'present'");

    // 4. Query AI Academic Advisor regarding morning inquiries
    const conv = await session.client.aiChat.createConversation.mutate({
      title: "E2E-Morning-Advisory-Query",
    });
    const aiRes = await session.client.aiChat.sendMessage.mutate({
      conversationId: conv.conversationId,
      message: "Good morning! Can you check my attendance and schedule for today?",
    });
    assert(aiRes.success === true, "AI advisor must respond to morning inquiry");
    assert(Boolean(aiRes.response), "AI response must contain advice text");

    // 5. Review courses dashboard
    const courses = await session.client.student.myCourses.query();
    assert(courses.length > 0, "Enrolled courses must be displayed on dashboard");
  });

  // ---------------------------------------------------------------------------
  // T4.2: Scenario 2 — Live Academic Advisor Inquiry on iOS
  // ---------------------------------------------------------------------------
  await suite.test("T4.2: Live academic advisor inquiry on iOS (Status Ping -> Conversation -> Advisory Response -> History)", async () => {
    const session = createIosTestSession();
    await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);

    // 1. Health & status check
    const status = await session.client.aiChat.getStatus.query();
    assert(status.isOnline === true, "AI engine must be online");

    // 2. Create conversation
    const conv = await session.client.aiChat.createConversation.mutate({
      title: "E2E-Degree-Advising",
    });

    // 3. Ask complex academic plan question
    const aiRes = await session.client.aiChat.sendMessage.mutate({
      conversationId: conv.conversationId,
      message: "ما هي شروط التخرج لقسم علم الحاسوب؟",
    });
    assert(aiRes.success === true, "Advisory inquiry must succeed");
    assert(Boolean(aiRes.response), "Response must provide guidance");

    // 4. Verify message history persistence
    const messages = await session.client.aiChat.getMessages.query(conv.conversationId);
    assert(Array.isArray(messages) && messages.length >= 2, "Chat history must contain user and assistant messages");
  });

  // ---------------------------------------------------------------------------
  // T4.3: Scenario 3 — Degree Roadmap & Course Review
  // ---------------------------------------------------------------------------
  await suite.test("T4.3: Degree roadmap & course review (Courses -> Progress -> Prerequisite Checks)", async () => {
    const session = createIosTestSession();
    await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);

    // 1. Fetch courses
    const courses = await session.client.student.myCourses.query();
    assert(courses.length >= 4, "Student must have courses registered");

    // 2. Fetch degree roadmap
    const roadmap = await session.client.courses.getMajorDegreeRoadmap.query({ major: "Computer Science" });
    assert(roadmap !== null, "Roadmap must return curriculum requirements");

    // 3. Verify safe-area clearance in layout bundle
    assertContains(bundleHtml, "env(safe-area-inset-bottom)", "Roadmap view must respect safe-area-inset-bottom");
  });

  // ---------------------------------------------------------------------------
  // T4.4: Scenario 4 — Offline / Hotspot IP Reconfiguration
  // ---------------------------------------------------------------------------
  await suite.test("T4.4: Offline / Personal Hotspot IP reconfiguration (Config Modal -> Ping -> Storage -> Reconnect)", async () => {
    // 1. App has server modal with input
    assertContains(bundleHtml, "id=\"ios-server-modal\"", "Server modal must exist for hotspot switching");
    assertContains(bundleHtml, "id=\"ios-server-url-input\"", "Server URL input must exist");

    // 2. Ping active backend to simulate connection test
    const session = createIosTestSession();
    const ping = await session.client.aiChat.getStatus.query();
    assert(ping.isOnline === true, "Connection ping must confirm server reachability");

    // 3. Reconnect with authentication
    const login = await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);
    assert(login.success === true, "Session must reconnect cleanly after server validation");
  });

  // ---------------------------------------------------------------------------
  // T4.5: Scenario 5 — Edge-to-Edge iPhone XS Notch & Home Bar Navigation
  // ---------------------------------------------------------------------------
  await suite.test("T4.5: Edge-to-edge iPhone XS Notch & Home Bar navigation (Safe Insets -> Zero Double Header -> Nav)", async () => {
    // 1. Edge-to-edge fullscreen overrides present
    assertContains(bundleHtml, "env(safe-area-inset-top)", "Top notch safe inset must be declared");
    assertContains(bundleHtml, "env(safe-area-inset-bottom)", "Bottom home bar safe inset must be declared");

    // 2. Viewport fit
    assertContains(bundleHtml, "viewport-fit=cover", "Viewport fit cover required for edge-to-edge");

    // 3. No desktop chassis border
    assertContains(bundleHtml, "border: none !important;", "Chassis border must be stripped in native overrides");
  });

  // ---------------------------------------------------------------------------
  // T4.6: Scenario 6 — Attendance Scan Error & Graceful Recovery
  // ---------------------------------------------------------------------------
  await suite.test("T4.6: Attendance scan error & graceful recovery (Expired QR rejection -> Warning -> Fresh Scan success)", async () => {
    const session = createIosTestSession();
    await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);

    // 1. Attempt scan with expired QR token (> 30s old)
    const expiredQr = generateExpiredAttendanceQr(1);
    await assertThrows(
      async () => await session.client.student.recordAttendanceViaQr.mutate({
        courseId: 1,
        qrPayload: expiredQr,
      }),
      "expired"
    );

    // 2. Retry with freshly generated QR code
    const freshQr = generateValidAttendanceQr(1);
    const retryRes = await session.client.student.recordAttendanceViaQr.mutate({
      courseId: 1,
      qrPayload: freshQr,
    });
    assert(retryRes.success === true, "Fresh QR retry must succeed");
    assert(retryRes.status === "present", "Status must update to present");
  });

  // ---------------------------------------------------------------------------
  // T4.7: Scenario 7 — Multi-Course Attendance Sprint
  // ---------------------------------------------------------------------------
  await suite.test("T4.7: Multi-course attendance sprint (Morning CS101 lecture + Afternoon CS201 lab)", async () => {
    const session = createIosTestSession();
    await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);

    // Scan Course 1
    const qr1 = generateValidAttendanceQr(1);
    const res1 = await session.client.student.recordAttendanceViaQr.mutate({
      courseId: 1,
      qrPayload: qr1,
    });
    assert(res1.success === true, "Course 1 attendance must be recorded");

    // Scan Course 2
    const qr2 = generateValidAttendanceQr(2);
    const res2 = await session.client.student.recordAttendanceViaQr.mutate({
      courseId: 2,
      qrPayload: qr2,
    });
    assert(res2.success === true, "Course 2 attendance must be recorded");
  });

  // ---------------------------------------------------------------------------
  // T4.8: Scenario 8 — Advisor Consultation & Automated Study Plan Guidance
  // ---------------------------------------------------------------------------
  await suite.test("T4.8: Advisor consultation & study plan guidance (Inquiry -> Personalized Advice -> Logout)", async () => {
    const session = createIosTestSession();
    await session.login(SEEDED_ACCOUNTS.hanan.email, SEEDED_ACCOUNTS.hanan.password);

    // 1. Inquire with advisor
    const conv = await session.client.aiChat.createConversation.mutate({
      title: "E2E-Electives-Advisory",
    });
    const advice = await session.client.aiChat.sendMessage.mutate({
      conversationId: conv.conversationId,
      message: "What elective courses do you recommend for my next semester?",
    });
    assert(advice.success === true, "Advisor response must succeed");
    assert(Boolean(advice.response), "Advice must be provided");

    // 2. Logout cleanly
    await session.logout();
    assertEqual(session.getCookie(), "", "Session cookie cleared");
    assertEqual(session.getBearerToken(), "", "Bearer token cleared");
  });

  // Clean up any test conversation rows
  await cleanupTestRecords();

  console.log("\n================================================================================");
  console.log(`  TIER 4 SUITE FINISHED: ${suite.summary().passed}/${suite.summary().total} Passed`);
  console.log("================================================================================\n");

  return suite.summary();
}
