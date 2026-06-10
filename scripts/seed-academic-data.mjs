import "dotenv/config";
import mysql from "mysql2/promise";
import crypto from "crypto";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 210_000, 64, "sha512").toString("hex");
  return `pbkdf2:sha512:210000:${salt}:${hash}`;
}

const SEED_PASSWORD = hashPassword("password123");

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateEmail = (name) => name.toLowerCase().replace(/\s+/g, ".") + "@zuj.edu.jo";

const firstNames = [
  "Ahmad","Mohammad","Omar","Ali","Yousef","Khaled","Hassan","Ibrahim",
  "Sara","Lina","Rana","Hala","Nour","Dana","Maya","Rima","Fatima",
  "Zaid","Tariq","Basma",
];
const lastNames = [
  "Khalil","Mahmoud","Hassan","Abed","Saleh","Omar","Faris","Nasser",
  "Jaber","Hussein","Ahmad","Khatib","Baker","Sabbah","Rashid",
  "Mansour","Haddad","Suleiman","Zahran","Qasim",
];

const courseCatalog = [
  { code: "CS101", name: "Introduction to Computing", credits: 3, semester: 1, required: true },
  { code: "MATH101", name: "Calculus I", credits: 3, semester: 1, required: true },
  { code: "ENG101", name: "English Composition", credits: 3, semester: 1, required: true },
  { code: "PHYS101", name: "General Physics I", credits: 3, semester: 1, required: true },
  { code: "CS102", name: "Programming Fundamentals", credits: 3, semester: 2, required: true },
  { code: "MATH102", name: "Calculus II", credits: 3, semester: 2, required: true },
  { code: "ENG102", name: "Technical Writing", credits: 3, semester: 2, required: true },
  { code: "PHYS102", name: "General Physics II", credits: 3, semester: 2, required: true },
  { code: "CS201", name: "Data Structures", credits: 3, semester: 3, required: true },
  { code: "CS202", name: "Object Oriented Programming", credits: 3, semester: 3, required: true },
  { code: "MATH201", name: "Discrete Mathematics", credits: 3, semester: 3, required: true },
  { code: "STAT201", name: "Probability & Statistics", credits: 3, semester: 3, required: true },
  { code: "CS203", name: "Algorithms", credits: 3, semester: 4, required: true },
  { code: "CS204", name: "Database Systems", credits: 3, semester: 4, required: true },
  { code: "CS205", name: "Computer Architecture", credits: 3, semester: 4, required: true },
  { code: "MATH202", name: "Linear Algebra", credits: 3, semester: 4, required: true },
  { code: "CS301", name: "Operating Systems", credits: 3, semester: 5, required: true },
  { code: "CS302", name: "Software Engineering", credits: 3, semester: 5, required: true },
  { code: "CS303", name: "Web Development", credits: 3, semester: 5, required: false },
  { code: "NET301", name: "Computer Networks", credits: 3, semester: 5, required: true },
  { code: "CS304", name: "Artificial Intelligence", credits: 3, semester: 6, required: true },
  { code: "CS305", name: "Machine Learning", credits: 3, semester: 6, required: false },
  { code: "SEC301", name: "Cybersecurity Fundamentals", credits: 3, semester: 6, required: false },
  { code: "CS306", name: "Mobile App Development", credits: 3, semester: 6, required: false },
  { code: "CS401", name: "Cloud Computing", credits: 3, semester: 7, required: false },
  { code: "CS402", name: "Big Data Analytics", credits: 3, semester: 7, required: false },
  { code: "CS403", name: "Human Computer Interaction", credits: 3, semester: 7, required: false },
  { code: "CS499", name: "Capstone Project I", credits: 3, semester: 7, required: true },
  { code: "CS404", name: "Distributed Systems", credits: 3, semester: 8, required: false },
  { code: "CS405", name: "Information Retrieval", credits: 3, semester: 8, required: false },
  { code: "CS406", name: "Computer Vision", credits: 3, semester: 8, required: false },
  { code: "CS500", name: "Capstone Project II", credits: 3, semester: 8, required: true },
];

