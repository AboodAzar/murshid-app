import fs from 'fs';
import path from 'path';

const filePath = path.resolve('server/_core/index.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure path and fs imports
if (!content.includes('import path from "path";')) {
  content = content.replace(
    'import net from "net";',
    'import net from "net";\nimport path from "path";\nimport fs from "fs";'
  );
}

// Update CSP to allow external CDN scripts and styles needed by phone simulator
const oldCsp = `"Content-Security-Policy",\n      "default-src 'self'; " +`;
const crlfOldCsp = `"Content-Security-Policy",\r\n      "default-src 'self'; " +`;

const targetCsp = `res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
        "img-src 'self' data: https: blob:; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "connect-src 'self' https:; " +
        "frame-ancestors 'none';"
    );`;

// Replace CSP block
content = content.replace(/res\.setHeader\(\s*"Content-Security-Policy"[\s\S]*?"frame-ancestors 'none';"\s*\);/, targetCsp);

// Add preview route before tRPC or Vite
const previewRoute = `
  // Dedicated route to serve the phone preview simulator
  app.get(["/phone", "/preview", "/mobile", "/phone-preview"], (_req, res) => {
    const candidatePaths = [
      path.resolve(process.cwd(), "client", "public", "phone.html"),
      path.resolve(process.cwd(), "dist", "public", "phone.html"),
      path.resolve("C:\\\\Users\\\\abood\\\\.gemini\\\\antigravity\\\\brain\\\\8aa2adca-5a08-481d-adfc-6fc424d4db49", "phone_preview.html")
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return res.sendFile(p);
      }
    }
    res.status(404).send("Phone preview not found");
  });
`;

if (!content.includes('/phone-preview')) {
  content = content.replace('registerOAuthRoutes(app);', `registerOAuthRoutes(app);\n${previewRoute}`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched server/_core/index.ts with phone preview route and updated CSP!');
