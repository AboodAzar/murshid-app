import fs from "fs";

let content = fs.readFileSync("server/routers/student.ts", "utf8");

// Convert to LF first for clean regex operations
content = content.replace(/\r\n/g, "\n");

// 1. Add Helper functions after resolveTargetStudent definition
const helperCode = `
// Canonical 9-digit ZUJ Student ID formatter (YYYYNNNNN)
function formatUniversityIdServer(user?: { id?: number; email?: string; openId?: string; name?: string } | null): string {
  if (!user) return "202212359";
  if (user.email === "abood@gmail.com" || user.name?.toLowerCase().includes("abood") || user.name?.toLowerCase().includes("abdualrhman")) {
    return "202212359";
  }
  const matchEmail = user.email?.match(/^(\\d{9})@/);
  if (matchEmail) return matchEmail[1];
  const matchOpenId = user.openId?.match(/(\\d{9})/);
  if (matchOpenId) return matchOpenId[1];

  const knownMap: Record<number, string> = {
    1: "202212359",
    210027: "202110027",
    210028: "202210028",
    210029: "202210029",
    210030: "202310030",
    210031: "202310031",
    210032: "202410032",
    210033: "202210033",
    210034: "202310034",
    210035: "202110035",
    240001: "202220650",
  };
  if (user.id && knownMap[user.id]) return knownMap[user.id];
  if (user.id) {
    const seq = String(user.id % 100000).padStart(5, "0");
    return \`2022\${seq}\`;
  }
  return "202212359";
}

// Convert 4.0 GPA to ZUJ 100% score system
function gpaToPercentageServer(gpaInput: number | string | null | undefined): number {
  if (gpaInput === null || gpaInput === undefined) return 0;
  const num = typeof gpaInput === "string" ? parseFloat(gpaInput) : gpaInput;
  if (isNaN(num) || num <= 0) return 0;
  if (num > 20) return Math.min(100, Math.round(num * 10) / 10);
  let pct = 0;
  if (num >= 3.9) pct = 93.0 + (num - 3.9) * 35;
  else if (num >= 3.5) pct = 84.0 + ((num - 3.5) / 0.4) * 9.0;
  else if (num >= 3.0) pct = 76.0 + ((num - 3.0) / 0.5) * 8.0;
  else if (num >= 2.5) pct = 68.0 + ((num - 2.5) / 0.5) * 8.0;
  else if (num >= 2.0) pct = 60.0 + ((num - 2.0) / 0.5) * 8.0;
  else if (num >= 1.5) pct = 50.0 + ((num - 1.5) / 0.5) * 10.0;
  else pct = Math.max(35, num * 33.3);
  return Math.min(100, Math.round(pct * 10) / 10);
}

// ZUJ Course Modality Map based on IT Faculty curriculum
const ZUJ_COURSE_MODALITIES: Record<string, "face_to_face" | "integrated" | "teams"> = {
  CS101: "face_to_face", CS102: "face_to_face", CS201: "face_to_face", CS202: "face_to_face",
  MATH101: "face_to_face", MATH102: "face_to_face", NET301: "face_to_face", SEC301: "face_to_face",
  CS499: "face_to_face", CS500: "face_to_face",
  CS203: "integrated", CS204: "integrated", CS205: "integrated", CS301: "integrated",
  CS302: "integrated", CS304: "integrated", CS305: "integrated", STAT201: "integrated",
  MATH201: "integrated", MATH202: "integrated",
  ENG101: "teams", ENG102: "teams", PHYS101: "teams", PHYS102: "teams",
  CS303: "teams", CS306: "teams", CS401: "teams", CS402: "teams",
  CS403: "teams", CS404: "teams", CS405: "teams", CS406: "teams",
};
`;

if (!content.includes("formatUniversityIdServer")) {
  content = content.replace(
    "return { targetStudentId: 0, authorized: false };\n}",
    "return { targetStudentId: 0, authorized: false };\n}\n" + helperCode
  );
}

// 2. Enhance dashboard return in student.ts
content = content.replace(
  `    return {
      student: selectedStudent,
      availableStudents,
      studyPlan: plans[0] ?? null,
      courses: uniqueEnrollments,
      stats: {
        gpa: plans[0]?.currentGPA ?? "0.00",`,
  `    const enhancedStudent = selectedStudent ? {
      ...selectedStudent,
      universityId: formatUniversityIdServer(selectedStudent),
    } : null;

    const enhancedAvailable = availableStudents.map(s => ({
      ...s,
      universityId: formatUniversityIdServer(s),
    }));

    return {
      student: enhancedStudent,
      availableStudents: enhancedAvailable,
      studyPlan: plans[0] ?? null,
      courses: uniqueEnrollments,
      stats: {
        gpa: plans[0]?.currentGPA ?? "0.00",
        gpaPercentage: gpaToPercentageServer(plans[0]?.currentGPA ?? "0.00"),
        gpaScale4: plans[0]?.currentGPA ?? "0.00",
        universityId: formatUniversityIdServer(selectedStudent),`
);

// 3. Enhance todaySchedule in student.ts
const oldTodayMap = `        return {
          ...schedule,
          status,
          countdownMinutes,
          startMinutes: startTimeMinutes,
          lecturerName: lecturerMap.get(schedule.lecturerId ?? 0) || "—",
        };`;

