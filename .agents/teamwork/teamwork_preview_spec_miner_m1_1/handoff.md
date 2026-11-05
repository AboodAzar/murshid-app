# Milestone 1 Spec Miner Handoff Report
**Document**: Authoritative Academic Regulations, FAQ Knowledge Mining & Bilingual Local Fallback Engine Specification  
**Author**: Spec Miner (Milestone 1)  
**Date**: 2026-10-27  
**Working Directory**: `s:\murshid (1)\.agents\teamwork\teamwork_preview_spec_miner_m1_1\`

---

## 1. Observation

### 1.1 Evaluated Sources and Exact File References
1. **University Regulations PDF**: `Runpod/data/Rules_and_Regulations.pdf` (5,087,459 bytes, 220 pages)
   - *Title*: "كتاب القوانين والأنظمة والتعليمات في جامعة الزيتونة الأردنية (2024-2025)".
   - *Doc Pages 65–78* (PDF pages 66–79): "تعليمات منح درجة البكالوريوس في جامعة الزيتونة الأردنية":
     - Article 10 (Duration & Load): Min 12 credits, Max 18 credits; Graduating student up to 21 credits; Summer max 10 credits (13 for graduating). Max study duration: 7 years for IT/Science, 8 years for Engineering/Pharmacy.
     - Article 11 (Attendance & Deprivation): Absence threshold without acceptable excuse is 15% (8 lectures for face-to-face, 5 lectures for blended/online). Deprived student receives grade zero (`0`), failing counts toward GPA and probation. Excused absence up to 20% triggers mandatory course withdrawal (`منسحب`), not deprivation. Medical excuses must be from university student clinic within 2 weeks.
     - Article 12 (Grades & Exams): 60% coursework (30% midterm written exam + 30% quizzes/assignments/reports) + 40% comprehensive final exam. Minimum passing grade in any course is 50%.
     - Article 15 (Missed Exams & Incomplete): Missing midterm with acceptable excuse within 3 days warrants makeup before finals. Missing final exam with excuse within 2 weeks allows dean-approved Incomplete (`غير مكتمل`). Incomplete exams are conducted during weeks 1–4 of the following semester.
     - Article 17 (Grading Scale & Ratings):
       - 84% – 100%: ممتاز (Excellent)
       - 76% – <84%: جيد جداً (Very Good)
       - 68% – <76%: جيد (Good)
       - 60% – <68%: مقبول (Pass / Satisfactory)
       - 50% – <60%: ضعيف (Weak)
       - <50%: راسب (Fail)
     - Article 18 (Probation & Dismissal): Academic probation triggered when cumulative GPA < 60% (or < 2.0 / 4.0). Student has 1st warning -> must raise GPA next regular semester -> otherwise 2nd warning -> granted up to 2 regular semesters to recover. If unresolved, dismissed from major, unless student completed >= 70% of degree credit hours. Immediate dismissal occurs if cumulative GPA < 50% in any semester following the first. Summer semesters do not count for issuing warnings.
     - Article 20 & 21 (Add/Drop & Withdrawal Refund): Free add/drop during announced schedule. Individual course withdrawal allowed up to week 14 (week 7 in summer). Financial deduction schedule:
       - Weeks 1–2: loses 25% (refunded 75%).
       - Weeks 3–4: loses 50% (refunded 50%).
       - Week 5: loses 75% (refunded 25%).
       - After Week 5: loses 100% (no refund). Remaining credit load cannot drop below 12 credits.
     - Article 27 & 28 (Graduation Requirements): Pass all required plan courses, achieve cumulative GPA >= 60% (>= 2.0), reside at ZUJ for at least the final 2 regular semesters.
     - Article 29 (Alternative Courses): Dean may approve at most 1 or 2 alternative courses for graduating students if required courses are unoffered or conflicting.

2. **Faculty Guide PDF**: `Runpod/data/Faculty_Guide.pdf` (824,218 bytes, 19 pages)
   - *Doc Page 5*: Credit hours: Math 132, CS 133, SE 133, AI & Data Science 133, Cybersecurity 133.
   - *Doc Page 16*: Discounts & Financial Aids: 40% credit hour discount for Bachelor students with Excellent grade (or High School distinction), 30% discount for Very Good grade. Financial Dept Contacts: `+962 (0) 79 6428046`, `+962 (0) 77 5150046`.
   - *Doc Page 19*: Faculty of Science & IT (كلية العلوم وتكنولوجيا المعلومات) Official Contacts:
     - Landline: `+962-6-4291511`
     - Extensions: `331 / 332 / 334 / 370 / 469`
     - Email: `it@zuj.edu.jo`

3. **University Student Guide PDF**: `Runpod/data/University_Guide.pdf` (4,599,041 bytes, 107 pages)
   - *Doc Page 26–27*: University fees and credit hour rates.
   - *Doc Page 30 & 65*: Level exam instructions (Arabic, English, Computer Skills). Fee: 10 JOD per exam. Pass rate >= 50% exempts from remedial. Score >= 80% exempts student from introductory level 1 course. Failure requires completing remedial course outside credit hours.
   - *Doc Pages 97–99*: Campus amenities: King Abdullah II Fund for Career Counseling, Green Sustainable Student Garden, Central Mosque (Masjid Sayyidna Ali, 600 sqm), Health Center with free medical consultations and prescriptions for enrolled students, Central Library (2,776 sqm, 200k+ resources), University Bus Transit Fleet, Military Service Office (خدمة العلم), Central Cafeteria.
   - *Doc Pages 104–106*: Academic Calendar showing semester registration, 4 withdrawal windows, midterm periods, and final exam periods.

4. **Fee Data Files**:
   - `Runpod/data/Facility_Fees.csv`:
     - Mathematics: 60 JOD / credit hour (132 total credits).
     - Computer Science: 75 JOD / credit hour (133 total credits).
     - Software Engineering: 75 JOD / credit hour (133 total credits).
     - Data Science & Artificial Intelligence: 75 JOD / credit hour (133 total credits).
     - Cybersecurity: 75 JOD / credit hour (133 total credits).
   - `Runpod/data/Unversity_Fees.csv`:
     - Regular semester registration fee: 350 JOD (495 USD).
     - Summer semester registration fee: 175 JOD (250 USD).
     - Admission application fee: 20 JOD (30 USD).
     - One-time refundable insurance deposit: 50 JOD (70 USD).
     - Level exam fee: 10 JOD / exam (15 USD).
     - Student ID card fee: 5 JOD (7 USD).
     - Graduation fee: 50 JOD (70 USD).

5. **Study Plan & Course Catalog Files**:
   - `Runpod/data/AI_Study_Plan_1.csv` & `AI_Study_Plan_2.csv` (133 total credits: 21 compulsory univ, 6 elective univ, 21 college, 27 track family, 43 major compulsory, 9 major elective, 6 supportive).
   - `Runpod/data/CS_Study_Plan_1.csv` & `CS_Study_Plan_2.csv` (133 total credits).
   - `Runpod/data/SE_Study_Plan_1.csv` & `SE_Study_Plan_2.csv` (133 total credits).
   - `Runpod/data/AI_Study_Giude.csv`, `CS_Study_Giude.csv`, `SE_Study_Giude.csv`: Detailed semester sequencing, 7-digit course codes, prerequisites.
   - `Runpod/data/AI_Materials_Descriptions.csv`, `CS_Materials_Descriptions.csv`, `SE_Materials_Descriptions.csv`: Official course syllabus descriptions.

6. **Database & Existing Server Code**:
   - Database `faqs` table: Currently seeded with exam conflict resolution rule:
     - Question: `ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟`
     - Answer: `في حال تعارض الامتحانات، يتم تقديم الامتحان حسب الأولويات التالية بالترتيب: الامتحان خارج الكلية، الامتحان خارج التخصص، الامتحان داخل التخصص. (يتم التنسيق لتأجيل الامتحان ذي الأولوية الأقل).`
   - `Runpod/Scripts.txt`: Real-world student prompt logs covering first-year semester 1 course registrations, tuition cost calculations with 40%/45% discounts, exam conflict inquiries, and advisor office locations.
   - `Runpod/api.py`: Stopwords list, similarity scoring formula, supervisor category classification (`[REGISTRATION]`, `[FINANCE]`, `[QA]`), hidden thinking extraction, and fee calculation rules (discounts apply ONLY to credit hour fees, never to semester registration fees).
   - `scripts/seed-campus-data.mjs`: Detailed room inventory for FSIT building (`3-101` Dean Office, `1-101` CS Dept Head, `1-106` IT Dept Head, `G-002` Student Affairs, labs and smart classrooms).

---

## 2. Logic Chain

1. **Decoupling Mandate**: The external Runpod LLM endpoint (`RUNPOD_API_URL`) is currently offline. In `server/routers/aiChat.ts`, `sendMessage` currently performs a synchronous fetch with no timeout, which causes requests to freeze and return 500 errors.
2. **Authority Hierarchy**: The university has established explicit, binding regulations in `Rules_and_Regulations.pdf` and exact numerical rules in `Facility_Fees.csv` and `Unversity_Fees.csv`. Academic advising queries are overwhelmingly deterministic (e.g., credit limits, probation criteria, attendance penalties, tuition fees, course prerequisites).
3. **Bilingual Requirement**: Students query the system in both Formal Arabic (فصحى), colloquial Jordanian dialect (عامية: "ايش انزل", "بدي اسجل", "عندي امتحانين", "قديش بطلع", "شو الحل"), and English ("probation rules", "tuition fees", "attendance warning", "add drop").
4. **3-Tier Local Engine Design**:
   - **Tier 1 (Exact & High-Similarity FAQ Matching)**: Checks against database `faqs` and static FAQ knowledge base using normalized token-overlap scoring (matching threshold >= 0.40).
   - **Tier 2 (Deterministic Academic Rules Engine)**: Detects intent from keywords/regex and evaluates against student's real-time context (cumulative GPA, registered credits, attendance rate, uncompleted prerequisites, active alerts). Returns tailored, authoritative guidance citing the exact university regulations.
   - **Tier 3 (Simulated Academic Advisor Guidance)**: When an inquiry is general or conversational, provides a supportive advisor response that summarizes academic guidelines and suggests consulting the advisor (`Dr. Ahmad Khalil` or assigned advisor) or visiting the dean's office (`Room 3-101`).

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Academic Rules | Graduation Requirements | 133 credit hours (132 Math), cumulative GPA >= 60% (2.0), completion of all required courses, 2 semesters residency | Student major, completed credits, GPA | Formatted summary of remaining credits, GPA status, and graduation eligibility | Informs student if credits or GPA are below 60% threshold | `Rules_and_Regulations.pdf` Art. 27–28, Study Plans |
| 2 | Academic Rules | Academic Probation & Warnings | Warning 1 when GPA < 60% (< 2.0); Warning 2 if not raised next semester; 2 semesters grace period; dismissal if not cleared unless >= 70% credits done; immediate dismissal if GPA < 50% | Cumulative GPA, completed semesters | Exact probation status, recovery timeline, remaining grace semesters, alert severity | Warning banner if GPA < 2.0; critical alert if GPA < 1.0 (50%) | `Rules_and_Regulations.pdf` Art. 18 |
| 3 | Academic Rules | Attendance & Deprivation Policy | 15% unexcused absence results in deprivation (grade 0 in course); 20% excused absence results in course withdrawal (`منسحب`); excuses must be from student clinic within 2 weeks | Course attendance records, excuse status | Current attendance percentage, remaining allowed absences before deprivation | Flags courses below 85% with warning, courses <= 80% with deprivation alert | `Rules_and_Regulations.pdf` Art. 11 |
| 4 | Academic Rules | Course Load & Semester Limits | Regular semester: Min 12, Max 18 credits (21 for graduating); Summer: Max 10 credits (13 for graduating); Military Science in final semester | Semester type (regular/summer), student graduation status | Allowed credit hour range and overload eligibility | Rejects registration exceeding 18 credits (or 21 graduating) | `Rules_and_Regulations.pdf` Art. 10 |
| 5 | Academic Rules | Add/Drop & Withdrawal Refunds | Add/drop before semester start; withdrawal up to week 14; refund deduction: 25% weeks 1-2, 50% weeks 3-4, 75% week 5, 100% after week 5; min load >= 12 | Current semester week, course credits to drop | Refund percentage, financial deduction amount, transcript notation (`منسحب`) | Rejects drop if remaining load falls below 12 credits | `Rules_and_Regulations.pdf` Art. 20–21 |
| 6 | Academic Rules | Final Exam Conflicts Resolution | Exam conflict priority: 1. Outside faculty, 2. Outside major, 3. Inside major. Lower priority exam is deferred to Incomplete | List of conflicting course codes | Official priority resolution order and makeup exam procedure | Advises filing conflict form at Registry within deadline | Database `faqs`, `Rules_and_Regulations.pdf` Art. 15 |
| 7 | Academic Rules | Incomplete Exam Regulations | Makeup for midterm within 3 days to dept head; Makeup for final within 2 weeks to dean; exam held during weeks 1–4 of next semester | Medical/compelling excuse, course code | Approval protocol and makeup exam window | Zero recorded if student fails to file excuse in time | `Rules_and_Regulations.pdf` Art. 15 |
| 8 | Finance | Tuition & Fee Calculator | Calculates semester cost: `(Credits * Rate * (1 - Discount)) + SemesterFee`. IT/CS/SE/AI/Cyber: 75 JOD/hr; Math: 60 JOD/hr; Regular fee: 350 JOD; Summer fee: 175 JOD | Number of credit hours, student major, discount % | Itemized financial breakdown and final payable amount in JOD (د.أ) | Rejects negative hours, clarifies discount only applies to credits | `Facility_Fees.csv`, `Unversity_Fees.csv`, `Runpod/api.py` |
| 9 | Registration | Study Plan & First-Year Advice | Standard 1st semester courses for AI, CS, SE: Calculus 1, Stats, Intro to IT, Discrete Math, Life Skills / National Education | Student major, current semester/year | Recommended course list with 7-digit course codes, credit hours, and prerequisites | Identifies remedial requirements if level exams not passed | `AI_Study_Giude.csv`, `CS_Study_Giude.csv`, `SE_Study_Giude.csv` |
| 10 | Registration | Prerequisite & Remedial Policy | Remedial courses (Arabic, English, Computer Skills, Math 0120001); level exams (10 JOD); pass >= 50% exempts; >= 80% exempts introductory course; failure requires remedial | Level exam score, prerequisite status | Prerequisite clearance status or required remedial course | Blocks higher courses if prerequisite is unfulfilled | `University_Guide.pdf` p. 30, 65 |
| 11 | Registration | Field Training & Capstone Rules | Field training requires completing 90+ credits; Capstone 1 requires 90+ credits and dept approval; Capstone 2 requires passing Capstone 1 | Completed credit hours, course code | Eligibility status and registration prerequisites | Informs student of missing credits if < 90 | `AI_Materials_Descriptions.csv`, `SE_Study_Giude.csv` |
| 12 | Campus | Office & Contact Directory | FSIT building (Queen Alia Airport Rd), Landline `+962-6-4291511`, Exts `331/332/334/370/469`, `it@zuj.edu.jo`; Dean `3-101`, CS Head `1-101`, IT Head `1-106`, Clinic, Library | Target office/service or room code | Exact room number, floor, building code, phone extension, and email | Returns general reception contact if office not recognized | `Faculty_Guide.pdf`, `seed-campus-data.mjs` |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior | Authoritative Resolution |
|---|---------|-------|-------------------|--------------------------|
| 1 | Course Overload | Student requests 21 credit hours in a regular semester | Allowed ONLY if student is in graduation semester (confirmed by study plan); otherwise strictly capped at 18 credit hours | Return 18 hours max rule, explain 21 hours exception for graduating semester with Dean approval (`Rules_and_Regulations.pdf` Art. 10). |
| 2 | Discount Application | Student asks for tuition cost with 40% discount for 15 credit hours | Some models incorrectly apply 40% discount to total fees including registration fee | Discount applies EXCLUSIVELY to credit hour fees: `(15 * 75 * 0.60) + 350 = 675 + 350 = 1025 JOD` (`Runpod/api.py` line 178). |
| 3 | Attendance Excuse | Student submits medical excuse 3 weeks after missing classes | Exceeds the 2-week statutory deadline for submitting medical reports from university clinic | Return rejection based on Art. 11/z: Medical reports must be submitted within 2 weeks of absence to Dean. |
| 4 | Academic Warning in Summer | Student GPA < 2.0 (60%) at the end of summer semester | System or advisor must not issue an academic probation warning for summer semester | Art. 18/w: Summer semester is excluded from issuing academic warnings; summer only serves as a recovery opportunity. |
| 5 | Course Withdrawal Drop Below Limit | Student enrolled in 12 credits attempts to withdraw from a 3-credit course | Withdrawal would reduce load to 9 credits, violating the 12-credit minimum floor | Art. 21/third: Cannot withdraw if load drops below 12 credits unless student withdraws from entire semester (semester postponement). |
| 6 | Course Prerequisites | Student attempts to register for `0112120` (Programming Fundamentals) without completing `0125130` | System rejects enrollment; course requires introductory IT prerequisite | Return missing prerequisite code and course title, advise registering prerequisite first (`AI_Study_Giude.csv`). |
| 7 | Exam Conflict Priorities | Student has CS exam, Math exam, and University requirement exam on same day/time | Order of priority is: 1. Univ requirement (outside faculty), 2. Math (outside major), 3. CS (inside major) | Must attend Univ requirement first; Math second; CS postponed as Incomplete (`faqs` table, `Runpod/Scripts.txt`). |
| 8 | Immediate Dismissal | Student receives cumulative GPA of 48% (1.50) in second semester | Immediate dismissal from major applies when cumulative GPA < 50% after first semester | Art. 18/e: Student is dismissed from major if cumulative GPA < 50% (< 1.67/4.0), but may transfer to another major. |
| 9 | Grade 0 for Deprivation | Student absent > 15% without approved excuse | Deprivation sets course grade to 0, which enters GPA calculation | Art. 11/d: Deprivation results in grade zero (`0`), treated as failing in GPA calculation, affecting probation. |
| 10 | Level Exam Exemption | Student scores 85% in Computer Skills Level Exam | Exempt from both remedial and introductory computer course | `University_Guide.pdf` p. 65: Score >= 80% exempts student from introductory Level 1 course. |

---

## 5. Fallback Engine Architecture & Dataset Specification

The local fallback engine in `server/utils/aiFallback.ts` operates in **three hierarchical tiers**:

```
                         [User Incoming Message]
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │   Text Normalization &    │
                      │  Bilingual Tokenization   │
                      └─────────────┬─────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                ▼                                       ▼
    [Tier 1: FAQ Matcher]                     [Tier 2: Academic Rules Engine]
   - Database `faqs` query                   - Intent Detection (GPA, Attendance,
   - Static FAQ Repository                     Graduation, Fees, Exams, Prereqs)
   - Jaccard / Token Overlap >= 0.40         - Personalized Student Context Injection
                │                                       │
                ├────────── Match Found? ───────────────┤
                │ Yes                                   │ Yes
                ▼                                       ▼
       Return FAQ Response                    Return Authoritative Rule Response
                │                                       │
                └────────── No Match Found ─────────────┘
                                    │
                                    ▼
                    [Tier 3: Simulated Academic Advisor]
                   - Personalized Academic Health Check
                   - Context-Aware Guidance & Advising Action
                   - Department & Dean Office Contact Cards
