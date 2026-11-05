import fs from "fs";

let content = fs.readFileSync("server/routers/student.ts", "utf8");

const oldCode = `      return items;
    }),`;

const newCode = `      return items.map((item) => {
        const isOverdueUnsubmitted = Boolean(
          item.status === "pending" && item.dueDate && new Date() > new Date(item.dueDate)
        );
        const isLateSubmission = Boolean(
          item.submittedAt && item.dueDate && new Date(item.submittedAt) > new Date(item.dueDate)
        );
        const effectiveStatus = (item.status === "pending" && isOverdueUnsubmitted) ? "overdue" : item.status;
        return {
          ...item,
          status: effectiveStatus,
          isLateSubmission,
          isOverdueUnsubmitted,
        };
      });
    }),`;

const normOld = oldCode.replace(/\r\n/g, "\n");
const normContent = content.replace(/\r\n/g, "\n");

if (normContent.includes(normOld)) {
  content = normContent.replace(normOld, newCode.replace(/\r\n/g, "\n"));
  fs.writeFileSync("server/routers/student.ts", content, "utf8");
  console.log("Successfully patched student.ts with isLateSubmission computation!");
} else {
  console.error("Target oldCode not found in student.ts");
  process.exit(1);
}
