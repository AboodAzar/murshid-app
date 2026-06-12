import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  users, courses, studentCourses, studyPlans, attendance,
  assignments, studentAssignments, coursePrerequisites,
  departments, academicAlerts, advisorReports,
} from "../../drizzle/schema";
import { eq, and, gte, lte, sql, count, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

async function resolveTargetStudent(
  db: any,
  user: { id: number; role: string },
  inputStudentId?: number
): Promise<{ targetStudentId: number; authorized: boolean }> {
  if (user.role === "student") return { targetStudentId: user.id, authorized: true };
  if (user.role === "admin") return { targetStudentId: inputStudentId ?? 0, authorized: true };
  if (user.role === "advisor") {
    if (!inputStudentId) return { targetStudentId: 0, authorized: false };
    const [student] = await db.select({ advisorId: users.advisorId })
      .from(users).where(and(eq(users.id, inputStudentId), eq(users.role, "student"))).limit(1);
    if (!student || student.advisorId !== user.id) return { targetStudentId: 0, authorized: false };
    return { targetStudentId: inputStudentId, authorized: true };
  }
  return { targetStudentId: 0, authorized: false };
}

const CAREER_PATHS = [
  { id: "software_engineer", title: "Software Engineer", titleAr: "مهندس برمجيات", description: "Design, develop, and maintain software applications and systems.", descriptionAr: "تصميم وتطوير وصيانة تطبيقات وأنظمة البرمجيات.", requiredSkills: ["programming", "algorithms", "databases", "software engineering"], recommendedCourses: ["Data Structures", "Algorithms", "Software Engineering", "Database Systems", "Web Development"], avgStartingSalary: "$65,000 - $85,000", growthOutlook: "High", industries: ["Tech", "Finance", "Healthcare", "Government"] },
  { id: "data_scientist", title: "Data Scientist", titleAr: "عالم بيانات", description: "Analyze complex data to help organizations make better decisions.", descriptionAr: "تحليل البيانات المعقدة لمساعدة المؤسسات على اتخاذ قرارات أفضل.", requiredSkills: ["statistics", "machine learning", "programming", "data visualization"], recommendedCourses: ["Statistics", "Machine Learning", "Data Mining", "Python Programming", "Big Data Analytics"], avgStartingSalary: "$70,000 - $95,000", growthOutlook: "Very High", industries: ["Tech", "Finance", "Healthcare", "Retail"] },
  { id: "cybersecurity_analyst", title: "Cybersecurity Analyst", titleAr: "محلل أمن سيبراني", description: "Protect systems and networks from digital attacks and threats.", descriptionAr: "حماية الأنظمة والشبكات من الهجمات الرقمية والتهديدات.", requiredSkills: ["network security", "risk assessment", "ethical hacking", "cryptography"], recommendedCourses: ["Network Security", "Cryptography", "Ethical Hacking", "Information Security", "Risk Management"], avgStartingSalary: "$60,000 - $80,000", growthOutlook: "Very High", industries: ["Defense", "Finance", "Tech", "Government"] },
  { id: "ai_engineer", title: "AI / ML Engineer", titleAr: "مهندس ذكاء اصطناعي", description: "Build and deploy machine learning models and AI systems.", descriptionAr: "بناء ونشر نماذج التعلم الآلي وأنظمة الذكاء الاصطناعي.", requiredSkills: ["machine learning", "deep learning", "programming", "mathematics"], recommendedCourses: ["Machine Learning", "Deep Learning", "Linear Algebra", "Neural Networks", "Computer Vision"], avgStartingSalary: "$75,000 - $100,000", growthOutlook: "Very High", industries: ["Tech", "Automotive", "Healthcare", "Finance"] },
  { id: "systems_architect", title: "Systems Architect", titleAr: "مهندس أنظمة", description: "Design and oversee the implementation of complex IT systems.", descriptionAr: "تصميم والإشراف على تنفيذ أنظمة تكنولوجيا المعلومات المعقدة.", requiredSkills: ["system design", "cloud computing", "networking", "databases"], recommendedCourses: ["Software Architecture", "Cloud Computing", "Distributed Systems", "Database Systems", "Network Protocols"], avgStartingSalary: "$80,000 - $110,000", growthOutlook: "High", industries: ["Tech", "Enterprise", "Finance", "Cloud"] },
  { id: "research_scientist", title: "Research Scientist", titleAr: "عالم بحث", description: "Conduct advanced research in computer science and related fields.", descriptionAr: "إجراء أبحاث متقدمة في علوم الحاسوب والمجالات ذات الصلة.", requiredSkills: ["research methodology", "mathematics", "programming", "technical writing"], recommendedCourses: ["Research Methods", "Advanced Algorithms", "Mathematics", "Technical Writing", "Scientific Computing"], avgStartingSalary: "$55,000 - $75,000", growthOutlook: "Moderate", industries: ["Academia", "Research Labs", "Tech R&D", "Government"] },
];

export const analyticsRouter = router({
  graduationRisk: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { overallRisk: "low", score: 0, factors: [], predictedGraduationSemester: null, estimatedCompletionDate: null };

      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1);
      const enrollments = await db.select({ status: studentCourses.status, gradePoints: studentCourses.gradePoints, courseId: studentCourses.courseId, semester: studentCourses.semester })
        .from(studentCourses).where(eq(studentCourses.studentId, targetStudentId));
      const attRows = await db.select({ status: attendance.status }).from(attendance).where(eq(attendance.studentId, targetStudentId));
      const overdueAssignments = await db.select({ id: studentAssignments.id })
        .from(studentAssignments).leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .where(and(eq(studentAssignments.studentId, targetStudentId), eq(studentAssignments.status, "pending"), lte(assignments.dueDate, new Date())));

      const gpa = parseFloat(plan?.currentGPA ?? "0");
      const totalCredits = plan?.totalCredits ?? 132;
      const completedCredits = plan?.completedCredits ?? 0;
      const creditProgress = totalCredits > 0 ? completedCredits / totalCredits : 0;
      const attTotal = attRows.length;
      const attPresent = attRows.filter((r: any) => r.status === "present" || r.status === "excused").length;
      const attRate = attTotal > 0 ? attPresent / attTotal : 1;

      let riskScore = 0;
      const factors: Array<{ label: string; labelAr: string; severity: "low" | "medium" | "high"; value: string; impact: number }> = [];

      if (gpa < 2.0) { riskScore += 35; factors.push({ label: "GPA below 2.0 (probation)", labelAr: "المعدل أقل من 2.0 (محاكمة)", severity: "high", value: gpa.toFixed(2), impact: 35 }); }
      else if (gpa < 2.5) { riskScore += 20; factors.push({ label: "GPA below 2.5", labelAr: "المعدل أقل من 2.5", severity: "medium", value: gpa.toFixed(2), impact: 20 }); }
      else if (gpa >= 3.5) { riskScore -= 10; }

      if (creditProgress < 0.25) { riskScore += 15; factors.push({ label: "Low credit completion", labelAr: "إكمال ساعات منخفض", severity: "medium", value: `${Math.round(creditProgress * 100)}%`, impact: 15 }); }
      if (attRate < 0.7) { riskScore += 20; factors.push({ label: "Attendance below 70%", labelAr: "الحضور أقل من 70%", severity: "high", value: `${Math.round(attRate * 100)}%`, impact: 20 }); }
      else if (attRate < 0.8) { riskScore += 10; factors.push({ label: "Attendance below 80%", labelAr: "الحضور أقل من 80%", severity: "medium", value: `${Math.round(attRate * 100)}%`, impact: 10 }); }
      if (overdueAssignments.length > 0) { riskScore += Math.min(overdueAssignments.length * 5, 20); factors.push({ label: "Overdue assignments", labelAr: "واجبات متأخرة", severity: overdueAssignments.length > 3 ? "high" : "medium", value: `${overdueAssignments.length}`, impact: Math.min(overdueAssignments.length * 5, 20) }); }

      const failedCourses = enrollments.filter((e: any) => e.status === "completed" && parseFloat(e.gradePoints ?? "0") < 2.0).length;
      if (failedCourses > 0) { riskScore += failedCourses * 5; factors.push({ label: "Failed courses", labelAr: "مقررات راسبة", severity: failedCourses > 2 ? "high" : "medium", value: `${failedCourses}`, impact: failedCourses * 5 }); }

      const activeAlerts = await db.select({ count: count() }).from(academicAlerts)
        .where(and(eq(academicAlerts.studentId, targetStudentId), eq(academicAlerts.isResolved, false), eq(academicAlerts.severity, "high")));
      if ((activeAlerts[0]?.count ?? 0) > 0) { riskScore += (activeAlerts[0].count as number) * 3; factors.push({ label: "Active high-severity alerts", labelAr: "تنبيهات عالية الخطورة", severity: "high", value: `${activeAlerts[0].count}`, impact: (activeAlerts[0].count as number) * 3 }); }

      riskScore = Math.max(0, Math.min(100, riskScore));
      const overallRisk = riskScore >= 60 ? "high" : riskScore >= 35 ? "medium" : "low";

      const completedSemesters = Math.max(1, ...enrollments.map((e: any) => e.semester ?? 1));
      const avgCreditsPerSem = completedSemesters > 0 ? completedCredits / completedSemesters : 15;
      const remainingCredits = totalCredits - completedCredits;
      const semestersRemaining = avgCreditsPerSem > 0 ? Math.ceil(remainingCredits / avgCreditsPerSem) : 8;
      const predictedGraduationSemester = completedSemesters + semestersRemaining;
      const estimatedDate = new Date(); estimatedDate.setMonth(estimatedDate.getMonth() + semestersRemaining * 4);

      return { overallRisk, score: riskScore, factors: factors.sort((a, b) => b.impact - a.impact), predictedGraduationSemester, estimatedCompletionDate: estimatedDate.toISOString().split("T")[0], stats: { gpa, completedCredits, totalCredits, attendanceRate: Math.round(attRate * 100), overdueAssignments: overdueAssignments.length } };
    }),

  gpaSimulator: protectedProcedure
    .input(z.object({ studentId: z.number().optional(), scenarios: z.array(z.object({ name: z.string(), nameAr: z.string().optional(), courseGrades: z.array(z.object({ courseId: z.number(), grade: z.string(), credits: z.number().optional() })) })) }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { currentGPA: 0, totalCredits: 0, scenarios: [] };

      const completedEnrollments = await db.select({ courseId: studentCourses.courseId, gradePoints: studentCourses.gradePoints, status: studentCourses.status })
        .from(studentCourses).where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.status, "completed")));
      const courseIds = completedEnrollments.map((e: any) => e.courseId);
      const courseDetails = courseIds.length > 0 ? await db.select({ id: courses.id, credits: courses.credits }).from(courses).where(inArray(courses.id, courseIds)) : [];
      const creditMap = new Map(courseDetails.map((c: any) => [c.id, c.credits]));
      const gradeToPoints: Record<string, number> = { "A": 4.0, "A-": 3.67, "B+": 3.33, "B": 3.0, "B-": 2.67, "C+": 2.33, "C": 2.0, "C-": 1.67, "D+": 1.33, "D": 1.0, "F": 0 };

      let currentQualityPoints = 0, currentEarnedCredits = 0;
      for (const e of completedEnrollments) { const credits = creditMap.get(e.courseId) ?? 3; const gp = parseFloat(e.gradePoints ?? "0"); currentQualityPoints += gp * credits; currentEarnedCredits += credits; }
      const currentGPA = currentEarnedCredits > 0 ? currentQualityPoints / currentEarnedCredits : 0;

      const scenarios = (input?.scenarios ?? []).map(scenario => {
        let simQP = currentQualityPoints, simEC = currentEarnedCredits;
        const courseResults: any[] = [];
        for (const cg of scenario.courseGrades) { const credits = cg.credits ?? 3; const points = gradeToPoints[cg.grade.toUpperCase()] ?? 0; simQP += points * credits; simEC += credits; courseResults.push({ courseId: cg.courseId, grade: cg.grade, points, credits, contribution: points * credits }); }
        const projectedGPA = simEC > 0 ? simQP / simEC : 0;
        return { name: scenario.name, nameAr: scenario.nameAr ?? scenario.name, projectedGPA: Math.round(projectedGPA * 100) / 100, projectedEarnedCredits: simEC, gpaChange: Math.round((projectedGPA - currentGPA) * 100) / 100, courseResults };
      });

      return { currentGPA: Math.round(currentGPA * 100) / 100, currentEarnedCredits, scenarios };
    }),

  academicHealth: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { overallScore: 0, categories: [], trend: "stable" };

      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1);
      const enrollments = await db.select({ status: studentCourses.status, gradePoints: studentCourses.gradePoints }).from(studentCourses).where(eq(studentCourses.studentId, targetStudentId));
      const attRows = await db.select({ status: attendance.status }).from(attendance).where(eq(attendance.studentId, targetStudentId));
      const overdueAssignments = await db.select({ id: studentAssignments.id }).from(studentAssignments).leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .where(and(eq(studentAssignments.studentId, targetStudentId), eq(studentAssignments.status, "pending"), lte(assignments.dueDate, new Date())));
      const activeAlerts = await db.select({ count: count() }).from(academicAlerts).where(and(eq(academicAlerts.studentId, targetStudentId), eq(academicAlerts.isResolved, false)));

      const gpa = parseFloat(plan?.currentGPA ?? "0");
      const totalCredits = plan?.totalCredits ?? 132;
      const completedCredits = plan?.completedCredits ?? 0;
      const attTotal = attRows.length;
      const attPresent = attRows.filter((r: any) => r.status === "present" || r.status === "excused").length;
      const attRate = attTotal > 0 ? attPresent / attTotal : 1;
      const creditProgress = totalCredits > 0 ? completedCredits / totalCredits : 0;
      const failedCourses = enrollments.filter((e: any) => e.status === "completed" && parseFloat(e.gradePoints ?? "0") < 2.0).length;

      const categories = [
        { id: "gpa", label: "GPA Performance", labelAr: "أداء المعدل", score: Math.round(Math.min(100, (gpa / 4.0) * 100)), weight: 0.30, status: gpa >= 3.0 ? "good" : gpa >= 2.0 ? "fair" : "poor" },
        { id: "attendance", label: "Attendance", labelAr: "الحضور", score: Math.round(attRate * 100), weight: 0.20, status: attRate >= 0.8 ? "good" : attRate >= 0.6 ? "fair" : "poor" },
        { id: "progress", label: "Degree Progress", labelAr: "تقدم الدرجة", score: Math.round(Math.min(100, creditProgress * 150)), weight: 0.20, status: creditProgress >= 0.5 ? "good" : creditProgress >= 0.25 ? "fair" : "poor" },
        { id: "assignments", label: "Assignment Health", labelAr: "صحة الواجبات", score: Math.max(0, 100 - overdueAssignments.length * 15), weight: 0.15, status: overdueAssignments.length === 0 ? "good" : overdueAssignments.length <= 2 ? "fair" : "poor" },
        { id: "alerts", label: "Alert Status", labelAr: "حالة التنبيهات", score: Math.max(0, 100 - (activeAlerts[0]?.count ?? 0) * 10), weight: 0.10, status: (activeAlerts[0]?.count ?? 0) === 0 ? "good" : (activeAlerts[0]?.count ?? 0) <= 2 ? "fair" : "poor" },
        { id: "courseSuccess", label: "Course Success", labelAr: "نجاح المقررات", score: Math.max(0, 100 - failedCourses * 10), weight: 0.05, status: failedCourses === 0 ? "good" : failedCourses <= 1 ? "fair" : "poor" },
      ];

      const overallScore = Math.round(categories.reduce((sum, c) => sum + c.score * c.weight, 0));
      const reports = await db.select({ gpaAtReport: advisorReports.gpaAtReport }).from(advisorReports).where(eq(advisorReports.studentId, targetStudentId)).orderBy(advisorReports.createdAt).limit(3);
      let trend: "improving" | "declining" | "stable" = "stable";
      if (reports.length >= 2) { const recent = parseFloat(reports[reports.length - 1]?.gpaAtReport ?? "0"); const older = parseFloat(reports[0]?.gpaAtReport ?? "0"); if (recent > older + 0.1) trend = "improving"; else if (recent < older - 0.1) trend = "declining"; }

      return { overallScore, categories, trend, summary: { gpa, attendanceRate: Math.round(attRate * 100), completedCredits, totalCredits, overdueCount: overdueAssignments.length } };
    }),

  successForecast: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { semesterForecasts: [], overallProjection: null, history: [], attendanceTrend: [] };

      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1);
      const enrollments = await db.select({ semester: studentCourses.semester, gradePoints: studentCourses.gradePoints, status: studentCourses.status }).from(studentCourses).where(eq(studentCourses.studentId, targetStudentId));
      const attRows = await db.select({ status: attendance.status, date: attendance.date }).from(attendance).where(eq(attendance.studentId, targetStudentId));

      const gpa = parseFloat(plan?.currentGPA ?? "0");
      const totalCredits = plan?.totalCredits ?? 132;
      const completedCredits = plan?.completedCredits ?? 0;
      const remainingCredits = totalCredits - completedCredits;

      const semMap = new Map<number, number[]>();
      for (const e of enrollments) { if (e.status === "completed" && e.gradePoints != null) { const list = semMap.get(e.semester) || []; list.push(parseFloat(e.gradePoints)); semMap.set(e.semester, list); } }
      const history = [...semMap.entries()].sort((a, b) => a[0] - b[0]).map(([sem, grades]) => ({ semester: sem, gpa: Math.round((grades.reduce((s, v) => s + v, 0) / grades.length) * 100) / 100 }));

      const n = history.length;
      let trendSlope = 0;
      if (n >= 2) { const xs = history.map((_, i) => i); const ys = history.map(h => h.gpa); const sumX = xs.reduce((a, b) => a + b, 0); const sumY = ys.reduce((a, b) => a + b, 0); const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0); const sumX2 = xs.reduce((s, x) => s + x * x, 0); trendSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); }

      const currentSem = history.length > 0 ? Math.max(...history.map(h => h.semester)) : 1;
      let projectedGPA = gpa;
      const semesterForecasts: any[] = [];
      for (let i = 1; i <= 3; i++) {
        const sem = currentSem + i;
        projectedGPA = Math.max(0, Math.min(4.0, projectedGPA + trendSlope));
        const confidence = n >= 4 ? "high" : n >= 2 ? "medium" : "low";
        const projCredits = Math.min(remainingCredits, 18 * i);
        let rec = "Maintain your current study habits."; let recAr = "حافظ على عاداتك الدراسية الحالية.";
        if (projectedGPA < 2.0) { rec = "Urgent: Seek academic support and tutoring immediately."; recAr = "عاجل: اطلب الدعم الأكاديمي والتوجيه فوراً."; }
        else if (projectedGPA < 2.5) { rec = "Consider reducing course load and focusing on weaker subjects."; recAr = "فكر في تقليل الحمل الدراسي والتركيز على المواد الأضعف."; }
        else if (projectedGPA >= 3.5) { rec = "Excellent trajectory. Consider advanced courses or research opportunities."; recAr = "مسار ممتاز. فكر بالمقررات المتقدمة أو فرص البحث."; }
        semesterForecasts.push({ semester: sem, projectedGPA: Math.round(projectedGPA * 100) / 100, confidence, projectedCredits: projCredits, recommendation: rec, recommendationAr: recAr });
      }

      const monthlyAtt = new Map<string, { present: number; total: number }>();
      for (const a of attRows) { const key = new Date(a.date).toISOString().slice(0, 7); const existing = monthlyAtt.get(key) || { present: 0, total: 0 }; existing.total++; if (a.status === "present" || a.status === "excused") existing.present++; monthlyAtt.set(key, existing); }
      const attendanceTrend = [...monthlyAtt.entries()].sort().map(([month, stats]) => ({ month, rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0 }));

      return { semesterForecasts, overallProjection: { currentGPA: Math.round(gpa * 100) / 100, trendDirection: trendSlope > 0.05 ? "improving" : trendSlope < -0.05 ? "declining" : "stable", trendSlope: Math.round(trendSlope * 100) / 100, estimatedGraduationSemester: currentSem + Math.ceil(remainingCredits / 15), confidenceLevel: n >= 4 ? "high" : n >= 2 ? "medium" : "low" }, history, attendanceTrend };
    }),

  smartRecommendations: protectedProcedure
    .input(z.object({ studentId: z.number().optional(), semester: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { recommendations: [] };

      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1);
      const completed = await db.select({ courseId: studentCourses.courseId, gradePoints: studentCourses.gradePoints }).from(studentCourses).where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.status, "completed")));
      const inProgress = await db.select({ courseId: studentCourses.courseId }).from(studentCourses).where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.status, "in_progress")));
      const allCourses = await db.select().from(courses);
      const prereqs = await db.select().from(coursePrerequisites);

      const completedIds = new Set(completed.map((e: any) => e.courseId));
      const inProgressIds = new Set(inProgress.map((e: any) => e.courseId));
      const gpa = parseFloat(plan?.currentGPA ?? "0");
      const currentSem = input?.semester ?? (plan?.completedCredits ? Math.ceil(plan.completedCredits / 15) + 1 : 1);

      const prereqMap = new Map<number, number[]>();
      for (const p of prereqs) { const list = prereqMap.get(p.courseId) || []; list.push(p.prerequisiteId); prereqMap.set(p.courseId, list); }

      const scored = allCourses.filter((c: any) => !completedIds.has(c.id) && !inProgressIds.has(c.id)).map((c: any) => {
        const reqs = prereqMap.get(c.id) || [];
        const prereqsMet = reqs.every((r: number) => completedIds.has(r));
        if (!prereqsMet) return null;

        let score = 0;
        if (c.isRequired) score += 20;
        if (c.semester <= currentSem + 1) score += 15;
        if (c.semester === currentSem) score += 10;
        const avgGP = completed.reduce((sum: number, e: any) => sum + parseFloat(e.gradePoints ?? "0"), 0) / (completed.length || 1);
        if (avgGP >= 3.0 && c.minGPA && parseFloat(c.minGPA) <= avgGP) score += 10;
        if (c.credits <= 3) score += 5;
        const deptCompleted = completed.filter((e: any) => { const course = allCourses.find((co: any) => co.id === e.courseId); return course && course.departmentId === c.departmentId; }).length;
        if (deptCompleted >= 2) score += 5;
        return { ...c, score, reason: c.isRequired ? "Required course for your degree" : "Aligns with your academic progress", reasonAr: c.isRequired ? "مقرر مطلوب لدرجتك" : "يتوافق مع تقدمك الأكاديمي" };
      }).filter(Boolean);

      const recommendations = (scored as any[]).sort((a, b) => b.score - a.score).slice(0, 8);
      return { recommendations };
    }),

  earlyWarnings: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { warnings: [] };

      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1);
      const enrollments = await db.select({ status: studentCourses.status, gradePoints: studentCourses.gradePoints, courseId: studentCourses.courseId, semester: studentCourses.semester }).from(studentCourses).where(eq(studentCourses.studentId, targetStudentId));
      const attRows = await db.select({ status: attendance.status, courseId: attendance.courseId }).from(attendance).where(eq(attendance.studentId, targetStudentId));
      const overdueAssignments = await db.select({ courseId: assignments.courseId }).from(studentAssignments).leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .where(and(eq(studentAssignments.studentId, targetStudentId), eq(studentAssignments.status, "pending"), lte(assignments.dueDate, new Date())));
      const inProgressCoursesRaw = await db.select({ courseId: studentCourses.courseId }).from(studentCourses).where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.status, "in_progress")));
      const inProgressCourses = inProgressCoursesRaw.filter((c: any, index: number, self: any[]) =>
        index === self.findIndex((x: any) => x.courseId === c.courseId)
      );

      const gpa = parseFloat(plan?.currentGPA ?? "0");
      const warnings: Array<{ id: string; type: string; severity: "low" | "medium" | "high" | "critical"; title: string; titleAr: string; message: string; messageAr: string; actionable: boolean; actionText: string; actionTextAr: string }> = [];

      if (gpa < 2.0) warnings.push({ id: "gpa-critical", type: "gpa_drop", severity: "critical", title: "Academic Probation Risk", titleAr: "خطر المحاكمة الأكاديمية", message: `Your GPA (${gpa.toFixed(2)}) is below the 2.0 probation threshold.`, messageAr: `معدلك (${gpa.toFixed(2)}) أقل من حد المحاكمة 2.0.`, actionable: true, actionText: "Meet with advisor immediately", actionTextAr: "الاجتماع بالمرشد فوراً" });
      else if (gpa < 2.5) warnings.push({ id: "gpa-warning", type: "gpa_drop", severity: "high", title: "GPA Declining", titleAr: "انخفاض المعدل", message: `Your GPA (${gpa.toFixed(2)}) is below the recommended 2.5 level.`, messageAr: `معدلك (${gpa.toFixed(2)}) أقل من المستوى الموصى به 2.5.`, actionable: true, actionText: "Review study strategies", actionTextAr: "مراجعة استراتيجيات الدراسة" });

      for (const course of inProgressCourses) {
        const courseAtt = attRows.filter((a: any) => a.courseId === course.courseId);
        const total = courseAtt.length;
        const present = courseAtt.filter((a: any) => a.status === "present" || a.status === "excused").length;
        const rate = total > 0 ? present / total : 1;
        if (rate < 0.6) warnings.push({ id: `att-${course.courseId}`, type: "attendance", severity: "high", title: "Critical Attendance Drop", titleAr: "انخفاض حرج في الحضور", message: `Attendance for this course has dropped to ${Math.round(rate * 100)}%.`, messageAr: `انخفض حضور هذا المقرر إلى ${Math.round(rate * 100)}%.`, actionable: true, actionText: "Check attendance policy", actionTextAr: "تحقق من سياسة الحضور" });
        else if (rate < 0.75) warnings.push({ id: `att-${course.courseId}`, type: "attendance", severity: "medium", title: "Attendance Warning", titleAr: "تحذير الحضور", message: `Attendance for this course is at ${Math.round(rate * 100)}%.`, messageAr: `حضور هذا المقرر عند ${Math.round(rate * 100)}%.`, actionable: true, actionText: "Improve attendance", actionTextAr: "حسّن الحضور" });
      }

      const overdueByCourse = new Map<number, number>();
      for (const o of overdueAssignments) {
        const cid = o.courseId;
        if (typeof cid === "number") overdueByCourse.set(cid, (overdueByCourse.get(cid) || 0) + 1);
      }
      for (const [courseId, count] of overdueByCourse) {
        if (count >= 3) warnings.push({ id: `overdue-${courseId}`, type: "missing_assignments", severity: "high", title: "Multiple Overdue Assignments", titleAr: "واجبات متأخرة متعددة", message: `${count} overdue assignments detected.`, messageAr: `تم اكتشاف ${count} واجب متأخر.`, actionable: true, actionText: "Submit pending work", actionTextAr: "سلّم الواجبات المعلقة" });
      }

      const failedCourses = enrollments.filter((e: any) => e.status === "completed" && parseFloat(e.gradePoints ?? "0") < 2.0).length;
      if (failedCourses >= 2) warnings.push({ id: "failures", type: "at_risk", severity: "high", title: "Repeated Course Failures", titleAr: "إخفاقات متكررة في المقررات", message: `${failedCourses} courses have been failed. Consider tutoring support.`, messageAr: `تم رسوب ${failedCourses} مقررات. فكر بالحصول على دعم توجيهي.`, actionable: true, actionText: "Find tutoring resources", actionTextAr: "ابحث عن موارد التوجيه" });

      const creditProgress = (plan?.completedCredits ?? 0) / (plan?.totalCredits ?? 132);
      if (creditProgress < 0.25 && (plan?.completedCredits ?? 0) > 30) warnings.push({ id: "slow-progress", type: "at_risk", severity: "medium", title: "Slow Degree Progress", titleAr: "تقدم بطيء في الدرجة", message: "You are falling behind the expected graduation timeline.", messageAr: "أنت متأخر عن الجدول الزمني المتوقع للتخرج.", actionable: true, actionText: "Review study plan", actionTextAr: "راجع الخطة الدراسية" });

      return { warnings: warnings.sort((a, b) => { const s = { critical: 4, high: 3, medium: 2, low: 1 }; return s[b.severity] - s[a.severity]; }) };
    }),

  degreeRoadmap: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { roadmap: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, electiveCredits: 0 };

      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1);
      const enrollments = await db.select({ courseId: studentCourses.courseId, status: studentCourses.status, gradePoints: studentCourses.gradePoints }).from(studentCourses).where(eq(studentCourses.studentId, targetStudentId));
      const allCourses = await db.select().from(courses);
      const deptId = (await db.select({ departmentId: users.departmentId }).from(users).where(eq(users.id, targetStudentId)).limit(1))[0]?.departmentId;
      const deptCourses = allCourses.filter((c: any) => c.departmentId === deptId);

      const completedIds = new Set(enrollments.filter((e: any) => e.status === "completed").map((e: any) => e.courseId));
      const inProgressIds = new Set(enrollments.filter((e: any) => e.status === "in_progress").map((e: any) => e.courseId));
      const totalCredits = plan?.totalCredits ?? 132;
      const completedCredits = plan?.completedCredits ?? 0;

      const roadmap = deptCourses.map((c: any) => {
        const status = completedIds.has(c.id) ? "completed" : inProgressIds.has(c.id) ? "in_progress" : "planned";
        const enrollment = enrollments.find((e: any) => e.courseId === c.id);
        return { id: c.id, code: c.code, name: c.name, nameAr: c.nameAr, credits: c.credits, semester: c.semester, isRequired: c.isRequired, status, grade: enrollment?.gradePoints ?? null };
      }).sort((a: any, b: any) => a.semester - b.semester || a.code.localeCompare(b.code));

      const requiredCredits = roadmap.filter((c: any) => c.isRequired && c.status === "completed").reduce((s: number, c: any) => s + c.credits, 0);
      const electiveCredits = roadmap.filter((c: any) => !c.isRequired && c.status === "completed").reduce((s: number, c: any) => s + c.credits, 0);

      return { roadmap, totalCredits, completedCredits, requiredCredits, electiveCredits };
    }),

  semesterPlanner: protectedProcedure
    .input(z.object({ studentId: z.number().optional(), targetSemester: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { plan: null, totalCredits: 0, estimatedWorkload: "medium", recommendations: [] };

      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1);
      const completed = await db.select({ courseId: studentCourses.courseId, status: studentCourses.status, gradePoints: studentCourses.gradePoints }).from(studentCourses).where(eq(studentCourses.studentId, targetStudentId));
      const allCourses = await db.select().from(courses);
      const prereqs = await db.select().from(coursePrerequisites);
      const deptId = (await db.select({ departmentId: users.departmentId }).from(users).where(eq(users.id, targetStudentId)).limit(1))[0]?.departmentId;

      const completedIds = new Set(completed.filter((e: any) => e.status === "completed").map((e: any) => e.courseId));
      const inProgressIds = new Set(completed.filter((e: any) => e.status === "in_progress").map((e: any) => e.courseId));
      const targetSem = input?.targetSemester ?? (plan?.completedCredits ? Math.ceil(plan.completedCredits / 15) + 1 : 1);
      const gpa = parseFloat(plan?.currentGPA ?? "0");

      const prereqMap = new Map<number, number[]>();
      for (const p of prereqs) { const list = prereqMap.get(p.courseId) || []; list.push(p.prerequisiteId); prereqMap.set(p.courseId, list); }

      const available = allCourses.filter((c: any) => {
        if (completedIds.has(c.id) || inProgressIds.has(c.id)) return false;
        const reqs = prereqMap.get(c.id) || [];
        return reqs.every((r: number) => completedIds.has(r));
      });

      // Build an optimized semester plan
      const required = available.filter((c: any) => c.isRequired && c.departmentId === deptId).sort((a: any, b: any) => a.semester - b.semester);
      const electives = available.filter((c: any) => !c.isRequired || c.departmentId !== deptId).sort((a: any, b: any) => a.semester - b.semester);

      let creditSum = 0;
      const planCourses: any[] = [];
      for (const c of required) { if (creditSum + c.credits <= 18) { planCourses.push({ ...c, reason: "Required for degree", reasonAr: "مطلوب للدرجة" }); creditSum += c.credits; } }
      for (const c of electives) { if (creditSum + c.credits <= 18 && planCourses.length < 6) { planCourses.push({ ...c, reason: "Elective / General", reasonAr: "اختياري / عام" }); creditSum += c.credits; } }

      const estimatedWorkload = creditSum <= 12 ? "light" : creditSum <= 15 ? "medium" : "heavy";
      let rec = "This is a balanced semester plan."; let recAr = "هذه خطة فصل متوازنة.";
      if (estimatedWorkload === "heavy") { rec = "Consider reducing to 15 credits if your GPA is below 3.0."; recAr = "فكر في تقليلها إلى 15 ساعة إذا كان معدلك أقل من 3.0."; }
      else if (estimatedWorkload === "light" && gpa >= 3.5) { rec = "You may add an advanced course given your strong GPA."; recAr = "يمكنك إضافة مقرر متقدم نظراً لمعدلك القوي."; }

      return { plan: { semester: targetSem, courses: planCourses, totalCredits: creditSum }, totalCredits: creditSum, estimatedWorkload, recommendations: [rec, recAr] };
    }),

  careerPaths: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) throw new TRPCError({ code: "FORBIDDEN" });
      if (!targetStudentId) return { matches: [] };

      const completed = await db.select({ courseId: studentCourses.courseId, gradePoints: studentCourses.gradePoints }).from(studentCourses).where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.status, "completed")));
      const allCourses = await db.select().from(courses);
      const courseMap = new Map(allCourses.map((c: any) => [c.id, c]));

      const completedCourseNames = completed.map((e: any) => { const c = courseMap.get(e.courseId); return c ? c.name.toLowerCase() : ""; }).filter(Boolean);
      const completedIds = new Set(completed.map((e: any) => e.courseId));
      const gpa = parseFloat((await db.select({ currentGPA: studyPlans.currentGPA }).from(studyPlans).where(eq(studyPlans.studentId, targetStudentId)).limit(1))[0]?.currentGPA ?? "0");

      const matches = CAREER_PATHS.map(path => {
        const matchedSkills = path.requiredSkills.filter(skill => completedCourseNames.some(name => name.includes(skill.toLowerCase()))).length;
        const matchedCourses = path.recommendedCourses.filter(rc => completedCourseNames.some(name => name.toLowerCase().includes(rc.toLowerCase()))).length;
        const missingCourses = path.recommendedCourses.filter(rc => !completedCourseNames.some(name => name.toLowerCase().includes(rc.toLowerCase())));
        const matchScore = Math.round(((matchedSkills / path.requiredSkills.length) * 0.4 + (matchedCourses / path.recommendedCourses.length) * 0.4 + (gpa / 4.0) * 0.2) * 100);
        return { ...path, matchScore, matchedSkills, matchedCourses, missingCourses, readinessLevel: matchScore >= 70 ? "ready" : matchScore >= 40 ? "developing" : "early" };
      }).sort((a, b) => b.matchScore - a.matchScore);

      return { matches: matches.slice(0, 4) };
    }),

  advisorInsights: protectedProcedure
    .input(z.object({ advisorId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (ctx.user.role !== "advisor" && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      const advisorId = input?.advisorId ?? ctx.user.id;
      const studentCond = ctx.user.role === "advisor" ? eq(users.advisorId, advisorId) : eq(users.role, "student");
      const students = await db.select({ id: users.id, name: users.name }).from(users).where(and(eq(users.role, "student"), studentCond));
      const studentIds = students.map((s: any) => s.id);
      if (studentIds.length === 0) return { totalStudents: 0, atRiskCount: 0, averageGpa: "0.00", averageAttendance: 0, commonIssues: [], topRecommendations: [], cohortAnalysis: [] };

      let totalGpa = 0, gpaCount = 0, totalAtt = 0, attCount = 0, atRiskCount = 0;
      const issueCounts = new Map<string, number>();
      const courseEnrollments: any[] = [];

      for (const sid of studentIds) {
        const [plan] = await db.select({ currentGPA: studyPlans.currentGPA }).from(studyPlans).where(eq(studyPlans.studentId, sid)).limit(1);
        const attRows = await db.select({ status: attendance.status }).from(attendance).where(eq(attendance.studentId, sid));
        const gpaVal = parseFloat(plan?.currentGPA ?? "0");
        const attTotal = attRows.length;
        const attPresent = attRows.filter((r: any) => r.status === "present" || r.status === "excused").length;
        const attRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;
        if (gpaVal > 0) { totalGpa += gpaVal; gpaCount++; }
        totalAtt += attRate; attCount++;
        if (gpaVal < 2.0 || attRate < 70) atRiskCount++;
        if (gpaVal < 2.5) issueCounts.set("low_gpa", (issueCounts.get("low_gpa") || 0) + 1);
        if (attRate < 75) issueCounts.set("low_attendance", (issueCounts.get("low_attendance") || 0) + 1);
      }

      const commonIssues = [...issueCounts.entries()].map(([key, count]) => ({ issue: key, count, percentage: Math.round((count / studentIds.length) * 100) })).sort((a, b) => b.count - a.count);

      // Cohort analysis by semester performance
      const enrollments = await db.select({ studentId: studentCourses.studentId, semester: studentCourses.semester, gradePoints: studentCourses.gradePoints, status: studentCourses.status }).from(studentCourses).where(inArray(studentCourses.studentId, studentIds));
      const semMap = new Map<number, { total: number; count: number }>();
      for (const e of enrollments) { if (e.status === "completed" && e.gradePoints) { const s = semMap.get(e.semester) || { total: 0, count: 0 }; s.total += parseFloat(e.gradePoints); s.count++; semMap.set(e.semester, s); } }
      const cohortAnalysis = [...semMap.entries()].sort((a, b) => a[0] - b[0]).map(([sem, stats]) => ({ semester: sem, averageGpa: stats.count > 0 ? (stats.total / stats.count).toFixed(2) : "0.00", studentCount: stats.count }));

      return { totalStudents: studentIds.length, atRiskCount, averageGpa: gpaCount > 0 ? (totalGpa / gpaCount).toFixed(2) : "0.00", averageAttendance: attCount > 0 ? Math.round(totalAtt / attCount) : 0, commonIssues, topRecommendations: commonIssues.slice(0, 3), cohortAnalysis };
    }),
});

