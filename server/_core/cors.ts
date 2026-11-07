import type { Request, Response, NextFunction } from "express";

/**
 * Validates whether an incoming HTTP Origin header is allowed for CORS.
 * Matches Capacitor, Ionic, localhost, loopback, RFC 1918 private subnets
 * (including iOS Hotspot 172.20.10.*), and allows all origins in development mode.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Direct non-browser requests / same-origin

  if (origin === "capacitor://localhost" || origin === "ionic://localhost") {
    return true;
  }

  // Localhost & 127.0.0.1 (any port)
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;

  // RFC 1918 Private networks (including iOS Hotspot 172.20.10.*)
  if (/^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return true;

  return false;
}

/**
 * Express middleware for CORS origin reflection and preflight OPTIONS termination.
 * Placed ahead of body parsers, rate limiters, and tRPC to short-circuit preflights with 204.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-trpc-source, Accept, Origin, X-Requested-With, Cookie"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Set-Cookie, Authorization, Content-Disposition, X-RateLimit-Limit, X-RateLimit-Remaining"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Vary", "Origin");
  }

  // Short-circuit preflight OPTIONS requests immediately with 204 No Content
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
