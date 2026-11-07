/**
 * Oliver AI Free-Time Availability Study Planner Engine
 * 
 * Takes a student's daily/evening availability (e.g. "21:00" - "23:00" / 9:00 PM - 11:00 PM),
 * work/daily commitments, enrolled courses, and pending/overdue assignments to construct
 * an actionable, realistic time-blocked study schedule.
 */

export interface FreeTimeInput {
  freeTimeStart: string; // e.g. "21:00"
  freeTimeEnd: string;   // e.g. "23:00"
  workScheduleNote?: string; // e.g. "Working daytime 9 AM - 5 PM"
  selectedCourseCodes?: string[]; // optional filter
  sessionStyle?: "pomodoro" | "deep_work" | "balanced";
  daysOfWeek?: string[]; // e.g. ["Sun", "Mon", "Tue", "Wed", "Thu"]
  language?: "ar" | "en";
}

export interface StudyTimeBlock {
  timeRange: string; // e.g. "21:00 - 21:50"
  durationMinutes: number;
  courseCode: string;
  courseName: string;
  isBreak?: boolean;
  topic: string;
  topicAr: string;
  taskType: "assignment_work" | "concept_mastery" | "problem_drill" | "active_recall_break" | "exam_prep";
  notes: string;
  notesAr: string;
}

export interface DayStudyPlan {
  dayName: string; // e.g. "Sunday"
  dayNameAr: string; // e.g. "الأحد"
  focusSummary: string;
  focusSummaryAr: string;
  blocks: StudyTimeBlock[];
}

export interface GeneratedFreeTimePlan {
  studentName?: string;
  freeTimeWindow: string; // e.g. "9:00 PM - 11:00 PM (21:00 - 23:00)"
  dailyAvailableMinutes: number;
  weeklyTotalHours: number;
  workScheduleContext: string;
  sessionStyle: string;
  days: DayStudyPlan[];
  wellnessAdvice: string;
  wellnessAdviceAr: string;
}

/**
 * Parses time string like "21:00", "9:00 PM", "9 PM", "23:30" into total minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 21 * 60; // default 9 PM
  const clean = timeStr.trim().toLowerCase();

  // Check 12-hour AM/PM format
  const isPM = clean.includes("pm") || clean.includes("م");
  const isAM = clean.includes("am") || clean.includes("ص");
  const digits = clean.replace(/[^0-9:]/g, "");
  const parts = digits.split(":");
  let hours = parseInt(parts[0] || "21", 10);
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into 24h & 12h readable string e.g. "21:00 (9:00 PM)"
 */
