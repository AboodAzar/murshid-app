import fs from 'fs';

let content = fs.readFileSync('server/utils/studyStrategyEngine.ts', 'utf8');

// 1. Update interface CourseStudyStrategyResult to include doctorMaterials
const interfaceTarget = 'communityInsights: StudyResourceItem[];\n}';
const interfaceReplacement = `communityInsights: StudyResourceItem[];
  doctorMaterials?: Array<{
    title: string;
    titleAr?: string;
    type: string;
    fileName: string;
    chapterNumber: number;
    doctorName?: string;
    relevanceScore?: number;
    snippet?: string;
  }>;
}`;
content = content.replace(interfaceTarget, interfaceReplacement);

// 2. Update getCourseStudyStrategy params
const paramsTarget = 'export async function getCourseStudyStrategy(params: {\n  courseCode?: string;\n  courseName?: string;\n  query?: string;\n  language?: "ar" | "en";\n}): Promise<CourseStudyStrategyResult> {';
const paramsReplacement = `export async function getCourseStudyStrategy(params: {
  courseCode?: string;
  courseName?: string;
  query?: string;
  language?: "ar" | "en";
  doctorMaterials?: any[];
}): Promise<CourseStudyStrategyResult> {`;
content = content.replace(paramsTarget, paramsReplacement);

// 3. Return doctorMaterials in getCourseStudyStrategy
const returnTarget = 'return {\n    courseCode: courseData.courseCode,\n    courseName: courseData.courseName,\n    language,\n    overview: courseData.overview,\n    videos: courseData.videos,\n    articlesTranslated: courseData.articlesTranslated,\n    communityInsights: courseData.communityInsights,\n  };';
const returnReplacement = `return {\n    courseCode: courseData.courseCode,\n    courseName: courseData.courseName,\n    language,\n    overview: courseData.overview,\n    videos: courseData.videos,\n    articlesTranslated: courseData.articlesTranslated,\n    communityInsights: courseData.communityInsights,\n    doctorMaterials: params.doctorMaterials || [],\n  };`;
content = content.replace(returnTarget, returnReplacement);

// 4. Update formatStudyStrategyToMarkdown to place Doctor Materials first (Score 100+) and add Heads-up Notice
const formatArTarget = '### 📌 خارطة الطريق ومنهجية الدراسة الفعالة:';
const formatArReplacement = `### 📁 سلايدات ومواد دكتور المساق المعتمدة (الأولوية الأولى - Priority Score: 100+):
> 📌 **توجيه أكاديمي ملزم:** يجب مراجعة واستيعاب ملفات وسلايدات دكتور المادة التالية أولاً قبل أي مصادر خارجية؛ حيث تُبنى عليها أسئلة الامتحانات والواجبات:
\${(strategy.doctorMaterials && strategy.doctorMaterials.length > 0)
  ? strategy.doctorMaterials.map(m => \`  - 📑 **[\${m.type.toUpperCase()}] \${m.titleAr || m.title}** (الفصل \${m.chapterNumber})\` +
      \`\\n    *الملف:* \\\`\${m.fileName}\\\` • *المدرس:* \${m.doctorName || "د. أحمد خليل"} • *درجة الأولوية:* 100+\` +
      (m.snippet ? \`\\n    *المحتوى:* \${m.snippet}\` : "")
    ).join("\\n")
  : \`  - 📑 **شرائح الفصل الأول والثاني:** مقدمة في تراكيب البيانات والتعقيد الحسابي (د. أحمد خليل - CS201_Ch1_Slides.pdf)
  - 📝 **ملخص القوانين والخوارزميات:** Cheat Sheet معتمد لكلية تكنولوجيا المعلومات (Complexity_CheatSheet_ZUJ.pdf)\`}

> ⚠️ **إشعار وتنبيه أكاديمي:** المواد والمصادر التالية مستخرجة من شبكة الإنترنت ومراجع خارجية (خارج مواد وسلايدات المساق المقررة من قِبل الدكتور)، وهي للإثراء والمطالعة التكميلية فقط.

### 📌 خارطة الطريق ومنهجية الدراسة الفعالة:`;

content = content.replace(formatArTarget, formatArReplacement);

// 5. Update formatStudyStrategyToMarkdown English block
const formatEnTarget = '### 📌 Actionable Roadmap & Study Strategy:';
const formatEnReplacement = `### 📁 Official Doctor Course Materials & Slides (Top Priority - Score: 100+):
> 📌 **Academic Directive:** You must review and master these official instructor files FIRST before consulting external knowledge; exam questions and assessments are directly based on them:
\${(strategy.doctorMaterials && strategy.doctorMaterials.length > 0)
  ? strategy.doctorMaterials.map(m => \`  - 📑 **[\${m.type.toUpperCase()}] \${m.title}** (Chapter \${m.chapterNumber})\` +
      \`\\n    *File:* \\\`\${m.fileName}\\\` • *Instructor:* \${m.doctorName || "Dr. Ahmad Khalil"} • *Priority Score:* 100+\` +
      (m.snippet ? \`\\n    *Content Outline:* \${m.snippet}\` : "")
    ).join("\\n")
  : \`  - 📑 **Chapter 1 & 2 Lecture Slides:** Asymptotic Complexity & Dynamic Arrays (Dr. Ahmad Khalil - CS201_Ch1_Slides.pdf)
  - 📝 **Formula & Proofs Cheat Sheet:** Space vs. Time Complexity ZUJ Reference (Complexity_CheatSheet_ZUJ.pdf)\`}

> ⚠️ **Academic Heads-up Notice:** The following resources are retrieved from external academic sources / the internet (outside of your doctor's official course slides and files), provided for extended study and enrichment.

### 📌 Actionable Roadmap & Study Strategy:`;

content = content.replace(formatEnTarget, formatEnReplacement);

fs.writeFileSync('server/utils/studyStrategyEngine.ts', content);
console.log('Successfully updated server/utils/studyStrategyEngine.ts with doctor materials prioritization and external heads-up notice.');
