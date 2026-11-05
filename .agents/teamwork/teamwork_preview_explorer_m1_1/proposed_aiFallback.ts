/**
 * Murshid AI Local Fallback & Mock Advisory Engine
 * 
 * Provides a resilient, 3-tier offline academic advising mechanism when external LLM (Runpod) is offline.
 * Tier 1: Search database FAQs and built-in ZUJ academic regulations.
 * Tier 2: Context-aware academic rules intent detector (GPA, probation, credits, attendance, courses, alerts).
 * Tier 3: Simulated university academic advisor guidance in Arabic or English.
 */

export interface StudentAcademicContext {
  id?: number;
  name: string;
  major: string;
  gpa: string | number;
  completedCredits: number;
  totalCredits: number;
  attendanceRate: number; // percentage (0-100)
  currentCourses: Array<{
    name: string;
    code: string;
    credits: number;
    status: string;
  }>;
  pendingAssignments: number;
  activeAlerts: Array<{
    title: string;
    severity: string;
  }>;
}

export type FallbackSource = "faq" | "academic_rules" | "local_advisor" | "external_llm";

export interface FallbackResponse {
  response: string;
  isOfflineFallback: boolean;
  source: "faq" | "academic_rules" | "local_advisor";
  matchedTopic?: string;
}

export interface FaqItem {
  id?: number;
  question: string;
  questionAr?: string;
  answer: string;
  answerAr?: string;
  category?: string;
  categoryAr?: string;
}

/**
 * Detect query language: Arabic ("ar") vs English ("en")
 */
export function detectLanguage(text: string): "ar" | "en" {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text) ? "ar" : "en";
}

/**
 * Normalize Arabic & English text for robust token and keyword matching
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Normalize alef variants
    .replace(/[أإآ]/g, "ا")
    // Normalize taa marbuta
    .replace(/ة/g, "ه")
    // Normalize yaa / alef maksura
    .replace(/ى/g, "ي")
    // Replace punctuation with space
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, " ")
    // Collapse consecutive whitespaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Built-in catalog of Al-Zaytoonah University of Jordan academic regulations & FAQs
 */
