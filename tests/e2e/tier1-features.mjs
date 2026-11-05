import {
  createTestSession,
  SEEDED_ACCOUNTS,
  assert,
  assertEqual,
  TestSuite,
} from "./test-client.mjs";

export async function runTier1Suite() {
  const suite = new TestSuite("Tier 1: Feature Coverage (F1 to F7)");
  console.log("\n============================================================");
  console.log("  RUNNING TIER 1: FEATURE COVERAGE (≥5 per feature)");
  console.log("============================================================\n");

  const adminSession = createTestSession();
  const advisorSession = createTestSession();
  const studentSession = createTestSession();

  // -------------------------------------------------------------------------
  // F1: Auth & Session Management
  // -------------------------------------------------------------------------
  console.log("--- F1: Auth & Session Management ---");

  await suite.test("T1.1.1: Admin login succeeds with valid credentials", async () => {
    const res = await adminSession.login(
      SEEDED_ACCOUNTS.admin.email,
      SEEDED_ACCOUNTS.admin.password
    );
    assert(res.success === true, "Admin login response success should be true");
    assert(res.user?.role === "admin", "Admin role should be 'admin'");
    assert(Boolean(adminSession.getCookie()), "Admin session should have session cookie");
  });

  await suite.test("T1.1.2: Advisor login succeeds with valid credentials", async () => {
    const res = await advisorSession.login(
      SEEDED_ACCOUNTS.advisor.email,
      SEEDED_ACCOUNTS.advisor.password
    );
    assert(res.success === true, "Advisor login response success should be true");
    assert(res.user?.role === "advisor", "Advisor role should be 'advisor'");
    assert(Boolean(advisorSession.getCookie()), "Advisor session should have session cookie");
  });

  await suite.test("T1.1.3: Student login succeeds with valid credentials", async () => {
    const res = await studentSession.login(
      SEEDED_ACCOUNTS.student.email,
      SEEDED_ACCOUNTS.student.password
    );
    assert(res.success === true, "Student login response success should be true");
    assert(res.user?.role === "student", "Student role should be 'student'");
    assert(Boolean(studentSession.getCookie()), "Student session should have session cookie");
  });

  await suite.test("T1.1.4: auth.me validates active session with correct role and email", async () => {
    const me = await studentSession.client.auth.me.query();
    assert(me !== null, "auth.me should return user record");
    assertEqual(me.email, SEEDED_ACCOUNTS.student.email, "auth.me email mismatch");
    assertEqual(me.role, "student", "auth.me role mismatch");
  });

  await suite.test("T1.1.5: auth.logout clears cookie and invalidates session", async () => {
    const tempSession = createTestSession();
    await tempSession.login(
      SEEDED_ACCOUNTS.student.email,
      SEEDED_ACCOUNTS.student.password
    );
    assert(Boolean(tempSession.getCookie()), "Should have cookie before logout");
    await tempSession.logout();
    assertEqual(tempSession.getCookie(), "", "Cookie jar should be empty after logout");
    const meAfter = await tempSession.client.auth.me.query();
    assertEqual(meAfter, null, "auth.me should return null after logout");
  });

  // -------------------------------------------------------------------------
  // F2: Student Academic Progress & Dashboard
  // -------------------------------------------------------------------------
  console.log("\n--- F2: Student Academic Progress & Dashboard ---");

  await suite.test("T1.2.1: student.dashboard returns student profile, GPA, and stats", async () => {
    const dash = await studentSession.client.student.dashboard.query();
    assert(dash !== null, "Student dashboard should return non-null");
    assert(dash.student !== null, "Student object should be present");
    assert(typeof dash.stats?.gpa === "string" || typeof dash.stats?.gpa === "number", "GPA should be present");
    assert(Array.isArray(dash.courses), "Courses should be an array");
  });

  await suite.test("T1.2.2: student.myCourses returns enrolled courses list", async () => {
    const courses = await studentSession.client.student.myCourses.query();
    assert(Array.isArray(courses), "myCourses should return an array");
    assert(courses.length > 0, "Student should have courses");
    assert(courses[0].courseId !== undefined, "Course items should have courseId");
  });

  await suite.test("T1.2.3: student.todaySchedule returns timetable with lecture slots", async () => {
    const schedule = await studentSession.client.student.todaySchedule.query();
    assert(Array.isArray(schedule), "todaySchedule should return an array");
  });

  await suite.test("T1.2.4: student.attendance returns attendance logs", async () => {
    const att = await studentSession.client.student.attendance.query();
    assert(Array.isArray(att), "attendance should return an array of records");
    assert(att.length > 0, "attendance should have attendance records");
  });

  await suite.test("T1.2.5: student.assignments returns assignments list", async () => {
    const assignments = await studentSession.client.student.assignments.query();
    assert(Array.isArray(assignments), "assignments should return an array");
  });

  await suite.test("T1.2.6: student.overview returns degree progress metrics", async () => {
    const overview = await studentSession.client.student.overview.query();
    assert(overview !== null, "overview should return metrics");
    assert(Array.isArray(overview.gpaHistory), "overview should have gpaHistory");
    assert(Array.isArray(overview.achievements), "overview should have achievements");
  });

  // -------------------------------------------------------------------------
  // F3: Course Enrollment & Prerequisite Check
  // -------------------------------------------------------------------------
  console.log("\n--- F3: Course Enrollment & Prerequisite Check ---");

  await suite.test("T1.3.1: courses.list queries university course catalog", async () => {
    const catalog = await studentSession.client.courses.list.query();
    assert(catalog !== null, "Course catalog should return result");
    assert(Array.isArray(catalog.data), "Catalog data should be an array");
    assert(catalog.data.length > 0, "Catalog should have courses");
  });

  await suite.test("T1.3.2: courses.getById retrieves course details and credits", async () => {
    const course = await studentSession.client.courses.getById.query(33);
    assert(course !== null, "Course 33 should exist");
    assert(course.code === "CS101", "Course code should be CS101");
    assert(course.credits > 0, "Course credits should be positive");
  });

  await suite.test("T1.3.3: courses.getPrerequisites retrieves prerequisite list for course", async () => {
    const prereqs = await studentSession.client.courses.getPrerequisites.query(37);
    assert(Array.isArray(prereqs), "Prerequisites should be an array");
    assert(prereqs.length > 0, "Course 37 should have prerequisites");
    assert(prereqs.some((p) => p.id === 33), "Course 37 should depend on Course 33");
  });

  await suite.test("T1.3.4: courses.getAllPrerequisites retrieves system prerequisite catalog", async () => {
    const allPrereqs = await studentSession.client.courses.getAllPrerequisites.query();
    assert(Array.isArray(allPrereqs), "getAllPrerequisites should return array");
    assert(allPrereqs.length >= 10, "Should have at least 10 prerequisite relationships");
  });

  await suite.test("T1.3.5: courses.getRecommendations returns academic course recommendations", async () => {
    const recs = await studentSession.client.courses.getRecommendations.query();
    assert(Array.isArray(recs), "getRecommendations should return array");
  });

  // -------------------------------------------------------------------------
  // F4: Advisor Roster & Alerts Workflow
  // -------------------------------------------------------------------------
  console.log("\n--- F4: Advisor Roster & Alerts Workflow ---");

  let sampleAdviseeId = null;

  await suite.test("T1.4.1: advisor.getAssignedStudents lists advisees for logged-in advisor", async () => {
    const advisees = await advisorSession.client.advisor.getAssignedStudents.query();
    assert(Array.isArray(advisees), "advisees should be an array");
    assert(advisees.length > 0, "Advisor should have assigned students");
    sampleAdviseeId = advisees[0].id;
    assert(sampleAdviseeId > 0, "Advisee should have valid ID");
  });

  await suite.test("T1.4.2: advisor.getStudentProfile retrieves detailed advisee record", async () => {
    assert(sampleAdviseeId !== null, "Need sampleAdviseeId from previous test");
    const profile = await advisorSession.client.advisor.getStudentProfile.query({
      studentId: sampleAdviseeId,
    });
    assert(profile !== null, "Student profile should not be null");
    assert(profile.student !== null, "Student object should be in profile");
    assertEqual(profile.student.id, sampleAdviseeId, "Profile student ID should match queried advisee");
  });

  await suite.test("T1.4.3: advisor.getInsights returns advisor aggregate statistics", async () => {
    const insights = await advisorSession.client.advisor.getInsights.query();
    assert(insights !== null, "Insights should not be null");
    assert(typeof insights.totalStudents === "number", "totalStudents should be number");
    assert(insights.totalStudents > 0, "totalStudents should be > 0");
  });

  await suite.test("T1.4.4: advisor.createAlert creates alert and cleans up with zero drift", async () => {
    assert(sampleAdviseeId !== null, "Need sampleAdviseeId");
    const uniqueTitle = `E2E-Tier1-Alert-${Date.now()}`;
    const createRes = await advisorSession.client.advisor.createAlert.mutate({
      studentId: sampleAdviseeId,
      title: uniqueTitle,
      message: "Test academic alert message for Tier 1",
      severity: "medium",
      type: "attendance",
    });
    assert(createRes.success === true, "Alert creation should succeed");

    const alerts = await advisorSession.client.advisor.getAlerts.query({
      studentId: sampleAdviseeId,
    });
    const created = alerts.find((a) => a.title === uniqueTitle);
    assert(created !== undefined, "Created alert should be found in advisor alerts");

    // Clean up
    await advisorSession.client.advisor.deleteAlert.mutate(created.id);
    const alertsAfter = await advisorSession.client.advisor.getAlerts.query({
      studentId: sampleAdviseeId,
    });
    assert(!alertsAfter.some((a) => a.id === created.id), "Alert should be deleted");
  });

  await suite.test("T1.4.5: advisor.addNote adds advisor note and cleans up with zero drift", async () => {
    assert(sampleAdviseeId !== null, "Need sampleAdviseeId");
    const uniqueTitle = `E2E-Tier1-Note-${Date.now()}`;
    const noteRes = await advisorSession.client.advisor.addNote.mutate({
      studentId: sampleAdviseeId,
      title: uniqueTitle,
      content: "Automated test note content for Tier 1",
      category: "academic",
      isPrivate: false,
    });
    assert(noteRes.success === true, "Add note should succeed");

    const notes = await advisorSession.client.advisor.getNotes.query({
      studentId: sampleAdviseeId,
    });
    const created = notes.find((n) => n.title === uniqueTitle);
    assert(created !== undefined, "Created note should be found");

    // Clean up
    await advisorSession.client.advisor.deleteNote.mutate(created.id);
    const notesAfter = await advisorSession.client.advisor.getNotes.query({
      studentId: sampleAdviseeId,
    });
    assert(!notesAfter.some((n) => n.id === created.id), "Note should be deleted");
  });

  await suite.test("T1.4.6: advisor.getAppointments retrieves scheduled advising sessions", async () => {
    const appts = await advisorSession.client.advisor.getAppointments.query({});
    assert(Array.isArray(appts), "Appointments should be an array");
  });

  // -------------------------------------------------------------------------
  // F5: Admin User & Advisor Assignment
  // -------------------------------------------------------------------------
  console.log("\n--- F5: Admin User & Advisor Assignment ---");

  await suite.test("T1.5.1: admin.dashboard returns user metrics and system health indicators", async () => {
    const dash = await adminSession.client.admin.dashboard.query();
    assert(dash !== null, "Admin dashboard should return data");
    assert(dash.stats !== null, "Dashboard stats should exist");
    assert(dash.stats.totalUsers > 0, "totalUsers should be > 0");
    assert(dash.stats.totalStudents > 0, "totalStudents should be > 0");
    assert(dash.stats.totalAdvisors > 0, "totalAdvisors should be > 0");
  });

  await suite.test("T1.5.2: admin.getAdvisorsWithStudents returns advisor roster with advisee counts", async () => {
    const advisors = await adminSession.client.admin.getAdvisorsWithStudents.query();
    assert(Array.isArray(advisors), "Advisors should be an array");
    assert(advisors.length > 0, "Should have at least 1 advisor");
    assert(Array.isArray(advisors[0].students), "Advisor students should be an array");
  });

  await suite.test("T1.5.3: admin.getUnassignedStudents queries students needing advisor pairing", async () => {
    const unassigned = await adminSession.client.admin.getUnassignedStudents.query();
    assert(Array.isArray(unassigned), "Unassigned students should be an array");
  });

  await suite.test("T1.5.4: admin.updateUser updates user name and restores with zero drift", async () => {
    const dash = await adminSession.client.admin.dashboard.query();
    const targetUser = dash.users.find((u) => u.email === SEEDED_ACCOUNTS.student.email);
    assert(targetUser !== undefined, "Student should exist in dashboard");
    const originalName = targetUser.name;

    // Update name
    const tempName = `${originalName} [E2E-Test]`;
    await adminSession.client.admin.updateUser.mutate({
      id: targetUser.id,
      name: tempName,
    });

    const updatedDash = await adminSession.client.admin.dashboard.query();
    const updatedUser = updatedDash.users.find((u) => u.id === targetUser.id);
    assertEqual(updatedUser.name, tempName, "Name should be updated");

    // Restore original name
    await adminSession.client.admin.updateUser.mutate({
      id: targetUser.id,
      name: originalName,
    });

    const restoredDash = await adminSession.client.admin.dashboard.query();
    const restoredUser = restoredDash.users.find((u) => u.id === targetUser.id);
    assertEqual(restoredUser.name, originalName, "Name should be restored");
  });

  await suite.test("T1.5.5: announcements.create creates announcement and deletes with zero drift", async () => {
    const uniqueTitle = `E2E-Tier1-Announce-${Date.now()}`;
    const createRes = await adminSession.client.announcements.create.mutate({
      title: uniqueTitle,
      titleAr: uniqueTitle,
      content: "Automated test announcement body",
      contentAr: "محتوى إعلان تجريبي",
      priority: "medium",
      targetRole: "all",
      isActive: true,
    });
    assert(createRes.success === true, "Announcement create should succeed");

    const list = await adminSession.client.announcements.list.query();
    const created = list.find((a) => a.title === uniqueTitle);
    assert(created !== undefined, "Created announcement should be found in list");

    // Clean up
    await adminSession.client.announcements.delete.mutate(created.id);
    const listAfter = await adminSession.client.announcements.list.query();
    assert(!listAfter.some((a) => a.id === created.id), "Announcement should be deleted");
  });

  // -------------------------------------------------------------------------
  // F6: Campus Navigation & Room Finder
  // -------------------------------------------------------------------------
  console.log("\n--- F6: Campus Navigation & Room Finder ---");

  let campusData = null;

  await suite.test("T1.6.1: navigation.campus returns buildings with geographic coordinates", async () => {
    campusData = await studentSession.client.navigation.campus.query();
    assert(campusData !== null, "Campus query should return data");
    assert(Array.isArray(campusData.buildings), "Buildings should be an array");
    assert(campusData.buildings.length > 0, "Campus should have buildings");
    const b0 = campusData.buildings[0];
    assert(typeof b0.lat === "number" && !isNaN(b0.lat), "Building lat should be valid number");
    assert(typeof b0.lng === "number" && !isNaN(b0.lng), "Building lng should be valid number");
  });

  await suite.test("T1.6.2: navigation.campus returns room directory across campus buildings", async () => {
    assert(campusData !== null, "Need campusData");
    assert(Array.isArray(campusData.rooms), "Rooms should be an array");
    assert(campusData.rooms.length > 0, "Campus should have rooms");
    const r0 = campusData.rooms[0];
    assert(Boolean(r0.roomNumber), "Room should have roomNumber");
    assert(r0.buildingId !== undefined, "Room should have buildingId");
  });

  await suite.test("T1.6.3: Locate IT Faculty building and verify capacity and floor metadata", async () => {
    assert(campusData !== null, "Need campusData");
    const itBuilding = campusData.buildings.find(
      (b) => (b.name && b.name.includes("IT")) || (b.nameAr && b.nameAr.includes("تكنولوجيا"))
    );
    assert(itBuilding !== undefined, "IT Faculty building should exist on campus");
    assert(itBuilding.capacity > 0, "IT building should have aggregated capacity");
    assert(itBuilding.floor >= 0, "IT building floor count should be non-negative");
  });

  await suite.test("T1.6.4: Filter classroom rooms by type and verify floor assignment", async () => {
    assert(campusData !== null, "Need campusData");
    const classrooms = campusData.rooms.filter((r) => r.type === "classroom" || r.type === "lab");
    assert(classrooms.length > 0, "Should have classroom or lab rooms");
    assert(typeof classrooms[0].floor === "number", "Room floor should be a number");
  });

  await suite.test("T1.6.5: Verify room coordinates associate with parent building", async () => {
    assert(campusData !== null, "Need campusData");
    const room = campusData.rooms[0];
    const parent = campusData.buildings.find((b) => b.id === room.buildingId);
    assert(parent !== undefined, "Room's parent building should be in buildings list");
  });

  // -------------------------------------------------------------------------
  // F7: AI Chat Graceful Mock & Local Fallback
  // -------------------------------------------------------------------------
  console.log("\n--- F7: AI Chat Graceful Mock & Local Fallback ---");

  let testConversationId = null;

  await suite.test("T1.7.1: aiChat.getStatus returns AI status with local_mock_fallback mode", async () => {
    const status = await studentSession.client.aiChat.getStatus.query();
    assert(status !== null, "AI status should return object");
    assert(typeof status.isOnline === "boolean", "isOnline should be boolean");
    assert(
      status.mode === "local_mock_fallback" || status.mode === "external_model" || status.mode === "local_ollama",
      `mode should be valid, got: ${status.mode}`
    );
  });

  await suite.test("T1.7.2: aiChat.createConversation creates student chat session", async () => {
    const createRes = await studentSession.client.aiChat.createConversation.mutate({
      title: "Tier 1 AI Fallback Test Session",
    });
    assert(createRes.success === true, "createConversation should succeed");
    assert(typeof createRes.conversationId === "number", "conversationId should be number");
    testConversationId = createRes.conversationId;
  });

  await suite.test("T1.7.3: aiChat.sendMessage answers FAQ query with local fallback answer", async () => {
    assert(testConversationId !== null, "Need testConversationId");
    const res = await studentSession.client.aiChat.sendMessage.mutate({
      conversationId: testConversationId,
      message: "متى تبدأ فترة السحب والإضافة؟",
    });
    assert(res.success === true, "sendMessage should succeed");
    assert(typeof res.response === "string" && res.response.length > 0, "Response should be non-empty string");
    assert(
      res.isOfflineFallback === true || res.source === "faq" || res.source === "external_llm",
      "Should be offline fallback or FAQ source or external_llm"
    );
  });

  await suite.test("T1.7.4: aiChat.sendMessage answers academic rules query with regulation text", async () => {
    assert(testConversationId !== null, "Need testConversationId");
    const res = await studentSession.client.aiChat.sendMessage.mutate({
      conversationId: testConversationId,
      message: "كم معدل الإنذار الأكاديمي وشروط التخرج؟",
    });
    assert(res.success === true, "sendMessage should succeed");
    assert(typeof res.response === "string" && res.response.length > 0, "Response should be non-empty string");
  });

  await suite.test("T1.7.5: aiChat.getMessages retrieves stored message thread", async () => {
    assert(testConversationId !== null, "Need testConversationId");
    const messages = await studentSession.client.aiChat.getMessages.query(testConversationId);
    assert(Array.isArray(messages), "getMessages should return array");
    assert(messages.length >= 4, "Should have at least 2 user messages and 2 assistant responses");
  });

  await suite.test("T1.7.6: aiChat.deleteConversation cleans up conversation with zero DB drift", async () => {
    assert(testConversationId !== null, "Need testConversationId");
    const delRes = await studentSession.client.aiChat.deleteConversation.mutate(testConversationId);
    assert(delRes.success === true, "deleteConversation should succeed");
    const convs = await studentSession.client.aiChat.getConversations.query();
    assert(!convs.some((c) => c.id === testConversationId), "Conversation should be deleted");
    testConversationId = null;
  });

  // Teardown any remaining sessions
  await adminSession.logout();
  await advisorSession.logout();
  await studentSession.logout();

  const summary = suite.summary();
  console.log(`\nTier 1 Summary: ${summary.passed} Passed, ${summary.failed} Failed out of ${summary.total} tests.`);
  return summary;
}

if (process.argv[1]?.endsWith("tier1-features.mjs")) {
  runTier1Suite()
    .then((summary) => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("Fatal Tier 1 error:", err);
      process.exit(1);
    });
}