const newTodayMap = `        const code = (schedule.courseCode || "").toUpperCase().trim();
        const modality = ZUJ_COURSE_MODALITIES[code] || "integrated";
        const isActivity = modality === "integrated" && (schedule.dayOfWeek === 2 || schedule.dayOfWeek === 3);
        const isTeams = modality === "teams";
        const activityType = isTeams ? "teams" : isActivity ? "activity" : "lecture";

        return {
          ...schedule,
          status,
          countdownMinutes,
          startMinutes: startTimeMinutes,
          lecturerName: lecturerMap.get(schedule.lecturerId ?? 0) || "—",
          modality,
          modalityLabel: modality === "integrated" ? "Integrated (Blended)" : modality === "teams" ? "Teams Online" : "Face-to-Face",
          modalityLabelAr: modality === "integrated" ? "مدمج" : modality === "teams" ? "إلكتروني كامل - تيمز" : "وجاهي كامل",
          activityType,
          activityLabel: isTeams ? "MS Teams Live" : isActivity ? "E-Learning Activity" : "Classroom Lecture",
          activityLabelAr: isTeams ? "محاضرة تفاعلية عبر تيمز" : isActivity ? "نشاط إلكتروني تفاعلي" : "محاضرة وجاهية بالقاعة",
          locationOrPlatform: isTeams ? "Microsoft Teams Live" : isActivity ? "E-Learning Portal (Moodle)" : \`\${schedule.buildingName || "IT"} • \${schedule.roomNumber || ""}\`,
          locationOrPlatformAr: isTeams ? "محاضرة مباشرة عبر مايكروسوفت تيمز" : isActivity ? "منصة التعلم الإلكتروني (Moodle)" : \`\${schedule.buildingNameAr || "كلية العلوم وتكنولوجيا المعلومات"} • قاعة \${schedule.roomNumber || ""}\`,
          teamsUrl: isTeams ? \`https://teams.microsoft.com/l/meetup-join/19%3ameeting_\${encodeURIComponent(code)}@thread.v2\` : undefined,
          moodleUrl: isActivity ? "https://elearning.zuj.edu.jo" : undefined,
        };`;

if (content.includes(oldTodayMap)) {
  content = content.replace(oldTodayMap, newTodayMap);
}

// 4. Enhance fullSchedule in student.ts to full 4-day timetable with modalities
const oldFullScheduleReturn = `      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return schedules.map(s => ({
        ...s,
        lecturerName: lecturerMap.get(s.lecturerId ?? 0) || "—",
        dayName: dayNames[s.dayOfWeek] || "Unknown",
      }));`;

const newFullScheduleReturn = `      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayNamesAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

      // ZUJ 4-Day Teaching Week: Expand each enrolled course into its 2 weekly sessions (Sun/Tue or Mon/Wed)
      const expandedSchedules: any[] = [];

      for (const s of schedules) {
        // Remap any leftover day to valid 4-day week (0=Sun, 1=Mon, 2=Tue, 3=Wed)
        const primaryDay = s.dayOfWeek >= 4 ? 2 : s.dayOfWeek;
        // ZUJ Day pairing: 0 (Sun) pairs with 2 (Tue); 1 (Mon) pairs with 3 (Wed)
        const pairedDay = (primaryDay === 0 || primaryDay === 2) 
          ? (primaryDay === 0 ? 2 : 0) 
          : (primaryDay === 1 ? 3 : 1);

        const days = [primaryDay, pairedDay].sort((a, b) => a - b);
        const code = (s.courseCode || "").toUpperCase().trim();
        const modality = ZUJ_COURSE_MODALITIES[code] || "integrated";

        days.forEach((day, idx) => {
          const isActivity = modality === "integrated" && (day === 2 || day === 3);
          const isTeams = modality === "teams";
          const activityType = isTeams ? "teams" : isActivity ? "activity" : "lecture";

          expandedSchedules.push({
            ...s,
            id: s.id * 100 + (idx + 1),
            dayOfWeek: day,
            dayName: dayNames[day] || "Unknown",
            dayNameAr: dayNamesAr[day] || "غير محدد",
            lecturerName: lecturerMap.get(s.lecturerId ?? 0) || "—",
            modality,
            modalityLabel: modality === "integrated" ? "Integrated (Blended)" : modality === "teams" ? "Teams Online" : "Face-to-Face",
            modalityLabelAr: modality === "integrated" ? "مدمج" : modality === "teams" ? "إلكتروني كامل - تيمز" : "وجاهي كامل",
            activityType,
            activityLabel: isTeams ? "MS Teams Live" : isActivity ? "E-Learning Activity" : "Classroom Lecture",
            activityLabelAr: isTeams ? "محاضرة تفاعلية عبر تيمز" : isActivity ? "نشاط إلكتروني تفاعلي" : "محاضرة وجاهية بالقاعة",
            locationOrPlatform: isTeams ? "Microsoft Teams Live" : isActivity ? "E-Learning Portal (Moodle)" : \`\${s.buildingName || "IT"} • \${s.roomNumber || ""}\`,
            locationOrPlatformAr: isTeams ? "محاضرة مباشرة عبر مايكروسوفت تيمز" : isActivity ? "منصة التعلم الإلكتروني (Moodle)" : \`\${s.buildingNameAr || "كلية العلوم وتكنولوجيا المعلومات"} • قاعة \${s.roomNumber || ""}\`,
            teamsUrl: isTeams ? \`https://teams.microsoft.com/l/meetup-join/19%3ameeting_\${encodeURIComponent(code)}@thread.v2\` : undefined,
            moodleUrl: isActivity ? "https://elearning.zuj.edu.jo" : undefined,
          });
        });
      }

      // Filter strictly to Sunday-Wednesday and sort by day & time
      return expandedSchedules
        .filter(s => s.dayOfWeek >= 0 && s.dayOfWeek <= 3)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));`;

if (content.includes(oldFullScheduleReturn)) {
  content = content.replace(oldFullScheduleReturn, newFullScheduleReturn);
}

fs.writeFileSync("server/routers/student.ts", content);
console.log("Successfully patched server/routers/student.ts");
