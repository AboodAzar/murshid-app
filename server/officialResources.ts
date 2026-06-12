/**
 * Official Faculty of Science and Information Technology resources
 * from Al-Zaytoonah University of Jordan (ZUJ).
 *
 * These are public, official university links that advisors can import
 * into the AI knowledge base so students receive accurate guidance.
 *
 * TODO: Verify and update URLs with the current official ZUJ website pages.
 */

export interface OfficialResource {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  url: string;
  source: string;
}

const ALLOWED_DOMAINS = [
  "zuj.edu.jo",
  "www.zuj.edu.jo",
  "sci.zuj.edu.jo",
  "www.sci.zuj.edu.jo",
  "admission.zuj.edu.jo",
  "registrar.zuj.edu.jo",
];

export function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export const officialFacultyResources: OfficialResource[] = [
  {
    id: "zuj-faculty-guide-2024",
    title: "Faculty of Science and IT Guide 2024/2025",
    titleAr: "دليل كلية العلوم وتكنولوجيا المعلومات 2024/2025",
    description:
      "Official faculty guide containing academic regulations, policies, and student services for the Faculty of Science and Information Technology.",
    descriptionAr:
      "الدليل الرسمي للكلية يتضمن الأنظمة الأكاديمية والسياسات وخدمات الطلاب لكلية العلوم وتكنولوجيا المعلومات.",
    category: "Faculty Guide",
    categoryAr: "دليل الكلية",
    url: "https://www.zuj.edu.jo/faculties/science-it/guide",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-study-plan-cs",
    title: "Computer Science Study Plan",
    titleAr: "الخطة الدراسية لعلوم الحاسوب",
    description:
      "Complete study plan for the Bachelor of Computer Science program including required and elective courses, prerequisites, and credit hours.",
    descriptionAr:
      "الخطة الدراسية الكاملة لبرنامج بكالوريوس علوم الحاسوب تشمل المقررات الإلزامية والاختيارية والمتطلبات السابقة والساعات المعتمدة.",
    category: "Study Plans",
    categoryAr: "الخطط الدراسية",
    url: "https://www.zuj.edu.jo/faculties/science-it/programs/cs-plan",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-study-plan-cyber",
    title: "Cybersecurity Study Plan",
    titleAr: "الخطة الدراسية للأمن السيبراني",
    description:
      "Study plan for the Bachelor of Cybersecurity program covering core security courses, networking, and hands-on labs.",
    descriptionAr:
      "الخطة الدراسية لبرنامج بكالوريوس الأمن السيبراني تشمل مقررات الأمن الأساسية والشبكات والمختبرات العملية.",
    category: "Study Plans",
    categoryAr: "الخطط الدراسية",
    url: "https://www.zuj.edu.jo/faculties/science-it/programs/cyber-plan",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-study-plan-it",
    title: "Information Technology Study Plan",
    titleAr: "الخطة الدراسية لتكنولوجيا المعلومات",
    description:
      "Study plan for the Bachelor of Information Technology program including software development, databases, and systems administration tracks.",
    descriptionAr:
      "الخطة الدراسية لبرنامج بكالوريوس تكنولوجيا المعلومات تشمل تخصصات تطوير البرمجيات وقواعد البيانات وإدارة الأنظمة.",
    category: "Study Plans",
    categoryAr: "الخطط الدراسية",
    url: "https://www.zuj.edu.jo/faculties/science-it/programs/it-plan",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-course-descriptions",
    title: "Course Descriptions - Faculty of Science and IT",
    titleAr: "وصف المقررات - كلية العلوم وتكنولوجيا المعلومات",
    description:
      "Detailed descriptions of all courses offered by the Faculty of Science and Information Technology including learning outcomes and credit hours.",
    descriptionAr:
      "أوصاف تفصيلية لجميع المقررات التي تقدمها كلية العلوم وتكنولوجيا المعلومات تشمل نتائج التعلم والساعات المعتمدة.",
    category: "Course Descriptions",
    categoryAr: "وصف المقررات",
    url: "https://www.zuj.edu.jo/faculties/science-it/courses",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-graduation-requirements",
    title: "Graduation Requirements",
    titleAr: "متطلبات التخرج",
    description:
      "Official graduation requirements for undergraduate programs in the Faculty of Science and Information Technology including GPA, credit hours, and capstone project requirements.",
    descriptionAr:
      "متطلبات التخرج الرسمية لبرامج البكالوريوس في كلية العلوم وتكنولوجيا المعلومات تشمل المعدل والساعات المعتمدة ومتطلبات المشروع التخرجي.",
    category: "Graduation Requirements",
    categoryAr: "متطلبات التخرج",
    url: "https://www.zuj.edu.jo/faculties/science-it/graduation",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-academic-regulations",
    title: "Academic Regulations",
    titleAr: "الأنظمة الأكاديمية",
    description:
      "University academic regulations covering registration, withdrawal, grading, probation, dismissal, and appeals policies.",
    descriptionAr:
      "الأنظمة الأكاديمية للجامعة تشمل التسجيل والانسحاب والتقدير والإنذار والفصل والاستئناف.",
    category: "Academic Regulations",
    categoryAr: "الأنظمة الأكاديمية",
    url: "https://www.zuj.edu.jo/regulations/academic",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-admission-fees",
    title: "Admissions and Fees - Faculty of Science and IT",
    titleAr: "القبول والرسوم - كلية العلوم وتكنولوجيا المعلومات",
    description:
      "Admission requirements, specializations, and tuition fees for the Faculty of Science and Information Technology programs.",
    descriptionAr:
      "متطلبات القبول والتخصصات ورسوم البرامج لكلية العلوم وتكنولوجيا المعلومات.",
    category: "Admissions & Fees",
    categoryAr: "القبول والرسوم",
    url: "https://www.zuj.edu.jo/admission/specialties-fees",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-student-guide",
    title: "Student Guidebook",
    titleAr: "دليل الطالب",
    description:
      "Comprehensive student guide covering campus services, academic advising, library access, IT services, and student rights and responsibilities.",
    descriptionAr:
      "دليل الطالب الشامل يغطي خدمات الحرم الجامعي والإرشاد الأكاديمي والمكتبة وخدمات تكنولوجيا المعلومات وحقوق وواجبات الطالب.",
    category: "Student Guide",
    categoryAr: "دليل الطالب",
    url: "https://www.zuj.edu.jo/students/guide",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-registration-instructions",
    title: "Registration Instructions",
    titleAr: "تعليمات التسجيل",
    description:
      "Step-by-step registration instructions for new and continuing students including online portal usage, course selection, and add/drop procedures.",
    descriptionAr:
      "تعليمات التسجيل خطوة بخطوة للطلاب الجدد والمستمرين تشمل استخدام البوابة الإلكترونية واختيار المقررات وإجراءات الإضافة والحذف.",
    category: "Registration",
    categoryAr: "التسجيل",
    url: "https://www.zuj.edu.jo/students/registration",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-credit-hours",
    title: "Credit Hours System",
    titleAr: "نظام الساعات المعتمدة",
    description:
      "Explanation of the credit hours system, course load limits, overload policies, and summer semester regulations.",
    descriptionAr:
      "شرح نظام الساعات المعتمدة وحدود حمل المقررات وسياسات الزيادة وأنظمة الفصل الصيفي.",
    category: "Academic Regulations",
    categoryAr: "الأنظمة الأكاديمية",
    url: "https://www.zuj.edu.jo/regulations/credit-hours",
    source: "Al-Zaytoonah University of Jordan",
  },
  {
    id: "zuj-majors-programs",
    title: "Majors and Programs",
    titleAr: "التخصصات والبرامج",
    description:
      "List of all undergraduate and graduate majors and programs offered by the Faculty of Science and Information Technology.",
    descriptionAr:
      "قائمة بجميع تخصصات وبرامج البكالوريوس والدراسات العليا التي تقدمها كلية العلوم وتكنولوجيا المعلومات.",
    category: "Majors & Programs",
    categoryAr: "التخصصات والبرامج",
    url: "https://www.zuj.edu.jo/faculties/science-it/programs",
    source: "Al-Zaytoonah University of Jordan",
  },
];
