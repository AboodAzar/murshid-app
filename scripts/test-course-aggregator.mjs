import fs from "fs";

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

// Build description lookup map
const descMap = new Map();

for (let r = 1; r < seDesc.length; r++) {
  const row = seDesc[r];
  const code = (row[3] || "").replace(/^0+/, "") || row[3];
  const desc = row[4];
  if (code && desc) descMap.set(code.trim(), desc.trim());
}
for (let r = 1; r < csDesc.length; r++) {
  const row = csDesc[r];
  const code = (row[0] || "").replace(/^0+/, "") || row[0];
  const desc = row[4];
  if (code && desc && !descMap.has(code.trim())) descMap.set(code.trim(), desc.trim());
}
for (let r = 1; r < aiDesc.length; r++) {
  const row = aiDesc[r];
  const code = (row[0] || "").replace(/^0+/, "") || row[0];
  const desc = row[4];
  if (code && desc && !descMap.has(code.trim())) descMap.set(code.trim(), desc.trim());
}

console.log("Descriptions mapped:", descMap.size);

// Build unified course map
const courseMap = new Map();

function addPlanRows(rows, deptName) {
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 8) continue;
    const year = parseInt(row[0], 10) || 1;
    const semester = parseInt(row[1], 10) || 1;
    const prereq = row[2] || "";
    const practicalHours = parseInt(row[3], 10) || 0;
    const theoryHours = parseInt(row[4], 10) || 3;
    const credits = parseInt(row[5], 10) || 3;
    const nameAr = row[6];
    const rawCode = (row[7] || "").trim();
    if (!rawCode || !nameAr) continue;

    const inPerson = row[8] === "1";
    const blended = row[9] === "1";
    const online = row[10] === "1";

    let modality = "وجاهي";
    let modalityEn = "in_person";
    if (online) {
      modality = "الكتروني";
      modalityEn = "online";
    } else if (blended) {
      modality = "مدمج";
      modalityEn = "blended";
    }

    const mainCategory = row[11] || "";
    const subCategory = row[12] || "";

    const key = rawCode;
    const cleanKey = rawCode.replace(/^0+/, "");
    const desc = descMap.get(key) || descMap.get(cleanKey) || "";

    if (!courseMap.has(key)) {
      courseMap.set(key, {
        code: rawCode,
        nameAr,
        nameEn: "",
        credits,
        theoryHours,
        practicalHours,
        modality,
        modalityEn,
        year,
        semester,
        prerequisite: prereq,
        mainCategory,
        subCategory,
        descriptionAr: desc,
        departments: [deptName]
      });
    } else {
      const existing = courseMap.get(key);
      if (!existing.departments.includes(deptName)) {
        existing.departments.push(deptName);
      }
      if (!existing.descriptionAr && desc) {
        existing.descriptionAr = desc;
      }
    }
  }
}

addPlanRows(sePlan, "Software Engineering");
addPlanRows(csPlan, "Computer Science");
addPlanRows(aiPlan, "Artificial Intelligence");

console.log("Total unique courses found:", courseMap.size);

const courses = Array.from(courseMap.values());
const modalitiesCount = { وجاهي: 0, مدمج: 0, الكتروني: 0 };
courses.forEach(c => {
  modalitiesCount[c.modality] = (modalitiesCount[c.modality] || 0) + 1;
});

console.log("Modalities distribution:", modalitiesCount);
console.log("Sample 3 courses:", courses.slice(0, 3));
