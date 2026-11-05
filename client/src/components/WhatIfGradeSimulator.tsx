import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Sparkles, TrendingUp, Target, Award, Info, RefreshCw, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { formatZujCourseCode, formatGpaDisplay } from "@/lib/academicUtils";

interface WhatIfGradeSimulatorProps {
  courses: Array<{
    id: number;
    code?: string | null;
    name?: string | null;
    nameAr?: string | null;
    credits?: number | null;
    grade?: string | number | null;
    gradePoints?: number | string | null;
  }>;
  currentGpa: string | number;
  totalCredits?: number;
}

export default function WhatIfGradeSimulator({
  courses,
  currentGpa,
  totalCredits = 133,
}: WhatIfGradeSimulatorProps) {
  const { dir } = useI18n();
  const isRtl = dir === "rtl";

  // Select first course by default
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(() => {
    return courses[0]?.code || "CS201";
  });

  const selectedCourse = useMemo(() => {
    const found = courses.find((c) => (c.code || "") === selectedCourseCode) || courses[0];
    return {
      code: found?.code || "CS201",
      name: found?.name || "Data Structures",
      nameAr: found?.nameAr || "تراكيب البيانات",
      credits: found?.credits || 3,
      grade: found?.grade || "84.00",
    };
  }, [courses, selectedCourseCode]);

  // Assessment sliders (Weights: Coursework 30%, Midterm 30%, Final 40% = 100%)
  const [courseworkScore, setCourseworkScore] = useState<number>(27); // out of 30
  const [midtermScore, setMidtermScore] = useState<number>(26); // out of 30
  const [finalScore, setFinalScore] = useState<number>(35); // out of 40
  const [targetGoal, setTargetGoal] = useState<number>(90); // Target % desired

  // Calculations
  const projectedTotal = Math.min(100, Math.max(0, courseworkScore + midtermScore + finalScore));

  // Determine letter grade & ZUJ scale equivalent
  const gradeInfo = useMemo(() => {
    if (projectedTotal >= 90) return { letter: "A", letterAr: "أ", gpa: 4.0, rating: "Excellent", ratingAr: "ممتاز", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40" };
    if (projectedTotal >= 85) return { letter: "A-", letterAr: "أ-", gpa: 3.75, rating: "Very Good", ratingAr: "جيد جداً مرتفع", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40" };
    if (projectedTotal >= 80) return { letter: "B+", letterAr: "ب+", gpa: 3.5, rating: "Very Good", ratingAr: "جيد جداً", color: "text-teal-400 bg-teal-500/20 border-teal-500/40" };
    if (projectedTotal >= 75) return { letter: "B", letterAr: "ب", gpa: 3.0, rating: "Good", ratingAr: "جيد مرتفع", color: "text-blue-400 bg-blue-500/20 border-blue-500/40" };
    if (projectedTotal >= 70) return { letter: "C+", letterAr: "جـ+", gpa: 2.5, rating: "Satisfactory", ratingAr: "جيد", color: "text-amber-400 bg-amber-500/20 border-amber-500/40" };
    if (projectedTotal >= 60) return { letter: "C", letterAr: "جـ", gpa: 2.0, rating: "Pass", ratingAr: "مقبول", color: "text-orange-400 bg-orange-500/20 border-orange-500/40" };
    if (projectedTotal >= 50) return { letter: "D", letterAr: "د", gpa: 1.5, rating: "Weak Pass", ratingAr: "ضعيف", color: "text-rose-400 bg-rose-500/20 border-rose-500/40" };
    return { letter: "F", letterAr: "هـ", gpa: 0.0, rating: "Fail", ratingAr: "راسب", color: "text-rose-500 bg-rose-950 border-rose-600" };
  }, [projectedTotal]);

  // What is required on the final exam to reach targetGoal?
  const requiredFinal = useMemo(() => {
    const currentAccrued = courseworkScore + midtermScore;
    const needed = targetGoal - currentAccrued;
    return Math.max(0, Math.min(40, needed));
  }, [courseworkScore, midtermScore, targetGoal]);

  // Projected Cumulative GPA delta (assuming 15 credit semester in progress)
  const currentGpaNum = parseFloat(String(currentGpa)) || 84.5;
  const projectedGpa = useMemo(() => {
    // 3 credit course impact on ~45 completed credits
    const courseCredits = selectedCourse.credits || 3;
    const completedCredits = 45;
    const currentPoints = currentGpaNum * completedCredits;
    const newPoints = currentPoints + (projectedTotal - currentGpaNum) * (courseCredits / (completedCredits + courseCredits));
    const newGpa = currentGpaNum + ((projectedTotal - currentGpaNum) * courseCredits) / (completedCredits + courseCredits);
    return Math.min(100, Math.max(0, parseFloat(newGpa.toFixed(2))));
  }, [currentGpaNum, projectedTotal, selectedCourse]);

  const gpaDelta = (projectedGpa - currentGpaNum).toFixed(2);
  const isPositiveDelta = parseFloat(gpaDelta) >= 0;

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-900/90 p-5 md:p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white">
                {isRtl ? "محاكي المعدل التقديري (What-If Grade Simulator)" : "What-If Grade Simulator"}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Canvas & Ivy-League Pattern
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl
                ? "اختبر درجاتك التقديرية في الامتحانات القادمة واعرف تأثيرها اللحظي على معدلك التراكمي"
                : "Simulate hypothetical scores on upcoming exams to calculate your projected course score and cumulative GPA"}
            </p>
          </div>
        </div>

        {/* Course Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">{isRtl ? "المساق:" : "Course:"}</span>
          <select
            value={selectedCourseCode}
            onChange={(e) => setSelectedCourseCode(e.target.value)}
            className="bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {courses.length > 0 ? (
              courses.map((c) => (
                <option key={c.code || c.id} value={c.code || `C-${c.id}`}>
                  {formatZujCourseCode(c.code)} - {isRtl ? c.nameAr || c.name : c.name}
                </option>
              ))
            ) : (
              <>
                <option value="CS201">CS201 - Data Structures (تراكيب البيانات)</option>
                <option value="CS202">CS202 - Object Oriented Programming</option>
                <option value="ENG102">ENG102 - English Communication Skills</option>
                <option value="PHYS102">PHYS102 - General Physics II</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left / Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>{isRtl ? "توزيع علامات المساق التقديرية (100%)" : "Course Weighting Inputs (100%)"}</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">
                {selectedCourse.credits} {isRtl ? "ساعات معتمدة" : "Credits"}
              </span>
            </h4>

            {/* Assessment 1: Coursework */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  {isRtl ? "الأعمال الفصلية والواجبات والمختبر (30 علامة)" : "Coursework & Lab (30 pts)"}
                </span>
                <span className="font-mono font-bold text-emerald-400">{courseworkScore} / 30</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={courseworkScore}
                onChange={(e) => setCourseworkScore(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>

            {/* Assessment 2: Midterm */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  {isRtl ? "امتحان منتصف الفصل (30 علامة)" : "Midterm Examination (30 pts)"}
                </span>
                <span className="font-mono font-bold text-emerald-400">{midtermScore} / 30</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={midtermScore}
                onChange={(e) => setMidtermScore(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>

            {/* Assessment 3: Final Exam */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  {isRtl ? "الامتحان النهائي الشامل (40 علامة)" : "Final Comprehensive Exam (40 pts)"}
                </span>
                <span className="font-mono font-bold text-emerald-400">{finalScore} / 40</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={finalScore}
                onChange={(e) => setFinalScore(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0</span>
                <span>20</span>
                <span>40</span>
              </div>
            </div>
          </div>

          {/* Target Goal Seeker */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Target className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  {isRtl ? "حاسبة الهدف الذكي (Goal Seeker)" : "Target Grade Goal Seeker"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isRtl
                    ? `لتحقيق معدل ${targetGoal}%، تحتاج إلى:`
                    : `To secure ${targetGoal}% overall, you need:`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                className="bg-slate-950 border border-white/20 rounded-lg px-2 py-1 text-xs text-white font-bold"
              >
                <option value={95}>95% (A+ / أ+)</option>
                <option value={90}>90% (A / أ)</option>
                <option value={85}>85% (A- / أ-)</option>
                <option value={80}>80% (B+ / ب+)</option>
                <option value={75}>75% (B / ب)</option>
                <option value={60}>60% (Pass / نجاح)</option>
              </select>

              <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 font-mono font-bold text-xs text-emerald-300">
                {requiredFinal <= 40 ? `${requiredFinal} / 40` : `${isRtl ? "غير متاح" : "Maxed Out"}`}
              </div>
            </div>
          </div>
        </div>

        {/* Right / Live Projections Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isRtl ? "النتيجة التقديرية للمساق" : "Projected Course Score"}
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${gradeInfo.color}`}>
                {isRtl ? gradeInfo.letterAr : gradeInfo.letter} • {isRtl ? gradeInfo.ratingAr : gradeInfo.rating}
              </span>
            </div>

            {/* Score in 100% */}
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-5xl font-black text-white font-mono tracking-tight">
                  {projectedTotal}
                  <span className="text-lg text-emerald-400 font-bold ml-1">/ 100%</span>
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {isRtl ? "المكافئ النقطي:" : "Point Equivalent:"} <strong className="text-white">{gradeInfo.gpa.toFixed(2)}</strong> / 4.00
                </p>
              </div>

              {/* Progress Dial indicator */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center font-bold text-emerald-300">
                <span className="text-xl">{gradeInfo.letter}</span>
                <span className="text-[9px] uppercase font-mono">{gradeInfo.gpa} GPA</span>
              </div>
            </div>

            {/* Impact on Cumulative GPA */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{isRtl ? "الأثر على المعدل التراكمي الإجمالي:" : "Cumulative GPA Impact:"}</span>
              </span>

              <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">{isRtl ? "المعدل الحالي" : "Current"}</span>
                  <span className="text-sm font-bold text-white">{currentGpaNum.toFixed(2)}%</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">{isRtl ? "التغيير المتوقع" : "Shift"}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPositiveDelta ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                    {isPositiveDelta ? `+${gpaDelta}%` : `${gpaDelta}%`}
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-emerald-400 block font-bold">{isRtl ? "المعدل الجديد" : "Projected"}</span>
                  <span className="text-base font-extrabold text-emerald-300">{projectedGpa}%</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 leading-relaxed bg-white/5 p-2 rounded-xl">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {isRtl
                  ? "تُحسب النتائج استناداً لنظام التعليمات الجامعية رقم (1) لعام 2026 في جامعة الزيتونة الأردنية."
                  : "Calculation strictly adheres to ZUJ Article 9 Grading Bylaws on continuous 100% scale."}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