const gradePools = {
  excellent: [
    { grade: "A", points: "4.00" }, { grade: "A", points: "4.00" },
    { grade: "A-", points: "3.67" }, { grade: "A-", points: "3.67" },
    { grade: "B+", points: "3.33" },
  ],
  average: [
    { grade: "B+", points: "3.33" }, { grade: "B", points: "3.00" },
    { grade: "B", points: "3.00" }, { grade: "B-", points: "2.67" },
    { grade: "C+", points: "2.33" },
  ],
  atRisk: [
    { grade: "C+", points: "2.33" }, { grade: "C", points: "2.00" },
    { grade: "C-", points: "1.67" }, { grade: "D+", points: "1.33" },
    { grade: "D", points: "1.00" }, { grade: "F", points: "0.00" },
  ],
  nearGrad: [
    { grade: "A-", points: "3.67" }, { grade: "B+", points: "3.33" },
    { grade: "B", points: "3.00" }, { grade: "B+", points: "3.33" },
    { grade: "A", points: "4.00" },
  ],
};

const attendancePools = {
  excellent: ["present","present","present","present","excused","present","present","late"],
  average: ["present","present","absent","present","late","present","excused","present","absent"],
  atRisk: ["present","absent","absent","late","present","absent","present","late","absent","present"],
  nearGrad: ["present","present","present","excused","present","present","late","present"],
};

let studentTypes = [
  ...Array(5).fill("excellent"),
  ...Array(8).fill("average"),
  ...Array(4).fill("atRisk"),
  ...Array(3).fill("nearGrad"),
];
for (let i = studentTypes.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [studentTypes[i], studentTypes[j]] = [studentTypes[j], studentTypes[i]];
}

const semestersCompleted = {
  excellent: () => randInt(3, 5),
  average: () => randInt(2, 5),
  atRisk: () => randInt(1, 4),
  nearGrad: () => randInt(6, 7),
};

console.log("Cleaning existing academic data...");
await conn.execute("DELETE FROM studentAchievements");
await conn.execute("DELETE FROM achievements");
await conn.execute("DELETE FROM advisorReports");
await conn.execute("DELETE FROM appointments");
await conn.execute("DELETE FROM recommendations");
await conn.execute("DELETE FROM academicAlerts");
await conn.execute("DELETE FROM advisorNotes");
await conn.execute("DELETE FROM studentAssignments");
await conn.execute("DELETE FROM assignments");
await conn.execute("DELETE FROM attendance");
await conn.execute("DELETE FROM courseSchedules");
await conn.execute("DELETE FROM studentCourses");
await conn.execute("DELETE FROM studyPlans");
await conn.execute("DELETE FROM coursePrerequisites");
await conn.execute("DELETE FROM courses");
await conn.execute("DELETE FROM users WHERE role IN ('student','advisor')");

let [deptRows] = await conn.execute("SELECT id FROM departments WHERE code = 'CS' LIMIT 1");
let csDeptId = deptRows[0]?.id;
if (!csDeptId) {
  const [res] = await conn.execute(
    `INSERT INTO departments (name, nameAr, code, description, descriptionAr) VALUES (?, ?, ?, ?, ?)`,
    ["Computer Science", "علوم الحاسوب", "CS", "CS Department", "قسم علوم الحاسوب"]
  );
  csDeptId = res.insertId;
}

const advisors = [
  { name: "Dr. Ahmad Khalil", email: "a.khalil@zuj.edu.jo", bio: "AI and Machine Learning professor." },
  { name: "Dr. Sara Mahmoud", email: "s.mahmoud@zuj.edu.jo", bio: "Software Engineering specialist." },
  { name: "Dr. Omar Hassan", email: "o.hassan@zuj.edu.jo", bio: "Cybersecurity and Networks lecturer." },
];
const advisorIds = [];
for (const a of advisors) {
  const [res] = await conn.execute(
    `INSERT INTO users (openId, email, name, password, role, departmentId, bio, isActive, isEmailVerified, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, true, true, 'en')`,
    [`advisor_${a.email}`, a.email, a.name, SEED_PASSWORD, "advisor", csDeptId, a.bio]
  );
  advisorIds.push(res.insertId);
  console.log(`Advisor: ${a.name} (ID: ${res.insertId})`);
}

