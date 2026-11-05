/**
 * academicUtils.ts
 * Universal Academic Formatting & Conversion Utilities for Al-Zaytoonah University of Jordan (ZUJ)
 *
 * Enforces:
 * 1. 9-Digit Student University ID (YYYYNNNNN) - 4-digit admission year + 5-digit sequence (e.g. 202212359)
 * 2. ZUJ 100% Score System as Primary, with 4.0 GPA scale as secondary sub-line
 * 3. ZUJ 4-Day Academic Week (Sun-Wed) & 3 Teaching Modalities (Integrated, Face-to-Face, Teams)
 */

export interface FormattedUniversityId {
  id: string;
  year: string;
  sequence: string;
}

/**
 * Formats or extracts the 9-digit official ZUJ Student ID (الرقم الجامعي).
 * Format: 4 digits admission year + 5 digits sequence (e.g. 202212359).
 */
export function formatUniversityId(
  user?: {
    id?: number | null;
    email?: string | null;
    openId?: string | null;
    name?: string | null;
    universityId?: string | null;
  } | null | undefined
): string {
  if (!user) return "202212359";

  // If directly provided
  if (user.universityId && /^\d{9}$/.test(user.universityId)) {
    return user.universityId;
  }

  // Abood (Lead Developer & Author of Murshid / Oliver)
  if (
    user.email === "abood@gmail.com" ||
    user.name?.toLowerCase().includes("abood") ||
    user.name?.toLowerCase().includes("abdualrhman")
  ) {
    return "202212359";
  }

  // Check for 9-digit prefix in university email (e.g., 202220650@std-zuj.edu.jo)
  if (user.email) {
    const match = user.email.match(/^(\d{9})@/);
    if (match) return match[1];
  }

  // Check openId for 9 digits (e.g. student_202212359 or 202212359)
  if (user.openId) {
    const match = user.openId.match(/(\d{9})/);
    if (match) return match[1];
  }

  // Map seeded test student accounts to authentic 9-digit ZUJ Student IDs
  if (user.id) {
    const knownMap: Record<number, string> = {
      1: "202212359",      // Abood
      210027: "202110027", // Khaled Haddad (Senior Honor)
      210028: "202210028", // Lina Omar (Sophomore)
      210029: "202210029", // Basma Hassan
      210030: "202310030", // Dana Hussein
      210031: "202310031", // Ahmad / Hala Jaber
      210032: "202410032", // Noor Qasim / Khaled Khalil
      210033: "202210033", // Mohammad Khatib
      210034: "202310034", // Ali Faris
      210035: "202110035", // Zaid Al-Nsour / Ibrahim Rashid
      210036: "202210036", // Sara Mahmoud
      210037: "202310037", // Hala Mahmoud
      210038: "202210038", // Rania Majali / Sara Faris
      210039: "202310039", // Lina Jaber
      210040: "202210040", // Zaid Suleiman
      240001: "202220650", // Noor Al-Huda Hussain (Co-Author)
      240002: "202310892", // Hanan
    };

    if (knownMap[user.id]) {
      return knownMap[user.id];
    }

    // Algorithmic fallback: 2022 + 5-digit zero-padded number
    const seq = String(user.id % 100000).padStart(5, "0");
    return `2022${seq}`;
  }

  return "202212359";
}

/**
 * Converts a 4.0 scale GPA to ZUJ's official 100% Percentage System.
 * In ZUJ regulations:
 *   Excellent:    84% - 100%   (GPA 3.50 - 4.00)
 *   Very Good:    76% - 83.99% (GPA 3.00 - 3.49)
 *   Good:         68% - 75.99% (GPA 2.50 - 2.99)
 *   Acceptable:   60% - 67.99% (GPA 2.00 - 2.49)
 *   Weak/Warning: 50% - 59.99% (GPA 1.50 - 1.99)
 *   Failing:      < 50%        (GPA < 1.50)
 */
