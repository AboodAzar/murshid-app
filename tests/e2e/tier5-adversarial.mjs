import "dotenv/config";
import {
  createTestSession,
  SEEDED_ACCOUNTS,
  assert,
  assertEqual,
  assertThrows,
  TestSuite,
  withDbConnection,
  cleanupTestRecords,
} from "./test-client.mjs";
import { SignJWT } from "jose";

/**
 * Tier 5: Adversarial Coverage Hardening & Router Audit Test Suite
 *
 * Exercises:
 * 1. TRPCError Code Preservation & Bug Reproduction (aiChat, documents, preferences)
 * 2. Extreme Boundary & Corner Probing (pagination offsets, invalid limits, schema constraints)
 * 3. Course Enrollment Prerequisite & Concurrency Boundaries
 * 4. RBAC & Multi-Tenant Scoping Boundaries
 * 5. Authentication Token Fuzzing & High Concurrency Burst
 */

const MONITORED_TABLES = [
  "users",
  "departments",
  "courses",
  "coursePrerequisites",
  "studyPlans",
  "studentCourses",
  "aiConversations",
  "chatMessages",
  "faqs",
  "documents",
  "buildings",
  "rooms",
  "announcements",
  "academicAlerts",
  "advisorNotes",
  "appointments",
];

async function captureDbSnapshot() {
  return await withDbConnection(async (conn) => {
    const counts = {};
    for (const table of MONITORED_TABLES) {
      const [rows] = await conn.query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = Number(rows[0].count);
    }
    return counts;
  });
}

function verifyDbInvariance(before, after) {
  let hasDrift = false;
  const driftDetails = [];
  for (const table of MONITORED_TABLES) {
    const delta = (after[table] ?? 0) - (before[table] ?? 0);
    if (delta !== 0) {
      hasDrift = true;
      driftDetails.push(`Table ${table}: before=${before[table]}, after=${after[table]}, delta=${delta}`);
    }
  }
  return { hasDrift, driftDetails };
}

/**
 * Precise tRPC error code assertion helper
 */
async function assertTRPCErrorCode(fn, expectedCode) {
  try {
    const res = await fn();
    throw new Error(
      `Expected rejection with error code "${expectedCode}", but call SUCCEEDED with result: ${JSON.stringify(res)}`
    );
  } catch (err) {
    if (err.message && err.message.startsWith("Expected rejection with error code")) {
      throw err;
    }
    const actualCode = err.data?.code || err.shape?.code || err.message;
    if (actualCode !== expectedCode) {
      throw new Error(
        `Expected tRPC error code "${expectedCode}", but received "${actualCode}" (HTTP ${err.data?.httpStatus ?? "unknown"}, message: "${err.message}")`
      );
    }
    return err;
  }
}

