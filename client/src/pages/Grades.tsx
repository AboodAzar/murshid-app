import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Award, TrendingUp, BookOpen, BarChart3, IdCard, CheckCircle2, AlertTriangle } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  formatUniversityId,
  formatGpaDisplay,
  formatCourseGradeDisplay,
  formatZujCourseCode,
} from "@/lib/academicUtils";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Grades() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const advisorStudentId =
    user?.role === "advisor"
      ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined
      : undefined;

  const { data: dashboard } = trpc.student.dashboard.useQuery(
    advisorStudentId ? { studentId: advisorStudentId } : undefined
  );
  const { data: overview } = trpc.student.overview.useQuery(
    advisorStudentId ? { studentId: advisorStudentId } : undefined
  );

  if (!user) return null;

  const studentUniversityId = formatUniversityId(user);
  const stats = dashboard?.stats;
  const gpaInfo = formatGpaDisplay(stats?.gpa ?? "0.00");
  const courses = dashboard?.courses ?? [];

  // Transform gpaHistory to 100% percentage scale for primary trend chart
  const gpaHistory = (overview?.gpaHistory ?? []).map((h: any) => {
    const rawGpa = typeof h.gpa === "number" ? h.gpa : parseFloat(h.gpa || "0");
    const pct = rawGpa > 20 ? rawGpa : formatGpaDisplay(rawGpa).pctValue;
    return {
      semester: `Sem ${h.semester}`,
      score: pct,
      gpaScale: rawGpa <= 4 ? rawGpa : ((pct - 50) / 12.5 + 1.5),
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header with 9-digit Student ID */}
        <motion.div
          {...fadeInUp}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {dir === "rtl" ? "نظام العلامات المئوي (100%)" : "ZUJ 100% Score System"}
              </span>
              <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                {dir === "rtl" ? "سلم التقديرات المعتمد" : "Official Grading Scale"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {t("student.grades")}
              <span className="text-base font-normal text-slate-400 hidden sm:inline">
                | {dir === "rtl" ? "كشف العلامات والمعدل التراكمي" : "Academic Transcript & Records"}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {dir === "rtl"
                ? "تُعتمد العلامة المئوية (من 100%) كأساس لاحتساب المعدل التراكمي في جامعة الزيتونة، مع إظهار المكافئ من 4.00"
                : "Al-Zaytoonah University evaluates academic standing primarily on the 100% scale with 4.0 GPA equivalent"}
            </p>
          </div>

          {/* Student University ID */}
          <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 shadow-lg shadow-emerald-950/20 backdrop-blur-md self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">
                {dir === "rtl" ? "الرقم الجامعي الرسمي" : "Official University ID"}
              </p>
              <p className="text-base font-mono font-bold text-white tracking-wider">
                {studentUniversityId}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3 Metric Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Cumulative GPA Card - 100% Primary + 4.0 Secondary */}
          <motion.div
            {...fadeInUp}
            className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-5 backdrop-blur-2xl shadow-xl shadow-emerald-950/20 relative overflow-hidden"
          >
            <div className="absolute top-0 end-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {t("student.gpa")} ({dir === "rtl" ? "المعدل التراكمي" : "Cumulative GPA"})
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gpaInfo.bg} ${gpaInfo.color} border ${gpaInfo.border}`}>
                    {dir === "rtl" ? gpaInfo.ratingAr : gpaInfo.ratingEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary 100% Score Display */}
            <div className="mt-2">
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span>{gpaInfo.primaryScore}</span>
                <span className="text-xs text-emerald-400/80 font-normal">/ 100%</span>
              </p>
              {/* Secondary 4.0 Scale in smaller font */}
              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <span>{dir === "rtl" ? "المكافئ على سلم (4.00):" : "4.00 Scale Equivalent:"}</span>
                <span className="font-bold text-slate-200">{gpaInfo.secondaryScale}</span>
              </p>
            </div>
          </motion.div>

          {/* Credits Earned Card */}
          <motion.div
            {...fadeInUp}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t("student.creditsEarned")}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {t("student.outOf")} {stats?.totalCredits ?? 132} {t("student.credits")}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-4xl font-extrabold text-emerald-400">
                {stats?.earnedCredits ?? 0}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((stats?.earnedCredits ?? 0) / (stats?.totalCredits || 132)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Completion Rate Card */}
          <motion.div
            {...fadeInUp}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t("student.completionRate")}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {stats?.semestersLeft ?? 0} {t("student.semestersLeft")}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-4xl font-extrabold text-violet-400">
                {stats?.progress ?? 0}%
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {dir === "rtl" ? "نسبة إنجاز متطلبات الخطة الدراسية" : "Degree plan completion percentage"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* GPA History Chart (100% Score System) */}
        {gpaHistory.length > 0 && (
          <motion.div
            {...fadeInUp}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  {t("student.gpaTrend")} ({dir === "rtl" ? "تطور المعدل الفصلي المئوي" : "Semester GPA % Progression"})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dir === "rtl" ? "المعدل الفصلي والتراكمي عبر الفصول الدراسية" : "Track performance across academic semesters"}
                </p>
              </div>
              <span className="text-xs font-mono bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Scale: 0 – 100%
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaHistory}>
                  <defs>
                    <linearGradient id="gpaGradZuj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="semester" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#06130b",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (${Number(item.payload.gpaScale).toFixed(2)} / 4.00)`,
                      dir === "rtl" ? "المعدل" : "Semester Score",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gpaGradZuj)"
                    dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Course Grades Breakdown Table */}
        <motion.div
          {...fadeInUp}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                {t("student.courseGrades")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {dir === "rtl" ? "العلامة المئوية، المكافئ، والتقدير الأكاديمي لكل مساق" : "Numerical 100% score, 4.0 GPA equivalent, and rating"}
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-white/10">
              {courses.length} {t("student.courses")}
            </span>
          </div>

          {courses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">{t("student.noCoursesYet")}</p>
          ) : (
            <div className="space-y-3">
              {courses.map((c: any) => {
                const gradeInfo = formatCourseGradeDisplay(c.grade, c.gradePoints);

                return (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 gap-3 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {formatZujCourseCode(c.code)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {c.credits} {t("student.credits")}
                          </span>
                        </div>
                        <p className="text-white font-semibold text-sm mt-1">
                          {dir === "rtl" ? c.nameAr || c.name : c.name}
                        </p>
                      </div>
                    </div>

                    {/* Grade Block: 100% Primary, Arabic Letter Grade, 4.0 Subtext, Rating Badge */}
                    <div className="flex items-center gap-4 sm:text-end self-end sm:self-auto">
                      <div className="text-end">
                        {/* Primary 100% Score + Arabic Letter Grade */}
                        <div className="flex items-baseline justify-end gap-1.5 font-mono">
                          <span className="text-xl font-black text-white">
                            {gradeInfo.primaryScore}
                          </span>
                          {gradeInfo.arabicLetter && gradeInfo.arabicLetter !== "—" && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {gradeInfo.arabicLetter}
                            </span>
                          )}
                        </div>
                        {/* Secondary 4.0 scale in smaller font */}
                        {gradeInfo.secondaryScale && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {gradeInfo.secondaryScale}
                          </p>
                        )}
                      </div>

                      {/* ZUJ Rating Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border shrink-0 ${
                          gradeInfo.points >= 3.5
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : gradeInfo.points >= 3.0
                            ? "bg-teal-500/15 text-teal-300 border-teal-500/30"
                            : gradeInfo.points >= 2.5
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : gradeInfo.points >= 2.0
                            ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {dir === "rtl" ? gradeInfo.ratingAr : gradeInfo.ratingEn}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