export function gpaToPercentage(gpaInput: number | string | null | undefined): number {
  if (gpaInput === null || gpaInput === undefined) return 0;
  const num = typeof gpaInput === "string" ? parseFloat(gpaInput) : gpaInput;
  if (isNaN(num) || num <= 0) return 0;

  // If already in 100% scale
  if (num > 20) return Math.min(100, Math.round(num * 10) / 10);

  // Piecewise continuous conversion calibrated for ZUJ scale
  let pct = 0;
  if (num >= 3.9) {
    pct = 93.0 + (num - 3.9) * 35; // 3.9 -> 93.0%, 4.0 -> 96.5%
  } else if (num >= 3.5) {
    pct = 84.0 + ((num - 3.5) / 0.4) * 9.0; // 3.5 -> 84.0%, 3.88 -> 92.5%
  } else if (num >= 3.0) {
    pct = 76.0 + ((num - 3.0) / 0.5) * 8.0; // 3.0 -> 76.0%, 3.24 -> 79.8%
  } else if (num >= 2.5) {
    pct = 68.0 + ((num - 2.5) / 0.5) * 8.0; // 2.5 -> 68.0%, 2.75 -> 72.0%
  } else if (num >= 2.0) {
    pct = 60.0 + ((num - 2.0) / 0.5) * 8.0; // 2.0 -> 60.0%, 2.14 -> 62.2%
  } else if (num >= 1.5) {
    pct = 50.0 + ((num - 1.5) / 0.5) * 10.0; // 1.5 -> 50.0%, 1.94 -> 58.8%
  } else {
    pct = Math.max(35, num * 33.3);
  }

  return Math.min(100, Math.round(pct * 10) / 10);
}

/**
 * Returns full dual-scale GPA display object (100% primary + 4.0 scale subtext)
 */
export function formatGpaDisplay(gpaInput: number | string | null | undefined) {
  const rawNum = typeof gpaInput === "string" ? parseFloat(gpaInput) : (gpaInput ?? 0);
  const scale4Val = isNaN(rawNum) ? 0 : rawNum > 4 ? Math.min(4, Math.round(((rawNum - 50) / 12.5 + 1.5) * 100) / 100) : rawNum;
  const pctVal = gpaToPercentage(rawNum);

  let ratingEn = "Excellent";
  let ratingAr = "ممتاز";
  let color = "text-emerald-400";
  let bg = "bg-emerald-500/15";
  let border = "border-emerald-500/30";
  let isWarning = false;

  if (pctVal >= 84) {
    ratingEn = "Excellent";
    ratingAr = "ممتاز";
    color = "text-emerald-400";
    bg = "bg-emerald-500/15";
    border = "border-emerald-500/30";
  } else if (pctVal >= 76) {
    ratingEn = "Very Good";
    ratingAr = "جيد جداً";
    color = "text-teal-400";
    bg = "bg-teal-500/15";
    border = "border-teal-500/30";
  } else if (pctVal >= 68) {
    ratingEn = "Good";
    ratingAr = "جيد";
    color = "text-amber-400";
    bg = "bg-amber-500/15";
    border = "border-amber-500/30";
  } else if (pctVal >= 60) {
    ratingEn = "Acceptable";
    ratingAr = "مقبول";
    color = "text-orange-400";
    bg = "bg-orange-500/15";
    border = "border-orange-500/30";
  } else {
    ratingEn = "Academic Probation";
    ratingAr = "إنذار أكاديمي";
    color = "text-rose-400";
    bg = "bg-rose-500/15";
    border = "border-rose-500/30";
    isWarning = true;
  }

  return {
    primaryScore: `${pctVal.toFixed(1)}%`,
    pctValue: pctVal,
    secondaryScale: `(${scale4Val.toFixed(2)} / 4.00)`,
    scale4Value: scale4Val.toFixed(2),
    ratingEn,
    ratingAr,
    color,
    bg,
    border,
    isWarning,
  };
}

