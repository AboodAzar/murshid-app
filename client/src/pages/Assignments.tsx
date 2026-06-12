import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Clock, AlertCircle, CheckCircle2, Award, Calendar } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Assignments() {
  const { t } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: assignments = [], isLoading } = trpc.student.assignments.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  if (!user) return null;

  const pending = assignments.filter((a) => a.status === "pending");
  const submitted = assignments.filter((a) => a.status === "submitted" || a.status === "graded");
  const overdue = assignments.filter((a) => a.status === "overdue");

  const renderList = (items: typeof assignments, title: string, icon: React.ReactNode, emptyText: string) => (
    <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">{icon} {title}</h3>
      {items.length === 0 ? (
        <p className="text-slate-400 text-center py-6">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const daysLeft = a.dueDate
              ? Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : 0;
            return (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                <div>
                  <p className="text-white font-medium">{a.title}</p>
                  <p className="text-sm text-slate-400">{a.courseCode} • {a.courseName}</p>
                </div>
                <div className="text-end">
                  {a.status === "pending" && daysLeft >= 0 && (
                    <p className="text-xs text-amber-400 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {daysLeft} {t("student.daysLeft")}
                    </p>
                  )}
                  {a.status === "overdue" && (
                    <p className="text-xs text-red-400 flex items-center justify-end gap-1">
                      <AlertCircle className="w-3 h-3" /> {t("student.overdue")}
                    </p>
                  )}
                  {a.status === "graded" && a.score !== null && a.score !== undefined && (
                    <p className="text-sm text-emerald-400 font-medium">{a.score} / {a.totalPoints}</p>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                    a.status === "graded" ? "bg-emerald-500/15 text-emerald-400" :
                    a.status === "submitted" ? "bg-blue-500/15 text-blue-400" :
                    a.status === "overdue" ? "bg-red-500/15 text-red-400" :
                    "bg-amber-500/15 text-amber-400"
                  }`}>
                    {a.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("student.assignments")}</h1>
            <p className="text-slate-400 mt-1">{assignments.length} {t("student.totalAssignments")}</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-2xl font-bold text-amber-400">{pending.length}</p>
              <p className="text-xs text-slate-400">{t("student.pending")}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-400">{submitted.length}</p>
              <p className="text-xs text-slate-400">{t("student.submitted")}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{overdue.length}</p>
              <p className="text-xs text-slate-400">{t("student.overdue")}</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {renderList(pending, t("student.pendingAssignments"), <Clock className="w-5 h-5 text-amber-400" />, t("student.noPendingAssignments"))}
            {renderList(submitted, t("student.submittedAssignments"), <CheckCircle2 className="w-5 h-5 text-blue-400" />, t("student.noSubmittedAssignments"))}
            {renderList(overdue, t("student.overdueAssignments"), <AlertCircle className="w-5 h-5 text-red-400" />, t("student.noOverdueAssignments"))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
