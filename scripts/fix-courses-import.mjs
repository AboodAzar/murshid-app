import fs from "fs";

let code = fs.readFileSync("server/routers/courses.ts", "utf8");

const importPattern = /import\s*\{\s*courses,\s*coursePrerequisites,\s*studentCourses,\s*departments,?\s*\}\s*from\s*["']\.\.\/\.\.\/drizzle\/schema["'];/;

const replacement = `import {
  courses,
  coursePrerequisites,
  studentCourses,
  departments,
  courseMaterials,
  users,
  courseSchedules,
  rooms,
  buildings,
  attendance,
  assignments,
  studentAssignments,
} from "../../drizzle/schema";
import { desc } from "drizzle-orm";`;

if (importPattern.test(code)) {
  code = code.replace(importPattern, replacement);
  fs.writeFileSync("server/routers/courses.ts", code, "utf8");
  console.log("Successfully replaced imports in server/routers/courses.ts");
} else {
  console.log("Import pattern did not match!");
}
