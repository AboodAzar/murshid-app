import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8");
  const rows = [];
  let currentRow = [];
  let inQuotes = false;
  let currentField = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  }
  return rows;
}

// Arabic to English common course name dictionary
const NAME_MAP = {
  "العلوم العسكرية": "Military Sciences",
  "التربية الوطنية": "National Education",
  "مهارات حياتية": "Life Skills",
  "الاتصال والتواصل باللغة العربية": "Arabic Communication Skills",
  "الاتصال والتواصل باللغة الإنجليزية": "English Communication Skills",
  "الريادة والابتكار": "Entrepreneurship and Innovation",
  "القيادة والمسؤولية المجتمعية": "Leadership and Social Responsibility",
  "الحضارة الانسانية": "Human Civilization",
  "التنمية والبيئة": "Development and Environment",
  "الثقافة الرقمية": "Digital Culture",
  "الإسعافات الأولية": "First Aid",
  "الرياضة والصحة": "Sports and Health",
  "الثقافة الإسلامية": "Islamic Culture",
  "القانون في حياتنا": "Law in Our Life",
  "أساسيات علم النفس": "Fundamentals of Psychology",
  "أساسيات اللغة الألمانية": "Fundamentals of German Language",
  "أساسيات تكنولوجيا المعلومات": "Fundamentals of Information Technology",
  "اللغة الانجليزية التقنية لطلاب تكنولوجيا المعلومات": "Technical English for IT Students",
  "موضوعات حديثة في تكنولوجيا المعلومات": "Modern Topics in Information Technology",
  "الرياضيات المتقطعة": "Discrete Mathematics",
  "مها ارت الاتصال واخلاقيات المهنة": "Communication Skills and Professional Ethics",
  "تراكيب البيانات والخوارزميات": "Data Structures and Algorithms",
  "تراكيب البيانات": "Data Structures",
  "تطبيقات البرمجة المرئية": "Visual Programming Applications",
  "تحليل وتصميم النظم كائنية التوجه": "Object-Oriented Systems Analysis and Design",
  "تطوير تطبيقات الانترنت": "Internet Applications Development",
  "تفاعل الانسان مع الحاسوب": "Human-Computer Interaction",
  "قواعد البيانات": "Database Systems",
  "تحليل وتصميم النظم": "Systems Analysis and Design",
  "ادارة نظم قواعد البيانات": "Database Management Systems",
  "اساسيات هندسة البرمجيات": "Fundamentals of Software Engineering",
  "البرمجة الكينونية": "Object Oriented Programming",
  "برمجة كينونية": "Object Oriented Programming",
  "تصميم المنطق الرقمي": "Digital Logic Design",
  "تنظيم ومعمارية الحاسوب": "Computer Organization and Architecture",
  "نظم التشغيل": "Operating Systems",
  "شبكات الحاسوب": "Computer Networks",
  "أمن المعلومات": "Information Security",
  "الذكاء الاصطناعي": "Artificial Intelligence",
  "تعلم الآلة": "Machine Learning",
  "علم البيانات": "Data Science",
  "معمارية البرمجيات": "Software Architecture",
  "اختبار وضمان جودة البرمجيات": "Software Testing and Quality Assurance",
  "مشروع التخرج 1": "Graduation Project I",
  "مشروع التخرج 2": "Graduation Project II",
  "التدريب الميداني": "Field Training"
};

const sePlan = parseCsv("S:/murshid (1)/Runpod/data/SE_Study_Plan_1.csv");
const csPlan = parseCsv("S:/murshid (1)/Runpod/data/CS_Study_Plan_1.csv");
const aiPlan = parseCsv("S:/murshid (1)/Runpod/data/AI_Study_Plan_1.csv");

const seDesc = parseCsv("S:/murshid (1)/Runpod/data/SE_Materials_Descriptions.csv");
const csDesc = parseCsv("S:/murshid (1)/Runpod/data/CS_Materials_Descriptions.csv");
const aiDesc = parseCsv("S:/murshid (1)/Runpod/data/AI_Materials_Descriptions.csv");

// Descriptions Map
const descMap = new Map();
for (let r = 1; r < seDesc.length; r++) {
  const row = seDesc[r];
  const code = (row[3] || "").replace(/^0+/, "");
  if (code && row[4]) descMap.set(code, row[4].trim());
}
for (let r = 1; r < csDesc.length; r++) {
  const row = csDesc[r];
  const code = (row[0] || "").replace(/^0+/, "");
  if (code && row[4] && !descMap.has(code)) descMap.set(code, row[4].trim());
}
for (let r = 1; r < aiDesc.length; r++) {
  const row = aiDesc[r];
  const code = (row[0] || "").replace(/^0+/, "");
  if (code && row[4] && !descMap.has(code)) descMap.set(code, row[4].trim());
}

