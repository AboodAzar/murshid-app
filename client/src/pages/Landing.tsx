import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Compass,
  GraduationCap,
  Globe2,
  Languages,
  LocateFixed,
  Map,
  MessageSquareText,
  Navigation,
  Orbit,
  Route,
  ShieldCheck,
  Sparkles,
  Stars,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const lines = [
  "Can I graduate by Spring 2027 if I take AI Ethics next term?",
  "Yes. I found a 4-semester route that preserves your scholarship GPA window.",
  "I also detected one prerequisite conflict and suggested a safer elective swap.",
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1600;
    const start = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function StudentJourneyIllustration() {
  const chaos: [string, string, string, number][] = [
    ["?", "left-6 top-10", "h-16 w-24", -10],
    ["?", "left-28 top-24", "h-12 w-20", 12],
    ["?", "left-10 top-44", "h-14 w-28", 7],
    ["?", "left-36 bottom-24", "h-16 w-24", -15],
    ["?", "left-4 bottom-12", "h-12 w-20", 14],
  ];
  const success: [string, LucideIcon, string][] = [
    ["Graduation roadmap", GraduationCap, "right-7 top-10"],
    ["Course recommendations", Brain, "right-20 top-28"],
    ["Campus navigation", Navigation, "right-6 top-[46%]"],
    ["Academic advisor", MessageSquareText, "right-24 bottom-24"],
    ["GPA insights", CalendarCheck, "right-8 bottom-8"],
  ];
  const questions: [string, string, number][] = [
    ["Which courses?", "left-16 top-20", -8],
    ["Credits left?", "left-6 top-64", 10],
    ["Advisor?", "left-36 bottom-36", -6],
  ];
  const particles: [string, string, number][] = [
    ["left-[46%] top-[38%]", "h-1.5 w-1.5", 0],
    ["left-[53%] top-[56%]", "h-1 w-1", 0.45],
    ["left-[49%] top-[62%]", "h-1.5 w-1.5", 0.9],
    ["left-[56%] top-[43%]", "h-1 w-1", 1.35],
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }} className="relative mx-auto h-[520px] w-full max-w-[640px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] shadow-[0_30px_120px_rgba(8,47,73,.45)] backdrop-blur-2xl">
      <div className="absolute inset-y-0 left-0 w-[45%] bg-[radial-gradient(circle_at_30%_35%,rgba(88,28,135,.32),transparent_32%),linear-gradient(135deg,rgba(2,6,23,.96),rgba(15,23,42,.76))]" />
      <div className="absolute inset-y-0 right-0 w-[45%] bg-[radial-gradient(circle_at_70%_42%,rgba(34,197,94,.2),transparent_32%),linear-gradient(135deg,rgba(8,47,73,.28),rgba(2,6,23,.9))]" />
      <div className="absolute inset-y-0 left-[43%] w-[14%] bg-[radial-gradient(circle_at_center,rgba(103,232,249,.3),transparent_62%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(90deg,black,transparent_48%,black)]" />

      <svg className="absolute inset-0 z-10 h-full w-full" viewBox="0 0 640 520" fill="none">
        {["M80 162C172 154 235 206 320 260", "M82 282C174 245 238 255 320 260", "M92 382C174 330 242 304 320 260", "M320 260C397 205 465 218 550 142", "M320 260C398 270 458 272 548 252", "M320 260C396 318 468 340 552 390"].map((path, index) => (
          <motion.path key={path} d={path} stroke="url(#flow)" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 16" initial={{ strokeDashoffset: 80, opacity: 0.15 }} animate={{ strokeDashoffset: 0, opacity: [0.16, 0.72, 0.16] }} transition={{ duration: 3.2, delay: index * 0.18, repeat: Infinity, ease: "easeInOut" }} />
        ))}
        <path d="M95 350C180 260 242 310 320 260C395 205 465 218 550 142" stroke="url(#journey)" strokeWidth="4" strokeLinecap="round" />
        <path d="M95 350C180 260 242 310 320 260C395 205 465 218 550 142" stroke="white" strokeOpacity=".2" strokeWidth="1" strokeDasharray="8 12" />
        <defs>
          <linearGradient id="flow" x1="80" y1="160" x2="552" y2="390">
            <stop stopColor="#94a3b8" stopOpacity=".08" />
            <stop offset=".5" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#86efac" />
          </linearGradient>
          <linearGradient id="journey" x1="95" y1="350" x2="550" y2="142">
            <stop stopColor="#64748b" stopOpacity=".18" />
            <stop offset=".5" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#86efac" />
          </linearGradient>
        </defs>
      </svg>

      {chaos.map(([mark, position, size, rotate], index) => (
        <motion.div
          key={`${position}-${index}`}
          animate={{ x: [0, index % 2 ? -8 : 10, 0], y: [0, index % 2 ? 10 : -8, 0], rotate: [Number(rotate), Number(rotate) * -0.6, Number(rotate)], opacity: [0.32, 0.62, 0.32] }}
          transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute ${position} ${size} z-20 rounded-3xl border border-white/10 bg-white/[0.055] text-center text-4xl font-semibold text-slate-400/70 shadow-2xl blur-[.2px] backdrop-blur-xl`}
        >
          {mark}
        </motion.div>
      ))}

      {questions.map(([text, position, rotate], index) => (
        <motion.div
          key={text}
          animate={{ y: [0, index % 2 ? 7 : -7, 0], opacity: [0.18, 0.42, 0.18], rotate: [rotate, rotate * -0.4, rotate] }}
          transition={{ duration: 4.6 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute ${position} z-20 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-[11px] text-slate-400 shadow-2xl blur-[.35px] backdrop-blur-xl`}
        >
          {text}
        </motion.div>
      ))}

      <div className="absolute left-5 top-28 z-20 h-44 w-52 opacity-60">
        <div className="absolute left-2 top-10 h-px w-44 rotate-12 bg-white/15" />
        <div className="absolute left-8 top-24 h-px w-36 -rotate-12 bg-white/10" />
        <div className="absolute left-20 top-0 h-40 w-px rotate-12 bg-white/10" />
      </div>

      <div className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <motion.div animate={{ scale: [1, 1.16, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} className="absolute h-40 w-40 rounded-full border border-cyan-200/20" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute h-36 w-36 rounded-full border border-dashed border-cyan-200/30" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="absolute h-28 w-28 rounded-full border border-fuchsia-200/15" />
        {particles.map(([position, size, delay]) => (
          <motion.span key={position} animate={{ scale: [0.4, 1, 0.4], opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2.4, delay, repeat: Infinity, ease: "easeInOut" }} className={`absolute ${position} ${size} rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(207,250,254,.9)]`} />
        ))}
        <div className="relative grid h-24 w-24 place-items-center rounded-full border border-cyan-200/35 bg-slate-950/90 shadow-[0_0_95px_rgba(103,232,249,.52),inset_0_0_28px_rgba(103,232,249,.16)] backdrop-blur-2xl">
          <Sparkles className="h-10 w-10 text-cyan-100 drop-shadow-[0_0_18px_rgba(207,250,254,.9)]" />
        </div>
      </div>

      <motion.div animate={{ offsetDistance: ["0%", "48%", "100%"], scale: [0.9, 1.08, 1] }} transition={{ duration: 7, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }} className="absolute z-40 [offset-path:path('M_95_350_C_180_260_242_310_320_260_C_395_205_465_218_550_142')]">
        <div className="relative h-16 w-12">
          <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-full border border-white/20 bg-gradient-to-br from-slate-50 to-slate-400 shadow-[0_0_30px_rgba(255,255,255,.25)]" />
          <div className="absolute bottom-0 left-1/2 h-10 w-12 -translate-x-1/2 rounded-[1.5rem_1.5rem_.8rem_.8rem] border border-white/10 bg-gradient-to-br from-cyan-300/35 to-fuchsia-400/25 backdrop-blur-xl" />
        </div>
      </motion.div>

      {success.map(([text, Icon, position], index) => (
        <motion.div
          key={text}
          initial={{ opacity: 0, x: 28, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.2 + index * 0.12, ease: "easeOut" }}
          className={`absolute ${position} z-30 flex min-w-44 items-center gap-3 rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.09] px-4 py-3 text-xs font-medium text-emerald-50 shadow-2xl backdrop-blur-2xl`}
        >
          <Icon className="h-4 w-4 text-emerald-300" />
          {text}
        </motion.div>
      ))}
    </motion.div>
  );
}