const courseIdMap = new Map();
for (const c of courseCatalog) {
  const [res] = await conn.execute(
    `INSERT INTO courses (code, name, nameAr, description, descriptionAr, credits, departmentId, semester, isRequired)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [c.code, c.name, c.name + " (AR)", `Course ${c.code}`, `Course ${c.code} (AR)`, c.credits, csDeptId, c.semester, c.required]
  );
  courseIdMap.set(c.code, res.insertId);
}

const prereqChains = [
  ["CS101","CS102"],["CS102","CS201"],["CS201","CS203"],
  ["CS203","CS301"],["CS204","CS302"],["MATH101","MATH102"],
  ["MATH102","MATH201"],["CS102","CS202"],["CS202","CS204"],["CS301","CS304"],
];
for (const [before, after] of prereqChains) {
  const bId = courseIdMap.get(before);
  const aId = courseIdMap.get(after);
  if (bId && aId) await conn.execute(`INSERT INTO coursePrerequisites (courseId, prerequisiteId) VALUES (?, ?)`, [aId, bId]);
}

const [roomRows] = await conn.execute("SELECT id FROM rooms LIMIT 5");
let roomIds = roomRows.map((r) => r.id);
if (roomIds.length === 0) {
  const [bRows] = await conn.execute("SELECT id FROM buildings LIMIT 1");
  const bId = bRows[0]?.id;
  if (bId) {
    for (let i = 1; i <= 5; i++) {
      const [res] = await conn.execute(
        `INSERT INTO rooms (buildingId, roomNumber, name, nameAr, capacity, type, floor) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bId, `10${i}`, `Room 10${i}`, `قاعة 10${i}`, 30 + i * 5, "classroom", 1]
      );
      roomIds.push(res.insertId);
    }
  }
}
if (roomIds.length === 0) roomIds = [1, 2, 3, 4, 5];

const dayTimeSlots = [
  { day: 0, start: "09:00", end: "10:30" }, { day: 0, start: "11:00", end: "12:30" },
  { day: 1, start: "09:00", end: "10:30" }, { day: 1, start: "13:00", end: "14:30" },
  { day: 2, start: "10:00", end: "11:30" }, { day: 2, start: "12:00", end: "13:30" },
  { day: 3, start: "09:00", end: "10:30" }, { day: 3, start: "11:00", end: "12:30" },
  { day: 4, start: "09:00", end: "10:30" }, { day: 4, start: "13:00", end: "14:30" },
];
const allCourseIds = Array.from(courseIdMap.values());
for (let i = 0; i < allCourseIds.length; i++) {
  const slot = dayTimeSlots[i % dayTimeSlots.length];
  await conn.execute(
    `INSERT INTO courseSchedules (courseId, dayOfWeek, startTime, endTime, roomId) VALUES (?, ?, ?, ?, ?)`,
    [allCourseIds[i], slot.day, slot.start, slot.end, roomIds[i % roomIds.length]]
  );
}

// ─── 20 Students ─────────────────────────────────────────────
const students = [];
for (let i = 0; i < 20; i++) {
  const type = studentTypes[i];
  const first = rand(firstNames);
  const last = rand(lastNames);
  const fullName = `${first} ${last}`;
  const email = generateEmail(fullName);
  const num = 20230000 + i + 1;
  const advisorId = advisorIds[i % advisorIds.length];
  const completedSem = semestersCompleted[type]();
  const completedCount = completedSem * 4 + randInt(0, 2);
  const completedCredits = Math.min(completedCount * 3, 132);
  const currentSem = completedSem + 1;

  const pool = gradePools[type];
  let tp = 0, tc = 0;
  for (let j = 0; j < completedCount; j++) {
    const g = rand(pool);
    tp += parseFloat(g.points) * 3;
    tc += 3;
  }
  const gpa = tc > 0 ? (tp / tc).toFixed(2) : "0.00";

  const attPool = attendancePools[type];
  const presentCnt = attPool.filter((s) => s === "present" || s === "excused").length;
  const attRate = Math.round((presentCnt / attPool.length) * 100);

  let status = "good";
  if (parseFloat(gpa) < 2.0) status = "probation";
  else if (parseFloat(gpa) < 2.5) status = "warning";
  else if (parseFloat(gpa) >= 3.5) status = "excellent";

  const [res] = await conn.execute(
    `INSERT INTO users (openId, email, name, password, role, advisorId, departmentId, isActive, isEmailVerified, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, true, true, 'en')`,
    [`student_${num}`, email, fullName, SEED_PASSWORD, "student", advisorId, csDeptId]
  );
  const studentId = res.insertId;
  students.push({ id: studentId, name: fullName, email, num, type, advisorId, completedSem, completedCount, completedCredits, currentSem, gpa, attRate, status, pool });
  console.log(`Student ${i + 1}/20: ${fullName} (${type}, GPA ${gpa}, Sem ${currentSem})`);
}

