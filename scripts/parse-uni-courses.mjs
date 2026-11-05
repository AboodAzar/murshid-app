import fs from "fs";
import path from "path";

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8");
  const rows = [];
  let currentRow = [];
  let inQuotes = false;
  let currentField = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  }
  return rows;
}

const sePlan = parseCsv("S:/murshid (1)/Runpod/data/SE_Study_Plan_1.csv");
const csPlan = parseCsv("S:/murshid (1)/Runpod/data/CS_Study_Plan_1.csv");
const aiPlan = parseCsv("S:/murshid (1)/Runpod/data/AI_Study_Plan_1.csv");

const seDesc = parseCsv("S:/murshid (1)/Runpod/data/SE_Materials_Descriptions.csv");
const csDesc = parseCsv("S:/murshid (1)/Runpod/data/CS_Materials_Descriptions.csv");
const aiDesc = parseCsv("S:/murshid (1)/Runpod/data/AI_Materials_Descriptions.csv");

console.log("SE Plan:", sePlan.length, "header:", sePlan[0]);
console.log("CS Plan:", csPlan.length, "header:", csPlan[0]);
console.log("AI Plan:", aiPlan.length, "header:", aiPlan[0]);
console.log("SE Desc:", seDesc.length, "header:", seDesc[0]);
console.log("CS Desc:", csDesc.length, "header:", csDesc[0]);
console.log("AI Desc:", aiDesc.length, "header:", aiDesc[0]);