const coursesMap = new Map();

function processPlan(rows, dept) {
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 8) continue;
    const year = parseInt(row[0], 10) || 1;
    const semester = parseInt(row[1], 10) || 1;
    const prereq = (row[2] || "").replace(/[…\-.]+/g, "").trim();
    const practicalHours = parseInt(row[3], 10) || 0;
    const theoryHours = parseInt(row[4], 10) || 3;
    const credits = parseInt(row[5], 10) || 3;
    const nameAr = (row[6] || "").trim();
    const rawCode = (row[7] || "").trim();
    if (!rawCode || !nameAr) continue;

    const inPerson = row[8] === "1";
    const blended = row[9] === "1";
    const online = row[10] === "1";

    let modality = "وجاهي";
    let modalityEn = "in_person";
    let modalityLabelEn = "In-Person (وجاهي كامل)";
    let modalityLabelAr = "وجاهي كامل";

    if (online) {
      modality = "الكتروني";
      modalityEn = "online";
      modalityLabelEn = "Online E-learning (إلكتروني كامل)";
      modalityLabelAr = "إلكتروني كامل";
    } else if (blended) {
      modality = "مدمج";
      modalityEn = "blended";
      modalityLabelEn = "Blended Learning (مدمج)";
      modalityLabelAr = "مدمج (وجاهي + إلكتروني)";
    }

    const mainCategory = row[11] || "";
    const subCategory = row[12] || "";
    const cleanCode = rawCode.replace(/^0+/, "");
    const descriptionAr = descMap.get(cleanCode) || descMap.get(rawCode) || "";
    const nameEn = NAME_MAP[nameAr] || nameAr;

    if (!coursesMap.has(rawCode)) {
      coursesMap.set(rawCode, {
        code: rawCode,
        cleanCode,
        nameAr,
        nameEn,
        credits,
        theoryHours,
        practicalHours,
        modality,
        modalityEn,
        modalityLabelAr,
        modalityLabelEn,
        year,
        semester,
        prerequisite: prereq || null,
        mainCategory,
        subCategory,
        descriptionAr,
        departments: [dept]
      });
    } else {
      const existing = coursesMap.get(rawCode);
      if (!existing.departments.includes(dept)) {
        existing.departments.push(dept);
      }
      if (!existing.descriptionAr && descriptionAr) {
        existing.descriptionAr = descriptionAr;
      }
    }
  }
}

processPlan(sePlan, "Software Engineering");
processPlan(csPlan, "Computer Science");
processPlan(aiPlan, "Artificial Intelligence");

const coursesList = Array.from(coursesMap.values());

// Ensure directories exist
const sharedDataDir = path.resolve("shared/data");
if (!fs.existsSync(sharedDataDir)) {
  fs.mkdirSync(sharedDataDir, { recursive: true });
}

// 1. Output shared/data/zuj_courses.json
fs.writeFileSync(
  path.join(sharedDataDir, "zuj_courses.json"),
  JSON.stringify(coursesList, null, 2),
  "utf8"
);
console.log(`Saved ${coursesList.length} courses to shared/data/zuj_courses.json`);

// 2. Output shared/data/zuj_courses_knowledge_base.json (RAG & Model Optimized)
const knowledgeBase = {
  institution: "Al-Zaytoonah University of Jordan (ZUJ)",
  curriculumScale: 133,
  academicTimetable: "4-Day Week (Sunday to Wednesday)",
  totalCoursesCount: coursesList.length,
  modalitiesSummary: {
    inPerson: coursesList.filter((c) => c.modalityEn === "in_person").length,
    blended: coursesList.filter((c) => c.modalityEn === "blended").length,
    online: coursesList.filter((c) => c.modalityEn === "online").length,
  },
  courses: coursesList.map((c) => ({
    courseId: c.code,
    courseNameAr: c.nameAr,
    courseNameEn: c.nameEn,
    creditHours: c.credits,
    lectureModality: c.modalityLabelAr,
    modalityType: c.modalityEn,
    prerequisite: c.prerequisite,
    studyYear: c.year,
    studySemester: c.semester,
    requirementCategory: c.mainCategory,
    subCategory: c.subCategory,
    offeredInDepartments: c.departments,
    description: c.descriptionAr || "Official curriculum course at ZUJ Faculty of Science & IT.",
  })),
};

