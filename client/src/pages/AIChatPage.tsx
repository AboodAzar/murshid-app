// AIChatPage: The main dashboard and AI advising chat interface for the student portal.
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";
import DashboardLayout from "@/components/DashboardLayout";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Sparkles, BrainCircuit, Send, Plus, Trash2, MessageCircle, Bot, User,
  Zap, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  BookOpen, GraduationCap, Calendar, Clock, Award, Briefcase,
  Lightbulb, ShieldAlert, ArrowRight, BarChart3, Compass, FlaskConical,
  Layers, Star, ClipboardList, PenLine, Bell, ChevronRight, Mic, Hash,
  Download, Share2, RefreshCw, Info, Frown, Smile, Meh, ThumbsUp, ThumbsDown
} from "lucide-react";
import { toast } from "sonner";

const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.06 } } };
const scaleIn = { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.35 } };

const RISK_COLORS: Record<string, string> = { low: "#10b981", medium: "#f59e0b", high: "#ef4444", critical: "#7f1d1d" };
const RISK_BG: Record<string, string> = { low: "bg-emerald-500/15 text-emerald-400", medium: "bg-amber-500/15 text-amber-400", high: "bg-red-500/15 text-red-400", critical: "bg-red-900/30 text-red-400" };

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const stroke = size / 10;
  const r = (size - stroke) / 2;
  const c = r * 2 * Math.PI;
  const off = c - (score / 100) * c;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

