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
    if (result && typeof result === 'object' && 'error' in result) {
      console.log(`❌ ${name}:`, result.error?.message?.slice(0, 120));
      return false;
    }
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}:`, err.message?.slice(0, 120));
    return false;
  }
}

const r = { passed: 0, failed: 0 };
async function run(name, fn) { if (await test(name, fn)) r.passed++; else r.failed++; }

// Login as admin
await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));

// Get advisors and unassigned students
await run("admin.getAdvisorsWithStudents", () => client.admin.getAdvisorsWithStudents.query());
await run("admin.getUnassignedStudents", () => client.admin.getUnassignedStudents.query());

// Get a student and an advisor to work with
const advisors = await client.admin.getAdvisorsWithStudents.query();
const unassigned = await client.admin.getUnassignedStudents.query();

if (advisors.length === 0) {
  console.log("❌ No advisors found in the system");
  r.failed++;
}
if (unassigned.length === 0) {
  console.log("❌ No unassigned students found");
  r.failed++;
}

let testStudentId = null;
let testAdvisorId = null;

if (advisors.length > 0 && unassigned.length > 0) {
  testAdvisorId = advisors[0].id;
  testStudentId = unassigned[0].id;

  console.log(`\nTesting with advisor ${testAdvisorId} and student ${testStudentId}`);

  // Assign the student to the advisor
  await run("admin.assignAdvisor", () => client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: testAdvisorId }));

  // Verify the student now appears in the advisor's list
  await run("verify.assigned", async () => {
    const updated = await client.admin.getAdvisorsWithStudents.query();
    const advisor = updated.find(a => a.id === testAdvisorId);
    if (!advisor || !advisor.students.find(s => s.id === testStudentId)) {
      throw new Error("Student not found in advisor's list after assignment");
    }
    return true;
  });

  // Verify the student no longer appears in unassigned
  await run("verify.unassigned", async () => {
    const updated = await client.admin.getUnassignedStudents.query();
    if (updated.find(s => s.id === testStudentId)) {
      throw new Error("Student still in unassigned list after assignment");
    }
    return true;
  });

  // Test advisor viewing assigned student data
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";

  // Login as the advisor
  const advisorUser = await client.auth.login.mutate({ email: advisors[0].email, password: "password123" });
  console.log(`Advisor login result:`, advisorUser ? "success" : "failed");

  await run("advisor.getAssignedStudents", () => client.advisor.getAssignedStudents.query());
  await run("advisor.getInsights", () => client.advisor.getInsights.query());
  await run("advisor.student.dashboard", () => client.student.dashboard.query({ studentId: testStudentId }));

  // Unassign the student
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";
  await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));
  await run("admin.unassignAdvisor", () => client.admin.assignAdvisor.mutate({ studentId: testStudentId, advisorId: null }));

  // Verify unassigned
  await run("verify.unassigned.after", async () => {
    const updated = await client.admin.getUnassignedStudents.query();
    if (!updated.find(s => s.id === testStudentId)) {
      throw new Error("Student not back in unassigned list after unassignment");
    }
    return true;
  });
}

console.log(`\n=== Summary: ${r.passed} passed, ${r.failed} failed ===`);