// Study Plans
for (const s of students) {
  await conn.execute(
    `INSERT INTO studyPlans (studentId, totalCredits, completedCredits, currentGPA, status) VALUES (?, ?, ?, ?, ?)`,
    [s.id, 132, s.completedCredits, s.gpa, s.completedCredits >= 132 ? "completed" : "active"]
  );
}

// Enrollments
for (const s of students) {
  const coursesToTake = courseCatalog.slice(0, s.completedCount + 4);
  for (let ci = 0; ci < coursesToTake.length; ci++) {
    const c = coursesToTake[ci];
    const courseId = courseIdMap.get(c.code);
    const isCompleted = ci < s.completedCount;
    const status = isCompleted ? "completed" : "in_progress";
    const grade = isCompleted ? rand(s.pool).grade : null;
    const points = isCompleted ? rand(s.pool).points : null;
    await conn.execute(
      `INSERT INTO studentCourses (studentId, courseId, semester, grade, gradePoints, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.id, courseId, c.semester, grade, points, status]
    );
  }
}
console.log("Enrollments done.");

// Assignments per course
const assignmentTmpl = [
  { title: "Assignment 1", titleAr: "واجب 1", dueDays: -2 },
  { title: "Assignment 2", titleAr: "واجب 2", dueDays: 5 },
  { title: "Midterm Project", titleAr: "مشروع منتصف الفصل", dueDays: 14 },
  { title: "Lab Report", titleAr: "تقرير المختبر", dueDays: 7 },
  { title: "Research Paper", titleAr: "ورقة بحثية", dueDays: 21 },
];
const assignmentIdsByCourse = new Map();
for (const c of courseCatalog) {
  const courseId = courseIdMap.get(c.code);
  const ids = [];
  for (const t of assignmentTmpl) {
    const due = new Date(); due.setDate(due.getDate() + t.dueDays);
    const [res] = await conn.execute(
      `INSERT INTO assignments (courseId, title, titleAr, dueDate, totalPoints) VALUES (?, ?, ?, ?, ?)`,
      [courseId, t.title, t.titleAr, due, 100]
    );
    ids.push(res.insertId);
  }
  assignmentIdsByCourse.set(courseId, ids);
}

// Student assignments
for (const s of students) {
  const [rows] = await conn.execute(`SELECT courseId FROM studentCourses WHERE studentId = ? AND status = 'in_progress'`, [s.id]);
  for (const r of rows) {
    for (const assignmentId of (assignmentIdsByCourse.get(r.courseId) || [])) {
      const roll = Math.random();
      let status = "pending";
      let score = null;
      if (roll < 0.45) { status = "submitted"; score = randInt(60, 100); }
      else if (roll < 0.55 && s.type === "atRisk") { status = "overdue"; }
      await conn.execute(
        `INSERT INTO studentAssignments (studentId, assignmentId, status, score) VALUES (?, ?, ?, ?)`,
        [s.id, assignmentId, status, score]
      );
    }
  }
}
console.log("Student assignments done.");

// Attendance
for (const s of students) {
  const [rows] = await conn.execute(
    `SELECT sc.courseId, cs.id as scheduleId FROM studentCourses sc JOIN courseSchedules cs ON cs.courseId = sc.courseId WHERE sc.studentId = ? AND sc.status IN ('completed','in_progress')`,
    [s.id]
  );
  const pool = attendancePools[s.type];
  for (const r of rows) {
    for (let i = 0; i < 20; i++) {
      const date = new Date(); date.setDate(date.getDate() - i * 2);
      await conn.execute(
        `INSERT INTO attendance (studentId, courseId, scheduleId, date, status) VALUES (?, ?, ?, ?, ?)`,
        [s.id, r.courseId, r.scheduleId, date, pool[i % pool.length]]
      );
    }
  }
}
console.log("Attendance done.");

// Academic alerts
const alertData = {
  gpa_drop: { title: "GPA Below Threshold", msg: "Your GPA has fallen below the required minimum." },
  attendance: { title: "Low Attendance Rate", msg: "Your attendance rate is below 75%." },
  missing_assignments: { title: "Missing Assignments", msg: "You have multiple pending assignments." },
  at_risk: { title: "At Risk of Probation", msg: "You are at risk of academic probation." },
  probation: { title: "Academic Probation", msg: "You have been placed on academic probation." },
};
const alertTypes = Object.keys(alertData);
for (const s of students) {
  const n = s.type === "atRisk" ? randInt(2, 4) : s.type === "average" ? randInt(0, 2) : s.type === "excellent" ? 0 : randInt(0, 1);
  for (let i = 0; i < n; i++) {
    const type = rand(alertTypes);
    const sev = s.type === "atRisk" ? rand(["high","critical"]) : rand(["medium","high"]);
    const d = alertData[type];
    await conn.execute(
      `INSERT INTO academicAlerts (advisorId, studentId, title, message, severity, type, isResolved) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [s.advisorId, s.id, d.title, d.msg, sev, type, i === 0]
    );
  }
}
console.log("Alerts done.");

