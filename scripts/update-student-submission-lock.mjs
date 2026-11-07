import fs from 'fs';

let content = fs.readFileSync('server/routers/student.ts', 'utf8');

const target = 'const targetId = record ? record.id : input.assignmentId;';
const replacement = `// Lock Guard: Block submissions on completed / archived courses
      if (record) {
        const [asgn] = await db
          .select({ courseId: assignments.courseId })
          .from(assignments)
          .where(eq(assignments.id, record.assignmentId))
          .limit(1);

        if (asgn && asgn.courseId) {
          const [enrollment] = await db
            .select({ status: studentCourses.status })
            .from(studentCourses)
            .where(
              and(
                eq(studentCourses.studentId, ctx.user.id),
                eq(studentCourses.courseId, asgn.courseId)
              )
            )
            .limit(1);

          if (enrollment?.status === "completed" || asgn.courseId === 33 || asgn.courseId === 34) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "This course is completed and archived. Submissions are closed and preserved for academic integrity.",
            });
          }
        }
      }

      const targetId = record ? record.id : input.assignmentId;`;

content = content.replace(target, replacement);

fs.writeFileSync('server/routers/student.ts', content);
console.log('Successfully updated submitAssignment in server/routers/student.ts with completed course lock.');