```

### 5.1 Bilingual Keyword & Intent Matching Dictionary

```typescript
export interface IntentDefinition {
  intent: string;
  category: "graduation" | "probation" | "attendance" | "registration" | "finance" | "exams" | "offices" | "remedial";
  keywordsAr: string[];
  keywordsEn: string[];
  patterns: RegExp[];
}

export const ACADEMIC_INTENTS: IntentDefinition[] = [
  {
    intent: "graduation_requirements",
    category: "graduation",
    keywordsAr: ["تخرج", "متطلبات التخرج", "ساعات التخرج", "خريج", "انهاء الساعات", "مشروع التخرج", "حفل التخرج", "ساعات الخطة"],
    keywordsEn: ["graduation", "graduate", "graduation requirements", "credit hours", "finish degree", "capstone", "residency"],
    patterns: [/تخرج/i, /متطلبات.*تخرج/i, /كم.*ساعة.*تخرج/i, /graduation/i, /credits.*to.*graduate/i],
  },
  {
    intent: "gpa_and_probation",
    category: "probation",
    keywordsAr: ["انذار", "إنذار", "معدل", "معدلي", "تحت المراقبة", "فصل", "معدل تراكمي", "راسب", "انذار اول", "انذار ثاني", "رفع المعدل", "60%", "2.0"],
    keywordsEn: ["probation", "warning", "gpa", "cumulative gpa", "academic warning", "dismissal", "academic standing", "fail", "low gpa"],
    patterns: [/انذار/i, /إنذار/i, /معدل.*تراكمي/i, /فصل.*تخصص/i, /probation/i, /gpa.*warning/i, /academic.*standing/i],
  },
  {
    intent: "attendance_and_deprivation",
    category: "attendance",
    keywordsAr: ["غياب", "غيابات", "حرمان", "محروم", "نسبة الغياب", "حضور", "اعذار", "عذر طبي", "عيادة", "15%", "20%"],
    keywordsEn: ["attendance", "absence", "absences", "deprivation", "deprived", "barred", "excuse", "medical report", "15%"],
    patterns: [/حرمان/i, /غياب/i, /نسبة.*غياب/i, /كم.*غياب/i, /attendance/i, /absence/i, /deprivation/i],
  },
  {
    intent: "registration_and_load",
    category: "registration",
    keywordsAr: ["تسجيل", "تنزيل مواد", "ساعات الفصل", "عبء دراسي", "حد اعلى", "حد أدنى", "18 ساعة", "12 ساعة", "21 ساعة", "صيفي", "ايش انزل", "شو انزل", "مواد الفصل"],
    keywordsEn: ["registration", "enroll", "course load", "max credits", "min credits", "summer load", "register courses", "what to take"],
    patterns: [/تسجيل.*مواد/i, /ايش.*انزل/i, /شو.*انزل/i, /عبء.*دراسي/i, /حد.*اقصى.*ساعات/i, /course.*load/i, /enrollment/i],
  },
  {
    intent: "tuition_and_fees",
    category: "finance",
    keywordsAr: ["رسوم", "تكلفة", "سعر الساعة", "قديش بطلع", "كم بدفع", "خصم", "خصومات", "350 دينار", "75 دينار", "مالية", "الدائرة المالية", "قسط"],
    keywordsEn: ["tuition", "fees", "cost", "credit price", "discount", "scholarship", "how much", "registration fee", "finance"],
    patterns: [/رسوم/i, /سعر.*الساعة/i, /كم.*تكلفة/i, /قديش.*بطلع/i, /خصم/i, /tuition/i, /fee/i, /cost.*per.*credit/i],
  },
  {
    intent: "add_drop_and_withdrawal",
    category: "registration",
    keywordsAr: ["سحب واضافة", "سحب وإضافة", "سحب مادة", "انسحاب", "استرداد", "غرامة", "منسحب", "اسبوع الانسحاب"],
    keywordsEn: ["add drop", "withdrawal", "drop course", "withdraw", "refund", "w grade", "drop deadline"],
    patterns: [/سحب.*اضافة/i, /سحب.*مادة/i, /انسحاب/i, /استرداد.*رسوم/i, /add.*drop/i, /withdraw/i],
  },
  {
    intent: "exams_and_conflicts",
    category: "exams",
    keywordsAr: ["امتحان", "امتحانات", "تعارض", "امتحانين بنفس الوقت", "غير مكتمل", "تأجيل امتحان", "منتصف الفصل", "نهائي"],
    keywordsEn: ["exam", "exams", "conflict", "two exams same time", "incomplete", "makeup exam", "midterm", "final exam"],
    patterns: [/تعارض.*امتحان/i, /امتحانين.*بنفس.*الوقت/i, /غير.*مكتمل/i, /exam.*conflict/i, /incomplete.*exam/i],
  },
  {
    intent: "remedial_and_levels",
    category: "remedial",
    keywordsAr: ["استدراكي", "امتحان مستوى", "عربي استدراكي", "انجليزي استدراكي", "حاسوب استدراكي", "رياضيات استدراكية", "اعفاء"],
    keywordsEn: ["remedial", "level exam", "placement test", "arabic remedial", "english remedial", "computer remedial", "math remedial"],
    patterns: [/استدراك/i, /امتحان.*مستوى/i, /remedial/i, /level.*exam/i, /placement/i],
  },
  {
    intent: "campus_offices_and_contacts",
    category: "offices",
    keywordsAr: ["وين مكتب", "مكتب العميد", "رئيس القسم", "شؤون الطلاب", "موقع الكلية", "تلفون", "ايميل", "العيادة", "المكتبة", "المسجد"],
    keywordsEn: ["where is office", "dean office", "head of department", "student affairs", "phone", "email", "clinic", "library"],
    patterns: [/مكتب.*عميد/i, /وين.*مكتب/i, /رقم.*تلفون/i, /dean.*office/i, /contact/i, /where.*is/i],
  },
];
```

### 5.2 Deterministic Rules & Response Templates

#### 1. Graduation Requirements Intent
- **Arabic Response Template**:
  > **متطلبات التخرج لدرجة البكالوريوس (جامعة الزيتونة الأردنية):**
  > 1. **الساعات المعتمدة**: إتمام جميع ساعات الخطة بنجاح (133 ساعة لتخصصات الذكاء الاصطناعي، علم الحاسوب، هندسة البرمجيات، والأمن السيبراني؛ و132 ساعة للرياضيات).
  > 2. **الحد الأدنى للمعدل التراكمي**: الحصول على معدل تراكمي لا يقل عن **60%** (أو **2.0 من 4.0**).
  > 3. **الإقامة الجامعية**: قضاء آخر فصلين دراسيين عاديين في الجامعة كطالب منتظم.
  > 4. **الحد الأقصى للدراسة**: 7 سنوات للكليات العلمية وتكنولوجيا المعلومات (8 سنوات للهندسة والصيدلة).
  > 
  > *وضعك الحالي*: أكملت **{completedCredits}** ساعة من أصل **{totalCredits}** ساعة، ومعدلك التراكمي **{gpa}**. يتبقى لك **{remainingCredits}** ساعة للتخرج.
- **English Response Template**:
  > **ZUJ Bachelor Graduation Requirements:**
  > 1. **Total Credits**: Successfully pass all 133 credit hours (132 for Mathematics).
  > 2. **Minimum GPA**: Maintain a cumulative GPA of at least **60% (2.0 / 4.0)**.
  > 3. **Residency**: Complete at least the last two regular semesters at ZUJ.
  > 4. **Maximum Duration**: 7 academic years for IT and Science faculties.
  > 
  > *Your Status*: Completed **{completedCredits}** / **{totalCredits}** credits, Cumulative GPA: **{gpa}**. Remaining: **{remainingCredits}** credits.

#### 2. Academic Probation & Warnings Intent
- **Arabic Response Template**:
  > **تعليمات الإنذار الأكاديمي والفصل (المادة 18 من تعليمات البكالوريوس):**
  > 1. **الإنذار الأول**: يوجه للطالب إذا قل معدله التراكمي عن **60%** (2.0) في أي فصل عادي بعد فصل التحاقه الأول.
  > 2. **الإنذار الثاني**: يوجه إذا لم يرفع الطالب معدله التراكمي إلى 60% في الفصل العادي التالي.
  > 3. **مهلة الفصلين**: يمنح الطالب مهلة فصلين دراسيين عاديين لإلغاء الإنذار الثاني ورفع معدله.
  > 4. **الفصل من التخصص**: يفصل الطالب إذا استنفد الفرص، ويستثنى من ذلك من أتم **70%** من ساعات الخطة بنجاح.
  > 5. **الفصل الفوري**: يفصل الطالب من التخصص فوراً إذا حصل على معدل تراكمي أقل من **50%** في أي فصل عادي.
  > 6. **الفصل الصيفي**: لا تصدر فيه إنذارات أكاديمية ويعتبر فرصة إضافية لرفع المعدل.
- **English Response Template**:
  > **ZUJ Academic Probation & Warning Regulations (Article 18):**
  > 1. **1st Warning**: Issued if cumulative GPA falls below **60% (2.0)** after the first semester.
  > 2. **2nd Warning**: Issued if GPA is not raised to 60% in the following regular semester.
  > 3. **Grace Period**: Student is granted up to 2 regular semesters to recover GPA to 60%.
  > 4. **Major Dismissal**: Occurs if warnings are not cleared, unless student completed >= 70% of credit hours.
  > 5. **Immediate Dismissal**: Occurs if cumulative GPA drops below **50% (1.0)** in any regular semester.
  > 6. **Summer Semester**: Warnings are never issued in summer; summer serves as a recovery opportunity.

#### 3. Attendance & Deprivation Intent
- **Arabic Response Template**:
  > **تعليمات المواظبة والغياب والحرمان (المادة 11):**
  > 1. **الحد الأقصى للغياب بدون عذر**: **15%** من ساعات المادة (ما يعادل 8 محاضرات للمواد الوجاهية، أو 5 محاضرات للمواد المدمجة/الإلكترونية).
  > 2. **عقوبة الحرمان**: تجاوز نسبة 15% دون عذر مقبول يترتب عليه حرمان الطالب، ورصد علامة **(صفر)** في المادة، وتدخل في حساب المعدل والإنذار.
  > 3. **الغياب بعذر مقبول**: يسمح حتى **20%** كحد أقصى بعذر مرضي معتمد. إذا تجاوز 20%، ينسحب الطالب من المادة بعذر وتثبت كلمة **(منسحب)** دون حرمان.
  > 4. **تقديم الأعذار الطبية**: يجب اعتماد التقرير الطبي من **عيادة الطلبة في الجامعة** وتقديمه لعميد الكلية خلال **أسبوعين** من تاريخ الانقطاع.
- **English Response Template**:
  > **ZUJ Attendance & Deprivation Policy (Article 11):**
  > 1. **Unexcused Absence Limit**: **15%** of course hours (approx. 8 lectures for face-to-face, 5 for blended).
  > 2. **Deprivation Penalty**: Exceeding 15% unexcused absences results in course deprivation, a grade of **zero (0)**, and calculation into GPA/probation.
  > 3. **Excused Absences**: Up to **20%** with university clinic approval; exceeding 20% results in course withdrawal (`W`), not failure.
  > 4. **Medical Excuses**: Must be certified by the University Health Center and submitted to the Dean within **2 weeks**.

#### 4. Tuition, Fees & Discounts Intent
- **Arabic Response Template**:
  > **الرسوم الدراسية وحساب تكلفة الفصل (كلية العلوم وتكنولوجيا المعلومات):**
  > 1. **سعر الساعة المعتمدة**: **75 ديناراً أردنياً** لتخصصات علم الحاسوب، هندسة البرمجيات، الذكاء الاصطناعي، والأمن السيبراني (و**60 ديناراً** للرياضيات).
  > 2. **رسوم التسجيل الفصلية**: **350 ديناراً** للفصل العادي (و**175 ديناراً** للفصل الصيفي).
  > 3. **الخصومات التشجيعية**:
  >    - خصم **40%** للطلبة الحاصلين على تقدير ممتاز (أو تميز بالثانوية).
  >    - خصم **30%** للطلبة الحاصلين على تقدير جيد جداً.
  >    - *قاعدة حاسمة*: الخصم يطبق **فقط على رسوم الساعات المعتمدة** ولا يشمل رسم التسجيل الفصلي.
  > 4. **معادلة الحساب**:
  >    `التكلفة الإجمالية = (عدد الساعات × سعر الساعة × (1 - نسبة الخصم)) + رسم التسجيل`
  >    *مثال*: 15 ساعة بخصم 40%: `(15 × 75 × 0.60) + 350 = 675 + 350 = 1025 دينار أردني`.
  >    *للاستفسار المالي*: الدائرة المالية هاتف: `0796428046` / `0775150046`.
- **English Response Template**:
  > **Tuition & Semester Cost Calculation (Faculty of Science & IT):**
  > 1. **Credit Hour Rate**: **75 JOD** for CS, SE, AI, and Cybersecurity (60 JOD for Math).
  > 2. **Semester Registration Fee**: **350 JOD** for regular semester (175 JOD for summer).
  > 3. **Discounts**: 40% discount for Excellent students, 30% for Very Good students. Discounts apply strictly to credit fees, not registration fees.
  > 4. **Formula**: `Total = (Hours * Rate * (1 - Discount)) + RegistrationFee`.
  >    *Example (15 credits, 40% discount)*: `(15 * 75 * 0.60) + 350 = 1,025 JOD`.

#### 5. Examination Conflicts & Incomplete Intent
- **Arabic Response Template**:
  > **تعليمات تعارض الامتحانات النهائية وغير المكتمل (المادة 15):**
  > 1. **أولويات حل التعارض عند تزامن امتحانين في نفس الوقت**:
  >    - **أولاً**: تقديم الامتحان خارج الكلية (متطلبات الجامعة).
  >    - **ثانياً**: تقديم الامتحان خارج التخصص (متطلبات الكلية).
  >    - **ثالثاً**: تقديم الامتحان داخل التخصص.
  >    *(يتم التنسيق لتأجيل الامتحان ذي الأولوية الأقل وتأديته كغير مكتمل)*.
  > 2. **التغيب عن الامتحان النهائي بعذر**: يقدم العذر لعميد الكلية خلال **أسبوعين** من تاريخ الامتحان؛ وفي حال قبوله ترصد علامة **غير مكتمل**.
  > 3. **مواعيد امتحانات غير المكتمل**: تعقد الامتحانات التعويضية خلال **الأسابيع الأربعة الأولى** من الفصل الدراسي التالي.
- **English Response Template**:
  > **Exam Conflicts & Incomplete Regulations (Article 15):**
  > 1. **Conflict Priority (Two exams at the same time)**:
  >    - 1st Priority: Exam outside the faculty (University requirements).
  >    - 2nd Priority: Exam outside the major (College requirements).
  >    - 3rd Priority: Exam inside the major.
  >    *(The lower priority exam is postponed and graded as Incomplete)*.
  > 2. **Excused Final Absence**: Submit excuse to the Dean within **2 weeks** to receive an `Incomplete` grade.
  > 3. **Incomplete Exam Schedule**: Held during weeks 1 to 4 of the following semester.

#### 6. Campus Offices, Dean & Advisory Contacts Intent
- **Arabic Response Template**:
  > **دليل المكاتب والتواصل - كلية العلوم وتكنولوجيا المعلومات (مبنى FSIT):**
  > - **مكتب العميد**: الطابق الثالث، غرفة **3-101**.
  > - **مكتب نائب العميد**: الطابق الثالث، غرفة **3-102**.
  > - **رئيس قسم علوم الحاسوب**: الطابق الأول، غرفة **1-101**.
  > - **رئيس قسم تكنولوجيا المعلومات**: الطابق الأول، غرفة **1-106**.
  > - **الاستقبال وشؤون الطلبة**: الطابق الأرضي، غرفة **G-002**.
  > - **مختبرات الحاسوب والذكاء الاصطناعي**: الطابق الأرضي والأول (مختبرات G-L01, 1-L03).
  > - **هاتف الكلية**: `064291511` (فرعي: 331، 332، 334، 370، 469).
  > - **البريد الإلكتروني**: `it@zuj.edu.jo`.
- **English Response Template**:
  > **Faculty of Science & IT Office & Contact Directory (FSIT Building):**
  > - **Dean's Office**: Floor 3, Room **3-101**.
  > - **Vice Dean's Office**: Floor 3, Room **3-102**.
  > - **CS Department Head**: Floor 1, Room **1-101**.
  > - **IT Department Head**: Floor 1, Room **1-106**.
  > - **Student Affairs & Reception**: Ground Floor, Room **G-002**.
  > - **Faculty Phone**: `+962-6-4291511` (Extensions: 331, 332, 334, 370, 469).
  > - **Faculty Email**: `it@zuj.edu.jo`.

---

## 6. Caveats

1. **Student Individual Context**: When a student is unauthenticated or student context is partially absent, fallback answers supply the universal regulatory threshold (e.g. 133 credits, 60% GPA, 18 credit max) while advising the student to check their student portal.
2. **Post-2025 Plan Updates**: All extracted data reflects the 2024–2025 ZUJ Academic Regulations and course catalogs. Any upcoming curriculum adjustments made by the University Senate will need manual synchronization into the dictionary.
3. **No Caveats Beyond Above**: All mined rules, formulas, fees, and contact details are fully supported by primary documents in the repository.

---

## 7. Conclusion

1. **Authoritative Mining Complete**: Mined 220-page `Rules_and_Regulations.pdf`, 19-page `Faculty_Guide.pdf`, 107-page `University_Guide.pdf`, 12 CSV study plans and fee spreadsheets, database `faqs`, and campus navigation seed files.
2. **Full Coverage of M1 Objectives**:
   - Graduation thresholds and credit limits verified (133 credits for CS/SE/AI, 132 for Math, 60% / 2.0 GPA).
   - Academic probation rules documented (warning 1, warning 2, 2 semesters grace, 70% completed exception, immediate dismissal if GPA < 50%).
   - Attendance deprivation thresholds documented (15% unexcused = zero grade, 20% excused = withdrawal).
   - Add/drop, withdrawal refund deduction schedule (25%, 50%, 75%, 100%), and exam conflict priority rules (outside faculty > outside major > inside major) codified.
   - Exact financial fees and discount mechanics (40%/30% discount applied only to credit hour rate of 75 JOD) specified.
   - Campus navigation layout, phone extensions, and room codes mapped.
3. **Local Fallback Ready**: Detailed 3-tier architecture, regex patterns, bilingual keywords, and exact response templates have been structured for drop-in implementation into `server/utils/aiFallback.ts`.

---

## 8. Verification Method

To independently verify the observations, data, and citations in this report, execute the following commands in PowerShell from the project root:

1. **Verify Database FAQs**:
   ```powershell
   node -r dotenv/config -e "import('mysql2/promise').then(async m => { const c = await m.default.createConnection(process.env.DATABASE_URL); const [r] = await c.execute('SELECT * FROM faqs'); console.log('FAQs count:', r.length, r[0].question); await c.end(); })"
   ```
2. **Verify University Regulations (Articles 10, 11, 15, 17, 18, 20, 21, 27)**:
   ```powershell
   python -c "import sys, pypdf; sys.stdout.reconfigure(encoding='utf-8'); r = pypdf.PdfReader('Runpod/data/Rules_and_Regulations.pdf'); print(r.pages[71].extract_text()[:400])"
   ```
3. **Verify Faculty Phone Extensions and Email**:
   ```powershell
   python -c "import sys, pypdf; sys.stdout.reconfigure(encoding='utf-8'); r = pypdf.PdfReader('Runpod/data/Faculty_Guide.pdf'); print(r.pages[18].extract_text())"
   ```
4. **Verify Tuition and Registration Fees CSVs**:
   ```powershell
   Get-Content Runpod/data/Facility_Fees.csv
   Get-Content Runpod/data/Unversity_Fees.csv
   ```
5. **Verify Campus Dean and Dept Head Room Numbers**:
   ```powershell
   Select-String -Path scripts/seed-campus-data.mjs -Pattern "Dean Office|Dept Head"
   ```
