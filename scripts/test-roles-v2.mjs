import "dotenv/config";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
    }),
  ],
});

async function testLogin(email, password, expectedRole) {
  console.log(`\n=== Testing ${expectedRole} login: ${email} ===`);
  try {
    const result = await client.auth.login.mutate({ email, password });
    console.log("Result:", result);
    if (result.success) {
      console.log(`✅ ${expectedRole} login works! Role:`, result.user?.role);
    } else {
      console.log(`❌ ${expectedRole} login failed`);
    }
  } catch (err) {
    console.error(`❌ ${expectedRole} login error:`, err.message);
  }
}

// Test admin (known credentials)
await testLogin("abood@gmail.com", "Abood#2004", "admin");

// Test a newly registered student
const email = `roletest${Date.now()}@std-zuj.edu.jo`;
const password = "TestPass123!";
console.log(`\n=== Registering student: ${email} ===`);
const regResult = await client.auth.register.mutate({ email, password, name: "Role Test" });
console.log("Register result:", regResult);

if (regResult.requireVerification) {
  // We'll test login before verification (should require verification)
  console.log("\n=== Testing login before verification ===");
  const preLogin = await client.auth.login.mutate({ email, password });
  console.log("Pre-verification login:", preLogin);

  // Get OTP and verify
  const dbModule = await import("../server/db.ts");
  const { getDb } = dbModule;
  const db = await getDb();
  const { eq } = await import("drizzle-orm");
  const { users: usersTable, emailVerificationTokens: tokensTable } = await import("../drizzle/schema.ts");

  const userResult = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const user = userResult[0];
  const tokenResult = await db.select().from(tokensTable).where(eq(tokensTable.userId, user.id));
  const otp = tokenResult[0]?.token;

  console.log("\n=== Verifying email ===");
  await client.auth.verifyEmail.mutate({ email, code: otp });

  console.log("\n=== Testing login after verification ===");
  await testLogin(email, password, "student");
}

console.log("\n=== Role tests complete ===");
