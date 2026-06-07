import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          unreadOnly: z.boolean().optional(),
          limit: z.number().default(20),
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

      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const conditions = [eq(notifications.userId, ctx.user.id)];
        if (input?.unreadOnly) {
          conditions.push(eq(notifications.isRead, false));
        }

        return await db
          .select()
          .from(notifications)
          .where(and(...conditions))
          .orderBy(notifications.createdAt)
          .limit(input?.limit || 20);
      } catch (error) {
        console.error("[Notifications] Failed to list notifications:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  markAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: notificationId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        await db
          .update(notifications)
          .set({ isRead: true })
          .where(
            and(
              eq(notifications.id, notificationId),
              eq(notifications.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("[Notifications] Failed to mark as read:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  markAsUnread: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: notificationId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        await db
          .update(notifications)
          .set({ isRead: false })
          .where(
            and(
              eq(notifications.id, notificationId),
              eq(notifications.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("[Notifications] Failed to mark as unread:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: notificationId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        await db
          .delete(notifications)
          .where(
            and(
              eq(notifications.id, notificationId),
              eq(notifications.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("[Notifications] Failed to delete notification:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const result = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.user.id),
            eq(notifications.isRead, false)
          )
        );

      return { count: result.length };
    } catch (error) {
      console.error("[Notifications] Failed to get unread count:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, ctx.user.id));

      return { success: true };
    } catch (error) {
      console.error("[Notifications] Failed to mark all as read:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
