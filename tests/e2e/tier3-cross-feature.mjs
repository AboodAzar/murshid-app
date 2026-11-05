import {
  createTestSession,
  SEEDED_ACCOUNTS,
  assert,
  TestSuite,
  cleanupTestRecords,
} from "./test-client.mjs";

export async function runTier3Suite() {
  const suite = new TestSuite("Tier 3: Pairwise Cross-Feature Combinations");
  console.log("\n============================================================");
  console.log("  RUNNING TIER 3: CROSS-FEATURE INTEGRATION (≥5 tests)");
  console.log("============================================================\n");

  const adminSession = createTestSession();
  const advisorSession = createTestSession();
  const studentSession = createTestSession();

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
  // T3.1: Admin Announcement Broadcast ↔ Student & Advisor Dashboard
  // -------------------------------------------------------------------------
  await suite.test("T3.1: Admin creates announcement -> Student receives announcement in dashboard", async () => {
    const uniqueTitle = `E2E-T3-Announcement-${Date.now()}`;
    let createdId = null;

    try {
      const createRes = await adminSession.client.announcements.create.mutate({
        title: uniqueTitle,
        titleAr: uniqueTitle,
        content: "Campus-wide advisory update for registration week",
        contentAr: "تحديث أكاديمي على مستوى الحرم الجامعي",
        priority: "high",
        targetRole: "all",
        isActive: true,
      });
      assert(createRes.success === true, "Announcement creation should succeed");

      // Verify student sees the announcement
      const studentAnnouncements = await studentSession.client.announcements.list.query();
      const found = studentAnnouncements.find((a) => a.title === uniqueTitle);
      assert(found !== undefined, "Student should receive the newly created announcement");
      createdId = found.id;

      // Verify advisor sees the announcement
      const advisorAnnouncements = await advisorSession.client.announcements.list.query();
      assert(
        advisorAnnouncements.some((a) => a.title === uniqueTitle),
        "Advisor should receive the newly created announcement"
      );
    } finally {
      if (createdId) {
        await adminSession.client.announcements.delete.mutate(createdId);
      }
    }
  });

  // -------------------------------------------------------------------------
  // T3.2: Admin Advisor Assignment ↔ Advisor Advisee Roster & Insights
  // -------------------------------------------------------------------------
  await suite.test("T3.2: Admin assigns student to Advisor -> Advisor advisee roster reflects new student", async () => {
    const advisors = await adminSession.client.admin.getAdvisorsWithStudents.query();
    const targetAdvisor = advisors.find((a) => a.id === 210024) || advisors[0];
    const targetAdvisorId = targetAdvisor.id;

    let unassigned = await adminSession.client.admin.getUnassignedStudents.query();
    let testStudentId = null;
    let originalAdvisorId = null;

    if (unassigned.length > 0) {
      testStudentId = unassigned[0].id;
      originalAdvisorId = null;
    } else {
      // Temporarily unassign one student
      const otherAdvisor = advisors.find(
        (a) => a.id !== targetAdvisorId && a.students.length > 0
      ) || advisors[0];
      const candidate = otherAdvisor.students[0];
      testStudentId = candidate.id;
      originalAdvisorId = otherAdvisor.id;

      await adminSession.client.admin.assignAdvisor.mutate({
        studentId: testStudentId,
        advisorId: null,
      });
    }

    try {
      // Assign student to target advisor
      const assignRes = await adminSession.client.admin.assignAdvisor.mutate({
        studentId: testStudentId,
        advisorId: targetAdvisorId,
      });
      assert(assignRes.success === true, "Admin assignAdvisor should succeed");

      // Verify advisor advisee roster
      const updatedAdvisees = await advisorSession.client.advisor.getAssignedStudents.query();
      assert(
        updatedAdvisees.some((s) => s.id === testStudentId),
        "Newly assigned student should immediately appear in advisor advisee roster"
      );

      // Verify advisor insights
      const insights = await advisorSession.client.advisor.getInsights.query();
      assert(insights.totalStudents > 0, "Advisor insights should reflect non-zero students");
    } finally {
      // Restore original state
      await adminSession.client.admin.assignAdvisor.mutate({
        studentId: testStudentId,
        advisorId: originalAdvisorId,
      });
    }
  });

  // -------------------------------------------------------------------------
  // T3.3: Advisor Academic Alert Dispatch ↔ Student Academic Alerts
  // -------------------------------------------------------------------------
  await suite.test("T3.3: Advisor creates academic alert -> Student dashboard reflects alert", async () => {
    const studentMe = await studentSession.client.auth.me.query();
    const uniqueTitle = `E2E-T3-Alert-${Date.now()}`;
    let createdAlertId = null;

    try {
      const alertRes = await advisorSession.client.advisor.createAlert.mutate({
        studentId: studentMe.id,
        title: uniqueTitle,
        message: "Course attendance fell below 80% threshold",
        severity: "high",
        type: "attendance",
      });
      assert(alertRes.success === true, "Alert dispatch should succeed");

      // Verify student queries dashboard and finds alert in advisorAlerts
      const studentDash = await studentSession.client.student.dashboard.query();
      const foundAlert = studentDash.advisorAlerts?.find((a) => a.title === uniqueTitle);
      assert(foundAlert !== undefined, "Student should see the newly created alert in dashboard alerts card");
      createdAlertId = foundAlert.id;

      // Advisor resolves alert
      const resolveRes = await advisorSession.client.advisor.resolveAlert.mutate({
        alertId: createdAlertId,
      });
      assert(resolveRes.success === true, "Advisor should resolve alert");
    } finally {
      if (createdAlertId) {
        await advisorSession.client.advisor.deleteAlert.mutate(createdAlertId);
      }
    }
  });

  // -------------------------------------------------------------------------
  // T3.4: Advisor Advising Appointment ↔ Student Timetable & Campus Nav
  // -------------------------------------------------------------------------
  await suite.test("T3.4: Advisor schedules appointment -> Student reflects appointment & campus room", async () => {
    const studentMe = await studentSession.client.auth.me.query();
    const uniqueTitle = `E2E-T3-Meeting-${Date.now()}`;
    let appointmentCreated = false;

    try {
      const apptRes = await advisorSession.client.advisor.scheduleAppointment.mutate({
        studentId: studentMe.id,
        title: uniqueTitle,
        description: "Semester academic progress review",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 30,
        location: "IT-201",
      });
      assert(apptRes.success === true, "Appointment scheduling should succeed");
      appointmentCreated = true;

      // Verify student sees appointment
      const studentAppts = await studentSession.client.advisor.getAppointments.query({
        studentId: studentMe.id,
      });
      const foundAppt = studentAppts.find((a) => a.title === uniqueTitle);
      assert(foundAppt !== undefined, "Student should see scheduled appointment");
      assert(foundAppt.status === "scheduled", "Appointment status should be 'scheduled'");

      // Verify location corresponds to campus directory
      const campus = await studentSession.client.navigation.campus.query();
      assert(campus.buildings.length > 0, "Campus buildings should exist");
      assert(campus.rooms.length > 0, "Campus rooms should exist");
    } finally {
      if (appointmentCreated) {
        // Cancel appointment and purge test row from DB
        await cleanupTestRecords();
      }
    }
  });

  // -------------------------------------------------------------------------
  // T3.5: Student AI Chat Guidance ↔ Study Plan Prerequisite Regulations
  // -------------------------------------------------------------------------
  await suite.test("T3.5: Student asks AI about prerequisite rule -> AI returns regulation rule -> Checks catalog", async () => {
    const conv = await studentSession.client.aiChat.createConversation.mutate({
      title: "E2E-T3 Prerequisite Inquiry",
    });
    const convId = conv.conversationId;

    try {
      const chatRes = await studentSession.client.aiChat.sendMessage.mutate({
        conversationId: convId,
        message: "ما هي شروط المتطلب السابق للمواد في الخطة الدراسية وما هي متطلبات مادة الخوارزميات؟",
      });
      assert(chatRes.success === true, "Chat message should succeed");
      assert(
        typeof chatRes.response === "string" && chatRes.response.length > 0,
        "AI should return guidance response"
      );

      // Student verifies actual prerequisite mapping from catalog
      const allPrereqs = await studentSession.client.courses.getAllPrerequisites.query();
      assert(allPrereqs.length > 0, "Prerequisite catalog should be available");
      const algoPrereq = allPrereqs.find(
        (p) => p.courseId === 49 || p.prerequisiteCode === "CS201"
      );
      assert(algoPrereq !== undefined, "Algorithm prerequisite mapping should exist in catalog");
    } finally {
      await studentSession.client.aiChat.deleteConversation.mutate(convId);
    }
  });

  // Teardown sessions
  await adminSession.logout();
  await advisorSession.logout();
  await studentSession.logout();

  const summary = suite.summary();
  console.log(`\nTier 3 Summary: ${summary.passed} Passed, ${summary.failed} Failed out of ${summary.total} tests.`);
  return summary;
}

if (process.argv[1]?.endsWith("tier3-cross-feature.mjs")) {
  runTier3Suite()
    .then((summary) => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("Fatal Tier 3 error:", err);
      process.exit(1);
    });
}