export const BUILTIN_FAQS: FaqItem[] = [
  {
    id: 101,
    category: "Registration / التسجيل",
    categoryAr: "التسجيل والسحب والإضافة",
    question: "When is the drop and add period and how does it work?",
    questionAr: "متى تبدأ فترة السحب والإضافة وكيف تتم؟",
    answer: "The drop/add period begins at the start of each semester and lasts for one week according to the official Al-Zaytoonah University academic calendar. You can add or drop courses via the student registration portal without academic penalty.",
    answerAr: "تبدأ فترة السحب والإضافة مع بداية كل فصل دراسي وتستمر لمدة أسبوع واحد وفق التقويم الجامعي الرسمي لجامعة الزيتونة الأردنية. يمكنك تعديل جدولك الدراسي عبر البوابة الإلكترونية دون أي غرامة أكاديمية.",
  },
  {
    id: 102,
    category: "Academic Standing / الإنذار الأكاديمي",
    categoryAr: "الإنذار والمحاكمة الأكاديمية",
    question: "What are the rules regarding academic probation and warning?",
    questionAr: "ما هي تعليمات الإنذار الأكاديمي والمحاكمة؟",
    answer: "A student is placed on academic probation if their cumulative GPA falls below 2.00 out of 4.00. The university grants the student two consecutive regular semesters to raise their GPA to 2.00 or higher. During probation, the maximum credit load is limited to 12-15 credit hours.",
    answerAr: "يوضع الطالب تحت الإنذار/المحاكمة الأكاديمية إذا قل معدله التراكمي عن 2.00 من 4.00 نقطة. يُمنح الطالب مهلة فصلين دراسيين عاديين متتاليين لرفع معدله إلى 2.00 أو أكثر. ويكون الحد الأقصى للعبء الدراسي خلال فترة الإنذار من 12 إلى 15 ساعة معتمدة.",
  },
  {
    id: 103,
    category: "Credit Hours / الساعات المعتمدة",
    categoryAr: "العبء الدراسي والساعات المعتمدة",
    question: "What are the minimum and maximum credit hours per semester?",
    questionAr: "ما هو الحد الأدنى والأعلى للساعات المعتمدة في الفصل الدراسي؟",
    answer: "In a regular semester, the minimum load is 12 credit hours and the maximum is 18 credit hours (may be raised to 21 for students with GPA >= 3.00 or graduating seniors). In the summer session, the maximum load is 9 credit hours (12 for graduating seniors).",
    answerAr: "الحد الأدنى لتسجيل الساعات في الفصل الدراسي العادي هو 12 ساعة معتمدة، والحد الأقصى 18 ساعة معتمدة (يمكن رفعها إلى 21 ساعة للطلبة الحاصلين على معدل 3.00 فما فوق أو الطلبة المتوقع تخرجهم). في الفصل الصيفي الحد الأقصى 9 ساعات (12 ساعة للمتخرج).",
  },
  {
    id: 104,
    category: "Attendance / الحضور والغياب",
    categoryAr: "تعليمات الحضور والغياب والحرمان",
    question: "What is the university attendance and absence policy?",
    questionAr: "ما هي سياسة الحضور والغياب والحد المسموح به للغياب؟",
    answer: "University regulations stipulate that student absences must not exceed 15% of the total course lecture hours. Exceeding 15% without an official medical/compelling excuse accepted by the Faculty Dean leads to course deprivation with an 'FA' (deprived) grade.",
    answerAr: "تنص تعليمات جامعة الزيتونة الأردنية على ألا يتجاوز غياب الطالب 15% من مجموع الساعات التدريسية للمقرر. وفي حال تجاوز الطالب هذه النسبة دون عذر رسمي معتمد من عميد الكلية، يُحرم من المادة وتُرصد له علامة محروم (ح).",
  },
  {
    id: 105,
    category: "Exams / الامتحانات",
    categoryAr: "تعارض الامتحانات والامتحانات التكميلية",
    question: "What happens if two final exams conflict at the same time?",
    questionAr: "ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟",
    answer: "In the event of an exam conflict, exams are prioritized: 1. University requirement outside faculty, 2. Outside major, 3. Core major exam. Rescheduling is coordinated with the department for the lower priority exam.",
    answerAr: "في حال تعارض الامتحانات، يتم تقديم الامتحان حسب الأولويات التالية بالترتيب: 1. الامتحان خارج الكلية، 2. الامتحان خارج التخصص، 3. الامتحان داخل التخصص. ويتم التنسيق لتأجيل الامتحان ذي الأولوية الأقل بالتنسيق مع رئيس القسم.",
  },
  {
    id: 106,
    category: "Graduation / التخرج",
    categoryAr: "متطلبات وشروط التخرج",
    question: "What are the requirements for bachelor degree graduation?",
    questionAr: "ما هي شروط ومتطلبات التخرج ونيل درجة البكالوريوس؟",
    answer: "Graduation requires successfully completing 132 credit hours (as defined by the major study plan), achieving a cumulative GPA of at least 2.00 out of 4.00, and fulfilling all mandatory departmental, faculty, and university requirements including practical training.",
    answerAr: "يتطلب التخرج إتمام 132 ساعة معتمدة بنجاح (وفق الخطة الدراسية المعتمدة للتخصص)، وتحقيق معدل تراكمي لا يقل عن 2.00 من 4.00، واستيفاء جميع متطلبات الجامعة والكلية والتخصص الإجبارية والتدريب الميداني.",
  },
  {
    id: 107,
    category: "Prerequisites / المتطلبات السابقة",
    categoryAr: "شروط المتطلبات السابقة والتزامنية",
    question: "Can I take a course without fulfilling its prerequisite?",
    questionAr: "هل يمكن تسجيل مادة دون اجتياز متطلبها السابق؟",
    answer: "No, university regulations strictly prohibit enrolling in a course without successfully passing all prerequisites. In the graduation semester only, concurrent enrollment in a course and its prerequisite may be approved with the Dean's formal waiver.",
    answerAr: "كلا، تنص التعليمات على منع تسجيل أي مقرر دراسي قبل النجاح في متطلبه السابق. وفي فصل التخرج فقط، يجوز بموافقة خطية من عميد الكلية تسجيل المادة مع متطلبها السابق كمتطلب متزامن.",
  },
  {
    id: 108,
    category: "Repeating Courses / إعادة المواد",
    categoryAr: "إعادة المواد لرفع المعدل التراكمي",
    question: "Can I repeat a passed course to improve my GPA?",
    questionAr: "هل يجوز إعادة مادة ناجحة لرفع المعدل التراكمي؟",
    answer: "A student is allowed to repeat any course in which they received a grade of (C-) or lower to raise their cumulative GPA. The latest grade received is calculated into the GPA while the previous grade remains on the transcript.",
    answerAr: "يحق للطالب إعادة أي مقرر حصل فيه على علامة (C-) أو أقل بهدف تحسين المعدل التراكمي. وتُحسب العلامة الأحدث في المعدل التراكمي للطالب مع بقاء المادة السابقة في كشف العلامات.",
  },
  {
    id: 109,
    category: "Incomplete Exam / الامتحان غير المكتمل",
    categoryAr: "الغياب بعذر عن الامتحان النهائي",
    question: "What should I do if I miss a final exam due to emergency or illness?",
    questionAr: "ما هو إجراء التغيب عن الامتحان النهائي بعذر مرضي أو طارئ؟",
    answer: "The student must submit an official medical report or approved emergency excuse to the Dean's office within 3 business days of the exam date. If approved, an 'Incomplete' exam will be scheduled during the first two weeks of the following semester.",
    answerAr: "يجب على الطالب تقديم التقرير الطبي المعتمد أو العذر القهري إلى عمادة الكلية خلال 3 أيام عمل من موعد الامتحان. في حال قبول العذر، تُرصد علامة (غير مكتمل) ويُعقد امتحان تكميلي خلال أول أسبوعين من الفصل التالي.",
  },
  {
    id: 110,
    category: "Academic Advising / الإرشاد الأكاديمي",
    categoryAr: "التواصل مع المرشد الأكاديمي",
    question: "How can I book an appointment with my academic advisor?",
    questionAr: "كيف يمكنني حجز موعد مع مرشدي الأكاديمي؟",
    answer: "You can book an advising appointment directly through the Murshid platform under the Appointments tab, or visit your advisor during their announced office hours displayed on their profile.",
    answerAr: "يمكنك حجز موعد مع مرشدك الأكاديمي مباشرة عبر منصة مرشد من تبويب المواعيد، أو مراجعة المرشد خلال الساعات المكتبية المعلنة في الملف الشخصي للمرشد في الكلية.",
  },
];

