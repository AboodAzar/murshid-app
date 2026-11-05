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
    console.log(`❌ ${name}:`, err.message?.slice(0, 120) || String(err));
    return false;
  }
}

const r = { passed: 0, failed: 0 };
async function run(name, fn) {
  if (await test(name, fn)) r.passed++;
  else r.failed++;
}

async function main() {
  // ========== ADVISOR WORKFLOW ==========
  console.log("=== Advisor Workflow Test ===");
  await run("advisor.login", () => client.auth.login.mutate({ email: "a.khalil@zuj.edu.jo", password: "password123" }));
  await run("advisor.me", () => client.auth.me.query());
  await run("advisor.getInsights", () => client.advisor.getInsights.query());
  const assigned = await client.advisor.getAssignedStudents.query();
  await run("advisor.getAssignedStudents", async () => assigned);
  const assignedStudentId = assigned[0]?.id;

  await run("advisor.getAppointments", () => client.advisor.getAppointments.query());
  await run("advisor.getAlerts", () => client.advisor.getAlerts.query({}));
  await run("advisor.getNotes", () => client.advisor.getNotes.query({}));

  if (assignedStudentId) {
    await run("advisor.student.dashboard (assigned)", () => client.student.dashboard.query({ studentId: assignedStudentId }));
    await run("advisor.student.myCourses (assigned)", () => client.student.myCourses.query({ studentId: assignedStudentId }));
  }

  // Advisor should NOT be able to access students not assigned to them
  // Test with an ID not in advisor's assigned roster (e.g. 999999 or admin id 1)
  await run("advisor.student.dashboard (unassigned boundary check)", async () => {
    try {
      await client.student.dashboard.query({ studentId: 1 });
      return { error: { message: "Should have failed authorization" } };
    } catch (err) {
      if (err.message?.includes("Not authorized") || err.message?.includes("FORBIDDEN")) {
        return { success: true };
      }
      throw err;
    }
  });

  // Cleanup
  try {
    await client.auth.logout.mutate();
  } catch {}

  console.log(`\n=== Summary: ${r.passed} passed, ${r.failed} failed ===`);
  process.exit(r.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in test-advisor-workflow:", err);
  process.exit(1);
});
