import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

let cookieJar = "";

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...(init?.headers ?? {}),
            ...(cookieJar ? { Cookie: cookieJar } : {}),
          },
        }).then((res) => {
          const setCookie = res.headers.get("set-cookie");
          if (setCookie) {
            const match = setCookie.match(/([^=]+=[^;]+)/);
            if (match) cookieJar = match[1];
          }
          return res;
        });
      },
    }),
  ],
});

async function test(name, fn) {
  try {
    const result = await fn();
    if (result && typeof result === "object" && "error" in result && result.error) {
      console.log(`❌ ${name}:`, result.error?.message?.slice(0, 120));
      return false;
    }
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}:`, err.message?.slice(0, 120) || err);
    return false;
  }
}

const r = { passed: 0, failed: 0 };
async function run(name, fn) {
  if (await test(name, fn)) r.passed++;
  else r.failed++;
}

async function main() {
  // ========== ADMIN SETUP ==========
  console.log("=== Admin Setup ===");
  await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));

  const advisors = await client.admin.getAdvisorsWithStudents.query();
  let unassigned = await client.admin.getUnassignedStudents.query();

  console.log(`Found ${advisors.length} advisors, ${unassigned.length} unassigned students`);

  if (advisors.length === 0) {
    console.log("❌ Cannot test: need at least 1 advisor");
    process.exit(1);
  }

  let testStudentId = null;
  let originalAdvisorId = null;
  const testAdvisor = advisors[0];
  const testAdvisorId = testAdvisor.id;

  if (unassigned.length > 0) {
    testStudentId = unassigned[0].id;
    originalAdvisorId = null;
  } else {
    // All students currently assigned: dynamically unassign one student for this test
    const advisorWithStudents = advisors.find((a) => a.students && a.students.length > 0) || advisors[0];
    const candidateStudent = advisorWithStudents.students[0];
    testStudentId = candidateStudent.id;
    originalAdvisorId = advisorWithStudents.id;

    console.log(`Temporarily unassigning student ${testStudentId} from advisor ${originalAdvisorId} for test...`);
    await client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: null });
    unassigned = await client.admin.getUnassignedStudents.query();
  }

  console.log(`Target Advisor: ${testAdvisor.name ?? testAdvisor.email} (id=${testAdvisorId})`);
  console.log(`Target Student: id=${testStudentId}`);

  // ========== ASSIGNMENT ==========
  console.log("\n=== Assignment ===");
  await run("admin.assignAdvisor", () => client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: testAdvisorId }));

  await run("admin.verify.assigned", async () => {
    const updated = await client.admin.getAdvisorsWithStudents.query();
    const advisor = updated.find((a) => a.id === testAdvisorId);
    if (!advisor || !advisor.students.find((s) => s.id === testStudentId)) {
      throw new Error("Student not in advisor list");
    }
  });

  await run("admin.verify.dashboard", async () => {
    const dash = await client.admin.dashboard.query();
    const student = dash.users.find((u) => u.id === testStudentId);
    if (!student || student.advisorId !== testAdvisorId) {
      throw new Error("Dashboard missing or wrong advisorId");
    }
  });

  // ========== ADVISOR WORKFLOW ==========
  console.log("\n=== Advisor Workflow ===");
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";

  await run("advisor.login", () => client.auth.login.mutate({ email: testAdvisor.email, password: "password123" }));

  await run("advisor.getAssignedStudents", async () => {
    const students = await client.advisor.getAssignedStudents.query();
    if (!students.find((s) => s.id === testStudentId)) {
      throw new Error("Assigned student not visible to advisor");
    }
  });

  await run("advisor.getInsights", async () => {
    const insights = await client.advisor.getInsights.query();
    if (insights.totalStudents === 0) {
      throw new Error("Insights show 0 students");
    }
  });

  await run("advisor.getAlerts", () => client.advisor.getAlerts.query({}));
  await run("advisor.getNotes", () => client.advisor.getNotes.query({}));
  await run("advisor.student.dashboard", () => client.student.dashboard.query({ studentId: testStudentId }));
  await run("advisor.student.myCourses", () => client.student.myCourses.query({ studentId: testStudentId }));

  // ========== CLEANUP ==========
  console.log("\n=== Cleanup ===");
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";

  await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));

  if (originalAdvisorId) {
    console.log(`Restoring student ${testStudentId} to original advisor ${originalAdvisorId}...`);
    await run("admin.restoreOriginalAdvisor", () =>
      client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: originalAdvisorId })
    );
    await run("admin.verify.restored", async () => {
      const updated = await client.admin.getAdvisorsWithStudents.query();
      const origAdvisor = updated.find((a) => a.id === originalAdvisorId);
      if (!origAdvisor || !origAdvisor.students.find((s) => s.id === testStudentId)) {
        throw new Error("Student not restored to original advisor list");
      }
    });
  } else {
    await run("admin.unassign", () => client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: null }));
    await run("admin.verify.unassigned", async () => {
      const updated = await client.admin.getUnassignedStudents.query();
      if (!updated.find((s) => s.id === testStudentId)) {
        throw new Error("Student not back in unassigned list");
      }
    });
  }

  try {
    await client.auth.logout.mutate();
  } catch {}

  console.log(`\n=== E2E Summary: ${r.passed} passed, ${r.failed} failed ===`);
  process.exit(r.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in e2e-advisor-assignment:", err);
  process.exit(1);
});
