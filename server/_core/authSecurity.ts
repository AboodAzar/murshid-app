import crypto from "crypto";
import { errors, SignJWT, jwtVerify } from "jose";

type UserRole = "student" | "advisor" | "admin";

export type LocalAuthPayload = {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  type: "local-auth";
};

export type FrameworkSessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

const PASSWORD_ALGORITHM = "sha512";
const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_VERSION = "pbkdf2";
const RESET_TOKEN_ALGORITHM = "sha256";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be configured in production");
    }

    return "development-only-jwt-secret-change-me";
  }

  return secret;
}

export function getJwtSecretKey() {
  return new TextEncoder().encode(getJwtSecret());
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_ALGORITHM
    )
    .toString("hex");

  return `${PASSWORD_VERSION}:${PASSWORD_ALGORITHM}:${PASSWORD_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const parts = hashedPassword.split(":");

  if (parts.length === 5 && parts[0] === PASSWORD_VERSION) {
    const [, algorithm, iterationsValue, salt, hash] = parts;
    const iterations = Number(iterationsValue);

    if (!algorithm || !iterations || !salt || !hash) return false;

    const hashVerify = crypto
      .pbkdf2Sync(password, salt, iterations, PASSWORD_KEY_LENGTH, algorithm)
      .toString("hex");

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashVerify));
  }

  if (parts.length === 2) {
    const [salt, hash] = parts;
    if (!salt || !hash) return false;

    const legacyHashVerify = crypto
      .pbkdf2Sync(password, salt, 1000, PASSWORD_KEY_LENGTH, PASSWORD_ALGORITHM)
      .toString("hex");

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(legacyHashVerify));
  }

  return false;
}

export async function generateLocalAuthToken(input: {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}) {
  return new SignJWT({
    userId: input.userId,
    email: input.email,
    name: input.name,
    role: input.role,
    type: "local-auth",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifyLocalAuthToken(
  token: string
): Promise<LocalAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });

    if (payload.type !== "local-auth") return null;
    if (
      payload.role !== "student" &&
      payload.role !== "advisor" &&
      payload.role !== "admin"
    ) {
      return null;
    }

    return {
      userId: Number(payload.userId),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role,
      type: "local-auth",
    };
  } catch (error) {
    if (!isExpectedTokenVerificationError(error)) {
      console.warn("[Auth] JWT verification failed:", error);
    }
    return null;
  }
}

export async function generateFrameworkSessionToken(input: {
  openId: string;
  appId: string;
  name: string;
  expiresIn?: string;
}) {
  return new SignJWT({
    openId: input.openId,
    appId: input.appId,
    name: input.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(input.expiresIn ?? "7d")
    .sign(getJwtSecretKey());
}

export async function verifyFrameworkSessionToken(
  token: string
): Promise<FrameworkSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });

    if (!payload.openId || !payload.appId) return null;

    return {
      openId: String(payload.openId),
      appId: String(payload.appId),
      name: String(payload.name ?? ""),
    };
  } catch (error) {
    if (!isExpectedTokenVerificationError(error)) {
      console.warn("[Auth] Framework session verification failed:", error);
    }
    return null;
  }
}

export function createResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(token: string) {
  return crypto.createHash(RESET_TOKEN_ALGORITHM).update(token).digest("hex");
}

function isExpectedTokenVerificationError(error: unknown) {
  return (
    error instanceof errors.JOSEError ||
    (error instanceof Error &&
      (error.name === "JWTExpired" ||
        error.name === "JWTClaimValidationFailed" ||
        error.name === "JWSInvalid"))
  );
}