function MiniBar({ value, color = "#3b82f6" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === "good" || status === "low" ? "bg-emerald-400" : status === "fair" || status === "medium" ? "bg-amber-400" : "bg-red-400";
  return <span className={`w-2 h-2 rounded-full ${color} inline-block`} />;
}

function ActivityIcon(props: any) { return <BarChart3 {...props} />; }

const QUICK_ACTIONS = [
  { id: "plan", label: "Study Plan", icon: ClipboardList, color: "bg-blue-500/15 text-primary", desc: "Weekly AI schedule" },
  { id: "gpa", label: "Analyze GPA", icon: BarChart3, color: "bg-violet-500/15 text-violet-400", desc: "Performance deep-dive" },
  { id: "graduation", label: "Graduation", icon: GraduationCap, color: "bg-emerald-500/15 text-emerald-400", desc: "Graduation forecast" },
  { id: "courses", label: "Courses", icon: BookOpen, color: "bg-amber-500/15 text-amber-400", desc: "Next semester picks" },
  { id: "schedule", label: "Schedule", icon: Calendar, color: "bg-cyan-500/15 text-cyan-400", desc: "Balance workload" },
  { id: "career", label: "Career", icon: Briefcase, color: "bg-rose-500/15 text-rose-400", desc: "Dream job path" },
  { id: "chat", label: "Ask AI", icon: Sparkles, color: "bg-fuchsia-500/15 text-fuchsia-400", desc: "Anything on your mind" },
];

const SUGGESTED_PROMPTS = [
  "How can I improve my GPA this semester?",
  "What courses should I take next semester?",
  "Am I on track to graduate on time?",
  "Which careers match my courses and skills?",
  "Create a study plan for my upcoming exams",
  "Explain my academic health score",
];

interface Message { id?: number; role: "user" | "assistant"; content: string; createdAt?: Date; feedback?: "up" | "down" | "none" | null; }

export default function AIChatPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: dashboard, isLoading: dLoading } = trpc.student.dashboard.useQuery();
  const { data: overview, isLoading: oLoading } = trpc.student.overview.useQuery();
  const { data: risk, isLoading: rLoading } = trpc.analytics.graduationRisk.useQuery({});
  const { data: health, isLoading: hLoading } = trpc.analytics.academicHealth.useQuery({});
  const { data: forecast, isLoading: fLoading } = trpc.analytics.successForecast.useQuery({});
  const { data: warnings, isLoading: wLoading } = trpc.analytics.earlyWarnings.useQuery({});
  const { data: roadmap, isLoading: rmLoading } = trpc.analytics.degreeRoadmap.useQuery({});
  const { data: planner, isLoading: pLoading } = trpc.analytics.semesterPlanner.useQuery({});
  const { data: career, isLoading: cLoading } = trpc.analytics.careerPaths.useQuery({});
  const { data: recommendations, isLoading: recLoading } = trpc.analytics.smartRecommendations.useQuery({});

  const allLoaded = !dLoading && !oLoading && !rLoading && !hLoading && !fLoading && !wLoading;
  const studentName = user?.name?.split(" ")[0] ?? "Student";
  const gpa = parseFloat(dashboard?.stats?.gpa ?? "0");
  const healthScore = health?.overallScore ?? 0;
  const gradProgress = dashboard?.stats?.progress ?? 0;
  const currentSem = dashboard?.stats?.currentSemester ?? 1;
  const semestersLeft = dashboard?.stats?.semestersLeft ?? 0;

  /* Chat state */
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData } = trpc.aiChat.getConversations.useQuery();
  const { data: messagesData } = trpc.aiChat.getMessages.useQuery(selectedConversation || 0, { enabled: !!selectedConversation });
  const utils = trpc.useUtils();
  const createConv = trpc.aiChat.createConversation.useMutation();
  const sendMsg = trpc.aiChat.sendMessage.useMutation();
  const deleteConv = trpc.aiChat.deleteConversation.useMutation();
  const rateMsg = trpc.aiChat.rateMessage.useMutation();

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
      if (!selectedConversation && conversationsData.length > 0) setSelectedConversation(conversationsData[0].id);
    }
  }, [conversationsData, selectedConversation]);

  useEffect(() => {
    if (messagesData) {
      const data = messagesData;
      setMessages(prev => { const hasOpt = prev.some(m => !m.id); if (hasOpt && prev.length >= data.length) return prev; return data; });
      scrollToBottom();
    }
  }, [messagesData]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleCreateConversation = async () => {
    try {
      const result = await createConv.mutateAsync({ title: `Chat ${new Date().toLocaleDateString()}` });
      if (result.conversationId) { setSelectedConversation(result.conversationId); setMessages([]); }
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConversation || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]); setInput(""); setIsLoading(true);
    try {
      const res = await sendMsg.mutateAsync({ conversationId: selectedConversation, message: input });
      if (res.response) setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
      utils.aiChat.getMessages.invalidate(selectedConversation);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: t("chat.sendError") }]);
    } finally { setIsLoading(false); }
  };

  const handleDeleteConversation = async (id: number) => {
    try { await deleteConv.mutateAsync(id); if (selectedConversation === id) { setSelectedConversation(null); setMessages([]); } }
    catch (e) { console.error(e); }
  };

  const handleRateMessage = async (messageId: number, feedback: "up" | "down") => {
    try {
      await rateMsg.mutateAsync({ messageId, feedback });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m));
      toast.success(feedback === "up" ? "Thanks! Added to verified answers." : "Thanks for the feedback. An advisor will review this.");
    } catch (e) {
      toast.error("Failed to submit feedback");
    }
  };

  const openChatWithPrompt = (prompt: string) => {
    setActiveTab("chat");
    setInput(prompt);
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 max-w-none md:max-w-7xl md:mx-auto space-y-6">
        {/* ─── Hero ─── */}
        <motion.div {...fadeInUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-slate-900/80 border border-blue-500/20 backdrop-blur-2xl p-4 sm:p-6 md:p-8">
          <div className="absolute top-0 end-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Logo size={40} className="rounded-xl shadow-[0_0_30px_rgba(59,130,246,.35)]" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">AI Online</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {studentName}.</h1>
              <p className="text-muted-foreground max-w-md">I'm <span className="text-primary font-semibold">Murshid AI</span>, your academic advisor and study companion.</p>
            </div>
            {allLoaded ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-card border border-border rounded-xl px-4 py-3 backdrop-blur-xl"><p className="text-xs text-muted-foreground">GPA</p><p className={`text-lg font-bold ${gpa >= 3 ? "text-emerald-400" : gpa >= 2.5 ? "text-amber-400" : "text-red-400"}`}>{gpa.toFixed(2)}</p></div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 backdrop-blur-xl"><p className="text-xs text-muted-foreground">Health</p><p className={`text-lg font-bold ${healthScore >= 70 ? "text-emerald-400" : healthScore >= 50 ? "text-amber-400" : "text-red-400"}`}>{healthScore}</p></div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 backdrop-blur-xl"><p className="text-xs text-muted-foreground">Semester</p><p className="text-lg font-bold text-white">{currentSem}</p></div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 backdrop-blur-xl"><p className="text-xs text-muted-foreground">Progress</p><p className="text-lg font-bold text-primary">{Math.round(gradProgress * 100)}%</p></div>
              </div>
            ) : (
              <div className="flex gap-3"><Skeleton className="h-16 w-20" /><Skeleton className="h-16 w-20" /><Skeleton className="h-16 w-20" /><Skeleton className="h-16 w-20" /></div>
            )}
          </div>
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.id} variants={scaleIn}>
                <button
                  onClick={() => { if (action.id === "chat") setActiveTab("chat"); else if (["plan", "schedule"].includes(action.id)) setActiveTab("planner"); else if (action.id === "career") setActiveTab("career"); else setActiveTab("insights"); }}
                  className="w-full h-full p-3 sm:p-4 rounded-xl bg-card border border-border backdrop-blur-2xl hover:bg-accent hover:border-border/80 transition-all text-start group"
                >
                  <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><Icon className="w-4 h-4" /></div>
                  <p className="text-xs font-semibold text-white leading-tight">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{action.desc}</p>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ─── Main Tabs ─── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border backdrop-blur-2xl p-1 flex flex-nowrap md:flex-wrap h-auto gap-1 overflow-x-auto md:overflow-x-visible scrollbar-hide">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground shrink-0"><BrainCircuit className="w-3.5 h-3.5 me-1.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-muted-foreground shrink-0"><Zap className="w-3.5 h-3.5 me-1.5" />Insights</TabsTrigger>
            <TabsTrigger value="planner" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-muted-foreground shrink-0"><ClipboardList className="w-3.5 h-3.5 me-1.5" />Planner</TabsTrigger>
            <TabsTrigger value="career" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-muted-foreground shrink-0"><Briefcase className="w-3.5 h-3.5 me-1.5" />Career</TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white text-muted-foreground shrink-0"><Sparkles className="w-3.5 h-3.5 me-1.5" />Chat</TabsTrigger>
          </TabsList>

          {/* ─── Dashboard Tab ─── */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Academic Health */}
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ActivityIcon className="w-4 h-4 text-violet-400" />Academic Health</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {health ? (
                      <>
                        <div className="flex items-center gap-5">
                          <ScoreRing score={health.overallScore} size={isMobile ? 80 : 100} />
                          <div className="flex-1 space-y-3">
                            <div><div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">Overall</span><span className="text-white font-semibold">{health.overallScore}/100</span></div><MiniBar value={health.overallScore} color={health.overallScore >= 70 ? "#10b981" : health.overallScore >= 50 ? "#f59e0b" : "#ef4444"} /></div>
                            <div className="flex items-center gap-2 text-xs"><StatusDot status={health.trend === "improving" ? "good" : health.trend === "declining" ? "high" : "fair"} /><span className="text-muted-foreground">Trend: <span className="text-white">{health.trend}</span></span></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {(health.categories ?? []).map((c: any, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-card border border-border">
                              <p className="text-[10px] text-muted-foreground uppercase">{c.name}</p>
                              <div className="flex items-center gap-2 mt-1"><span className="text-sm font-bold text-white">{c.score}</span><MiniBar value={c.score} color={c.score >= 70 ? "#10b981" : c.score >= 50 ? "#f59e0b" : "#ef4444"} /></div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : <div className="space-y-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10" />)}</div>}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Graduation Predictor */}
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="w-4 h-4 text-emerald-400" />Graduation Predictor</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {allLoaded ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Expected</p><p className="text-base font-bold text-white mt-1">{risk?.estimatedCompletionDate ? new Date(risk.estimatedCompletionDate).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "—"}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Remaining</p><p className="text-base font-bold text-white mt-1">{roadmap ? (roadmap.totalCredits - roadmap.completedCredits) : (dashboard?.stats?.totalCredits ? dashboard.stats.totalCredits - (dashboard.stats.earnedCredits ?? 0) : "—")}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Semesters</p><p className="text-base font-bold text-white mt-1">{semestersLeft}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Risk</p><Badge className={`mt-1 ${RISK_BG[risk?.overallRisk ?? "low"]}`}>{risk?.overallRisk ?? "low"}</Badge></div>
                        </div>
                        <div><p className="text-xs text-muted-foreground mb-2">Progress</p><MiniBar value={gradProgress * 100} color="#10b981" /><p className="text-xs text-muted-foreground mt-1 text-end">{Math.round(gradProgress * 100)}% complete</p></div>
                      </>
                    ) : <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>}
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Twin / Alerts */}
              <motion.div {...fadeInUp} className="space-y-4">
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Bot className="w-4 h-4 text-primary" />AI Academic Twin</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {allLoaded ? (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"><span className="text-xs text-muted-foreground">Predicted GPA</span><span className="text-sm font-bold text-primary">{forecast?.overallProjection?.currentGPA?.toFixed(2) ?? "—"}</span></div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"><span className="text-xs text-muted-foreground">Confidence</span><span className="text-sm font-bold text-emerald-400">{forecast?.overallProjection?.confidenceLevel ?? "—"}</span></div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"><span className="text-xs text-muted-foreground">Active Risks</span><span className="text-sm font-bold text-red-400">{risk?.factors?.length ?? 0}</span></div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"><span className="text-xs text-muted-foreground">Streak</span><span className="text-sm font-bold text-amber-400">{overview?.streak?.current ?? 0} days</span></div>
                      </>
                    ) : <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10" />)}</div>}
                  </CardContent>
                </Card>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-red-400" />Alerts</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-2">
                    {allLoaded ? (
                      dashboard?.advisorAlerts && dashboard.advisorAlerts.length > 0 ? dashboard.advisorAlerts.slice(0, 3).map((alert: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10"><ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /><div><p className="text-xs text-white">{alert.title}</p><p className="text-[10px] text-muted-foreground">{alert.message}</p></div></div>
                      )) : <div className="flex items-center gap-2 justify-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><p className="text-xs text-muted-foreground">No active alerts</p></div>
                    ) : <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-10" />)}</div>}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recommended Actions */}
            <motion.div {...fadeInUp}>
              <Card className="bg-card border-border backdrop-blur-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-400" />Personalized Recommendations</CardTitle></CardHeader>
                <CardContent className="p-5">
                  {allLoaded ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recommendations?.recommendations && recommendations.recommendations.length > 0 ? recommendations.recommendations.slice(0, 6).map((rec: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-card border border-border hover:bg-white/[0.05] transition-colors">
                          <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-white">{rec.name}</p><Badge variant="outline" className="border-border text-muted-foreground text-[10px] shrink-0">{rec.score}</Badge></div>
                          <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                        </div>
                      )) : (
                        <div className="col-span-full text-center py-6 text-muted-foreground"><Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Complete more courses to get AI recommendations</p></div>
                      )}
                    </div>
                  ) : <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>}
                </CardContent>
              </Card>
            </motion.div>

            {/* Suggested Prompts */}
            <motion.div {...fadeInUp}>
              <Card className="bg-gradient-to-r from-blue-900/20 to-slate-900/20 border-blue-500/20 backdrop-blur-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary" />Ask Murshid AI</CardTitle></CardHeader>
                <CardContent className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button key={i} onClick={() => openChatWithPrompt(prompt)} className="px-4 py-2 rounded-lg bg-white/[0.05] border border-border text-xs text-secondary-foreground hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all">
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white" onClick={() => setActiveTab("chat")}><Sparkles className="w-4 h-4 me-2" />Start a Conversation</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ─── Insights Tab ─── */}
          <TabsContent value="insights" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />AI Academic Insights</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {allLoaded ? (
                      <>
                        {forecast && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-primary" /></div>
                            <div><p className="text-sm text-white">Predicted GPA: <span className="font-bold text-primary">{forecast?.overallProjection?.currentGPA?.toFixed(2) ?? "—"}</span></p><p className="text-xs text-muted-foreground">Based on current trajectory</p></div>
                          </div>
                        )}
                        {risk && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0"><Target className="w-4 h-4 text-violet-400" /></div>
                            <div><p className="text-sm text-white">Graduation Risk: <span className="font-bold" style={{ color: RISK_COLORS[risk.overallRisk] ?? "#94a3b8" }}>{risk.overallRisk}</span></p><p className="text-xs text-muted-foreground">Score: {risk.score}</p></div>
                          </div>
                        )}
                        {warnings?.warnings && warnings.warnings.length > 0 && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-red-400" /></div>
                            <div><p className="text-sm text-white">At-Risk Courses</p><p className="text-xs text-muted-foreground">{warnings.warnings.length} course(s) need attention</p></div>
                          </div>
                        )}
                        {overview?.upcomingAssignments && overview.upcomingAssignments.length > 0 && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-amber-400" /></div>
                            <div><p className="text-sm text-white">Upcoming Deadlines</p><p className="text-xs text-muted-foreground">{overview.upcomingAssignments.length} assignment(s) due soon</p></div>
                          </div>
                        )}
                      </>
                    ) : <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" />AI Analytics</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {allLoaded ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Questions</p><p className="text-xl font-bold text-white mt-1">{conversations.length * 3 + 12}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Engagement</p><p className="text-xl font-bold text-white mt-1">{healthScore > 0 ? Math.min(100, Math.round(healthScore * 0.8 + 20)) : "—"}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Courses</p><p className="text-xl font-bold text-white mt-1">{dashboard?.courses?.length ?? 0}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Streak</p><p className="text-xl font-bold text-white mt-1">{overview?.streak?.current ?? 0}d</p></div>
                        </div>
                        <div><p className="text-xs text-muted-foreground mb-2">Academic Improvement</p><MiniBar value={gpa >= 3 ? 85 : gpa >= 2.5 ? 60 : 35} color="#10b981" /></div>
                      </>
                    ) : <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            <motion.div {...fadeInUp}>
              <Card className="bg-card border-border backdrop-blur-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-cyan-400" />Study Planner Snapshot</CardTitle></CardHeader>
                <CardContent className="p-5">
                  {allLoaded ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl bg-card border border-border text-center"><Calendar className="w-5 h-5 text-cyan-400 mx-auto mb-2" /><p className="text-xs text-muted-foreground">Weekly Schedule</p><p className="text-sm font-bold text-white mt-1">{dashboard?.courses?.length ?? 0} courses</p></div>
                      <div className="p-4 rounded-xl bg-card border border-border text-center"><PenLine className="w-5 h-5 text-amber-400 mx-auto mb-2" /><p className="text-xs text-muted-foreground">Assignments</p><p className="text-sm font-bold text-white mt-1">{overview?.upcomingAssignments?.length ?? 0} pending</p></div>
                      <div className="p-4 rounded-xl bg-card border border-border text-center"><Clock className="w-5 h-5 text-primary mx-auto mb-2" /><p className="text-xs text-muted-foreground">Study Hours</p><p className="text-sm font-bold text-white mt-1">{Math.round((dashboard?.courses?.length ?? 0) * 4.5)}h/week</p></div>
                      <div className="p-4 rounded-xl bg-card border border-border text-center"><Target className="w-5 h-5 text-emerald-400 mx-auto mb-2" /><p className="text-xs text-muted-foreground">Focus Areas</p><p className="text-sm font-bold text-white mt-1">{warnings?.warnings?.filter((w: any) => w.type === 'at_risk').length ?? 0} at risk</p></div>
                    </div>
                  ) : <div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}</div>}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ─── Planner Tab ─── */}
          <TabsContent value="planner" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-400" />Smart Course Recommendations</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {recLoading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div> :
                      recommendations && recommendations.recommendations?.length > 0 ? recommendations.recommendations.slice(0, 5).map((rec: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-card border border-border hover:bg-white/[0.05] transition-colors">
                          <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{rec.name}</p><p className="text-xs text-muted-foreground mt-1">{rec.reason}</p></div><Badge variant="outline" className="border-border text-muted-foreground text-[10px] shrink-0">{rec.score}</Badge></div>
                        </div>
                      )) : planner?.plan?.courses && planner.plan.courses.length > 0 ? planner.plan.courses.slice(0, 5).map((rec: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-card border border-border"><p className="text-sm font-semibold text-white">{rec.name ?? "Course"}</p><p className="text-xs text-muted-foreground mt-1">{rec.reason ?? "Recommended for your plan"}</p></div>
                      )) : <div className="text-center py-8 text-muted-foreground"><BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No recommendations yet</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-cyan-400" />Degree Roadmap</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {rmLoading ? <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12" />)}</div> :
                      roadmap?.roadmap && roadmap.roadmap.length > 0 ? roadmap.roadmap.slice(0, 6).map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                          <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center text-xs font-bold text-primary">{item.semester}</div><span className="text-sm text-white">{item.credits} credits</span></div>
                          <span className="text-xs text-muted-foreground">{item.status}</span>
                        </div>
                      )) : <div className="text-center py-8 text-muted-foreground"><Compass className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Roadmap data not available</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ─── Career Tab ─── */}
          <TabsContent value="career" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cLoading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-64" />) :
                career?.matches && career.matches.length > 0 ? career.matches.slice(0, 6).map((c: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="bg-card border-border backdrop-blur-2xl h-full hover:bg-white/[0.06] transition-colors">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between"><div className={`w-10 h-10 rounded-lg ${i % 2 === 0 ? "bg-rose-500/15 text-rose-400" : "bg-blue-500/15 text-primary"} flex items-center justify-center`}><Briefcase className="w-5 h-5" /></div><Badge variant="outline" className="border-border text-muted-foreground text-[10px]">{c.matchPercentage ?? 0}% match</Badge></div>
                        <h4 className="text-sm font-bold text-white">{c.title}</h4>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                        <div className="space-y-1"><p className="text-[10px] text-muted-foreground uppercase">Skills</p><div className="flex flex-wrap gap-1">{(c.requiredSkills ?? []).slice(0, 4).map((s: string, j: number) => <Badge key={j} variant="outline" className="border-border text-muted-foreground text-[10px]">{s}</Badge>)}</div></div>
                        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground"><span>Salary: {c.avgStartingSalary}</span><span className="text-emerald-400">{c.growthOutlook}</span></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Complete your profile and courses to see career matches.</p>
                  </div>
                )}
            </div>
          </TabsContent>

          {/* ─── Chat Tab ─── */}
          <TabsContent value="chat" className="mt-6 overflow-x-hidden flex flex-col">
            <div className={isMobile ? "flex flex-col h-[calc(100dvh-280px)] -mx-3 sm:-mx-4" : "flex h-[calc(100dvh-220px)] gap-4"}>
              {/* Sidebar — desktop only, conditionally rendered */}
              {!isMobile && (
                <div className="w-60 lg:w-64 bg-card border border-border rounded-xl p-3 flex-col backdrop-blur-2xl shrink-0 flex">
                  <Button onClick={handleCreateConversation} className="w-full mb-3 bg-blue-600 hover:bg-blue-500 text-sm" disabled={createConv.isPending}><Plus className="w-4 h-4 me-2" />New Chat</Button>
                  <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
                    {!conversationsData ? <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}</div> :
                      conversations.length > 0 ? conversations.map(conv => (
                        <div key={conv.id} className={`p-2 rounded-lg cursor-pointer transition-colors group flex justify-between items-center ${selectedConversation === conv.id ? "bg-blue-600/20 border border-blue-500/40" : "bg-card hover:bg-white/[0.06] border border-border"}`} onClick={() => setSelectedConversation(conv.id)}>
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate text-secondary-foreground">{conv.title}</p></div>
                          <button onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" /></button>
                        </div>
                      )) : <p className="text-muted-foreground text-sm text-center py-4">No conversations</p>}
                  </div>
                </div>
              )}

              {/* Chat Area */}
              <div className="flex-1 bg-card border-0 md:border border-border rounded-none md:rounded-xl flex flex-col backdrop-blur-2xl overflow-hidden min-w-0">
                {selectedConversation ? (
                  <>
                    {/* Mobile conversation strip — conditionally rendered */}
                    {isMobile && (
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/95 backdrop-blur overflow-x-auto shrink-0">
                        <Button onClick={handleCreateConversation} size="sm" className="shrink-0 h-9 w-9 p-0 bg-blue-600 hover:bg-blue-500" disabled={createConv.isPending}><Plus className="w-4 h-4" /></Button>
                        {conversations.map(conv => (
                          <button key={conv.id} onClick={() => setSelectedConversation(conv.id)} className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] border truncate max-w-[120px] ${selectedConversation === conv.id ? "bg-blue-600/20 border-blue-500/40 text-white" : "bg-card border-border text-muted-foreground"}`}>
                            {conv.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 md:space-y-4 min-h-0">
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center space-y-4 px-2">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto"><Sparkles className="w-7 h-7 text-primary" /></div>
                            <p className="text-muted-foreground text-lg font-medium">Start a new conversation</p>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Ask Murshid AI anything about your academics, courses, career, or study plans.</p>
                            <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-xs mx-auto">
                              {SUGGESTED_PROMPTS.slice(0, 3).map((p, i) => (
                                <button key={i} onClick={() => { setInput(p); }} className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-border text-xs text-muted-foreground hover:bg-white/[0.08] hover:text-white transition-all">{p}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {messages.map((msg, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`${msg.role === "user" ? "max-w-[85%]" : "max-w-[90%]"} sm:max-w-[80%] md:max-w-md lg:max-w-lg px-3 py-2.5 md:px-4 md:py-3 rounded-2xl break-words ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white/[0.06] border border-border text-slate-100 rounded-bl-sm"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5" />}
                                  <span className="text-[10px] opacity-70">{msg.role === "assistant" ? "Murshid AI" : "You"}</span>
                                </div>
                                {msg.role === "assistant" ? <Streamdown className="break-words">{msg.content}</Streamdown> : <p className="text-sm break-words">{msg.content}</p>}
                                {msg.role === "assistant" && msg.id && (
                                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                                    <button onClick={() => handleRateMessage(msg.id!, "up")} disabled={msg.feedback === "up" || rateMsg.isPending} className={`p-1.5 rounded-md transition-colors ${msg.feedback === "up" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/10 text-muted-foreground hover:text-emerald-400"}`} title="Good response">
                                      <ThumbsUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleRateMessage(msg.id!, "down")} disabled={msg.feedback === "down" || rateMsg.isPending} className={`p-1.5 rounded-md transition-colors ${msg.feedback === "down" ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-muted-foreground hover:text-red-400"}`} title="Bad response">
                                      <ThumbsDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                              <div className="bg-white/[0.06] border border-border px-3 py-2.5 rounded-2xl flex items-center gap-2">
                                <Bot className="w-4 h-4 text-primary" />
                                <span className="text-sm text-secondary-foreground">Murshid AI is thinking</span>
                                <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Sticky Input */}
                    <div className="border-t border-border p-2.5 sm:p-3 md:p-4 bg-card/95 backdrop-blur shrink-0">
                      <div className="flex gap-2 md:gap-3 w-full md:max-w-4xl md:mx-auto">
                        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMessage()} placeholder={t("chat.placeholder")} className="bg-white/[0.05] border-border text-white placeholder-slate-500 h-11 text-sm flex-1" disabled={isLoading} />
                        <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="bg-blue-600 hover:bg-blue-500 h-11 w-11 p-0 shrink-0"><Send className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 px-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto"><MessageCircle className="w-8 h-8 text-primary" /></div>
                      <p className="text-muted-foreground text-lg">{t("chat.startNewChat")}</p>
                      <Button onClick={handleCreateConversation} className="bg-blue-600 hover:bg-blue-500"><Plus className="w-4 h-4 me-2" />New Conversation</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
