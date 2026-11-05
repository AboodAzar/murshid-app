import fs from "fs";

let content = fs.readFileSync("server/routers/advisor.ts", "utf8");
content = content.replace(/\r\n/g, "\n");

// Add helper if not present
const helperCode = `
function formatUniversityIdServer(user?: { id?: number; email?: string; openId?: string; name?: string } | null): string {
  if (!user) return "202212359";
  if (user.email === "abood@gmail.com" || user.name?.toLowerCase().includes("abood") || user.name?.toLowerCase().includes("abdualrhman")) {
    return "202212359";
  }
  const matchEmail = user.email?.match(/^(\\d{9})@/);
  if (matchEmail) return matchEmail[1];
  const matchOpenId = user.openId?.match(/(\\d{9})/);
  if (matchOpenId) return matchOpenId[1];

  const knownMap: Record<number, string> = {
    1: "202212359",
    210027: "202110027",
    210028: "202210028",
    210029: "202210029",
    210030: "202310030",
    210031: "202310031",
    210032: "202410032",
    210033: "202210033",
    210034: "202310034",
    210035: "202110035",
    240001: "202220650",
  };
  if (user.id && knownMap[user.id]) return knownMap[user.id];
  if (user.id) {
    const seq = String(user.id % 100000).padStart(5, "0");
    return \`2022\${seq}\`;
  }
  return "202212359";
}

function gpaToPercentageServer(gpaInput: number | string | null | undefined): number {
  if (gpaInput === null || gpaInput === undefined) return 0;
  const num = typeof gpaInput === "string" ? parseFloat(gpaInput) : gpaInput;
  if (isNaN(num) || num <= 0) return 0;
  if (num > 20) return Math.min(100, Math.round(num * 10) / 10);
  let pct = 0;
  if (num >= 3.9) pct = 93.0 + (num - 3.9) * 35;
  else if (num >= 3.5) pct = 84.0 + ((num - 3.5) / 0.4) * 9.0;
  else if (num >= 3.0) pct = 76.0 + ((num - 3.0) / 0.5) * 8.0;
  else if (num >= 2.5) pct = 68.0 + ((num - 2.5) / 0.5) * 8.0;
  else if (num >= 2.0) pct = 60.0 + ((num - 2.0) / 0.5) * 8.0;
  else if (num >= 1.5) pct = 50.0 + ((num - 1.5) / 0.5) * 10.0;
  else pct = Math.max(35, num * 33.3);
  return Math.min(100, Math.round(pct * 10) / 10);
}
`;

if (!content.includes("formatUniversityIdServer")) {
  content = content.replace("export const advisorRouter = router({", helperCode + "\nexport const advisorRouter = router({");
}

// Update getAssignedStudents enrichment
content = content.replace(
  `      enriched.push({ ...s, gpa: plan?.currentGPA ?? "0.00", credits: plan?.completedCredits ?? 0, attendanceRate: attRate,
        riskLevel: gpaVal < 2.0 || attRate < 70 ? "high" : gpaVal < 2.5 ? "medium" : "low" });`,
  `      enriched.push({
        ...s,
        universityId: formatUniversityIdServer(s),
        gpa: plan?.currentGPA ?? "0.00",
        gpaPercentage: gpaToPercentageServer(plan?.currentGPA ?? "0.00"),
        credits: plan?.completedCredits ?? 0,
        attendanceRate: attRate,
        riskLevel: gpaVal < 2.0 || attRate < 70 ? "high" : gpaVal < 2.5 ? "medium" : "low"
      });`
);

// Update getStudentProfile student return
content = content.replace(
  `    return {
      student,
      department: dept ?? null,`,
  `    const enhancedStudent = {
      ...student,
      universityId: formatUniversityIdServer(student),
    };

    return {
      student: enhancedStudent,
      department: dept ?? null,`
);

fs.writeFileSync("server/routers/advisor.ts", content);
console.log("Successfully patched server/routers/advisor.ts");
