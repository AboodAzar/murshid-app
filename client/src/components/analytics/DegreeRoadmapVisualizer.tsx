import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, BookOpen, AlertCircle, Sparkles, GraduationCap, ChevronRight, ArrowRight, Layers } from "lucide-react";

interface CourseItem {
  code: string;
  name: string;
  nameAr: string;
  credits: number;
  status: "completed" | "in_progress" | "retake" | "planned";
  grade?: string;
  prereq?: string;
}

interface SemesterData {
  semesterNumber: number;
  yearName: string;
  yearNameAr: string;
  term: string;
  termAr: string;
  isCurrent?: boolean;
  courses: CourseItem[];
}

const FULL_DEGREE_ROADMAP: SemesterData[] = [
  // Year 1 - Semester 1 (Completed)
  {
    semesterNumber: 1,
    yearName: "Year 1 (Freshman)",
    yearNameAr: "السنة الأولى",
    term: "Fall 2025/2026",
    termAr: "الفصل الأول 2025/2026",
    courses: [
      { code: "CS101", name: "Introduction to Computing", nameAr: "مقدمة في الحوسبة", credits: 3, status: "completed", grade: "A" },
      { code: "MATH101", name: "Calculus I", nameAr: "تفاضل وتكامل (1)", credits: 3, status: "completed", grade: "B+" },
      { code: "ENG101", name: "English Composition", nameAr: "لغة إنجليزية استدراكية", credits: 3, status: "completed", grade: "A-" },
      { code: "PHYS101", name: "General Physics I", nameAr: "فيزياء عامة (1)", credits: 3, status: "completed", grade: "B" },
    ],
  },
  // Year 1 - Semester 2
  {
    semesterNumber: 2,
    yearName: "Year 1 (Freshman)",
    yearNameAr: "السنة الأولى",
    term: "Spring 2025/2026",
    termAr: "الفصل الثاني 2025/2026",
    courses: [
      { code: "CS102", name: "Programming Fundamentals", nameAr: "أساسيات البرمجة", credits: 3, status: "completed", grade: "C+", prereq: "CS101" },
      { code: "MATH102", name: "Calculus II", nameAr: "تفاضل وتكامل (2)", credits: 3, status: "retake", grade: "F", prereq: "MATH101" },
    ],
  },
  // Year 2 - Semester 3 (Current)
  {
    semesterNumber: 3,
    yearName: "Year 2 (Sophomore)",
    yearNameAr: "السنة الثانية",
    term: "Fall 2026/2027 (Current)",
    termAr: "الفصل الحالي الأول 2026/2027",
    isCurrent: true,
    courses: [
      { code: "CS201", name: "Data Structures", nameAr: "تراكيب البيانات", credits: 3, status: "in_progress", prereq: "CS102" },
      { code: "CS202", name: "Object Oriented Programming", nameAr: "البرمجة كائنية التوجه", credits: 3, status: "in_progress", prereq: "CS102" },
      { code: "PHYS102", name: "General Physics II", nameAr: "فيزياء عامة (2)", credits: 3, status: "in_progress", prereq: "PHYS101" },
      { code: "ENG102", name: "Technical Writing", nameAr: "الكتابة الفنية والمهنية", credits: 3, status: "in_progress", prereq: "ENG101" },
      { code: "MATH102", name: "Calculus II (Retake)", nameAr: "إعادة تفاضل وتكامل (2)", credits: 3, status: "retake", prereq: "MATH101" },
    ],
  },
  // Year 2 - Semester 4 (Upcoming)
  {
    semesterNumber: 4,
    yearName: "Year 2 (Sophomore)",
    yearNameAr: "السنة الثانية",
    term: "Spring 2026/2027",
    termAr: "الفصل القادم الثاني 2026/2027",
    courses: [
      { code: "CS341", name: "Design & Analysis of Algorithms", nameAr: "تصميم وتحليل الخوارزميات", credits: 3, status: "planned", prereq: "CS201" },
      { code: "CS310", name: "Database Systems", nameAr: "أنظمة قواعد البيانات", credits: 3, status: "planned", prereq: "CS201" },
      { code: "SE202", name: "Software Engineering Fundamentals", nameAr: "أساسيات هندسة البرمجيات", credits: 3, status: "planned", prereq: "CS202" },
      { code: "MATH201", name: "Linear Algebra & Discrete Structures", nameAr: "جبر خطي وتراكيب متقطعة", credits: 3, status: "planned", prereq: "MATH101" },
      { code: "ENG201", name: "Business Communication", nameAr: "الاتصال المهني وإدارة المشاريع", credits: 3, status: "planned" },
    ],
  },
  // Year 3 - Semester 5 (Upcoming)
  {
    semesterNumber: 5,
    yearName: "Year 3 (Junior)",
    yearNameAr: "السنة الثالثة",
    term: "Fall 2027/2028",
    termAr: "الفصل الأول 2027/2028",
    courses: [
      { code: "CS320", name: "Operating Systems", nameAr: "أنظمة التشغيل", credits: 3, status: "planned", prereq: "CS201" },
      { code: "CS350", name: "Computer Networks & Protocols", nameAr: "شبكات الحاسوب والبروتوكولات", credits: 3, status: "planned" },
      { code: "AI301", name: "Introduction to Artificial Intelligence", nameAr: "مدخل إلى الذكاء الاصطناعي", credits: 3, status: "planned", prereq: "CS341" },
      { code: "CS330", name: "Web Systems & Full-Stack Development", nameAr: "تطوير تطبيقات الويب والسحاب", credits: 3, status: "planned", prereq: "CS310" },
    ],
  },
  // Year 3 - Semester 6 (Upcoming)
  {
    semesterNumber: 6,
    yearName: "Year 3 (Junior)",
    yearNameAr: "السنة الثالثة",
    term: "Spring 2027/2028",
    termAr: "الفصل الثاني 2027/2028",
    courses: [
      { code: "CS360", name: "Mobile Application Development", nameAr: "تطوير تطبيقات الهواتف الذكية", credits: 3, status: "planned", prereq: "CS202" },
      { code: "CS370", name: "Software Architecture & Design Patterns", nameAr: "معمارية البرمجيات وأنماط التصميم", credits: 3, status: "planned", prereq: "SE202" },
      { code: "STAT201", name: "Probability & Statistics for CS", nameAr: "الاحتمالات والإحصاء لعلوم الحاسوب", credits: 3, status: "planned" },
      { code: "CS390", name: "Field Training Preparation", nameAr: "التأهيل للتدريب الميداني", credits: 1, status: "planned" },
    ],
  },
  // Year 4 - Semester 7 (Upcoming)
  {
    semesterNumber: 7,
    yearName: "Year 4 (Senior)",
    yearNameAr: "السنة الرابعة",
    term: "Fall 2028/2029",
    termAr: "الفصل الأول 2028/2029",
    courses: [
      { code: "CS491", name: "Graduation Capstone Project I", nameAr: "مشروع التخرج (1)", credits: 3, status: "planned", prereq: "Completed 90+ Credits" },
      { code: "CS480", name: "Field Training (12 Weeks Industry)", nameAr: "التدريب الميداني المعتمد", credits: 6, status: "planned", prereq: "Completed 90+ Credits" },
      { code: "CS430", name: "Distributed Systems & Cloud Computing", nameAr: "الأنظمة الموزعة والحوسبة السحابية", credits: 3, status: "planned", prereq: "CS320" },
    ],
  },
  // Year 4 - Semester 8 (Upcoming)
  {
    semesterNumber: 8,
    yearName: "Year 4 (Senior)",
    yearNameAr: "السنة الرابعة",
    term: "Spring 2028/2029",
    termAr: "الفصل الثاني 2028/2029",
    courses: [
      { code: "CS492", name: "Graduation Capstone Project II", nameAr: "مشروع التخرج (2)", credits: 3, status: "planned", prereq: "CS491" },
      { code: "CS470", name: "Cybersecurity & Ethical Hacking", nameAr: "الأمن السيبراني والاختراق الأخلاقي", credits: 3, status: "planned", prereq: "CS350" },
      { code: "CS499", name: "Comprehensive Degree Portfolio & Viva", nameAr: "امتحان الكفاءة الجامعية والمحفظة", credits: 3, status: "planned" },
    ],
  },
];