/**
 * Formats individual course marks (100% scale primary + letter/pts secondary)
 */
export function formatCourseGradeDisplay(
  grade?: string | null,
  gradePoints?: string | number | null
) {
  const letterMap: Record<
    string,
    { pct: number; pts: number; ar: string; en: string; arabicLetter: string }
  > = {
    "A+": { pct: 96, pts: 4.0, ar: "ممتاز مرتفع", en: "Excellent High", arabicLetter: "أ+" },
    A: { pct: 92, pts: 3.75, ar: "ممتاز", en: "Excellent", arabicLetter: "أ" },
    "A-": { pct: 88, pts: 3.5, ar: "ممتاز", en: "Excellent", arabicLetter: "أ-" },
    "B+": { pct: 82, pts: 3.25, ar: "جيد جداً مرتفع", en: "Very Good High", arabicLetter: "ب+" },
    B: { pct: 78, pts: 3.0, ar: "جيد جداً", en: "Very Good", arabicLetter: "ب" },
    "B-": { pct: 74, pts: 2.75, ar: "جيد مرتفع", en: "Good High", arabicLetter: "ج+" },
    "C+": { pct: 70, pts: 2.5, ar: "جيد", en: "Good", arabicLetter: "ج+" },
    C: { pct: 66, pts: 2.25, ar: "مقبول مرتفع", en: "Acceptable High", arabicLetter: "ج" },
    "C-": { pct: 62, pts: 2.0, ar: "مقبول", en: "Acceptable", arabicLetter: "ج-" },
    "D+": { pct: 58, pts: 1.75, ar: "ضعيف مرتفع", en: "Weak High", arabicLetter: "د+" },
    D: { pct: 52, pts: 1.5, ar: "ضعيف", en: "Weak", arabicLetter: "د" },
    F: { pct: 45, pts: 0.0, ar: "راسب", en: "Fail", arabicLetter: "هـ" },
  };

  const cleanGrade = (grade || "").toUpperCase().trim();
  const info = letterMap[cleanGrade];

  if (info) {
    return {
      primaryScore: `${info.pct}%`,
      secondaryScale: `(${info.pts.toFixed(2)} • ${cleanGrade})`,
      letter: cleanGrade,
      arabicLetter: info.arabicLetter,
      points: info.pts,
      ratingAr: info.ar,
      ratingEn: info.en,
    };
  }

  if (gradePoints !== null && gradePoints !== undefined) {
    const pts = typeof gradePoints === "string" ? parseFloat(gradePoints) : gradePoints;
    if (!isNaN(pts)) {
      const pct = gpaToPercentage(pts);
      const letter = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
      const arLetter = pct >= 90 ? "أ" : pct >= 80 ? "ب" : pct >= 70 ? "ج" : pct >= 60 ? "د" : "هـ";
      return {
        primaryScore: `${pct.toFixed(0)}%`,
        secondaryScale: `(${pts.toFixed(2)})`,
        letter: cleanGrade || letter,
        arabicLetter: arLetter,
        points: pts,
        ratingAr: pct >= 84 ? "ممتاز" : pct >= 76 ? "جيد جداً" : pct >= 68 ? "جيد" : pct >= 60 ? "مقبول" : "ضعيف",
        ratingEn: pct >= 84 ? "Excellent" : pct >= 76 ? "Very Good" : pct >= 68 ? "Good" : pct >= 60 ? "Acceptable" : "Weak",
      };
    }
  }

  return {
    primaryScore: cleanGrade || "—",
    secondaryScale: "",
    letter: cleanGrade || "—",
    arabicLetter: cleanGrade ? "—" : "قيد الدراسة",
    points: 0,
    ratingAr: "قيد الدراسة",
    ratingEn: "In Progress",
  };
}

/**
 * ZUJ Course Modalities & 4-Day Academic Schedule (Sunday - Wednesday)
 */
