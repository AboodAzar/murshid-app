async function testLogin(email, password) {
  const res = await fetch("http://localhost:3000/api/trpc/auth.login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "0": { json: { email, password } } }),
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Set-Cookie:", res.headers.get("set-cookie"));
  try {
    const data = JSON.parse(text);
    console.log("Body:", JSON.stringify(data, null, 2));
    return { data, cookie: res.headers.get("set-cookie") };
  } catch {
    console.log("Raw body:", text);
    return null;
  }
}

const result = await testLogin("abood@gmail.com", "Abood#2004");
if (result) {
  console.log("\nLogin success:", result.data?.result?.data?.json?.success);
  console.log("User:", result.data?.result?.data?.json?.user);
}
