import fs from "fs";

let content = fs.readFileSync("drizzle/schema.ts", "utf8");
const target = "export type InsertStudentAssignment = typeof studentAssignments.$inferInsert;";
const addition = `

/**
 * Course materials, slides, notes, assignments, quizzes and exams by chapter
 */
export const courseMaterials = mysqlTable(
  "course_materials",
  {
    id: int("id").autoincrement().primaryKey(),
    courseId: int("courseId").notNull(),
    chapterNumber: int("chapterNumber").notNull().default(1),
    chapterTitle: varchar("chapterTitle", { length: 255 }).default("Chapter 1"),
    chapterTitleAr: varchar("chapterTitleAr", { length: 255 }).default("الفصل 1"),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    titleAr: varchar("titleAr", { length: 255 }),
    description: text("description"),
    fileName: varchar("fileName", { length: 255 }),
    fileUrl: varchar("fileUrl", { length: 500 }),
    fileSize: varchar("fileSize", { length: 50 }).default("2.5 MB"),
    dueDate: timestamp("dueDate"),
    totalPoints: int("totalPoints").default(10),
    doctorId: int("doctorId"),
    doctorName: varchar("doctorName", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    courseIdIdx: index("idx_cm_courseId").on(table.courseId),
    chapterIdx: index("idx_cm_chapter").on(table.courseId, table.chapterNumber),
  })
);

export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type InsertCourseMaterial = typeof courseMaterials.$inferInsert;`;

if (content.includes(target) && !content.includes("courseMaterials = mysqlTable")) {
  content = content.replace(target, target + addition);
  fs.writeFileSync("drizzle/schema.ts", content, "utf8");
  console.log("Successfully updated drizzle/schema.ts");
} else {
  console.log("Already updated or target not found");
}
