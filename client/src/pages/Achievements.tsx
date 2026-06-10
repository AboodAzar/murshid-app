import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Award, Star, BookOpen, CheckCircle2, TrendingUp, GraduationCap,
  Flame, Zap, Target, Lock,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Award, CheckCircle2, TrendingUp, GraduationCap, Flame, Zap, Target, Star,
};

export default function Achievements() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: overview } = trpc.student.overview.useQuery();

  if (!user) return null;

  const achievements = overview?.achievements ?? [];
  const streak = overview?.streak ?? { current: 0, best: 0 };
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("student.achievements")}</h1>
            <p className="text-slate-400 mt-1">{unlocked.length} / {achievements.length} {t("student.unlocked")}</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-2xl font-bold text-orange-400">{streak.current}</p>
              <p className="text-xs text-slate-400">{t("student.currentStreak")}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-2xl font-bold text-violet-400">{streak.best}</p>
              <p className="text-xs text-slate-400">{t("student.bestStreak")}</p>
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> {t("student.unlockedAchievements")}
          </h3>
          {unlocked.length === 0 ? (
            <p className="text-slate-400 text-center py-6">{t("student.noAchievementsYet")}</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {unlocked.map((a) => {
                const Icon = iconMap[a.icon] || Star;
                return (
                  <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/20">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{a.title}</h4>
                      <p className="text-sm text-slate-400 mt-0.5">{a.description}</p>
                      {a.unlockedAt && (
                        <p className="text-xs text-emerald-400 mt-2">
                          {t("student.unlockedOn")} {new Date(a.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {locked.length > 0 && (
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" /> {t("student.lockedAchievements")}
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {locked.map((a) => {
                const Icon = iconMap[a.icon] || Star;
                return (
                  <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-white/5 opacity-60">
                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-slate-300 font-semibold">{a.title}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{a.description}</p>
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
