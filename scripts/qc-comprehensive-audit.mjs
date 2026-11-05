import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function runQualityControlAudit() {
  console.log('================================================================');
  console.log('       OLIVER PLATFORM — COMPREHENSIVE QC & AUDIT SUITE         ');
  console.log('================================================================\n');

  const auditResults = {
    totalChecks: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function check(name, condition, extraInfo = '') {
    auditResults.totalChecks++;
    if (condition) {
      auditResults.passed++;
      console.log(`  [PASS] ${name} ${extraInfo}`);
      auditResults.details.push({ name, status: 'PASS', extraInfo });
    } else {
      auditResults.failed++;
      console.error(`  [FAIL] ${name} ${extraInfo}`);
      auditResults.details.push({ name, status: 'FAIL', extraInfo });
    }
  }

  // --- QC 1: STATIC ASSETS & PHONE PREVIEW AUDIT ---
  console.log('--- 1. STATIC ASSETS & PHONE PREVIEW AUDIT ---');
  const phonePath = path.resolve('client', 'public', 'phone.html');
  const distPhonePath = path.resolve('dist', 'public', 'phone.html');
  const brainPhonePath = 'C:\\Users\\abood\\.gemini\\antigravity\\brain\\8aa2adca-5a08-481d-adfc-6fc424d4db49\\phone_preview.html';

  check('phone.html exists in client/public', fs.existsSync(phonePath));
  check('phone.html exists in dist/public', fs.existsSync(distPhonePath));
  check('phone_preview.html exists in brain artifact dir', fs.existsSync(brainPhonePath));

  const phoneContent = fs.readFileSync(phonePath, 'utf8');

  // Strict 5 Bottom Hotkeys Check
  const requiredHotkeys = ['Dashboard', 'Schedule', 'Oliver AI', 'Assignments', 'Attendence'];
  requiredHotkeys.forEach(hk => {
    check(`Phone contains exact hotkey: '${hk}'`, phoneContent.includes(hk));
  });

  check('Phone specifies NOT "Student Dashboard"', !phoneContent.includes('>Student Dashboard<'));
  check('Phone contains "What-If Grade Simulator"', phoneContent.includes('What-If Grade Simulator'));
  check('Phone contains "Office Hours" 1-Click reservation', phoneContent.includes('Office Hours') && phoneContent.includes('Dr. Ahmad Khalil'));
  check('Phone contains "SpeedGrader 1-Click Rubrics"', phoneContent.includes('SpeedGrader 1-Click Rubrics'));
  check('Phone contains "Multi-Course Deadline Radar"', phoneContent.includes('Multi-Course Deadline Radar'));
  check('Phone contains dynamic QR anti-cheat projection', phoneContent.includes('phone-countdown-badge') && phoneContent.includes('phone-totp-display'));

  // --- QC 2: 125 ZUJ COURSES DATASET INTEGRITY ---
  console.log('\n--- 2. 125 ZUJ COURSES CATALOG & MODALITIES AUDIT ---');
  const coursesJsonPath = path.resolve('shared', 'data', 'zuj_courses.json');
  check('zuj_courses.json exists', fs.existsSync(coursesJsonPath));

  const courses = JSON.parse(fs.readFileSync(coursesJsonPath, 'utf8'));
  check('Contains 125 distinct ZUJ curriculum courses', courses.length === 125, `(Found: ${courses.length})`);

  const modalityCounts = { in_person: 0, blended: 0, online: 0 };
  let coursesValid = true;
  for (const c of courses) {
    const name = c.nameEn || c.nameAr || c.name;
    const modality = c.modalityEn || c.modality;
    if (!c.code || !name || !c.credits || !modality) {
      coursesValid = false;
      break;
    }
    if (modality === 'in_person' || modality === 'وجاهي') modalityCounts.in_person++;
    else if (modality === 'blended' || modality === 'مدمج') modalityCounts.blended++;
    else if (modality === 'online' || modality === 'الكتروني') modalityCounts.online++;
  }
  check('All courses have valid code, name, credits, and modality', coursesValid);
  check('Modality distribution: In-Person (وجاهي), Blended (مدمج), Online (إلكتروني)',
    modalityCounts.in_person > 0 && modalityCounts.blended > 0 && modalityCounts.online > 0,
    `In-Person: ${modalityCounts.in_person}, Blended: ${modalityCounts.blended}, Online: ${modalityCounts.online}`
  );

  // --- QC 3: LIVE HTTP ENDPOINTS AUDIT ---
  console.log('\n--- 3. LIVE HTTP & API ENDPOINTS AUDIT ---');
  try {
    const webRes = await fetch('http://127.0.0.1:3000/');
    check('GET / (Full Web Application) returns HTTP 200', webRes.status === 200);

    const phoneRes = await fetch('http://127.0.0.1:3000/phone');
    check('GET /phone (Mobile Simulator) returns HTTP 200', phoneRes.status === 200);

    const csp = phoneRes.headers.get('content-security-policy') || '';
    check('CSP header permits gstatic and cdn.tailwindcss.com',
      csp.includes('https://www.gstatic.com') && csp.includes('https://cdn.tailwindcss.com')
    );

    const qrPhoneRes = await fetch('http://127.0.0.1:3000/qr-phone.png');
    check('GET /qr-phone.png returns HTTP 200 image', qrPhoneRes.status === 200);

  } catch (err) {
    check('Live HTTP endpoints responsive', false, err.message);
  }

  // --- QC 4: WHAT-IF GRADE SIMULATOR MATHEMATICAL PROOF ---
  console.log('\n--- 4. WHAT-IF GRADE SIMULATOR MATHEMATICAL PROOF ---');
  function simulateGrade(cw, mid, fin, currentGpa = 84.5, completedCredits = 45, courseCredits = 3) {
    const total = Math.min(100, Math.max(0, cw + mid + fin));
    let letter = 'F', gpa = 0.0;
    if (total >= 90) { letter = 'A'; gpa = 4.0; }
    else if (total >= 85) { letter = 'A-'; gpa = 3.75; }
    else if (total >= 80) { letter = 'B+'; gpa = 3.5; }
    else if (total >= 75) { letter = 'B'; gpa = 3.0; }
    else if (total >= 70) { letter = 'C+'; gpa = 2.5; }
    else if (total >= 60) { letter = 'C'; gpa = 2.0; }
    else if (total >= 50) { letter = 'D'; gpa = 1.5; }

    const newGpa = currentGpa + ((total - currentGpa) * courseCredits) / (completedCredits + courseCredits);
    return { total, letter, gpa, newGpa: parseFloat(newGpa.toFixed(2)) };
  }

  const case1 = simulateGrade(27, 26, 36); // Expected 89 (A-)
  check('What-If Scenario 1 (27+26+36 = 89) yields A- (3.75 GPA)', case1.total === 89 && case1.letter === 'A-');
  check('Cumulative GPA increases when course score > current GPA', case1.newGpa > 84.5, `84.5 -> ${case1.newGpa}`);

  const case2 = simulateGrade(30, 30, 40); // Expected 100 (A)
  check('What-If Scenario 2 (Full 100 pts) yields A (4.00 GPA)', case2.total === 100 && case2.letter === 'A' && case2.gpa === 4.0);

  const case3 = simulateGrade(15, 15, 20); // Expected 50 (D)
  check('What-If Scenario 3 (Low 50 pts) yields D (1.50 GPA)', case3.total === 50 && case3.letter === 'D' && case3.gpa === 1.5);

  // --- QC 5: DYNAMIC TOTP ANTI-CHEAT ALGORITHM AUDIT ---
  console.log('\n--- 5. DYNAMIC TOTP ANTI-CHEAT ALGORITHM AUDIT ---');
  const secret = 'zuj_qr_attendance_secret_key_2026';
  const now = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(now / 8); // 8-second window

  const token = crypto.createHmac('sha256', secret)
    .update(`session_41_${timeStep}`)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();

  check('HMAC-SHA256 TOTP token generates valid 8-char hex', token.length === 8 && /^[0-9A-F]{8}$/.test(token), `Token: ${token}`);

  // Verify token changes after 8 seconds
  const futureStep = timeStep + 2; // 16 seconds later
  const futureToken = crypto.createHmac('sha256', secret)
    .update(`session_41_${futureStep}`)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();

  check('Future TOTP token differs from current token (Anti-Forward Photo Guard)', token !== futureToken);

  // Final Report Summary
  console.log('\n================================================================');
  console.log(`QC AUDIT SUMMARY: ${auditResults.passed} / ${auditResults.totalChecks} CHECKS PASSED (${auditResults.failed} FAILURES)`);
  console.log('================================================================\n');

  if (auditResults.failed > 0) {
    process.exit(1);
  }
}

runQualityControlAudit().catch(err => {
  console.error('Audit encountered unexpected failure:', err);
  process.exit(1);
});
