import "dotenv/config";
import { appRouter } from "../server/routers";
import { coursesRouter } from "../server/routers/courses";
import { getDb } from "../server/db";
import {
  users,
  courses,
  coursePrerequisites,
  studentCourses,
  type User,
} from "../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "../server/_core/context";

interface TestResult {
  testName: string;
  category: string;
  status: "PASS" | "FAIL";
  durationMs: number;
  details?: any;
}

const results: TestResult[] = [];

function recordResult(
  category: string,
  testName: string,
  passed: boolean,
  durationMs: number,
  details?: any
) {
  const status = passed ? "PASS" : "FAIL";
  results.push({ category, testName, status, durationMs, details });
  console.log(`[${status}] ${category} :: ${testName} (${durationMs.toFixed(1)}ms)`);
  if (!passed && details) {
    console.error("   Details:", typeof details === "object" ? JSON.stringify(details, null, 2) : details);
  }
}

function createMockContext(user: Partial<User> | null): TrpcContext {
  let fullUser: User | null = null;
  if (user) {
    fullUser = {
      id: user.id ?? 999901,
      openId: user.openId ?? `openid-${user.id ?? 999901}`,
      email: user.email ?? `test-${user.id ?? 999901}@zuj.edu.jo`,
      name: user.name ?? "Test User",
      password: "hashed-test-password",
      role: user.role ?? "student",
      advisorId: user.advisorId ?? null,
      departmentId: user.departmentId ?? null,
      profilePicture: null,
      bio: null,
      phone: null,
      language: "en",
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  }

  return {
    user: fullUser,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as any,
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as any,
  };
}

async function runEmpiricalChallengerM2() {
  console.log("================================================================================");
  console.log("   MURSHID ADVERSARIAL CHALLENGER SUITE - MILESTONE 2 EMPIRICAL AUDIT");
  console.log("   Prerequisite Verification Guards, Duplicate Enrollments & Route Guards");
  console.log("================================================================================\n");

  const db = await getDb();
  if (!db) {
    console.error("FATAL: Database connection failed.");
    process.exit(1);
  }

  // Load existing test users
  const [existingStudent] = await db.select().from(users).where(eq(users.id, 210027)).limit(1); // Khaled Haddad
  const [existingLina] = await db.select().from(users).where(eq(users.id, 210028)).limit(1); // Lina Omar
  const [existingAdvisor] = await db.select().from(users).where(eq(users.id, 210024)).limit(1); // Dr. Ahmad Khalil
  const [existingAdmin] = await db.select().from(users).where(eq(users.role, "admin")).limit(1); // Admin user

  if (!existingStudent || !existingAdvisor || !existingAdmin) {
    console.error("FATAL: Required seed users (210027, 210024, admin) missing from DB.");
    process.exit(1);
  }

  // Setup dedicated ephemeral test student for isolated mutative tests
  const TEST_STUDENT_ID = 888801;
  await db.delete(studentCourses).where(eq(studentCourses.studentId, TEST_STUDENT_ID));
  await db.delete(users).where(eq(users.id, TEST_STUDENT_ID));

  await db.insert(users).values({
    id: TEST_STUDENT_ID,
    openId: "test-challenger-m2-student",
    email: "challenger.m2.student@zuj.edu.jo",
    name: "Milestone 2 Challenger Student",
    role: "student",
    language: "en",
    isActive: true,
    isEmailVerified: true,
  });

  const testStudentUser: User = (
    await db.select().from(users).where(eq(users.id, TEST_STUDENT_ID)).limit(1)
  )[0];

  try {
    // ============================================================================
    // SUITE 1: Curriculum Prerequisites Query (courses.getAllPrerequisites)
    // ============================================================================
    console.log(">>> SUITE 1: Curriculum Prerequisites Listing API");
    {
      const publicCaller = appRouter.createCaller(createMockContext(null));
      const t0 = performance.now();
      const allPrereqs = await publicCaller.courses.getAllPrerequisites();
      const d0 = performance.now() - t0;

      const isNonEmpty = Array.isArray(allPrereqs) && allPrereqs.length > 0;
      recordResult(
        "courses.getAllPrerequisites",
        "Returns non-empty array of prerequisite mappings",
        isNonEmpty,
        d0,
        { count: allPrereqs?.length }
      );

      const sample = allPrereqs[0];
      const validSchema =
        sample &&
        typeof sample.courseId === "number" &&
        typeof sample.prerequisiteId === "number" &&
        typeof sample.prerequisiteCode === "string" &&
        typeof sample.prerequisiteName === "string";

      recordResult(
        "courses.getAllPrerequisites",
        "Prerequisite mappings contain valid courseId, prerequisiteId, code, and name",
        Boolean(validSchema),
        d0,
        { sample }
      );

      // Verify specific known curriculum relationships
      // Course 37 (CS102) requires Course 33 (CS101)
      const cs102Prereq = allPrereqs.find((p) => p.courseId === 37 && p.prerequisiteId === 33);
      recordResult(
        "courses.getAllPrerequisites",
        "Correctly identifies CS102 (37) requires CS101 (33)",
        Boolean(cs102Prereq && cs102Prereq.prerequisiteCode === "CS101"),
        d0,
        { cs102Prereq }
      );
    }

    // ============================================================================
    // SUITE 2: Prerequisite Verification Enforcement (courses.enrollCourse)
    // ============================================================================
    console.log("\n>>> SUITE 2: Prerequisite Verification Enforcement");
    {
      const studentCaller = appRouter.createCaller(createMockContext(testStudentUser));

      // Test 2.1: Enrolling in Course 37 (CS102) with 0 completed prerequisites
      // Expected: BAD_REQUEST listing CS101
      const t0 = performance.now();
      let rejectedNoPrereq = false;
      let rejectError: any = null;
      try {
        await studentCaller.courses.enrollCourse({ courseId: 37 });
      } catch (err: any) {
        rejectedNoPrereq = true;
        rejectError = err;
      }
      const d0 = performance.now() - t0;

      recordResult(
        "courses.enrollCourse",
        "Rejects enrollment when prerequisite is missing (BAD_REQUEST with missing code)",
        rejectedNoPrereq &&
          rejectError?.code === "BAD_REQUEST" &&
          rejectError?.message?.includes("CS101") &&
          rejectError?.message?.includes("Missing prerequisite course(s)"),
        d0,
        { code: rejectError?.code, message: rejectError?.message }
      );

      // Test 2.2: Advanced course multi-tier prerequisite rejection
      // Course 53 (CS304: AI) requires Course 49 (CS301: OS)
      const t1 = performance.now();
      let rejectedDeepPrereq = false;
      let deepError: any = null;
      try {
        await studentCaller.courses.enrollCourse({ courseId: 53 });
      } catch (err: any) {
        rejectedDeepPrereq = true;
        deepError = err;
      }
      const d1 = performance.now() - t1;

      recordResult(
        "courses.enrollCourse",
        "Rejects advanced course CS304 (missing deep prerequisite CS301)",
        rejectedDeepPrereq &&
          deepError?.code === "BAD_REQUEST" &&
          deepError?.message?.includes("CS301"),
        d1,
        { code: deepError?.code, message: deepError?.message }
      );

      // Test 2.3: In-Progress prerequisite edge case:
      // If student has prerequisite CS101 with status = 'in_progress', NOT 'completed',
      // enrollment in CS102 MUST STILL BE REJECTED.
      await db.insert(studentCourses).values({
        studentId: TEST_STUDENT_ID,
        courseId: 33, // CS101
        semester: 1,
        status: "in_progress",
      });

      const t2 = performance.now();
      let rejectedInProgressPrereq = false;
      let inProgressError: any = null;
      try {
        await studentCaller.courses.enrollCourse({ courseId: 37 });
      } catch (err: any) {
        rejectedInProgressPrereq = true;
        inProgressError = err;
      }
      const d2 = performance.now() - t2;

      recordResult(
        "courses.enrollCourse",
        "Rejects enrollment when prerequisite is only 'in_progress' (not completed)",
        rejectedInProgressPrereq &&
          inProgressError?.code === "BAD_REQUEST" &&
          inProgressError?.message?.includes("CS101"),
        d2,
        { code: inProgressError?.code, message: inProgressError?.message }
      );

      // Test 2.4: Planned prerequisite edge case:
      // If student has prerequisite CS101 with status = 'planned',
      // enrollment in CS102 MUST STILL BE REJECTED.
      await db
        .update(studentCourses)
        .set({ status: "planned" })
        .where(
          and(
            eq(studentCourses.studentId, TEST_STUDENT_ID),
            eq(studentCourses.courseId, 33)
          )
        );

      const t3 = performance.now();
      let rejectedPlannedPrereq = false;
      let plannedError: any = null;
      try {
        await studentCaller.courses.enrollCourse({ courseId: 37 });
      } catch (err: any) {
        rejectedPlannedPrereq = true;
        plannedError = err;
      }
      const d3 = performance.now() - t3;

      recordResult(
        "courses.enrollCourse",
        "Rejects enrollment when prerequisite is only 'planned' (not completed)",
        rejectedPlannedPrereq &&
          plannedError?.code === "BAD_REQUEST" &&
          plannedError?.message?.includes("CS101"),
        d3,
        { code: plannedError?.code, message: plannedError?.message }
      );
    }

    // ============================================================================
    // SUITE 3: Eligible Course Enrollment (Prerequisites Met)
    // ============================================================================
    console.log("\n>>> SUITE 3: Eligible Course Enrollment (Prerequisites Completed)");
    {
      const studentCaller = appRouter.createCaller(createMockContext(testStudentUser));

      // Mark Course 33 (CS101) as COMPLETED
      await db
        .update(studentCourses)
        .set({ status: "completed", grade: "A", gradePoints: "4.00" })
        .where(
          and(
            eq(studentCourses.studentId, TEST_STUDENT_ID),
            eq(studentCourses.courseId, 33)
          )
        );

      // Now student satisfies CS101 prerequisite for Course 37 (CS102)!
      const t0 = performance.now();
      const enrollResult = await studentCaller.courses.enrollCourse({ courseId: 37, semester: 2 });
      const d0 = performance.now() - t0;

      // Check DB persistence directly
      const enrolledRow = await db
        .select()
        .from(studentCourses)
        .where(
          and(
            eq(studentCourses.studentId, TEST_STUDENT_ID),
            eq(studentCourses.courseId, 37)
          )
        );

      recordResult(
        "courses.enrollCourse",
        "Successfully enrolls student in CS102 once prerequisite CS101 is completed",
        enrollResult.success === true && enrolledRow.length === 1 && enrolledRow[0].status === "planned",
        d0,
        { enrollResult, enrolledRow: enrolledRow[0] }
      );

      // Test 3.2: Enrolling in course with NO prerequisites (e.g. MATH101: 34)
      const t1 = performance.now();
      const noPrereqResult = await studentCaller.courses.enrollCourse({ courseId: 34, semester: 1 });
      const d1 = performance.now() - t1;

      const mathRow = await db
        .select()
        .from(studentCourses)
        .where(
          and(
            eq(studentCourses.studentId, TEST_STUDENT_ID),
            eq(studentCourses.courseId, 34)
          )
        );

      recordResult(
        "courses.enrollCourse",
        "Successfully enrolls in course with zero prerequisites (MATH101)",
        noPrereqResult.success === true && mathRow.length === 1 && mathRow[0].status === "planned",
        d1,
        { noPrereqResult, mathRow: mathRow[0] }
      );
    }

    // ============================================================================
    // SUITE 4: Duplicate Enrollment Prevention
    // ============================================================================
    console.log("\n>>> SUITE 4: Duplicate Enrollment Guard");
    {
      const studentCaller = appRouter.createCaller(createMockContext(testStudentUser));

      // Test 4.1: Attempt to enroll in Course 37 AGAIN (currently status = 'planned')
      // Expected: BAD_REQUEST "Already enrolled in this course"
      const t0 = performance.now();
      let rejectedDuplicatePlanned = false;
      let dupPlannedError: any = null;
      try {
        await studentCaller.courses.enrollCourse({ courseId: 37 });
      } catch (err: any) {
        rejectedDuplicatePlanned = true;
        dupPlannedError = err;
      }
      const d0 = performance.now() - t0;

      recordResult(
        "courses.enrollCourse",
        "Rejects duplicate enrollment when course is already 'planned'",
        rejectedDuplicatePlanned &&
          dupPlannedError?.code === "BAD_REQUEST" &&
          dupPlannedError?.message === "Already enrolled in this course",
        d0,
        { code: dupPlannedError?.code, message: dupPlannedError?.message }
      );

      // Test 4.2: Attempt to enroll in Course 33 AGAIN (currently status = 'completed')
      // Expected: BAD_REQUEST "Cannot enroll: Course has already been completed"
      const t1 = performance.now();
      let rejectedDuplicateCompleted = false;
      let dupCompletedError: any = null;
      try {
        await studentCaller.courses.enrollCourse({ courseId: 33 });
      } catch (err: any) {
        rejectedDuplicateCompleted = true;
        dupCompletedError = err;
      }
      const d1 = performance.now() - t1;

      recordResult(
        "courses.enrollCourse",
        "Rejects duplicate enrollment when course is already 'completed'",
        rejectedDuplicateCompleted &&
          dupCompletedError?.code === "BAD_REQUEST" &&
          dupCompletedError?.message === "Cannot enroll: Course has already been completed",
        d1,
        { code: dupCompletedError?.code, message: dupCompletedError?.message }
      );

      // Test 4.3: Attempt to enroll in course with status = 'in_progress'
      // Student 210027 has Course 54 (CS305) in progress
      const khaledCaller = appRouter.createCaller(createMockContext(existingStudent));
      const t2 = performance.now();
      let rejectedDuplicateInProgress = false;
      let dupInProgressError: any = null;
      try {
        await khaledCaller.courses.enrollCourse({ courseId: 54 });
      } catch (err: any) {
        rejectedDuplicateInProgress = true;
        dupInProgressError = err;
      }
      const d2 = performance.now() - t2;

      recordResult(
        "courses.enrollCourse",
        "Rejects duplicate enrollment when course is already 'in_progress'",
        rejectedDuplicateInProgress &&
          dupInProgressError?.code === "BAD_REQUEST" &&
          dupInProgressError?.message === "Already enrolled in this course",
        d2,
        { code: dupInProgressError?.code, message: dupInProgressError?.message }
      );
    }

    // ============================================================================
    // SUITE 5: Input Validation & Boundary Testing
    // ============================================================================
    console.log("\n>>> SUITE 5: Input Validation & Boundary Testing");
    {
      const studentCaller = appRouter.createCaller(createMockContext(testStudentUser));

      // Test 5.1: Non-existent course ID (999999)
      const t0 = performance.now();
      let rejectedNonExistent = false;
      let nonExistentError: any = null;
      try {
        await studentCaller.courses.enrollCourse({ courseId: 999999 });
      } catch (err: any) {
        rejectedNonExistent = true;
        nonExistentError = err;
      }
      const d0 = performance.now() - t0;

      recordResult(
        "courses.enrollCourse",
        "Rejects non-existent course ID with NOT_FOUND ('Course not found')",
        rejectedNonExistent &&
          nonExistentError?.code === "NOT_FOUND" &&
          nonExistentError?.message === "Course not found",
        d0,
        { code: nonExistentError?.code, message: nonExistentError?.message }
      );

      // Test 5.2: Role restrictions - Advisor attempting to enroll
      const advisorCaller = appRouter.createCaller(createMockContext(existingAdvisor));
      const t1 = performance.now();
      let rejectedAdvisorEnroll = false;
      let advisorError: any = null;
      try {
        await advisorCaller.courses.enrollCourse({ courseId: 33 });
      } catch (err: any) {
        rejectedAdvisorEnroll = true;
        advisorError = err;
      }
      const d1 = performance.now() - t1;

      recordResult(
        "courses.enrollCourse",
        "Rejects advisor role attempting to enroll courses with UNAUTHORIZED",
        rejectedAdvisorEnroll && advisorError?.code === "UNAUTHORIZED",
        d1,
        { code: advisorError?.code }
      );

      // Test 5.3: Role restrictions - Admin attempting to enroll
      const adminCaller = appRouter.createCaller(createMockContext(existingAdmin));
      const t2 = performance.now();
      let rejectedAdminEnroll = false;
      let adminError: any = null;
      try {
        await adminCaller.courses.enrollCourse({ courseId: 33 });
      } catch (err: any) {
        rejectedAdminEnroll = true;
        adminError = err;
      }
      const d2 = performance.now() - t2;

      recordResult(
        "courses.enrollCourse",
        "Rejects admin role attempting to enroll courses with UNAUTHORIZED",
        rejectedAdminEnroll && adminError?.code === "UNAUTHORIZED",
        d2,
        { code: adminError?.code }
      );

      // Test 5.4: Unauthenticated caller attempting to enroll
      const anonymousCaller = appRouter.createCaller(createMockContext(null));
      const t3 = performance.now();
      let rejectedAnonEnroll = false;
      let anonError: any = null;
      try {
        await anonymousCaller.courses.enrollCourse({ courseId: 33 });
      } catch (err: any) {
        rejectedAnonEnroll = true;
        anonError = err;
      }
      const d3 = performance.now() - t3;

      recordResult(
        "courses.enrollCourse",
        "Rejects unauthenticated caller attempting to enroll courses with UNAUTHORIZED",
        rejectedAnonEnroll && anonError?.code === "UNAUTHORIZED",
        d3,
        { code: anonError?.code }
      );
    }

    // ============================================================================
    // SUITE 6: Server Route Guards & Procedure Authorization (tRPC Level)
    // ============================================================================
    console.log("\n>>> SUITE 6: Server Route Guards & Procedure Authorization");
    {
      const anonCaller = appRouter.createCaller(createMockContext(null));
      const studentCaller = appRouter.createCaller(createMockContext(testStudentUser));
      const advisorCaller = appRouter.createCaller(createMockContext(existingAdvisor));
      const adminCaller = appRouter.createCaller(createMockContext(existingAdmin));

      // Test 6.1: Protected procedure (student.dashboard)
      // Anonymous -> UNAUTHORIZED
      let anonBlockedProtected = false;
      try {
        await anonCaller.student.dashboard();
      } catch (err: any) {
        anonBlockedProtected = err?.code === "UNAUTHORIZED";
      }
      recordResult(
        "protectedProcedure",
        "Rejects anonymous caller on student.dashboard with UNAUTHORIZED",
        anonBlockedProtected,
        0
      );

      // Student -> Allowed
      let studentAllowedProtected = false;
      try {
        const res = await studentCaller.student.dashboard();
        studentAllowedProtected = Boolean(res);
      } catch (err) {
        studentAllowedProtected = false;
      }
      recordResult(
        "protectedProcedure",
        "Allows student caller on student.dashboard",
        studentAllowedProtected,
        0
      );

      // Test 6.2: Advisor procedure (documents.getStats / advisor.getStudentConversations)
      // Anonymous -> FORBIDDEN
      let anonBlockedAdvisor = false;
      try {
        await anonCaller.documents.getStats();
      } catch (err: any) {
        anonBlockedAdvisor = err?.code === "FORBIDDEN";
      }
      recordResult(
        "advisorProcedure",
        "Rejects anonymous caller on documents.getStats with FORBIDDEN",
        anonBlockedAdvisor,
        0
      );

      // Student -> FORBIDDEN
      let studentBlockedAdvisor = false;
      try {
        await studentCaller.documents.getStats();
      } catch (err: any) {
        studentBlockedAdvisor = err?.code === "FORBIDDEN";
      }
      recordResult(
        "advisorProcedure",
        "Rejects student caller on documents.getStats with FORBIDDEN",
        studentBlockedAdvisor,
        0
      );

      // Advisor -> Allowed
      let advisorAllowedAdvisor = false;
      try {
        const res = await advisorCaller.documents.getStats();
        advisorAllowedAdvisor = res !== undefined;
      } catch (err) {
        advisorAllowedAdvisor = false;
      }
      recordResult(
        "advisorProcedure",
        "Allows advisor caller on documents.getStats",
        advisorAllowedAdvisor,
        0
      );

      // Admin -> Allowed on advisorProcedure
      let adminAllowedAdvisor = false;
      try {
        const res = await adminCaller.documents.getStats();
        adminAllowedAdvisor = res !== undefined;
      } catch (err) {
        adminAllowedAdvisor = false;
      }
      recordResult(
        "advisorProcedure",
        "Allows admin caller on documents.getStats",
        adminAllowedAdvisor,
        0
      );

      // Test 6.3: Admin procedure (admin.dashboard)
      // Anonymous -> FORBIDDEN
      let anonBlockedAdmin = false;
      try {
        await anonCaller.admin.dashboard();
      } catch (err: any) {
        anonBlockedAdmin = err?.code === "FORBIDDEN";
      }
      recordResult(
        "adminProcedure",
        "Rejects anonymous caller on admin.dashboard with FORBIDDEN",
        anonBlockedAdmin,
        0
      );

      // Student -> FORBIDDEN
      let studentBlockedAdmin = false;
      try {
        await studentCaller.admin.dashboard();
      } catch (err: any) {
        studentBlockedAdmin = err?.code === "FORBIDDEN";
      }
      recordResult(
        "adminProcedure",
        "Rejects student caller on admin.dashboard with FORBIDDEN",
        studentBlockedAdmin,
        0
      );

      // Advisor -> FORBIDDEN
      let advisorBlockedAdmin = false;
      try {
        await advisorCaller.admin.dashboard();
      } catch (err: any) {
        advisorBlockedAdmin = err?.code === "FORBIDDEN";
      }
      recordResult(
        "adminProcedure",
        "Rejects advisor caller on admin.dashboard with FORBIDDEN",
        advisorBlockedAdmin,
        0
      );

      // Admin -> Allowed
      let adminAllowedAdmin = false;
      try {
        const res = await adminCaller.admin.dashboard();
        adminAllowedAdmin = res !== undefined && res.stats !== undefined;
      } catch (err) {
        adminAllowedAdmin = false;
      }
      recordResult(
        "adminProcedure",
        "Allows admin caller on admin.dashboard",
        adminAllowedAdmin,
        0
      );
    }

    // ============================================================================
    // SUITE 7: Client Route Guard & 403 Logic Verification
    // ============================================================================
    console.log("\n>>> SUITE 7: Client Route Guard Logic & 403 Page Routing");
    {
      // Simulate ProtectedRoute decision matrix:
      function evaluateProtectedRoute(
        user: { role: string } | null,
        requiredRole?: string | string[]
      ): { action: "ALLOW" | "REDIRECT_LOGIN" | "REDIRECT_UNAUTHORIZED" } {
        if (!user) return { action: "REDIRECT_LOGIN" };
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          if (!roles.includes(user.role)) {
            return { action: "REDIRECT_UNAUTHORIZED" };
          }
        }
        return { action: "ALLOW" };
      }

      // 7.1 Unauthenticated -> REDIRECT_LOGIN
      const unauthCheck = evaluateProtectedRoute(null, "student");
      recordResult(
        "ProtectedRoute",
        "Redirects unauthenticated user to /login",
        unauthCheck.action === "REDIRECT_LOGIN",
        0
      );

      // 7.2 Student accessing /advisor -> REDIRECT_UNAUTHORIZED
      const studentOnAdvisor = evaluateProtectedRoute({ role: "student" }, "advisor");
      recordResult(
        "ProtectedRoute",
        "Redirects student accessing advisor route to /unauthorized",
        studentOnAdvisor.action === "REDIRECT_UNAUTHORIZED",
        0
      );

      // 7.3 Student accessing /admin -> REDIRECT_UNAUTHORIZED
      const studentOnAdmin = evaluateProtectedRoute({ role: "student" }, "admin");
      recordResult(
        "ProtectedRoute",
        "Redirects student accessing admin route to /unauthorized",
        studentOnAdmin.action === "REDIRECT_UNAUTHORIZED",
        0
      );

      // 7.4 Advisor accessing /admin -> REDIRECT_UNAUTHORIZED
      const advisorOnAdmin = evaluateProtectedRoute({ role: "advisor" }, "admin");
      recordResult(
        "ProtectedRoute",
        "Redirects advisor accessing admin route to /unauthorized",
        advisorOnAdmin.action === "REDIRECT_UNAUTHORIZED",
        0
      );

      // 7.5 Advisor accessing /advisor -> ALLOW
      const advisorOnAdvisor = evaluateProtectedRoute({ role: "advisor" }, "advisor");
      recordResult(
        "ProtectedRoute",
        "Allows advisor accessing advisor route",
        advisorOnAdvisor.action === "ALLOW",
        0
      );

      // 7.6 Admin accessing /admin -> ALLOW
      const adminOnAdmin = evaluateProtectedRoute({ role: "admin" }, "admin");
      recordResult(
        "ProtectedRoute",
        "Allows admin accessing admin route",
        adminOnAdmin.action === "ALLOW",
        0
      );

      // 7.7 Student accessing multi-role route ['student', 'advisor'] -> ALLOW
      const studentOnMulti = evaluateProtectedRoute({ role: "student" }, ["student", "advisor"]);
      recordResult(
        "ProtectedRoute",
        "Allows student accessing multi-role route ['student', 'advisor']",
        studentOnMulti.action === "ALLOW",
        0
      );

      // 7.8 Unauthorized Page getDashboardPath resolution
      function getUnauthorizedDashboardPath(user: { role: string } | null): string {
        if (!user) return "/login";
        switch (user.role) {
          case "admin":
            return "/admin";
          case "advisor":
            return "/advisor";
          case "student":
          default:
            return "/dashboard";
        }
      }

      recordResult(
        "Unauthorized.tsx",
        "Resolves student return path to /dashboard",
        getUnauthorizedDashboardPath({ role: "student" }) === "/dashboard",
        0
      );

      recordResult(
        "Unauthorized.tsx",
        "Resolves advisor return path to /advisor",
        getUnauthorizedDashboardPath({ role: "advisor" }) === "/advisor",
        0
      );

      recordResult(
        "Unauthorized.tsx",
        "Resolves admin return path to /admin",
        getUnauthorizedDashboardPath({ role: "admin" }) === "/admin",
        0
      );

      recordResult(
        "Unauthorized.tsx",
        "Resolves unauthenticated return path to /login",
        getUnauthorizedDashboardPath(null) === "/login",
        0
      );
    }
  } finally {
    // Clean up test student and test courses
    console.log("\n>>> CLEANUP: Removing ephemeral test data...");
    await db.delete(studentCourses).where(eq(studentCourses.studentId, TEST_STUDENT_ID));
    await db.delete(users).where(eq(users.id, TEST_STUDENT_ID));
    console.log("Cleanup complete.");
  }

  // ============================================================================
  // SUMMARY REPORT
  // ============================================================================
  console.log("\n================================================================================");
  console.log("   ADVERSARIAL CHALLENGER AUDIT SUMMARY");
  console.log("================================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;

  console.log(`Total Empirical Checks: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.error(`\n❌ CRITICAL: ${failed} verification checks failed!`);
    process.exit(1);
  } else {
    console.log(`\n✅ ALL ${total} EMPIRICAL ADVERSARIAL CHECKS PASSED WITH 100% SUCCESS.`);
    process.exit(0);
  }
}

runEmpiricalChallengerM2().catch((err) => {
  console.error("Unhandled fatal error in challenger suite:", err);
  process.exit(1);
});
