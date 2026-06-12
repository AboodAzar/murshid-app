import { router, protectedProcedure, advisorProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  users, courses, studentCourses, studyPlans, attendance,
  assignments, studentAssignments, aiConversations, chatMessages,
  advisorNotes, academicAlerts, recommendations, appointments,
  advisorReports, departments,
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql, count, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

async function assertAssignedStudent(db: any, advisorId: number, studentId: number) {
  const [student] = await db.select({ advisorId: users.advisorId }).from(users)
    .where(and(eq(users.id, studentId), eq(users.role, "student"))).limit(1);
  if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
  if (student.advisorId !== advisorId) throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized for this student" });
}

export const advisorRouter = router({
  getAssignedStudents: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (ctx.user.role !== "advisor" && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const cond = ctx.user.role === "advisor" ? eq(users.advisorId, ctx.user.id) : eq(users.role, "student");
    const rows = await db.select({ id: users.id, name: users.name, email: users.email, departmentId: users.departmentId, createdAt: users.createdAt })
      .from(users).where(and(eq(users.role, "student"), cond)).orderBy(desc(users.createdAt));
    const enriched: any[] = [];
    for (const s of rows) {
      const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, s.id)).limit(1);
      const attRows = await db.select({ status: attendance.status }).from(attendance).where(eq(attendance.studentId, s.id));
      const attTotal = attRows.length;
      const attPresent = attRows.filter((r: any) => r.status === "present" || r.status === "excused").length;
      const attRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;
      const gpaVal = parseFloat(plan?.currentGPA ?? "0");
      enriched.push({ ...s, gpa: plan?.currentGPA ?? "0.00", credits: plan?.completedCredits ?? 0, attendanceRate: attRate,
        riskLevel: gpaVal < 2.0 || attRate < 70 ? "high" : gpaVal < 2.5 ? "medium" : "low" });
    }
    return enriched;
  }),

  getStudentProfile: protectedProcedure.input(z.object({ studentId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (ctx.user.role === "advisor") await assertAssignedStudent(db, ctx.user.id, input.studentId);
    else if (ctx.user.role === "student" && ctx.user.id !== input.studentId) throw new TRPCError({ code: "FORBIDDEN" });
    const [student] = await db.select({ id: users.id, name: users.name, email: users.email, departmentId: users.departmentId, createdAt: users.createdAt })
      .from(users).where(eq(users.id, input.studentId)).limit(1);
    if (!student) throw new TRPCError({ code: "NOT_FOUND" });
    const [dept] = await db.select({ name: departments.name, nameAr: departments.nameAr }).from(departments)
      .where(eq(departments.id, student.departmentId ?? 0)).limit(1);
    const enrollments = await db.select({ id: studentCourses.id, courseId: studentCourses.courseId, status: studentCourses.status, grade: studentCourses.grade, gradePoints: studentCourses.gradePoints, semester: studentCourses.semester })
      .from(studentCourses).where(eq(studentCourses.studentId, input.studentId));
    const courseIds = enrollments.map((e: any) => e.courseId);
    const courseDetails = courseIds.length > 0 ? await db.select().from(courses).where(inArray(courses.id, courseIds)) : [];
    const courseMap = new Map(courseDetails.map((c: any) => [c.id, c]));
    const uniqueEnrollments = enrollments.filter((e: any, index: number, self: any[]) =>
      index === self.findIndex((x: any) => x.courseId === e.courseId)
    );
    const enrichedCourses = uniqueEnrollments.map((e: any) => ({ ...e, course: courseMap.get(e.courseId) ?? null }));
    const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, input.studentId)).limit(1);
    const attRows = await db.select({ status: attendance.status }).from(attendance).where(eq(attendance.studentId, input.studentId));
    const attTotal = attRows.length;
    const attPresent = attRows.filter((r: any) => r.status === "present" || r.status === "excused").length;
    const attRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;
    const alertCount = await db.select({ count: count() }).from(academicAlerts)
      .where(and(eq(academicAlerts.studentId, input.studentId), eq(academicAlerts.isResolved, false)));
    const noteCount = await db.select({ count: count() }).from(advisorNotes).where(eq(advisorNotes.studentId, input.studentId));
    return { student, department: dept ?? null, courses: enrichedCourses, studyPlan: plan ?? null,
      stats: { gpa: plan?.currentGPA ?? "0.00", earnedCredits: plan?.completedCredits ?? 0, totalCredits: plan?.totalCredits ?? 132,
        attendanceRate: attRate, activeAlerts: alertCount[0]?.count ?? 0, totalNotes: noteCount[0]?.count ?? 0 } };
  }),

  getAlerts: protectedProcedure.input(z.object({ studentId: z.number().optional() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (ctx.user.role === "student") {
      const rows = await db.select().from(academicAlerts).where(eq(academicAlerts.studentId, ctx.user.id)).orderBy(desc(academicAlerts.createdAt));
      return rows;
    }
    if (ctx.user.role === "advisor") {
      if (input?.studentId) {
        await assertAssignedStudent(db, ctx.user.id, input.studentId);
        const rows = await db.select().from(academicAlerts).where(eq(academicAlerts.studentId, input.studentId)).orderBy(desc(academicAlerts.createdAt));
        return rows;
      }
      // No studentId provided - return alerts for all assigned students
      const assigned = await db.select({ id: users.id }).from(users).where(and(eq(users.role, "student"), eq(users.advisorId, ctx.user.id)));
      const studentIds = assigned.map(s => s.id);
      if (studentIds.length === 0) return [];
      const rows = await db.select().from(academicAlerts).where(inArray(academicAlerts.studentId, studentIds)).orderBy(desc(academicAlerts.createdAt));
      return rows;
    }
    // Admin or other roles
    const studentId = input?.studentId ?? ctx.user.id;
    const rows = await db.select().from(academicAlerts).where(eq(academicAlerts.studentId, studentId)).orderBy(desc(academicAlerts.createdAt));
    return rows;
  }),

  createAlert: advisorProcedure.input(z.object({ studentId: z.number(), title: z.string().min(1), message: z.string().min(1),
    severity: z.enum(["low", "medium", "high", "critical"]),
    type: z.enum(["attendance", "gpa_drop", "missing_assignments", "at_risk", "probation", "custom"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await assertAssignedStudent(db, ctx.user.id, input.studentId);
      await db.insert(academicAlerts).values({ advisorId: ctx.user.id, studentId: input.studentId, title: input.title, message: input.message, severity: input.severity, type: input.type, isResolved: false });
      return { success: true };
    }),

  resolveAlert: advisorProcedure.input(z.object({ alertId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [alert] = await db.select({ advisorId: academicAlerts.advisorId, studentId: academicAlerts.studentId }).from(academicAlerts).where(eq(academicAlerts.id, input.alertId)).limit(1);
    if (!alert) throw new TRPCError({ code: "NOT_FOUND" });
    await assertAssignedStudent(db, ctx.user.id, alert.studentId);
    await db.update(academicAlerts).set({ isResolved: true, resolvedAt: new Date(), resolvedBy: ctx.user.id }).where(eq(academicAlerts.id, input.alertId));
    return { success: true };
  }),

  deleteAlert: advisorProcedure.input(z.number()).mutation(async ({ ctx, input: alertId }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [alert] = await db.select({ advisorId: academicAlerts.advisorId, studentId: academicAlerts.studentId }).from(academicAlerts).where(eq(academicAlerts.id, alertId)).limit(1);
    if (!alert) throw new TRPCError({ code: "NOT_FOUND" });
    await assertAssignedStudent(db, ctx.user.id, alert.studentId);
    await db.delete(academicAlerts).where(eq(academicAlerts.id, alertId));
    return { success: true };
  }),

  getRecommendations: protectedProcedure.input(z.object({ studentId: z.number().optional() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    let studentId: number;
    if (ctx.user.role === "student") studentId = ctx.user.id;
    else if (ctx.user.role === "advisor") { if (!input?.studentId) throw new TRPCError({ code: "BAD_REQUEST" }); await assertAssignedStudent(db, ctx.user.id, input.studentId); studentId = input.studentId; }
    else studentId = input?.studentId ?? ctx.user.id;
    const rows = await db.select().from(recommendations).where(eq(recommendations.studentId, studentId)).orderBy(desc(recommendations.createdAt));
    return rows;
  }),

  createRecommendation: advisorProcedure.input(z.object({ studentId: z.number(), title: z.string().min(1), description: z.string().min(1),
    priority: z.enum(["low", "medium", "high"]).default("medium"), courseId: z.number().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await assertAssignedStudent(db, ctx.user.id, input.studentId);
      await db.insert(recommendations).values({ advisorId: ctx.user.id, studentId: input.studentId, courseId: input.courseId ?? null, title: input.title, description: input.description, priority: input.priority, status: "pending", dueDate: input.dueDate ? new Date(input.dueDate) : null });
      return { success: true };
    }),

  updateRecommendationStatus: advisorProcedure.input(z.object({ id: z.number(), status: z.enum(["pending", "accepted", "rejected", "completed"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [rec] = await db.select({ studentId: recommendations.studentId }).from(recommendations).where(eq(recommendations.id, input.id)).limit(1);
      if (!rec) throw new TRPCError({ code: "NOT_FOUND" });
      await assertAssignedStudent(db, ctx.user.id, rec.studentId);
      await db.update(recommendations).set({ status: input.status }).where(eq(recommendations.id, input.id));
      return { success: true };
    }),

  deleteRecommendation: advisorProcedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [rec] = await db.select({ studentId: recommendations.studentId }).from(recommendations).where(eq(recommendations.id, id)).limit(1);
    if (!rec) throw new TRPCError({ code: "NOT_FOUND" });
    await assertAssignedStudent(db, ctx.user.id, rec.studentId);
    await db.delete(recommendations).where(eq(recommendations.id, id));
    return { success: true };
  }),

  getNotes: protectedProcedure.input(z.object({ studentId: z.number().optional() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (ctx.user.role === "student") {
      const rows = await db.select().from(advisorNotes)
        .where(and(eq(advisorNotes.studentId, ctx.user.id), eq(advisorNotes.isPrivate, false)))
        .orderBy(desc(advisorNotes.createdAt));
      return rows;
    }
    if (ctx.user.role === "advisor") {
      if (input?.studentId) {
        await assertAssignedStudent(db, ctx.user.id, input.studentId);
        const rows = await db.select().from(advisorNotes)
          .where(eq(advisorNotes.studentId, input.studentId))
          .orderBy(desc(advisorNotes.createdAt));
        return rows;
      }
      // No studentId provided - return notes for all assigned students
      const assigned = await db.select({ id: users.id }).from(users).where(and(eq(users.role, "student"), eq(users.advisorId, ctx.user.id)));
      const studentIds = assigned.map(s => s.id);
      if (studentIds.length === 0) return [];
      const rows = await db.select().from(advisorNotes)
        .where(inArray(advisorNotes.studentId, studentIds))
        .orderBy(desc(advisorNotes.createdAt));
      return rows;
    }
    // Admin or other roles
    const studentId = input?.studentId ?? ctx.user.id;
    const rows = await db.select().from(advisorNotes)
      .where(eq(advisorNotes.studentId, studentId))
      .orderBy(desc(advisorNotes.createdAt));
    return rows;
  }),

  addNote: advisorProcedure.input(z.object({ studentId: z.number(), title: z.string().min(1), content: z.string().min(1),
    category: z.enum(["general", "academic", "behavioral", "career", "attendance", "gpa"]).default("general"), isPrivate: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await assertAssignedStudent(db, ctx.user.id, input.studentId);
      await db.insert(advisorNotes).values({ advisorId: ctx.user.id, studentId: input.studentId, title: input.title, content: input.content, category: input.category, isPrivate: input.isPrivate });
      return { success: true };
    }),

  updateNote: advisorProcedure.input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(),
    category: z.enum(["general", "academic", "behavioral", "career", "attendance", "gpa"]).optional(), isPrivate: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [note] = await db.select({ studentId: advisorNotes.studentId, advisorId: advisorNotes.advisorId }).from(advisorNotes).where(eq(advisorNotes.id, input.id)).limit(1);
      if (!note) throw new TRPCError({ code: "NOT_FOUND" });
      if (note.advisorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      const update: any = {}; if (input.title !== undefined) update.title = input.title; if (input.content !== undefined) update.content = input.content;
      if (input.category !== undefined) update.category = input.category; if (input.isPrivate !== undefined) update.isPrivate = input.isPrivate;
      await db.update(advisorNotes).set(update).where(eq(advisorNotes.id, input.id));
      return { success: true };
    }),

  deleteNote: advisorProcedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [note] = await db.select({ advisorId: advisorNotes.advisorId, studentId: advisorNotes.studentId }).from(advisorNotes).where(eq(advisorNotes.id, id)).limit(1);
    if (!note) throw new TRPCError({ code: "NOT_FOUND" }); if (note.advisorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
    await db.delete(advisorNotes).where(eq(advisorNotes.id, id)); return { success: true };
  }),

  getAppointments: protectedProcedure.input(z.object({ studentId: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    let cond: any;
    if (ctx.user.role === "student") cond = eq(appointments.studentId, ctx.user.id);
    else if (ctx.user.role === "advisor") {
      if (input?.studentId) { await assertAssignedStudent(db, ctx.user.id, input.studentId); cond = and(eq(appointments.advisorId, ctx.user.id), eq(appointments.studentId, input.studentId)); }
      else cond = eq(appointments.advisorId, ctx.user.id);
    } else cond = input?.studentId ? eq(appointments.studentId, input.studentId) : undefined;
    const rows = cond ? await db.select().from(appointments).where(cond).orderBy(desc(appointments.scheduledAt))
      : await db.select().from(appointments).orderBy(desc(appointments.scheduledAt));
    return rows;
  }),

  scheduleAppointment: advisorProcedure.input(z.object({ studentId: z.number(), title: z.string().min(1), description: z.string().optional(),
    scheduledAt: z.string(), durationMinutes: z.number().min(5).max(240).default(30), location: z.string().optional(), meetingLink: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await assertAssignedStudent(db, ctx.user.id, input.studentId);
      await db.insert(appointments).values({ advisorId: ctx.user.id, studentId: input.studentId, title: input.title, description: input.description ?? null,
        scheduledAt: new Date(input.scheduledAt), durationMinutes: input.durationMinutes, location: input.location ?? null, meetingLink: input.meetingLink ?? null, status: "scheduled" });
      return { success: true };
    }),

  updateAppointment: advisorProcedure.input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(),
    scheduledAt: z.string().optional(), durationMinutes: z.number().min(5).max(240).optional(), location: z.string().optional(),
    meetingLink: z.string().optional(), status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [appt] = await db.select({ advisorId: appointments.advisorId, studentId: appointments.studentId }).from(appointments).where(eq(appointments.id, input.id)).limit(1);
      if (!appt) throw new TRPCError({ code: "NOT_FOUND" }); if (appt.advisorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      const update: any = {}; if (input.title !== undefined) update.title = input.title; if (input.description !== undefined) update.description = input.description;
      if (input.scheduledAt !== undefined) update.scheduledAt = new Date(input.scheduledAt); if (input.durationMinutes !== undefined) update.durationMinutes = input.durationMinutes;
      if (input.location !== undefined) update.location = input.location; if (input.meetingLink !== undefined) update.meetingLink = input.meetingLink;
      if (input.status !== undefined) update.status = input.status; if (input.notes !== undefined) update.notes = input.notes;
      await db.update(appointments).set(update).where(eq(appointments.id, input.id)); return { success: true };
    }),

  cancelAppointment: advisorProcedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [appt] = await db.select({ advisorId: appointments.advisorId }).from(appointments).where(eq(appointments.id, id)).limit(1);
    if (!appt) throw new TRPCError({ code: "NOT_FOUND" }); if (appt.advisorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
    await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, id)); return { success: true };
  }),

  getStudentConversations: advisorProcedure.input(z.object({ studentId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await assertAssignedStudent(db, ctx.user.id, input.studentId);
    const convos = await db.select().from(aiConversations).where(eq(aiConversations.studentId, input.studentId)).orderBy(desc(aiConversations.updatedAt));
    const enriched = await Promise.all(convos.map(async (c: any) => {
      const msgs = await db.select().from(chatMessages).where(eq(chatMessages.conversationId, c.id)).orderBy(chatMessages.createdAt);
      return { ...c, messages: msgs };
    }));
    return enriched;
  }),

  getReports: protectedProcedure.input(z.object({ studentId: z.number().optional() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    let studentId: number;
    if (ctx.user.role === "student") studentId = ctx.user.id;
    else if (ctx.user.role === "advisor") { if (!input?.studentId) throw new TRPCError({ code: "BAD_REQUEST" }); await assertAssignedStudent(db, ctx.user.id, input.studentId); studentId = input.studentId; }
    else studentId = input?.studentId ?? ctx.user.id;
    const rows = await db.select().from(advisorReports).where(eq(advisorReports.studentId, studentId)).orderBy(desc(advisorReports.createdAt));
    return rows;
  }),

  createReport: advisorProcedure.input(z.object({ studentId: z.number(), title: z.string().min(1), summary: z.string().min(1),
    gpaAtReport: z.string().optional(), creditsAtReport: z.number().optional(), attendanceRateAtReport: z.string().optional(),
    riskLevel: z.enum(["none", "low", "medium", "high"]).default("none"), semester: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await assertAssignedStudent(db, ctx.user.id, input.studentId);
      await db.insert(advisorReports).values({ advisorId: ctx.user.id, studentId: input.studentId, title: input.title, summary: input.summary,
        gpaAtReport: input.gpaAtReport ?? null, creditsAtReport: input.creditsAtReport ?? null, attendanceRateAtReport: input.attendanceRateAtReport ?? null,
        riskLevel: input.riskLevel, semester: input.semester ?? null });
      return { success: true };
    }),

  deleteReport: advisorProcedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [report] = await db.select({ advisorId: advisorReports.advisorId, studentId: advisorReports.studentId }).from(advisorReports).where(eq(advisorReports.id, id)).limit(1);
    if (!report) throw new TRPCError({ code: "NOT_FOUND" }); if (report.advisorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
    await db.delete(advisorReports).where(eq(advisorReports.id, id)); return { success: true };
  }),

  getInsights: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (ctx.user.role !== "advisor" && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const studentCond = ctx.user.role === "advisor" ? eq(users.advisorId, ctx.user.id) : eq(users.role, "student");
    const students = await db.select({ id: users.id }).from(users).where(and(eq(users.role, "student"), studentCond));
    const studentIds = students.map((s: any) => s.id);
    if (studentIds.length === 0) return { totalStudents: 0, atRiskCount: 0, activeAlerts: 0, upcomingAppointments: 0, averageGpa: "0.00", averageAttendance: 0 };
    let atRiskCount = 0, totalGpa = 0, gpaCount = 0, totalAtt = 0, attCount = 0;
    for (const sid of studentIds) {
      const [plan] = await db.select({ gpa: studyPlans.currentGPA }).from(studyPlans).where(eq(studyPlans.studentId, sid)).limit(1);
      const attRows = await db.select({ status: attendance.status }).from(attendance).where(eq(attendance.studentId, sid));
      const attTotal = attRows.length;
      const attPresent = attRows.filter((r: any) => r.status === "present" || r.status === "excused").length;
      const attRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;
      const gpaVal = parseFloat(plan?.gpa ?? "0");
      if (gpaVal > 0) { totalGpa += gpaVal; gpaCount++; }
      totalAtt += attRate; attCount++;
      if (gpaVal < 2.0 || attRate < 70) atRiskCount++;
    }
    const now = new Date();
    const upcoming = await db.select({ count: count() }).from(appointments)
      .where(and(eq(appointments.advisorId, ctx.user.id), gte(appointments.scheduledAt, now), eq(appointments.status, "scheduled")));
    const activeAlerts = await db.select({ count: count() }).from(academicAlerts)
      .where(and(inArray(academicAlerts.studentId, studentIds), eq(academicAlerts.isResolved, false)));
    return { totalStudents: studentIds.length, atRiskCount, activeAlerts: activeAlerts[0]?.count ?? 0,
      upcomingAppointments: upcoming[0]?.count ?? 0, averageGpa: gpaCount > 0 ? (totalGpa / gpaCount).toFixed(2) : "0.00",
      averageAttendance: attCount > 0 ? Math.round(totalAtt / attCount) : 0 };
  }),
});
