/**
 * Milestone 1 Adversarial Boundary & Stress Test Runner
 *
 * Covers:
 * 1. Origin Fuzzing (production mode logic, forbidden origins, reflection prevention)
 * 2. Token Fuzzing (empty, expired, tampered, non-JWT, SQL injection, XSS, buffer overflow, raw bytes)
 * 3. Concurrency & Replay (thread safety, multi-user context isolation, race conditions, burst stress)
 */

import "dotenv/config";
import net from "net";
import { SignJWT } from "jose";
import { isAllowedOrigin, corsMiddleware } from "../../server/_core/cors.ts";

const BASE_URL = process.env.TEST_SERVER_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "development-only-jwt-secret-change-me";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Color helpers for terminal output
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

const results = {
  originTests: [],
  tokenTests: [],
  concurrencyTests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function recordResult(category, name, passed, details = "") {
  results.summary.total++;
  if (passed) {
    results.summary.passed++;
    console.log(`  ${green("✓")} ${name}`);
  } else {
    results.summary.failed++;
    console.log(`  ${red("✗")} ${name} - ${details}`);
  }
  results[category].push({ name, passed, details });
}

// Helper to send raw TCP request
function sendRawTcpRequest(requestString) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = "";

    client.connect(3000, "localhost", () => {
      client.write(Buffer.from(requestString, "utf-8"));
    });

    client.on("data", (data) => {
      responseData += data.toString();
      client.destroy();
    });

    client.on("close", () => {
      const statusLine = responseData.split("\r\n")[0] || "";
      const match = statusLine.match(/HTTP\/1\.[01]\s+(\d{3})/);
      const statusCode = match ? parseInt(match[1], 10) : 0;
      resolve({ statusCode, raw: responseData, statusLine });
    });

    client.on("error", (err) => {
      reject(err);
    });
  });
}

