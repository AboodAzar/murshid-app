/**
 * Oliver AI — Doctor Course Materials Retrieval & Knowledge Engine (RAG)
 * 
 * Hierarchy & Scoring Rules:
 * 1. TOP PRIORITY (Score: 100+): Official Doctor Materials (Slides, Notes, Assignments, Quizzes, Exams).
 *    The AI answers students' questions directly from the instructor's uploaded files FIRST.
 * 2. SECONDARY (Score: 35-45): External Academic Sources & Internet Search.
 *    Only reviewed AFTER consulting all doctor files.
 * 3. MANDATORY HEADS-UP NOTICE: Whenever external/internet knowledge is provided,
 *    an explicit warning is attached to alert the student that this information is from outside
 *    the official course slides/materials.
 */

import { eq, or, and, sql } from "drizzle-orm";
import { courseMaterials, courses, users, studentCourses } from "../../drizzle/schema";

export interface DoctorMaterialMatch {
  id: number;
  courseCode: string;
  courseName: string;
  courseNameAr?: string;
  doctorName: string;
  doctorEmail?: string | null;
  chapterNumber: number;
  chapterTitle: string;
  chapterTitleAr?: string;
  type: "slides" | "notes" | "material" | "activity" | "assignment" | "quiz" | "exam";
  title: string;
  titleAr?: string;
  description?: string | null;
  fileName: string;
  fileUrl?: string;
  relevanceScore: number;
  snippet: string;
}

export interface DoctorMaterialsRAGResult {
  hasDoctorMatch: boolean;
  topMatchScore: number;
  matches: DoctorMaterialMatch[];
  formattedContext: string;
  requiresExternalSupplement: boolean;
  headsUpNotice: string;
}

/**
 * Searches and scores doctor files for a student query
 */
