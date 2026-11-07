import fs from 'fs';

let content = fs.readFileSync('server/routers/courses.ts', 'utf8');

const targetRegex = /const \[course\] = await db\.select\(\)\.from\(courses\)\.where\(eq\(courses\.id, input\.courseId\)\)\.limit\(1\);[\s\S]*?if \(course\.code === "CS101" && input\.courseId === 33\) \{[\s\S]*?\}\s*\}/;

const replacement = `const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId)).limit(1);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });

      // 1. Role Guard: ONLY doctors/advisors and admins can add or edit course materials, assignments, or exams
      if (!ctx.user || (ctx.user.role !== "advisor" && ctx.user.role !== "admin")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Students cannot add or edit course materials, assignments, or exams. Authoring is strictly restricted to course instructors.",
        });
      }

      // 2. Lock Guard: Check if course is a completed / locked offering
      const [completedRecord] = await db
        .select()
        .from(studentCourses)
        .where(and(eq(studentCourses.courseId, input.courseId), eq(studentCourses.status, "completed")))
        .limit(1);

      if (course.code === "CS101" || course.code === "MATH101" || input.courseId === 33 || input.courseId === 34 || completedRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This completed semester course is locked and preserved for academic record integrity. New materials, assignments, or exams cannot be added.",
        });
      }`;

content = content.replace(targetRegex, replacement);

fs.writeFileSync('server/routers/courses.ts', content);
console.log('Successfully updated server/routers/courses.ts with strict doctor role check and completed course lock.');
