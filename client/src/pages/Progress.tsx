import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { TrendingUp, Award, GraduationCap, Calendar, Target, BookOpen } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Progress() {
  const { t } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: dashboard } = trpc.student.dashboard.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  if (!user) return null;

  const stats = dashboard?.stats;
  const studyPlan = dashboard?.studyPlan;
  const courses = dashboard?.courses ?? [];
  const progress = stats?.progress ?? 0;
  const earned = stats?.earnedCredits ?? 0;
  const total = stats?.totalCredits ?? 1;
  const remaining = Math.max(0, total - earned);

  const pieData = [
    { name: t("student.earned"), value: earned, color: "#3b82f6" },
    { name: t("student.remaining"), value: remaining, color: "rgba(255,255,255,0.08)" },
  ];

  const completedCourses = courses.filter((c) => c.status === "completed");
  const inProgressCourses = courses.filter((c) => c.status === "in_progress");

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp}>
          <h1 className="text-3xl font-bold text-white">{t("student.academicProgress")}</h1>
          <p className="text-slate-400 mt-1">{t("student.progressOverview")}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.progress")}</h3>
            </div>
            <p className="text-4xl font-bold text-blue-400">{progress}%</p>
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
            <p className="text-4xl font-bold text-amber-400">{stats?.gpa ?? "0.00"}</p>
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
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
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
                  <p className="text-xl font-bold text-emerald-400">{stats?.gpa ?? "0.00"}</p>
                  <p className="text-xs text-slate-400">{t("student.currentGPA")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

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
                    <span className="text-xs text-slate-500">{c.code}</span>
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
