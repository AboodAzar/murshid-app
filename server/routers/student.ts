import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { courses, studentCourses, studyPlans, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const studentRouter = router({
  dashboard: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    if (ctx.user.role !== "student" && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const availableStudents =
      ctx.user.role === "admin"
        ? await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(eq(users.role, "student"))
        : [];
    const targetStudentId =
      ctx.user.role === "admin"
        ? input?.studentId ?? availableStudents[0]?.id
        : ctx.user.id;

    if (!targetStudentId) {
      return {
        student: null,
        availableStudents,
        studyPlan: null,
        courses: [],
        stats: {
          gpa: "0.00",
          earnedCredits: 0,
          totalCredits: 0,
          currentSemester: 0,
          progress: 0,
          semestersLeft: 0,
        },
      };
    }

    const selectedStudent =
      ctx.user.role === "admin"
        ? availableStudents.find(student => student.id === targetStudentId) ?? null
        : {
            id: ctx.user.id,
            name: ctx.user.name,
            email: ctx.user.email,
          };

    if (ctx.user.role === "admin" && !selectedStudent) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const plans = await db
      .select()
      .from(studyPlans)
      .where(eq(studyPlans.studentId, targetStudentId))
      .limit(1);
    const enrollments = await db
      .select({
        id: studentCourses.id,
        courseId: studentCourses.courseId,
        semester: studentCourses.semester,
        grade: studentCourses.grade,
        gradePoints: studentCourses.gradePoints,
        status: studentCourses.status,
        code: courses.code,
        name: courses.name,
        nameAr: courses.nameAr,
        credits: courses.credits,
      })
      .from(studentCourses)
      .leftJoin(courses, eq(studentCourses.courseId, courses.id))
      .where(eq(studentCourses.studentId, targetStudentId));

    const completedCredits = enrollments
      .filter(course => course.status === "completed")
      .reduce((sum, course) => sum + Number(course.credits ?? 0), 0);
    const totalCredits = Number(plans[0]?.totalCredits ?? 0);
    const earnedCredits = Number(plans[0]?.completedCredits ?? completedCredits);
    const currentSemester =
      enrollments.reduce((max, course) => Math.max(max, course.semester), 0) || 0;
    const progress =
      totalCredits > 0 ? Math.round((earnedCredits / totalCredits) * 100) : 0;

    return {
      student: selectedStudent,
      availableStudents,
      studyPlan: plans[0] ?? null,
      courses: enrollments,
      stats: {
        gpa: plans[0]?.currentGPA ?? "0.00",
        earnedCredits,
        totalCredits,
        currentSemester,
        progress,
        semestersLeft:
          totalCredits > 0
            ? Math.max(0, Math.ceil((totalCredits - earnedCredits) / 15))
            : 0,
      },
    };
  }),
});
