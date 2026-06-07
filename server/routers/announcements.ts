import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { announcements } from "../../drizzle/schema";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const announcementInput = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  content: z.string().min(1),
  contentAr: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  targetRole: z.enum(["student", "advisor", "admin", "all"]).default("all"),
  isActive: z.boolean().default(true),
});

export const announcementsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    if (ctx.user.role === "admin") {
      return db.select().from(announcements);
    }

    return db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(
            eq(announcements.targetRole, "all"),
            eq(announcements.targetRole, ctx.user.role)
          )
        )
      );
  }),

  create: adminProcedure.input(announcementInput).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await db.insert(announcements).values({
      ...input,
      createdBy: ctx.user.id,
    });

    return { success: true };
  }),

  update: adminProcedure
    .input(announcementInput.partial().extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { id, ...updateData } = input;
      await db.update(announcements).set(updateData).where(eq(announcements.id, id));

      return { success: true };
    }),

  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await db.delete(announcements).where(eq(announcements.id, input));

    return { success: true };
  }),
});