// Recommendations
for (const s of students) {
  const n = randInt(1, 3);
  for (let i = 0; i < n; i++) {
    const c = rand(courseCatalog);
    await conn.execute(
      `INSERT INTO recommendations (advisorId, studentId, courseId, title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [s.advisorId, s.id, courseIdMap.get(c.code), `Consider ${c.name}`, `Recommended: ${c.name}`, rand(["low","medium","high"]), rand(["pending","accepted","completed"])]
    );
  }
}
console.log("Recommendations done.");

// Advisor reports
for (const s of students) {
  const n = randInt(1, 3);
  for (let i = 0; i < n; i++) {
    const sem = Math.max(1, s.currentSem - n + i);
    await conn.execute(
      `INSERT INTO advisorReports (advisorId, studentId, title, summary, gpaAtReport, creditsAtReport, attendanceRateAtReport, riskLevel, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.advisorId, s.id, `Semester ${sem} Report`, `${s.name} is ${s.type === "excellent" ? "excellent" : s.type === "atRisk" ? "concerning" : "satisfactory"}.`, s.gpa, s.completedCredits, s.attRate, s.type === "atRisk" ? "high" : s.type === "average" ? "medium" : "low", sem]
    );
  }
}
console.log("Reports done.");

// Appointments
for (const s of students) {
  const n = randInt(1, 4);
  for (let i = 0; i < n; i++) {
    const d = new Date(); d.setDate(d.getDate() - i * 14 + randInt(-3, 3));
    const status = i === 0 ? "completed" : rand(["scheduled","confirmed","completed"]);
    await conn.execute(
      `INSERT INTO appointments (advisorId, studentId, title, description, scheduledAt, durationMinutes, location, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.advisorId, s.id, `${s.type === "atRisk" ? "Urgent: " : ""}Advising Session`, "Regular check-in.", d, 30, "Advisor Office", status, status === "completed" ? "Discussed course planning." : null]
    );
  }
}
console.log("Appointments done.");

// Advisor notes
for (const s of students) {
  const n = randInt(1, 3);
  for (let i = 0; i < n; i++) {
    await conn.execute(
      `INSERT INTO advisorNotes (advisorId, studentId, title, content, category, isPrivate) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.advisorId, s.id, `Note: ${s.name}`, s.type === "atRisk" ? "Recommend tutoring." : s.type === "excellent" ? "Encourage research." : "On track.", s.type === "atRisk" ? "academic" : "general", false]
    );
  }
}
console.log("Notes done.");

