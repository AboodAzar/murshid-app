import fs from "fs";

// 1. Patch AdvisorStudents.tsx
let advStudents = fs.readFileSync("client/src/pages/AdvisorStudents.tsx", "utf8");
advStudents = advStudents.replace(/\r\n/g, "\n");

if (!advStudents.includes("formatUniversityId")) {
  advStudents = advStudents.replace(
    'import { useI18n } from "@/contexts/I18nContext";',
    `import { useI18n } from "@/contexts/I18nContext";
import { formatUniversityId, formatGpaDisplay } from "@/lib/academicUtils";`
  );
  advStudents = advStudents.replace(
    '  Search,\n  UserCheck,\n} from "lucide-react";',
    '  Search,\n  UserCheck,\n  IdCard,\n  Award,\n} from "lucide-react";'
  );
}

const oldAdvCard = `                    <div>
                      <h3 className="font-semibold text-white">
                        {student.name || t("common.unnamed")}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{student.email}</span>
                      </div>
                    </div>`;

const newAdvCard = `                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {student.name || t("common.unnamed")}
                        </h3>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <IdCard className="w-3 h-3" />
                          <span>{formatUniversityId(student)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{student.email}</span>
                      </div>
                      {student.gpa && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {formatGpaDisplay(student.gpa).primaryScore}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatGpaDisplay(student.gpa).secondaryScale}
                          </span>
                        </div>
                      )}
                    </div>`;

if (advStudents.includes(oldAdvCard)) {
  advStudents = advStudents.replace(oldAdvCard, newAdvCard);
}
fs.writeFileSync("client/src/pages/AdvisorStudents.tsx", advStudents);
console.log("Patched client/src/pages/AdvisorStudents.tsx");

// 2. Patch AdvisorStudentProfile.tsx
let advProfile = fs.readFileSync("client/src/pages/AdvisorStudentProfile.tsx", "utf8");
advProfile = advProfile.replace(/\r\n/g, "\n");

if (!advProfile.includes("formatUniversityId")) {
  advProfile = advProfile.replace(
    'import { useI18n } from "@/contexts/I18nContext";',
    `import { useI18n } from "@/contexts/I18nContext";
import { formatUniversityId, formatGpaDisplay, formatCourseGradeDisplay } from "@/lib/academicUtils";`
  );
  advProfile = advProfile.replace(
    '  ChevronRight, Plus, CheckCircle2, X\n} from "lucide-react";',
    '  ChevronRight, Plus, CheckCircle2, X, IdCard\n} from "lucide-react";'
  );
}

const oldProfileHeader = `<h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              {s?.name || t("advisor.studentProfile")}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> {s?.email}
              {profile?.department && <span className="text-slate-500">• {profile.department.name}</span>}
            </p>`;

const newProfileHeader = `<div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
                {s?.name || t("advisor.studentProfile")}
              </h1>
              <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/25 text-xs font-bold">
                <IdCard className="w-3.5 h-3.5" />
                <span>ID: {formatUniversityId(s)}</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5" /> {s?.email}
              {profile?.department && <span className="text-slate-500">• {profile.department.name}</span>}
            </p>`;

if (advProfile.includes(oldProfileHeader)) {
  advProfile = advProfile.replace(oldProfileHeader, newProfileHeader);
}

// Stats GPA card in Profile:
const oldProfileGpa = `{ label: t("student.gpa"), value: stats?.gpa ?? "0.00", icon: Award, color: "text-emerald-400 bg-emerald-500/15" },`;
const newProfileGpa = `{ label: t("student.gpa"), value: formatGpaDisplay(stats?.gpa ?? "0.00").primaryScore, subValue: formatGpaDisplay(stats?.gpa ?? "0.00").secondaryScale, icon: Award, color: "text-emerald-400 bg-emerald-500/15" },`;

if (advProfile.includes(oldProfileGpa)) {
  advProfile = advProfile.replace(oldProfileGpa, newProfileGpa);
}

const oldGpaStatRender = `<p className="text-xl font-bold text-white">{stat.value}</p>`;
const newGpaStatRender = `<p className="text-xl font-bold text-white">{stat.value}</p>
              {(stat as any).subValue && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">{(stat as any).subValue}</p>
              )}`;

if (advProfile.includes(oldGpaStatRender)) {
  advProfile = advProfile.replace(oldGpaStatRender, newGpaStatRender);
}

fs.writeFileSync("client/src/pages/AdvisorStudentProfile.tsx", advProfile);
console.log("Patched client/src/pages/AdvisorStudentProfile.tsx");