/**
 * Tier 1: Search database FAQs and built-in university academic catalog
 */
export function matchFaq(
  query: string,
  dbFaqs: FaqItem[] = [],
  lang: "ar" | "en"
): { answer: string; topic: string } | null {
  const normQuery = normalizeText(query);
  if (normQuery.length < 3) return null;

  const queryTokens = normQuery.split(" ").filter(t => t.length > 2);
  if (queryTokens.length === 0) return null;

  const allFaqs = [...dbFaqs, ...BUILTIN_FAQS];
  let bestMatch: { answer: string; topic: string; score: number } | null = null;

  for (const faq of allFaqs) {
    const qAr = normalizeText(faq.questionAr || "");
    const qEn = normalizeText(faq.question || "");
    const ansAr = faq.answerAr || faq.answer;
    const ansEn = faq.answer || faq.answerAr;

    // Check exact phrase match
    if ((qAr && qAr.includes(normQuery)) || (qEn && qEn.includes(normQuery))) {
      return {
        answer: lang === "ar" ? ansAr : ansEn,
        topic: faq.categoryAr || faq.category || "General Academic",
      };
    }

    // Check token overlap
    const tokensAr = qAr.split(" ").filter(t => t.length > 2);
    const tokensEn = qEn.split(" ").filter(t => t.length > 2);
    const combinedTokens = new Set([...tokensAr, ...tokensEn]);

    let overlapCount = 0;
    for (const token of queryTokens) {
      if (combinedTokens.has(token)) overlapCount++;
    }

    const overlapScore = overlapCount / Math.max(queryTokens.length, 1);

    // If strong match (at least 2 matching significant tokens or 50% overlap)
    if ((overlapCount >= 2 || (queryTokens.length === 1 && overlapCount === 1)) && overlapScore > (bestMatch?.score ?? 0.35)) {
      bestMatch = {
        answer: lang === "ar" ? ansAr : ansEn,
        topic: faq.categoryAr || faq.category || "General Academic",
        score: overlapScore,
      };
    }
  }

  if (bestMatch && bestMatch.score >= 0.35) {
    return {
      answer: bestMatch.answer,
      topic: bestMatch.topic,
    };
  }

  return null;
}

/**
 * Tier 2: Academic rules intent detector using student context
 */