// Achievements
const achDefs = [
  { key: "first_course", title: "First Steps", titleAr: "أولى الخطوات", desc: "Complete your first course.", icon: "BookOpen", color: "#3b82f6", type: "courses_completed", value: 1 },
  { key: "gpa_3_5", title: "Honors Student", titleAr: "طالب متميز", desc: "Achieve GPA 3.5+.", icon: "Star", color: "#f59e0b", type: "gpa_reached", value: 1 },
  { key: "attendance_streak", title: "Perfect Attendance", titleAr: "حضور مثالي", desc: "95%+ attendance.", icon: "CheckCircle2", color: "#10b981", type: "attendance_streak", value: 1 },
  { key: "credits_30", title: "Credit Milestone", titleAr: "إنجاز الساعات", desc: "Earn 30 credits.", icon: "Target", color: "#8b5cf6", type: "credits_earned", value: 30 },
  { key: "semester_1", title: "Semester Survivor", titleAr: "ناجي الفصل", desc: "Complete a full semester.", icon: "GraduationCap", color: "#ef4444", type: "semester_completed", value: 1 },
];
const achIds = [];
for (const a of achDefs) {
  const [res] = await conn.execute(
    `INSERT INTO achievements (key, title, titleAr, description, descriptionAr, icon, color, conditionType, conditionValue, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
    [a.key, a.title, a.titleAr, a.desc, a.desc, a.icon, a.color, a.type, a.value]
  );
  achIds.push(res.insertId);
}
for (const s of students) {
  for (let i = 0; i < achIds.length; i++) {
    const a = achDefs[i];
    let unlocked = false;
    if (a.type === "courses_completed" && s.completedCount >= a.value) unlocked = true;
    if (a.type === "gpa_reached" && parseFloat(s.gpa) >= 3.5) unlocked = true;
    if (a.type === "attendance_streak" && s.attRate >= 95) unlocked = true;
    if (a.type === "credits_earned" && s.completedCredits >= a.value) unlocked = true;
    if (a.type === "semester_completed" && s.completedSem >= 1) unlocked = true;
    if (unlocked) {
      await conn.execute(
        `INSERT INTO studentAchievements (studentId, achievementId, unlockedAt, progress) VALUES (?, ?, NOW(), ?)`,
        [s.id, achIds[i], a.value]
      );
    }
  }
}
console.log("Achievements done.");

// Announcements
const announcements = [
  { title: "Welcome to Fall 2025", titleAr: "أهلاً بالفصل الخريفي 2025", content: "Welcome! Check your schedule and study plan.", priority: "medium", target: "all" },
  { title: "Registration Deadline Extended", titleAr: "تمديد موعد التسجيل", content: "Registration extended to next Friday.", priority: "high", target: "student" },
  { title: "Advisor Office Hours", titleAr: "ساعات مكتب المرشد", content: "Advisors available Mon-Thu 10am-2pm.", priority: "low", target: "student" },
  { title: "New AI Tutoring Feature", titleAr: "ميزة التوجيه بالذكاء الاصطناعي", content: "AI tutoring is now available.", priority: "medium", target: "all" },
  { title: "Midterm Exam Schedule", titleAr: "جدول امتحانات منتصف الفصل", content: "Midterms start Nov 10.", priority: "high", target: "student" },
];
for (const a of announcements) {
  await conn.execute(
    `INSERT INTO announcements (title, titleAr, content, contentAr, createdBy, priority, targetRole, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
    [a.title, a.titleAr, a.content, a.content, advisorIds[0], a.priority, a.target]
  );
}
console.log("Announcements done.");

// Notifications for each student
for (const s of students) {
  const notifs = [
    { title: "Assignment Due Soon", titleAr: "واجب قريب", msg: "You have an assignment due in 2 days.", type: "warning" },
    { title: "New Grade Posted", titleAr: "درجة جديدة", msg: "A grade has been posted for one of your courses.", type: "info" },
    { title: "Academic Alert", titleAr: "تنبيه أكاديمي", msg: "Please check your academic alerts.", type: "warning" },
  ];
  for (const n of notifs) {
    await conn.execute(
      `INSERT INTO notifications (userId, title, titleAr, message, messageAr, type, isRead) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [s.id, n.title, n.titleAr, n.msg, n.msg, n.type, rand([true, false])]
    );
  }
}
console.log("Notifications done.");

await conn.end();
console.log("\nAcademic seed completed successfully!");
console.log(`  Advisors: ${advisorIds.length}`);
console.log(`  Students: ${students.length}`);
console.log(`  Courses: ${courseCatalog.length}`);
console.log(`  Assignments per course: ${assignmentTmpl.length}`);
