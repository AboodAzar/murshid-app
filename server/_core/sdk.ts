import type { Request } from "express";
import { errors, SignJWT, jwtVerify } from "jose";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "../../shared/const";
import type { User } from "../../drizzle/schema";
import { getJwtSecretKey } from "./authSecurity";

function isExpectedTokenVerificationError(error: unknown) {
  return (
    error instanceof errors.JOSEError ||
    (error instanceof Error &&
      (error.name === "JWTExpired" ||
        error.name === "JWTClaimValidationFailed" ||
        error.name === "JWSInvalid"))
  );
}

// Session payload types
export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

export type LocalAuthPayload = {
  userId: number;
  email: string;
  name: string;
  role: string;
  type: "local-auth";
};

// Extract Bearer token from Authorization header
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (headerValue && typeof headerValue === "string" && headerValue.toLowerCase().startsWith("bearer ")) {
    const token = headerValue.substring(7).trim();
    return token || null;
  }
  return null;
}

// Extract session cookie from request
export function extractSessionCookie(req: Request): string | null {
  const cookies = req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  return cookieMatch ? cookieMatch[1] : null;
}

// Extract token from request (prioritizing Bearer header over session cookie)
export function extractToken(req: Request): string | null {
  return extractBearerToken(req) || extractSessionCookie(req);
}

// Verify local JWT token
async function verifyLocalJWT(token: string): Promise<LocalAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });

    // Verify it's a local auth token
    if (payload.type !== "local-auth") {
      return null;
    }

    return {
      userId: payload.userId as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      type: "local-auth",
    };
  } catch (error) {
    if (!isExpectedTokenVerificationError(error)) {
      console.warn("[SDK] JWT verification failed:", error);
    }
    return null;
  }
}

// Verify framework session token (for OAuth)
async function verifyFrameworkSession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });

    // Verify it's a framework session (has openId and appId)
    if (!payload.openId || !payload.appId) {
      return null;
    }

    return {
      openId: payload.openId as string,
      appId: payload.appId as string,
      name: payload.name as string,
    };
  } catch (error) {
    if (!isExpectedTokenVerificationError(error)) {
      console.warn("[SDK] Framework session verification failed:", error);
    }
    return null;
  }
}

// Authenticate request and return user from database
export async function authenticateRequest(req: Request): Promise<User | null> {
  const token = extractToken(req);
  if (!token) {
    return null;
  }

  // Try to verify as local JWT first
  const localPayload = await verifyLocalJWT(token);
  if (localPayload) {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, localPayload.userId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("[SDK] Failed to fetch user by local JWT:", error);
      return null;
    }
  }

  // Try to verify as framework session (OAuth)
  const sessionPayload = await verifyFrameworkSession(token);
  if (sessionPayload) {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.openId, sessionPayload.openId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("[SDK] Failed to fetch user by openId:", error);
      return null;
    }
  }

  return null;
}

// Create session token for OAuth
async function createSessionToken(
  openId: string,
  options: {
    name: string;
    expiresInMs: number;
  }
): Promise<string> {
  const token = await new SignJWT({
    openId,
    appId: process.env.VITE_APP_ID || "default-app",
    name: options.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());

  return token;
}

// Exchange OAuth code for token (placeholder - implement with actual OAuth flow)
async function exchangeCodeForToken(
  code: string,
  state: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
}> {
  // This should be implemented with actual OAuth provider
  // For now, return a placeholder
  return {
    accessToken: "placeholder-token",
  };
}

// Get user info from OAuth provider (placeholder - implement with actual OAuth flow)
async function getUserInfo(accessToken: string): Promise<{
  openId: string;
  email?: string;
  name?: string;
}> {
  // This should be implemented with actual OAuth provider
  // For now, return a placeholder
  return {
    openId: "placeholder-openid",
    email: "user@example.com",
    name: "Placeholder User",
  };
}

export const getUserFromRequest = authenticateRequest;

// Export as default object for compatibility
export const sdk = {
  authenticateRequest,
  getUserFromRequest,
  extractBearerToken,
  extractSessionCookie,
  extractToken,
  createSessionToken,
  exchangeCodeForToken,
  getUserInfo,
};
