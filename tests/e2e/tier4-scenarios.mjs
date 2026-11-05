import {
  createTestSession,
  SEEDED_ACCOUNTS,
  assert,
  TestSuite,
  cleanupTestRecords,
} from "./test-client.mjs";

export async function runTier4Suite() {
  const suite = new TestSuite("Tier 4: Real-World Workload Scenarios");
  console.log("\n============================================================");
  console.log("  RUNNING TIER 4: REAL-WORLD APPLICATION WORKFLOWS (≥5 scenarios)");
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
  // Scenario 1: New Semester Academic Onboarding
  // -------------------------------------------------------------------------
  await suite.test("Scenario 1: New Semester Academic Onboarding", async () => {
    // 1. Student logs in and loads dashboard
    const dash = await studentSession.client.student.dashboard.query();
    assert(dash !== null && dash.student !== null, "Student record should be loaded in dashboard");
    assert(Boolean(dash.stats), "Academic statistics should be present");

    // 2. Student inspects overview & achievements
    const overview = await studentSession.client.student.overview.query();
    assert(Array.isArray(overview.gpaHistory), "GPA history should be available");
    assert(Array.isArray(overview.achievements), "Achievements should be available");

    // 3. Student inspects enrolled courses
    const myCourses = await studentSession.client.student.myCourses.query();
    assert(Array.isArray(myCourses), "Enrolled courses should be an array");

    // 4. Student checks course recommendations for the upcoming semester
    const recommendations = await studentSession.client.courses.getRecommendations.query();
    assert(Array.isArray(recommendations), "Course recommendations should be an array");

    // 5. Student consults prerequisite tree to plan next semester
    const prereqs = await studentSession.client.courses.getAllPrerequisites.query();
    assert(prereqs.length > 0, "Prerequisite catalog should be available");

    // 6. Student views full weekly timetable
    const fullSchedule = await studentSession.client.student.fullSchedule.query();
    assert(Array.isArray(fullSchedule), "Full weekly schedule should be an array");

    // 7. Student checks announcements
    const announcements = await studentSession.client.student.studentAnnouncements.query();
    assert(Array.isArray(announcements), "Student announcements should be an array");
  });

  // -------------------------------------------------------------------------
  // Scenario 2: At-Risk Student Advisor Intervention
  // -------------------------------------------------------------------------
  await suite.test("Scenario 2: At-Risk Student Advisor Intervention", async () => {
    const studentMe = await studentSession.client.auth.me.query();
    const alertTitle = `E2E-S2-Intervention-Alert-${Date.now()}`;
    const noteTitle = `E2E-S2-Private-Note-${Date.now()}`;
    const meetingTitle = `E2E-S2-Urgent-Advising-${Date.now()}`;

    let createdAlertId = null;
    let createdNoteId = null;

    try {
      // 1. Advisor logs in, inspects advisee roster & insights
      const advisees = await advisorSession.client.advisor.getAssignedStudents.query();
      assert(advisees.length > 0, "Advisor must have assigned students");
      const targetAdvisee = advisees.find((a) => a.id === studentMe.id) || advisees[0];

      const insights = await advisorSession.client.advisor.getInsights.query();
      assert(insights.totalStudents > 0, "Insights should show non-zero advisees");

      // 2. Advisor inspects student detailed profile
      const profile = await advisorSession.client.advisor.getStudentProfile.query({
        studentId: targetAdvisee.id,
      });
      assert(profile.student !== null, "Profile should contain student data");

      // 3. Advisor dispatches high-severity academic alert
      const alertRes = await advisorSession.client.advisor.createAlert.mutate({
        studentId: targetAdvisee.id,
        title: alertTitle,
        message: "Attendance warning: Missed 3 consecutive lectures in Algorithm Analysis",
        severity: "high",
        type: "attendance",
      });
      assert(alertRes.success === true, "Alert creation should succeed");

      // 4. Advisor adds private clinical note
      const noteRes = await advisorSession.client.advisor.addNote.mutate({
        studentId: targetAdvisee.id,
        title: noteTitle,
        content: "Student informed me of transportation difficulties; advised on shuttle schedule",
        category: "attendance",
        isPrivate: true,
      });
      assert(noteRes.success === true, "Private note creation should succeed");

      // 5. Advisor schedules intervention appointment
      const apptRes = await advisorSession.client.advisor.scheduleAppointment.mutate({
        studentId: targetAdvisee.id,
        title: meetingTitle,
        description: "Mandatory academic intervention meeting",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 30,
        location: "Faculty of IT - Room 204",
      });
      assert(apptRes.success === true, "Appointment scheduling should succeed");

      // 6. Student logs in and checks dashboard
      const studentDash = await studentSession.client.student.dashboard.query();
      const studentAlert = studentDash.advisorAlerts?.find((a) => a.title === alertTitle);
      assert(studentAlert !== undefined, "Student dashboard must highlight the academic alert");
      createdAlertId = studentAlert.id;

      // 7. Student checks scheduled appointments
      const studentAppts = await studentSession.client.advisor.getAppointments.query({
        studentId: targetAdvisee.id,
      });
      const foundAppt = studentAppts.find((a) => a.title === meetingTitle);
      assert(foundAppt !== undefined, "Student must see the scheduled advising appointment");

      // 8. PRIVACY VERIFICATION: Student must NOT see advisor's private note
      const studentNotes = await studentSession.client.advisor.getNotes.query({
        studentId: targetAdvisee.id,
      });
      const leakedNote = studentNotes.find((n) => n.title === noteTitle);
      assert(leakedNote === undefined, "Security check: Private advisor note must NOT be visible to student");

      // 9. Advisor resolves the alert after intervention
      const resolveRes = await advisorSession.client.advisor.resolveAlert.mutate({
        alertId: createdAlertId,
      });
      assert(resolveRes.success === true, "Advisor should resolve alert");

      // Find created note ID to clean up
      const advisorNotes = await advisorSession.client.advisor.getNotes.query({
        studentId: targetAdvisee.id,
      });
      const foundNote = advisorNotes.find((n) => n.title === noteTitle);
      if (foundNote) createdNoteId = foundNote.id;
    } finally {
      // Teardown: delete alert, note, and appointment
      if (createdAlertId) {
        await advisorSession.client.advisor.deleteAlert.mutate(createdAlertId).catch(() => {});
      }
      if (createdNoteId) {
        await advisorSession.client.advisor.deleteNote.mutate(createdNoteId).catch(() => {});
      }
      await cleanupTestRecords();
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 3: Offline Academic Advisory Assistance
  // -------------------------------------------------------------------------
  await suite.test("Scenario 3: Offline Academic Advisory Assistance", async () => {
    // 1. Verify AI service offline mock status
    const status = await studentSession.client.aiChat.getStatus.query();
    assert(status !== null, "AI status should return object");

    // 2. Student opens conversation
    const conv = await studentSession.client.aiChat.createConversation.mutate({
      title: "E2E-S3 Offline Advisory Guidance",
    });
    const convId = conv.conversationId;

    try {
      // 3. Student asks about graduation requirements and minimum GPA regulations
      const res = await studentSession.client.aiChat.sendMessage.mutate({
        conversationId: convId,
        message: "ما هو الحد الأدنى لمعدل التخرج وشروط الإنذار الأكاديمي في جامعة الزيتونة؟",
      });
      assert(res.success === true, "AI response should succeed");
      assert(typeof res.response === "string" && res.response.length > 0, "Response must contain text");
      assert(
        res.isOfflineFallback === true || res.source === "faq" || res.source === "academic_rules" || res.source === "local_advisor" || res.source === "external_llm",
        "Source should be a recognized fallback or advisory source"
      );

      // 4. Student asks follow-up about attendance rules
      const res2 = await studentSession.client.aiChat.sendMessage.mutate({
        conversationId: convId,
        message: "ما هي نسبة الحرمان من الغياب في المقررات الدراسية؟",
      });
      assert(res2.success === true, "Follow-up response should succeed");
      assert(res2.response.length > 0, "Follow-up response must contain text");

      // 5. Student rates the assistant response
      const messages = await studentSession.client.aiChat.getMessages.query(convId);
      const assistantMsg = messages.find((m) => m.role === "assistant");
      assert(assistantMsg !== undefined, "Assistant message should be recorded in thread");

      const rateRes = await studentSession.client.aiChat.rateMessage.mutate({
        messageId: assistantMsg.id,
        feedback: "up",
      });
      assert(rateRes.success === true, "Message rating should succeed");
    } finally {
      // Teardown: delete conversation
      await studentSession.client.aiChat.deleteConversation.mutate(convId);
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 4: Campus Lecture Navigation
  // -------------------------------------------------------------------------
  await suite.test("Scenario 4: Campus Lecture Navigation", async () => {
    // 1. Student checks full weekly timetable to find lecture location
    const fullSchedule = await studentSession.client.student.fullSchedule.query();
    assert(Array.isArray(fullSchedule), "Schedule should be array");

    // 2. Load campus directory
    const campus = await studentSession.client.navigation.campus.query();
    assert(Array.isArray(campus.buildings), "Buildings should be available");
    assert(Array.isArray(campus.rooms), "Rooms should be available");

    // 3. Verify each building has coordinates and valid floor bounds
    for (const building of campus.buildings) {
      assert(typeof building.lat === "number" && !isNaN(building.lat), "Valid lat");
      assert(typeof building.lng === "number" && !isNaN(building.lng), "Valid lng");
      assert(building.floor >= 0, "Floor count must be non-negative");
    }

    // 4. Verify rooms map to valid buildings
    const buildingIds = new Set(campus.buildings.map((b) => b.id));
    for (const room of campus.rooms.slice(0, 10)) {
      assert(buildingIds.has(room.buildingId), `Room ${room.roomNumber} must map to valid building`);
    }

    // 5. Locate IT Faculty building specifically
    const itBuilding = campus.buildings.find(
      (b) => (b.name && b.name.includes("IT")) || (b.nameAr && b.nameAr.includes("تكنولوجيا"))
    );
    assert(itBuilding !== undefined, "IT Faculty building should exist");
    assert(itBuilding.capacity > 0, "IT building should have non-zero capacity");
  });

  // -------------------------------------------------------------------------
  // Scenario 5: Admin Faculty Governance
  // -------------------------------------------------------------------------
  await suite.test("Scenario 5: Admin Faculty Governance", async () => {
    const announceTitle = `E2E-S5-Governance-Broadcast-${Date.now()}`;
    let createdAnnounceId = null;

    // 1. Admin audits system usage & user counts
    const dash = await adminSession.client.admin.dashboard.query();
    assert(dash.stats.totalUsers > 0, "Admin dashboard stats totalUsers > 0");
    assert(dash.stats.totalStudents > 0, "Admin dashboard stats totalStudents > 0");
    assert(dash.stats.totalAdvisors > 0, "Admin dashboard stats totalAdvisors > 0");
    assert(dash.departments.length > 0, "Departments should be listed");
    assert(dash.courses.length > 0, "Courses should be listed");

    // 2. Admin audits unassigned students
    const unassigned = await adminSession.client.admin.getUnassignedStudents.query();
    assert(Array.isArray(unassigned), "Unassigned students should be an array");

    // 3. Admin audits advisor rosters
    const advisors = await adminSession.client.admin.getAdvisorsWithStudents.query();
    assert(advisors.length > 0, "Advisor roster should not be empty");

    // 4. Admin pairs a student with advisor and verifies
    const targetAdvisor = advisors[0];
    let testStudentId = null;
    let originalAdvisorId = null;

    if (unassigned.length > 0) {
      testStudentId = unassigned[0].id;
      originalAdvisorId = null;
    } else {
      const candidate = targetAdvisor.students[0];
      testStudentId = candidate.id;
      originalAdvisorId = targetAdvisor.id;
    }

    try {
      await adminSession.client.admin.assignAdvisor.mutate({
        studentId: testStudentId,
        advisorId: targetAdvisor.id,
      });

      // Verify assignment in advisor roster
      const updatedAdvisors = await adminSession.client.admin.getAdvisorsWithStudents.query();
      const matchedAdvisor = updatedAdvisors.find((a) => a.id === targetAdvisor.id);
      assert(
        matchedAdvisor.students.some((s) => s.id === testStudentId),
        "Student should appear in advisor's student list"
      );

      // 5. Admin broadcasts campus announcement
      const annRes = await adminSession.client.announcements.create.mutate({
        title: announceTitle,
        titleAr: announceTitle,
        content: "Campus governance announcement regarding academic schedule",
        contentAr: "إعلان إداري حول التقويم الأكاديمي",
        priority: "medium",
        targetRole: "all",
        isActive: true,
      });
      assert(annRes.success === true, "Announcement broadcast should succeed");

      // Verify announcement is visible across roles
      const studentAnn = await studentSession.client.announcements.list.query();
      const found = studentAnn.find((a) => a.title === announceTitle);
      assert(found !== undefined, "Announcement must be visible to students");
      createdAnnounceId = found.id;

      const advisorAnn = await advisorSession.client.announcements.list.query();
      assert(advisorAnn.some((a) => a.title === announceTitle), "Announcement must be visible to advisors");
    } finally {
      // 6. Clean up announcement
      if (createdAnnounceId) {
        await adminSession.client.announcements.delete.mutate(createdAnnounceId);
      }
      // Restore advisor assignment
      await adminSession.client.admin.assignAdvisor.mutate({
        studentId: testStudentId,
        advisorId: originalAdvisorId,
      });
    }
  });

  // Teardown sessions
  await adminSession.logout();
  await advisorSession.logout();
  await studentSession.logout();

  const summary = suite.summary();
  console.log(`\nTier 4 Summary: ${summary.passed} Passed, ${summary.failed} Failed out of ${summary.total} tests.`);
  return summary;
}

if (process.argv[1]?.endsWith("tier4-scenarios.mjs")) {
  runTier4Suite()
    .then((summary) => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("Fatal Tier 4 error:", err);
      process.exit(1);
    });
}
