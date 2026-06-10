import "dotenv/config";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users, emailVerificationTokens } from "../drizzle/schema.ts";

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
    }),
  ],
});

const db = drizzle(process.env.DATABASE_URL);

const email = `test${Date.now()}@std-zuj.edu.jo`;
const password = "TestPass123!";
const name = "Test Student";

console.log("=== 1. Register ===");
console.log("Email:", email);
const regResult = await client.auth.register.mutate({ email, password, name });
console.log("Register result:", regResult);

if (regResult.requireVerification) {
  console.log("\n=== 2. Get OTP from DB ===");
  const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userResult[0];
  console.log("User ID:", user?.id);

  const tokenResult = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.userId, user.id));
  const otp = tokenResult[0]?.token;
  console.log("OTP:", otp);

  if (otp) {
    console.log("\n=== 3. Verify Email ===");
    const verifyResult = await client.auth.verifyEmail.mutate({ email, code: otp });
    console.log("Verify result:", verifyResult);

    if (verifyResult.success) {
      console.log("\n=== 4. Login after verification ===");
      const loginResult = await client.auth.login.mutate({ email, password });
      console.log("Login result:", loginResult);

      if (loginResult.success && !loginResult.requireVerification) {
        console.log("\n=== 5. Get Me ===");
        const meResult = await client.auth.me.query();
        console.log("Me result:", meResult);
      }
    }
  }
}

console.log("\n=== Full auth flow test complete ===");
