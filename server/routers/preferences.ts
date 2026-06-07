import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const preferencesRouter = router({
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      if (!user[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        emailNotifications: true,
        pushNotifications: true,
        courseRecommendations: true,
        advisorMessages: true,
        systemUpdates: true,
        language: user[0].language || "en",
      };
    } catch (error) {
      console.error(
        "[Preferences] Failed to get notification preferences:",
        error
      );
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        courseRecommendations: z.boolean().optional(),
        advisorMessages: z.boolean().optional(),
        systemUpdates: z.boolean().optional(),
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

      try {
        // In a real implementation, you would store these preferences in a separate table
        // For now, we'll just return success
        return {
          success: true,
          preferences: {
            emailNotifications: input.emailNotifications ?? true,
            pushNotifications: input.pushNotifications ?? true,
            courseRecommendations: input.courseRecommendations ?? true,
            advisorMessages: input.advisorMessages ?? true,
            systemUpdates: input.systemUpdates ?? true,
          },
        };
      } catch (error) {
        console.error(
          "[Preferences] Failed to update notification preferences:",
          error
        );
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  setLanguage: protectedProcedure
    .input(z.enum(["en", "ar"]))
    .mutation(async ({ ctx, input: language }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await db
          .update(users)
          .set({ language })
          .where(eq(users.id, ctx.user.id));
        return { success: true, language };
      } catch (error) {
        console.error("[Preferences] Failed to set language:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
