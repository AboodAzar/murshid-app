import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isAllowedOrigin, corsMiddleware } from "./cors";
import type { Request, Response } from "express";

describe("CORS Module", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe("isAllowedOrigin", () => {
    describe("when in development/test environment", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "development";
      });

      it("allows undefined/empty origin (direct curl / same-origin)", () => {
        expect(isAllowedOrigin(undefined)).toBe(true);
        expect(isAllowedOrigin("")).toBe(true);
      });

      it("allows iOS Capacitor and Ionic schemes", () => {
        expect(isAllowedOrigin("capacitor://localhost")).toBe(true);
        expect(isAllowedOrigin("ionic://localhost")).toBe(true);
      });

      it("allows localhost and 127.0.0.1 on various ports", () => {
        expect(isAllowedOrigin("http://localhost")).toBe(true);
        expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
        expect(isAllowedOrigin("https://localhost:5173")).toBe(true);
        expect(isAllowedOrigin("http://127.0.0.1")).toBe(true);
        expect(isAllowedOrigin("http://127.0.0.1:3000")).toBe(true);
        expect(isAllowedOrigin("https://127.0.0.1:8080")).toBe(true);
      });

      it("allows iOS Hotspot subnet (172.20.10.*)", () => {
        expect(isAllowedOrigin("http://172.20.10.4:3000")).toBe(true);
        expect(isAllowedOrigin("http://172.20.10.1:3000")).toBe(true);
        expect(isAllowedOrigin("http://172.20.10.254")).toBe(true);
      });

      it("allows RFC 1918 private subnets", () => {
        // 172.16.0.0/12 range
        expect(isAllowedOrigin("http://172.16.0.1:3000")).toBe(true);
        expect(isAllowedOrigin("http://172.31.255.255:3000")).toBe(true);
        // 192.168.0.0/16 range
        expect(isAllowedOrigin("http://192.168.1.1:3000")).toBe(true);
        expect(isAllowedOrigin("http://192.168.100.50:8080")).toBe(true);
        // 10.0.0.0/8 range
        expect(isAllowedOrigin("http://10.0.0.1:3000")).toBe(true);
        expect(isAllowedOrigin("http://10.200.50.1:4000")).toBe(true);
      });

      it("rejects unauthorized external/attacker domains even in development mode", () => {
        expect(isAllowedOrigin("http://evil-attacker-site.com")).toBe(false);
        expect(isAllowedOrigin("https://any-dev-preview.ngrok-free.app")).toBe(false);
        expect(isAllowedOrigin("https://custom-domain.local:3000")).toBe(false);
        expect(isAllowedOrigin("https://attacker.example.com")).toBe(false);
        expect(isAllowedOrigin("http://172.32.0.1:3000")).toBe(false);
        expect(isAllowedOrigin("http://8.8.8.8:3000")).toBe(false);
      });
    });

    describe("when in production environment", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "production";
      });

      it("allows Capacitor and Ionic schemes in production", () => {
        expect(isAllowedOrigin("capacitor://localhost")).toBe(true);
        expect(isAllowedOrigin("ionic://localhost")).toBe(true);
      });

      it("allows localhost and loopback in production", () => {
        expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
        expect(isAllowedOrigin("http://127.0.0.1:3000")).toBe(true);
      });

      it("allows private subnets and iOS hotspot in production", () => {
        expect(isAllowedOrigin("http://172.20.10.4:3000")).toBe(true);
        expect(isAllowedOrigin("http://192.168.1.50:3000")).toBe(true);
        expect(isAllowedOrigin("http://10.0.0.2:3000")).toBe(true);
      });

      it("rejects unauthorized public domains in production", () => {
        expect(isAllowedOrigin("https://attacker.example.com")).toBe(false);
        expect(isAllowedOrigin("https://malicious-site.org")).toBe(false);
        expect(isAllowedOrigin("http://172.32.0.1:3000")).toBe(false); // Outside 172.16.0.0/12
        expect(isAllowedOrigin("http://8.8.8.8:3000")).toBe(false);
      });
    });
  });

  describe("corsMiddleware", () => {
    function createMockRes() {
      const headers: Record<string, string> = {};
      let statusCode = 200;
      let ended = false;

      const res = {
        setHeader: vi.fn((name: string, value: string) => {
          headers[name.toLowerCase()] = value;
        }),
        status: vi.fn((code: number) => {
          statusCode = code;
          return res;
        }),
        end: vi.fn(() => {
          ended = true;
          return res;
        }),
        getHeaders: () => headers,
        getStatusCode: () => statusCode,
        isEnded: () => ended,
      };

      return res;
    }

    it("sets CORS headers and calls next() for standard GET request with allowed origin", () => {
      const req = {
        method: "GET",
        headers: {
          origin: "capacitor://localhost",
        },
      } as unknown as Request;

      const res = createMockRes();
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      corsMiddleware(req, res as unknown as Response, next);

      expect(nextCalled).toBe(true);
      expect(res.isEnded()).toBe(false);
      const headers = res.getHeaders();
      expect(headers["access-control-allow-origin"]).toBe("capacitor://localhost");
      expect(headers["access-control-allow-credentials"]).toBe("true");
      expect(headers["access-control-allow-methods"]).toBe(
        "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
      );
      expect(headers["access-control-allow-headers"]).toContain("Authorization");
      expect(headers["access-control-allow-headers"]).toContain("Content-Type");
      expect(headers["access-control-allow-headers"]).toContain("x-trpc-source");
      expect(headers["access-control-allow-headers"]).toContain("Cookie");
      expect(headers["access-control-max-age"]).toBe("86400");
      expect(headers["vary"]).toBe("Origin");
    });

    it("immediately short-circuits preflight OPTIONS request with HTTP 204 No Content", () => {
      const req = {
        method: "OPTIONS",
        headers: {
          origin: "capacitor://localhost",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type, authorization, x-trpc-source",
        },
      } as unknown as Request;

      const res = createMockRes();
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      corsMiddleware(req, res as unknown as Response, next);

      // Must terminate immediately: 204 status, ended, next() NEVER called
      expect(res.getStatusCode()).toBe(204);
      expect(res.isEnded()).toBe(true);
      expect(nextCalled).toBe(false);

      const headers = res.getHeaders();
      expect(headers["access-control-allow-origin"]).toBe("capacitor://localhost");
      expect(headers["access-control-allow-credentials"]).toBe("true");
      expect(headers["access-control-allow-methods"]).toBe(
        "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
      );
    });

    it("handles iOS Hotspot origin (http://172.20.10.4:3000) with origin reflection", () => {
      const hotspotOrigin = "http://172.20.10.4:3000";
      const req = {
        method: "POST",
        headers: {
          origin: hotspotOrigin,
        },
      } as unknown as Request;

      const res = createMockRes();
      let nextCalled = false;
      corsMiddleware(req, res as unknown as Response, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(res.getHeaders()["access-control-allow-origin"]).toBe(hotspotOrigin);
      expect(res.getHeaders()["access-control-allow-credentials"]).toBe("true");
    });

    it("passes through requests without Origin header (curl / server-to-server) without error", () => {
      const req = {
        method: "GET",
        headers: {},
      } as unknown as Request;

      const res = createMockRes();
      let nextCalled = false;
      corsMiddleware(req, res as unknown as Response, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(res.isEnded()).toBe(false);
      expect(res.getHeaders()["access-control-allow-origin"]).toBeUndefined();
    });

    it("short-circuits OPTIONS requests without origin with 204", () => {
      const req = {
        method: "OPTIONS",
        headers: {},
      } as unknown as Request;

      const res = createMockRes();
      let nextCalled = false;
      corsMiddleware(req, res as unknown as Response, () => {
        nextCalled = true;
      });

      expect(res.getStatusCode()).toBe(204);
      expect(res.isEnded()).toBe(true);
      expect(nextCalled).toBe(false);
    });

    it("does not reflect disallowed origin in production", () => {
      process.env.NODE_ENV = "production";
      const req = {
        method: "GET",
        headers: {
          origin: "https://disallowed-site.com",
        },
      } as unknown as Request;

      const res = createMockRes();
      let nextCalled = false;
      corsMiddleware(req, res as unknown as Response, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(res.getHeaders()["access-control-allow-origin"]).toBeUndefined();
    });
  });
});
