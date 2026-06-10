import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  announcements,
  courses,
  departments,
  documents,
  faqs,
  users,
} from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

export const adminRouter = router({
  dashboard: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select().from(users);
    const departmentRows = await db.select().from(departments);
    const courseRows = await db.select().from(courses);
    const faqRows = await db.select().from(faqs);
    const documentRows = await db.select().from(documents);
    const announcementRows = await db.select().from(announcements);

    return {
      stats: {
        totalUsers: userRows.length,
        totalStudents: userRows.filter(user => user.role === "student").length,
        totalAdvisors: userRows.filter(user => user.role === "advisor").length,
        totalAdmins: userRows.filter(user => user.role === "admin").length,
        totalDepartments: departmentRows.length,
        totalCourses: courseRows.length,
        totalFAQs: faqRows.length,
        totalDocuments: documentRows.length,
        totalAnnouncements: announcementRows.length,
      },
      users: userRows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
        isEmailVerified: user.isEmailVerified,
        phone: user.phone,
        bio: user.bio,
        advisorId: user.advisorId,
        departmentId: user.departmentId,
      })),
      departments: departmentRows,
      courses: courseRows,
      faqs: faqRows,
      documents: documentRows,
      announcements: announcementRows,
    };
  }),

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["student", "advisor", "admin"]).optional(),
        isActive: z.boolean().optional(),
        name: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const updateData: Partial<{ role: "student" | "advisor" | "admin"; isActive: boolean; name: string }> = {};
      if (input.role !== undefined) updateData.role = input.role;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.name !== undefined) updateData.name = input.name;

      await db.update(users).set(updateData).where(eq(users.id, input.id));

      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(
      z.object({
        id: z.number(),
        requesterId: z.number(), // the admin performing the action
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Prevent self-deletion
      if (input.id === input.requesterId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete your own account.",
        });
      }

      const target = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

      if (!target[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      // Prevent deleting the last remaining admin
      if (target[0].role === "admin") {
        const adminCount = await db
          .select()
          .from(users)
          .where(eq(users.role, "admin"));

        if (adminCount.length <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete the last admin account.",
          });
        }
      }

      await db.delete(users).where(eq(users.id, input.id));

      return { success: true };
    }),

  assignAdvisor: adminProcedure
    .input(
      z.object({
        studentId: z.number(),
        advisorId: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [student] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, input.studentId), eq(users.role, "student")))
        .limit(1);

      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      if (input.advisorId !== null) {
        const [advisor] = await db
          .select()
          .from(users)
          .where(and(eq(users.id, input.advisorId), eq(users.role, "advisor")))
          .limit(1);

        if (!advisor) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Advisor not found" });
        }
      }

      await db
        .update(users)
        .set({ advisorId: input.advisorId })
        .where(eq(users.id, input.studentId));

      return { success: true };
    }),

  getAdvisorsWithStudents: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const advisors = await db
      .select({ id: users.id, name: users.name, email: users.email, departmentId: users.departmentId })
      .from(users)
      .where(eq(users.role, "advisor"))
      .orderBy(users.name);

    const result = await Promise.all(
      advisors.map(async (advisor) => {
        const students = await db
          .select({ id: users.id, name: users.name, email: users.email })
          .from(users)
          .where(and(eq(users.role, "student"), eq(users.advisorId, advisor.id)))
          .orderBy(users.name);
        return { ...advisor, students };
      })
    );

    return result;
  }),

  getUnassignedStudents: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const rows = await db
      .select({ id: users.id, name: users.name, email: users.email, departmentId: users.departmentId })
      .from(users)
      .where(and(eq(users.role, "student"), isNull(users.advisorId)))
      .orderBy(users.name);

    return rows;
  }),
});
