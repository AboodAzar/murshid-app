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
  Download, Share2, RefreshCw, Info, Frown, Smile, Meh, ThumbsUp, ThumbsDown, X,
  Moon, Coffee, Check, ExternalLink, Globe
} from "lucide-react";
import { toast } from "sonner";
import { LectureBreakTimelineChart } from "@/components/analytics/LectureBreakTimelineChart";
import { StudyPlanWorkloadGraph } from "@/components/analytics/StudyPlanWorkloadGraph";
import { DegreeRoadmapVisualizer } from "@/components/analytics/DegreeRoadmapVisualizer";

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

function MiniBar({ value, color = "#10b981" }: { value: number; color?: string }) {
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
  { id: "plan", label: "Study Plan", icon: ClipboardList, color: "bg-emerald-500/15 text-primary", desc: "Weekly AI schedule" },
  { id: "gpa", label: "Analyze GPA", icon: BarChart3, color: "bg-violet-500/15 text-violet-400", desc: "Performance deep-dive" },
  { id: "graduation", label: "Graduation", icon: GraduationCap, color: "bg-emerald-500/15 text-emerald-400", desc: "Graduation forecast" },
  { id: "courses", label: "Courses", icon: BookOpen, color: "bg-amber-500/15 text-amber-400", desc: "Next semester picks" },
  { id: "schedule", label: "Schedule", icon: Calendar, color: "bg-emerald-500/15 text-emerald-400", desc: "Balance workload" },
  { id: "career", label: "Career", icon: Briefcase, color: "bg-rose-500/15 text-rose-400", desc: "Dream job path" },
  { id: "chat", label: "Ask AI", icon: Sparkles, color: "bg-fuchsia-500/15 text-fuchsia-400", desc: "Anything on your mind" },
];

const SUGGESTED_PROMPTS_EN = [
  "What is the best study strategy & translated articles for Data Structures CS201?",
  "Curated video lectures & problem walkthroughs for Physics PHYS102",
  "I am a working student with free time between 9 PM - 11 PM, build me a study plan",
  "Mastery roadmap and design patterns for OOP CS202",
  "How is my cumulative GPA calculated on the 100% scale?",
  "How do integrated (blended) courses work on our 4-day schedule?",
  "What are the rules regarding the 15% absence deprivation limit?",
];

const SUGGESTED_PROMPTS_AR = [
  "ما هي أفضل استراتيجية ومصادر مترجمة لدراسة تراكيب البيانات CS201؟",
  "أفضل فيديوهات ومقالات ومناقشات لمادة الفيزياء PHYS102",
  "أنا طالب موظف، أوقات فراغي بين 9:00 - 11:00 مساءً، أنشئ لي خطة دراسية",
  "أفضل خارطة طريق لشرح مادة البرمجة كائنية التوجه CS202",
  "كيف يُحتسب معدلي التراكمي على النظام المئوي (100%)؟",
  "كيف يعمل نمط التعليم المدمج في نظام الدوام 4 أيام؟",
  "ما هي عقوبة تجاوز نسبة 15% من الغياب (المادة 11)؟",
];

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  feedback?: "up" | "down" | "none" | null;
  isOfflineFallback?: boolean;
  source?: "faq" | "academic_rules" | "local_advisor" | "external_llm";
}

function MessageSourceBadge({
  source,
  isOffline,
  language,
}: {
  source?: "faq" | "academic_rules" | "local_advisor" | "external_llm" | string;
  isOffline?: boolean;
  language: "en" | "ar";
}) {
  if (source === "faq") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
        <BookOpen className="w-2.5 h-2.5" />
        {language === "ar" ? "لوائح وأسئلة الزيتونة" : "ZUJ Regulations FAQ"}
      </span>
    );
  }
  if (source === "academic_rules") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
        <GraduationCap className="w-2.5 h-2.5" />
        {language === "ar" ? "الخطة الدراسية والقواعد" : "Academic Rules"}
      </span>
    );
  }
  if (source === "local_advisor") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
        <Sparkles className="w-2.5 h-2.5" />
        {language === "ar" ? "إرشادات المرشد المحلي" : "Advisor Guidance"}
      </span>
    );
  }
  if (source === "external_llm") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
        <Zap className="w-2.5 h-2.5" />
        {language === "ar" ? "نموذج سحابي حي" : "Live Model"}
      </span>
    );
  }
  if (isOffline) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-slate-300">
        <BrainCircuit className="w-2.5 h-2.5" />
        {language === "ar" ? "استجابة محلية" : "Local Fallback"}
      </span>
    );
  }
  return null;
}