export function matchAcademicRules(
  query: string,
  ctx: StudentAcademicContext,
  lang: "ar" | "en"
): { answer: string; intent: string } | null {
  const norm = normalizeText(query);
  const numGpa = typeof ctx.gpa === "number" ? ctx.gpa : parseFloat(ctx.gpa || "0");
  const gpaStr = isNaN(numGpa) ? "0.00" : numGpa.toFixed(2);
  const attRate = ctx.attendanceRate ?? 100;
  const compCredits = ctx.completedCredits ?? 0;
  const totCredits = ctx.totalCredits || 132;
  const remCredits = Math.max(0, totCredits - compCredits);
  const progressPercent = Math.min(100, Math.round((compCredits / totCredits) * 100));

  // 1. GPA Inquiry
  if (/(معدلي|المعدل التراكمي|كم معدلي|معدل|gpa|cumulative gpa|my grade)/i.test(norm)) {
    const standingAr = numGpa >= 3.5 ? "ممتاز (لوحة الشرف)" : numGpa >= 3.0 ? "جيد جداً" : numGpa >= 2.5 ? "جيد" : numGpa >= 2.0 ? "مقبول" : "حرج (تحت الإنذار الأكاديمي)";
    const standingEn = numGpa >= 3.5 ? "Excellent (Dean's Honor List)" : numGpa >= 3.0 ? "Very Good" : numGpa >= 2.5 ? "Good" : numGpa >= 2.0 ? "Satisfactory" : "Critical (Academic Probation)";

    const answer = lang === "ar"
      ? `📊 **بيانات المعدل التراكمي:**\n- **المعدل الحالي:** **${gpaStr}** من 4.00\n- **التخصص:** ${ctx.major}\n- **التقييم الأكاديمي:** ${standingAr}\n\n💡 **توصية المرشد الأكاديمي:** ${numGpa < 2.0 ? "أنت حالياً تحت حد الإنذار (2.00). نوصيك بإعادة المقررات الحاصل فيها على (D أو F) ومراجعة مرشدك الأكاديمي فوراً." : numGpa < 2.5 ? "معدلك في النطاق الآمن لكن يحتاج إلى تعزيز. ركّز على تنظيم ساعات الدراسة ومتابعة التكاليف أولاً بأول." : "أداؤك الأكاديمي متميز ومشرّف! واصل الحفاظ على هذا التفوق للمنافسة على لوحة شرف الكلية."}`
      : `📊 **Cumulative GPA Overview:**\n- **Current GPA:** **${gpaStr}** / 4.00\n- **Major:** ${ctx.major}\n- **Academic Classification:** ${standingEn}\n\n💡 **Advisor Guidance:** ${numGpa < 2.0 ? "Your GPA is below the 2.00 probation threshold. We strongly advise repeating D/F courses and meeting with your academic advisor immediately." : numGpa < 2.5 ? "Your GPA is in good standing but has room for improvement. Focus on coursework consistency and exam preparation." : "Excellent academic performance! Keep up the great effort to maintain your position on the Dean's Honor Roll."}`;

    return { answer, intent: "gpa_inquiry" };
  }

  // 2. Academic Probation & Standing Check
  if (/(انذار|محاكمه|وضع اكاديمي|مفصول|تحذير|probation|warning|standing|under warning)/i.test(norm)) {
    const isProbation = numGpa < 2.0;
    const answer = lang === "ar"
      ? isProbation
        ? `⚠️ **حالة الإنذار الأكاديمي:**\nمعدلك التراكمي الحالي (**${gpaStr}**) أقل من الحد الأدنى المطلوب للتخرج (2.00 نقطة)، مما يضعك تحت **الإنذار الأكاديمي**.\n\n**الخطة العلاجية المقترحة:**\n1. تسجيل عبء دراسي معتدل (12-14 ساعة معتمدة كحد أقصى).\n2. إعادة المواد ذات العلامات المتدنية (D أو F) لرفع المعدل التراكمي سريعاً.\n3. التنسيق المستمر مع المرشد الأكاديمي لمتابعة التحصيل.\n4. الالتزام بحضور كافة المحاضرات وتسليم الواجبات في مواعيدها.`
        : `✅ **الوضع الأكاديمي سليم (Good Standing):**\nمعدلك الحالي (**${gpaStr}**) أعلى من حد الإنذار الأكاديمي (2.00 نقطة). سجلك الأكاديمي نظيف وخالٍ من الإنذارات أو المحاكمات الأكاديمية.`
      : isProbation
        ? `⚠️ **Academic Probation Status:**\nYour current GPA (**${gpaStr}**) is below the minimum required 2.00 threshold, placing you on **Academic Probation**.\n\n**Recommended Remedial Plan:**\n1. Register a moderate course load (12-14 credit hours max).\n2. Retake courses with low grades (D or F) to quickly recover your GPA.\n3. Schedule regular advising check-ins with your assigned academic mentor.\n4. Ensure 100% attendance and timely submission of all assignments.`
        : `✅ **Good Academic Standing:**\nYour current GPA (**${gpaStr}**) is comfortably above the 2.00 warning threshold. Your record is free of any academic probations or warnings.`;

    return { answer, intent: "probation_check" };
  }

  // 3. Attendance & Absence Rate Check
  if (/(غيابي|حضور|نسبه الغياب|محروم|حرمان|attendance|absence|absent|deprived)/i.test(norm)) {
    const isNearDeprivation = attRate < 85;
    const answer = lang === "ar"
      ? `📋 **تقرير الحضور والغياب:**\n- **نسبة الحضور الإجمالية:** **${attRate}%**\n- **نسبة الغياب المقدرة:** **${100 - attRate}%**\n- **حد الحرمان الأكاديمي:** 15% غياب وفق تعليمات جامعة الزيتونة الأردنية.\n\n${isNearDeprivation ? "⚠️ **تنبيه هام:** نسبة غيابك تقترب من حد الحرمان (15%)! يرجى تقديم أي أعذار طبية أو قهرية لرئيس القسم خلال 3 أيام، والالتزام بحضور المحاضرات القادمة لتجنب الحرمان من الامتحانات النهائية." : "✅ **حالة الحضور:** نسبة حضورك ممتازة وضمن الحدود الآمنة للجامعة. استمر في هذا الالتزام."}`
      : `📋 **Attendance & Absence Report:**\n- **Overall Attendance Rate:** **${attRate}%**\n- **Estimated Absence Rate:** **${100 - attRate}%**\n- **Official Deprivation Limit:** 15% absence per Al-Zaytoonah University regulations.\n\n${isNearDeprivation ? "⚠️ **Urgent Alert:** Your absence rate is nearing the 15% deprivation limit! Submit any official medical excuses to the department chair within 3 days, and attend all upcoming lectures." : "✅ **Status:** Your attendance record is solid and well within safe limits. Keep up the punctuality."}`;

    return { answer, intent: "attendance_check" };
  }

  // 4. Graduation & Credit Completion Forecast
  if (/(تخرج|كم ساعه باقيه|ساعات التخرج|متى اتخرج|remaining credits|graduate|graduation|credits left)/i.test(norm)) {
    const semLeft = Math.ceil(remCredits / 16);
    const answer = lang === "ar"
      ? `🎓 **مسار التخرج وإنجاز الخطة الدراسية:**\n- **الساعات المنجزة:** **${compCredits}** ساعة معتمدة.\n- **الساعات الإجمالية المطلوبة:** **${totCredits}** ساعة معتمدة.\n- **الساعات المتبقية للتخرج:** **${remCredits}** ساعة معتمدة.\n- **نسبة إنجاز الخطة:** **${progressPercent}%**\n- **الفصول التقديرية المتبقية:** حوالي **${semLeft}** فصول دراسية (بمعدل 15-18 ساعة للفصل).\n\n📌 **شروط نيل الدرجة:** إتمام كامل المتطلبات بمعدل تراكمي لا يقل عن 2.00.`
      : `🎓 **Graduation Progress & Degree Roadmap:**\n- **Completed Credits:** **${compCredits}** credits.\n- **Total Required:** **${totCredits}** credits.\n- **Remaining Credits:** **${remCredits}** credits.\n- **Degree Completion:** **${progressPercent}%**\n- **Estimated Semesters Remaining:** Approximately **${semLeft}** semesters (averaging 15-18 credits per regular term).\n\n📌 **Graduation Criteria:** Successful completion of all plan requirements with a minimum cumulative GPA of 2.00.`;

    return { answer, intent: "graduation_credits" };
  }

  // 5. Current Registered Courses
  if (/(موادي|مقرراتي|جدولي|مواد هذا الفصل|my courses|enrolled|current courses|my schedule)/i.test(norm)) {
    const coursesList = ctx.currentCourses || [];
    if (coursesList.length === 0) {
      const answer = lang === "ar"
        ? "📚 لا توجد مقررات مسجلة في جدولك حالياً. يمكنك تصفح المقررات والتسجيل عبر صفحة الخطة الدراسية."
        : "📚 You currently have no registered courses. You can explore available courses and enroll via the Study Plan page.";
      return { answer, intent: "current_courses" };
    }

    const totalRegCredits = coursesList.reduce((acc, c) => acc + (c.credits || 3), 0);
    const linesAr = coursesList.map((c, i) => `${i + 1}. **${c.name}** (${c.code || "رمز المقرر"}) — ${c.credits || 3} ساعات [${c.status || "مسجل"}]`).join("\n");
    const linesEn = coursesList.map((c, i) => `${i + 1}. **${c.name}** (${c.code || "Course Code"}) — ${c.credits || 3} Cr. [${c.status || "Enrolled"}]`).join("\n");

    const answer = lang === "ar"
      ? `📚 **المقررات المسجلة في جدولك لهذا الفصل (${totalRegCredits} ساعة معتمدة):**\n\n${linesAr}\n\nنوصيك بالاطلاع على مواعيد الاختبارات والتكليفات لكل مقرر في بوابة الطالب.`
      : `📚 **Your Currently Registered Courses (${totalRegCredits} Credit Hours):**\n\n${linesEn}\n\nCheck your student portal for lecture schedules and assignment deadlines.`;

    return { answer, intent: "current_courses" };
  }

  // 6. Assignments & Tasks
  if (/(واجباتي|تكاليف|مهامي|واجب|assignments|homework|pending tasks)/i.test(norm)) {
    const pendingCount = ctx.pendingAssignments ?? 0;
    const answer = lang === "ar"
      ? `📝 **الواجبات والتكليفات الأكاديمية:**\nلديك حالياً **${pendingCount}** واجبات معلقة قيد التسليم.\n\n${pendingCount > 0 ? "⚠️ احرص على مراجعة مواعيد الاستحقاق في صفحة الواجبات وتسليمها قبل الموعد المحدد لتفادي خسارة درجات المشاركة." : "✅ ليس لديك أي واجبات معلقة حالياً. أحسنت صنعاً!"}`
      : `📝 **Academic Assignments & Deadlines:**\nYou currently have **${pendingCount}** pending assignments awaiting submission.\n\n${pendingCount > 0 ? "⚠️ Please visit the Assignments tab and submit your coursework before the deadlines to secure full participation marks." : "✅ No pending assignments at the moment. Excellent job staying on track!"}`;

    return { answer, intent: "assignments_check" };
  }

  // 7. Academic Alerts
  if (/(تنبيهات|اشعارات اكاديميه|alerts|academic alerts|warnings)/i.test(norm)) {
    const alerts = ctx.activeAlerts || [];
    if (alerts.length === 0) {
      const answer = lang === "ar"
        ? "🔔 **التنبيهات الأكاديمية:**\nسجلك الأكاديمي ممتاز! لا توجد أي تنبيهات أو إشعارات أكاديمية مرسلة من مرشدك حالياً."
        : "🔔 **Academic Alerts:**\nYour record is clear! There are no active academic alerts or warnings from your advisor at this time.";
      return { answer, intent: "alerts_check" };
    }

    const lines = alerts.map((a, i) => `${i + 1}. **${a.title}** (مستوى الخطورة: ${a.severity})`).join("\n");
    const answer = lang === "ar"
      ? `🔔 **التنبيهات الأكاديمية النشطة (${alerts.length}):**\n\n${lines}\n\nيرجى التواصل مع مرشدك الأكاديمي أو مراجعة التفاصيل في لوحة التحكم لاتخاذ الإجراء المناسب.`
      : `🔔 **Active Academic Alerts (${alerts.length}):**\n\n${lines}\n\nPlease contact your academic advisor to address these items promptly.`;

    return { answer, intent: "alerts_check" };
  }

  return null;
}

