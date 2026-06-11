import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Users, AlertTriangle, CalendarDays, TrendingUp, Activity,
  BookOpen, Award, ChevronRight, GraduationCap, Clock, FileText,
  MessageSquare, Plus, ArrowRight, Bell, BrainCircuit, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const severityColors: Record<string, string> = {
  low: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
};

const riskColors: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-400",
  medium: "bg-amber-500/15 text-amber-400",
  high: "bg-red-500/15 text-red-400",
};

export default function AdvisorDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: insights, isLoading: insightsLoading } = trpc.advisor.getInsights.useQuery();
  const { data: students = [], isLoading: studentsLoading } = trpc.advisor.getAssignedStudents.useQuery();
  const { data: appointments = [] } = trpc.advisor.getAppointments.useQuery();
  const { data: alerts = [] } = trpc.advisor.getAlerts.useQuery({});
  const { data: advisorAnalytics } = trpc.analytics.advisorInsights.useQuery({});

  if (!user) return null;

  const atRiskStudents = students.filter((s: any) => s.riskLevel === "high" || s.riskLevel === "medium");
  const upcomingAppts = appointments
    .filter((a: any) => new Date(a.scheduledAt) > new Date() && a.status !== "cancelled")
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);
  const recentAlerts = alerts
    .filter((alert: any, index: number, self: any[]) =>
      index === self.findIndex((a: any) => a.title === alert.title)
    )
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("advisor.dashboard")}</h1>
            <p className="text-slate-400 mt-1">{t("advisor.overview")}</p>
          </div>
          <Button
            onClick={() => setLocation("/advisor/students")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            {t("advisor.myStudents")}
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("advisor.totalStudents"), value: insights?.totalStudents ?? 0, icon: Users, color: "from-blue-500 to-cyan-500" },
            { label: t("advisor.atRiskStudents"), value: insights?.atRiskCount ?? 0, icon: AlertTriangle, color: "from-orange-500 to-red-500" },
            { label: t("advisor.upcomingAppointments"), value: insights?.upcomingAppointments ?? 0, icon: CalendarDays, color: "from-violet-500 to-purple-500" },
            { label: t("advisor.activeAlerts"), value: insights?.activeAlerts ?? 0, icon: Bell, color: "from-rose-500 to-pink-500" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Advisor Insights */}
        {advisorAnalytics && (
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-violet-400" />
                AI Advisor Insights
              </h2>
              <button onClick={() => setLocation("/analytics")} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View Full Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Cohort Analysis */}
              <div className="lg:col-span-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Cohort Performance by Semester</p>
                <div className="space-y-2">
                  {advisorAnalytics.cohortAnalysis.map((c: any) => (
                    <div key={c.semester} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-20">Semester {c.semester}</span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-400" style={{ width: `${Math.min(100, (parseFloat(c.averageGpa) / 4) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-white w-10 text-right">{c.averageGpa}</span>
                      <span className="text-[10px] text-slate-500 w-12 text-right">{c.studentCount} students</span>
                    </div>
                  ))}
                  {advisorAnalytics.cohortAnalysis.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No cohort data available yet</p>
                  )}
                </div>
              </div>
              {/* Common Issues */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Common Issues</p>
                <div className="space-y-2">
                  {advisorAnalytics.commonIssues.map((issue: any) => (
                    <div key={issue.issue} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04]">
                      <span className="text-xs text-white capitalize">{issue.issue.replace("_", " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${issue.percentage}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{issue.count}</span>
                      </div>
                    </div>
                  ))}
                  {advisorAnalytics.commonIssues.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No issues reported</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Averages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{t("advisor.averageGpa")}</p>
                <p className="text-2xl font-bold text-white">{insights?.averageGpa ?? "0.00"}</p>
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{t("advisor.averageAttendance")}</p>
                <p className="text-2xl font-bold text-white">{insights?.averageAttendance ?? 0}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* At-Risk Students */}
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                {t("advisor.atRiskStudents")}
              </h2>
              <button onClick={() => setLocation("/advisor/students")} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                {t("common.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {studentsLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />)}</div>
            ) : atRiskStudents.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-400">{t("advisor.noAtRiskStudents")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {atRiskStudents.slice(0, 5).map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] cursor-pointer transition-colors"
                    onClick={() => { localStorage.setItem("advisorSelectedStudentId", String(student.id)); setLocation("/advisor/student-profile"); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{student.name || student.email}</p>
                        <p className="text-xs text-slate-400">GPA {student.gpa} • Attendance {student.attendanceRate}%</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${riskColors[student.riskLevel]}`}>
                      {student.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-violet-400" />
                {t("advisor.upcomingAppointments")}
              </h2>
              <button onClick={() => setLocation("/advisor/appointments")} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                {t("common.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {upcomingAppts.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">{t("advisor.noUpcomingAppointments")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.map((appt: any) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{appt.title}</p>
                      <p className="text-xs text-slate-400">{new Date(appt.scheduledAt).toLocaleString()}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{appt.durationMinutes}m</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <motion.div {...fadeInUp} className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-400" />
                {t("advisor.recentAlerts")}
              </h2>
            </div>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">{t("advisor.noRecentAlerts")}</p>
              </div>
            ) : (
              <ScrollArea className="h-[320px]">
                <div className="space-y-3 pr-2">
                  {recentAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04]">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${severityColors[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{alert.title}</p>
                        <p className="text-xs text-slate-400 truncate">{alert.message}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">{t("advisor.quickActions")}</h2>
            <div className="space-y-3">
              {[
                { label: t("advisor.createAlert"), icon: Bell, path: "/advisor/students", color: "text-rose-400 bg-rose-500/15" },
                { label: t("advisor.scheduleAppointment"), icon: CalendarDays, path: "/advisor/appointments", color: "text-violet-400 bg-violet-500/15" },
                { label: t("advisor.addNote"), icon: FileText, path: "/advisor/notes", color: "text-amber-400 bg-amber-500/15" },
                { label: t("advisor.createRecommendation"), icon: BookOpen, path: "/advisor/recommendations", color: "text-emerald-400 bg-emerald-500/15" },
                { label: t("advisor.reviewConversations"), icon: MessageSquare, path: "/advisor/ai-review", color: "text-blue-400 bg-blue-500/15" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => setLocation(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white">{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
