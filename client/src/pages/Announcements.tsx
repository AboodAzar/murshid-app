import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Megaphone, Calendar, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Announcements() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { data: announcements = [], isLoading } = trpc.student.studentAnnouncements.useQuery({ limit: 50 });

  if (!user) return null;

  const priorityConfig: Record<string, { icon: React.ReactNode; color: string; border: string }> = {
    high: { icon: <AlertTriangle className="w-4 h-4" />, color: "bg-red-500/15 text-red-400", border: "border-red-500/30" },
    medium: { icon: <Info className="w-4 h-4" />, color: "bg-amber-500/15 text-amber-400", border: "border-amber-500/30" },
    low: { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-blue-500/15 text-blue-400", border: "border-blue-500/30" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10" dir={dir}>
        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("student.announcements")}</h1>
            <p className="text-slate-400 mt-1">{announcements.length} {t("student.announcementsCount")}</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20">
            <Megaphone className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t("student.noAnnouncements")}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a, i) => {
              const config = priorityConfig[a.priority ?? "medium"] || priorityConfig.medium;
              return (
                <motion.div
                  key={a.id}
                  {...fadeInUp}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border ${config.border} bg-white/[0.04] p-5 backdrop-blur-2xl`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                        {config.icon}
                      </span>
                      <h3 className="text-lg font-semibold text-white">{dir === "rtl" ? a.titleAr : a.title}</h3>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-3">
                    {dir === "rtl" ? a.contentAr : a.content}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