/**
 * Tier 3: Simulated Academic Advisor Guidance
 */
export function generateSimulatedAdvisor(
  query: string,
  ctx: StudentAcademicContext,
  lang: "ar" | "en"
): { answer: string; topic: string } {
  const norm = normalizeText(query);
  const studentFirstName = (ctx.name || "Student").split(" ")[0];
  const majorName = ctx.major || "تخصصك الجامعي";

  // Topic 1: Study strategies, exam preparation, and time management
  if (/(دراسه|امتحان|مذاكره|تنظيم وقت|تشتت|ضغط|study|exam|prepare|time management|focus|schedule)/i.test(norm)) {
    const answer = lang === "ar"
      ? `أهلاً بك يا ${studentFirstName}. بصفتي مرشدك الأكاديمي الذكي في جامعة الزيتونة الأردنية، إليك هذه الخطة العملية لتنظيم دراستك:\n\n1. **تقنية البومودورو (Pomodoro):** قسّم وقت المذاكرة إلى 25 دقيقة تركيز متبوعة بـ 5 دقائق استراحة لتجنب الإرهاق الذهني.\n2. **الاسترجاع النشط (Active Recall):** لا تكتفِ بقراءة الملخصات؛ اختبر نفسك بحل أسئلة السنوات السابقة والتطبيقات العملية لمقررات ${majorName}.\n3. **الأولويات الأكاديمية:** ابدأ دائماً بالمفاهيم الصعبة والمواد ذات المتطلبات السابقة.\n4. **ساعات الدعم المكتبي:** لا تتردد في مراجعة أساتذة المواد خلال ساعاتهم المكتبية للاستفسار عن أي نقاط غامضة.\n\nأتمنى لك كل التوفيق والدرجات العالية!`
      : `Hello ${studentFirstName}! As your AI Academic Advisor at Al-Zaytoonah University, here is a structured strategy for your studies:\n\n1. **Pomodoro Technique:** Structure your sessions into 25 minutes of deep focus followed by a 5-minute break to maintain high retention.\n2. **Active Recall & Practice:** Don't just passively re-read slides; practice past exams and solve practical problems related to ${majorName}.\n3. **Prioritize Core Subjects:** Tackle prerequisite courses and challenging topics first when your energy is highest.\n4. **Utilize Faculty Office Hours:** Visit your course instructors to clarify challenging concepts early in the term.\n\nBest of luck with your academic journey!`;

    return { answer, topic: "Study & Exam Strategy" };
  }

  // Topic 2: Career, skills, and industry readiness
  if (/(سوق العمل|وظائف|مهارات|تدريب|مستقبل|شغل|career|job|internship|skills|future|market)/i.test(norm)) {
    const answer = lang === "ar"
      ? `مرحباً يا ${studentFirstName}! التميز في تخصص **${majorName}** يتطلب بناء المهارات العملية جنباً إلى جنب مع المواد النظرية:\n\n1. **المشاريع العملية (Portfolio):** قم ببناء مشاريع برمجية أو تطبيقية حقيقية ورفعها على GitHub لتعزيز سيرتك الذاتية.\n2. **التدريب الميداني (Field Training):** احرص على اختيار شركة رائدة خلال فترة التدريب الميداني المقررة في خطتك لفتح آفاق التوظيف المبكر.\n3. **الشهادات المهنية العالمية:** عزز مؤهلاتك بشهادات معتمدة في مجالك (مثل AWS, Cisco, Google, Scrum).\n4. **المهارات الشخصية واللغوية:** إتقان اللغة الإنجليزية ومهارات التواصل والعمل الجماعي يشكل 50% من معايير اختيار الخريجين في سوق العمل الأردني والإقليمي.`
      : `Hello ${studentFirstName}! Excelling in **${majorName}** requires coupling your academic curriculum with practical market skills:\n\n1. **Practical Portfolio:** Build hands-on projects and maintain an active GitHub profile to demonstrate your applied knowledge.\n2. **Field Training:** Choose a reputable internship partner during your compulsory field training period to unlock potential career opportunities.\n3. **Industry Certifications:** Supplement your degree with respected vendor certifications (e.g. AWS, Cisco, CompTIA, Google Cloud).\n4. **Communication & Teamwork:** English proficiency and collaborative problem-solving are crucial factors in regional tech hiring.`;

    return { answer, topic: "Career & Industry Preparation" };
  }

  // Topic 3: General Conversational Advisor Guidance
  const answer = lang === "ar"
    ? `أهلاً بك يا ${studentFirstName} في منصة مرشد للإرشاد الأكاديمي بجامعة الزيتونة الأردنية.\n\nأنا هنا لمساعدتك في كل ما يخص مسيرتك الجامعية في تخصص **${majorName}**، بما في ذلك:\n- الاستفسار عن معدلك التراكمي (${ctx.gpa}) والوضع الأكاديمي.\n- الخطة الدراسية والمتطلبات السابقة والساعات المتبقية للتخرج.\n- مواعيد الامتحانات ولوائح الغياب والحرمان والسحب والإضافة.\n- نصائح لتنظيم الوقت والتفوق الدراسي.\n\nكيف يمكنني مساعدتك تحديداً اليوم؟ يمكنك طرح سؤالك مباشرة، أو حجز موعد مع مرشدك الأكاديمي عبر المنصة.`
    : `Hello ${studentFirstName}, welcome to Murshid Academic Advising at Al-Zaytoonah University of Jordan.\n\nI am here to assist you throughout your academic journey in **${majorName}**, including:\n- Inquiries about your GPA (${ctx.gpa}) and academic standing.\n- Study plans, course prerequisites, and remaining graduation credits.\n- Exam schedules, drop/add deadlines, and university attendance regulations.\n- Practical tips for exam success and time management.\n\nHow can I help you today? Feel free to ask any specific question, or book a consultation with your faculty advisor via the portal.`;

  return { answer, topic: "General Advisory" };
}