export type ZujCourseModality = "integrated" | "face_to_face" | "teams";
export type ZujActivityType = "lecture" | "activity" | "teams";

export interface ModalityDetails {
  modality: ZujCourseModality;
  modalityLabelEn: string;
  modalityLabelAr: string;
  activityType: ZujActivityType;
  activityLabelEn: string;
  activityLabelAr: string;
  badgeColor: string;
  iconName: "book" | "globe" | "video";
  teamsLink?: string;
  moodleLink?: string;
}

// Course classification map based on official ZUJ Faculty of IT academic curriculum
const COURSE_MODALITY_MAP: Record<string, ZujCourseModality> = {
  // Face-to-Face (وجاهي كامل): Core Programming, Hardware, Capstones & Math
  CS101: "face_to_face",
  CS102: "face_to_face",
  CS201: "face_to_face",
  CS202: "face_to_face",
  MATH101: "face_to_face",
  MATH102: "face_to_face",
  NET301: "face_to_face",
  SEC301: "face_to_face",
  CS499: "face_to_face",
  CS500: "face_to_face",

  // Integrated / Blended (مدمج): 1 Day In-Person Lecture + 1 Day E-Learning Activity
  CS203: "integrated",
  CS204: "integrated",
  CS205: "integrated",
  CS301: "integrated",
  CS302: "integrated",
  CS304: "integrated",
  CS305: "integrated",
  STAT201: "integrated",
  MATH201: "integrated",
  MATH202: "integrated",

  // Fully Online via Microsoft Teams (إلكتروني كامل عن بُعد عبر تيمز)
  ENG101: "teams",
  ENG102: "teams",
  PHYS101: "teams",
  PHYS102: "teams",
  CS303: "teams",
  CS306: "teams",
  CS401: "teams",
  CS402: "teams",
  CS403: "teams",
  CS404: "teams",
  CS405: "teams",
  CS406: "teams",
};

/**
 * Resolves modality details for a course code and day of week
 */
export function getZujCourseModality(courseCode: string, dayOfWeek?: number): ModalityDetails {
  const code = (courseCode || "").toUpperCase().trim();
  const modality = COURSE_MODALITY_MAP[code] || "integrated";

  // In ZUJ:
  // Integrated courses:
  //   Day 0 (Sun) or Day 1 (Mon) = Physical On-Campus Lecture
  //   Day 2 (Tue) or Day 3 (Wed) = Interactive Electronic Activity (Moodle)
  if (modality === "integrated") {
    const isActivityDay = dayOfWeek === 2 || dayOfWeek === 3;
    return {
      modality: "integrated",
      modalityLabelEn: "Integrated (Blended)",
      modalityLabelAr: "مدمج",
      activityType: isActivityDay ? "activity" : "lecture",
      activityLabelEn: isActivityDay ? "E-Learning Activity" : "Campus Lecture",
      activityLabelAr: isActivityDay ? "نشاط إلكتروني تفاعلي" : "محاضرة وجاهية",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      iconName: isActivityDay ? "globe" : "book",
      moodleLink: "https://elearning.zuj.edu.jo",
    };
  }

  if (modality === "teams") {
    return {
      modality: "teams",
      modalityLabelEn: "Online via MS Teams",
      modalityLabelAr: "إلكتروني كامل - تيمز",
      activityType: "teams",
      activityLabelEn: "Teams Live Session",
      activityLabelAr: "محاضرة تفاعلية عبر تيمز",
      badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      iconName: "video",
      teamsLink: `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${encodeURIComponent(code)}@thread.v2`,
    };
  }

  // Face to Face
  return {
    modality: "face_to_face",
    modalityLabelEn: "Face-to-Face",
    modalityLabelAr: "وجاهي كامل",
    activityType: "lecture",
    activityLabelEn: "Classroom Lecture",
    activityLabelAr: "محاضرة وجاهية بالقاعة",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    iconName: "book",
  };
}

