/**
 * Oliver AI Local Fallback & Mock Advisory Engine
 * 
 * Provides an authoritative, 3-tier offline academic advising mechanism for
 * Al-Zaytoonah University of Jordan (ZUJ) when the external LLM (Runpod) is offline.
 * 
 * Tier 1: Match against database FAQs and built-in authoritative ZUJ academic regulations catalog.
 * Tier 2: Real-time context-aware academic rules intent detector (GPA, probation, attendance deprivation,
 *         graduation credits, tuition & fee calculator, add/drop withdrawal refunds, exam conflicts, level exams, campus contacts).
 * Tier 3: Simulated academic advisor personalized guidance in Arabic and English.
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
 * Authoritative built-in catalog of Al-Zaytoonah University of Jordan (ZUJ)
 * academic regulations, fees, attendance rules, exam policies, and campus contacts.
 */
export const BUILTIN_FAQS: FaqItem[] = [
  {
    id: 101,
    category: "Registration / التسجيل",
    categoryAr: "التسجيل والسحب والإضافة",
    question: "When is the drop and add period and how does it work?",
    questionAr: "متى تبدأ فترة السحب والإضافة وكيف تتم؟",
    answer: "The drop/add period begins at the start of each semester and lasts for one week according to the official Al-Zaytoonah University academic calendar. You can add or drop courses via the student registration portal without academic penalty. Individual course withdrawal with partial refund continues up to week 5, and withdrawal without refund continues up to week 14 (week 7 in summer).",
    answerAr: "تبدأ فترة السحب والإضافة مع بداية كل فصل دراسي وتستمر لمدة أسبوع واحد وفق التقويم الجامعي الرسمي لجامعة الزيتونة الأردنية. يمكنك تعديل جدولك الدراسي عبر البوابة الإلكترونية دون أي غرامة أكاديمية. ويستمر الانسحاب من المقررات مع استرداد جزئي حتى الأسبوع الخامس، والانسحاب دون استرداد حتى الأسبوع 14 (الأسبوع 7 للصيفي).",
  },
  {
    id: 102,
    category: "Academic Standing / الإنذار الأكاديمي",
    categoryAr: "الإنذار والمحاكمة الأكاديمية",
    question: "What are the rules regarding academic probation and warning?",
    questionAr: "ما هي تعليمات الإنذار الأكاديمي والمحاكمة؟",
    answer: "According to Article 18 of ZUJ regulations, a student is placed on 1st Academic Warning if their cumulative GPA falls below 60% (2.00 out of 4.00) in any regular semester after their first. If not raised in the following regular semester, a 2nd Warning is issued. The student is granted up to 2 regular semesters to clear the probation. Dismissal from major applies if not cleared, unless the student completed 70% or more of degree credits. Summer semesters do not count for issuing warnings.",
    answerAr: "وفقاً للمادة 18 من تعليمات جامعة الزيتونة الأردنية، يوجه الإنذار الأول للطالب إذا قل معدله التراكمي عن 60% (2.00 من 4.00) في أي فصل عادي بعد فصل التحاقه الأول. وفي حال لم يرفع معدله في الفصل العادي التالي يوجه له الإنذار الثاني ويُمنح مهلة فصلين عاديين لإلغائه. يفصل الطالب من التخصص إذا استنفد المهلة، ويستثنى من ذلك من أتم 70% فأكثر من ساعات الخطة. لا تصدر إنذارات في الفصل الصيفي.",
  },
  {
    id: 103,
    category: "Credit Hours / الساعات المعتمدة",
    categoryAr: "العبء الدراسي والساعات المعتمدة",
    question: "What are the minimum and maximum credit hours per semester?",
    questionAr: "ما هو الحد الأدنى والأعلى للساعات المعتمدة في الفصل الدراسي؟",
    answer: "Per Article 10 of ZUJ regulations, the minimum regular semester load is 12 credit hours, and the maximum is 18 credit hours (can be raised to 21 credit hours with Dean approval for graduating seniors in their final semester). For the summer semester, the maximum load is 10 credit hours (13 credit hours for graduating seniors).",
    answerAr: "وفقاً للمادة 10 من تعليمات الجامعة، الحد الأدنى لتسجيل الساعات في الفصل الدراسي العادي هو 12 ساعة معتمدة، والحد الأقصى 18 ساعة معتمدة (يجوز رفعه إلى 21 ساعة بموافقة العميد للطالب المتوقع تخرجه في فصل التخرج). وفي الفصل الصيفي الحد الأقصى 10 ساعات معتمدة (13 ساعة للمتخرج).",
  },
  {
    id: 104,
    category: "Attendance / الحضور والغياب",
    categoryAr: "تعليمات الحضور والغياب والحرمان",
    question: "What is the university attendance and absence policy?",
    questionAr: "ما هي سياسة الحضور والغياب والحد المسموح به للغياب؟",
    answer: "Per Article 11, student absences must not exceed 15% of total course lecture hours (approx. 8 lectures for face-to-face courses, 5 for blended). Exceeding 15% without an accepted excuse results in course deprivation with a grade of zero (0) entered into GPA calculation. Excused absences up to 20% require approval from the University Health Center within 2 weeks and result in withdrawal ('W') rather than deprivation.",
    answerAr: "تنص المادة 11 من تعليمات جامعة الزيتونة الأردنية على ألا يتجاوز غياب الطالب 15% من مجموع ساعات المحاضرات (حوالي 8 محاضرات للوجاهي و5 للمدمج). تجاوز 15% دون عذر مقبول يؤدي إلى الحرمان ورصد علامة صفر (0) تدخل في المعدل والإنذار. يسمح بالغياب بعذر مقبول حتى 20% بشرط اعتماده من عيادة الجامعة خلال أسبوعين ويترتب عليه تثبيت كلمة (منسحب) دون حرمان.",
  },
  {
    id: 105,
    category: "Exams / الامتحانات",
    categoryAr: "تعارض الامتحانات والامتحانات التكميلية",
    question: "What happens if two final exams conflict at the same time?",
    questionAr: "ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟",
    answer: "In the event of a final exam conflict, exams are prioritized: 1. University requirement (outside faculty), 2. College requirement (outside major), 3. Departmental course (inside major). The lower priority exam is postponed and graded as Incomplete ('غير مكتمل'), and the student sits for the makeup exam during weeks 1 to 4 of the following semester (Article 15).",
    answerAr: "في حال تعارض موعد امتحانين نهائيين، يتم التقديم وفق الأولويات التالية: 1. الامتحان خارج الكلية (متطلبات الجامعة)، 2. الامتحان خارج التخصص (متطلبات الكلية)، 3. الامتحان داخل التخصص. ويتم تأجيل الامتحان ذي الأولوية الأقل ورصد علامة (غير مكتمل) ليؤديه الطالب خلال الأسابيع الأربعة الأولى من الفصل التالي (المادة 15).",
  },
  {
    id: 106,
    category: "Graduation / التخرج",
    categoryAr: "متطلبات وشروط التخرج",
    question: "What are the requirements for bachelor degree graduation?",
    questionAr: "ما هي شروط ومتطلبات التخرج ونيل درجة البكالوريوس؟",
    answer: "Graduation requirements per Articles 27 and 28: 1. Successfully complete 133 credit hours for IT/CS/SE/AI/Cybersecurity programs (132 for Mathematics). 2. Cumulative GPA not less than 60% (2.00 out of 4.00). 3. Fulfill all mandatory faculty, university, and department requirements. 4. Complete at least the final 2 regular semesters in residency at ZUJ. Maximum study duration is 7 years for Science & IT.",
    answerAr: "شروط التخرج وفق المادتين 27 و28: 1. إتمام 133 ساعة معتمدة بنجاح لتخصصات الحاسوب والذكاء الاصطناعي وهندسة البرمجيات والأمن السيبراني (132 ساعة للرياضيات). 2. تحقيق معدل تراكمي لا يقل عن 60% (2.00 من 4.00). 3. استيفاء كافة متطلبات الجامعة والكلية والتخصص والتدريب الميداني. 4. قضاء آخر فصلين دراسيين عاديين في الجامعة كطالب منتظم. والحد الأقصى للدراسة 7 سنوات لكلية العلوم وتكنولوجيا المعلومات.",
  },
  {
    id: 107,
    category: "Prerequisites / المتطلبات السابقة",
    categoryAr: "شروط المتطلبات السابقة والتزامنية",
    question: "Can I take a course without fulfilling its prerequisite?",
    questionAr: "هل يمكن تسجيل مادة دون اجتياز متطلبها السابق؟",
    answer: "No, university regulations strictly prohibit enrolling in a course without successfully passing all prerequisites. In the student's graduation semester only, concurrent enrollment in a course and its prerequisite may be approved with the Dean's formal waiver.",
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
    answer: "The student must submit an official medical report approved by the university clinic or an emergency excuse to the Dean's office within 2 weeks of the exam date. If approved, an 'Incomplete' grade is recorded and the makeup exam is conducted during the first four weeks of the following semester (Article 15).",
    answerAr: "يجب على الطالب تقديم التقرير الطبي المعتمد من عيادة الجامعة أو العذر القهري إلى عمادة الكلية خلال أسبوعين من موعد الامتحان. في حال قبوله، تُرصد علامة (غير مكتمل) ويُعقد الامتحان التعويضي خلال الأسابيع الأربعة الأولى من الفصل التالي (المادة 15).",
  },
  {
    id: 110,
    category: "Academic Advising / الإرشاد الأكاديمي",
    categoryAr: "التواصل مع الأوليفر الأكاديمي",
    question: "How can I book an appointment with my academic advisor?",
    questionAr: "كيف يمكنني حجز موعد مع أوليفري الأكاديمي؟",
    answer: "You can book an advising appointment directly through the Oliver platform under the Appointments tab, or visit your advisor during their announced office hours displayed on their profile.",
    answerAr: "يمكنك حجز موعد مع أوليفرك الأكاديمي مباشرة عبر منصة أوليفر من تبويب المواعيد، أو مراجعة الأوليفر خلال الساعات المكتبية المعلنة في الملف الشخصي للأوليفر في الكلية.",
  },
  {
    id: 111,
    category: "Finance / المالية والرسوم",
    categoryAr: "الرسوم الدراسية وحساب التكلفة",
    question: "What are the tuition rates, semester fees, and discounts at ZUJ?",
    questionAr: "كم سعر الساعة والرسوم الفصلية والخصومات في جامعة الزيتونة؟",
    answer: "Faculty of Science & IT tuition: 75 JOD/credit hour for CS, Software Engineering, AI & Data Science, and Cybersecurity (60 JOD for Mathematics). Regular semester registration fee is 350 JOD (175 JOD for summer). Discounts: 40% for students with Excellent standing, 30% for Very Good standing. Note: Discounts apply exclusively to credit hour fees, never to the semester registration fee. Total formula: (Credits * Rate * (1 - Discount)) + RegistrationFee. Finance contact: 0796428046 / 0775150046.",
    answerAr: "رسوم كلية العلوم وتكنولوجيا المعلومات: 75 ديناراً للساعة المعتمدة لتخصصات علم الحاسوب، هندسة البرمجيات، الذكاء الاصطناعي، والأمن السيبراني (60 ديناراً للرياضيات). رسم التسجيل الفصلي 350 ديناراً (175 ديناراً للصيفي). الخصومات: 40% للطلبة الحاصلين على تقدير ممتاز، و30% لتقدير جيد جداً. ملاحظة حاسمة: الخصم يطبق فقط على رسوم الساعات وليس على رسم التسجيل. معادلة الحساب: (عدد الساعات × سعر الساعة × (1 - الخصم)) + رسم التسجيل. هاتف الدائرة المالية: 0796428046 / 0775150046.",
  },
  {
    id: 112,
    category: "Add/Drop & Refund / الانسحاب واسترداد الرسوم",
    categoryAr: "جدول استرداد الرسوم عند الانسحاب من المقررات",
    question: "What is the financial deduction and refund schedule when withdrawing from a course?",
    questionAr: "ما هو جدول الخصم المالي واسترداد الرسوم عند الانسحاب من مادة؟",
    answer: "Per Article 21: Free add/drop during week 1. Course withdrawal refund schedule: Weeks 1–2: loses 25% (refunded 75%). Weeks 3–4: loses 50% (refunded 50%). Week 5: loses 75% (refunded 25%). After Week 5: loses 100% (no refund). Remaining credit load after withdrawal cannot drop below 12 credits.",
    answerAr: "وفقاً للمادة 21 من التعليمات: فترة السحب والإضافة مجانية خلال الأسبوع الأول. جدول استرداد الرسوم عند الانسحاب من مقرر: الأسبوع 1-2: حسم 25% (استرداد 75%). الأسبوع 3-4: حسم 50% (استرداد 50%). الأسبوع 5: حسم 75% (استرداد 25%). بعد الأسبوع الخامس: حسم 100% (لا يوجد استرداد). ولا يجوز أن يقل العبء الدراسي بعد الانسحاب عن 12 ساعة معتمدة.",
  },
  {
    id: 113,
    category: "Level Exams / امتحانات المستوى",
    categoryAr: "امتحانات المستوى والمواد الاستدراكية",
    question: "What are the level exams and remedial courses policy?",
    questionAr: "ما هي تعليمات امتحانات المستوى والمواد الاستدراكية؟",
    answer: "Newly admitted students sit for level exams in Arabic, English, and Computer Skills (10 JOD per exam). Passing with >= 50% exempts the student from remedial courses. Scoring >= 80% exempts the student from introductory Level 1 university courses. Failure requires completing remedial courses outside degree credit hours.",
    answerAr: "يتقدم الطالب المستجد لامتحانات المستوى في اللغة العربية، اللغة الإنجليزية، ومهارات الحاسوب (رسم الامتحان 10 دنانير). الحصول على 50% فأكثر يعفي الطالب من المادة الاستدراكية. والحصول على 80% فأكثر يعفي الطالب من مادة متطلب الجامعة للمستوى الأول. وفي حال الإخفاق يلتزم الطالب بدراسة المادة الاستدراكية دون احتساب ساعاتها ضمن الخطة.",
  },
  {
    id: 114,
    category: "Campus Directory / دليل الكلية والمكاتب",
    categoryAr: "مكاتب عمادة كلية العلوم وتكنولوجيا المعلومات والتواصل",
    question: "Where are the Dean's office, department heads, and FSIT contacts located?",
    questionAr: "أين يقع مكتب العميد ورؤساء الأقسام وأرقام التواصل بكلية العلوم وتكنولوجيا المعلومات؟",
    answer: "Faculty of Science & IT (FSIT Building, Airport Road): Dean's Office: Floor 3, Room 3-101. Vice Dean: Floor 3, Room 3-102. CS Department Head: Floor 1, Room 1-101. IT Department Head: Floor 1, Room 1-106. Student Affairs & Reception: Ground Floor, Room G-002. Faculty Phone: +962-6-4291511 (Extensions: 331, 332, 334, 370, 469). Faculty Email: it@zuj.edu.jo.",
    answerAr: "كلية العلوم وتكنولوجيا المعلومات (مبنى FSIT - طريق مطار الملكة علياء): مكتب العميد: الطابق الثالث، غرفة 3-101. نائب العميد: الطابق الثالث، غرفة 3-102. رئيس قسم علوم الحاسوب: الطابق الأول، غرفة 1-101. رئيس قسم تكنولوجيا المعلومات: الطابق الأول، غرفة 1-106. الاستقبال وشؤون الطلبة: الطابق الأرضي، غرفة G-002. هاتف الكلية: 064291511 (فرعي: 331، 332، 334، 370، 469). البريد الإلكتروني: it@zuj.edu.jo.",
  },
  {
    id: 115,
    category: "Field Training / التدريب الميداني",
    categoryAr: "تعليمات التدريب الميداني ومشروع التخرج",
    question: "What are the requirements for Field Training and Capstone Project?",
    questionAr: "ما هي شروط تسجيل التدريب الميداني ومشروع التخرج؟",
    answer: "Field Training requires successfully completing at least 90 credit hours in your study plan. Capstone Project 1 also requires completing 90+ credits and departmental approval. Capstone Project 2 requires successfully passing Capstone Project 1.",
    answerAr: "يشترط لتسجيل التدريب الميداني إتمام ما لا يقل عن 90 ساعة معتمدة بنجاح من الخطة الدراسية. وكذلك يشترط لتسجيل مشروع التخرج (1) إتمام 90 ساعة معتمدة وموافقة القسم الأكاديمي. ويشترط لتسجيل مشروع التخرج (2) اجتياز مشروع التخرج (1) بنجاح.",
  },
  {
    id: 116,
    category: "Schedule / دوام الأربعة أيام",
    categoryAr: "نظام دوام الأربعة أيام والأسبوع الأكاديمي",
    question: "What is the 4-day academic schedule at ZUJ and how does it work?",
    questionAr: "ما هو نظام دوام الأربعة أيام في جامعة الزيتونة وكيف يعمل؟",
    answer: "At Al-Zaytoonah University of Jordan, teaching operates strictly on a 4-day week from Sunday to Wednesday. Thursday, Friday, and Saturday are non-teaching days dedicated to Moodle e-learning activities, lab practicals, independent project development, and academic advising consultations. Lectures follow either Sunday/Tuesday or Monday/Wednesday pairings.",
    answerAr: "تعتمد جامعة الزيتونة الأردنية نظام دوام أسبوعي مكوّن من أربعة أيام دراسية فقط من يوم الأحد إلى يوم الأربعاء. أيام الخميس والجمعة والسبت أيام مخصصة للأنشطة الإلكترونية على منصة Moodle، وتطبيقات المختبرات، والمشاريع الطلابية، ومراجعة المرشدين الأكاديميين. وتتوزع المحاضرات في أزواج: الأحد/الثلاثاء والإثنين/الأربعاء.",
  },
  {
    id: 117,
    category: "Delivery Modalities / أساليب التدريس والمدمج",
    categoryAr: "أساليب التدريس الثلاثة ونظام التعليم المدمج",
    question: "How do integrated (blended) courses work and how is attendance tracked?",
    questionAr: "كيف يعمل نمط التعليم المدمج وكيف يُحتسب حضور وغياب الأنشطة الإلكترونية؟",
    answer: "ZUJ courses follow three official delivery modalities: 1. Integrated/Blended (مدمج): 2 scheduled weekly slots, but ONLY 1 slot is an in-person physical lecture (Sun or Mon) and the 2nd slot (Tue or Wed) is an asynchronous E-Learning Activity on Moodle (elearning.zuj.edu.jo). Attendance for activity days is verified through timely submission of the e-activity/quiz. 2. Face-to-Face (وجاهي كامل): Both slots are held in physical campus classrooms/labs. 3. Online via MS Teams (إلكتروني كامل عن بُعد عبر تيمز): Live synchronous lectures on Microsoft Teams.",
    answerAr: "تُقسّم المقررات في جامعة الزيتونة إلى 3 أنماط تدريسية رسمية: 1. التعليم المدمج (مدمج): موعدان أسبوعياً، لكن أحدهما فقط محاضرة وجاهية بالقاعة (الأحد أو الإثنين)، والموعد الثاني (الثلاثاء أو الأربعاء) نشاط إلكتروني تفاعلي عبر منصة Moodle (elearning.zuj.edu.jo). ويُحتسب حضور النشاط الإلكتروني عبر تسليم الواجب أو الكويز قبل الموعد النهائي. 2. وجاهي كامل: كلا المحاضرتين وجاهية في الحرم الجامعي والمختبرات. 3. إلكتروني كامل عن بُعد عبر تيمز: محاضرات تفاعلية مباشرة عبر Microsoft Teams.",
  },
  {
    id: 118,
    category: "Grading System / نظام العلامات المئوي",
    categoryAr: "نظام العلامات المئوي من 100 وسلم التقديرات",
    question: "How does the official ZUJ 100% score system and grading scale work?",
    questionAr: "كيف يعمل نظام العلامات المئوي المعتمد في جامعة الزيتونة وسلم التقديرات؟",
    answer: "ZUJ evaluates academic standing primarily on the continuous 100% scale with secondary 4.0 GPA equivalent: Excellent (84% - 100% / GPA 3.50 - 4.00), Very Good (76% - 83.99% / GPA 3.00 - 3.49), Good (68% - 75.99% / GPA 2.50 - 2.99), Acceptable (60% - 67.99% / GPA 2.00 - 2.49, minimum required for graduation), Academic Probation (50% - 59.99% / GPA 1.50 - 1.99), and Failing (< 50% / GPA < 1.50). Arabic letter grades range from (أ+ = 96%) down to (هـ = 45% راسب).",
    answerAr: "تعتمد جامعة الزيتونة الأردنية النظام المئوي (من 100%) كأساس لاحتساب المعدل التراكمي وتصنيف التقدير: ممتاز (84% - 100% / مكافئ 3.50 - 4.00)، جيد جداً (76% - 83.99% / مكافئ 3.00 - 3.49)، جيد (68% - 75.99% / مكافئ 2.50 - 2.99)، مقبول (60% - 67.99% / مكافئ 2.00 - 2.49 وهو الحد الأدنى المطلوب للتخرج)، وضعيف/إنذار (50% - 59.99% / مكافئ 1.50 - 1.99)، وراسب (< 50% / مكافئ أقل من 1.50 وعلامة هـ). سلم التقديرات بالحروف يبدأ من (أ+ = 96%) وصولاً إلى (هـ = 45%).",
  },
  {
    id: 119,
    category: "Merit Discounts / خصومات التفوق",
    categoryAr: "شروط وضوابط خصم التفوق الأكاديمي على الرسوم",
    question: "What are the requirements for academic merit discounts on tuition fees?",
    questionAr: "ما هي شروط وضوابط الحصول على خصم التفوق الأكاديمي على الرسوم؟",
    answer: "ZUJ awards tuition merit discounts based on cumulative GPA: 1. Students with Excellent standing (cumulative GPA >= 3.50 or >= 84%) receive a 40% discount on credit hour fees. 2. Students with Very Good standing (cumulative GPA >= 3.00 or >= 76%) receive a 30% discount on credit hour fees. CRITICAL RULE: The discount applies strictly to credit hour tuition fees, and NEVER to the semester registration fee (350 JOD regular / 175 JOD summer). Formula: Total = (Credits * Rate * (1 - Discount)) + RegistrationFee.",
    answerAr: "تمنح جامعة الزيتونة خصومات تشجيعية للمتفوقين وفق المعدل التراكمي: 1. الطلبة الحاصلون على تقدير ممتاز (معدل تراكمي >= 3.50 أو >= 84%) يحصلون على خصم 40% من رسوم الساعات المعتمدة. 2. الطلبة الحاصلون على تقدير جيد جداً (معدل تراكمي >= 3.00 أو >= 76%) يحصلون على خصم 30% من رسوم الساعات المعتمدة. قاعدة أساسية: الخصم يُطبق حصراً على رسوم الساعات الدراسية ولا يشمل رسم التسجيل الفصلي (350 ديناراً للفصل العادي و175 للصيفي). معادلة الحساب: التكلفة = (عدد الساعات × سعر الساعة × (1 - الخصم)) + رسم التسجيل.",
  },
  {
    id: 120,
    category: "Campus & Labs / القاعات والمختبرات",
    categoryAr: "موقع قاعة 9303 ومختبرات كلية العلوم وتكنولوجيا المعلومات",
    question: "Where are Hall 9303 and computer labs located in the IT building?",
    questionAr: "أين تقع قاعة 9303 ومختبرات الحاسوب في مبنى كلية العلوم وتكنولوجيا المعلومات؟",
    answer: "Faculty of Science & IT (FSIT Building, Airport Road): Hall 9303 is a major lecture amphitheater located on Floor 3 (Room 9303) adjacent to Dean's Office 3-101. Computer teaching labs (including Lab 60-9136م and Lab 9137م) and the AI Research Lab are situated on Floor 1 and Ground Floor. The building is directly accessible from Main Gate 1 via the scenic Olive Grove Walkway (ممر الزيتون).",
    answerAr: "كلية العلوم وتكنولوجيا المعلومات (مبنى FSIT - طريق المطار): تقع قاعة 9303 في الطابق الثالث (غرفة 9303) بجوار مكتب عميد الكلية 3-101. وتقع مختبرات التدريس الحاسوبية (بما فيها مختبر 60-9136م ومختبر 9137م ومختبر أبحاث الذكاء الاصطناعي) في الطابق الأول والطابق الأرضي. ويمكن الوصول للمبنى مباشرة من البوابة الرئيسية (بوابة 1) عبر ممر الزيتون المركزي الممهد.",
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
    const ansAr = faq.answerAr || faq.answer || "";
    const ansEn = faq.answer || faq.answerAr || "";

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

    // If strong match (at least 2 matching significant tokens or single token matching when query has only 1 token)
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
 * Tier 2: Academic rules intent detector using student context & ZUJ regulations
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
  const totCredits = ctx.totalCredits || 133;
  const remCredits = Math.max(0, totCredits - compCredits);
  const progressPercent = Math.min(100, Math.round((compCredits / totCredits) * 100));

  // 1. GPA Inquiry
  if (/(معدلي|المعدل التراكمي|كم معدلي|معدل|gpa|cumulative gpa|my grade)/i.test(norm)) {
    const standingAr = numGpa >= 3.5 ? "ممتاز (لوحة الشرف)" : numGpa >= 3.0 ? "جيد جداً" : numGpa >= 2.5 ? "جيد" : numGpa >= 2.0 ? "مقبول" : "حرج (تحت الإنذار الأكاديمي)";
    const standingEn = numGpa >= 3.5 ? "Excellent (Dean's Honor List)" : numGpa >= 3.0 ? "Very Good" : numGpa >= 2.5 ? "Good" : numGpa >= 2.0 ? "Satisfactory" : "Critical (Academic Probation)";

    const answer = lang === "ar"
      ? `📊 **بيانات المعدل التراكمي:**\n- **المعدل الحالي:** **${gpaStr}** من 4.00\n- **التخصص:** ${ctx.major}\n- **التقييم الأكاديمي:** ${standingAr}\n\n💡 **توصية الأوليفر الأكاديمي:** ${numGpa < 2.0 ? "أنت حالياً تحت حد الإنذار (2.00 / 60%). نوصيك بإعادة المقررات الحاصل فيها على (D أو F) ومراجعة أوليفرك الأكاديمي فوراً." : numGpa < 2.5 ? "معدلك في النطاق الآمن لكن يحتاج إلى تعزيز. ركّز على تنظيم ساعات الدراسة ومتابعة التكاليف أولاً بأول." : "أداؤك الأكاديمي متميز ومشرّف! واصل الحفاظ على هذا التفوق للمنافسة على لوحة شرف الكلية والخصم التشجيعي (40%)."}`
      : `📊 **Cumulative GPA Overview:**\n- **Current GPA:** **${gpaStr}** / 4.00\n- **Major:** ${ctx.major}\n- **Academic Classification:** ${standingEn}\n\n💡 **Advisor Guidance:** ${numGpa < 2.0 ? "Your GPA is below the 2.00 probation threshold (60%). We strongly advise repeating D/F courses and meeting with your academic advisor immediately." : numGpa < 2.5 ? "Your GPA is in good standing but has room for improvement. Focus on coursework consistency and exam preparation." : "Excellent academic performance! Keep up the great effort to maintain your position on the Dean's Honor Roll and qualify for tuition discounts (40%)."}`;

    return { answer, intent: "gpa_inquiry" };
  }

  // 2. Academic Probation & Standing Check
  if (/(انذار|محاكمه|وضع اكاديمي|مفصول|تحذير|probation|warning|standing|under warning)/i.test(norm)) {
    const isProbation = numGpa < 2.0;
    const answer = lang === "ar"
      ? isProbation
        ? `⚠️ **حالة الإنذار الأكاديمي (المادة 18):**\nمعدلك التراكمي الحالي (**${gpaStr}**) أقل من الحد الأدنى المطلوب للتخرج (2.00 نقطة / 60%)، مما يضعك تحت **الإنذار الأكاديمي**.\n\n**التعليمات والخطة العلاجية:**\n1. يمنح الطالب مهلة فصلين دراسيين عاديين متتاليين لرفع المعدل إلى 2.00.\n2. تسجيل عبء دراسي معتدل (12-14 ساعة معتمدة كحد أقصى).\n3. إعادة المواد ذات العلامات المتدنية (D أو F) لرفع المعدل التراكمي سريعاً.\n4. لا تصدر إنذارات في الفصل الصيفي ويعتبر فرصة ممتازة لرفع المعدل.\n5. مراجعة الأوليفر الأكاديمي لتثبيت الخطة العلاجية.`
        : `✅ **الوضع الأكاديمي سليم (Good Standing):**\nمعدلك الحالي (**${gpaStr}**) أعلى من حد الإنذار الأكاديمي (2.00 نقطة / 60%). سجلك الأكاديمي نظيف وخالٍ من الإنذارات أو المحاكمات الأكاديمية.`
      : isProbation
        ? `⚠️ **Academic Probation Status (Article 18):**\nYour current GPA (**${gpaStr}**) is below the minimum required 2.00 threshold (60%), placing you on **Academic Probation**.\n\n**Regulations & Remedial Plan:**\n1. You are granted up to 2 regular semesters to raise your GPA to 2.00.\n2. Register a moderate course load (12-14 credit hours max).\n3. Retake courses with low grades (D or F) to quickly recover your GPA.\n4. Academic warnings are never issued in summer; summer serves as an extra recovery term.\n5. Consult your faculty advisor immediately for an academic recovery plan.`
        : `✅ **Good Academic Standing:**\nYour current GPA (**${gpaStr}**) is comfortably above the 2.00 warning threshold (60%). Your record is free of any academic probations or warnings.`;

    return { answer, intent: "probation_check" };
  }

  // 3. Attendance & Absence Rate Check
  if (/(غيابي|حضور|نسبه الغياب|محروم|حرمان|attendance|absence|absent|deprived)/i.test(norm)) {
    const isNearDeprivation = attRate < 85;
    const answer = lang === "ar"
      ? `📋 **تقرير الحضور والغياب (المادة 11 من تعليمات الجامعة):**\n- **نسبة الحضور الإجمالية:** **${attRate}%**\n- **نسبة الغياب المقدرة:** **${100 - attRate}%**\n- **حد الحرمان الأكاديمي:** 15% غياب بدون عذر (حوالي 8 محاضرات وجاهية أو 5 مدمجة).\n- **عقوبة الحرمان:** رصد علامة صفر (0) في المقرر وتدخل في حساب المعدل.\n\n${isNearDeprivation ? "⚠️ **تنبيه هام:** نسبة غيابك تقترب من حد الحرمان (15%)! يرجى تقديم أي أعذار طبية معتمدة من عيادة الجامعة لعميد الكلية خلال أسبوعين، والالتزام بحضور المحاضرات القادمة." : "✅ **حالة الحضور:** نسبة حضورك ممتازة وضمن الحدود الآمنة للجامعة. استمر في هذا الالتزام."}`
      : `📋 **Attendance & Absence Report (ZUJ Article 11):**\n- **Overall Attendance Rate:** **${attRate}%**\n- **Estimated Absence Rate:** **${100 - attRate}%**\n- **Official Deprivation Limit:** 15% unexcused absence (approx. 8 lectures face-to-face, 5 blended).\n- **Deprivation Penalty:** A grade of zero (0) entered into GPA calculation.\n\n${isNearDeprivation ? "⚠️ **Urgent Alert:** Your absence rate is nearing the 15% deprivation limit! Submit any official medical excuses from the university clinic to the Dean within 2 weeks, and attend all upcoming lectures." : "✅ **Status:** Your attendance record is solid and well within safe limits. Keep up the punctuality."}`;

    return { answer, intent: "attendance_check" };
  }

  // 4. Graduation & Credit Completion Forecast
  if (/(تخرج|كم ساعه باقيه|ساعات التخرج|متى اتخرج|remaining credits|graduate|graduation|credits left)/i.test(norm)) {
    const semLeft = Math.ceil(remCredits / 16);
    const answer = lang === "ar"
      ? `🎓 **مسار التخرج وإنجاز الخطة الدراسية (المادتان 27 و28):**\n- **الساعات المنجزة:** **${compCredits}** ساعة معتمدة.\n- **الساعات الإجمالية المطلوبة:** **${totCredits}** ساعة معتمدة.\n- **الساعات المتبقية للتخرج:** **${remCredits}** ساعة معتمدة.\n- **نسبة إنجاز الخطة:** **${progressPercent}%**\n- **الفصول التقديرية المتبقية:** حوالي **${semLeft}** فصول دراسية (بمعدل 15-18 ساعة للفصل).\n\n📌 **شروط نيل الدرجة:**\n1. إتمام كامل ساعات الخطة بمعدل تراكمي لا يقل عن 2.00 (60%).\n2. قضاء آخر فصلين دراسيين عاديين في الجامعة.\n3. إتمام التدريب الميداني بنجاح (بعد إنجاز 90 ساعة معتمدة).`
      : `🎓 **Graduation Progress & Degree Roadmap (Articles 27 & 28):**\n- **Completed Credits:** **${compCredits}** credits.\n- **Total Required:** **${totCredits}** credits.\n- **Remaining Credits:** **${remCredits}** credits.\n- **Degree Completion:** **${progressPercent}%**\n- **Estimated Semesters Remaining:** Approximately **${semLeft}** semesters (averaging 15-18 credits per regular term).\n\n📌 **Graduation Criteria:**\n1. Successful completion of all plan requirements with a minimum cumulative GPA of 2.00 (60%).\n2. Completion of final 2 regular semesters at ZUJ.\n3. Passing Field Training (available after completing 90+ credits).`;

    return { answer, intent: "graduation_credits" };
  }

  // 5. Tuition & Fee Calculator
  if (/(رسوم|تكلفه|سعر الساعه|قديش بطلع|كم بدفع|قسط|tuition|fees|credit price|how much|cost)/i.test(norm)) {
    const isMath = /رياضيات|math/i.test(ctx.major);
    const rate = isMath ? 60 : 75;
    const regFee = 350;
    const numGpaVal = numGpa;
    const discountRate = numGpaVal >= 3.5 ? 0.40 : numGpaVal >= 3.0 ? 0.30 : 0;
    const sampleHours = 15;
    const totalSample = (sampleHours * rate * (1 - discountRate)) + regFee;

    const answer = lang === "ar"
      ? `💰 **حساب الرسوم الدراسية (كلية العلوم وتكنولوجيا المعلومات):**\n- **سعر الساعة المعتمدة لتخصص ${ctx.major}:** **${rate} ديناراً أردنياً**.\n- **رسوم التسجيل الفصلية:** **${regFee} ديناراً** (175 ديناراً للفصل الصيفي).\n- **الخصم التقديري لمعدلك (${gpaStr}):** **${discountRate * 100}%** ${discountRate > 0 ? "(يطبق على رسوم الساعات فقط)" : "(يتطلب معدل 3.00 فأكثر للحصول على خصم 30% أو 3.50 لخصم 40%)"}.\n\n📊 **مثال لحساب فصل عادي (15 ساعة معتمدة):**\n\`التكلفة = (15 × ${rate} × ${(1 - discountRate).toFixed(2)}) + ${regFee} = ${totalSample} دينار أردني\`.\n\n📞 **للاستفسارات المالية:** الدائرة المالية: 0796428046 / 0775150046.`
      : `💰 **Tuition & Fees Breakdown (Faculty of Science & IT):**\n- **Credit Hour Rate for ${ctx.major}:** **${rate} JOD**.\n- **Semester Registration Fee:** **${regFee} JOD** (175 JOD for summer term).\n- **Estimated Discount for your GPA (${gpaStr}):** **${discountRate * 100}%** ${discountRate > 0 ? "(applies strictly to credit fees)" : "(requires GPA >= 3.00 for 30% discount or >= 3.50 for 40%)"}.\n\n📊 **Calculation Example for a Regular 15-Credit Semester:**\n\`Total = (15 * ${rate} * ${(1 - discountRate).toFixed(2)}) + ${regFee} = ${totalSample} JOD\`.\n\n📞 **Financial Affairs Contact:** +962 (0) 79 6428046 / 0775150046.`;

    return { answer, intent: "tuition_fees" };
  }

  // 6. Current Registered Courses
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

  // 7. Assignments & Tasks
  if (/(واجباتي|تكاليف|مهامي|واجب|assignments|homework|pending tasks)/i.test(norm)) {
    const pendingCount = ctx.pendingAssignments ?? 0;
    const answer = lang === "ar"
      ? `📝 **الواجبات والتكليفات الأكاديمية:**\nلديك حالياً **${pendingCount}** واجبات معلقة قيد التسليم.\n\n${pendingCount > 0 ? "⚠️ احرص على مراجعة مواعيد الاستحقاق في صفحة الواجبات وتسليمها قبل الموعد المحدد لتفادي خسارة درجات المشاركة." : "✅ ليس لديك أي واجبات معلقة حالياً. أحسنت صنعاً!"}`
      : `📝 **Academic Assignments & Deadlines:**\nYou currently have **${pendingCount}** pending assignments awaiting submission.\n\n${pendingCount > 0 ? "⚠️ Please visit the Assignments tab and submit your coursework before the deadlines to secure full participation marks." : "✅ No pending assignments at the moment. Excellent job staying on track!"}`;

    return { answer, intent: "assignments_check" };
  }

  // 8. Academic Alerts
  if (/(تنبيهات|اشعارات اكاديميه|alerts|academic alerts|warnings)/i.test(norm)) {
    const alerts = ctx.activeAlerts || [];
    if (alerts.length === 0) {
      const answer = lang === "ar"
        ? "🔔 **التنبيهات الأكاديمية:**\nسجلك الأكاديمي ممتاز! لا توجد أي تنبيهات أو إشعارات أكاديمية مرسلة من أوليفرك حالياً."
        : "🔔 **Academic Alerts:**\nYour record is clear! There are no active academic alerts or warnings from your advisor at this time.";
      return { answer, intent: "alerts_check" };
    }

    const lines = alerts.map((a, i) => `${i + 1}. **${a.title}** (مستوى الخطورة: ${a.severity})`).join("\n");
    const answer = lang === "ar"
      ? `🔔 **التنبيهات الأكاديمية النشطة (${alerts.length}):**\n\n${lines}\n\nيرجى التواصل مع أوليفرك الأكاديمي أو مراجعة التفاصيل في لوحة التحكم لاتخاذ الإجراء المناسب.`
      : `🔔 **Active Academic Alerts (${alerts.length}):**\n\n${lines}\n\nPlease contact your academic advisor to address these items promptly.`;

    return { answer, intent: "alerts_check" };
  }

  // 9. Campus Directory & Office Locations
  if (/(وين مكتب|مكتب العميد|رئيس القسم|شؤون الطلاب|تلفون الكليه|ايميل الكليه|where is office|dean office|contact)/i.test(norm)) {
    const answer = lang === "ar"
      ? `🏢 **دليل مكاتب كلية العلوم وتكنولوجيا المعلومات (مبنى FSIT):**\n- **مكتب العميد:** الطابق الثالث، غرفة **3-101**.\n- **نائب العميد:** الطابق الثالث، غرفة **3-102**.\n- **رئيس قسم علوم الحاسوب:** الطابق الأول، غرفة **1-101**.\n- **رئيس قسم تكنولوجيا المعلومات:** الطابق الأول، غرفة **1-106**.\n- **شؤون الطلبة والاستقبال:** الطابق الأرضي، غرفة **G-002**.\n- **هاتف الكلية:** \`064291511\` (فرعي: 331, 332, 334, 370, 469).\n- **البريد الإلكتروني:** \`it@zuj.edu.jo\`.`
      : `🏢 **Faculty of Science & IT Office Directory (FSIT Building):**\n- **Dean's Office:** Floor 3, Room **3-101**.\n- **Vice Dean's Office:** Floor 3, Room **3-102**.\n- **CS Department Head:** Floor 1, Room **1-101**.\n- **IT Department Head:** Floor 1, Room **1-106**.\n- **Student Affairs & Reception:** Ground Floor, Room **G-002**.\n- **Phone:** \`+962-6-4291511\` (Ext: 331, 332, 334, 370, 469).\n- **Email:** \`it@zuj.edu.jo\`.`;

    return { answer, intent: "campus_offices" };
  }

  // 10. 4-Day Academic Schedule (Sun - Wed)
  if (/(دوام اربع ايام|دوام 4 ايام|الخميس دوام|ايام الدوام|متى الدوام|جدول 4 ايام|4 days schedule|four day week|thursday classes|academic schedule)/i.test(norm)) {
    const answer = lang === "ar"
      ? `📅 **نظام الدوام الأسبوعي في جامعة الزيتونة (4 أيام فقط):**\n- **أيام التدريس الرسمية:** من **الأحد إلى الأربعاء**.\n- **أيام الخميس والجمعة والسبت:** **أيام غير تدريسية**؛ تُخصص للمذاكرة الذاتية، وإنجاز أنشطة التعليم الإلكتروني عبر Moodle، والمشاريع البرمجية، والاستشارات الإرشادية.\n- **توزيع المحاضرات:**\n  * أزواج الأحد / الثلاثاء: محاضرات مواد الـ 3 ساعات (وجاهي ومدمج).\n  * أزواج الإثنين / الأربعاء: محاضرات مواد الـ 3 ساعات (وجاهي ومدمج وعن بُعد عبر تيمز).\n\n💡 **نصيحة أوليفر:** استغل يوم الخميس لإنهاء تسليمات الأنشطة الإلكترونية والواجبات المبرمجة لضمان راحة تامة في عطلة نهاية الأسبوع.`
      : `📅 **ZUJ 4-Day Academic Schedule Overview:**\n- **Official Teaching Days:** **Sunday through Wednesday only**.\n- **Thursday, Friday & Saturday:** **Non-teaching days** dedicated to Moodle e-learning activities, lab practicals, capstone project development, and faculty advising.\n- **Lecture Distribution:**\n  * Sunday / Tuesday pairs: 3-credit lectures (Face-to-Face & Integrated).\n  * Monday / Wednesday pairs: 3-credit lectures (Face-to-Face, Integrated, and MS Teams).\n\n💡 **Oliver Strategy:** Use Thursdays for Moodle activity submissions and project sprints to stay ahead of upcoming deadlines.`;

    return { answer, intent: "four_day_schedule" };
  }

  // 11. Delivery Modalities & Integrated (Blended) Courses
  if (/(مدمج|وجاهي|تيمز|الكتروني|نشاط الكتروني|كيف احضر المدمج|غياب المدمج|blended|integrated|face to face|teams|e-learning activity|modality)/i.test(norm)) {
    const answer = lang === "ar"
      ? `🌿 **أساليب التدريس الرسمية الثلاثة في جامعة الزيتونة الأردنية:**\n\n1. **المقررات المدمجة (Integrated / Blended):**\n   - موعدان أسبوعياً: **محاضرة واحدة فقط وجاهية** في القاعة (الأحد أو الإثنين)، والموعد الثاني **نشاط إلكتروني تفاعلي** عبر منصة Moodle (elearning.zuj.edu.jo).\n   - **كيف يُحتسب الحضور؟** حضور النشاط الإلكتروني يُرصد آلياً عند تسليمك الكويز أو المهمة الإلكترونية قبل الموعد النهائي المعلن.\n\n2. **المقررات الوجاهية بالكامل (Face-to-Face):**\n   - كلا الموعدين الأسبوعيين في الحرم الجامعي (قاعات ومختبرات مبنى IT مثل قاعة 9303 ومختبر 9136م).\n\n3. **المقررات الإلكترونية الكاملة (Online via MS Teams):**\n   - كلا الموعدين الأسبوعيين عبارة عن محاضرات تفاعلية مباشرة عن بُعد عبر Microsoft Teams.\n\n⚠️ **تذكير بالغياب (المادة 11):** الغياب عن أي محاضرة (وجاهية أو نشاط مدمج) يحسب ضمن نسبة الـ 15% القصوى للحرمان.`
      : `🌿 **Official Teaching Modalities at ZUJ:**\n\n1. **Integrated / Blended Courses (مدمج):**\n   - 2 weekly slots: **ONLY 1 in-person physical lecture** (Sunday or Monday) and the 2nd slot is an **asynchronous E-Learning Activity** on Moodle (elearning.zuj.edu.jo).\n   - **Attendance Tracking:** Activity day attendance is confirmed by submitting your weekly Moodle quiz or assignment before the stated deadline.\n\n2. **Face-to-Face Courses (وجاهي كامل):**\n   - Both weekly slots are held in physical campus classrooms or labs (e.g. IT Hall 9303 or Lab 9136م).\n\n3. **Fully Online via MS Teams (إلكتروني كامل عن بُعد عبر تيمز):**\n   - Both sessions are held live synchronously on Microsoft Teams.\n\n⚠️ **Absence Reminder (Article 11):** Absence from either physical lectures or Moodle activities counts toward your 15% deprivation limit.`;

    return { answer, intent: "course_modality" };
  }

  // 12. Continuous 100% Percentage Scale & Letter Grades
  if (/(سلم العلامات|المعدل المئوي|علامه مئويه|معدل من 100|كم بالميه|سلم التقديرات|percentage score|100 scale|letter grade|grading scale)/i.test(norm)) {
    const answer = lang === "ar"
      ? `📊 **نظام العلامات المئوي المعتمد (جامعة الزيتونة الأردنية):**\nتُعتمد العلامة المئوية كأساس لتقييم الطالب وحساب المعدل التراكمي:\n\n- **ممتاز (Excellent):** 84.0% - 100% (مكافئ 3.50 - 4.00) ➔ **يمنح خصم 40% على رسوم الساعات**.\n- **جيد جداً (Very Good):** 76.0% - 83.99% (مكافئ 3.00 - 3.49) ➔ **يمنح خصم 30% على رسوم الساعات**.\n- **جيد (Good):** 68.0% - 75.99% (مكافئ 2.50 - 2.99).\n- **مقبول (Satisfactory):** 60.0% - 67.99% (مكافئ 2.00 - 2.49) ➔ **الحد الأدنى المطلوب للتخرج**.\n- **ضعيف / إنذار (Probation):** 50.0% - 59.99% (مكافئ 1.50 - 1.99).\n- **راسب (Fail):** أقل من 50.0% (رمز هـ / مكافئ أقل من 1.50).\n\n📌 **معدلك الحالي:** **${numGpa > 20 ? numGpa.toFixed(1) : (numGpa >= 3.5 ? (84 + (numGpa - 3.5) * 22.5).toFixed(1) : (numGpa * 24).toFixed(1))}%** (على سلم 4.00: **${gpaStr}**).`
      : `📊 **Official ZUJ 100% Continuous Score System:**\nAl-Zaytoonah University evaluates academic standing primarily on the 100% percentage scale:\n\n- **Excellent:** 84.0% - 100% (3.50 - 4.00 GPA) ➔ **40% Tuition Merit Discount**.\n- **Very Good:** 76.0% - 83.99% (3.00 - 3.49 GPA) ➔ **30% Tuition Merit Discount**.\n- **Good:** 68.0% - 75.99% (2.50 - 2.99 GPA).\n- **Acceptable:** 60.0% - 67.99% (2.00 - 2.49 GPA) ➔ **Minimum Graduation Threshold**.\n- **Academic Warning:** 50.0% - 59.99% (1.50 - 1.99 GPA).\n- **Failing:** Below 50.0% (Grade F / < 1.50 GPA).\n\n📌 **Your Current Standing:** **${numGpa > 20 ? numGpa.toFixed(1) : (numGpa >= 3.5 ? (84 + (numGpa - 3.5) * 22.5).toFixed(1) : (numGpa * 24).toFixed(1))}%** (4.00 Scale: **${gpaStr}**).`;

    return { answer, intent: "percentage_grade_scale" };
  }

  // 13. Merit Tuition Discounts
  if (/(خصم التفوق|خصم معدل|لوحه الشرف|هل بستحق خصم|خصم الرسوم|merit discount|honor discount|am i eligible for discount)/i.test(norm)) {
    const isEligible40 = numGpa >= 3.5 || (numGpa > 20 && numGpa >= 84);
    const isEligible30 = !isEligible40 && (numGpa >= 3.0 || (numGpa > 20 && numGpa >= 76));

    const answer = lang === "ar"
      ? `🎖️ **حالة استحقاق خصم التفوق الأكاديمي (جامعة الزيتونة الأردنية):**\n- **معدلك الحالي:** **${gpaStr}** من 4.00\n- **حالة الخصم:** ${isEligible40 ? "🎉 **مؤهل لخصم 40%** (تقدير ممتاز - لوحة الشرف)" : isEligible30 ? "✅ **مؤهل لخصم 30%** (تقدير جيد جداً)" : "❌ **غير مؤهل حالياً** (يتطلب معدل 3.00 فأكثر للحصول على 30% أو 3.50 للحصول على 40%)"}.\n\n📌 **القاعدة المالية الجوهرية:**\nالخصم يطبق فقط على رسوم الساعات المعتمدة ولا يشمل رسوم التسجيل الفصلية (350 ديناراً للفصل العادي).\n\n💡 **مثال لحساب التوفير المالي (15 ساعة × 75 ديناراً = 1125 ديناراً):**\n- مع خصم 40%: توفر **450 ديناراً** وتدفع 675 د.أ لساعات الفصل.\n- مع خصم 30%: توفر **337.5 ديناراً** وتدفع 787.5 د.أ لساعات الفصل.`
      : `🎖️ **Academic Merit Tuition Discount Status (ZUJ):**\n- **Your Current GPA:** **${gpaStr}** / 4.00\n- **Discount Status:** ${isEligible40 ? "🎉 **Eligible for 40% Discount** (Excellent - Dean's Honor Roll)" : isEligible30 ? "✅ **Eligible for 30% Discount** (Very Good standing)" : "❌ **Not currently eligible** (Requires GPA >= 3.00 for 30% or >= 3.50 for 40%)"}.\n\n📌 **Essential Financial Regulation:**\nThe discount applies strictly to credit hour tuition fees, and never to the regular semester registration fee (350 JOD).\n\n💡 **Savings Example (15 credits * 75 JOD = 1,125 JOD):**\n- With 40% discount: You save **450 JOD**.\n- With 30% discount: You save **337.5 JOD**.`;

    return { answer, intent: "discount_calculator" };
  }

  // 14. Hall 9303 & IT Labs Navigation
  if (/(قاعه 9303|مختبر 9136|مختبرات الحاسوب|ممر الزيتون|وين قاعه 9303|hall 9303|lab 9136|it labs|olive grove)/i.test(norm)) {
    const answer = lang === "ar"
      ? `📍 **دليل الوصول إلى قاعة 9303 ومختبرات كلية العلوم وتكنولوجيا المعلومات (مبنى IT):**\n\n1. **قاعة 9303 (Hall 9303):**\n   - **الموقع:** الطابق الثالث، الجناح الأكاديمي، بجوار مكتب عميد الكلية (3-101).\n   - **المسافة من البوابة الرئيسية (بوابة 1):** حوالي 4 دقائق مشياً عبر **ممر الزيتون الممهد**.\n\n2. **مختبرات الحاسوب (مختبر 60-9136م ومختبر 9137م):**\n   - **الموقع:** الطابق الأول والطابق الأرضي بمبنى IT.\n   - مزودة بأحدث محطات العمل وشبكات الإنترنت لتطبيقات البرمجة والذكاء الاصطناعي.\n\nيمكنك استخدام خريطة الحرم الجامعي في منصة أوليفر (تبويب Campus Navigation) للإرشاد خطوة بخطوة.`
      : `📍 **Navigation Guide to Hall 9303 & IT Computer Labs:**\n\n1. **Amphitheater Hall 9303:**\n   - **Location:** Floor 3, Faculty Wing, next to Dean's Office (3-101).\n   - **Walking Time from Main Gate 1:** Approx. 4 minutes along the scenic **Olive Grove Walkway**.\n\n2. **Computer Labs (Lab 60-9136م & Lab 9137م):**\n   - **Location:** Floor 1 and Ground Floor in the FSIT Building.\n   - Equipped for advanced programming, machine learning, and networking labs.\n\nUse the Campus Navigation tab in Oliver for interactive turn-by-turn routing.`;

    return { answer, intent: "room_9303_finder" };
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
      ? `أهلاً بك يا ${studentFirstName}. بصفتي أوليفرك الأكاديمي الذكي في جامعة الزيتونة الأردنية، إليك هذه الخطة العملية لتنظيم دراستك:\n\n1. **تقنية البومودورو (Pomodoro):** قسّم وقت المذاكرة إلى 25 دقيقة تركيز متبوعة بـ 5 دقائق استراحة لتجنب الإرهاق الذهني.\n2. **الاسترجاع النشط (Active Recall):** لا تكتفِ بقراءة الملخصات؛ اختبر نفسك بحل أسئلة السنوات السابقة والتطبيقات العملية لمقررات ${majorName}.\n3. **الأولويات الأكاديمية:** ابدأ دائماً بالمفاهيم الصعبة والمواد ذات المتطلبات السابقة.\n4. **ساعات الدعم المكتبي:** لا تتردد في مراجعة أساتذة المواد خلال ساعاتهم المكتبية المعلنة أو زيارة الكلية (مبنى FSIT) للاستفسار عن أي نقاط غامضة.\n\nأتمنى لك كل التوفيق والدرجات العالية!`
      : `Hello ${studentFirstName}! As your AI Academic Advisor at Al-Zaytoonah University, here is a structured strategy for your studies:\n\n1. **Pomodoro Technique:** Structure your sessions into 25 minutes of deep focus followed by a 5-minute break to maintain high retention.\n2. **Active Recall & Practice:** Don't just passively re-read slides; practice past exams and solve practical problems related to ${majorName}.\n3. **Prioritize Core Subjects:** Tackle prerequisite courses and challenging topics first when your energy is highest.\n4. **Utilize Faculty Office Hours:** Visit your course instructors during office hours at the FSIT building to clarify challenging concepts early in the term.\n\nBest of luck with your academic journey!`;

    return { answer, topic: "Study & Exam Strategy" };
  }

  // Topic 2: Career, skills, and industry readiness
  if (/(سوق العمل|وظائف|مهارات|تدريب|مستقبل|شغل|career|job|internship|skills|future|market)/i.test(norm)) {
    const answer = lang === "ar"
      ? `مرحباً يا ${studentFirstName}! التميز في تخصص **${majorName}** يتطلب بناء المهارات العملية جنباً إلى جنب مع المواد النظرية:\n\n1. **المشاريع العملية (Portfolio):** قم ببناء مشاريع برمجية أو تطبيقية حقيقية ورفعها على GitHub لتعزيز سيرتك الذاتية.\n2. **التدريب الميداني (Field Training):** بعد إتمام 90 ساعة معتمدة، احرص على اختيار شركة رائدة خلال فترة التدريب الميداني المقررة لفتح آفاق التوظيف المبكر.\n3. **الشهادات المهنية العالمية:** عزز مؤهلاتك بشهادات معتمدة في مجالك (مثل AWS, Cisco, CompTIA, Google Cloud).\n4. **صندوق الملك عبدالله الثاني للتأهيل الوظيفي:** استفد من الورش التدريبية المجانية التي تعقدها الجامعة في الحرم الجامعي.\n5. **المهارات الشخصية واللغوية:** إتقان اللغة الإنجليزية ومهارات التواصل والعمل الجماعي تشكل 50% من معايير التوظيف الإقليمي.`
      : `Hello ${studentFirstName}! Excelling in **${majorName}** requires coupling your academic curriculum with practical market skills:\n\n1. **Practical Portfolio:** Build hands-on projects and maintain an active GitHub profile to demonstrate your applied knowledge.\n2. **Field Training:** Upon completing 90+ credit hours, choose a reputable internship partner during your compulsory field training period.\n3. **Industry Certifications:** Supplement your degree with respected vendor certifications (e.g. AWS, Cisco, CompTIA, Google Cloud).\n4. **Career Center:** Utilize the workshops organized by King Abdullah II Fund for Career Counseling on campus.\n5. **Communication & Teamwork:** English proficiency and collaborative problem-solving are crucial factors in regional tech hiring.`;

    return { answer, topic: "Career & Industry Preparation" };
  }

  // Topic 3: General Conversational Advisor Guidance
  const answer = lang === "ar"
    ? `أهلاً بك يا ${studentFirstName} في منصة أوليفر للإرشاد الأكاديمي بجامعة الزيتونة الأردنية.\n\nأنا هنا لمساعدتك في كل ما يخص مسيرتك الجامعية في تخصص **${majorName}**، بما في ذلك:\n- الاستفسار عن معدلك التراكمي (${ctx.gpa}) والوضع الأكاديمي ولوائح الإنذار.\n- الخطة الدراسية والمتطلبات السابقة والساعات المتبقية للتخرج.\n- احتساب الرسوم الدراسية والخصومات التشجيعية (30% و40%).\n- لوائح الحضور والغياب (حد الـ 15% وحرمان الصفر) وتعليمات الامتحانات والأعذار الطبية.\n- مواقع المكاتب والتواصل في كلية العلوم وتكنولوجيا المعلومات (مبنى FSIT).\n\nكيف يمكنني مساعدتك تحديداً اليوم؟ يمكنك طرح سؤالك مباشرة، أو حجز موعد مع أوليفرك الأكاديمي عبر المنصة.`
    : `Hello ${studentFirstName}, welcome to Oliver Academic Advising at Al-Zaytoonah University of Jordan.\n\nI am here to assist you throughout your academic journey in **${majorName}**, including:\n- Inquiries about your GPA (${ctx.gpa}) and academic standing regulations.\n- Study plans, course prerequisites, and remaining graduation credits.\n- Tuition calculations and merit discounts (30% and 40%).\n- University attendance policy (15% limit) and exam conflict regulations.\n- FSIT building offices and contact directory.\n\nHow can I help you today? Feel free to ask any specific question, or book a consultation with your faculty advisor via the portal.`;

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
  mode: "local_mock_fallback" | "external_model" | "local_ollama";
  model: string;
  timestamp: number;
} | null = null;

const STATUS_CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Health check & status probe for external AI service
 */
export async function getAiServiceStatus(): Promise<{
  isOnline: boolean;
  mode: "local_mock_fallback" | "external_model" | "local_ollama";
  model: string;
}> {
  if (cachedStatus && Date.now() - cachedStatus.timestamp < STATUS_CACHE_TTL_MS) {
    return {
      isOnline: cachedStatus.isOnline,
      mode: cachedStatus.mode,
      model: cachedStatus.model,
    };
  }

  // 1. Check Local Ollama (Priority for Data Privacy & Local GPU)
  const ollamaUrl = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";
  try {
    const ollamaProbe = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(600),
    });
    if (ollamaProbe.ok) {
      const tagsData = await ollamaProbe.json().catch(() => ({}));
      const models: any[] = tagsData?.models || [];
      const oliverModel = models.find((m: any) => m.name && m.name.includes("oliver-zuj"));
      const modelName = process.env.OLLAMA_MODEL || oliverModel?.name || (models[0]?.name ?? "oliver-zuj:latest");
      cachedStatus = {
        isOnline: true,
        mode: "local_ollama",
        model: `Oliver (Local Ollama: ${modelName} on RTX 3050)`,
        timestamp: Date.now(),
      };
      return {
        isOnline: cachedStatus.isOnline,
        mode: cachedStatus.mode,
        model: cachedStatus.model,
      };
    }
  } catch {
    // Ollama not running locally
  }

  // 2. Check external model server (Runpod if configured)
  const runpodUrl = process.env.RUNPOD_API_URL;
  if (!runpodUrl || process.env.AI_FORCE_LOCAL_FALLBACK === "true") {
    cachedStatus = {
      isOnline: false,
      mode: "local_mock_fallback",
      model: "Oliver Academic Rule & FAQ Fallback Engine (Local Active)",
      timestamp: Date.now(),
    };
    return {
      isOnline: cachedStatus.isOnline,
      mode: cachedStatus.mode,
      model: cachedStatus.model,
    };
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
        model: "Oliver Academic Rule & FAQ Fallback Engine (Active)",
        timestamp: Date.now(),
      };
    }
  } catch {
    cachedStatus = {
      isOnline: false,
      mode: "local_mock_fallback",
      model: "Oliver Academic Rule & FAQ Fallback Engine (Active)",
      timestamp: Date.now(),
    };
  }

  return {
    isOnline: cachedStatus.isOnline,
    mode: cachedStatus.mode,
    model: cachedStatus.model,
  };
}