/**
 * Main 3-Tier Fallback Dispatcher
 */
export async function generateLocalFallbackResponse(params: {
  query: string;
  studentContext: StudentAcademicContext;
  dbFaqs?: FaqItem[];
  dbDocs?: Array<{ title: string; category: string }>;
}): Promise<FallbackResponse> {
  const { query, studentContext, dbFaqs = [] } = params;
  const lang = detectLanguage(query);

  // Tier 1: Search FAQ database and built-in university catalog
  const faqMatch = matchFaq(query, dbFaqs, lang);
  if (faqMatch) {
    return {
      response: faqMatch.answer,
      isOfflineFallback: true,
      source: "faq",
      matchedTopic: faqMatch.topic,
    };
  }

  // Tier 2: Check Student Academic Rules and context-specific intents
  const rulesMatch = matchAcademicRules(query, studentContext, lang);
  if (rulesMatch) {
    return {
      response: rulesMatch.answer,
      isOfflineFallback: true,
      source: "academic_rules",
      matchedTopic: rulesMatch.intent,
    };
  }

  // Tier 3: Simulated Academic Advisor Guidance
  const advisorMatch = generateSimulatedAdvisor(query, studentContext, lang);
  return {
    response: advisorMatch.answer,
    isOfflineFallback: true,
    source: "local_advisor",
    matchedTopic: advisorMatch.topic,
  };
}

