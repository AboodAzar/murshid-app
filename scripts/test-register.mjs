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

const email = `test${Date.now()}@std-zuj.edu.jo`;
const password = "TestPass123!";
const name = "Test Student";

console.log("Registering:", email);
try {
  const regResult = await client.auth.register.mutate({ email, password, name });
  console.log("Register result:", JSON.stringify(regResult, null, 2));

  if (regResult.requireVerification) {
    console.log("OTP sent (or skipped in dev). Let's verify...");
    // In dev mode, email is skipped. We need to get the OTP from the database.
    // For now, let's just try to login - it should require verification.
    try {
      const loginResult = await client.auth.login.mutate({ email, password });
      console.log("Login result:", JSON.stringify(loginResult, null, 2));
    } catch (err) {
      console.error("Login error (expected - not verified):", err.message);
    }
  }
} catch (err) {
  console.error("Register error:", err.message);
  console.error("Full error:", JSON.stringify(err, null, 2));
}
