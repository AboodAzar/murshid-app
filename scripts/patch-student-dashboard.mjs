import fs from "fs";

let content = fs.readFileSync("client/src/pages/StudentDashboard.tsx", "utf8");
content = content.replace(/\r\n/g, "\n");

// 1. Add imports if not present
if (!content.includes("formatUniversityId")) {
  content = content.replace(
    'import { useI18n } from "@/contexts/I18nContext";',
    `import { useI18n } from "@/contexts/I18nContext";
import { formatUniversityId, formatGpaDisplay, formatCourseGradeDisplay, getZujCourseModality } from "@/lib/academicUtils";`
  );
}

if (!content.includes("IdCard,")) {
  content = content.replace(
    '  BrainCircuit, ShieldAlert,',
    '  BrainCircuit, ShieldAlert, IdCard, Globe, Video,'
  );
}

// 2. Header: Add 9-digit Student ID Badge
const oldHeaderWelcome = `<h1 className={\`text-3xl sm:text-4xl font-bold \${gradientText}\`}>{t("student.dashboard")}</h1>
            <p className="text-muted-foreground text-base">{t("common.welcome")}, {userName}</p>`;

const newHeaderWelcome = `<h1 className={\`text-3xl sm:text-4xl font-bold \${gradientText}\`}>{t("student.dashboard")}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-muted-foreground text-base">{t("common.welcome")}, <span className="text-white font-medium">{userName}</span></p>
              <span className="inline-flex items-center gap-1.5 font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 text-xs font-bold">
                <IdCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>{dir === "rtl" ? "الرقم الجامعي:" : "Student ID:"} {formatUniversityId(user)}</span>
              </span>
            </div>`;

if (content.includes(oldHeaderWelcome)) {
  content = content.replace(oldHeaderWelcome, newHeaderWelcome);
}

// 3. Stats Row: Primary 100% GPA + small 4.0 scale subtext
const oldStatsRender = `                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>`;

const newStatsRender = `                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{s.label}</p>
                  {i === 0 ? (
                    <div>
                      <p className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                        <span>{formatGpaDisplay((dashboard?.stats ?? EMPTY_STATS).gpa).primaryScore}</span>
                        <span className="text-[11px] text-emerald-400 font-normal">/ 100%</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatGpaDisplay((dashboard?.stats ?? EMPTY_STATS).gpa).secondaryScale}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                  )}`;

if (content.includes(oldStatsRender)) {
  content = content.replace(oldStatsRender, newStatsRender);
}

// 4. In Bottom Stats Summary (line 923)
const oldBottomGpa = `<p className="text-xl font-bold text-emerald-400">{(dashboard?.stats ?? EMPTY_STATS).gpa}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("student.currentGPA")}</p>`;

const newBottomGpa = `<p className="text-xl font-black text-emerald-400">{formatGpaDisplay((dashboard?.stats ?? EMPTY_STATS).gpa).primaryScore}</p>
              <p className="text-[10px] text-slate-400 font-mono">{formatGpaDisplay((dashboard?.stats ?? EMPTY_STATS).gpa).secondaryScale}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("student.currentGPA")}</p>`;

if (content.includes(oldBottomGpa)) {
  content = content.replace(oldBottomGpa, newBottomGpa);
}

fs.writeFileSync("client/src/pages/StudentDashboard.tsx", content);
console.log("Successfully patched client/src/pages/StudentDashboard.tsx");
