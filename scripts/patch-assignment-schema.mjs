import fs from "fs";

let content = fs.readFileSync("drizzle/schema.ts", "utf8");

content = content.replace(
  `courseId: int("courseId").notNull(),`,
  `courseId: int("courseId").notNull(),\n    advisorId: int("advisorId"),`
);

fs.writeFileSync("drizzle/schema.ts", content, "utf8");
console.log("Added advisorId to assignments");
