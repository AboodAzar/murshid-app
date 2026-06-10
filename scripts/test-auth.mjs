// Test auth endpoints directly
const BASE = "http://localhost:3000/api/trpc";

async function testDebug() {
  const res = await fetch(`${BASE}/auth.debug`);
  const data = await res.json();
  console.log("Debug result:", JSON.stringify(data, null, 2));
  return data;
}

async function testRegister(email, password, name) {
  const res = await fetch(`${BASE}/auth.register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  console.log("Register result:", JSON.stringify(data, null, 2));
  return data;
}

async function testLogin(email, password) {
  const res = await fetch(`${BASE}/auth.login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  console.log("Login result:", JSON.stringify(data, null, 2));
  return data;
}

async function testMe(cookies) {
  const res = await fetch(`${BASE}/auth.me`, {
    headers: cookies ? { "Cookie": cookies } : {},
  });
  const data = await res.json();
  console.log("Me result:", JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  try {
    console.log("=== Testing Debug ===");
    await testDebug();

    const email = `test${Date.now()}@std-zuj.edu.jo`;
    const password = "TestPass123!";
    const name = "Test User";

    console.log("\n=== Testing Register ===");
    const regResult = await testRegister(email, password, name);

    console.log("\n=== Testing Login ===");
    const loginResult = await testLogin(email, password);

    if (loginResult.result?.data?.success) {
      const cookies = loginResult.result?.data?.cookie; // tRPC doesn't return cookies in JSON, but we can check headers
      console.log("\nLogin succeeded!");
    }
  } catch (err) {
    console.error("Test error:", err);
  }
}

main();