fs.writeFileSync(
  path.join(sharedDataDir, "zuj_courses_knowledge_base.json"),
  JSON.stringify(knowledgeBase, null, 2),
  "utf8"
);
console.log(`Saved RAG knowledge base to shared/data/zuj_courses_knowledge_base.json`);

// 3. Output shared/data/zuj_courses_catalog.md
let catalogMd = `# Al-Zaytoonah University of Jordan (ZUJ) Course Catalog
**Official Curriculum Data: 133 Credit Hours • 4-Day Timetable • Modalities: وجاهي (In-Person), مدمج (Blended), الكتروني (Online)**

| Course Code | Course Name (AR) | Course Name (EN) | Credits | Modality (نوع التعليم) | Prerequisite | Departments |
|:---|:---|:---|:---:|:---|:---|:---|
`;

for (const c of coursesList) {
  catalogMd += `| \`${c.code}\` | **${c.nameAr}** | ${c.nameEn} | **${c.credits}** | \`${c.modalityLabelAr}\` | ${c.prerequisite || "None"} | ${c.departments.join(", ")} |\n`;
}

fs.writeFileSync(
  path.join(sharedDataDir, "zuj_courses_catalog.md"),
  catalogMd,
  "utf8"
);
console.log(`Saved Markdown course catalog to shared/data/zuj_courses_catalog.md`);

// 4. Update MySQL Database
async function updateDatabase() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || "mysql://root:@localhost:3306/murshid");
  console.log("Connected to MySQL database...");

  // Check if modality column exists in courses
  const [cols] = await conn.execute("SHOW COLUMNS FROM courses LIKE 'modality'");
  if (cols.length === 0) {
    console.log("Adding modality column to courses table...");
    await conn.execute("ALTER TABLE courses ADD COLUMN modality VARCHAR(50) DEFAULT 'in_person' AFTER credits");
    await conn.execute("ALTER TABLE courses ADD COLUMN modalityAr VARCHAR(50) DEFAULT 'وجاهي' AFTER modality");
  }

  // Check if attendance has anti-cheat columns
  const [attCols] = await conn.execute("SHOW COLUMNS FROM attendance LIKE 'verificationMethod'");
  if (attCols.length === 0) {
    console.log("Adding verificationMethod and anti-cheat columns to attendance table...");
    await conn.execute("ALTER TABLE attendance ADD COLUMN verificationMethod VARCHAR(50) DEFAULT 'qr_scan'");
    await conn.execute("ALTER TABLE attendance ADD COLUMN checkInCode VARCHAR(100) NULL");
    await conn.execute("ALTER TABLE attendance ADD COLUMN hallName VARCHAR(100) NULL");
    await conn.execute("ALTER TABLE attendance ADD COLUMN deviceFingerprint VARCHAR(255) NULL");
  }

  // Create active classroom QR sessions table if not exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS classroomQrSessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      courseId INT NOT NULL,
      doctorId INT NOT NULL,
      hallName VARCHAR(100) NOT NULL,
      currentTotpCode VARCHAR(50) NOT NULL,
      sessionToken VARCHAR(255) NOT NULL,
      expiresAt TIMESTAMP NOT NULL,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_qr_course (courseId),
      INDEX idx_qr_active (isActive)
    )
  `);

  // Upsert all courses into courses table
  let inserted = 0;
  let updated = 0;

  for (const c of coursesList) {
    const [existing] = await conn.execute("SELECT id FROM courses WHERE code = ?", [c.code]);
    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO courses (code, name, nameAr, credits, modality, modalityAr, description, descriptionAr, departmentId, semester, isRequired)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.code,
          c.nameEn || c.nameAr,
          c.nameAr,
          c.credits,
          c.modalityEn,
          c.modality,
          c.descriptionAr || c.nameEn,
          c.descriptionAr || c.nameAr,
          1, // Department 1 (IT)
          c.semester,
          c.subCategory.includes("اجبارية") || c.subCategory.includes("إجبارية") ? 1 : 0
        ]
      );
      inserted++;
    } else {
      await conn.execute(
        `UPDATE courses SET nameAr = ?, credits = ?, modality = ?, modalityAr = ?, descriptionAr = COALESCE(NULLIF(descriptionAr, ''), ?) WHERE code = ?`,
        [c.nameAr, c.credits, c.modalityEn, c.modality, c.descriptionAr, c.code]
      );
      updated++;
    }
  }

  console.log(`Database sync completed: ${inserted} inserted, ${updated} updated.`);
  await conn.end();
}

updateDatabase().catch(console.error);
