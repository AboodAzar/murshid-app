import fs from "fs";
import path from "path";

const csvPath = path.resolve("Runpod", "data", "AI_Study_Plan_1.csv");
const content = fs.readFileSync(csvPath, "utf8");

// Parse CSV taking quotes into account
function parseCSV(text) {
  const lines = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(field.trim());
      field = "";
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(field.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
        lines.push(row);
      }
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    lines.push(row);
  }
  return lines;
}

const parsed = parseCSV(content);
const header = parsed[0];
console.log("Header fields:", header);

const courses = parsed.slice(1).map(r => ({
  year: r[0],
  semester: r[1],
  prereq: r[2],
  practicalHours: r[3],
  theoryHours: r[4],
  credits: parseInt(r[5] || "3", 10),
  nameAr: r[6]?.replace(/\r?\n/g, " "),
  code: r[7],
  inPerson: r[8],
  blended: r[9],
  online: r[10],
  mainCategory: r[11]?.trim(),
  subCategory: r[12]?.trim(),
}));

console.log("Total courses:", courses.length);
console.log("\n--- List of all AI courses from AI_Study_Plan_1.csv ---");
courses.forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.code}] "${c.nameAr}" | Year ${c.year} Sem ${c.semester} | ${c.credits} Cr | ${c.mainCategory} -> ${c.subCategory} | Prereq: ${c.prereq}`);
});
