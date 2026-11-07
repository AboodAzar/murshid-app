import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp, PieChart as PieIcon, Clock, Sparkles } from "lucide-react";

interface StudyPlanWorkloadGraphProps {
  language?: "en" | "ar";
}

const COURSE_HOURS_DATA = [
  { course: "CS201", name: "Data Structures", hours: 7.0, color: "#10b981", target: "AVL Trees & BST" },
  { course: "PHYS102", name: "Physics II", hours: 6.0, color: "#8b5cf6", target: "Gauss Law & Circuits" },
  { course: "MATH102", name: "Calculus II", hours: 6.0, color: "#f59e0b", target: "GPA Recovery Retake" },
  { course: "CS202", name: "OOP Java/C++", hours: 5.0, color: "#3b82f6", target: "UML & Design Patterns" },
  { course: "ENG102", name: "Tech Writing", hours: 3.0, color: "#06b6d4", target: "Engineering Reports" },
];

const DOMAIN_DATA = [
  { name: "Computing & Algorithms", nameAr: "الحوسبة والخوارزميات", value: 12, percent: 44, color: "#10b981" },
  { name: "Math & Physics Core", nameAr: "الرياضيات والفيزياء", value: 12, percent: 44, color: "#8b5cf6" },
  { name: "Professional Writing", nameAr: "الكتابة المهنية", value: 3, percent: 12, color: "#06b6d4" },
];

const DAILY_FREE_TIME_CURVE = [
  { day: "Sun", dayAr: "الأحد", deepWork: 50, breakTime: 10, practice: 60, total: 120 },
  { day: "Mon", dayAr: "الإثنين", deepWork: 50, breakTime: 10, practice: 60, total: 120 },
  { day: "Tue", dayAr: "الثلاثاء", deepWork: 50, breakTime: 10, practice: 60, total: 120 },
  { day: "Wed", dayAr: "الأربعاء", deepWork: 50, breakTime: 10, practice: 60, total: 120 },
  { day: "Thu", dayAr: "الخميس", deepWork: 50, breakTime: 10, practice: 60, total: 120 },
];

export function StudyPlanWorkloadGraph({ language = "en" }: StudyPlanWorkloadGraphProps) {
  const isAr = language === "ar";

  return (
    <Card className="bg-card border-border backdrop-blur-2xl shadow-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
                <span>{isAr ? "الرسوم البيانية للخطة الدراسية وتوزيع الساعات" : "Study Plan Workload & Balance Graphs"}</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                  {isAr ? "تحليل مرئي ذكي" : "Visual Analytics"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "تجسيد بياني لساعات المذاكرة الأسبوعية وتوزيع الجهد الدراسي ومعدل استغلال وقت الفراغ (9 - 11 PM)"
                  : "Graphical visualization of dedicated study hours, subject domain balance, and evening 9 PM - 11 PM focus."}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-border text-center">
              <span className="text-[10px] text-muted-foreground uppercase block">{isAr ? "إجمالي الأسبوع" : "Weekly Total"}</span>
              <span className="text-sm font-bold text-emerald-400">27.0 hrs</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-border text-center">
              <span className="text-[10px] text-muted-foreground uppercase block">{isAr ? "كفاءة التوازن" : "Balance Score"}</span>
              <span className="text-sm font-bold text-primary">94 / 100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Top 2 Graphs Grid: Bar Chart + Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Bar Chart: Hours per course */}
          <div className="lg:col-span-2 space-y-2 p-4 rounded-xl bg-white/[0.02] border border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? "ساعات المذاكرة المخصصة لكل مادة أسبوعياً" : "Weekly Dedicated Study Hours by Registered Course"}</span>
              </h4>
              <span className="text-[10px] text-muted-foreground">{isAr ? "الأولويات المحددة" : "Weighted by credits & assignments"}</span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COURSE_HOURS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="course" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="h" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                            <p className="font-bold text-white">{data.course}: {data.name}</p>
                            <p className="text-emerald-400 font-semibold">{data.hours} hours / week</p>
                            <p className="text-[10px] text-slate-300">Target: {data.target}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {COURSE_HOURS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-border/50 text-[10px]">
              {COURSE_HOURS_DATA.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-300 font-semibold truncate">{c.course}: {c.hours}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Donut Chart: Subject Domain Balance */}
          <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-violet-400" />
                  <span>{isAr ? "توازن المجالات المعرفية" : "Subject Domain Balance"}</span>
                </h4>
              </div>

              <div className="h-44 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DOMAIN_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {DOMAIN_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs">
                              <p className="font-bold text-white">{isAr ? data.nameAr : data.name}</p>
                              <p className="text-slate-300">{data.value}h ({data.percent}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-white">100%</span>
                  <span className="text-[9px] text-muted-foreground uppercase">{isAr ? "متوازن" : "Balanced"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px]">
              {DOMAIN_DATA.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-300 text-[11px]">{isAr ? d.nameAr : d.name}</span>
                  </div>
                  <span className="font-mono text-white font-semibold">{d.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Daily Free-Time Evening Block Utilization Graph (9 PM - 11 PM) */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{isAr ? "منحنى استغلال وقت الفراغ اليومي (9:00 - 11:00 PM)" : "Daily Evening Free-Time Study Allocation (9 PM - 11 PM)"}</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? "توزيع 120 دقيقة كل ليلة: 50 دقيقة تركيز عميق + 10 دقائق استرجاع نشط + 60 دقيقة حل مسائل"
                  : "120-minute daily evening breakdown: 50m Deep Work + 10m Active Recall + 60m Problem Drill."}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] bg-amber-500/15 border-amber-500/30 text-amber-300 self-start sm:self-auto font-mono">
              10.0h / week dedicated
            </Badge>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_FREE_TIME_CURVE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPractice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorDeep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey={isAr ? "dayAr" : "day"} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{isAr ? data.dayAr : data.day} (9:00 - 11:00 PM)</p>
                          <p className="text-blue-400">Deep Work: {data.deepWork} min</p>
                          <p className="text-amber-400">Active Recall Break: {data.breakTime} min</p>
                          <p className="text-emerald-400">Problem Practice: {data.practice} min</p>
                          <p className="font-bold text-white border-t border-slate-700 pt-1">Total: {data.total} min</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="practice" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorPractice)" name="Practice" />
                <Area type="monotone" dataKey="deepWork" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDeep)" name="Deep Work" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
