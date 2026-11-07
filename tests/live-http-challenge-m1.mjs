/**
 * Empirical Challenge Harness for Milestone 1: Backend Network & Dual-Auth Readiness
 * 
 * Verifies live HTTP behavior of server running at http://localhost:3000
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const results = [];

function recordResult(testName, passed, details) {
  results.push({ testName, passed, details });
  const symbol = passed ? 'PASS [OK]' : 'FAIL [X]';
  console.log(`${symbol} - ${testName}`);
  if (details) {
    console.log(`   Details: ${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}`);
  }
}

async function runChallenge() {
  console.log(`================================================================`);
  console.log(`Running Empirical Challenge Test Suite on ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`================================================================\n`);

  // -------------------------------------------------------------------------
  // 1. OPTIONS Preflight Verification
  // -------------------------------------------------------------------------
  console.log(`--- SECTION 1: OPTIONS Preflight Verification ---`);
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'capacitor://localhost',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, x-trpc-source',
      },
    });

    const status = res.status;
    const allowOrigin = res.headers.get('access-control-allow-origin');
    const allowCredentials = res.headers.get('access-control-allow-credentials');
    const allowHeaders = res.headers.get('access-control-allow-headers');
    const allowMethods = res.headers.get('access-control-allow-methods');
    const maxAge = res.headers.get('access-control-max-age');
    const vary = res.headers.get('vary');
    const bodyText = await res.text();

    const statusPass = status === 204;
    const originPass = allowOrigin === 'capacitor://localhost';
    const credsPass = allowCredentials === 'true';
    const headersPass = allowHeaders && 
      allowHeaders.includes('Content-Type') && 
      allowHeaders.includes('Authorization') && 
      allowHeaders.includes('x-trpc-source');
    const bodyEmpty = bodyText.length === 0;

    recordResult('OPTIONS Preflight status is 204 No Content', statusPass, { status });
    recordResult('OPTIONS Preflight Access-Control-Allow-Origin is capacitor://localhost', originPass, { allowOrigin });
    recordResult('OPTIONS Preflight Access-Control-Allow-Credentials is true', credsPass, { allowCredentials });
    recordResult('OPTIONS Preflight Access-Control-Allow-Headers contains required headers', !!headersPass, { allowHeaders });
    recordResult('OPTIONS Preflight body is completely empty (no payload)', bodyEmpty, { bodyLength: bodyText.length });
    recordResult('OPTIONS Preflight Max-Age and Vary headers set', maxAge === '86400' && vary === 'Origin', { maxAge, vary });
  } catch (err) {
    recordResult('OPTIONS Preflight execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 2. Real User Login Verification (POST /api/trpc/auth.login)
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 2: Real User Login Verification ---`);
  let khaledToken = null;
  let hananToken = null;
  let khaledUser = null;
  let hananUser = null;

  // Test User 1: khaled.haddad@zuj.edu.jo
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'capacitor://localhost',
      },
      body: JSON.stringify({
        json: {
          email: 'khaled.haddad@zuj.edu.jo',
          password: 'password123',
        },
      }),
    });

    const status = res.status;
    const data = await res.json();
    const loginPayload = data?.result?.data?.json;
    khaledToken = loginPayload?.token;
    khaledUser = loginPayload?.user;

    recordResult('POST auth.login for khaled.haddad@zuj.edu.jo status 200', status === 200, { status });
    recordResult('POST auth.login returns success: true', loginPayload?.success === true, { success: loginPayload?.success });
    recordResult('POST auth.login returns non-empty JWT token string', typeof khaledToken === 'string' && khaledToken.split('.').length === 3, {
      tokenType: typeof khaledToken,
      jwtSegments: khaledToken ? khaledToken.split('.').length : 0,
      tokenPreview: khaledToken ? `${khaledToken.slice(0, 15)}...${khaledToken.slice(-10)}` : null,
    });
    recordResult('POST auth.login returns complete user profile', !!(khaledUser && khaledUser.id && khaledUser.email === 'khaled.haddad@zuj.edu.jo'), {
      user: khaledUser,
    });
  } catch (err) {
    recordResult('POST auth.login for khaled.haddad execution', false, err.message);
  }

  // Test User 2: hanan@gmail.com
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'capacitor://localhost',
      },
      body: JSON.stringify({
        json: {
          email: 'hanan@gmail.com',
          password: 'password123',
        },
      }),
    });

    const status = res.status;
    const data = await res.json();
    const loginPayload = data?.result?.data?.json;
    hananToken = loginPayload?.token;
    hananUser = loginPayload?.user;

    recordResult('POST auth.login for hanan@gmail.com status 200', status === 200, { status });
    recordResult('POST auth.login returns token for Hanan', typeof hananToken === 'string' && hananToken.length > 20, {
      tokenPreview: hananToken ? `${hananToken.slice(0, 15)}...${hananToken.slice(-10)}` : null,
    });
    recordResult('POST auth.login returns profile for Hanan', !!(hananUser && hananUser.email === 'hanan@gmail.com'), {
      user: hananUser,
    });
  } catch (err) {
    recordResult('POST auth.login for hanan@gmail.com execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 3. GET /api/trpc/auth.me with Bearer token & NO cookie
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 3: GET /api/trpc/auth.me Dual-Auth (Bearer, No Cookie) ---`);
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/auth.me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${khaledToken}`,
        'Origin': 'capacitor://localhost',
      },
    });

    const status = res.status;
    const data = await res.json();
    const user = data?.result?.data?.json;

    recordResult('GET auth.me with Bearer token (no cookie) status 200', status === 200, { status });
    recordResult('GET auth.me returns correct user identity (Khaled Haddad)', user && user.email === 'khaled.haddad@zuj.edu.jo', {
      name: user?.name,
      email: user?.email,
      role: user?.role,
    });
    recordResult('GET auth.me response has CORS allow-origin', res.headers.get('access-control-allow-origin') === 'capacitor://localhost', {
      corsOrigin: res.headers.get('access-control-allow-origin'),
    });
  } catch (err) {
    recordResult('GET auth.me execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 4. GET /api/trpc/student.myCourses with Bearer token
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 4: GET /api/trpc/student.myCourses with Bearer token ---`);
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${khaledToken}`,
        'Origin': 'capacitor://localhost',
      },
    });

    const status = res.status;
    const data = await res.json();
    const courses = data?.result?.data?.json;

    recordResult('GET student.myCourses with Bearer token status 200', status === 200, { status });
    recordResult('GET student.myCourses returns array of enrolled courses', Array.isArray(courses) && courses.length > 0, {
      courseCount: Array.isArray(courses) ? courses.length : null,
      firstCourse: courses?.[0]?.name || courses?.[0]?.courseName || courses?.[0]?.courseCode || courses?.[0],
    });
  } catch (err) {
    recordResult('GET student.myCourses execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 5. Unauthenticated / Invalid Token Rejection (401 UNAUTHORIZED)
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 5: Unauthenticated and Invalid Token Rejection ---`);
  // 5a. No credentials at all
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      method: 'GET',
      headers: {
        'Origin': 'capacitor://localhost',
      },
    });

    const status = res.status;
    const data = await res.json();
    const errorCode = data?.error?.json?.code || data?.error?.json?.data?.code;

    recordResult('GET student.myCourses with NO credentials returns HTTP 401', status === 401, {
      status,
      errorCode,
      errorMessage: data?.error?.json?.message,
    });
    recordResult('GET student.myCourses error code is UNAUTHORIZED (-32001 / UNAUTHORIZED)', 
      errorCode === -32001 || data?.error?.json?.data?.httpStatus === 401 || data?.error?.json?.data?.code === 'UNAUTHORIZED', {
      errorCode,
      httpStatus: data?.error?.json?.data?.httpStatus,
    });
  } catch (err) {
    recordResult('GET student.myCourses with NO credentials execution', false, err.message);
  }

  // 5b. Invalid / garbage Bearer token
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid.garbage.token123',
        'Origin': 'capacitor://localhost',
      },
    });

    const status = res.status;
    const data = await res.json();
    const errorCode = data?.error?.json?.code || data?.error?.json?.data?.code;

    recordResult('GET student.myCourses with garbage token returns HTTP 401', status === 401, {
      status,
      errorCode,
      errorMessage: data?.error?.json?.message,
    });
  } catch (err) {
    recordResult('GET student.myCourses with garbage token execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 6. Adversarial Stress Tests: Malformed Headers & Schemes
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 6: Adversarial Stress Tests (Headers & Schemes) ---`);
  
  // 6a. Malformed Bearer header: whitespace only
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      headers: { 'Authorization': 'Bearer    ' },
    });
    recordResult('Malformed Authorization: "Bearer   " rejected with 401 (not 500)', res.status === 401, { status: res.status });
  } catch (err) {
    recordResult('Malformed Bearer whitespace test', false, err.message);
  }

  // 6b. Non-Bearer authorization scheme (Basic auth)
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/student.myCourses`, {
      headers: { 'Authorization': 'Basic dXNlcjpwYXNzd29yZA==' },
    });
    recordResult('Non-Bearer Authorization: "Basic ..." rejected with 401 (not 500)', res.status === 401, { status: res.status });
  } catch (err) {
    recordResult('Non-Bearer scheme test', false, err.message);
  }

  // 6c. Lowercase header name & scheme: "authorization: bearer <token>"
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/auth.me`, {
      headers: { 'authorization': `bearer ${khaledToken}` },
    });
    const data = await res.json();
    const user = data?.result?.data?.json;
    recordResult('Case-insensitive "bearer <token>" correctly recognized', res.status === 200 && user?.email === 'khaled.haddad@zuj.edu.jo', {
      status: res.status,
      user: user?.name,
    });
  } catch (err) {
    recordResult('Case-insensitive bearer test', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 7. Adversarial Origin Permissiveness Matrix
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 7: Adversarial Origin Matrix ---`);
  const originsToTest = [
    { origin: 'ionic://localhost', expectedAllowed: true, label: 'Ionic Localhost' },
    { origin: 'http://172.20.10.4:3000', expectedAllowed: true, label: 'Hotspot IP 172.20.10.4' },
    { origin: 'http://172.20.10.1:3000', expectedAllowed: true, label: 'Hotspot Gateway 172.20.10.1' },
    { origin: 'http://192.168.1.50:3000', expectedAllowed: true, label: 'Private LAN 192.168.1.50' },
    { origin: 'http://10.0.0.1:3000', expectedAllowed: true, label: 'Private Subnet 10.0.0.1' },
  ];

  for (const item of originsToTest) {
    try {
      const res = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': item.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, x-trpc-source',
        },
      });
      const allowOrigin = res.headers.get('access-control-allow-origin');
      const passed = res.status === 204 && allowOrigin === item.origin;
      recordResult(`Origin Matrix: ${item.label} (${item.origin})`, passed, {
        status: res.status,
        allowOrigin,
      });
    } catch (err) {
      recordResult(`Origin Matrix: ${item.label}`, false, err.message);
    }
  }

  // -------------------------------------------------------------------------
  // 8. Dual-Auth Priority Test: Bearer Token vs Conflicting / Invalid Cookie
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 8: Dual-Auth Priority Verification ---`);
  try {
    // Pass Bearer token for Khaled, but an invalid/expired cookie
    const res = await fetch(`${BASE_URL}/api/trpc/auth.me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${khaledToken}`,
        'Cookie': 'murshid_session=invalid_junk_cookie_here; Path=/',
        'Origin': 'capacitor://localhost',
      },
    });

    const status = res.status;
    const data = await res.json();
    const user = data?.result?.data?.json;

    recordResult('Bearer token takes precedence over junk session cookie', status === 200 && user?.email === 'khaled.haddad@zuj.edu.jo', {
      status,
      user: user?.name,
      email: user?.email,
    });
  } catch (err) {
    recordResult('Bearer priority over cookie execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 9. Login Error Handling: Invalid Password and Non-existent User
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 9: Login Error Handling ---`);
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          email: 'khaled.haddad@zuj.edu.jo',
          password: 'WRONG_PASSWORD_6789',
        },
      }),
    });

    const status = res.status;
    const data = await res.json();
    const isError = status >= 400 && status < 500;
    recordResult('Login with incorrect password returns 4xx client error (not 500)', isError, {
      status,
      errorMessage: data?.error?.json?.message,
    });
  } catch (err) {
    recordResult('Login wrong password execution', false, err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          email: 'nonexistent.student.999@zuj.edu.jo',
          password: 'password123',
        },
      }),
    });

    const status = res.status;
    const data = await res.json();
    const isError = status >= 400 && status < 500;
    recordResult('Login with non-existent email returns 4xx client error (not 500)', isError, {
      status,
      errorMessage: data?.error?.json?.message,
    });
  } catch (err) {
    recordResult('Login non-existent email execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 10. Content Security Policy Header Validation
  // -------------------------------------------------------------------------
  console.log(`\n--- SECTION 10: Content Security Policy Verification ---`);
  try {
    const res = await fetch(`${BASE_URL}/api/trpc/aiChat.getStatus`);
    const csp = res.headers.get('content-security-policy');
    const hasConnectSrc = csp && csp.includes("connect-src 'self' https: http: capacitor: ionic: ws: wss:;");
    const hasImgSrc = csp && csp.includes("img-src 'self' data: https: http: blob: capacitor: ionic:;");

    recordResult('CSP connect-src includes http: capacitor: ionic: ws: wss:', !!hasConnectSrc, {
      connectSrcValid: !!hasConnectSrc,
    });
    recordResult('CSP img-src includes http: blob: capacitor: ionic:', !!hasImgSrc, {
      imgSrcValid: !!hasImgSrc,
    });
  } catch (err) {
    recordResult('CSP header check execution', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Summary & Statistics
  // -------------------------------------------------------------------------
  console.log(`\n================================================================`);
  console.log(`EMPIRICAL CHALLENGE SUITE SUMMARY`);
  console.log(`================================================================`);
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total tests executed: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log(`\nFAILED TESTS:`);
    results.filter(r => !r.passed).forEach(r => console.log(`- ${r.testName}: ${JSON.stringify(r.details)}`));
    process.exitCode = 1;
  } else {
    console.log(`\nALL EMPIRICAL TESTS PASSED!`);
    process.exitCode = 0;
  }

  return { total, passed, failed, results };
}

runChallenge().catch(err => {
  console.error('FATAL UNCAUGHT ERROR:', err);
  process.exit(1);
});
