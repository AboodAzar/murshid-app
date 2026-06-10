// Test full cookie-based auth flow using raw fetch
const BASE = "http://localhost:3000/api/trpc";

async function trpcMutation(endpoint, input) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "0": { json: input } }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, headers: res.headers, data };
}

async function trpcQuery(endpoint, cookies) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    headers: cookies ? { "Cookie": cookies } : {},
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, headers: res.headers, data };
}

function extractCookie(headers) {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return null;
  // Extract just the cookie name=value part
  const match = setCookie.match(/([^=]+=[^;]+)/);
  return match ? match[1] : null;
}

async function main() {
  console.log("=== 1. Login ===");
  const loginRes = await trpcMutation("auth.login", { email: "abood@gmail.com", password: "Abood#2004" });
  console.log("Login status:", loginRes.status);
  const cookie = extractCookie(loginRes.headers);
  console.log("Cookie:", cookie);
  console.log("Login data:", JSON.stringify(loginRes.data, null, 2));

  if (cookie) {
    console.log("\n=== 2. Me with cookie ===");
    const meRes = await trpcQuery("auth.me", cookie);
    console.log("Me status:", meRes.status);
    console.log("Me data:", JSON.stringify(meRes.data, null, 2));

    console.log("\n=== 3. Logout ===");
    const logoutRes = await trpcMutation("auth.logout", {});
    // Pass cookie to logout too
    const logoutWithCookie = await fetch(`${BASE}/auth.logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({ "0": { json: {} } }),
    });
    console.log("Logout status:", logoutWithCookie.status);

    console.log("\n=== 4. Me after logout ===");
    const meAfter = await trpcQuery("auth.me", cookie);
    console.log("Me after logout:", JSON.stringify(meAfter.data, null, 2));
  }
}

main();
