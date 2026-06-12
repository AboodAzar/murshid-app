import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Award, TrendingUp, BookOpen, BarChart3 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Grades() {
  const { t } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: dashboard } = trpc.student.dashboard.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: overview } = trpc.student.overview.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  if (!user) return null;

  const gpaHistory = overview?.gpaHistory ?? [];
  const courses = dashboard?.courses ?? [];
  const stats = dashboard?.stats;

  const gradeColors: Record<string, string> = {
    A: "bg-emerald-500/15 text-emerald-400",
    "A-": "bg-emerald-500/15 text-emerald-400",
    "B+": "bg-blue-500/15 text-blue-400",
    B: "bg-blue-500/15 text-blue-400",
    "B-": "bg-sky-500/15 text-sky-400",
    "C+": "bg-amber-500/15 text-amber-400",
    C: "bg-amber-500/15 text-amber-400",
    "D+": "bg-orange-500/15 text-orange-400",
    D: "bg-orange-500/15 text-orange-400",
    F: "bg-red-500/15 text-red-400",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp}>
          <h1 className="text-3xl font-bold text-white">{t("student.grades")}</h1>
          <p className="text-slate-400 mt-1">{t("student.academicPerformance")}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.gpa")}</h3>
            </div>
            <p className="text-4xl font-bold text-blue-400">{stats?.gpa ?? "0.00"}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.creditsEarned")}</h3>
            </div>
            <p className="text-4xl font-bold text-emerald-400">{stats?.earnedCredits ?? 0}</p>
            <p className="text-sm text-slate-400 mt-1">{t("student.outOf")} {stats?.totalCredits ?? 0}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.completionRate")}</h3>
            </div>
            <p className="text-4xl font-bold text-violet-400">{stats?.progress ?? 0}%</p>
          </motion.div>
        </div>

        {gpaHistory.length > 0 && (
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">{t("student.gpaTrend")}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaHistory}>
                  <defs>
                    <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="semester" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis domain={[0, 4]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={2} fill="url(#gpaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">{t("student.courseGrades")}</h3>
          {courses.length === 0 ? (
            <p className="text-slate-400 text-center py-6">{t("student.noCoursesYet")}</p>
          ) : (
            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-sm text-slate-400">{c.code} • {c.credits} {t("student.credits")}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${gradeColors[c.grade ?? ""] ?? "bg-slate-500/15 text-slate-400"}`}>
                      {c.grade ?? "—"}
                    </span>
                    {c.gradePoints && (
                      <p className="text-xs text-slate-400 mt-1">{c.gradePoints} {t("student.pts")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
