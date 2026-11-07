import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  authRateLimiter,
  passwordResetRateLimiter,
  generalRateLimiter,
} from "./rateLimiter";
import { corsMiddleware } from "./cors";

// Port availability check removed for Cloud Run compatibility

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust the first proxy (Render's load balancer) to get correct client IPs for rate limiting
  app.set("trust proxy", 1);

  // Enable CORS for iOS Capacitor and local network origins
  app.use(corsMiddleware);

  // Security headers middleware
  app.use((req, res, next) => {
    // Content Security Policy
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
        "img-src 'self' data: https: http: blob: capacitor: ionic:; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "connect-src 'self' https: http: capacitor: ionic: ws: wss:; " +
        "frame-ancestors 'none';"
    );

    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");

    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Enable XSS protection
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions policy
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), " + "microphone=(), " + "camera=(), " + "payment=()"
    );

    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Apply rate limiting to authentication endpoints
  app.use("/api/trpc/auth.login", authRateLimiter);
  app.use("/api/trpc/auth.register", authRateLimiter);
  app.use("/api/trpc/passwordReset.requestReset", passwordResetRateLimiter);

  // Apply general rate limiting to all API endpoints
  app.use("/api/trpc", generalRateLimiter);

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // Dedicated route to serve the phone preview simulator
  app.get(["/phone", "/preview", "/mobile", "/phone-preview"], (_req, res) => {
    const candidatePaths = [
      path.resolve(process.cwd(), "client", "public", "phone.html"),
      path.resolve(process.cwd(), "dist", "public", "phone.html"),
      path.resolve("C:\\Users\\abood\\.gemini\\antigravity\\brain\\8aa2adca-5a08-481d-adfc-6fc424d4db49", "phone_preview.html")
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return res.sendFile(p);
      }
    }
    res.status(404).send("Phone preview not found");
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