export function DegreeRoadmapVisualizer({ language = "en" }: { language?: "en" | "ar" }) {
  const isAr = language === "ar";
  const [filterMode, setFilterMode] = useState<"all" | "completed" | "current" | "upcoming">("all");

  const completedCount = 5; // CS101, MATH101, ENG101, PHYS101, CS102
  const inProgressCount = 5; // CS201, CS202, PHYS102, ENG102, MATH102
  const plannedCount = 20;

  const totalCredits = 133;
  const completedCredits = 15; // 5 courses * 3 cr
  const inProgressCredits = 15; // 5 courses * 3 cr
  const remainingCredits = totalCredits - completedCredits - inProgressCredits;

  const filteredSemesters = FULL_DEGREE_ROADMAP.filter(sem => {
    if (filterMode === "completed") return sem.semesterNumber <= 2;
    if (filterMode === "current") return sem.semesterNumber === 3;
    if (filterMode === "upcoming") return sem.semesterNumber >= 4;
    return true;
  });

  return (
    <Card className="bg-card border-border backdrop-blur-2xl shadow-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
                <span>{isAr ? "خارطة المقررات الكاملة (مع شطب المواد المنجزة)" : "Full Degree Courses Roadmap & Upcoming Semesters"}</span>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 text-[10px]">
                  133 Cr Total
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "المواد المنجزة مشطوبة بصرياً (Crossed Out) مع استعراض الفصول القادمة والمواد المتبقية للتخرج"
                  : "Completed courses are crossed out with grade badges; upcoming semesters are organized chronologically with prerequisites."}
              </CardDescription>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-border overflow-x-auto text-xs">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterMode === "all" ? "bg-violet-600 text-white shadow" : "text-muted-foreground hover:text-white"}`}
            >
              {isAr ? "جميع الفصول (8)" : "All Semesters (8)"}
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterMode === "completed" ? "bg-emerald-600 text-white shadow" : "text-muted-foreground hover:text-white"}`}
            >
              {isAr ? "المواد المنجزة (مشطوبة)" : "Finished (Crossed Out)"}
            </button>
            <button
              onClick={() => setFilterMode("current")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterMode === "current" ? "bg-blue-600 text-white shadow" : "text-muted-foreground hover:text-white"}`}
            >
              {isAr ? "الفصل الحالي (قيد الدراسة)" : "Current (In Progress)"}
            </button>
            <button
              onClick={() => setFilterMode("upcoming")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterMode === "upcoming" ? "bg-amber-600 text-white shadow" : "text-muted-foreground hover:text-white"}`}
            >
              {isAr ? "الفصول القادمة (4 - 8)" : "Upcoming (Sem 4-8)"}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Progress Bar with Crossed Out Legend */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-border space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? "المواد المنجزة المشطوبة:" : "Finished & Crossed Out:"} <s>{completedCredits} Cr</s> ({Math.round((completedCredits/totalCredits)*100)}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{isAr ? "قيد الدراسة حالياً:" : "In Progress:"} {inProgressCredits} Cr</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-mono">
              <span>{isAr ? "المتبقي للتخرج:" : "Remaining:"} {remainingCredits} Cr / {totalCredits} Cr</span>
            </span>
          </div>

          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-border/50">
            <div style={{ width: `${(completedCredits/totalCredits)*100}%` }} className="bg-emerald-500 h-full" title="Finished" />
            <div style={{ width: `${(inProgressCredits/totalCredits)*100}%` }} className="bg-blue-500 h-full animate-pulse" title="In Progress" />
            <div style={{ width: `${(remainingCredits/totalCredits)*100}%` }} className="bg-slate-800 h-full" title="Remaining Planned" />
          </div>
        </div>

        {/* Semesters Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSemesters.map((sem) => (
            <div
              key={sem.semesterNumber}
              className={`p-4 rounded-2xl border transition-all ${
                sem.isCurrent
                  ? "bg-gradient-to-br from-blue-950/40 via-card to-card border-blue-500/50 shadow-lg ring-1 ring-blue-500/30"
                  : sem.semesterNumber <= 2
                  ? "bg-card/70 border-emerald-500/20"
                  : "bg-card/50 border-border"
              }`}
            >
              {/* Semester Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      sem.isCurrent
                        ? "bg-blue-500 text-slate-950"
                        : sem.semesterNumber <= 2
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {sem.semesterNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {isAr ? sem.termAr : sem.term}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">{isAr ? sem.yearNameAr : sem.yearName}</p>
                  </div>
                </div>

                {sem.isCurrent ? (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] animate-pulse">
                    ⚡ {isAr ? "الفصل الحالي" : "Current Term"}
                  </Badge>
                ) : sem.semesterNumber <= 2 ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px]">
                    ✓ {isAr ? "تم إنجازه" : "Passed"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 text-[10px]">
                    {isAr ? "مخطط قادم" : "Upcoming"}
                  </Badge>
                )}
              </div>

              {/* Courses List */}
              <div className="space-y-2 mt-3">
                {sem.courses.map((course, cIdx) => {
                  const isDone = course.status === "completed";
                  const isCurrent = course.status === "in_progress";
                  const isRetake = course.status === "retake";

                  return (
                    <div
                      key={cIdx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                        isDone
                          ? "bg-emerald-950/20 border-emerald-500/25 opacity-75 hover:opacity-100"
                          : isCurrent
                          ? "bg-blue-950/30 border-blue-500/40 shadow-sm"
                          : isRetake
                          ? "bg-amber-950/30 border-amber-500/40"
                          : "bg-white/[0.03] border-border hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                        ) : isRetake ? (
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-mono font-bold text-xs ${isDone ? "line-through text-slate-400" : "text-white"}`}>
                              {course.code}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">({course.credits} Cr)</span>
                          </div>
                          <p className={`text-[11px] truncate ${isDone ? "line-through text-slate-400 font-medium" : "text-slate-200"}`}>
                            {isAr ? course.nameAr : course.name}
                          </p>
                          {course.prereq && (
                            <p className="text-[9px] text-amber-300/80 font-mono">
                              Prereq: {course.prereq}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isDone && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-mono">
                            ✓ Passed ({course.grade})
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[9px] font-mono">
                            In Progress
                          </Badge>
                        )}
                        {isRetake && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] font-mono">
                            Retake (F)
                          </Badge>
                        )}
                        {course.status === "planned" && (
                          <Badge variant="outline" className="border-border text-muted-foreground text-[9px] font-mono">
                            Planned
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
