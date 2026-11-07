import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, BookOpen, MapPin, User, Calendar, Sparkles } from "lucide-react";

interface ScheduleItem {
  id: string;
  type: "lecture" | "break";
  day: string;
  dayAr: string;
  startTime: string;
  endTime: string;
  startMinutes: number; // minutes from 08:00
  durationMinutes: number;
  title: string;
  titleAr: string;
  code?: string;
  location?: string;
  instructor?: string;
  modality?: string;
  color: string;
  breakRecommendation?: string;
  breakRecommendationAr?: string;
}

const SCHEDULE_DATA: ScheduleItem[] = [
  // Sunday
  {
    id: "sun-lec-1",
    type: "lecture",
    day: "Sunday",
    dayAr: "الأحد",
    startTime: "11:30",
    endTime: "12:20",
    startMinutes: 210, // 11:30 is 210 min from 08:00
    durationMinutes: 50,
    title: "Technical Writing",
    titleAr: "الكتابة الفنية",
    code: "ENG102",
    location: "Hall 39 (IT Building)",
    instructor: "Dr. Sara Mahmoud",
    modality: "Blended (مدمج)",
    color: "emerald",
  },
  {
    id: "sun-brk-1",
    type: "break",
    day: "Sunday",
    dayAr: "الأحد",
    startTime: "12:20",
    endTime: "14:00",
    startMinutes: 260,
    durationMinutes: 100,
    title: "Campus & Research Break",
    titleAr: "استراحة الحرم الجامعي والبحث",
    color: "amber",
    breakRecommendation: "Review technical report outline in IT Lab 9303; lunch at Student Union.",
    breakRecommendationAr: "مراجعة مسودة التقرير الفني بمختبر الحاسوب 9303 وتناول وجبة الغداء.",
  },

  // Tuesday
  {
    id: "tue-lec-1",
    type: "lecture",
    day: "Tuesday",
    dayAr: "الثلاثاء",
    startTime: "11:30",
    endTime: "12:20",
    startMinutes: 210,
    durationMinutes: 50,
    title: "Data Structures",
    titleAr: "تراكيب البيانات",
    code: "CS201",
    location: "Hall 41 (IT Building)",
    instructor: "Dr. Ahmad Khalil",
    modality: "In-Person (وجاهي)",
    color: "blue",
  },
  {
    id: "tue-brk-1",
    type: "break",
    day: "Tuesday",
    dayAr: "الثلاثاء",
    startTime: "12:20",
    endTime: "13:00",
    startMinutes: 260,
    durationMinutes: 40,
    title: "Campus Lunch & Walk Break",
    titleAr: "استراحة الغداء والمشي بالحرم الجامعي",
    color: "amber",
    breakRecommendation: "Active walk in university gardens + hydration before afternoon study.",
    breakRecommendationAr: "المشي في حدائق الجامعة وتناول وجبة صحية قبل جلسة المذاكرة المسائية.",
  },
  {
    id: "tue-brk-2",
    type: "break",
    day: "Tuesday",
    dayAr: "الثلاثاء",
    startTime: "13:00",
    endTime: "14:30",
    startMinutes: 300,
    durationMinutes: 90,
    title: "Library Focus & Practice Drill",
    titleAr: "جلسة تركيز بالمكتبة وتطبيق عملي",
    color: "amber",
    breakRecommendation: "Quiet study floor at ZUJ Central Library: solve 2 BST rotation problems.",
    breakRecommendationAr: "الدور الهادئ بمكتبة الزيتونة: حل مسألتين على دوران أشجار البحث AVL.",
  },

  // Wednesday
  {
    id: "wed-lec-1",
    type: "lecture",
    day: "Wednesday",
    dayAr: "الأربعاء",
    startTime: "08:30",
    endTime: "09:45",
    startMinutes: 30, // 08:30 is 30 min from 08:00
    durationMinutes: 75,
    title: "Object-Oriented Programming",
    titleAr: "البرمجة كائنية التوجه",
    code: "CS202",
    location: "Hall 42 (IT Building)",
    instructor: "Dr. Ahmad Khalil",
    modality: "In-Person (وجاهي)",
    color: "blue",
  },
  {
    id: "wed-brk-1",
    type: "break",
    day: "Wednesday",
    dayAr: "الأربعاء",
    startTime: "09:45",
    endTime: "11:30",
    startMinutes: 105,
    durationMinutes: 105,
    title: "1h 45m Library Study & Concept Review Break",
    titleAr: "استراحة مراجعة بالمكتبة (ساعة و 45 دقيقة)",
    color: "amber",
    breakRecommendation: "Master today's OOP Factory Pattern lecture notes while concept is fresh.",
    breakRecommendationAr: "تلخيص مخططات UML ومفاهيم Factory Pattern قبل أن تتشتت الأفكار.",
  },
  {
    id: "wed-brk-2",
    type: "break",
    day: "Wednesday",
    dayAr: "الأربعاء",
    startTime: "11:30",
    endTime: "12:45",
    startMinutes: 210,
    durationMinutes: 75,
    title: "Lunch & Academic Peer Exchange",
    titleAr: "استراحة الغداء والنقاش الطلابي",
    color: "amber",
    breakRecommendation: "Join study peers for lunch and discuss difficult physics concepts.",
    breakRecommendationAr: "لقاء زملاء الدراسة ومناقشة مسائل الفيزياء الصعبة قبل محاضرة فيزياء 2.",
  },
  {
    id: "wed-brk-3",
    type: "break",
    day: "Wednesday",
    dayAr: "الأربعاء",
    startTime: "12:45",
    endTime: "13:00",
    startMinutes: 285,
    durationMinutes: 15,
    title: "Hall Transition & Mental Reset",
    titleAr: "استراحة تنقل وتهيئة ذهنية",
    color: "amber",
    breakRecommendation: "Walk over to Hall 40 and prepare textbook formulas for Gauss's Law.",
    breakRecommendationAr: "الانتقال إلى قاعة 40 وتجهيز ملخص قوانين التدفق لقانون غاوس.",
  },
  {
    id: "wed-lec-2",
    type: "lecture",
    day: "Wednesday",
    dayAr: "الأربعاء",
    startTime: "13:00",
    endTime: "14:15",
    startMinutes: 300,
    durationMinutes: 75,
    title: "General Physics II (Electricity & Magnetism)",
    titleAr: "الفيزياء العامة (2) - الكهرباء والمغناطيسية",
    code: "PHYS102",
    location: "Hall 40 (Science Building)",
    instructor: "Dr. Omar Hassan",
    modality: "In-Person (وجاهي)",
    color: "rose",
  },
];

