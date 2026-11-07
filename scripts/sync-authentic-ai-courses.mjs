import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

// 1. Official AI Curriculum Course Data from Runpod/data/AI_Study_Plan_1.csv
const aiCurriculum = [
  // University Compulsory (21 Cr)
  { code: "420101", nameAr: "العلوم العسكرية", nameEn: "Military Sciences", credits: 3, year: 4, semester: 2, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اجبارية", deptId: 1 },
  { code: "420151", nameAr: "التربية الوطنية", nameEn: "National Education", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اجبارية", deptId: 1 },
  { code: "420171", nameAr: "مهارات حياتية", nameEn: "Life Skills", credits: 3, year: 2, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اجبارية", deptId: 1 },
  { code: "420115", nameAr: "الاتصال والتواصل باللغة العربية", nameEn: "Arabic Communication Skills", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اجبارية", deptId: 1 },
  { code: "420123", nameAr: "الاتصال والتواصل باللغة الإنجليزية", nameEn: "English Communication Skills", credits: 3, year: 1, semester: 2, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اجبارية", deptId: 1 },
  { code: "420261", nameAr: "الريادة والابتكار", nameEn: "Entrepreneurship and Innovation", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اجبارية", deptId: 1 },
  { code: "420241", nameAr: "القيادة والمسؤولية المجتمعية", nameEn: "Leadership and Social Responsibility", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اجبارية", deptId: 1 },

  // University Electives (6 Cr required)
  { code: "420142", nameAr: "الحضارة الانسانية", nameEn: "Human Civilization", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420253", nameAr: "التنمية والبيئة", nameEn: "Development and Environment", credits: 3, year: 2, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420172", nameAr: "الثقافة الرقمية", nameEn: "Digital Culture", credits: 3, year: 1, semester: 2, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420201", nameAr: "الإسعافات الأولية", nameEn: "First Aid", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420134", nameAr: "الرياضة والصحة", nameEn: "Sports and Health", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420112", nameAr: "الثقافة الإسلامية", nameEn: "Islamic Culture", credits: 3, year: 2, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420155", nameAr: "القانون في حياتنا", nameEn: "Law in Our Life", credits: 3, year: 1, semester: 2, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420392", nameAr: "أساسيات علم النفس", nameEn: "Fundamentals of Psychology", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },
  { code: "420341", nameAr: "أساسيات اللغة الألمانية", nameEn: "German Language Fundamentals", credits: 3, year: 3, semester: 2, mainCategory: "متطلبات الجامعة", subCategory: "متطلبات جامعة اختيارية", deptId: 1 },

  // Faculty Compulsory (21 Cr)
  { code: "130100", nameAr: "أساسيات تكنولوجيا المعلومات", nameEn: "Fundamentals of Information Technology", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات الكلية", subCategory: "متطلبات الكلية", deptId: 1 },
  { code: "135101", nameAr: "اللغة الانجليزية التقنية لطلاب تكنولوجيا المعلومات", nameEn: "Technical English for IT Students", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات الكلية", subCategory: "متطلبات الكلية", deptId: 3 },
  { code: "133102", nameAr: "موضوعات حديثة في تكنولوجيا المعلومات", nameEn: "Modern Topics in Information Technology", credits: 3, year: 1, semester: 2, mainCategory: "متطلبات الكلية", subCategory: "متطلبات الكلية", deptId: 1 },
  { code: "130110", nameAr: "الرياضيات المتقطعة", nameEn: "Discrete Mathematics", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات الكلية", subCategory: "متطلبات الكلية", deptId: 1 },
  { code: "130130", nameAr: "البرمجة الحاسوبية", nameEn: "Computer Programming", credits: 3, year: 1, semester: 2, mainCategory: "متطلبات الكلية", subCategory: "متطلبات الكلية", deptId: 1 },
  { code: "130231", nameAr: "البرمجة التطبيقية", nameEn: "Applied Programming", credits: 3, year: 2, semester: 1, mainCategory: "متطلبات الكلية", subCategory: "متطلبات الكلية", deptId: 1 },
  { code: "131390", nameAr: "الريادة وتخطيط المشاريع", nameEn: "Entrepreneurship and Project Planning", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات الكلية", subCategory: "متطلبات الكلية", deptId: 1 },

  // Major Family Requirements (27 Cr)
  { code: "135102", nameAr: "أساسيات علم البيانات", nameEn: "Fundamentals of Data Science", credits: 3, year: 1, semester: 2, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135232", nameAr: "برمجة علوم البيانات والذكاء الاصطناعي (1)", nameEn: "Data Science & AI Programming 1", credits: 3, year: 2, semester: 1, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135203", nameAr: "الذكاء الاصطناعي ونظم الحوسبة", nameEn: "Artificial Intelligence & Computing Systems", credits: 3, year: 2, semester: 1, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135211", nameAr: "تراكيب البيانات", nameEn: "Data Structures", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135240", nameAr: "التعلم الالي", nameEn: "Machine Learning", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135220", nameAr: "قواعد البيانات", nameEn: "Database Systems", credits: 3, year: 2, semester: 1, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135233", nameAr: "برمجة علوم البيانات والذكاء الاصطناعي (2)", nameEn: "Data Science & AI Programming 2", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135312", nameAr: "الخوارزميات", nameEn: "Algorithms", credits: 3, year: 3, semester: 2, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },
  { code: "135321", nameAr: "البيانات الضخمة", nameEn: "Big Data", credits: 3, year: 3, semester: 2, mainCategory: "متطلبات عائلة التخصص", subCategory: "متطلبات عائلة التخصص", deptId: 3 },

  // Major Compulsory Requirements (43 Cr)
  { code: "135222", nameAr: "مبادئ استرجاع المعلومات", nameEn: "Information Retrieval Principles", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135213", nameAr: "النماذج التحسينية", nameEn: "Optimization Models", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135214", nameAr: "الاحصاء والاحتمالات في الذكاء الاصطناعي", nameEn: "Statistics & Probability in AI", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135323", nameAr: "تنقيب البيانات", nameEn: "Data Mining", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135341", nameAr: "الشبكات العصبونية و التعلم العميق", nameEn: "Neural Networks & Deep Learning", credits: 3, year: 3, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135342", nameAr: "معالجة اللغات الطبيعية", nameEn: "Natural Language Processing", credits: 3, year: 3, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135343", nameAr: "الروبوتات المتنقلة الذكية", nameEn: "Intelligent Mobile Robotics", credits: 3, year: 3, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135324", nameAr: "البيانات المرئية", nameEn: "Visual Data", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135425", nameAr: "هندسة البيانات وتحليلاتها", nameEn: "Data Engineering and Analytics", credits: 3, year: 4, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135444", nameAr: "نماذج اللغات الضخمة وهندسة الاستعلام", nameEn: "LLMs & Prompt Engineering", credits: 3, year: 4, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135445", nameAr: "تطبيقات التعلم الالي والعميق (1)", nameEn: "ML & Deep Learning Applications 1", credits: 3, year: 4, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135491", nameAr: "التدريب الميداني", nameEn: "Field Training", credits: 3, year: 4, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135492", nameAr: "مشروع تخرج 1", nameEn: "Graduation Project 1", credits: 2, year: 4, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135493", nameAr: "مشروع تخرج 2", nameEn: "Graduation Project 2", credits: 2, year: 4, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },
  { code: "135494", nameAr: "مخيم الممارسات المهنية", nameEn: "Professional Practice Bootcamp", credits: 3, year: 4, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاجبارية", deptId: 3 },

  // Major Elective Requirements (9 Cr required)
  { code: "135304", nameAr: "أمن البيانات", nameEn: "Data Security", credits: 3, year: 3, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135326", nameAr: "الرؤية الحاسوبية", nameEn: "Computer Vision", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135446", nameAr: "الروبوتات المتقدمة", nameEn: "Advanced Robotics", credits: 3, year: 4, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135315", nameAr: "نمذجة البيانات ومحاكاتها", nameEn: "Data Modeling & Simulation", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135327", nameAr: "تميز الانماط واستدلال المعرفة", nameEn: "Pattern Recognition & Knowledge Reasoning", credits: 3, year: 3, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135495", nameAr: "مواضيع مختارة في الذكاء الاصطناعي (1)", nameEn: "Special Topics in AI 1", credits: 3, year: 4, semester: 1, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135496", nameAr: "مواضيع مختارة في الذكاء الاصطناعي (2)", nameEn: "Special Topics in AI 2", credits: 3, year: 4, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135447", nameAr: "تطبيقات التعلم الالي والعميق (2)", nameEn: "ML & Deep Learning Applications 2", credits: 3, year: 4, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },
  { code: "135448", nameAr: "تطبيقات انترنت الاشياء", nameEn: "IoT Applications in AI", credits: 3, year: 4, semester: 2, mainCategory: "متطلبات التخصص", subCategory: "متطلبات التخصص الاختيارية", deptId: 3 },

  // Supporting Compulsory (6 Cr)
  { code: "101112", nameAr: "أسس الرياضيات", nameEn: "Mathematical Foundations", credits: 3, year: 1, semester: 1, mainCategory: "متطلبات التخصص المساندة", subCategory: "متطلبات التخصص المساندة", deptId: 1 },
  { code: "101274", nameAr: "تطبيقات رياضية محوسبة", nameEn: "Computational Mathematical Applications", credits: 3, year: 2, semester: 2, mainCategory: "متطلبات التخصص المساندة", subCategory: "متطلبات التخصص المساندة", deptId: 1 },
];

// Read descriptions from AI_Materials_Descriptions.csv
const descMap = new Map();
try {
  const descRaw = fs.readFileSync(path.resolve("Runpod", "data", "AI_Materials_Descriptions.csv"), "utf8");
  const descLines = descRaw.split("\r\n").join("\n").split("\n");
  for (let i = 1; i < descLines.length; i++) {
    const l = descLines[i].trim();
    if (!l) continue;
    const parts = l.split(",");
    const code = parts[0]?.trim();
    // remainder is description
    const desc = parts.slice(4).join(",").replace(/^"|"$/g, "").trim();
    if (code && desc) {
      descMap.set(code, desc);
    }
  }
} catch (e) {
  console.warn("Could not read descriptions CSV:", e.message);
}

async function run() {
  const conn = await mysql.createConnection({ host: "127.0.0.1", user: "root", database: "murshid" });
  console.log("Connected to MySQL murshid DB.");

  // 1. Update courses table with accurate bilingual names and descriptions
  console.log("Syncing courses in MySQL...");
  for (const item of aiCurriculum) {
    const descAr = descMap.get(item.code) || `مساق ${item.nameAr} المعتمد في خطة الذكاء الاصطناعي وعلم البيانات بجامعة الزيتونة.`;
    const descEn = `${item.nameEn} - Official course in the Artificial Intelligence & Data Science degree curriculum at ZUJ.`;

    // Check if course exists by code
    const [existing] = await conn.query("SELECT id FROM courses WHERE code = ? LIMIT 1", [item.code]);
    if (existing && existing.length > 0) {
      await conn.query(
        "UPDATE courses SET name = ?, nameAr = ?, credits = ?, description = ?, descriptionAr = ?, departmentId = ? WHERE id = ?",
        [item.nameEn, item.nameAr, item.credits, descEn, descAr, item.deptId, existing[0].id]
      );
    } else {
      await conn.query(
        "INSERT INTO courses (code, name, nameAr, credits, description, descriptionAr, departmentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [item.code, item.nameEn, item.nameAr, item.credits, descEn, descAr, item.deptId]
      );
    }
  }
  console.log(`Synced ${aiCurriculum.length} courses in DB.`);

  // 2. Fetch course ID lookup map
  const [dbCourses] = await conn.query("SELECT id, code, name, nameAr FROM courses");
  const codeToId = new Map();
  for (const c of dbCourses) {
    codeToId.set(c.code, c.id);
  }

  // 3. Setup Basma Hassan (210029) and Ali Faris (210034) with Authentic AI Courses!
  // Active In-Progress Courses (Year 3, Semester 2):
  // 135341 Neural Networks & Deep Learning
  // 135342 Natural Language Processing
  // 135343 Intelligent Mobile Robotics
  // 135312 Algorithms
  // 135321 Big Data
  const inProgressCodes = [
    "135341", // Neural Networks & Deep Learning
    "135342", // Natural Language Processing
    "135343", // Intelligent Mobile Robotics
    "135312", // Algorithms
    "135321", // Big Data
  ];

  // Completed Courses (Years 1, 2, and Year 3 Sem 1):
  const completedList = [
    // Year 1 Sem 1
    { code: "420151", grade: "A", points: 4.0 },   // National Education
    { code: "420115", grade: "A", points: 4.0 },   // Arabic Communication Skills
    { code: "130100", grade: "A", points: 4.0 },   // IT Fundamentals
    { code: "135101", grade: "A-", points: 3.75 }, // Technical English
    { code: "130110", grade: "A-", points: 3.75 }, // Discrete Math
    { code: "101112", grade: "A", points: 4.0 },   // Math Foundations

    // Year 1 Sem 2
    { code: "420123", grade: "A-", points: 3.75 }, // English Communication Skills
    { code: "133102", grade: "A", points: 4.0 },   // Modern Topics in IT
    { code: "130130", grade: "A", points: 4.0 },   // Computer Programming
    { code: "135102", grade: "A", points: 4.0 },   // Fundamentals of Data Science
    { code: "420172", grade: "A-", points: 3.75 }, // Digital Culture

    // Year 2 Sem 1
    { code: "420171", grade: "A", points: 4.0 },   // Life Skills
    { code: "130231", grade: "A-", points: 3.75 }, // Applied Programming
    { code: "135232", grade: "A", points: 4.0 },   // Data Science & AI Programming 1
    { code: "135203", grade: "A", points: 4.0 },   // AI & Computing Systems
    { code: "135220", grade: "A", points: 4.0 },   // Database Systems

    // Year 2 Sem 2
    { code: "420261", grade: "A", points: 4.0 },   // Entrepreneurship & Innovation
    { code: "135211", grade: "A", points: 4.0 },   // Data Structures
    { code: "135240", grade: "A", points: 4.0 },   // Machine Learning
    { code: "135233", grade: "A-", points: 3.75 }, // Data Science & AI Programming 2
    { code: "135222", grade: "B+", points: 3.5 },  // Information Retrieval Principles
    { code: "135213", grade: "A-", points: 3.75 }, // Optimization Models
    { code: "135214", grade: "A", points: 4.0 },   // Statistics & Probability in AI
    { code: "101274", grade: "A", points: 4.0 },   // Computational Math Applications

    // Year 3 Sem 1
    { code: "420241", grade: "A", points: 4.0 },   // Leadership & Community
    { code: "131390", grade: "A", points: 4.0 },   // Entrepreneurship & Project Planning
    { code: "135323", grade: "A", points: 4.0 },   // Data Mining
    { code: "135324", grade: "A", points: 4.0 },   // Visual Data
    { code: "135326", grade: "A-", points: 3.75 }, // Computer Vision (Elective)
  ];

  const targetStudents = [210029, 210034]; // Basma Hassan and Ali Faris

  for (const studentId of targetStudents) {
    console.log(`Setting authentic AI courses for student ${studentId}...`);
    // Clear old enrollments
    await conn.query("DELETE FROM studentcourses WHERE studentId = ?", [studentId]);

    // Insert In-Progress courses
    for (const code of inProgressCodes) {
      const cid = codeToId.get(code);
      if (cid) {
        await conn.query(
          "INSERT INTO studentcourses (studentId, courseId, status, semester, createdAt, updatedAt) VALUES (?, ?, 'in_progress', 'Spring 2026', NOW(), NOW())",
          [studentId, cid]
        );
      } else {
        console.warn(`Course code ${code} not found in DB!`);
      }
    }

    // Insert Completed courses
    for (const item of completedList) {
      const cid = codeToId.get(item.code);
      if (cid) {
        await conn.query(
          "INSERT INTO studentcourses (studentId, courseId, status, grade, gradePoints, semester, createdAt, updatedAt) VALUES (?, ?, 'completed', ?, ?, 'Fall 2025', NOW(), NOW())",
          [studentId, cid, item.grade, item.points]
        );
      }
    }
  }

  // 4. Update shared/data/zuj_courses.json with the authentic clean courses
  const catalogPath = path.resolve("shared", "data", "zuj_courses.json");
  let existingCatalog = [];
  try {
    existingCatalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  } catch (e) {}

  // Create a map by code
  const catalogMap = new Map();
  for (const c of existingCatalog) {
    const k = (c.code || c.cleanCode || "").trim().toUpperCase();
    if (k) catalogMap.set(k, c);
  }

  // Overwrite/Update with clean official AI courses
  for (const item of aiCurriculum) {
    const k = item.code.toUpperCase();
    catalogMap.set(k, {
      code: item.code,
      cleanCode: item.code,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      credits: item.credits,
      modality: "وجاهي",
      modalityEn: "In-Person",
      year: item.year,
      semester: item.semester,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      prerequisite: item.prereq || null,
    });
  }

  const updatedCatalog = Array.from(catalogMap.values());
  fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2), "utf8");
  console.log(`Updated ${catalogPath} with ${updatedCatalog.length} courses.`);

  // 5. Ensure Course Materials and Assignments exist for active AI courses
  console.log("Adding authentic assignments and materials for active AI courses...");
  const aiDoctorId = 31001; // Dr. Ahmad Khalil
  const aiDoctorName = "Dr. Ahmad Khalil (د. أحمد خليل)";

  for (const code of inProgressCodes) {
    const cid = codeToId.get(code);
    if (!cid) continue;

    // Check course materials
    const [existingMats] = await conn.query("SELECT id FROM course_materials WHERE courseId = ? LIMIT 1", [cid]);
    if (!existingMats || existingMats.length === 0) {
      await conn.query(
        `INSERT INTO course_materials (courseId, chapterNumber, chapterTitle, chapterTitleAr, type, title, titleAr, description, fileName, fileUrl, fileSize, doctorId, doctorName, createdAt)
         VALUES (?, 1, 'Chapter 1: Theoretical Foundations', 'الفصل 1: الأسس النظرية', 'slides', 'Lecture Slides & Course Outline', 'شرائح المحاضرة والخطة المنهجية', 'Official course curriculum and slide deck.', ?, '/materials/syllabus.pdf', '4.2 MB', ?, ?, NOW())`,
        [cid, `${code}_Lecture_Notes_Ch1.pdf`, aiDoctorId, aiDoctorName]
      );
      await conn.query(
        `INSERT INTO course_materials (courseId, chapterNumber, chapterTitle, chapterTitleAr, type, title, titleAr, description, fileName, fileUrl, fileSize, doctorId, doctorName, createdAt)
         VALUES (?, 2, 'Chapter 2: Algorithms & Implementations', 'الفصل 2: الخوارزميات والتطبيق العملي', 'notes', 'Lab Practice & Code Templates', 'كود المختبر ونماذج الأكواد', 'Hands-on practice algorithms and code benchmarks.', ?, '/materials/lab_notebooks.zip', '2.8 MB', ?, ?, NOW())`,
        [cid, `${code}_Lab_Practice.zip`, aiDoctorId, aiDoctorName]
      );
    }

    // Check assignments
    const [existingAsgn] = await conn.query("SELECT id FROM assignments WHERE courseId = ? LIMIT 1", [cid]);
    if (!existingAsgn || existingAsgn.length === 0) {
      const [newAsgn] = await conn.query(
        `INSERT INTO assignments (courseId, title, titleAr, description, descriptionAr, dueDate, totalPoints, advisorId, submissionType, createdAt, updatedAt)
         VALUES (?, 'Problem Set 1: Theoretical Analysis & Practical Implementation', 'واجب 1: التحليل النظري والتطبيق العملي', 'Analyze algorithm complexity, write clean Python implementation with test benchmarks, and report findings.', 'قم بتحليل تعقيد الخوارزمية، وكتابة كود بايثون متكامل مع تقرير النتائج.', DATE_ADD(NOW(), INTERVAL 7 DAY), 100, 31001, 'text', NOW(), NOW())`,
        [cid]
      );
      const asgnId = newAsgn.insertId;

      // Assign to student 210029
      await conn.query(
        `INSERT INTO studentassignments (assignmentId, studentId, status, createdAt, updatedAt)
         VALUES (?, 210029, 'pending', NOW(), NOW())`,
        [asgnId]
      );
    }
  }

  console.log("Sync completed successfully!");
  await conn.end();
}

run().catch(err => {
  console.error("Sync failed:", err);
  process.exit(1);
});
