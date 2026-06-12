import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Activity, TrendingUp, AlertTriangle, CheckCircle2, BrainCircuit,
  GraduationCap, BookOpen, Target, Lightbulb, Zap, ArrowRight, ShieldAlert,
  Calculator, Route, Briefcase, ChevronRight, Star, Sparkles,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const RISK_COLORS: Record<string, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#ef4444", critical: "#7f1d1d",
};
const STATUS_COLORS: Record<string, string> = {
  good: "#10b981", fair: "#f59e0b", poor: "#ef4444",
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const stroke = size / 8;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#334155" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

export default function AcademicAnalytics() {
  const { t } = useI18n();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [selectedStudentId] = useState(() =>
    user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) : 0
  );
  const studentIdParam = user?.role === "advisor" && selectedStudentId ? { studentId: selectedStudentId } : {};
  const { data: risk, isLoading: riskLoading } = trpc.analytics.graduationRisk.useQuery(studentIdParam);
  const { data: health, isLoading: healthLoading } = trpc.analytics.academicHealth.useQuery(studentIdParam);
  const { data: forecast, isLoading: forecastLoading } = trpc.analytics.successForecast.useQuery(studentIdParam);
  const { data: warnings, isLoading: warningsLoading } = trpc.analytics.earlyWarnings.useQuery(studentIdParam);
  const { data: roadmap, isLoading: roadmapLoading } = trpc.analytics.degreeRoadmap.useQuery(studentIdParam);
  const { data: planner } = trpc.analytics.semesterPlanner.useQuery(studentIdParam);
  const { data: career } = trpc.analytics.careerPaths.useQuery(studentIdParam);
  const { data: recommendations } = trpc.analytics.smartRecommendations.useQuery(studentIdParam);
  const { data: gpaSim } = trpc.analytics.gpaSimulator.useQuery({
    ...studentIdParam,
    scenarios: [
      { name: "All A's", nameAr: "كلها A", courseGrades: [{ courseId: 1, grade: "A", credits: 3 }, { courseId: 2, grade: "A", credits: 3 }, { courseId: 3, grade: "A", credits: 3 }] },
      { name: "Mixed B+/A-", nameAr: "B+/A- متنوع", courseGrades: [{ courseId: 1, grade: "B+", credits: 3 }, { courseId: 2, grade: "A-", credits: 3 }, { courseId: 3, grade: "B+", credits: 3 }] },
    ],
  });
  const seedMutation = trpc.student.seed.useMutation({
    onSuccess: () => {
      utils.analytics.graduationRisk.invalidate();
      utils.analytics.academicHealth.invalidate();
      utils.analytics.successForecast.invalidate();
      utils.analytics.earlyWarnings.invalidate();
      utils.analytics.degreeRoadmap.invalidate();
      utils.analytics.semesterPlanner.invalidate();
      utils.analytics.careerPaths.invalidate();
      utils.analytics.smartRecommendations.invalidate();
      utils.analytics.gpaSimulator.invalidate();
    },
  });

  const allLoaded = !riskLoading && !healthLoading && !roadmapLoading && !forecastLoading && !warningsLoading;
  const hasNoData = allLoaded && !risk?.score && !health?.overallScore && (!roadmap || roadmap.roadmap.length === 0);
  const seedKey = user ? `murshid-seeded-${user.id}` : "";

  useEffect(() => {
    if (user?.role === "advisor" && !selectedStudentId) return;
    if (hasNoData && !seedMutation.isPending && seedKey && !localStorage.getItem(seedKey)) {
      localStorage.setItem(seedKey, "true");
      seedMutation.mutate();
    }
  }, [hasNoData, seedMutation, seedKey, user?.role, selectedStudentId]);

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-violet-400" />
              Academic Analytics
            </h1>
            <p className="text-slate-400 mt-1">AI-powered insights, predictions, and recommendations</p>
          </div>
          {health && (
            <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-3">
              <ScoreRing score={health.overallScore} size={80} />
              <div>
                <p className="text-sm font-semibold text-white">Academic Health Score</p>
                <p className="text-xs text-slate-400">Trend: <span className={health.trend === "improving" ? "text-emerald-400" : health.trend === "declining" ? "text-red-400" : "text-amber-400"}>{health.trend}</span></p>
              </div>
            </div>
          )}
        </motion.div>

        {user?.role === "advisor" && !selectedStudentId && (
          <motion.div {...fadeInUp} className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <p className="text-amber-200 font-medium mb-2">Select a student first to view their analytics</p>
            <p className="text-amber-300/70 text-sm mb-4">Go to My Students, select a student, then return here.</p>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Risk & Warnings</TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Forecast & Planner</TabsTrigger>
            <TabsTrigger value="roadmap" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Roadmap & Career</TabsTrigger>
            <TabsTrigger value="simulator" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">GPA Simulator</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Graduation Risk</p>
                      <p className="text-2xl font-bold mt-1 capitalize" style={{ color: RISK_COLORS[risk?.overallRisk ?? "low"] }}>{risk?.overallRisk ?? "—"}</p>
                    </div>
                    <ShieldAlert className="w-8 h-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Est. Graduation</p>
                      <p className="text-2xl font-bold mt-1 text-white">Sem {risk?.predictedGraduationSemester ?? "—"}</p>
                    </div>
                    <GraduationCap className="w-8 h-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Degree Progress</p>
                      <p className="text-2xl font-bold mt-1 text-white">{roadmap ? Math.round((roadmap.completedCredits / roadmap.totalCredits) * 100) : 0}%</p>
                    </div>
                    <Target className="w-8 h-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Active Warnings</p>
                      <p className="text-2xl font-bold mt-1 text-white">{warnings?.warnings.length ?? 0}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-violet-400" />Health Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {health && health.categories.length > 0 ? (
                      <div className="space-y-3">
                        {health.categories.map((cat: any) => (
                          <div key={cat.id} className="flex items-center gap-3">
                            <div className="w-24 text-xs text-slate-400">{cat.label}</div>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.score}%`, backgroundColor: STATUS_COLORS[cat.status] }} />
                            </div>
                            <div className="w-8 text-end text-sm font-semibold" style={{ color: STATUS_COLORS[cat.status] }}>{cat.score}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {seedMutation.isPending ? (
                          <p className="text-slate-400">Generating demo data...</p>
                        ) : (
                          <>
                            <Activity className="w-10 h-10 text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400">No health data available yet</p>
                            <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-400" />Smart Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recommendations && recommendations.recommendations.length > 0 ? (
                      <div className="space-y-2 max-h-[280px] overflow-y-auto pe-1">
                        {recommendations.recommendations.slice(0, 5).map((rec: any) => (
                          <div key={rec.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{rec.name}</p>
                              <p className="text-xs text-slate-400">{rec.code} • {rec.credits} credits • {rec.reason}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 rtl:rotate-180" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {seedMutation.isPending ? (
                          <p className="text-slate-400">Generating demo data...</p>
                        ) : (
                          <>
                            <Lightbulb className="w-10 h-10 text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400">No recommendations yet</p>
                            <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {career && career.matches.length > 0 && (
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-400" />Top Career Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {career.matches.slice(0, 3).map((match: any) => (
                        <div key={match.id} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-emerald-500/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-white text-sm">{match.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${match.readinessLevel === "ready" ? "bg-emerald-500/15 text-emerald-400" : match.readinessLevel === "developing" ? "bg-amber-500/15 text-amber-400" : "bg-slate-500/15 text-slate-400"}`}>{match.readinessLevel}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{match.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Match: <span className="text-white font-semibold">{match.matchScore}%</span></span>
                            <span className="text-slate-500">{match.avgStartingSalary}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* RISK & WARNINGS */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-400" />Graduation Risk Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {risk && risk.score > 0 ? (
                      <>
                        <div className="flex items-center gap-6">
                          <ScoreRing score={risk.score} size={140} />
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-slate-400">Overall Risk Level</p>
                            <p className="text-3xl font-bold capitalize" style={{ color: RISK_COLORS[risk.overallRisk] }}>{risk.overallRisk}</p>
                            <p className="text-xs text-slate-500">Predicted graduation: Semester {risk.predictedGraduationSemester} ({risk.estimatedCompletionDate})</p>
                          </div>
                        </div>
                        {risk.factors.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Risk Factors</p>
                            {risk.factors.map((f: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: RISK_COLORS[f.severity] }} />
                                <div className="flex-1">
                                  <p className="text-sm text-white">{f.label}</p>
                                  <p className="text-xs text-slate-400">{f.labelAr}</p>
                                </div>
                                <span className="text-xs font-mono" style={{ color: RISK_COLORS[f.severity] }}>{f.value} (-{f.impact})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {seedMutation.isPending ? (
                          <p className="text-slate-400">Generating demo data...</p>
                        ) : (
                          <>
                            <ShieldAlert className="w-10 h-10 text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400">No risk data available yet</p>
                            <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" />Early Warning System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {warnings && warnings.warnings.length > 0 ? (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pe-1">
                        {warnings.warnings.filter((w: any, index: number, self: any[]) =>
                          index === self.findIndex((x: any) => x.id === w.id)
                        ).map((w: any) => (
                          <div key={w.id} className={`p-3 rounded-lg border ${w.severity === "critical" ? "bg-red-500/10 border-red-500/30" : w.severity === "high" ? "bg-orange-500/10 border-orange-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-white">{w.title}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${w.severity === "critical" ? "bg-red-500/20 text-red-400" : w.severity === "high" ? "bg-orange-500/20 text-orange-400" : "bg-amber-500/20 text-amber-400"}`}>{w.severity}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{w.message}</p>
                            {w.actionable && (
                              <Button variant="outline" size="sm" className="h-7 text-xs border-slate-600 text-slate-300 hover:bg-slate-700">{w.actionText}</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                        <p className="text-lg font-semibold text-white">All Clear!</p>
                        <p className="text-sm text-slate-400">No early warnings detected.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* FORECAST & PLANNER */}
          <TabsContent value="forecast" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400" />AI Success Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {forecast && forecast.history.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Trend: <span className={forecast.overallProjection?.trendDirection === "improving" ? "text-emerald-400" : forecast.overallProjection?.trendDirection === "declining" ? "text-red-400" : "text-amber-400"}>{forecast.overallProjection?.trendDirection}</span></span>
                          <span className="text-slate-400">Confidence: <span className="text-white">{forecast.overallProjection?.confidenceLevel}</span></span>
                        </div>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...forecast.history, ...forecast.semesterForecasts.map((f: any) => ({ semester: f.semester, gpa: f.projectedGPA }))]}>
                              <defs><linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="semester" stroke="#94a3b8" fontSize={12} />
                              <YAxis domain={[0, 4]} stroke="#94a3b8" fontSize={12} />
                              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                              <Area type="monotone" dataKey="gpa" stroke="#8b5cf6" strokeWidth={2} fill="url(#gpaGrad)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {forecast.semesterForecasts.map((f: any) => (
                            <div key={f.semester} className="p-2 bg-slate-700/30 rounded-lg text-center">
                              <p className="text-xs text-slate-400">Sem {f.semester}</p>
                              <p className="text-lg font-bold text-white">{f.projectedGPA}</p>
                              <p className="text-[10px] text-slate-500">{f.confidence} confidence</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {seedMutation.isPending ? (
                          <p className="text-slate-400">Generating demo data...</p>
                        ) : (
                          <>
                            <TrendingUp className="w-10 h-10 text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400">Complete more courses to see forecast data</p>
                            <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" />AI Semester Planner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {planner && planner.plan && planner.plan.courses.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Recommended Load</p>
                            <p className="text-2xl font-bold text-white">{planner.totalCredits} credits</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${planner.estimatedWorkload === "heavy" ? "bg-red-500/15 text-red-400" : planner.estimatedWorkload === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>{planner.estimatedWorkload}</span>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pe-1">
                          {planner.plan.courses.map((c: any) => (
                            <div key={c.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                              <div className={`w-2 h-2 rounded-full ${c.isRequired ? "bg-violet-400" : "bg-slate-400"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{c.name}</p>
                                <p className="text-xs text-slate-400">{c.code} &bull; {c.credits} cr</p>
                              </div>
                              <span className="text-[10px] text-slate-500 shrink-0">{c.reason}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p className="text-xs text-amber-300">{planner.recommendations[0]}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {seedMutation.isPending ? (
                          <p className="text-slate-400">Generating demo data...</p>
                        ) : (
                          <>
                            <Zap className="w-10 h-10 text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400">No planner data available yet</p>
                            <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ROADMAP & CAREER */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Route className="w-5 h-5 text-emerald-400" />Degree Roadmap</CardTitle>
                    <CardDescription>{roadmap?.completedCredits ?? 0} / {roadmap?.totalCredits ?? 132} credits completed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {roadmap && roadmap.roadmap.length > 0 ? (
                      <div className="space-y-1 max-h-[450px] overflow-y-auto pe-1">
                        {Array.from(new Set(roadmap.roadmap.map((c: any) => c.semester))).sort((a, b) => a - b).map((sem: number) => (
                          <div key={sem} className="mb-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Semester {sem}</p>
                            <div className="space-y-1">
                              {roadmap.roadmap.filter((c: any) => c.semester === sem).map((c: any) => (
                                <div key={c.id} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${c.status === "completed" ? "bg-emerald-500/10 border border-emerald-500/20" : c.status === "in_progress" ? "bg-blue-500/10 border border-blue-500/20" : "bg-slate-700/30 border border-slate-600/20"}`}>
                                  <div className={`w-2 h-2 rounded-full ${c.status === "completed" ? "bg-emerald-400" : c.status === "in_progress" ? "bg-blue-400" : "bg-slate-500"}`} />
                                  <span className="flex-1 text-white truncate">{c.code} &mdash; {c.name}</span>
                                  <span className="text-xs text-slate-400">{c.credits}cr</span>
                                  {c.status === "completed" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {seedMutation.isPending ? (
                          <p className="text-slate-400">Generating demo data...</p>
                        ) : (
                          <>
                            <Route className="w-10 h-10 text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400">No roadmap data available yet</p>
                            <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-400" />AI Career Path Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {career && career.matches.length > 0 ? (
                      <div className="space-y-3">
                        {career.matches.map((match: any) => (
                          <div key={match.id} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-blue-500/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-white">{match.title}</p>
                                <p className="text-xs text-slate-400">{match.titleAr}</p>
                              </div>
                              <div className="text-end">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${match.readinessLevel === "ready" ? "bg-emerald-500/15 text-emerald-400" : match.readinessLevel === "developing" ? "bg-amber-500/15 text-amber-400" : "bg-slate-500/15 text-slate-400"}`}>{match.readinessLevel}</span>
                                <p className="text-lg font-bold text-white mt-1">{match.matchScore}%</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">{match.description}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <Star className="w-3 h-3 text-amber-400" />
                                <span className="text-slate-400">Skills matched: <span className="text-white">{match.matchedSkills}/{match.requiredSkills.length}</span></span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <BookOpen className="w-3 h-3 text-blue-400" />
                                <span className="text-slate-400">Courses matched: <span className="text-white">{match.matchedCourses}/{match.recommendedCourses.length}</span></span>
                              </div>
                              {match.missingCourses.length > 0 && (
                                <div className="flex items-start gap-2 text-xs">
                                  <ArrowRight className="w-3 h-3 text-violet-400 mt-0.5 rtl:rotate-180" />
                                  <span className="text-slate-400">Recommended next: <span className="text-violet-300">{match.missingCourses.slice(0, 3).join(", ")}</span></span>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-600/30 flex items-center justify-between text-xs">
                              <span className="text-slate-500">Starting: {match.avgStartingSalary}</span>
                              <span className="text-slate-500">Growth: {match.growthOutlook}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {seedMutation.isPending ? (
                          <p className="text-slate-400">Generating demo data...</p>
                        ) : (
                          <>
                            <Briefcase className="w-10 h-10 text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400">Complete more courses to see career matches</p>
                            <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* GPA SIMULATOR */}
          <TabsContent value="simulator" className="space-y-6">
            <motion.div {...fadeInUp}>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Calculator className="w-5 h-5 text-amber-400" />What-If GPA Simulator</CardTitle>
                  <CardDescription>Simulate your GPA based on hypothetical grade outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  {gpaSim && gpaSim.scenarios.length > 0 ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Current GPA</p>
                        <p className="text-3xl font-bold text-white">{gpaSim.currentGPA}</p>
                        <p className="text-xs text-slate-400">{gpaSim.currentEarnedCredits} earned credits</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gpaSim.scenarios.map((s: any) => (
                          <div key={s.name} className={`p-4 rounded-xl border ${s.gpaChange >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                            <p className="text-sm font-semibold text-white">{s.name}</p>
                            <p className="text-xs text-slate-400">{s.nameAr}</p>
                            <div className="mt-3 flex items-baseline gap-2">
                              <p className="text-2xl font-bold text-white">{s.projectedGPA}</p>
                              <span className={`text-sm font-semibold ${s.gpaChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>{s.gpaChange >= 0 ? "+" : ""}{s.gpaChange}</span>
                            </div>
                            <p className="text-xs text-slate-400">{s.projectedEarnedCredits} total credits</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      {seedMutation.isPending ? (
                        <p className="text-slate-400">Generating demo data...</p>
                      ) : (
                        <>
                          <Calculator className="w-10 h-10 text-slate-600 mb-2" />
                          <p className="text-sm text-slate-400">No simulator data available yet</p>
                          <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => seedMutation.mutate()}><Sparkles className="w-3 h-3 me-1" /> Generate Demo Data</Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
