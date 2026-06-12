import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Megaphone, Calendar, AlertTriangle, Info, CheckCircle2,
  Search, Bell, Clock, Inbox, X, SlidersHorizontal, Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const priorityConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge: string;
  label: string;
}> = {
  high: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "Important",
  },
  medium: {
    icon: Info,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Notice",
  },
  low: {
    icon: CheckCircle2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "General",
  },
};

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl hover:bg-white/[0.05] transition-colors ${accent}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-8 w-8 bg-white/10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 bg-white/10 rounded" />
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-2/3 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Announcements() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const { data: announcements = [], isLoading, error } = trpc.announcements.list.useQuery();

  if (!user) return null;

  const filtered = useMemo(() => {
    let result = [...announcements];
    if (priorityFilter) {
      result = result.filter((a: any) => a.priority === priorityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a: any) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.titleAr && a.titleAr.toLowerCase().includes(q)) ||
        (a.contentAr && a.contentAr.toLowerCase().includes(q))
      );
    }
    return result.sort((a: any, b: any) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [announcements, search, priorityFilter]);

  const total = announcements.length;
  const highCount = announcements.filter((a: any) => a.priority === "high").length;
  const now = new Date();
  const thisMonthCount = announcements.filter((a: any) => {
    const d = a.createdAt ? new Date(a.createdAt) : null;
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const latestDate = announcements.length > 0 && announcements[0]?.createdAt
    ? new Date(announcements[0].createdAt).toLocaleDateString()
    : "—";

  const stats = [
    { label: "Total", value: total, icon: Megaphone, accent: "border-s-2 border-s-blue-500/50" },
    { label: "Important", value: highCount, icon: AlertTriangle, accent: "border-s-2 border-s-red-500/50" },
    { label: "This Month", value: thisMonthCount, icon: Calendar, accent: "border-s-2 border-s-emerald-500/50" },
    { label: "Latest", value: latestDate, icon: Clock, accent: "border-s-2 border-s-violet-500/50" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8" dir={dir}>
        {/* Header */}
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Latest Updates
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t("student.announcements")}</h1>
            <p className="text-slate-400 mt-1.5 text-sm max-w-lg">
              Stay updated with important academic and university updates.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dir === "rtl" ? "البحث في الإعلانات..." : "Search announcements..."}
              className="ps-10 pe-10 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/30 rounded-xl h-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
            {["high", "medium", "low"].map((p) => {
              const active = priorityFilter === p;
              const cfg = priorityConfig[p];
              return (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(active ? null : p)}
                  className={`text-[11px] font-semibold px-3 py-2 rounded-xl border transition-all ${active ? `${cfg.badge} border-white/10` : "bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06] hover:text-slate-200"}`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div {...fadeInUp} className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-slate-300 font-medium">{t("common.error") || "Something went wrong"}</p>
            <p className="text-sm text-slate-500 mt-1">Failed to load announcements. Please try again later.</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-300 font-medium">
              {search || priorityFilter ? "No matching announcements" : "No announcements available yet"}
            </p>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {search || priorityFilter
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Important academic updates will appear here when they are published."}
            </p>
            {(search || priorityFilter) && (
              <button
                onClick={() => { setSearch(""); setPriorityFilter(null); }}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
            {filtered.map((a: any, i: number) => {
              const cfg = priorityConfig[a.priority ?? "medium"] || priorityConfig.medium;
              const Icon = cfg.icon;
              const title = dir === "rtl" && a.titleAr ? a.titleAr : a.title;
              const content = dir === "rtl" && a.contentAr ? a.contentAr : a.content;
              const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—";
              const isNew = a.createdAt && (new Date().getTime() - new Date(a.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group rounded-2xl border ${cfg.border} bg-white/[0.03] p-5 backdrop-blur-xl hover:bg-white/[0.05] transition-all`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border border-white/5`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{title}</h3>
                          {isNew && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${cfg.badge} uppercase tracking-wider`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {content}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
