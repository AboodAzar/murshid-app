import { describe, it, expect } from "vitest";
import {
  sdk,
  extractBearerToken,
  extractSessionCookie,
  extractToken,
  getUserFromRequest,
  authenticateRequest,
} from "./sdk";
import type { Request } from "express";

describe("SDK Authentication", () => {
  describe("extractBearerToken", () => {
    it("should extract token from standard Bearer Authorization header", () => {
      const req = {
        headers: {
          authorization: "Bearer my-jwt-token-xyz",
        },
      } as Request;

      expect(extractBearerToken(req)).toBe("my-jwt-token-xyz");
    });

    it("should handle case-insensitive bearer prefix", () => {
      const req = {
        headers: {
          authorization: "bearer lowercase-bearer-token",
        },
      } as Request;

      expect(extractBearerToken(req)).toBe("lowercase-bearer-token");
    });

    it("should trim surrounding whitespace from Bearer token", () => {
      const req = {
        headers: {
          authorization: "Bearer   padded-token-value   ",
        },
      } as Request;

      expect(extractBearerToken(req)).toBe("padded-token-value");
    });

    it("should return null when Authorization header is absent", () => {
      const req = {
        headers: {},
      } as Request;

      expect(extractBearerToken(req)).toBeNull();
    });

    it("should return null for non-Bearer schemes (e.g. Basic, Digest)", () => {
      const req = {
        headers: {
          authorization: "Basic dXNlcjpwYXNzd29yZA==",
        },
      } as Request;

      expect(extractBearerToken(req)).toBeNull();
    });

    it("should return null when token string after Bearer is empty", () => {
      const req = {
        headers: {
          authorization: "Bearer    ",
        },
      } as Request;

      expect(extractBearerToken(req)).toBeNull();
    });

    it("should handle array authorization headers gracefully", () => {
      const req = {
        headers: {
          authorization: ["Bearer array-token"] as any,
        },
      } as unknown as Request;

      expect(extractBearerToken(req)).toBe("array-token");
    });
  });

  describe("extractSessionCookie", () => {
    it("should extract token from standard app_session_id cookie", () => {
      const req = {
        headers: {
          cookie: "app_session_id=cookie-session-token-123",
        },
      } as Request;

      expect(extractSessionCookie(req)).toBe("cookie-session-token-123");
    });

    it("should extract app_session_id from multi-cookie string", () => {
      const req = {
        headers: {
          cookie: "theme=dark; app_session_id=cookie-in-the-middle; lang=en",
        },
      } as Request;

      expect(extractSessionCookie(req)).toBe("cookie-in-the-middle");
    });

    it("should return null when cookie header is missing", () => {
      const req = {
        headers: {},
      } as Request;

      expect(extractSessionCookie(req)).toBeNull();
    });

    it("should return null when app_session_id cookie is not present", () => {
      const req = {
        headers: {
          cookie: "other_session=abc; theme=light",
        },
      } as Request;

      expect(extractSessionCookie(req)).toBeNull();
    });
  });

  describe("extractToken (Dual-Auth Precedence)", () => {
    it("should prioritize Bearer token over session cookie when both are present", () => {
      const req = {
        headers: {
          authorization: "Bearer bearer-priority-token",
          cookie: "app_session_id=cookie-fallback-token",
        },
      } as Request;

      expect(extractToken(req)).toBe("bearer-priority-token");
    });

    it("should fall back to session cookie when Bearer token is absent", () => {
      const req = {
        headers: {
          cookie: "app_session_id=cookie-fallback-token",
        },
      } as Request;

      expect(extractToken(req)).toBe("cookie-fallback-token");
    });

    it("should return null when neither Bearer token nor cookie is present", () => {
      const req = {
        headers: {},
      } as Request;

      expect(extractToken(req)).toBeNull();
    });
  });

  describe("authenticateRequest", () => {
    it("should return null when neither cookie nor Authorization header is present", async () => {
      const req = {
        headers: {},
      } as Request;

      const user = await sdk.authenticateRequest(req);
      expect(user).toBeNull();
    });

    it("should return null when cookie is malformed", async () => {
      const req = {
        headers: {
          cookie: "app_session_id=invalid-token",
        },
      } as Request;

      const user = await sdk.authenticateRequest(req);
      expect(user).toBeNull();
    });

    it("should return null when Bearer token is malformed", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalid-token",
        },
      } as Request;

      const user = await sdk.authenticateRequest(req);
      expect(user).toBeNull();
    });

    it("should return null when JWT verification fails on cookie", async () => {
      const req = {
        headers: {
          cookie: "app_session_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        },
      } as Request;

      const user = await sdk.authenticateRequest(req);
      expect(user).toBeNull();
    });

    it("should return null when JWT verification fails on Bearer token", async () => {
      const req = {
        headers: {
          authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        },
      } as Request;

      const user = await sdk.authenticateRequest(req);
      expect(user).toBeNull();
    });
  });

  describe("getUserFromRequest export alias", () => {
    it("should export getUserFromRequest identical to authenticateRequest", () => {
      expect(getUserFromRequest).toBe(authenticateRequest);
      expect(sdk.getUserFromRequest).toBe(authenticateRequest);
    });
  });

  describe("createSessionToken", () => {
    it("should create a session token with openId and appId", async () => {
      const token = await sdk.createSessionToken("test-openid", {
        name: "Test User",
        expiresInMs: 3600000,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe("exchangeCodeForToken", () => {
    it("should return placeholder token", async () => {
      const result = await sdk.exchangeCodeForToken("test-code", "test-state");

      expect(result).toBeDefined();
      expect(result.accessToken).toBe("placeholder-token");
    });
  });

  describe("getUserInfo", () => {
    it("should return placeholder user info", async () => {
      const result = await sdk.getUserInfo("test-token");

      expect(result).toBeDefined();
      expect(result.openId).toBe("placeholder-openid");
      expect(result.email).toBe("user@example.com");
      expect(result.name).toBe("Placeholder User");
    });
  });
});
