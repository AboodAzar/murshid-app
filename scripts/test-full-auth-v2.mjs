import "dotenv/config";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import mysql from "mysql2/promise";

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
    }),
  ],
});

// Parse DATABASE_URL manually for mysql2
const dbUrl = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace(/^\//, ""),
});

const email = `test${Date.now()}@std-zuj.edu.jo`;
const password = "TestPass123!";
const name = "Test Student";

console.log("=== 1. Register ===");
console.log("Email:", email);
const regResult = await client.auth.register.mutate({ email, password, name });
console.log("Register result:", regResult);

if (regResult.requireVerification) {
  console.log("\n=== 2. Get OTP from DB ===");
  const [rows] = await conn.query(
    'SELECT token FROM email_verification_tokens WHERE userId = (SELECT id FROM users WHERE email = ?)',
    [email]
  );
  const otp = rows[0]?.token;
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

await conn.end();
console.log("\n=== Full auth flow test complete ===");
