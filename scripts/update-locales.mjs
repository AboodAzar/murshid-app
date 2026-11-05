import fs from "fs";

// Update en/common.json
let en = fs.readFileSync("client/src/locales/en/common.json", "utf8");
en = en.replace('"dashboard": "Student Dashboard"', '"dashboard": "Dashboard"');
fs.writeFileSync("client/src/locales/en/common.json", en, "utf8");
console.log("Updated en/common.json");

// Update ar/common.json
let ar = fs.readFileSync("client/src/locales/ar/common.json", "utf8");
// Replace Arabic Student Dashboard with لوحة التحكم
ar = ar.replace(/"dashboard":\s*"[^"]*"/, '"dashboard": "لوحة التحكم"');
fs.writeFileSync("client/src/locales/ar/common.json", ar, "utf8");
console.log("Updated ar/common.json");
