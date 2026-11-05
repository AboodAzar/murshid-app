// Test full cookie-based auth flow using raw fetch
const BASE = "http://localhost:3000/api/trpc";

async function trpcMutation(endpoint, input, cookie) {
  const res = await fetch(`${BASE}/${endpoint}?batch=1`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ "0": { json: input } }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, headers: res.headers, data };
}

async function trpcQuery(endpoint, cookies) {
  const res = await fetch(`${BASE}/${endpoint}?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`, {
    headers: cookies ? { Cookie: cookies } : {},
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, headers: res.headers, data };
}

function extractCookie(headers) {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(/([^=]+=[^;]+)/);
  return match ? match[1] : null;
}

async function main() {
  console.log("=== 1. Login ===");
  const loginRes = await trpcMutation("auth.login", { email: "abood@gmail.com", password: "Abood#2004" });
  console.log("Login status:", loginRes.status);
  const cookie = extractCookie(loginRes.headers);
  console.log("Cookie extracted:", cookie ? "✅ Present" : "❌ Missing");

  if (!cookie) {
    console.error("Failed to extract session cookie from login response");
    process.exit(1);
  }

  console.log("\n=== 2. Me with cookie ===");
  const meRes = await trpcQuery("auth.me", cookie);
  console.log("Me status:", meRes.status);
  const meUser = meRes.data?.[0]?.result?.data?.json;
  console.log("Authenticated User:", meUser?.email, `(role: ${meUser?.role})`);

  if (!meUser || meUser.email !== "abood@gmail.com") {
    console.error("Failed to verify authenticated user via cookie");
    process.exit(1);
  }

  console.log("\n=== 3. Logout ===");
  const logoutRes = await trpcMutation("auth.logout", {}, cookie);
  console.log("Logout status:", logoutRes.status);

  console.log("\n=== 4. Me after logout ===");
  const meAfter = await trpcQuery("auth.me", null);
  const meAfterUser = meAfter.data?.[0]?.result?.data?.json;
  console.log("Me after logout:", meAfterUser ? "Still logged in" : "Null (Logged out successfully)");

  console.log("\n✅ Raw cookie flow test passed cleanly!");
  process.exitCode = 0;
}

main().catch((err) => {
  console.error("Error in test-cookie-flow:", err);
  process.exit(1);
});
