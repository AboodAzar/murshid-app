import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, emailVerificationTokens } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
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
  // Debug endpoint for auth diagnostics (admin only)
  debug: adminProcedure.query(async opts => {
    console.log("[Auth:Debug] Running auth diagnostics...");
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      steps: [],
    };

    // Step 1: Database connection
    const db = await getDb();
    if (!db) {
      diagnostics.steps.push({ step: "database", status: "failed", detail: "DATABASE_URL not set or connection failed" });
      diagnostics.dbConnected = false;
    } else {
      diagnostics.steps.push({ step: "database", status: "ok" });
      diagnostics.dbConnected = true;

      // Step 2: Count users
      try {
        const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
        diagnostics.userCount = userCount[0]?.count ?? 0;
        diagnostics.steps.push({ step: "userCount", status: "ok", count: diagnostics.userCount });
      } catch (e) {
        diagnostics.steps.push({ step: "userCount", status: "failed", error: String(e) });
      }

      // Step 3: List sample users (no passwords)
      try {
        const sampleUsers = await db.select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isEmailVerified: users.isEmailVerified,
          isActive: users.isActive,
          hasPassword: sql<boolean>`${users.password} IS NOT NULL`,
        }).from(users).limit(5).catch(() => [] as any);
        diagnostics.sampleUsers = sampleUsers;
        diagnostics.steps.push({ step: "sampleUsers", status: "ok", count: sampleUsers.length });
      } catch (e) {
        diagnostics.steps.push({ step: "sampleUsers", status: "failed", error: String(e) });
      }
    }

    // Step 4: Check cookie
    const cookies = opts.ctx.req.headers.cookie || "";
    const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
    diagnostics.hasCookie = !!cookieMatch;
    diagnostics.cookiePresent = cookieMatch ? "present" : "missing";
    diagnostics.steps.push({ step: "cookie", status: diagnostics.hasCookie ? "ok" : "missing", cookieName: COOKIE_NAME });

    // Step 5: Check JWT if cookie exists
    if (cookieMatch) {
      const jwtClaims = await verifyLocalAuthToken(cookieMatch[1]);
      diagnostics.jwtValid = !!jwtClaims;
      diagnostics.jwtPayload = jwtClaims;
      diagnostics.steps.push({ step: "jwt", status: jwtClaims ? "ok" : "invalid", payload: jwtClaims });
    } else {
      diagnostics.steps.push({ step: "jwt", status: "skipped", reason: "no cookie" });
    }

    // Step 6: Context user
    diagnostics.contextUser = opts.ctx.user ? {
      id: opts.ctx.user.id,
      email: opts.ctx.user.email,
      name: opts.ctx.user.name,
      role: opts.ctx.user.role,
    } : null;
    diagnostics.steps.push({ step: "contextUser", status: opts.ctx.user ? "ok" : "null" });

    console.log("[Auth:Debug] Diagnostics complete:", JSON.stringify(diagnostics, null, 2));
    return diagnostics;
  }),

  // Create test user (admin only)
  createTestUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(["student", "advisor", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[Auth:CreateTestUser] Creating test user:", input.email, "role:", input.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if user already exists
      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing[0]) {
        console.log("[Auth:CreateTestUser] User already exists, updating password and verification status");
        await db.update(users)
          .set({
            password: hashPassword(input.password),
            isEmailVerified: true,
            isActive: true,
            role: input.role,
            name: input.name,
          })
          .where(eq(users.id, existing[0].id));
        return { success: true, message: "User updated", userId: existing[0].id };
      }

      const result = await db.insert(users).values({
        email: input.email,
        openId: `local-${Date.now()}`,
        password: hashPassword(input.password),
        name: input.name,
        role: input.role,
        isEmailVerified: true,
        isActive: true,
        language: "en",
      });
      console.log("[Auth:CreateTestUser] Test user created successfully");
      return { success: true, message: "User created", userId: Number((result as any).insertId) };
    }),

  // Get current authenticated user
  me: publicProcedure.query(async opts => {
    console.log("[Auth:Me] Step 1 - Checking context user...");
    // First try to get from context (server-side authenticated)
    if (opts.ctx.user) {
      console.log("[Auth:Me] Step 2 - User found in context:", opts.ctx.user.email, "role:", opts.ctx.user.role);
      return opts.ctx.user;
    }
    console.log("[Auth:Me] Step 2 - No user in context");

    // If no context user, try to verify JWT from cookie
    const cookies = opts.ctx.req.headers.cookie || "";
    const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));

    if (!cookieMatch || !cookieMatch[1]) {
      console.log("[Auth:Me] Step 3 - No auth cookie found (cookie name:", COOKIE_NAME, ")");
      return null;
    }
    console.log("[Auth:Me] Step 3 - Auth cookie found");

    const jwtClaims = await verifyLocalAuthToken(cookieMatch[1]);
    if (!jwtClaims) {
      console.log("[Auth:Me] Step 4 - JWT token invalid or expired");
      return null;
    }
    console.log("[Auth:Me] Step 4 - JWT valid, userId:", jwtClaims.userId, "role:", jwtClaims.role);

    // Fetch user from database
    const db = await getDb();
    if (!db) {
      console.error("[Auth:Me] Step 5 - Database unavailable");
      return null;
    }

    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, jwtClaims.userId))
        .limit(1);
      const user = result[0] || null;
      if (user) {
        console.log("[Auth:Me] Step 5 - User loaded from DB:", user.email, "role:", user.role);
      } else {
        console.warn("[Auth:Me] Step 5 - User not found in DB for userId:", jwtClaims.userId);
      }
      return user;
    } catch (error) {
      console.error("[Auth:Me] Step 5 - Failed to fetch user from DB:", error);
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
      console.log("[Auth:Login] Step 1 - Received login request for:", input.email);

      const db = await getDb();
      if (!db) {
        console.error("[Auth:Login] Step 2 FAILED - Database unavailable. DATABASE_URL may not be set.");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed. Please check server configuration.",
        });
      }
      console.log("[Auth:Login] Step 2 - Database connection OK");

      try {
        console.log("[Auth:Login] Step 3 - Looking up user by email:", input.email);
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        const user = result[0];

        if (!user) {
          console.warn("[Auth:Login] Step 4 FAILED - User not found:", input.email);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found. Please register first.",
          });
        }
        console.log("[Auth:Login] Step 4 - User found:", { id: user.id, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified, hasPassword: !!user.password });

        if (!user.password) {
          console.warn("[Auth:Login] Step 5 FAILED - User has no password set:", input.email);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Account has no password. Please use password reset or register again.",
          });
        }

        const passwordValid = verifyPassword(input.password, user.password);
        console.log("[Auth:Login] Step 5 - Password verification result:", passwordValid);
        if (!passwordValid) {
          console.warn("[Auth:Login] Step 5 FAILED - Invalid password for user:", input.email);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid password. Please try again.",
          });
        }

        if (!user.isEmailVerified) {
          console.log("[Auth:Login] Step 6 - Email not verified for:", input.email);
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
        console.log("[Auth:Login] Step 6 - Email verified OK");

        console.log("[Auth:Login] Step 7 - Generating JWT token for user:", user.id);
        const token = await generateLocalAuthToken({
          userId: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role,
        });
        console.log("[Auth:Login] Step 7 - JWT token generated successfully");

        const cookieOptions = getSessionCookieOptions(ctx.req);
        console.log("[Auth:Login] Step 8 - Setting cookie with options:", cookieOptions);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 604800000,
        });
        console.log("[Auth:Login] Step 8 - Cookie set successfully");

        await db
          .update(users)
          .set({
            lastSignedIn: new Date(),
          })
          .where(eq(users.id, user.id));
        console.log("[Auth:Login] Step 9 - User lastSignedIn updated");

        console.log("[Auth:Login] SUCCESS - Login completed for:", input.email);
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
        const raw = error instanceof Error ? error.message : String(error);
        console.error("[Auth:Login] UNEXPECTED ERROR:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Login error: ${raw}`,
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
      console.log("[Auth:Register] Step 1 - Received registration for:", input.email);

      // Validate official university email
      if (!input.email.endsWith("@zuj.edu.jo") && !input.email.endsWith("@std-zuj.edu.jo")) {
        console.warn("[Auth:Register] Step 2 FAILED - Invalid email domain:", input.email);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must use an official Al-Zaytoonah University email address (@zuj.edu.jo or @std-zuj.edu.jo)",
        });
      }
      console.log("[Auth:Register] Step 2 - Email domain valid");

      const db = await getDb();
      if (!db) {
        console.error("[Auth:Register] Step 3 FAILED - Database unavailable");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed. Please check server configuration.",
        });
      }
      console.log("[Auth:Register] Step 3 - Database connection OK");

      try {
        console.log("[Auth:Register] Step 4 - Checking if email exists:", input.email);
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        if (existing.length > 0) {
          console.warn("[Auth:Register] Step 4 FAILED - Email already registered:", input.email);
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered. Please log in instead.",
          });
        }
        console.log("[Auth:Register] Step 4 - Email available");

        const hashedPassword = hashPassword(input.password);
        console.log("[Auth:Register] Step 5 - Password hashed");

        console.log("[Auth:Register] Step 6 - Inserting new user...");
        await db.insert(users).values({
          email: input.email,
          name: input.name,
          password: hashedPassword,
          role: "student",
          language: "en",
          isActive: true,
          openId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
        console.log("[Auth:Register] Step 6 - User inserted successfully");

        const newUser = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        if (!newUser[0]) {
          console.error("[Auth:Register] Step 7 FAILED - User not found after insert");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user. Database insert succeeded but user not found.",
          });
        }
        console.log("[Auth:Register] Step 7 - User created with ID:", newUser[0].id);

        const user = newUser[0];
        
        // Generate OTP and send email instead of logging in instantly
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        console.log("[Auth:Register] Step 8 - Creating verification token...");
        await db.insert(emailVerificationTokens).values({
          userId: user.id,
          token: otp,
          expiresAt,
        });
        console.log("[Auth:Register] Step 8 - Verification token created");

        console.log("[Auth:Register] Step 9 - Sending verification email...");
        await sendVerificationEmail(user.email, otp);
        console.log("[Auth:Register] Step 9 - Verification email sent (or skipped in dev)");

        console.log("[Auth:Register] SUCCESS - Registration completed for:", input.email);
        return {
          success: true,
          requireVerification: true,
          email: user.email,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        const raw = error instanceof Error ? error.message : String(error);
        console.error("[Auth:Register] UNEXPECTED ERROR:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Registration error: ${raw}`,
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
