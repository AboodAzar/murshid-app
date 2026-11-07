import "dotenv/config";
import { describe, it, expect, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import { generateLocalAuthToken } from "../_core/authSecurity";
import { TRPCError } from "@trpc/server";

// Helper to create mock context
function createMockContext(user?: any, headers: Record<string, string> = {}): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers,
    } as any,
    res: {
      setHeader: vi.fn(),
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as any,
  };
}

describe("Authentication Router", { timeout: 15000 }, () => {
  describe("logout", () => {
    it("should clear session cookie on logout", async () => {
      const mockRes = {
        clearCookie: vi.fn(),
      };
      const ctx = createMockContext();
      ctx.res = mockRes as any;

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(mockRes.clearCookie).toHaveBeenCalled();
    });
  });

  describe("me", () => {
    it("should return null when not authenticated and no credentials provided", async () => {
      const ctx = createMockContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("should return user data when authenticated in context", async () => {
      const mockUser = {
        id: 1,
        email: "test@test.com",
        name: "Test User",
        role: "student",
      };
      const ctx = createMockContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toEqual(mockUser);
    });

    it("should throw UNAUTHORIZED TRPCError when invalid Bearer token is provided in headers", async () => {
      const ctx = createMockContext(null, {
        authorization: "Bearer invalid.jwt.token",
      });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.me()).rejects.toThrow(TRPCError);
      await expect(caller.auth.me()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should throw UNAUTHORIZED TRPCError when malformed Bearer token is provided in headers", async () => {
      const ctx = createMockContext(null, {
        authorization: "Bearer not-a-jwt",
      });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.me()).rejects.toThrow(TRPCError);
      await expect(caller.auth.me()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should return null when empty Bearer token is provided in headers", async () => {
      const ctx = createMockContext(null, {
        authorization: "Bearer ",
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("should return user when valid Bearer token for existing user is provided in headers", async () => {
      const token = await generateLocalAuthToken({
        userId: 210027,
        email: "khaled.haddad@zuj.edu.jo",
        name: "Khaled Haddad",
        role: "student",
      });

      const ctx = createMockContext(null, {
        authorization: `Bearer ${token}`,
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).not.toBeNull();
      expect(result?.email).toBe("khaled.haddad@zuj.edu.jo");
    });
  });

  describe("login and token issuance", () => {
    it("should return token and user details on valid student login", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.login({
        email: "khaled.haddad@zuj.edu.jo",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.token.length).toBeGreaterThan(20);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("khaled.haddad@zuj.edu.jo");
      expect(result.user.role).toBe("student");
      expect(ctx.res.cookie).toHaveBeenCalled();

      // Verify the returned token can be used with auth.me via Bearer header
      const meCtx = createMockContext(null, {
        authorization: `Bearer ${result.token}`,
      });
      const meCaller = appRouter.createCaller(meCtx);
      const meResult = await meCaller.auth.me();

      expect(meResult).not.toBeNull();
      expect(meResult?.id).toBe(result.user.id);
      expect(meResult?.email).toBe(result.user.email);
    });
  });
});
