import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, passwordResetTokens } from "../../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";
import crypto from "crypto";
import { hashPassword } from "../_core/authSecurity";

export const passwordResetRouter = router({
  // Request password reset
  requestReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (user.length === 0) {
          // Don't reveal if email exists
          return {
            success: true,
            message: "If email exists, password reset link has been sent",
          };
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 3600000; // 1 hour

        // Delete any existing tokens for this user
        await db
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.userId, user[0].id));

        // Store token in database
        await db.insert(passwordResetTokens).values({
          userId: user[0].id,
          token,
          expiresAt,
          createdAt: new Date(),
        });

        // In production, send email with reset link
        console.log(`Password reset token for ${input.email}: ${token}`);

        return {
          success: true,
          message: "Password reset link has been sent to your email",
          // For testing only - remove in production
          token: process.env.NODE_ENV === "development" ? token : undefined,
        };
      } catch (error) {
        console.error("Password reset request error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process password reset request",
        });
      }
    }),

  // Verify reset token
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const now = Date.now();
      const resetData = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, input.token),
            eq(passwordResetTokens.usedAt, null as any)
          )
        )
        .limit(1);

      if (resetData.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      // Check if token has expired
      if (resetData[0].expiresAt < now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      return {
        valid: true,
        message: "Token is valid",
      };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z
          .string()
          .min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const now = Date.now();
      const resetData = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, input.token),
            eq(passwordResetTokens.usedAt, null as any)
          )
        )
        .limit(1);

      if (resetData.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      // Check if token has expired
      if (resetData[0].expiresAt < now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      try {
        // Hash new password using the same implementation as registration
        const hashedPassword = hashPassword(input.newPassword);

        // Update user password
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, resetData[0].userId));

        // Mark token as used
        await db
          .update(passwordResetTokens)
          .set({ usedAt: new Date() })
          .where(eq(passwordResetTokens.id, resetData[0].id));

        return {
          success: true,
          message: "Password has been reset successfully",
        };
      } catch (error) {
        console.error("Password reset error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password",
        });
      }
    }),
});