export async function runTier5Tests() {
  const suite = new TestSuite("Tier 5: Adversarial Coverage Hardening & Router Audit");
  console.log("\n" + "=".repeat(60));
  console.log("  RUNNING TIER 5: ADVERSARIAL COVERAGE HARDENING (29 TESTS)");
  console.log("=".repeat(60));

  await cleanupTestRecords();
  const snapshotBefore = await captureDbSnapshot();

  // Test sessions
  const adminSession = createTestSession();
  const advisor1Session = createTestSession(); // Dr. Ahmad Khalil (advisorId: 210024)
  const advisor2Session = createTestSession(); // Dr. Sara Mahmoud (advisorId: 210025)
  const studentKhaledSession = createTestSession(); // Khaled Haddad (id: 210027, advisor: 210024)
  const studentLinaSession = createTestSession(); // Lina Omar (id: 210028, advisor: 210025)

  // Initialize sessions
  await adminSession.login(SEEDED_ACCOUNTS.admin.email, SEEDED_ACCOUNTS.admin.password);
  await advisor1Session.login(SEEDED_ACCOUNTS.advisor.email, SEEDED_ACCOUNTS.advisor.password);
  await advisor2Session.login("s.mahmoud@zuj.edu.jo", "password123");
  await studentKhaledSession.login(SEEDED_ACCOUNTS.student.email, SEEDED_ACCOUNTS.student.password);
  await studentLinaSession.login(SEEDED_ACCOUNTS.studentLina.email, SEEDED_ACCOUNTS.studentLina.password);

  try {
    // =========================================================================
    // Category 1: TRPCError Code Preservation & Router Audit Gaps
    // =========================================================================
    console.log("\n--- Category 1: TRPCError Code Preservation & Bug Verification ---");

    await suite.test(
      "T5.1.1: aiChat.getMessages with non-existent conversation returns NOT_FOUND (not INTERNAL_SERVER_ERROR)",
      async () => {
        await assertTRPCErrorCode(
          () => studentKhaledSession.client.aiChat.getMessages.query(999999),
          "NOT_FOUND"
        );
      }
    );

    await suite.test(
      "T5.1.2: aiChat.rateMessage with non-existent message returns NOT_FOUND (not INTERNAL_SERVER_ERROR)",
      async () => {
        await assertTRPCErrorCode(
          () =>
            studentKhaledSession.client.aiChat.rateMessage.mutate({
              messageId: 999999,
              feedback: "up",
            }),
          "NOT_FOUND"
        );
      }
    );

    await suite.test(
      "T5.1.3: aiChat.deleteConversation with non-existent conversation returns NOT_FOUND (not INTERNAL_SERVER_ERROR)",
      async () => {
        await assertTRPCErrorCode(
          () => studentKhaledSession.client.aiChat.deleteConversation.mutate(999999),
          "NOT_FOUND"
        );
      }
    );

    await suite.test(
      "T5.1.4: aiChat.sendMessage with non-existent conversation must reject with NOT_FOUND (not swallow error)",
      async () => {
        await assertTRPCErrorCode(
          () =>
            studentKhaledSession.client.aiChat.sendMessage.mutate({
              conversationId: 999999,
              message: "Test message to non-existent conversation",
            }),
          "NOT_FOUND"
        );
      }
    );

    await suite.test(
      "T5.1.5: aiChat.rateMessage IDOR check: student cannot rate messages in another student's conversation",
      async () => {
        // Message ID 1 belongs to conversation 1 (studentId: 1, not Khaled 210027)
        await assertTRPCErrorCode(
          () =>
            studentKhaledSession.client.aiChat.rateMessage.mutate({
              messageId: 1,
              feedback: "up",
            }),
          "NOT_FOUND"
        );
      }
    );

    await suite.test(
      "T5.1.6: documents.delete with non-existent ID throws NOT_FOUND or FORBIDDEN (not INTERNAL_SERVER_ERROR)",
      async () => {
        await assertTRPCErrorCode(
          () => advisor1Session.client.documents.delete.mutate(999999),
          "NOT_FOUND"
        );
      }
    );

    await suite.test(
      "T5.1.7: documents.retryDocumentIndexing with non-existent ID throws NOT_FOUND (not INTERNAL_SERVER_ERROR)",
      async () => {
        await assertTRPCErrorCode(
          () => advisor1Session.client.documents.retryDocumentIndexing.mutate(999999),
          "NOT_FOUND"
        );
      }
    );

    // =========================================================================
    // Category 2: Boundary Value Analysis & Schema Guards
    // =========================================================================
    console.log("\n--- Category 2: Boundary Value Analysis & Schema Guards ---");

    await suite.test("T5.2.1: courses.list with page: 0 rejected by Zod with BAD_REQUEST", async () => {
      await assertTRPCErrorCode(
        () => studentKhaledSession.client.courses.list.query({ page: 0 }),
        "BAD_REQUEST"
      );
    });

    await suite.test("T5.2.2: courses.list with page: -1 rejected by Zod with BAD_REQUEST", async () => {
      await assertTRPCErrorCode(
        () => studentKhaledSession.client.courses.list.query({ page: -1 }),
        "BAD_REQUEST"
      );
    });

    await suite.test("T5.2.3: courses.list with limit: 0 rejected by Zod with BAD_REQUEST", async () => {
      await assertTRPCErrorCode(
        () => studentKhaledSession.client.courses.list.query({ limit: 0 }),
        "BAD_REQUEST"
      );
    });

    await suite.test("T5.2.4: courses.list with limit: 500 (> 100 max) rejected by Zod with BAD_REQUEST", async () => {
      await assertTRPCErrorCode(
        () => studentKhaledSession.client.courses.list.query({ limit: 500 }),
        "BAD_REQUEST"
      );
    });

    await suite.test("T5.2.5: faqs.list with page: 0 rejected by Zod with BAD_REQUEST", async () => {
      await assertTRPCErrorCode(
        () => studentKhaledSession.client.faqs.list.query({ page: 0 }),
        "BAD_REQUEST"
      );
    });

    await suite.test("T5.2.6: announcements.create with 50KB payload handled safely", async () => {
      const largeContent = "E2E-LargeContent-" + "X".repeat(50000);
      const res = await adminSession.client.announcements.create.mutate({
        title: "E2E-StressTestAnnouncement",
        titleAr: "إعلان اختبار ضغط",
        content: largeContent,
        contentAr: "محتوى كبير",
        priority: "low",
        targetRole: "all",
        isActive: true,
      });
      assert(res.success === true, "Announcement creation with large content should succeed");

      // Verify and cleanup
      const list = await adminSession.client.announcements.list.query();
      const created = list.find((a) => a.title === "E2E-StressTestAnnouncement");
      assert(!!created, "Created announcement should be found");
      await adminSession.client.announcements.delete.mutate(created.id);
    });

    await suite.test("T5.2.7: advisor.scheduleAppointment with durationMinutes: 1 (< 5 min) rejected", async () => {
      await assertTRPCErrorCode(
        () =>
          advisor1Session.client.advisor.scheduleAppointment.mutate({
            studentId: 210027,
            title: "E2E-TooShort",
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 1,
          }),
        "BAD_REQUEST"
      );
    });

    await suite.test("T5.2.8: advisor.scheduleAppointment with durationMinutes: 500 (> 240 max) rejected", async () => {
      await assertTRPCErrorCode(
        () =>
          advisor1Session.client.advisor.scheduleAppointment.mutate({
            studentId: 210027,
            title: "E2E-TooLong",
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 500,
          }),
        "BAD_REQUEST"
      );
    });

    // =========================================================================
    // Category 3: Course Enrollment Prerequisite & Concurrency Boundaries
    // =========================================================================
    console.log("\n--- Category 3: Course Enrollment Prerequisite & Concurrency Boundaries ---");

    await suite.test("T5.3.1: courses.enrollCourse with missing intermediate prerequisite rejected", async () => {
      // Student Lina Omar attempts to enroll in CS304 (Course 53) which requires CS301
      await assertThrows(
        () => studentLinaSession.client.courses.enrollCourse.mutate({ courseId: 53 }),
        "Missing prerequisite course(s): CS301"
      );
    });

    await suite.test("T5.3.2: courses.enrollCourse for already completed course rejected with BAD_REQUEST", async () => {
      // Lina Omar completed CS101 (Course 33)
      await assertThrows(
        () => studentLinaSession.client.courses.enrollCourse.mutate({ courseId: 33 }),
        "Course has already been completed"
      );
    });

    await suite.test("T5.3.3: courses.enrollCourse for already in-progress course rejected with BAD_REQUEST", async () => {
      // Lina Omar is in-progress in CS102 (Course 37)
      await assertThrows(
        () => studentLinaSession.client.courses.enrollCourse.mutate({ courseId: 37 }),
        "Already enrolled in this course"
      );
    });

    await suite.test("T5.3.4: courses.enrollCourse for non-existent course ID (999999) rejected with NOT_FOUND", async () => {
      await assertTRPCErrorCode(
        () => studentLinaSession.client.courses.enrollCourse.mutate({ courseId: 999999 }),
        "NOT_FOUND"
      );
    });

    await suite.test("T5.3.5: courses.enrollCourse sequential double-enrollment idempotency", async () => {
      // Course 58 (CS402) has no prerequisites and Khaled is not enrolled
      try {
        const first = await studentKhaledSession.client.courses.enrollCourse.mutate({ courseId: 58 });
        assert(first.success === true, "First enrollment should succeed");

        // Immediate second enrollment must be rejected
        await assertThrows(
          () => studentKhaledSession.client.courses.enrollCourse.mutate({ courseId: 58 }),
          "Already enrolled in this course"
        );
      } finally {
        await withDbConnection(async (conn) => {
          await conn.query("DELETE FROM studentCourses WHERE studentId = 210027 AND courseId = 58");
        });
      }
    });

    // =========================================================================
    // Category 4: RBAC & Tenant Scoping Boundaries
    // =========================================================================
    console.log("\n--- Category 4: RBAC & Tenant Scoping Boundaries ---");

    await suite.test("T5.4.1: Student accessing advisor route (advisor.getAssignedStudents) rejected with FORBIDDEN", async () => {
      await assertTRPCErrorCode(
        () => studentKhaledSession.client.advisor.getAssignedStudents.query(),
        "FORBIDDEN"
      );
    });

    await suite.test("T5.4.2: Student accessing admin route (admin.dashboard) rejected with FORBIDDEN", async () => {
      await assertTRPCErrorCode(
        () => studentKhaledSession.client.admin.dashboard.query(),
        "FORBIDDEN"
      );
    });

    await suite.test("T5.4.3: Advisor accessing admin route (admin.assignAdvisor) rejected with FORBIDDEN", async () => {
      await assertTRPCErrorCode(
        () =>
          advisor1Session.client.admin.assignAdvisor.mutate({
            studentId: 210027,
            advisorId: 210024,
          }),
        "FORBIDDEN"
      );
    });

    await suite.test("T5.4.4: Advisor 1 cannot create academic alert for Advisor 2's student (Lina 210028)", async () => {
      await assertThrows(
        () =>
          advisor1Session.client.advisor.createAlert.mutate({
            studentId: 210028,
            title: "E2E-UnauthorizedAlert",
            message: "Should be blocked",
            severity: "high",
            type: "at_risk",
          }),
        "Not authorized for this student"
      );
    });

    await suite.test("T5.4.5: Advisor 1 cannot add note for Advisor 2's student (Lina 210028)", async () => {
      await assertThrows(
        () =>
          advisor1Session.client.advisor.addNote.mutate({
            studentId: 210028,
            title: "E2E-UnauthorizedNote",
            content: "Should be blocked",
          }),
        "Not authorized for this student"
      );
    });

    await suite.test("T5.4.6: Advisor 1 cannot schedule appointment for Advisor 2's student (Lina 210028)", async () => {
      await assertThrows(
        () =>
          advisor1Session.client.advisor.scheduleAppointment.mutate({
            studentId: 210028,
            title: "E2E-UnauthorizedAppointment",
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 30,
          }),
        "Not authorized for this student"
      );
    });

    await suite.test("T5.4.7: Advisor resolving non-existent alert ID rejected with NOT_FOUND", async () => {
      await assertTRPCErrorCode(
        () => advisor1Session.client.advisor.resolveAlert.mutate({ alertId: 999999 }),
        "NOT_FOUND"
      );
    });

    await suite.test("T5.4.8: Admin self-deletion rejected with BAD_REQUEST", async () => {
      await assertThrows(
        () => adminSession.client.admin.deleteUser.mutate({ id: 1, requesterId: 1 }),
        "You cannot delete your own account"
      );
    });

    await suite.test("T5.4.9: Admin assigning non-existent advisor ID rejected with NOT_FOUND", async () => {
      await assertTRPCErrorCode(
        () =>
          adminSession.client.admin.assignAdvisor.mutate({
            studentId: 210027,
            advisorId: 999999,
          }),
        "NOT_FOUND"
      );
    });

    // =========================================================================
    // Category 5: Authentication Token Security & Concurrency Burst
    // =========================================================================
    console.log("\n--- Category 5: Authentication Token Security & Concurrency Burst ---");

    await suite.test("T5.5.1: Session cookie with tampered JWT signature rejected with UNAUTHORIZED", async () => {
      const hackedSession = createTestSession();
      // Generate a valid JWT but with a rogue secret key
      const rogueKey = new TextEncoder().encode("wrong-secret-key-that-does-not-match-murshid");
      const rogueToken = await new SignJWT({
        userId: 210027,
        email: "khaled.haddad@zuj.edu.jo",
        name: "Khaled Haddad",
        role: "student",
        type: "local-auth",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(rogueKey);

      hackedSession.setCookie(`app_session_id=${rogueToken}`);
      await assertTRPCErrorCode(
        () => hackedSession.client.student.dashboard.query(),
        "UNAUTHORIZED"
      );
    });

    await suite.test("T5.5.2: Session cookie with invalid payload type rejected with UNAUTHORIZED", async () => {
      const hackedSession = createTestSession();
      const jwtSecret = process.env.JWT_SECRET || "development-only-jwt-secret-change-me";
      const validKey = new TextEncoder().encode(jwtSecret);
      const rogueToken = await new SignJWT({
        userId: 210027,
        email: "khaled.haddad@zuj.edu.jo",
        name: "Khaled Haddad",
        role: "student",
        type: "forged-type-not-local-auth",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(validKey);

      hackedSession.setCookie(`app_session_id=${rogueToken}`);
      await assertTRPCErrorCode(
        () => hackedSession.client.student.dashboard.query(),
        "UNAUTHORIZED"
      );
    });

    await suite.test("T5.5.3: Session cookie with non-existent userId: 999999 rejected with UNAUTHORIZED", async () => {
      const hackedSession = createTestSession();
      const jwtSecret = process.env.JWT_SECRET || "development-only-jwt-secret-change-me";
      const validKey = new TextEncoder().encode(jwtSecret);
      const ghostToken = await new SignJWT({
        userId: 999999,
        email: "ghost@zuj.edu.jo",
        name: "Ghost User",
        role: "student",
        type: "local-auth",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(validKey);

      hackedSession.setCookie(`app_session_id=${ghostToken}`);
      await assertTRPCErrorCode(
        () => hackedSession.client.student.dashboard.query(),
        "UNAUTHORIZED"
      );
    });

    await suite.test("T5.5.4: SQL injection payload in login email rejected cleanly with UNAUTHORIZED", async () => {
      const unauthedSession = createTestSession();
      await assertThrows(
        () => unauthedSession.login("admin' OR '1'='1", "password123"),
        ""
      );
    });

    await suite.test("T5.5.5: High concurrency burst (30 simultaneous requests across 5 endpoints)", async () => {
      const burstStart = Date.now();
      const calls = [];
      for (let i = 0; i < 6; i++) {
        calls.push(studentKhaledSession.client.student.dashboard.query());
        calls.push(advisor1Session.client.advisor.getInsights.query());
        calls.push(adminSession.client.admin.dashboard.query());
        calls.push(studentKhaledSession.client.courses.list.query({ page: 1, limit: 10 }));
        calls.push(studentKhaledSession.client.aiChat.getStatus.query());
      }
      const results = await Promise.allSettled(calls);
      const duration = Date.now() - burstStart;
      const failed = results.filter((r) => r.status === "rejected");
      assert(
        failed.length === 0,
        `All 30 concurrent requests must resolve cleanly, but ${failed.length} failed.`
      );
      assert(
        duration < 4000,
        `Burst execution took ${duration}ms, expected < 4000ms.`
      );
    });
  } finally {
    // Teardown sessions
    await adminSession.logout();
    await advisor1Session.logout();
    await advisor2Session.logout();
    await studentKhaledSession.logout();
    await studentLinaSession.logout();

    // Teardown dangling rows
    await cleanupTestRecords();
  }

  // Database drift audit
  const snapshotAfter = await captureDbSnapshot();
  const { hasDrift, driftDetails } = verifyDbInvariance(snapshotBefore, snapshotAfter);

  const summary = suite.summary();
  console.log("\n" + "=".repeat(60));
  console.log("  TIER 5 EXECUTION SUMMARY");
  console.log("=".repeat(60));
  console.log(`  * Total Tests Run : ${summary.total}`);
  console.log(`  * Passed Tests   : ${summary.passed}`);
  console.log(`  * Failed Tests   : ${summary.failed}`);
  console.log(`  * DB State Drift : ${hasDrift ? "FAILED (" + driftDetails.join(", ") + ")" : "0 (ZERO DRIFT)"}`);
  console.log("=".repeat(60));

  if (summary.failed > 0) {
    console.log("\nConfirmed Bug Findings & Failing Assertions:");
    for (const res of summary.results.filter((r) => r.status === "FAIL")) {
      console.log(`  - [FAIL] ${res.name}: ${res.error}`);
    }
  }

  if (hasDrift) {
    console.error("\n[CRITICAL] Database state drift detected during Tier 5 execution:");
    for (const d of driftDetails) console.error("  - " + d);
  }

  return { summary, hasDrift };
}

// Direct execution CLI entrypoint
if (process.argv[1]?.endsWith("tier5-adversarial.mjs")) {
  runTier5Tests()
    .then(({ summary, hasDrift }) => {
      if (hasDrift) {
        process.exit(1);
      }
      // If run standalone without --allow-failures, exit with 1 if tests failed
      if (!process.argv.includes("--allow-failures") && summary.failed > 0) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal error running Tier 5:", err);
      process.exit(1);
    });
}
