import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  courses,
  coursePrerequisites,
  studentCourses,
  departments,
} from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const coursesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          departmentId: z.number().optional(),
          semester: z.number().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const conditions = [];
        if (input?.departmentId) {
          conditions.push(eq(courses.departmentId, input.departmentId));
        }
        if (input?.semester) {
          conditions.push(eq(courses.semester, input.semester));
        }

        const page = input?.page || 1;
        const limit = input?.limit || 20;
        const offset = (page - 1) * limit;

        const query =
          conditions.length > 0
            ? db
                .select()
                .from(courses)
                .where(and(...conditions))
            : db.select().from(courses);

        const results = await query.limit(limit).offset(offset);

        // Get total count for pagination metadata
        const countQuery =
          conditions.length > 0
            ? db
                .select()
                .from(courses)
                .where(and(...conditions))
            : db.select().from(courses);
        const allResults = await countQuery;
        const total = allResults.length;

        return {
          data: results,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        };
      } catch (error) {
        console.error("[Courses] Failed to list courses:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input: courseId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const result = await db
          .select()
          .from(courses)
          .where(eq(courses.id, courseId))
          .limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("[Courses] Failed to get course:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getPrerequisites: publicProcedure
    .input(z.number())
    .query(async ({ input: courseId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const prereqs = await db
          .select()
          .from(coursePrerequisites)
          .where(eq(coursePrerequisites.courseId, courseId));
        const prerequisiteIds = prereqs.map(p => p.prerequisiteId);

        if (prerequisiteIds.length === 0) return [];

        return await db
          .select()
          .from(courses)
          .where(inArray(courses.id, prerequisiteIds));
      } catch (error) {
        console.error("[Courses] Failed to get prerequisites:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getStudentCourses: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["completed", "in_progress", "planned"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Allow students, advisors, and admins to view student courses
      if (ctx.user.role !== "student" && ctx.user.role !== "advisor" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const conditions = [eq(studentCourses.studentId, ctx.user.id)];
        if (input?.status) {
          conditions.push(eq(studentCourses.status, input.status));
        }

        return await db
          .select()
          .from(studentCourses)
          .where(and(...conditions));
      } catch (error) {
        console.error("[Courses] Failed to get student courses:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  enrollCourse: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        semester: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Allow only students to enroll courses
      if (ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Check if already enrolled
        const existing = await db
          .select()
          .from(studentCourses)
          .where(
            and(
              eq(studentCourses.studentId, ctx.user.id),
              eq(studentCourses.courseId, input.courseId)
            )
          );

        if (existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Already enrolled in this course",
          });
        }

        await db.insert(studentCourses).values({
          studentId: ctx.user.id,
          courseId: input.courseId,
          semester: input.semester,
          status: "planned",
        });

        return { success: true };
      } catch (error) {
        console.error("[Courses] Failed to enroll course:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Allow students, advisors, and admins to view recommendations
    if (ctx.user.role !== "student" && ctx.user.role !== "advisor" && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      // Get student's completed courses
      const completedCourses = await db
        .select()
        .from(studentCourses)
        .where(
          and(
            eq(studentCourses.studentId, ctx.user.id),
            eq(studentCourses.status, "completed")
          )
        );

      const completedCourseIds = completedCourses.map(c => c.courseId);

      // Get all courses
      const allCourses = await db.select().from(courses);

      // Filter courses that have all prerequisites completed
      const recommendations = allCourses.filter(course => {
        // Don't recommend already enrolled courses
        if (completedCourses.some(c => c.courseId === course.id)) return false;

        // Check GPA requirement (simplified - would need actual GPA calculation)
        if (ctx.user?.role === "student") {
          // In a real app, fetch actual GPA from study plan
          return true;
        }
        return false;
      });

      return recommendations.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      console.error("[Courses] Failed to get recommendations:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
