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
  // Login as admin
  await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));

  // Get advisors and unassigned students
  const advisors = await client.admin.getAdvisorsWithStudents.query();
  let unassigned = await client.admin.getUnassignedStudents.query();

  console.log(`Found ${advisors.length} advisors, ${unassigned.length} unassigned students`);

  if (advisors.length === 0) {
    console.log("❌ No advisors found in the system");
    process.exit(1);
  }

  let testStudentId = null;
  let testAdvisorId = advisors[0].id;
  let originalAdvisorId = null;

  if (unassigned.length > 0) {
    testStudentId = unassigned[0].id;
  } else {
    const advisorWithStudents = advisors.find((a) => a.students && a.students.length > 0) || advisors[0];
    const candidateStudent = advisorWithStudents.students[0];
    testStudentId = candidateStudent.id;
    originalAdvisorId = advisorWithStudents.id;

    console.log(`Temporarily unassigning student ${testStudentId} from advisor ${originalAdvisorId} for test...`);
    await client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: null });
    unassigned = await client.admin.getUnassignedStudents.query();
  }

  console.log(`\nTesting with advisor ${testAdvisorId} (${advisors[0].email}) and student ${testStudentId}`);

  // Assign the student to the advisor
  await run("admin.assignAdvisor", () => client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: testAdvisorId }));

  // Verify the student now appears in the advisor's list
  await run("verify.assigned", async () => {
    const updated = await client.admin.getAdvisorsWithStudents.query();
    const advisor = updated.find((a) => a.id === testAdvisorId);
    if (!advisor || !advisor.students.find((s) => s.id === testStudentId)) {
      throw new Error("Student not found in advisor's list after assignment");
    }
  });

  // Verify the student no longer appears in unassigned
  await run("verify.notUnassigned", async () => {
    const updated = await client.admin.getUnassignedStudents.query();
    if (updated.find((s) => s.id === testStudentId)) {
      throw new Error("Student still in unassigned list after assignment");
    }
  });

  // Verify admin dashboard includes advisorId
  await run("admin.dashboard.hasAdvisorId", async () => {
    const dash = await client.admin.dashboard.query();
    const student = dash.users.find((u) => u.id === testStudentId);
    if (!student || student.advisorId !== testAdvisorId) {
      throw new Error("Admin dashboard does not reflect advisor assignment");
    }
  });

  // Cleanup: restore or unassign
  if (originalAdvisorId) {
    await run("admin.restoreOriginalAdvisor", () =>
      client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: originalAdvisorId })
    );
  } else {
    await run("admin.unassignAdvisor", () => client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: null }));
    await run("verify.unassigned.after", async () => {
      const updated = await client.admin.getUnassignedStudents.query();
      if (!updated.find((s) => s.id === testStudentId)) {
        throw new Error("Student not back in unassigned list after unassignment");
      }
    });
  }

  try {
    await client.auth.logout.mutate();
  } catch {}

  console.log(`\n=== Summary: ${r.passed} passed, ${r.failed} failed ===`);
  process.exit(r.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in test-assignment-v2:", err);
  process.exit(1);
});
