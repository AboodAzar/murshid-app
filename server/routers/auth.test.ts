import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// Helper to create mock context
function createMockContext(user?: any): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      setHeader: vi.fn(),
      clearCookie: vi.fn(),
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
    it("should return null when not authenticated", async () => {
      const ctx = createMockContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("should return user data when authenticated", async () => {
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
  });

});
