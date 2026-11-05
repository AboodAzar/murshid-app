import fs from "fs";

let c = fs.readFileSync("client/src/pages/Progress.tsx", "utf8");
c = c.replace(/\r\n/g, "\n");

if (!c.includes("formatGpaDisplay")) {
  c = c.replace(
    'import { useI18n } from "@/contexts/I18nContext";',
    'import { useI18n } from "@/contexts/I18nContext";\nimport { formatUniversityId, formatGpaDisplay } from "@/lib/academicUtils";'
  );
}

const oldGpaCard = `<h3 className="text-lg font-semibold text-white">{t("student.currentGPA")}</h3>
            </div>
            <p className="text-4xl font-bold text-amber-400">{stats?.gpa ?? "0.00"}</p>`;

const newGpaCard = `<h3 className="text-lg font-semibold text-white">{t("student.currentGPA")}</h3>
            </div>
            <p className="text-4xl font-bold text-amber-400">{formatGpaDisplay(stats?.gpa ?? "0.00").primaryScore}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">{formatGpaDisplay(stats?.gpa ?? "0.00").secondaryScale}</p>`;

if (c.includes(oldGpaCard)) {
  c = c.replace(oldGpaCard, newGpaCard);
}

fs.writeFileSync("client/src/pages/Progress.tsx", c);
console.log("Patched client/src/pages/Progress.tsx");