// ============================================================================
// Section 1: Origin Fuzzing & CORS Validation
// ============================================================================
async function runOriginFuzzingTests() {
  console.log(cyan("\n=== [1/3] Adversarial Origin Fuzzing & CORS Logic ==="));

  const originalEnv = process.env.NODE_ENV;
  try {
    // Force production mode to test strict production origin gatekeeper
    process.env.NODE_ENV = "production";

    const forbiddenOrigins = [
      "http://evil-attacker.com",
      "https://evil-attacker.com",
      "https://spoofed-zuj.edu.jo.attacker.com",
      "http://zuj.edu.jo.attacker.com",
      "http://localhost.attacker.com",
      "https://localhost.attacker.com:3000",
      "http://172.20.10.4.attacker.com",
      "http://127.0.0.1.attacker.com",
      "http://172.32.0.1:3000",       // outside RFC 1918 172.16-31
      "http://172.15.255.255:3000",   // outside RFC 1918 172.16-31
      "http://11.0.0.1:3000",         // outside 10.0.0.0/8
      "http://192.169.1.1:3000",      // outside 192.168.0.0/16
      "http://8.8.8.8:3000",          // public IP
      "null",                         // string "null"
      "data:text/html,<html></html>", // data URI
      "file:///etc/passwd",           // file URI
      "javascript:alert(1)",          // javascript URI
    ];

    for (const origin of forbiddenOrigins) {
      const allowed = isAllowedOrigin(origin);
      recordResult(
        "originTests",
        `Prod logic rejects forbidden origin: ${origin}`,
        allowed === false,
        `Expected false, got ${allowed}`
      );
    }

    const legitimateOrigins = [
      "capacitor://localhost",
      "ionic://localhost",
      "http://localhost",
      "http://localhost:3000",
      "https://localhost:5173",
      "http://127.0.0.1",
      "http://127.0.0.1:3000",
      "http://172.20.10.4:3000",       // Hotspot IP
      "http://172.16.0.1:8080",        // RFC 1918
      "http://172.31.255.254:3000",    // RFC 1918 boundary
      "http://192.168.1.100:3000",     // RFC 1918
      "http://10.0.0.1:3000",          // RFC 1918
      undefined,                       // direct curl / same-origin
      "",                              // empty string
    ];

    for (const origin of legitimateOrigins) {
      const allowed = isAllowedOrigin(origin);
      recordResult(
        "originTests",
        `Prod logic accepts legitimate origin: ${origin ?? "<undefined>"}`,
        allowed === true,
        `Expected true, got ${allowed}`
      );
    }

    // Test middleware behavior in production mode with forbidden origins
    function runMockMiddleware(method, originHeader) {
      const headers = {};
      let statusCode = 200;
      let ended = false;
      let nextCalled = false;

      const req = {
        method,
        headers: originHeader ? { origin: originHeader } : {},
      };
      const res = {
        setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
        status: (c) => { statusCode = c; return res; },
        end: () => { ended = true; return res; }
      };
      const next = () => { nextCalled = true; };

      corsMiddleware(req, res, next);
      return { headers, statusCode, ended, nextCalled };
    }

    // Middleware test 1: Forbidden origin GET request in production
    const forbiddenGet = runMockMiddleware("GET", "http://evil-attacker.com");
    recordResult(
      "originTests",
      "Prod middleware omits Access-Control-Allow-Origin for http://evil-attacker.com",
      forbiddenGet.headers["access-control-allow-origin"] === undefined,
      `Header was reflected as: ${forbiddenGet.headers["access-control-allow-origin"]}`
    );
    recordResult(
      "originTests",
      "Prod middleware omits Access-Control-Allow-Credentials for forbidden origin",
      forbiddenGet.headers["access-control-allow-credentials"] === undefined,
      `Credentials header was set: ${forbiddenGet.headers["access-control-allow-credentials"]}`
    );

    // Middleware test 2: Spoofed ZUJ subdomain in production
    const spoofedGet = runMockMiddleware("GET", "https://spoofed-zuj.edu.jo.attacker.com");
    recordResult(
      "originTests",
      "Prod middleware omits Access-Control-Allow-Origin for https://spoofed-zuj.edu.jo.attacker.com",
      spoofedGet.headers["access-control-allow-origin"] === undefined,
      `Header was reflected as: ${spoofedGet.headers["access-control-allow-origin"]}`
    );

    // Middleware test 3: Preflight OPTIONS from forbidden origin in production
    const forbiddenOptions = runMockMiddleware("OPTIONS", "http://evil-attacker.com");
    recordResult(
      "originTests",
      "Prod preflight OPTIONS short-circuits (204) without reflecting forbidden origin",
      forbiddenOptions.statusCode === 204 &&
      forbiddenOptions.headers["access-control-allow-origin"] === undefined,
      `Status: ${forbiddenOptions.statusCode}, Origin header: ${forbiddenOptions.headers["access-control-allow-origin"]}`
    );

    // Middleware test 4: Legitimate capacitor://localhost preflight OPTIONS
    const legitOptions = runMockMiddleware("OPTIONS", "capacitor://localhost");
    recordResult(
      "originTests",
      "Prod preflight OPTIONS reflects capacitor://localhost with credentials",
      legitOptions.statusCode === 204 &&
      legitOptions.headers["access-control-allow-origin"] === "capacitor://localhost" &&
      legitOptions.headers["access-control-allow-credentials"] === "true",
      `Status: ${legitOptions.statusCode}, Origin: ${legitOptions.headers["access-control-allow-origin"]}`
    );

  } finally {
    process.env.NODE_ENV = originalEnv;
  }

  // Live HTTP Origin check against running server
  try {
    const liveOptionsRes = await fetch(`${BASE_URL}/api/trpc/aiChat.getStatus`, {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://localhost",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization, x-trpc-source",
      },
    });

    recordResult(
      "originTests",
      "Live server preflight OPTIONS returns HTTP 204 for capacitor://localhost",
      liveOptionsRes.status === 204,
      `HTTP status: ${liveOptionsRes.status}`
    );

    const allowOrigin = liveOptionsRes.headers.get("access-control-allow-origin");
    const allowCreds = liveOptionsRes.headers.get("access-control-allow-credentials");
    recordResult(
      "originTests",
      "Live server preflight OPTIONS contains correct CORS headers",
      allowOrigin === "capacitor://localhost" && allowCreds === "true",
      `Origin: ${allowOrigin}, Credentials: ${allowCreds}`
    );
  } catch (err) {
    recordResult("originTests", "Live server preflight OPTIONS reachable", false, err.message);
  }
}

