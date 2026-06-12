import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Clock, CalendarDays } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Attendance() {
  const { t } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: rawRecords = [], isLoading } = trpc.student.attendance.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const records = rawRecords.filter((r: any, index: number, self: any[]) =>
    index === self.findIndex((rec: any) => rec.id === r.id)
  );

  if (!user) return null;

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const late = records.filter((r) => r.status === "late").length;
  const total = records.length;
  const rate = total > 0 ? Math.round(((present + excused) / total) * 100) : 100;

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    present: { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-500/15 text-emerald-400", label: t("student.present") },
    absent: { icon: <XCircle className="w-4 h-4" />, color: "bg-red-500/15 text-red-400", label: t("student.absent") },
    excused: { icon: <AlertTriangle className="w-4 h-4" />, color: "bg-amber-500/15 text-amber-400", label: t("student.excused") },
    late: { icon: <Clock className="w-4 h-4" />, color: "bg-orange-500/15 text-orange-400", label: t("student.late") },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp}>
          <h1 className="text-3xl font-bold text-white">{t("student.attendance")}</h1>
          <p className="text-slate-400 mt-1">{t("student.attendanceRecords")}</p>
        </motion.div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl text-center">
            <p className="text-3xl font-bold text-emerald-400">{rate}%</p>
            <p className="text-xs text-slate-400 mt-1">{t("student.rate")}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl text-center">
            <p className="text-3xl font-bold text-emerald-400">{present}</p>
            <p className="text-xs text-slate-400 mt-1">{t("student.present")}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl text-center">
            <p className="text-3xl font-bold text-amber-400">{excused}</p>
            <p className="text-xs text-slate-400 mt-1">{t("student.excused")}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl text-center">
            <p className="text-3xl font-bold text-orange-400">{late}</p>
            <p className="text-xs text-slate-400 mt-1">{t("student.late")}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl text-center">
            <p className="text-3xl font-bold text-red-400">{absent}</p>
            <p className="text-xs text-slate-400 mt-1">{t("student.absent")}</p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20">
            <CalendarDays className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t("student.noAttendanceRecords")}</p>
          </motion.div>
        ) : (
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="space-y-2">
              {records.map((r) => {
                const config = statusConfig[r.status] || statusConfig.present;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                        {config.icon}
                      </span>
                      <div>
                        <p className="text-white font-medium">{r.courseName}</p>
                        <p className="text-xs text-slate-400">{r.courseCode}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