export function formatMinutesToTime(mins: number): string {
  const norm = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const hh = h < 10 ? `0${h}` : `${h}`;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${mm}`;
}

/**
 * Core generator that synthesizes the daily schedule tailored to the student's exact free-time window.
 */
export function buildFreeTimePlan(params: {
  input: FreeTimeInput;
  studentContext: {
    name?: string;
    courses: Array<{ code: string; name: string; credits?: number }>;
    assignments: Array<{ title: string; courseCode?: string; dueDate?: string | Date; status?: string }>;
  };
}): GeneratedFreeTimePlan {
  const startMins = parseTimeToMinutes(params.input.freeTimeStart || "21:00");
  let endMins = parseTimeToMinutes(params.input.freeTimeEnd || "23:00");

  // Handle wrap-around midnight if needed (e.g. 22:00 to 01:00)
  if (endMins <= startMins) {
    endMins += 1440;
  }

  const dailyMinutes = endMins - startMins; // e.g. 120 minutes for 9 PM - 11 PM
  const daysList = params.input.daysOfWeek && params.input.daysOfWeek.length > 0
    ? params.input.daysOfWeek
    : ["Sun", "Mon", "Tue", "Wed", "Thu"];
  
  const weeklyTotalHours = Math.round(((dailyMinutes * daysList.length) / 60) * 10) / 10;

  const rawCourses = params.studentContext.courses.length > 0
    ? params.studentContext.courses
    : [
        { code: "CS201", name: "Data Structures", credits: 3 },
        { code: "CS202", name: "Object Oriented Programming", credits: 3 },
        { code: "PHYS102", name: "General Physics II", credits: 3 },
        { code: "ENG102", name: "Technical Writing", credits: 3 },
      ];

  // Filter if student selected specific courses
  const filteredCourses = params.input.selectedCourseCodes && params.input.selectedCourseCodes.length > 0
    ? rawCourses.filter(c => params.input.selectedCourseCodes!.includes(c.code))
    : rawCourses;

  const activeCourses = filteredCourses.length > 0 ? filteredCourses : rawCourses;

  // Pending and overdue assignments
  const pendingOrOverdue = (params.studentContext.assignments || []).filter(
    a => a.status === "pending" || a.status === "overdue"
  );

  const daysData: DayStudyPlan[] = [];

  const dayMeta = [
    { code: "Sun", en: "Sunday", ar: "الأحد" },
    { code: "Mon", en: "Monday", ar: "الإثنين" },
    { code: "Tue", en: "Tuesday", ar: "الثلاثاء" },
    { code: "Wed", en: "Wednesday", ar: "الأربعاء" },
    { code: "Thu", en: "Thursday", ar: "الخميس" },
    { code: "Fri", en: "Friday", ar: "الجمعة" },
    { code: "Sat", en: "Saturday", ar: "السبت" },
  ];

  // Divide available daily minutes into 2 distinct focus blocks + 1 active recall break
  // E.g. for 120 mins: Block 1 = 50m, Break = 15m, Block 2 = 55m
  const block1Duration = Math.round(dailyMinutes * 0.42); // ~50m
  const breakDuration = Math.min(15, Math.max(10, Math.round(dailyMinutes * 0.12))); // ~10-15m
  const block2Duration = dailyMinutes - block1Duration - breakDuration; // ~55m

  for (let i = 0; i < daysList.length; i++) {
    const dayKey = daysList[i];
    const meta = dayMeta.find(d => d.code === dayKey || d.en.toLowerCase().startsWith(dayKey.toLowerCase())) || {
      code: dayKey,
      en: dayKey,
      ar: dayKey,
    };

    const course1 = activeCourses[i % activeCourses.length];
    const course2 = activeCourses[(i + 1) % activeCourses.length];

    const t1Start = startMins;
    const t1End = t1Start + block1Duration;
    const tBreakStart = t1End;
    const tBreakEnd = tBreakStart + breakDuration;
    const t2Start = tBreakEnd;
    const t2End = endMins;

    const b1Range = `${formatMinutesToTime(t1Start)} - ${formatMinutesToTime(t1End)}`;
    const bBreakRange = `${formatMinutesToTime(tBreakStart)} - ${formatMinutesToTime(tBreakEnd)}`;
    const b2Range = `${formatMinutesToTime(t2Start)} - ${formatMinutesToTime(t2End)}`;

    // Check if there is an assignment associated with course1 or course2
    const asgn1 = pendingOrOverdue.find(a => a.courseCode === course1.code);
    const asgn2 = pendingOrOverdue.find(a => a.courseCode === course2.code);

    const blocks: StudyTimeBlock[] = [
      {
        timeRange: b1Range,
        durationMinutes: block1Duration,
        courseCode: course1.code,
        courseName: course1.name,
        topic: asgn1 ? `Assignment Work: ${asgn1.title}` : `Core Mastery: ${course1.name} Foundations & Problem Sets`,
        topicAr: asgn1 ? `إنجاز واجب المادة: ${asgn1.title}` : `التمكن من مفاهيم ${course1.name} وحل تمارين تطبيقية`,
        taskType: asgn1 ? "assignment_work" : "concept_mastery",
        notes: "Deep focus session without phone distractions. Apply the Feynman technique.",
        notesAr: "جلسة تركيز عميق مع إغلاق الإشعارات. تطبيق تقنية فاينمان لشرح المفهوم بأسلوبك.",
      },
      {
        timeRange: bBreakRange,
        durationMinutes: breakDuration,
        courseCode: "RECOVERY",
        courseName: "Cognitive Active Recall Break",
        isBreak: true,
        topic: "Mindful rest & memory consolidation",
        topicAr: "استراحة ذهنية وترسيخ للمعلومات بالاسترجاع النشط",
        taskType: "active_recall_break",
        notes: "Drink water, stretch, do 2 minutes of active recall without looking at your notes.",
        notesAr: "شرب الماء، تمارين تمدد خفيفة، وتذكر أهم 3 نقاط تم فهمها في الجلسة السابقة دون النظر للدفتر.",
      },
      {
        timeRange: b2Range,
        durationMinutes: block2Duration,
        courseCode: course2.code,
        courseName: course2.name,
        topic: asgn2 ? `Assignment Work: ${asgn2.title}` : `Drill & Code / Numerical Applications: ${course2.name}`,
        topicAr: asgn2 ? `العمل على تسليم: ${asgn2.title}` : `تطبيقات وحل مسائل برمجية/حسابية في ${course2.name}`,
        taskType: asgn2 ? "assignment_work" : "problem_drill",
        notes: "Solidify problem-solving velocity before sleep to leverage overnight memory consolidation.",
        notesAr: "حل مسألتين نموذجيتين لتثبيت المعلومات قبل النوم واستغلال مرحلة ترسيخ الذاكرة أثناء النوم.",
      },
    ];

    daysData.push({
      dayName: meta.en,
      dayNameAr: meta.ar,
      focusSummary: `${course1.code} + ${course2.code}`,
      focusSummaryAr: `التركيز المشترك: ${course1.code} و ${course2.code}`,
      blocks,
    });
  }

  const freeTimeWindow = `${formatMinutesToTime(startMins)} - ${formatMinutesToTime(endMins)}`;
  const workContext = params.input.workScheduleNote || "Working student with dedicated evening study window";

  return {
    studentName: params.studentContext.name || "Student",
    freeTimeWindow,
    dailyAvailableMinutes: dailyMinutes,
    weeklyTotalHours,
    workScheduleContext: workContext,
    sessionStyle: params.input.sessionStyle || "deep_work",
    days: daysData,
    wellnessAdvice: "Since you are balancing work and university, protect this 2-hour window strictly. 120 minutes of 100% focused study every night beats 8 hours of distracted cramming on weekends.",
    wellnessAdviceAr: "بما أنك توفق بين العمل والجامعة، فإن الالتزام بساعتين بتركيز 100% يومياً (9 إلى 11 مساءً) يضمن لك أعلى الدرجات، وهو أفضل بكثير من دراسة 8 ساعات متواصلة مشتتة في نهاية الأسبوع.",
  };
}

/**
 * Formats the generated free-time plan into rich Markdown
 */
export function formatFreeTimePlanToMarkdown(plan: GeneratedFreeTimePlan, language: "ar" | "en" = "ar"): string {
  if (language === "ar") {
    let md = `## 📅 جدول المذاكرة الذكي المخصص لوقت فراغك (${plan.freeTimeWindow})\n\n`;
    md += `> 💼 **حالة الطالب والظروف اليومية:** ${plan.workScheduleContext}\n`;
    md += `> ⏱️ **الوقت المتاح:** ${plan.dailyAvailableMinutes} دقيقة يومياً • **الإجمالي الأسبوعي:** ${plan.weeklyTotalHours} ساعة مذاكرة عالية التركيز\n\n`;

    md += `### 💡 نصيحة أوليفر الذكية للطلاب الموظفين:\n${plan.wellnessAdviceAr}\n\n`;

    md += `### 🗓️ جدول توزيع الأيام والحصص الدراسية:\n\n`;
    for (const d of plan.days) {
      md += `#### 🔹 **${d.dayNameAr}** (${d.focusSummaryAr})\n`;
      for (const b of d.blocks) {
        if (b.isBreak) {
          md += `- ☕ \`${b.timeRange}\` **[${b.courseName}]**: ${b.topicAr} (${b.notesAr})\n`;
        } else {
          md += `- 📚 \`${b.timeRange}\` **[${b.courseCode} - ${b.courseName}]**\n`;
          md += `  *المهمة:* ${b.topicAr}\n`;
          md += `  *الإرشاد:* ${b.notesAr}\n`;
        }
      }
      md += `\n`;
    }

    return md;
  }

  // English formatting
  let md = `## 📅 Personalized AI Study Plan for Your Free Time (${plan.freeTimeWindow})\n\n`;
  md += `> 💼 **Daily & Work Constraints:** ${plan.workScheduleContext}\n`;
  md += `> ⏱️ **Daily Window:** ${plan.dailyAvailableMinutes} minutes/day • **Weekly Total:** ${plan.weeklyTotalHours} focused hours\n\n`;

  md += `### 💡 Oliver's Advice for Working Students:\n${plan.wellnessAdvice}\n\n`;

  md += `### 🗓️ Day-by-Day Time-Blocked Timetable:\n\n`;
  for (const d of plan.days) {
    md += `#### 🔹 **${d.dayName}** (${d.focusSummary})\n`;
    for (const b of d.blocks) {
      if (b.isBreak) {
        md += `- ☕ \`${b.timeRange}\` **[${b.courseName}]**: ${b.topic} (${b.notes})\n`;
      } else {
        md += `- 📚 \`${b.timeRange}\` **[${b.courseCode} - ${b.courseName}]**\n`;
        md += `  *Target:* ${b.topic}\n`;
        md += `  *Guidance:* ${b.notes}\n`;
      }
    }
    md += `\n`;
  }

  return md;
}
