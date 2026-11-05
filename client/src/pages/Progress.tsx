import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { TrendingUp, Award, GraduationCap, Calendar, Target, BookOpen, Layers, CheckCircle2, IdCard } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import {
  formatUniversityId,
  formatGpaDisplay,
  formatZujCourseCode,
  getZujCurriculumsSummary,
} from "@/lib/academicUtils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Progress() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: dashboard } = trpc.student.dashboard.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  if (!user) return null;

  const studentUniversityId = formatUniversityId(user);
  const stats = dashboard?.stats;
  const studyPlan = dashboard?.studyPlan;
  const courses = dashboard?.courses ?? [];
  const progress = stats?.progress ?? 0;
  const earned = stats?.earnedCredits ?? 0;
  const total = stats?.totalCredits ?? 132;
  const remaining = Math.max(0, total - earned);
  const curriculumsSummary = getZujCurriculumsSummary(earned);

  const pieData = [
    { name: t("student.earned"), value: earned, color: "#10b981" },
    { name: t("student.remaining"), value: remaining, color: "rgba(255,255,255,0.08)" },
  ];

  const completedCourses = courses.filter((c) => c.status === "completed");
  const inProgressCourses = courses.filter((c) => c.status === "in_progress");

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <motion.div
          {...fadeInUp}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {dir === "rtl" ? "جامعة الزيتونة الأردنية" : "Al-Zaytoonah University"}
              </span>
              <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                {dir === "rtl" ? "الخطة الدراسية الاسترشادية" : "Curriculums & Degree Plan"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {t("student.academicProgress")}
              <span className="text-base font-normal text-slate-400 hidden sm:inline">
                | {dir === "rtl" ? "تتبع إنجاز متطلبات التخرج" : "Requirements Tracking"}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {dir === "rtl"
                ? "متابعة إنجاز فئات الخطة السبع المعتمدة: متطلبات جامعة، كلية، تخصص، ومواد مساندة"
                : "Official progress tracking across the 7 ZUJ curriculum requirement tiers"}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.progress")}</h3>
            </div>
            <p className="text-4xl font-bold text-emerald-400">{progress}%</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.creditsEarned")}</h3>
            </div>
            <p className="text-4xl font-bold text-emerald-400">{earned}</p>
            <p className="text-sm text-slate-400 mt-1">{t("student.outOf")} {total}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.semestersLeft")}</h3>
            </div>
            <p className="text-4xl font-bold text-violet-400">{stats?.semestersLeft ?? 0}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.currentGPA")}</h3>
            </div>
            <p className="text-4xl font-bold text-amber-400">{formatGpaDisplay(stats?.gpa ?? "0.00").primaryScore}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">{formatGpaDisplay(stats?.gpa ?? "0.00").secondaryScale}</p>
          </motion.div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">{t("student.creditsBreakdown")}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-slate-400">{d.name}: <strong className="text-white">{d.value}</strong></span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">{t("student.graduationProgress")}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>{t("student.creditsProgress")}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-700/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-amber-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-center">
                  <p className="text-xl font-bold text-white">{completedCourses.length}</p>
                  <p className="text-xs text-slate-400">{t("student.coursesCompleted")}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-center">
                  <p className="text-xl font-bold text-white">{inProgressCourses.length}</p>
                  <p className="text-xs text-slate-400">{t("student.coursesInProgress")}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-center">
                  <p className="text-xl font-bold text-white">{stats?.currentSemester ?? 0}</p>
                  <p className="text-xs text-slate-400">{t("student.currentSemester")}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-center">
                  <p className="text-xl font-bold text-emerald-400">
                    {formatGpaDisplay(stats?.gpa ?? "0.00").primaryScore}
                  </p>
                  <p className="text-xs text-slate-400">{t("student.currentGPA")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 7 Official ZUJ Curriculums Requirements Tiers (from ZUJ Student Portal vid1_sec027) */}
        <motion.div
          {...fadeInUp}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                {dir === "rtl" ? "متطلبات الخطة الدراسية (الخطة الاسترشادية)" : "Curriculums & Degree Requirements"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {dir === "rtl"
                  ? "الساعات المنجزة والمتبقية في كل متطلب وفقاً لسجلات جامعة الزيتونة الرسمية"
                  : "Earned vs required credit hours per institutional curriculum tier"}
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
              7 {dir === "rtl" ? "فئات متطلبات" : "Requirement Tiers"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {curriculumsSummary.map((tier) => {
              const isDone = tier.requiredCredits > 0 && tier.earnedCredits >= tier.requiredCredits;
              const pct =
                tier.requiredCredits > 0
                  ? Math.min(100, Math.round((tier.earnedCredits / tier.requiredCredits) * 100))
                  : 100;

              return (
                <div
                  key={tier.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {dir === "rtl" ? tier.nameAr : tier.nameEn}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {tier.earnedCredits} / {tier.requiredCredits} {dir === "rtl" ? "ساعة" : "Cr"}
                      </p>
                    </div>
                    {isDone ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                        {dir === "rtl" ? "مكتمل" : "Done"}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                        {pct}%
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isDone ? "bg-emerald-400" : "bg-gradient-to-r from-emerald-500 to-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Completed Courses */}
        <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">{t("student.completedCourses")}</h3>
          {completedCourses.length === 0 ? (
            <p className="text-slate-400 text-center py-6">{t("student.noCompletedCourses")}</p>
          ) : (
            <div className="space-y-2">
              {completedCourses.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{c.name}</span>
                    <span className="text-xs font-mono text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {formatZujCourseCode(c.code)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">{c.grade ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
