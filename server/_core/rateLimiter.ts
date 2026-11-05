import type { Request, Response, NextFunction } from "express";

// Simple in-memory rate limiter
// In production, use Redis or a dedicated rate limiting service
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}

function sendRateLimitResponse(res: Response, message: string) {
  const payload = {
    error: {
      json: {
        message,
        code: -32029,
        data: {
          code: "TOO_MANY_REQUESTS",
          httpStatus: 429,
        },
      },
    },
  };

  res.status(429).json([payload]);
}

export function createRateLimiter(options: RateLimitOptions) {
  const rateLimitMap = new Map<string, RateLimitEntry>();
  const {
    windowMs,
    maxRequests,
    keyGenerator = req => req.ip || "unknown",
    skipSuccessfulRequests = false,
  } = options;

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (entry.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000);

  return (req: Request, res: Response, next: NextFunction) => {
    // Exempt loopback/localhost and local test traffic from rate limiting
    const ip = req.ip || req.socket?.remoteAddress || "";
    const isLoopback =
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip === "::ffff:127.0.0.1" ||
      ip.includes("127.0.0.1") ||
      ip === "localhost";

    if (isLoopback || process.env.NODE_ENV === "test") {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();

    let entry = rateLimitMap.get(key);

    // Create new entry if it doesn't exist or has expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitMap.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000);
      const message = `Rate limit exceeded. Try again in ${resetTime} seconds.`;
      res.setHeader("Retry-After", resetTime.toString());
      sendRateLimitResponse(res, message);
      return;
    }

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - entry.count).toString()
    );
    res.setHeader("X-RateLimit-Reset", new Date(entry.resetTime).toISOString());

    next();
  };
}

// Pre-configured rate limiters for different use cases
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5000, // Increased drastically for presentation/demo purposes
  keyGenerator: req => {
    // Use IP address as key, but could also use email for more specific limiting
    return req.ip || "unknown";
  },
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10000,
  keyGenerator: req => req.ip || "unknown",
});

export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: process.env.NODE_ENV === "production" ? 3 : 30,
  keyGenerator: req => req.ip || "unknown",
});