export default function AIChatPage() {
  const { t, language } = useI18n();
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
  const suggestedPrompts = language === "ar" ? SUGGESTED_PROMPTS_AR : SUGGESTED_PROMPTS_EN;
  const currentSem = dashboard?.stats?.currentSemester ?? 1;
  const semestersLeft = dashboard?.stats?.semestersLeft ?? 0;

  /* Chat state */
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFallbackBanner, setShowFallbackBanner] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: aiStatus, isLoading: statusLoading } = trpc.aiChat.getStatus.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const isLocalFallbackMode = !aiStatus?.isOnline || aiStatus?.mode === "local_mock_fallback";

  const { data: conversationsData } = trpc.aiChat.getConversations.useQuery();
  const { data: messagesData } = trpc.aiChat.getMessages.useQuery(selectedConversation || 0, { enabled: !!selectedConversation });
  const utils = trpc.useUtils();
  const createConv = trpc.aiChat.createConversation.useMutation();
  const sendMsg = trpc.aiChat.sendMessage.useMutation();
  const deleteConv = trpc.aiChat.deleteConversation.useMutation();
  const rateMsg = trpc.aiChat.rateMessage.useMutation();
  const generatePlanMutation = trpc.aiChat.generateFreeTimeStudyPlan.useMutation();

  // Free-Time Availability Study Planner state
  const [freeTimeStart, setFreeTimeStart] = useState("21:00");
  const [freeTimeEnd, setFreeTimeEnd] = useState("23:00");
  const [workScheduleNote, setWorkScheduleNote] = useState(
    language === "ar" ? "طالب موظف نهاراً من 9:00 ص إلى 5:00 م" : "Working daytime 9 AM - 5 PM"
  );
  const [sessionStyle, setSessionStyle] = useState<"pomodoro" | "deep_work">("deep_work");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);

  const handleGenerateFreeTimePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await generatePlanMutation.mutateAsync({
        freeTimeStart,
        freeTimeEnd,
        workScheduleNote,
        sessionStyle,
        language: language === "ar" ? "ar" : "en",
      });
      if (res?.plan) {
        setGeneratedPlan(res.plan);
        toast.success(language === "ar" ? "تم توليد جدول المذاكرة الذكي بنجاح!" : "Study plan generated successfully!");
      }
    } catch (e: any) {
      toast.error(language === "ar" ? "تعذر توليد الجدول، يرجى المحاولة لاحقاً" : "Failed to generate study plan");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSendPlanToChat = () => {
    const prompt = language === "ar"
      ? `أنا طالب موظف، أوقات فراغي بين ${freeTimeStart} - ${freeTimeEnd} مساءً، أنشئ لي خطة دراسية لموادي المسجلة`
      : `I am a working student with free time between ${freeTimeStart} - ${freeTimeEnd}, build me a study plan`;
    setActiveTab("chat");
    setInput(prompt);
  };

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
    const userText = input.trim();
    const userMsg: Message = { role: "user", content: userText, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await sendMsg.mutateAsync({ conversationId: selectedConversation, message: userText });
      if (res?.response) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: res.response,
            isOfflineFallback: res.isOfflineFallback ?? true,
            source: res.source ?? "local_advisor",
            createdAt: new Date(),
          },
        ]);
      }
      utils.aiChat.getMessages.invalidate(selectedConversation);
    } catch (e) {
      console.error("[AIChatPage] Message delivery error:", e);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: language === "ar"
            ? "تعذر إرسال الرسالة إلى الخادم حالياً. يرجى مراجعة المرشد الأكاديمي أو المحاولة مجدداً."
            : t("chat.sendError") || "Sorry, I encountered an error. Please try again.",
          isOfflineFallback: true,
          source: "local_advisor",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 50);
    }
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
        <motion.div {...fadeInUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/80 border border-emerald-500/20 backdrop-blur-2xl p-4 sm:p-6 md:p-8">
          <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Logo size={40} className="rounded-xl shadow-[0_0_30px_rgba(59,130,246,.35)]" />
                <div className="flex items-center gap-2">
                  {statusLoading ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                      <span className="text-[11px] font-medium uppercase tracking-wider">
                        {t("chat.statusChecking")}
                      </span>
                    </div>
                  ) : isLocalFallbackMode ? (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm"
                      title={aiStatus?.model ? `Active: ${aiStatus.model}` : "Local ZUJ FAQ & Rules Fallback"}
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        {t("chat.statusLocal")}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-400/40 text-amber-300 hidden sm:inline-flex">
                        {t("chat.statusOffline")}
                      </Badge>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-sm"
                      title={aiStatus?.model ? `Model: ${aiStatus.model}` : "Live External Model"}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        {t("chat.statusOnline")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {studentName}.</h1>
              <p className="text-muted-foreground max-w-md">I'm <span className="text-primary font-semibold">Oliver AI</span>, your academic advisor and study companion.</p>
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
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white text-muted-foreground shrink-0"><BrainCircuit className="w-3.5 h-3.5 me-1.5" />Dashboard</TabsTrigger>
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
              <Card className="bg-gradient-to-r from-emerald-950/20 to-slate-900/20 border-emerald-500/20 backdrop-blur-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary" />Ask Oliver AI</CardTitle></CardHeader>
                <CardContent className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, i) => (
                      <button key={i} onClick={() => openChatWithPrompt(prompt)} className="px-4 py-2 rounded-lg bg-white/[0.05] border border-border text-xs text-secondary-foreground hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all">
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <Button className="mt-4 bg-emerald-700 hover:bg-emerald-600 text-white" onClick={() => setActiveTab("chat")}><Sparkles className="w-4 h-4 me-2" />Start a Conversation</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ─── Insights Tab ─── */}
          <TabsContent value="insights" className="mt-6 space-y-6">
            {/* Top Row: AI Trajectory & Fast KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />{language === "ar" ? "رؤى الذكاء الاصطناعي الأكاديمية" : "AI Academic Trajectory & Forecast"}</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {allLoaded ? (
                      <>
                        {forecast && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-primary" /></div>
                            <div><p className="text-sm text-white">Predicted GPA: <span className="font-bold text-primary">{forecast?.overallProjection?.currentGPA?.toFixed(2) ?? "—"}</span></p><p className="text-xs text-muted-foreground">Based on active enrolled credit hours & historical momentum</p></div>
                          </div>
                        )}
                        {risk && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0"><Target className="w-4 h-4 text-violet-400" /></div>
                            <div><p className="text-sm text-white">Graduation Risk Status: <span className="font-bold uppercase" style={{ color: RISK_COLORS[risk.overallRisk] ?? "#94a3b8" }}>{risk.overallRisk}</span></p><p className="text-xs text-muted-foreground">Risk Score Index: {risk.score} / 100</p></div>
                          </div>
                        )}
                        {warnings?.warnings && warnings.warnings.length > 0 && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-red-400" /></div>
                            <div><p className="text-sm text-white">Prerequisite / Retake Alert</p><p className="text-xs text-muted-foreground">{warnings.warnings.length} course(s) require proactive recovery</p></div>
                          </div>
                        )}
                      </>
                    ) : <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...fadeInUp}>
                <Card className="bg-card border-border backdrop-blur-2xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-400" />{language === "ar" ? "نشاط التعلم والتفاعل" : "Engagement & Learning Metrics"}</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {allLoaded ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">AI Consultations</p><p className="text-xl font-bold text-white mt-1">{conversations.length * 3 + 12}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Engagement Score</p><p className="text-xl font-bold text-white mt-1">{healthScore > 0 ? Math.min(100, Math.round(healthScore * 0.8 + 20)) : "—"}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Registered Courses</p><p className="text-xl font-bold text-white mt-1">{dashboard?.courses?.length ?? 0}</p></div>
                          <div className="p-3 rounded-xl bg-card border border-border text-center"><p className="text-[10px] text-muted-foreground uppercase">Study Streak</p><p className="text-xl font-bold text-white mt-1">{overview?.streak?.current ?? 0}d</p></div>
                        </div>
                        <div><p className="text-xs text-muted-foreground mb-2">Academic Improvement Index</p><MiniBar value={gpa >= 3 ? 85 : gpa >= 2.5 ? 60 : 35} color="#10b981" /></div>
                      </>
                    ) : <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Visual Study Plan Graphs: Workload Allocation, Subject Domain Balance & 9-11 PM Window */}
            <motion.div {...fadeInUp}>
              <StudyPlanWorkloadGraph language={language} />
            </motion.div>

            {/* Visual Schedule with Breaks Between Lectures */}
            <motion.div {...fadeInUp}>
              <LectureBreakTimelineChart language={language} />
            </motion.div>

            {/* Full 8-Semester Courses Roadmap with Completed Courses Crossed Out */}
            <motion.div {...fadeInUp}>
              <DegreeRoadmapVisualizer language={language} />
            </motion.div>
          </TabsContent>

          {/* ─── Planner Tab ─── */}
          <TabsContent value="planner" className="mt-6 space-y-6">
            {/* ─── Free-Time AI Availability Study Planner ─── */}
            <motion.div {...fadeInUp}>
              <Card className="bg-gradient-to-br from-emerald-950/40 via-card to-card border-emerald-500/30 backdrop-blur-2xl shadow-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
                          <span>{language === "ar" ? "مخطط وقت الفراغ الذكي (للطلبة الموظفين)" : "Free-Time AI Study Planner"}</span>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                            {language === "ar" ? "ذكاء اصطناعي مخصص" : "Time-Blocked"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          {language === "ar"
                            ? "أدخل وقت فراغك اليومي (مثلاً 9 - 11 مساءً) وسيقوم أوليفر بتوليد جدول مذاكرة دقيق يوزع موادك وواجباتك"
                            : "Enter your daily availability (e.g. 9:00 PM - 11:00 PM) to generate a personalized time-blocked study schedule."}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendPlanToChat}
                        className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 me-1.5 text-primary" />
                        {language === "ar" ? "استشارة أوليفر بالدردشة" : "Discuss in Chat"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-5">
                  {/* Controls Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Time Window */}
                    <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.03] border border-border">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-emerald-400" />
                        {language === "ar" ? "نافذة وقت الفراغ اليومي" : "Daily Free-Time Window"}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground block mb-1">{language === "ar" ? "من (البداية)" : "From"}</span>
                          <Input
                            type="time"
                            value={freeTimeStart}
                            onChange={(e) => setFreeTimeStart(e.target.value)}
                            className="bg-black/30 border-border text-white text-xs h-9 font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block mb-1">{language === "ar" ? "إلى (النهاية)" : "To"}</span>
                          <Input
                            type="time"
                            value={freeTimeEnd}
                            onChange={(e) => setFreeTimeEnd(e.target.value)}
                            className="bg-black/30 border-border text-white text-xs h-9 font-mono"
                          />
                        </div>
                      </div>
                      {/* Presets */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => { setFreeTimeStart("21:00"); setFreeTimeEnd("23:00"); }}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${freeTimeStart === "21:00" && freeTimeEnd === "23:00" ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-semibold" : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"}`}
                        >
                          🌙 9 - 11 PM
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFreeTimeStart("18:00"); setFreeTimeEnd("20:30"); }}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${freeTimeStart === "18:00" && freeTimeEnd === "20:30" ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-semibold" : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"}`}
                        >
                          🌆 6 - 8:30 PM
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFreeTimeStart("06:00"); setFreeTimeEnd("08:00"); }}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${freeTimeStart === "06:00" && freeTimeEnd === "08:00" ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-semibold" : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"}`}
                        >
                          🌅 6 - 8 AM
                        </button>
                      </div>
                    </div>

                    {/* Commitments & Work Note */}
                    <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.03] border border-border">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        {language === "ar" ? "طبيعة العمل والالتزامات" : "Work Commitments Note"}
                      </label>
                      <Input
                        value={workScheduleNote}
                        onChange={(e) => setWorkScheduleNote(e.target.value)}
                        placeholder={language === "ar" ? "مثلاً: طالب موظف نهاراً من 9 ص إلى 5 م" : "e.g. Working daytime 9 AM - 5 PM"}
                        className="bg-black/30 border-border text-white text-xs h-9"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {language === "ar"
                          ? "يراعي الذكاء الاصطناعي مستويات الطاقة الذهنية بعد ساعات العمل."
                          : "AI adapts cognitive load to fit evening energy reserves."}
                      </p>
                    </div>

                    {/* Study Style & Action */}
                    <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.03] border border-border flex flex-col justify-between">
                      <div>
                        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-1.5">
                          <Target className="w-3.5 h-3.5 text-primary" />
                          {language === "ar" ? "نمط الجلسة الدراسية" : "Session Rhythm"}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSessionStyle("deep_work")}
                            className={`p-1.5 rounded-lg border text-xs text-center transition-all ${sessionStyle === "deep_work" ? "bg-emerald-600/25 border-emerald-500/50 text-white font-semibold" : "bg-white/5 border-white/10 text-muted-foreground"}`}
                          >
                            <span className="block font-semibold">Deep Work</span>
                            <span className="text-[10px] opacity-75">50m + 10m break</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionStyle("pomodoro")}
                            className={`p-1.5 rounded-lg border text-xs text-center transition-all ${sessionStyle === "pomodoro" ? "bg-emerald-600/25 border-emerald-500/50 text-white font-semibold" : "bg-white/5 border-white/10 text-muted-foreground"}`}
                          >
                            <span className="block font-semibold">Pomodoro</span>
                            <span className="text-[10px] opacity-75">25m sprints</span>
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleGenerateFreeTimePlan}
                        disabled={isGeneratingPlan}
                        className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold mt-2 shadow-lg shadow-emerald-950/40"
                      >
                        {isGeneratingPlan ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin me-1.5" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 me-1.5" />
                        )}
                        {language === "ar" ? "توليد الخطة المخصصة للوقت" : "Generate Free-Time Plan"}
                      </Button>
                    </div>
                  </div>

                  {/* Render Generated Plan */}
                  {generatedPlan && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {generatedPlan.weeklyTotalHours}h
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{generatedPlan.freeTimeWindow}</span>
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[9px]">
                                {generatedPlan.dailyAvailableMinutes} min / day
                              </Badge>
                            </p>
                            <p className="text-[11px] text-emerald-200/80 mt-0.5">
                              {language === "ar" ? generatedPlan.wellnessAdviceAr : generatedPlan.wellnessAdvice}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(generatedPlan, null, 2));
                              setCopiedPlan(true);
                              setTimeout(() => setCopiedPlan(false), 2000);
                              toast.success(language === "ar" ? "تم نسخ تفاصيل الخطة!" : "Plan details copied!");
                            }}
                            className="h-8 text-xs border-emerald-500/40 text-emerald-200 bg-emerald-950/30 hover:bg-emerald-900/50"
                          >
                            {copiedPlan ? <Check className="w-3.5 h-3.5 me-1 text-emerald-400" /> : <ClipboardList className="w-3.5 h-3.5 me-1" />}
                            {copiedPlan ? (language === "ar" ? "تم النسخ" : "Copied") : (language === "ar" ? "نسخ الجدول" : "Copy")}
                          </Button>
                        </div>
                      </div>

                      {/* Day By Day Blocks */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {generatedPlan.days.map((day: any, dIdx: number) => (
                          <div key={dIdx} className="p-3 rounded-xl bg-card border border-border hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-2">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 border-b border-border">
                                <span className="text-xs font-bold text-white">{language === "ar" ? day.dayNameAr : day.dayName}</span>
                                <Badge variant="outline" className="text-[9px] border-border text-muted-foreground px-1.5">
                                  {language === "ar" ? day.focusSummaryAr : day.focusSummary}
                                </Badge>
                              </div>
                              <div className="space-y-2 mt-2">
                                {day.blocks.map((b: any, bIdx: number) => (
                                  <div
                                    key={bIdx}
                                    className={`p-2 rounded-lg text-[11px] ${b.isBreak ? "bg-amber-500/10 border border-amber-500/20 text-amber-200" : "bg-white/[0.04] border border-border text-slate-200"}`}
                                  >
                                    <div className="flex items-center justify-between font-mono text-[9px] opacity-75 mb-0.5">
                                      <span>{b.timeRange}</span>
                                      <span>{b.durationMinutes}m</span>
                                    </div>
                                    <p className="font-semibold text-white leading-tight">
                                      {b.courseCode !== "RECOVERY" ? `${b.courseCode}: ` : "☕ "}
                                      {language === "ar" ? b.topicAr : b.topic}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                                      {language === "ar" ? b.notesAr : b.notes}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

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
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-emerald-400" />Degree Roadmap</CardTitle></CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {rmLoading ? <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12" />)}</div> :
                      roadmap?.roadmap && roadmap.roadmap.length > 0 ? roadmap.roadmap.slice(0, 6).map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                          <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-primary">{item.semester}</div><span className="text-sm text-white">{item.credits} credits</span></div>
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
                        <div className="flex items-start justify-between"><div className={`w-10 h-10 rounded-lg ${i % 2 === 0 ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-primary"} flex items-center justify-center`}><Briefcase className="w-5 h-5" /></div><Badge variant="outline" className="border-border text-muted-foreground text-[10px]">{c.matchPercentage ?? 0}% match</Badge></div>
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
                  <Button onClick={handleCreateConversation} className="w-full mb-3 bg-emerald-700 hover:bg-emerald-600 text-sm" disabled={createConv.isPending}><Plus className="w-4 h-4 me-2" />New Chat</Button>
                  <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
                    {!conversationsData ? <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}</div> :
                      conversations.length > 0 ? conversations.map(conv => (
                        <div key={conv.id} className={`p-2 rounded-lg cursor-pointer transition-colors group flex justify-between items-center ${selectedConversation === conv.id ? "bg-emerald-700/20 border border-emerald-500/40" : "bg-card hover:bg-white/[0.06] border border-border"}`} onClick={() => setSelectedConversation(conv.id)}>
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
                        <Button onClick={handleCreateConversation} size="sm" className="shrink-0 h-9 w-9 p-0 bg-emerald-700 hover:bg-emerald-600" disabled={createConv.isPending}><Plus className="w-4 h-4" /></Button>
                        {conversations.map(conv => (
                          <button key={conv.id} onClick={() => setSelectedConversation(conv.id)} className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] border truncate max-w-[120px] ${selectedConversation === conv.id ? "bg-emerald-700/20 border-emerald-500/40 text-white" : "bg-card border-border text-muted-foreground"}`}>
                            {conv.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ─── Local Fallback Mode Banner ─── */}
                    {isLocalFallbackMode && showFallbackBanner && (
                      <div className="mx-3 sm:mx-4 mt-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-200 backdrop-blur-md flex items-start justify-between gap-3 shrink-0">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-semibold text-amber-300 leading-tight">
                                {t("chat.bannerTitle")}
                              </h4>
                              <Badge variant="outline" className="text-[10px] bg-amber-500/20 border-amber-500/40 text-amber-300 px-1.5 py-0">
                                {language === "ar" ? "لوائح جامعة الزيتونة" : "ZUJ FAQs & Regulations"}
                              </Badge>
                            </div>
                            <p className="text-[11px] sm:text-xs text-amber-200/90 leading-relaxed">
                              {t("chat.bannerDescription")}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowFallbackBanner(false)}
                          className="p-1 rounded-md text-amber-400 hover:text-amber-100 hover:bg-amber-500/20 transition-colors shrink-0"
                          aria-label={language === "ar" ? "إغلاق الإشعار" : "Dismiss notice"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 md:space-y-4 min-h-0">
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center space-y-4 px-2">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto"><Sparkles className="w-7 h-7 text-primary" /></div>
                            <p className="text-muted-foreground text-lg font-medium">Start a new conversation</p>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Ask Oliver AI anything about your academics, courses, career, or study plans.</p>
                            <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-xs mx-auto">
                              {suggestedPrompts.slice(0, 3).map((p, i) => (
                                <button key={i} onClick={() => { setInput(p); }} className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-border text-xs text-muted-foreground hover:bg-white/[0.08] hover:text-white transition-all">{p}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {messages.map((msg, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`${msg.role === "user" ? "max-w-[85%]" : "max-w-[90%]"} sm:max-w-[80%] md:max-w-md lg:max-w-lg px-3 py-2.5 md:px-4 md:py-3 rounded-2xl break-words ${msg.role === "user" ? "bg-emerald-700 text-white rounded-ee-sm" : "bg-white/[0.06] border border-border text-slate-100 rounded-es-sm"}`}>
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5" />}
                                  <span className="text-[10px] opacity-70">{msg.role === "assistant" ? "Oliver AI" : "You"}</span>
                                  {msg.role === "assistant" && (
                                    <MessageSourceBadge source={msg.source} isOffline={msg.isOfflineFallback} language={language} />
                                  )}
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
                                <span className="text-sm text-secondary-foreground">Oliver AI is thinking</span>
                                <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Smart Chips Bar */}
                    <div className="px-3 pt-2 pb-1 border-t border-border/50 bg-card/60 backdrop-blur flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold shrink-0 me-1">
                        {language === "ar" ? "⚡ استفسارات سريعة:" : "⚡ Quick Ask:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const q = language === "ar"
                            ? "ما هي أفضل استراتيجية ومصادر مترجمة لدراسة تراكيب البيانات CS201؟"
                            : "What is the best study strategy & translated articles for Data Structures CS201?";
                          setInput(q);
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[11px] font-medium transition-all"
                      >
                        🌐 {language === "ar" ? "استراتيجية CS201 ومقالات روسية" : "CS201 Strategy & Russian Articles"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const q = language === "ar"
                            ? "أفضل فيديوهات ومقالات ومناقشات لمادة الفيزياء PHYS102"
                            : "Curated video lectures & problem walkthroughs for Physics PHYS102";
                          setInput(q);
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/25 text-[11px] font-medium transition-all"
                      >
                        🎥 {language === "ar" ? "فيديوهات ومسائل فيزياء 2" : "PHYS102 Videos & Sets"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const q = language === "ar"
                            ? "أنا طالب موظف، أوقات فراغي بين 9:00 - 11:00 مساءً، أنشئ لي خطة دراسية"
                            : "I am a working student with free time between 9 PM - 11 PM, build me a study plan";
                          setInput(q);
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-[11px] font-medium transition-all"
                      >
                        ⏰ {language === "ar" ? "خطة وقت الفراغ (9 - 11 PM)" : "Free-Time Plan (9 - 11 PM)"}
                      </button>
                    </div>

                    {/* Sticky Input */}
                    <div className="border-t border-border p-2.5 sm:p-3 md:p-4 bg-card/95 backdrop-blur shrink-0">
                      <div className="flex gap-2 md:gap-3 w-full md:max-w-4xl md:mx-auto">
                        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMessage()} placeholder={t("chat.placeholder")} className="bg-white/[0.05] border-border text-white placeholder-slate-500 h-11 text-sm flex-1" disabled={isLoading} />
                        <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="bg-emerald-700 hover:bg-emerald-600 h-11 w-11 p-0 shrink-0"><Send className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 px-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto"><MessageCircle className="w-8 h-8 text-primary" /></div>
                      <p className="text-muted-foreground text-lg">{t("chat.startNewChat")}</p>
                      <Button onClick={handleCreateConversation} className="bg-emerald-700 hover:bg-emerald-600"><Plus className="w-4 h-4 me-2" />New Conversation</Button>
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