export function LectureBreakTimelineChart({ language = "en" }: { language?: "en" | "ar" }) {
  const [selectedDay, setSelectedDay] = useState<string>("Wednesday");

  const filteredItems = selectedDay === "All"
    ? SCHEDULE_DATA
    : SCHEDULE_DATA.filter(item => item.day === selectedDay);

  const totalLectureMinutes = filteredItems
    .filter(i => i.type === "lecture")
    .reduce((sum, i) => sum + i.durationMinutes, 0);

  const totalBreakMinutes = filteredItems
    .filter(i => i.type === "break")
    .reduce((sum, i) => sum + i.durationMinutes, 0);

  const totalMinutes = totalLectureMinutes + totalBreakMinutes || 1;
  const lectureRatio = Math.round((totalLectureMinutes / totalMinutes) * 100);
  const breakRatio = 100 - lectureRatio;

  return (
    <Card className="bg-card border-border backdrop-blur-2xl shadow-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
                <span>{language === "ar" ? "الجدول الزمني التفاعلي مع فترات الاستراحة" : "Lecture & Break Timeline Graph"}</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                  {language === "ar" ? "تحليل الفترات البينية" : "Campus Flow"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {language === "ar"
                  ? "رسم بياني زمني يوضح بدقة أوقات المحاضرات والاستراحات البينية للاستفادة منها في المراجعة والاسترجاع"
                  : "Visual schedule timeline highlighting lecture blocks alongside explicit productive breaks between classes."}
              </CardDescription>
            </div>
          </div>

          {/* Day Selector Buttons */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-border">
            {["Sunday", "Tuesday", "Wednesday"].map(day => (
              <Button
                key={day}
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDay(day)}
                className={`h-7 px-2.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedDay === day
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {day === "Sunday" ? (language === "ar" ? "الأحد" : "Sun") :
                 day === "Tuesday" ? (language === "ar" ? "الثلاثاء" : "Tue") :
                 (language === "ar" ? "الأربعاء" : "Wed")}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Proportional Balance Bar */}
        <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-border">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>{language === "ar" ? "وقت المحاضرات:" : "Lectures:"} {Math.floor(totalLectureMinutes / 60)}h {totalLectureMinutes % 60}m ({lectureRatio}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{language === "ar" ? "فترات الاستراحة:" : "Productive Breaks:"} {Math.floor(totalBreakMinutes / 60)}h {totalBreakMinutes % 60}m ({breakRatio}%)</span>
            </span>
          </div>
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-border/50">
            <div style={{ width: `${lectureRatio}%` }} className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500" title="Lecture time" />
            <div style={{ width: `${breakRatio}%` }} className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500" title="Break time" />
          </div>
        </div>

        {/* Chronological Timeline Blocks Graph */}
        <div className="space-y-3 relative before:absolute before:inset-0 before:start-[18px] sm:before:start-[22px] before:w-0.5 before:bg-border/60 before:z-0">
          {filteredItems.map((item) => {
            const isLec = item.type === "lecture";
            return (
              <div key={item.id} className="relative z-10 flex items-start gap-3 sm:gap-4 group">
                {/* Timeline Icon Badge */}
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-md transition-transform group-hover:scale-105 ${
                    isLec
                      ? "bg-blue-950/80 border-blue-500/40 text-blue-300"
                      : "bg-amber-950/80 border-amber-500/40 text-amber-300 animate-pulse"
                  }`}
                >
                  {isLec ? <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" /> : <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
                </div>

                {/* Content Block */}
                <div
                  className={`flex-1 p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isLec
                      ? "bg-card/90 border-blue-500/25 hover:border-blue-500/40 shadow-sm"
                      : "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1 border-b border-white/5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {item.startTime} – {item.endTime}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                        ({item.durationMinutes} min)
                      </span>
                      {isLec ? (
                        <Badge variant="outline" className="text-[10px] bg-blue-500/15 border-blue-500/30 text-blue-300 font-mono">
                          {item.code} • {item.modality}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/20 border-amber-500/40 text-amber-300 flex items-center gap-1 font-semibold">
                          <Coffee className="w-2.5 h-2.5" />
                          {language === "ar" ? "استراحة بين المحاضرات" : "Break Between Lectures"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{language === "ar" ? item.titleAr : item.title}</span>
                    </h4>

                    {isLec ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span>{item.location}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>{item.instructor}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                        <p className="font-semibold text-amber-300 flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3 h-3" />
                          {language === "ar" ? "توصية أوليفر للاستفادة من وقت الاستراحة:" : "Oliver's Productive Campus Recommendation:"}
                        </p>
                        <p className="text-[11px] text-amber-100/90 leading-relaxed">
                          {language === "ar" ? item.breakRecommendationAr : item.breakRecommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
