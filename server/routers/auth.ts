import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, emailVerificationTokens } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "../../shared/const";
import {
  generateLocalAuthToken,
  hashPassword,
  verifyLocalAuthToken,
  verifyPassword,
} from "../_core/authSecurity";
import { sendVerificationEmail } from "../utils/email";

export const authRouter = router({
  // Get current authenticated user
  me: publicProcedure.query(async opts => {
    // First try to get from context (server-side authenticated)
    if (opts.ctx.user) {
      return opts.ctx.user;
    }

    // If no context user, try to verify JWT from cookie
    const cookies = opts.ctx.req.headers.cookie || "";
    const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));

    if (!cookieMatch || !cookieMatch[1]) {
      return null;
    }

    const jwtClaims = await verifyLocalAuthToken(cookieMatch[1]);
    if (!jwtClaims) {
      return null;
    }

    // Fetch user from database
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, jwtClaims.userId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("[Auth] Failed to fetch user:", error);
      return null;
    }
  }),

  // Login endpoint
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        const user = result[0];

        if (!user || !user.password || !verifyPassword(input.password, user.password)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        if (!user.isEmailVerified) {
          // Generate new OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = Date.now() + 15 * 60 * 1000;
          await db.insert(emailVerificationTokens).values({
            userId: user.id,
            token: otp,
            expiresAt,
          });
          await sendVerificationEmail(user.email, otp);
          
          return {
            success: true,
            requireVerification: true,
            email: user.email,
          };
        }

        const token = await generateLocalAuthToken({
          userId: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 604800000,
        });

        await db
          .update(users)
          .set({
            lastSignedIn: new Date(),
          })
          .where(eq(users.id, user.id));

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            language: user.language,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Auth] Login failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed",
        });
      }
    }),

  // Register endpoint
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate official university email
      if (!input.email.endsWith("@zuj.edu.jo") && !input.email.endsWith("@student.zuj.edu.jo")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must use an official Al-Zaytoonah University email address (@zuj.edu.jo or @student.zuj.edu.jo)",
        });
      }

      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        if (existing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }

        const hashedPassword = hashPassword(input.password);

        await db.insert(users).values({
          email: input.email,
          name: input.name,
          password: hashedPassword,
          role: "student",
          language: "en",
          isActive: true,
          openId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });

        const newUser = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        if (!newUser[0]) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        const user = newUser[0];
        
        // Generate OTP and send email instead of logging in instantly
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        await db.insert(emailVerificationTokens).values({
          userId: user.id,
          token: otp,
          expiresAt,
        });

        await sendVerificationEmail(user.email, otp);

        return {
          success: true,
          requireVerification: true,
          email: user.email,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Auth] Register failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),

  // Verify Email endpoint
  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        const user = result[0];

        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        if (user.isEmailVerified) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email is already verified" });
        }

        const tokens = await db
          .select()
          .from(emailVerificationTokens)
          .where(
            and(
              eq(emailVerificationTokens.userId, user.id),
              eq(emailVerificationTokens.token, input.code)
            )
          );

        const validToken = tokens.find(t => t.expiresAt > Date.now());

        if (!validToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification code",
          });
        }

        await db
          .update(users)
          .set({ isEmailVerified: true })
          .where(eq(users.id, user.id));

        await db
          .delete(emailVerificationTokens)
          .where(eq(emailVerificationTokens.userId, user.id));

        const token = await generateLocalAuthToken({
          userId: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 604800000,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            language: user.language,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Auth] Verify email failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Verification failed",
        });
      }
    }),

  // Logout endpoint
  logout: publicProcedure.mutation(({ ctx }) => {
    // Clear session cookie
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

    return {
      success: true,
    };
  }),
});
