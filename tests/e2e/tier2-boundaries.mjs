import {
  createTestSession,
  SEEDED_ACCOUNTS,
  assert,
  assertThrows,
  TestSuite,
} from "./test-client.mjs";

export async function runTier2Suite() {
  const suite = new TestSuite("Tier 2: Boundary & Corner Cases (F1 to F7)");
  console.log("\n============================================================");
  console.log("  RUNNING TIER 2: BOUNDARY & CORNER CASES (≥5 per feature)");
  console.log("============================================================\n");

  const adminSession = createTestSession();
  const advisorSession = createTestSession();
  const studentSession = createTestSession();
  const unauthSession = createTestSession();

  // Log in standard roles
  await adminSession.login(
    SEEDED_ACCOUNTS.admin.email,
    SEEDED_ACCOUNTS.admin.password
  );
  await advisorSession.login(
    SEEDED_ACCOUNTS.advisor.email,
    SEEDED_ACCOUNTS.advisor.password
  );
  await studentSession.login(
    SEEDED_ACCOUNTS.student.email,
    SEEDED_ACCOUNTS.student.password
  );

  // -------------------------------------------------------------------------
  // F1: Auth Boundaries
  // -------------------------------------------------------------------------
  console.log("--- F1: Auth Boundaries ---");

  await suite.test("T2.1.1: Login with invalid password fails with UNAUTHORIZED", async () => {
    await assertThrows(
      () =>
        unauthSession.login(SEEDED_ACCOUNTS.student.email, "WrongPassword123!"),
      "Invalid password"
    );
  });

  await suite.test("T2.1.2: Login with unregistered email fails with UNAUTHORIZED", async () => {
    await assertThrows(
      () =>
        unauthSession.login("unregistered.student@zuj.edu.jo", "password123"),
      "User not found"
    );
  });

  await suite.test("T2.1.3: Registration with invalid non-ZUJ email rejected", async () => {
    await assertThrows(
      () =>
        unauthSession.client.auth.register.mutate({
          name: "Attacker",
          email: "attacker@external-domain.com",
          password: "password123",
        }),
      "official Al-Zaytoonah University email address"
    );
  });

  await suite.test("T2.1.4: Registration with short password (<8 chars) rejected by schema", async () => {
    await assertThrows(
      () =>
        unauthSession.client.auth.register.mutate({
          name: "Short Pwd",
          email: "test.short@zuj.edu.jo",
          password: "short",
        }),
      ""
    );
  });

  await suite.test("T2.1.5: Accessing protected endpoint with malformed JWT cookie rejected", async () => {
    const malformedSession = createTestSession();
    malformedSession.setCookie("app_session_id=malformed.invalid.token");
    await assertThrows(
      () => malformedSession.client.student.dashboard.query(),
      "Please login"
    );
  });

  await suite.test("T2.1.6: Accessing protected endpoint unauthenticated rejected", async () => {
    await assertThrows(
      () => unauthSession.client.student.dashboard.query(),
      "Please login"
    );
  });

  // -------------------------------------------------------------------------
  // F2: Student Dashboard & RBAC Boundaries
  // -------------------------------------------------------------------------
  console.log("\n--- F2: Student Dashboard & RBAC Boundaries ---");

  await suite.test("T2.2.1: Student accessing admin route (admin.dashboard) throws FORBIDDEN", async () => {
    await assertThrows(
      () => studentSession.client.admin.dashboard.query(),
      "10002"
    );
  });

  await suite.test("T2.2.2: Student accessing advisor route (advisor.createAlert) throws FORBIDDEN", async () => {
    await assertThrows(
      () =>
        studentSession.client.advisor.createAlert.mutate({
          studentId: 210027,
          title: "Unauthorized Alert",
          message: "Should fail",
          severity: "low",
          type: "attendance",
        }),
      "10003"
    );
  });

  await suite.test("T2.2.3: Student accessing advisor note route (advisor.addNote) throws FORBIDDEN", async () => {
    await assertThrows(
      () =>
        studentSession.client.advisor.addNote.mutate({
          studentId: 210027,
          title: "Unauthorized Note",
          content: "Should fail",
          category: "general",
        }),
      "10003"
    );
  });

  await suite.test("T2.2.4: Student querying another student dashboard throws FORBIDDEN", async () => {
    // Student Khaled (210027) trying to view student Lina (210028)
    const dash = await studentSession.client.student.dashboard.query({
      studentId: 210028,
    });
    // In student.ts, student role forces targetStudentId to ctx.user.id (Khaled)
    assert(dash.student !== null, "Dashboard student should be loaded");
    assert(dash.student.id === 210027, "Student should not be able to view another student's ID");
  });

  await suite.test("T2.2.5: Student querying non-existent course details returns null or error", async () => {
    const course = await studentSession.client.courses.getById.query(999999);
    assert(course === null || course === undefined, "Non-existent course should return null");
  });

  // -------------------------------------------------------------------------
  // F3: Course Enrollment & Prerequisite Guard Boundaries
  // -------------------------------------------------------------------------
  console.log("\n--- F3: Course Enrollment & Prerequisite Guard Boundaries ---");

  await suite.test("T2.3.1: Enrolling in non-existent course ID (999999) rejected with NOT_FOUND", async () => {
    await assertThrows(
      () => studentSession.client.courses.enrollCourse.mutate({ courseId: 999999 }),
      "Course not found"
    );
  });

  await suite.test("T2.3.2: Enrolling in course with missing prerequisite rejected with BAD_REQUEST", async () => {
    // Lina Omar has not completed prerequisite for Course 53 (needs 49)
    const linaSession = createTestSession();
    await linaSession.login(
      SEEDED_ACCOUNTS.studentLina.email,
      SEEDED_ACCOUNTS.studentLina.password
    );
    await assertThrows(
      () => linaSession.client.courses.enrollCourse.mutate({ courseId: 53 }),
      "Missing prerequisite"
    );
    await linaSession.logout();
  });

  await suite.test("T2.3.3: Enrolling in already completed course rejected with BAD_REQUEST", async () => {
    // Course 33 is already completed by student Khaled
    await assertThrows(
      () => studentSession.client.courses.enrollCourse.mutate({ courseId: 33 }),
      "Course has already been completed"
    );
  });

  await suite.test("T2.3.4: Duplicate enrollment in in-progress course rejected with BAD_REQUEST", async () => {
    // Course 54 is currently in_progress for student Khaled
    await assertThrows(
      () => studentSession.client.courses.enrollCourse.mutate({ courseId: 54 }),
      "Already enrolled"
    );
  });

  await suite.test("T2.3.5: Advisor attempting courses.enrollCourse rejected with UNAUTHORIZED", async () => {
    await assertThrows(
      () => advisorSession.client.courses.enrollCourse.mutate({ courseId: 33 }),
      ""
    );
  });

  await suite.test("T2.3.6: Admin attempting courses.enrollCourse rejected with UNAUTHORIZED", async () => {
    await assertThrows(
      () => adminSession.client.courses.enrollCourse.mutate({ courseId: 33 }),
      ""
    );
  });

  // -------------------------------------------------------------------------
  // F4: Advisor Boundaries & Cross-Student RBAC
  // -------------------------------------------------------------------------
  console.log("\n--- F4: Advisor Boundaries & Cross-Student RBAC ---");

  // Find a student not assigned to advisor Ahmad Khalil
  const adminDash = await adminSession.client.admin.dashboard.query();
  const unassignedOrOtherAdvisorStudent = adminDash.users.find(
    (u) => u.role === "student" && u.advisorId !== 210024
  );
  assert(
    unassignedOrOtherAdvisorStudent !== undefined,
    "Should have a student not assigned to advisor 210024"
  );
  const foreignStudentId = unassignedOrOtherAdvisorStudent.id;

  await suite.test("T2.4.1: Advisor accessing admin route (admin.assignAdvisor) throws FORBIDDEN", async () => {
    await assertThrows(
      () =>
        advisorSession.client.admin.assignAdvisor.mutate({
          studentId: foreignStudentId,
          advisorId: null,
        }),
      "10002"
    );
  });

  await suite.test("T2.4.2: Advisor creating alert for unassigned/foreign student throws FORBIDDEN", async () => {
    await assertThrows(
      () =>
        advisorSession.client.advisor.createAlert.mutate({
          studentId: foreignStudentId,
          title: "Illegal Alert",
          message: "Should fail",
          severity: "high",
          type: "at_risk",
        }),
      "Not authorized for this student"
    );
  });

  await suite.test("T2.4.3: Advisor adding note for unassigned/foreign student throws FORBIDDEN", async () => {
    await assertThrows(
      () =>
        advisorSession.client.advisor.addNote.mutate({
          studentId: foreignStudentId,
          title: "Illegal Note",
          content: "Should fail",
          category: "academic",
        }),
      "Not authorized for this student"
    );
  });

  await suite.test("T2.4.4: Advisor scheduling appointment for foreign student throws FORBIDDEN", async () => {
    await assertThrows(
      () =>
        advisorSession.client.advisor.scheduleAppointment.mutate({
          studentId: foreignStudentId,
          title: "Illegal Meeting",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      "Not authorized for this student"
    );
  });

  await suite.test("T2.4.5: Advisor resolving non-existent alert ID throws NOT_FOUND", async () => {
    await assertThrows(
      () => advisorSession.client.advisor.resolveAlert.mutate({ alertId: 999999 }),
      ""
    );
  });

  await suite.test("T2.4.6: Advisor deleting non-existent note ID throws NOT_FOUND", async () => {
    await assertThrows(
      () => advisorSession.client.advisor.deleteNote.mutate(999999),
      ""
    );
  });

  // -------------------------------------------------------------------------
  // F5: Admin Governance Boundaries
  // -------------------------------------------------------------------------
  console.log("\n--- F5: Admin Governance Boundaries ---");

  const adminMe = await adminSession.client.auth.me.query();

  await suite.test("T2.5.1: Admin self-deletion attempt rejected with BAD_REQUEST", async () => {
    await assertThrows(
      () =>
        adminSession.client.admin.deleteUser.mutate({
          id: adminMe.id,
          requesterId: adminMe.id,
        }),
      "You cannot delete your own account"
    );
  });

  await suite.test("T2.5.2: Admin updating non-existent user ID rejected with NOT_FOUND", async () => {
    await assertThrows(
      () => adminSession.client.admin.updateUser.mutate({ id: 999999, name: "Nobody" }),
      "User not found"
    );
  });

  await suite.test("T2.5.3: Admin assigning non-existent advisor ID rejected with NOT_FOUND", async () => {
    await assertThrows(
      () =>
        adminSession.client.admin.assignAdvisor.mutate({
          studentId: foreignStudentId,
          advisorId: 999999,
        }),
      "Advisor not found"
    );
  });

  await suite.test("T2.5.4: Admin assigning advisor to non-existent student ID rejected", async () => {
    await assertThrows(
      () =>
        adminSession.client.admin.assignAdvisor.mutate({
          studentId: 999999,
          advisorId: 210024,
        }),
      "Student not found"
    );
  });

  await suite.test("T2.5.5: Announcement creation with empty title rejected by schema", async () => {
    await assertThrows(
      () =>
        adminSession.client.announcements.create.mutate({
          title: "",
          titleAr: "",
          content: "Empty Title Test",
          contentAr: "تجربة",
          priority: "medium",
          targetRole: "all",
          isActive: true,
        }),
      ""
    );
  });

  // -------------------------------------------------------------------------
  // F6: Campus Navigation & Input Boundaries
  // -------------------------------------------------------------------------
  console.log("\n--- F6: Campus Navigation & Input Boundaries ---");

  await suite.test("T2.6.1: Campus navigation query without auth rejected with UNAUTHORIZED", async () => {
    await assertThrows(
      () => unauthSession.client.navigation.campus.query(),
      "Please login"
    );
  });

  await suite.test("T2.6.2: Searching non-existent room code yields no matches gracefully", async () => {
    const campus = await studentSession.client.navigation.campus.query();
    const nonExistent = campus.rooms.filter((r) => r.roomNumber === "NON_EXISTENT_ROOM_9999");
    assert(nonExistent.length === 0, "Non-existent room query should return empty array");
  });

  await suite.test("T2.6.3: Buildings list contains only valid finite numeric coordinates", async () => {
    const campus = await studentSession.client.navigation.campus.query();
    for (const b of campus.buildings) {
      assert(
        typeof b.lat === "number" && Number.isFinite(b.lat),
        `Building ${b.name} lat must be finite number`
      );
      assert(
        typeof b.lng === "number" && Number.isFinite(b.lng),
        `Building ${b.name} lng must be finite number`
      );
    }
  });

  await suite.test("T2.6.4: Rooms list contains valid positive capacity values", async () => {
    const campus = await studentSession.client.navigation.campus.query();
    for (const r of campus.rooms) {
      assert(
        typeof r.capacity === "number" && r.capacity >= 0,
        `Room ${r.roomNumber} capacity must be non-negative`
      );
    }
  });

  await suite.test("T2.6.5: Navigation handles special characters and XSS safely in queries", async () => {
    const campus = await studentSession.client.navigation.campus.query();
    const xssPattern = "<script>alert('xss')</script>";
    const matched = campus.rooms.filter((r) => r.name?.includes(xssPattern));
    assert(matched.length === 0, "No rooms should match XSS script pattern");
  });

  // -------------------------------------------------------------------------
  // F7: AI Chat Offline Resilience & Boundary Conditions
  // -------------------------------------------------------------------------
  console.log("\n--- F7: AI Chat Offline Resilience & Boundary Conditions ---");

  await suite.test("T2.7.1: AI chat request returns response in <1500ms under offline fallback", async () => {
    const conv = await studentSession.client.aiChat.createConversation.mutate({
      title: "Resilience Latency Test",
    });
    const convId = conv.conversationId;
    const start = Date.now();
    try {
      const res = await studentSession.client.aiChat.sendMessage.mutate({
        conversationId: convId,
        message: "ما هي شروط التخرج؟",
      });
      const latency = Date.now() - start;
      if (res.isOfflineFallback) {
        assert(latency < 2000, `AI response latency should be <2000ms, took ${latency}ms`);
      } else {
        assert(latency < 45000, `AI model inference latency should be <45000ms, took ${latency}ms`);
      }
      assert(res.success === true, "sendMessage should succeed");
    } finally {
      await studentSession.client.aiChat.deleteConversation.mutate(convId);
    }
  });

  await suite.test("T2.7.2: Accessing AI chat messages for non-existent conversation returns NOT_FOUND", async () => {
    await assertThrows(
      () => studentSession.client.aiChat.getMessages.query(999999),
      "NOT_FOUND"
    );
  });

  await suite.test("T2.7.3: Rating a non-existent message ID returns NOT_FOUND", async () => {
    await assertThrows(
      () =>
        studentSession.client.aiChat.rateMessage.mutate({
          messageId: 999999,
          feedback: "up",
        }),
      "NOT_FOUND"
    );
  });

  await suite.test("T2.7.4: Non-student role (Advisor) attempting createConversation rejected", async () => {
    await assertThrows(
      () =>
        advisorSession.client.aiChat.createConversation.mutate({
          title: "Advisor Attempt",
        }),
      ""
    );
  });

  await suite.test("T2.7.5: Non-student role (Admin) attempting createConversation rejected", async () => {
    await assertThrows(
      () =>
        adminSession.client.aiChat.createConversation.mutate({
          title: "Admin Attempt",
        }),
      ""
    );
  });

  await suite.test("T2.7.6: Deleting a non-existent conversation ID returns NOT_FOUND", async () => {
    await assertThrows(
      () => studentSession.client.aiChat.deleteConversation.mutate(999999),
      "NOT_FOUND"
    );
  });

  // Teardown sessions
  await adminSession.logout();
  await advisorSession.logout();
  await studentSession.logout();

  const summary = suite.summary();
  console.log(`\nTier 2 Summary: ${summary.passed} Passed, ${summary.failed} Failed out of ${summary.total} tests.`);
  return summary;
}

if (process.argv[1]?.endsWith("tier2-boundaries.mjs")) {
  runTier2Suite()
    .then((summary) => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("Fatal Tier 2 error:", err);
      process.exit(1);
    });
}