export async function searchDoctorCourseMaterialsRAG(params: {
  db: any;
  studentId: number;
  query: string;
  language?: "ar" | "en";
}): Promise<DoctorMaterialsRAGResult> {
  const { db, studentId, query, language = "ar" } = params;
  const isArabic = language === "ar";
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,،.?!=+/*-]+/).filter(t => t.length > 2);

  // 1. Fetch all course materials for student's enrolled courses and general curriculum
  const rows = await db
    .select({
      id: courseMaterials.id,
      courseId: courseMaterials.courseId,
      chapterNumber: courseMaterials.chapterNumber,
      chapterTitle: courseMaterials.chapterTitle,
      chapterTitleAr: courseMaterials.chapterTitleAr,
      type: courseMaterials.type,
      title: courseMaterials.title,
      titleAr: courseMaterials.titleAr,
      description: courseMaterials.description,
      fileName: courseMaterials.fileName,
      fileUrl: courseMaterials.fileUrl,
      doctorName: courseMaterials.doctorName,
      courseCode: courses.code,
      courseName: courses.name,
      courseNameAr: courses.nameAr,
    })
    .from(courseMaterials)
    .leftJoin(courses, eq(courseMaterials.courseId, courses.id));

  // 2. Score each doctor material against student query
  const scoredMatches: DoctorMaterialMatch[] = [];

  for (const row of rows) {
    let score = 0;
    const titleText = `${row.title || ""} ${row.titleAr || ""}`.toLowerCase();
    const chapterText = `${row.chapterTitle || ""} ${row.chapterTitleAr || ""}`.toLowerCase();
    const descText = `${row.description || ""}`.toLowerCase();
    const fileText = `${row.fileName || ""}`.toLowerCase();
    const courseText = `${row.courseCode || ""} ${row.courseName || ""} ${row.courseNameAr || ""}`.toLowerCase();

    // Base Priority Score for Doctor Files: starts at 100
    let matchFound = false;

    for (const token of queryTokens) {
      if (titleText.includes(token)) {
        score += 35;
        matchFound = true;
      }
      if (chapterText.includes(token)) {
        score += 25;
        matchFound = true;
      }
      if (descText.includes(token)) {
        score += 20;
        matchFound = true;
      }
      if (fileText.includes(token)) {
        score += 20;
        matchFound = true;
      }
      if (courseText.includes(token)) {
        score += 30;
        matchFound = true;
      }
    }

    // Specific academic topic triggers
    const isComplexityQuery = cleanQuery.includes("big-o") || cleanQuery.includes("omega") || cleanQuery.includes("complexity") || cleanQuery.includes("تعقيد") || cleanQuery.includes("asymptotic");
    if (isComplexityQuery && (row.chapterNumber === 1 || titleText.includes("big-o"))) {
      score += 50;
      matchFound = true;
    }

    const isLinkedListQuery = cleanQuery.includes("linked list") || cleanQuery.includes("قائمة") || cleanQuery.includes("مترابطة") || cleanQuery.includes("pointer") || cleanQuery.includes("مؤشر");
    if (isLinkedListQuery && (row.chapterNumber === 2 || titleText.includes("linear") || titleText.includes("linked"))) {
      score += 50;
      matchFound = true;
    }

    const isTreeQuery = cleanQuery.includes("tree") || cleanQuery.includes("شجرة") || cleanQuery.includes("avl") || cleanQuery.includes("bst") || cleanQuery.includes("traversal");
    if (isTreeQuery && (row.chapterNumber === 3 || row.chapterNumber === 4 || titleText.includes("tree") || titleText.includes("bst") || titleText.includes("avl"))) {
      score += 50;
      matchFound = true;
    }

    if (matchFound) {
      // Add Base Doctor File Priority Weight (100)
      const totalScore = 100 + score;

      scoredMatches.push({
        id: row.id,
        courseCode: row.courseCode || "CS201",
        courseName: row.courseName || "Data Structures",
        courseNameAr: row.courseNameAr || "تراكيب البيانات",
        doctorName: row.doctorName || "Dr. Ahmad Khalil",
        chapterNumber: row.chapterNumber,
        chapterTitle: row.chapterTitle,
        chapterTitleAr: row.chapterTitleAr,
        type: row.type as any,
        title: row.title,
        titleAr: row.titleAr,
        description: row.description,
        fileName: row.fileName || `${row.courseCode}_Ch${row.chapterNumber}.pdf`,
        fileUrl: row.fileUrl,
        relevanceScore: totalScore,
        snippet: row.description || `Chapter ${row.chapterNumber} ${row.type.toUpperCase()}: ${row.title}`,
      });
    }
  }

  // Sort by highest score first
  scoredMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const topMatches = scoredMatches.slice(0, 5);
  const hasDoctorMatch = topMatches.length > 0;
  const topMatchScore = hasDoctorMatch ? topMatches[0].relevanceScore : 0;

  // Decide if external internet search / supplementary material is required
  // If no doctor match or student explicitly asked for broad external research/videos/articles
  const asksForExternal = cleanQuery.includes("internet") || cleanQuery.includes("إنترنت") || cleanQuery.includes("youtube") || cleanQuery.includes("فيديو") || cleanQuery.includes("reddit") || cleanQuery.includes("مقالات") || cleanQuery.includes("روسي") || cleanQuery.includes("russian") || cleanQuery.includes("خارجي");
  const requiresExternalSupplement = !hasDoctorMatch || asksForExternal;

  // Construct heads-up notice
  const headsUpNotice = isArabic
    ? "⚠️ تنبيه وإشعار أكاديمي: المعلومات والمصادر الإضافية التالية مستخرجة من مراجع خارجية / شبكة الإنترنت (خارج مواد وسلايدات المساق المقررة من قِبل مدرس المادة)، وهي للمطالعة والإثراء فقط."
    : "⚠️ Academic Heads-up Notice: The following supplementary explanation and resources are retrieved from external academic sources / the internet (outside of your instructor's official course slides and files), provided for extended study and enrichment.";

  // Format context block for the LLM
  let formattedContext = "";
  if (hasDoctorMatch) {
    formattedContext = `================================================================
⭐ HIGHEST PRIORITY: OFFICIAL DOCTOR COURSE FILES & SLIDES (SCORE: ${topMatchScore})
================================================================
You MUST answer the student's question directly from these instructor materials FIRST before consulting external knowledge.
Instructor Materials Retrieved:
${topMatches.map((m, idx) => `
${idx + 1}. [${m.courseCode}] ${m.courseName} | Chapter ${m.chapterNumber}: ${m.chapterTitle}
   - Content Type: ${m.type.toUpperCase()} | Uploaded by: ${m.doctorName}
   - Title: "${m.title}" (${m.titleAr || ""})
   - File Name: "${m.fileName}"
   - Instructions / Details: "${m.snippet}"
   - Priority Relevance Score: ${m.relevanceScore} (Doctor Materials Base: 100+)
`).join("")}
================================================================
STRICT PEDAGOGICAL RULES:
1. Always base your primary explanation on the doctor's slides and notes listed above. Cite the file name and chapter!
2. If external or internet information is included for further enrichment, YOU MUST prefix that external section with:
   "${headsUpNotice}"
================================================================`;
  }

  return {
    hasDoctorMatch,
    topMatchScore,
    matches: topMatches,
    formattedContext,
    requiresExternalSupplement,
    headsUpNotice,
  };
}