// ============================================================================
// Section 2: Token Fuzzing & Boundary Testing
// ============================================================================
async function runTokenFuzzingTests() {
  console.log(cyan("\n=== [2/3] Adversarial Bearer Token Fuzzing ==="));

  // Step 1: Obtain real valid JWTs by logging in
  let validKhaledToken = null;
  let validLinaToken = null;
  try {
    const loginKhaled = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: { email: "khaled.haddad@zuj.edu.jo", password: "password123" },
      }),
    });
    const khaledData = await loginKhaled.json();
    validKhaledToken = khaledData.result?.data?.json?.token;

    const loginLina = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: { email: "lina.omar@zuj.edu.jo", password: "password123" },
      }),
    });
    const linaData = await loginLina.json();
    validLinaToken = linaData.result?.data?.json?.token;

    recordResult(
      "tokenTests",
      "Baseline: auth.login returns valid Bearer token for Khaled Haddad",
      loginKhaled.status === 200 && typeof validKhaledToken === "string" && validKhaledToken.length > 50,
      `Status: ${loginKhaled.status}, token length: ${validKhaledToken?.length}`
    );
    recordResult(
      "tokenTests",
      "Baseline: auth.login returns valid Bearer token for Lina Omar",
      loginLina.status === 200 && typeof validLinaToken === "string" && validLinaToken.length > 50,
      `Status: ${loginLina.status}, token length: ${validLinaToken?.length}`
    );
  } catch (err) {
    recordResult("tokenTests", "Baseline: auth.login reachable", false, err.message);
    return { validKhaledToken, validLinaToken };
  }

  // Baseline verification: Valid token gives 200 on student.myCourses
  try {
    const coursesRes = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      headers: { Authorization: `Bearer ${validKhaledToken}` },
    });
    const coursesData = await coursesRes.json();
    recordResult(
      "tokenTests",
      "Baseline: student.myCourses returns HTTP 200 with valid Bearer token",
      coursesRes.status === 200 && Array.isArray(coursesData.result?.data?.json),
      `Status: ${coursesRes.status}, courses count: ${coursesData.result?.data?.json?.length}`
    );
  } catch (err) {
    recordResult("tokenTests", "Baseline: student.myCourses with valid token", false, err.message);
  }

  // Helper to test Bearer header against protected student.myCourses
  async function testBearerHeader(testName, headerValue, expectedCode = 401) {
    try {
      const headers = {};
      if (headerValue !== undefined) {
        headers["Authorization"] = headerValue;
      }

      const res = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
        headers,
      });

      const bodyText = await res.text();
      let bodyJson = null;
      try {
        bodyJson = JSON.parse(bodyText);
      } catch {}

      const isStatusExpected = res.status === expectedCode;
      const no500 = res.status !== 500;
      const passed = isStatusExpected && no500;

      recordResult(
        "tokenTests",
        testName,
        passed,
        `Status: ${res.status} (expected ${expectedCode}), code: ${bodyJson?.error?.json?.data?.code || "none"}`
      );
      return { status: res.status, bodyJson };
    } catch (err) {
      recordResult("tokenTests", testName, false, `Fetch error / crash: ${err.message}`);
      return { status: 0, error: err };
    }
  }

  // Fuzz 1: Empty string after Bearer
  await testBearerHeader("Empty Bearer token ('Bearer ')", "Bearer ");

  // Fuzz 2: Whitespace only after Bearer
  await testBearerHeader("Whitespace Bearer token ('Bearer    ')", "Bearer    ");

  // Fuzz 3: Missing Bearer prefix (raw token)
  await testBearerHeader("Raw JWT without Bearer prefix", validKhaledToken);

  // Fuzz 4: Non-Bearer auth scheme
  await testBearerHeader("Basic auth scheme ('Basic dXNlcjpwYXNz')", "Basic dXNlcjpwYXNz");

  // Fuzz 5: Random alphanumeric non-JWT string
  await testBearerHeader(
    "Non-JWT random alphanumeric string",
    "Bearer d8f7a6s5df87as6df87as6df87a6sdf"
  );

  // Fuzz 6: Truncated JWT (2 segments instead of 3)
  const twoPartJwt = validKhaledToken.split(".").slice(0, 2).join(".");
  await testBearerHeader("Truncated JWT (2 segments)", `Bearer ${twoPartJwt}`);

  // Fuzz 7: Quadruple segment JWT (4 segments)
  await testBearerHeader("Malformed JWT with 4 segments", `Bearer ${validKhaledToken}.extra_segment`);

  // Fuzz 8: Corrupted base64 in payload segment
  await testBearerHeader(
    "Corrupted base64 characters in JWT segment",
    "Bearer eyJhbGciOiJIUzI1NiJ9.!!!CORRUPTED_BASE64_PAYLOAD!!!.c2lnbmF0dXJl"
  );

  // Fuzz 9: Signature-tampered JWT (flip last 8 characters of legitimate signature)
  const tamperedSigToken = validKhaledToken.slice(0, -8) + "XXXXXXXX";
  await testBearerHeader(
    "Signature-tampered JWT (altered signature bytes)",
    `Bearer ${tamperedSigToken}`
  );

  // Fuzz 10: Payload-tampered JWT (elevate role/userId to admin:1 with original signature)
  try {
    const parts = validKhaledToken.split(".");
    const decodedPayload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    decodedPayload.userId = 1;
    decodedPayload.role = "admin";
    const forgedPayloadBase64 = Buffer.from(JSON.stringify(decodedPayload)).toString("base64url");
    const forgedToken = `${parts[0]}.${forgedPayloadBase64}.${parts[2]}`; // original signature
    await testBearerHeader(
      "Payload-tampered JWT (modified claims with stale signature)",
      `Bearer ${forgedToken}`
    );
  } catch (err) {
    recordResult("tokenTests", "Payload-tampered JWT preparation", false, err.message);
  }

  // Fuzz 11: Expired JWT (validly signed with secret, but exp set to past)
  try {
    const expiredToken = await new SignJWT({
      userId: 210027,
      email: "khaled.haddad@zuj.edu.jo",
      name: "Khaled Haddad",
      role: "student",
      type: "local-auth",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // expired 1h ago
      .sign(secretKey);

    await testBearerHeader("Expired JWT (exp claim in past)", `Bearer ${expiredToken}`);
  } catch (err) {
    recordResult("tokenTests", "Expired JWT test preparation", false, err.message);
  }

  // Fuzz 12: Rogue Secret Key JWT (signed with attacker secret)
  try {
    const rogueKey = new TextEncoder().encode("unauthorized-attacker-secret-key-99999");
    const rogueToken = await new SignJWT({
      userId: 210027,
      email: "khaled.haddad@zuj.edu.jo",
      name: "Khaled Haddad",
      role: "student",
      type: "local-auth",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(rogueKey);

    await testBearerHeader(
      "Rogue Secret Key JWT (signed by third-party secret)",
      `Bearer ${rogueToken}`
    );
  } catch (err) {
    recordResult("tokenTests", "Rogue secret key JWT preparation", false, err.message);
  }

  // Fuzz 13: Non-existent user ID in validly signed JWT
  try {
    const ghostToken = await new SignJWT({
      userId: 99999999, // non-existent
      email: "ghost.user@zuj.edu.jo",
      name: "Ghost User",
      role: "student",
      type: "local-auth",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    await testBearerHeader(
      "Non-existent User ID (ghost account 99999999)",
      `Bearer ${ghostToken}`
    );
  } catch (err) {
    recordResult("tokenTests", "Ghost user JWT preparation", false, err.message);
  }

  // Fuzz 14-19: SQL Injection attacks inside Authorization header
  const sqliPayloads = [
    { name: "SQLi: ' OR 1=1 --", val: "Bearer ' OR 1=1 --" },
    { name: "SQLi: '; DROP TABLE users; --", val: "Bearer '; DROP TABLE users; --" },
    { name: "SQLi: 1' UNION SELECT 1,2,3,4,5 --", val: "Bearer 1' UNION SELECT 1,2,3,4,5 --" },
    { name: "SQLi: ' OR ''='", val: "Bearer ' OR ''='" },
    { name: "SQLi: admin'--", val: "Bearer admin'--" },
    { name: "SQLi: 1; SELECT SLEEP(1); --", val: "Bearer 1; SELECT SLEEP(1); --" },
  ];

  for (const sqli of sqliPayloads) {
    const startTime = Date.now();
    const result = await testBearerHeader(sqli.name, sqli.val);
    const duration = Date.now() - startTime;
    recordResult(
      "tokenTests",
      `${sqli.name} execution time < 500ms (no sleep injection)`,
      duration < 500,
      `Duration: ${duration}ms`
    );
  }

  // Fuzz 20: XSS script tag injection
  await testBearerHeader(
    "XSS: <script>alert('xss')</script> in Bearer header",
    "Bearer <script>alert('xss')</script>"
  );

  // Fuzz 21: Buffer overflow / 10,000 characters
  await testBearerHeader(
    "Extreme Length: 10,000 character string",
    "Bearer " + "A".repeat(10000),
    401
  );

  // Fuzz 22: Raw TCP Socket - Binary control characters
  try {
    const tcpControl = await sendRawTcpRequest(
      "GET /api/trpc/student.myCourses HTTP/1.1\r\nHost: localhost:3000\r\nAuthorization: Bearer \x00\x01\x1b\x7f\r\n\r\n"
    );
    recordResult(
      "tokenTests",
      "Raw TCP: Binary control characters safely rejected (HTTP 400)",
      tcpControl.statusCode === 400,
      `HTTP status: ${tcpControl.statusCode} (${tcpControl.statusLine})`
    );
  } catch (err) {
    recordResult("tokenTests", "Raw TCP: Binary control characters", false, err.message);
  }

  // Fuzz 23: Raw TCP Socket - UTF-8 Emojis in Bearer header
  try {
    const tcpEmoji = await sendRawTcpRequest(
      "GET /api/trpc/student.myCourses HTTP/1.1\r\nHost: localhost:3000\r\nAuthorization: Bearer 💀🔐🚀\r\n\r\n"
    );
    recordResult(
      "tokenTests",
      "Raw TCP: UTF-8 Emoji in Bearer header safely handled (HTTP 401)",
      tcpEmoji.statusCode === 401,
      `HTTP status: ${tcpEmoji.statusCode} (${tcpEmoji.statusLine})`
    );
  } catch (err) {
    recordResult("tokenTests", "Raw TCP: UTF-8 Emoji", false, err.message);
  }

  // Fuzz 24: Public auth.me endpoint with SQLi Bearer
  try {
    const meRes = await fetch(`${BASE_URL}/api/trpc/auth.me`, {
      headers: { Authorization: "Bearer ' OR 1=1 --" },
    });
    const meData = await meRes.json().catch(() => ({}));
    const passed = (meRes.status === 401 || (meRes.status === 200 && meData.result?.data?.json === null)) && meRes.status !== 500;
    recordResult(
      "tokenTests",
      "Public auth.me with SQLi Bearer is rejected with 401 without throwing 500",
      passed,
      `Status: ${meRes.status}, code: ${meData.error?.json?.data?.code || "none"}`
    );
  } catch (err) {
    recordResult("tokenTests", "Public auth.me with SQLi Bearer", false, err.message);
  }

  // Fuzz 25: Dual-Auth Precedence (Valid Bearer + Invalid Cookie -> Bearer wins)
  try {
    const dualRes = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      headers: {
        Authorization: `Bearer ${validKhaledToken}`,
        Cookie: "app_session_id=corrupted-cookie-value-that-is-invalid",
      },
    });
    recordResult(
      "tokenTests",
      "Dual-Auth Precedence: Valid Bearer overrides corrupted cookie (HTTP 200)",
      dualRes.status === 200,
      `Status: ${dualRes.status}`
    );
  } catch (err) {
    recordResult("tokenTests", "Dual-Auth Precedence", false, err.message);
  }

  return { validKhaledToken, validLinaToken };
}

// ============================================================================
// Section 3: Concurrency & Replay Stress Testing
// ============================================================================
async function runConcurrencyStressTests(tokens) {
  console.log(cyan("\n=== [3/3] Concurrency, Replay & Race Condition Stress ==="));

  const { validKhaledToken, validLinaToken } = tokens;
  if (!validKhaledToken || !validLinaToken) {
    recordResult("concurrencyTests", "Tokens available for concurrency stress", false, "Missing tokens");
    return;
  }

  // Test C1: High-concurrency replay burst (50 concurrent requests with SAME valid token)
  console.log("  Testing 50 concurrent valid requests with identical Bearer token...");
  const burstCount = 50;
  const startReplay = Date.now();
  const replayPromises = Array.from({ length: burstCount }, (_, i) =>
    fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      headers: { Authorization: `Bearer ${validKhaledToken}` },
    }).then(async (res) => ({
      index: i,
      status: res.status,
      data: await res.json(),
    }))
  );

  const replayResults = await Promise.all(replayPromises);
  const replayDuration = Date.now() - startReplay;

  const replay200s = replayResults.filter((r) => r.status === 200);
  const replayCoursesLengths = replayResults.map((r) => r.data.result?.data?.json?.length);
  const allIdentical = replayCoursesLengths.every((len) => len === replayCoursesLengths[0]);

  recordResult(
    "concurrencyTests",
    `50 concurrent requests with same Bearer token: 100% return HTTP 200 (completed in ${replayDuration}ms)`,
    replay200s.length === burstCount,
    `Success rate: ${replay200s.length}/${burstCount}`
  );

  recordResult(
    "concurrencyTests",
    "50 concurrent requests return deterministic identical payloads (no session corruption)",
    allIdentical && replayCoursesLengths[0] > 0,
    `Courses lengths: ${replayCoursesLengths.slice(0, 5).join(", ")}...`
  );

  // Test C2: High-concurrency hostile token burst (50 concurrent invalid/SQLi requests)
  console.log("  Testing 50 concurrent hostile requests in parallel...");
  const hostilePayloads = [
    "Bearer ' OR 1=1 --",
    "Bearer not-a-jwt",
    "Bearer eyJhbGciOiJIUzI1NiJ9.invalid.sig",
    "Bearer ",
    "Bearer '; DROP TABLE users; --"
  ];

  const startHostile = Date.now();
  const hostilePromises = Array.from({ length: burstCount }, (_, i) => {
    const payload = hostilePayloads[i % hostilePayloads.length];
    return fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      headers: { Authorization: payload },
    }).then(async (res) => ({
      index: i,
      status: res.status,
      data: await res.json(),
    }));
  });

  const hostileResults = await Promise.all(hostilePromises);
  const hostileDuration = Date.now() - startHostile;

  const hostile401s = hostileResults.filter((r) => r.status === 401);
  const hostile500s = hostileResults.filter((r) => r.status === 500);

  recordResult(
    "concurrencyTests",
    `50 concurrent hostile token requests: 100% return HTTP 401 (completed in ${hostileDuration}ms)`,
    hostile401s.length === burstCount,
    `401s: ${hostile401s.length}/${burstCount}, 500s: ${hostile500s.length}`
  );

  recordResult(
    "concurrencyTests",
    "50 concurrent hostile token requests produce ZERO 500 errors or server crashes",
    hostile500s.length === 0,
    `500 count: ${hostile500s.length}`
  );

  // Test C3: Multi-User Concurrent Context Isolation (Khaled vs Lina simultaneous load)
  console.log("  Testing 50 concurrent requests alternating between Khaled (210027) & Lina (210028)...");
  const isolationPromises = Array.from({ length: 50 }, (_, i) => {
    const isKhaled = i % 2 === 0;
    const token = isKhaled ? validKhaledToken : validLinaToken;
    const expectedEmail = isKhaled ? "khaled.haddad@zuj.edu.jo" : "lina.omar@zuj.edu.jo";

    return fetch(`${BASE_URL}/api/trpc/auth.me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      const data = await res.json();
      const actualEmail = data.result?.data?.json?.email;
      return {
        index: i,
        isKhaled,
        status: res.status,
        expectedEmail,
        actualEmail,
        matches: actualEmail === expectedEmail,
      };
    });
  });

  const isolationResults = await Promise.all(isolationPromises);
  const isolationFailures = isolationResults.filter((r) => !r.matches || r.status !== 200);

  recordResult(
    "concurrencyTests",
    "Multi-User Isolation: 50 concurrent requests maintain 100% user session isolation without cross-bleed",
    isolationFailures.length === 0,
    `Failures: ${isolationFailures.length}/50`
  );

  // Test C4: Interleaved Mixed Load (50 concurrent: alternating valid and hostile tokens)
  console.log("  Testing 50 interleaved mixed requests (alternating valid & hostile)...");
  const mixedPromises = Array.from({ length: 50 }, (_, i) => {
    const isValid = i % 2 === 0;
    const authHeader = isValid ? `Bearer ${validKhaledToken}` : "Bearer ' OR 1=1 --";
    return fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      headers: { Authorization: authHeader },
    }).then((res) => ({
      index: i,
      isValid,
      status: res.status,
    }));
  });

  const mixedResults = await Promise.all(mixedPromises);
  const validRequests = mixedResults.filter((r) => r.isValid);
  const hostileRequests = mixedResults.filter((r) => !r.isValid);

  const validAll200 = validRequests.every((r) => r.status === 200);
  const hostileAll401 = hostileRequests.every((r) => r.status === 401);

  recordResult(
    "concurrencyTests",
    "Interleaved burst: 25/25 valid requests return 200 OK without interference",
    validAll200,
    `Valid passed: ${validRequests.filter((r) => r.status === 200).length}/25`
  );

  recordResult(
    "concurrencyTests",
    "Interleaved burst: 25/25 hostile requests return 401 Unauthorized without session leakage",
    hostileAll401,
    `Hostile rejected: ${hostileRequests.filter((r) => r.status === 401).length}/25`
  );
}

// ============================================================================
// Main Execution & Summary
// ============================================================================
async function main() {
  console.log(cyan("================================================================="));
  console.log(cyan("  Milestone 1 Challenger M1-2: Adversarial Boundary Stress Suite "));
  console.log(cyan("================================================================="));

  await runOriginFuzzingTests();
  const tokens = await runTokenFuzzingTests();
  await runConcurrencyStressTests(tokens);

  console.log(cyan("\n================================================================="));
  console.log(cyan("                          TEST SUMMARY                           "));
  console.log(cyan("================================================================="));
  console.log(`Total Adversarial Checks : ${results.summary.total}`);
  console.log(`Passed                   : ${green(results.summary.passed)}`);
  console.log(`Failed                   : ${results.summary.failed > 0 ? red(results.summary.failed) : green("0")}`);

  const verdict = results.summary.failed === 0 ? "APPROVE" : "REJECT";
  console.log(`\nFinal Verdict: ${verdict === "APPROVE" ? green(verdict) : red(verdict)}`);

  // Write JSON output for report generation
  process.stdout.write(`\n__RESULT_JSON__\n${JSON.stringify(results, null, 2)}\n`);

  if (results.summary.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running stress suite:", err);
  process.exit(1);
});