/**
 * In-memory cached status for AI service to avoid network spamming
 */
let cachedStatus: {
  isOnline: boolean;
  mode: "local_mock_fallback" | "external_model";
  model: string;
  timestamp: number;
} | null = null;

const STATUS_CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Health check & status probe for external AI service
 */
export async function getAiServiceStatus(): Promise<{
  isOnline: boolean;
  mode: "local_mock_fallback" | "external_model";
  model: string;
}> {
  if (cachedStatus && Date.now() - cachedStatus.timestamp < STATUS_CACHE_TTL_MS) {
    return {
      isOnline: cachedStatus.isOnline,
      mode: cachedStatus.mode,
      model: cachedStatus.model,
    };
  }

  const runpodUrl = process.env.RUNPOD_API_URL;
  if (!runpodUrl || process.env.AI_FORCE_LOCAL_FALLBACK === "true") {
    cachedStatus = {
      isOnline: false,
      mode: "local_mock_fallback",
      model: "Murshid Academic Rule & FAQ Fallback Engine (Local Active)",
      timestamp: Date.now(),
    };
    return cachedStatus;
  }

  try {
    const probe = await fetch(`${runpodUrl.replace(/\/$/, '')}/`, {
      method: "GET",
      signal: AbortSignal.timeout(800),
    });

    if (probe.ok) {
      cachedStatus = {
        isOnline: true,
        mode: "external_model",
        model: "Runpod DeepSeek / Qwen Academic LLM (Online)",
        timestamp: Date.now(),
      };
    } else {
      cachedStatus = {
        isOnline: false,
        mode: "local_mock_fallback",
        model: "Murshid Academic Rule & FAQ Fallback Engine (Active)",
        timestamp: Date.now(),
      };
    }
  } catch {
    cachedStatus = {
      isOnline: false,
      mode: "local_mock_fallback",
      model: "Murshid Academic Rule & FAQ Fallback Engine (Active)",
      timestamp: Date.now(),
    };
  }

  return {
    isOnline: cachedStatus.isOnline,
    mode: cachedStatus.mode,
    model: cachedStatus.model,
  };
}