/**
 * Authentic 7-digit ZUJ Course Code Formatter
 * E.g., 0133102 (Data Warehousing), 0135213 (Data Structures), 0101101 (Military Sciences)
 */
const ZUJ_NUMERIC_CODE_MAP: Record<string, string> = {
  CS101: "0135101",
  CS102: "0135102",
  CS201: "0135213",
  CS202: "0135221",
  CS211: "0135213",
  CS301: "0133102",
  CS302: "0133202",
  CS304: "0135425",
  CS341: "0135341",
  SE312: "0135312",
  SE210: "0135210",
  MATH101: "0101101",
  MATH102: "0101102",
  MATH201: "0101201",
  STAT201: "0101205",
  ENG101: "0101121",
  ENG102: "0101122",
  PHYS101: "0101140",
  PHYS102: "0101141",
  AI401: "0135401",
  SE499: "0135499",
  CS499: "0135499",
  CS500: "0135500",
};

export function formatZujCourseCode(code: string | null | undefined): string {
  if (!code) return "0133102";
  const clean = code.trim().toUpperCase();
  if (/^\d{7}$/.test(clean)) return clean;
  return ZUJ_NUMERIC_CODE_MAP[clean] || `013${clean.replace(/\D/g, "").padStart(4, "0").slice(-4)}`;
}

/**
 * 7 Official ZUJ Curriculums / Degree Requirements Tiers
 * Extracted directly from official ZUJ Student Portal (vid1_sec027)
 */
export interface ZujCurriculumTier {
  id: string;
  nameEn: string;
  nameAr: string;
  requiredCredits: number;
  earnedCredits: number;
  color: string;
}

export function getZujCurriculumsSummary(earnedCreditsTotal: number = 72): ZujCurriculumTier[] {
  // Typical breakdown for 132 Cr Bachelor of Science in IT (ZUJ)
  return [
    {
      id: "univ_mandatory",
      nameEn: "University Mandatory Requirements",
      nameAr: "متطلبات جامعة إجبارية",
      requiredCredits: 12,
      earnedCredits: Math.min(12, Math.round(earnedCreditsTotal * 0.16)),
      color: "emerald",
    },
    {
      id: "univ_elective",
      nameEn: "University Elective Requirements",
      nameAr: "متطلبات جامعة اختيارية",
      requiredCredits: 12,
      earnedCredits: Math.min(12, Math.round(earnedCreditsTotal * 0.08)),
      color: "teal",
    },
    {
      id: "faculty_req",
      nameEn: "Faculty Requirements",
      nameAr: "متطلبات كلية",
      requiredCredits: 21,
      earnedCredits: Math.min(21, Math.round(earnedCreditsTotal * 0.28)),
      color: "emerald",
    },
    {
      id: "major_mandatory",
      nameEn: "Major Requirements Mandatory",
      nameAr: "متطلبات تخصص إجبارية",
      requiredCredits: 66,
      earnedCredits: Math.min(66, Math.round(earnedCreditsTotal * 0.38)),
      color: "green",
    },
    {
      id: "major_elective",
      nameEn: "Major Requirements Elective",
      nameAr: "متطلبات تخصص اختيارية",
      requiredCredits: 12,
      earnedCredits: Math.min(12, Math.round(earnedCreditsTotal * 0.06)),
      color: "amber",
    },
    {
      id: "supported_req",
      nameEn: "Supported Requirements",
      nameAr: "مواد مساندة",
      requiredCredits: 9,
      earnedCredits: Math.min(9, Math.round(earnedCreditsTotal * 0.10)),
      color: "indigo",
    },
    {
      id: "remedial_req",
      nameEn: "Remedial Requirements",
      nameAr: "مواد استدراكية",
      requiredCredits: 0,
      earnedCredits: 0,
      color: "slate",
    },
  ];
}