function LiveConversation() {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const current = lines[active];
    let index = 0;
    setTyped("");
    const interval = window.setInterval(() => {
      index += 1;
      setTyped(current.slice(0, index));
      if (index >= current.length) {
        window.clearInterval(interval);
        window.setTimeout(() => setActive(value => (value + 1) % lines.length), 1200);
      }
    }, 28);
    return () => window.clearInterval(interval);
  }, [active]);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><Bot className="h-5 w-5" /></div>
          <div><p className="text-sm font-semibold text-white">Murshid AI Copilot</p><p className="text-xs text-emerald-300">Reasoning over degree plan</p></div>
        </div>
        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">live</div>
      </div>
      <div className="space-y-3">
        <div className="ml-auto max-w-[86%] rounded-2xl rounded-tr-md bg-white px-4 py-3 text-sm text-slate-950">{active === 0 ? typed : lines[0]}</div>
        {active > 0 && <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-cyan-300/10 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">{active === 1 ? typed : lines[1]}</div>}
        {active > 1 && <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-fuchsia-300/10 bg-fuchsia-300/10 px-4 py-3 text-sm text-fuchsia-50">{typed}</div>}
      </div>
    </div>
  );
}

export default function Landing() {
  const { t, language, setLanguage, dir } = useI18n();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, value => `${value}px`);
  const glowY = useTransform(mouseY, value => `${value}px`);

  const bento = useMemo(() => [
    { icon: Brain, title: "AI academic intelligence", text: "Understands your GPA, prerequisites, deadlines, advisor notes, and graduation constraints in one private reasoning layer.", className: "md:col-span-2" },
    { icon: Route, title: "Graduation autopilot", text: "Turns uncertainty into a semester-by-semester route.", className: "" },
    { icon: Compass, title: "Campus navigation", text: "Indoor-ready guidance for buildings, rooms, offices, and services.", className: "" },
    { icon: ShieldCheck, title: "Trusted by design", text: "Secure session handling, role-aware dashboards, and advisor-grade workflows.", className: "md:col-span-2" },
  ], []);

  const roadmap = [
    ["Foundation", "Complete core math and programming prerequisites", "Now"],
    ["Acceleration", "Select AI, data systems, and research-aligned electives", "2026"],
    ["Validation", "Advisor approval, risk checks, and GPA protection", "2027"],
    ["Graduation", "Final audit, capstone readiness, and career launch", "2028"],
  ];

  return (
    <main dir={dir} onMouseMove={event => { mouseX.set(event.clientX); mouseY.set(event.clientY); }} className="min-h-screen overflow-hidden bg-[#02030a] font-[Inter,ui-sans-serif,system-ui] text-white">
      <motion.div style={{ left: glowX, top: glowY }} className="pointer-events-none fixed z-30 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,.26),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,.22),transparent_30%),radial-gradient(circle_at_50%_85%,rgba(16,185,129,.16),transparent_30%)]" />
      <motion.div animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} className="fixed inset-0 opacity-50 [background-size:200%_200%] bg-[linear-gradient(120deg,rgba(14,165,233,.16),rgba(168,85,247,.12),rgba(34,197,94,.1),rgba(14,165,233,.16))]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-slate-950/40 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3"><div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-[0_0_45px_rgba(255,255,255,.28)]"><Sparkles className="h-5 w-5" /></div><span className="text-lg font-semibold tracking-tight">Murshid AI</span></a>
          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex"><a href="#platform" className="hover:text-white">{t("landing.nav.platform")}</a><a href="#roadmap" className="hover:text-white">{t("landing.nav.roadmap")}</a><a href="#campus" className="hover:text-white">{t("landing.nav.campus")}</a></div>
          <div className="flex items-center gap-3"><button onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-slate-200 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/12 hover:text-white"><Globe2 className="h-4 w-4 text-cyan-200 transition group-hover:rotate-12" />{language === "en" ? t("common.arabic") : t("common.english")}</button><Button asChild className="rounded-full bg-white text-slate-950 hover:bg-cyan-100"><a href="/login">{t("landing.nav.enterApp")}</a></Button></div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-36 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-44">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.12 }} className="text-center lg:text-left">
          <motion.div variants={fadeUp} className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 lg:mx-0"><Stars className="h-4 w-4" />{t("landing.hero.eyebrow")}</motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-8xl">{t("landing.hero.title")}</motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 lg:mx-0">{t("landing.hero.subtitle")}</motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"><Button asChild size="lg" className="group h-14 rounded-full bg-cyan-300 px-8 text-base font-semibold text-slate-950 shadow-[0_0_50px_rgba(103,232,249,.34)] hover:bg-white"><a href="/register">{t("landing.hero.cta")}<ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" /></a></Button><a href="#platform" className="flex h-14 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-base text-white backdrop-blur-xl transition hover:bg-white/10">{t("landing.hero.secondary")}<ChevronRight className="h-4 w-4" /></a></motion.div>
          <motion.div variants={fadeUp} className="mt-10 grid grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">{[[98, "%", "faster answers"], [24, "/7", "AI guidance"], [12, "k+", "plans analyzed"]].map(([value, suffix, label]) => <div key={label} className="rounded-2xl bg-white/[0.04] p-4"><p className="text-2xl font-semibold text-white"><AnimatedCounter value={Number(value)} suffix={String(suffix)} /></p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}</motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}><StudentJourneyIllustration /></motion.div>
      </section>

      <section id="platform" className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-120px" }} transition={{ staggerChildren: 0.1 }} className="mb-12 max-w-3xl"><motion.p variants={fadeUp} className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-200">Platform intelligence</motion.p><motion.h2 variants={fadeUp} className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">A bento system built around every academic decision.</motion.h2></motion.div>
        <div className="grid gap-4 md:grid-cols-3">{bento.map(item => { const Icon = item.icon; return <motion.div key={item.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -6, scale: 1.01 }} className={`group relative min-h-64 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 backdrop-blur-2xl ${item.className}`}><div className="absolute inset-0 bg-gradient-to-br from-cyan-300/0 via-white/0 to-fuchsia-400/0 transition duration-500 group-hover:from-cyan-300/10 group-hover:to-fuchsia-400/10" /><Icon className="relative h-8 w-8 text-cyan-200" /><h3 className="relative mt-8 text-2xl font-semibold tracking-tight">{item.title}</h3><p className="relative mt-3 max-w-xl text-sm leading-7 text-slate-300">{item.text}</p><Orbit className="absolute -bottom-10 -right-8 h-40 w-40 text-white/[0.04]" /></motion.div>; })}</div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-2xl"><MessageSquareText className="h-10 w-10 text-cyan-200" /><h2 className="mt-8 text-4xl font-semibold tracking-[-0.04em]">Live AI advising that feels instant.</h2><p className="mt-4 text-slate-300">The assistant reasons across your academic record, recommends next actions, and explains tradeoffs in plain language.</p></motion.div><motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><LiveConversation /></motion.div></section>

      <section id="roadmap" className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-sm font-medium uppercase tracking-[0.35em] text-fuchsia-200">Graduation roadmap</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">From first question to final audit.</h2></div><div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 backdrop-blur-xl">Interactive planning timeline</div></div><div className="grid gap-4 lg:grid-cols-4">{roadmap.map(([title, text, date], index) => <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} whileHover={{ y: -8 }} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-2xl"><div className="mb-8 flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950">{index + 1}</span><span className="text-sm text-cyan-200">{date}</span></div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{text}</p><div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300" /></motion.div>)}</div></section>

      <section id="campus" className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 py-20 lg:grid-cols-[1fr_1.1fr] lg:px-8"><motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-2xl"><Map className="h-10 w-10 text-emerald-200" /><h2 className="mt-8 text-4xl font-semibold tracking-[-0.04em]">Campus navigation preview.</h2><p className="mt-4 text-slate-300">Guide students from classroom to advising office with intelligent routes, live context, and location-aware assistance.</p><div className="mt-8 grid gap-3">{["Engineering Building", "Advisor Office B-214", "AI Lab", "Student Services"].map(place => <div key={place} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"><span className="flex items-center gap-3 text-sm text-slate-200"><LocateFixed className="h-4 w-4 text-emerald-200" />{place}</span><CheckCircle2 className="h-4 w-4 text-cyan-200" /></div>)}</div></motion.div><motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative min-h-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,.24),transparent_26%),radial-gradient(circle_at_70%_60%,rgba(14,165,233,.22),transparent_30%),#050816] p-6 backdrop-blur-2xl"><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:44px_44px]" /><motion.div animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute h-5 w-5 rounded-full bg-cyan-200 shadow-[0_0_35px_rgba(103,232,249,.9)] [offset-path:path('M_60_340_C_160_160_270_300_370_110_C_430_50_500_120_520_210')]" /><svg className="absolute inset-0 h-full w-full" viewBox="0 0 580 440" fill="none"><path d="M60 340C160 160 270 300 370 110C430 50 500 120 520 210" stroke="url(#route)" strokeWidth="3" strokeDasharray="8 10" /><defs><linearGradient id="route" x1="60" y1="340" x2="520" y2="210"><stop stopColor="#67e8f9" /><stop offset="1" stopColor="#86efac" /></linearGradient></defs></svg><div className="relative flex h-full flex-col justify-between"><div className="ml-auto w-fit rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl"><Navigation className="mb-2 h-5 w-5 text-cyan-200" /><p className="text-sm font-semibold">7 min route</p><p className="text-xs text-slate-300">Avoids construction zone</p></div><div className="w-fit rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl"><GraduationCap className="mb-2 h-5 w-5 text-emerald-200" /><p className="text-sm font-semibold">Advisor sync nearby</p><p className="text-xs text-slate-300">Office B-214</p></div></div></motion.div></section>

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-24 text-center lg:px-8"><motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-10 shadow-2xl backdrop-blur-2xl sm:p-16"><div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" /><CalendarCheck className="mx-auto h-12 w-12 text-cyan-200" /><h2 className="mt-8 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Make every student feel personally guided.</h2><p className="mx-auto mt-5 max-w-2xl text-slate-300">A premium AI academic experience that turns confusion into clarity from day one.</p><div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row"><Button asChild size="lg" className="h-14 rounded-full bg-white px-8 text-slate-950 hover:bg-cyan-100"><a href="/register">Launch Murshid<Zap className="ml-2 h-5 w-5" /></a></Button><Button asChild size="lg" variant="outline" className="h-14 rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10"><a href="/login">Sign in</a></Button></div></motion.div></section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8 text-center text-sm text-slate-500"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row"><p>© 2026 Murshid AI. Next-generation academic intelligence.</p><div className="flex items-center gap-4"><span className="flex items-center gap-2"><Languages className="h-4 w-4" /> Arabic + English</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure by design</span></div></div></footer>

      <motion.a href="/chat" animate={{ y: [0, -8, 0] }} transition={{ duration: 2.8, repeat: Infinity }} className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-300 text-slate-950 shadow-[0_0_60px_rgba(103,232,249,.55)]"><span className="absolute inset-0 rounded-full bg-cyan-300 opacity-40 blur-xl" /><span className="absolute inset-0 animate-ping rounded-full bg-cyan-300/40" /><Bot className="relative h-7 w-7" /></motion.a>
    </main>
  );
}

