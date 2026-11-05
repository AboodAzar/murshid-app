import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  courses,
  studentCourses,
  studyPlans,
  users,
  courseSchedules,
  rooms,
  buildings,
  attendance,
  assignments,
  studentAssignments,
  departments,
  announcements,
  academicAlerts,
  recommendations,
  appointments,
  advisorNotes,
} from "../../drizzle/schema";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Helper to resolve target student ID with role-based authorization
async function resolveTargetStudent(
  db: any,
  user: { id: number; role: string },
  inputStudentId?: number
): Promise<{ targetStudentId: number; authorized: boolean }> {
  if (user.role === "student") {
    return { targetStudentId: user.id, authorized: true };
  }
  if (user.role === "admin") {
    return { targetStudentId: inputStudentId ?? 0, authorized: true };
  }
  if (user.role === "advisor") {
    if (!inputStudentId) {
      return { targetStudentId: 0, authorized: false };
    }
    const [student] = await db
      .select({ advisorId: users.advisorId })
      .from(users)
      .where(and(eq(users.id, inputStudentId), eq(users.role, "student")))
      .limit(1);
    if (!student || student.advisorId !== user.id) {
      return { targetStudentId: 0, authorized: false };
    }
    return { targetStudentId: inputStudentId, authorized: true };
  }
  return { targetStudentId: 0, authorized: false };
}

// Canonical 9-digit ZUJ Student ID formatter (YYYYNNNNN)
function formatUniversityIdServer(user?: { id?: number; email?: string; openId?: string; name?: string | null } | null): string {
  if (!user) return "202212359";
  if (user.email === "abood@gmail.com" || user.name?.toLowerCase().includes("abood") || user.name?.toLowerCase().includes("abdualrhman")) {
    return "202212359";
  }
  const matchEmail = user.email?.match(/^(\d{9})@/);
  if (matchEmail) return matchEmail[1];
  const matchOpenId = user.openId?.match(/(\d{9})/);
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
    return `2022${seq}`;
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


export const studentRouter = router({
  dashboard: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
    if (!authorized) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
    }

    const availableStudents =
      ctx.user.role === "admin"
        ? await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(eq(users.role, "student"))
        : ctx.user.role === "advisor"
          ? await db
              .select({
                id: users.id,
                name: users.name,
                email: users.email,
              })
              .from(users)
              .where(and(eq(users.role, "student"), eq(users.advisorId, ctx.user.id)))
          : [];

    if (!targetStudentId) {
      return {
        student: null,
        availableStudents,
        studyPlan: null,
        courses: [],
        stats: {
          gpa: "0.00",
          earnedCredits: 0,
          totalCredits: 0,
          currentSemester: 0,
          progress: 0,
          semestersLeft: 0,
        },
      };
    }

    const selectedStudent =
      ctx.user.role === "student"
        ? {
            id: ctx.user.id,
            name: ctx.user.name,
            email: ctx.user.email,
          }
        : availableStudents.find(student => student.id === targetStudentId) ?? null;

    if ((ctx.user.role === "admin" || ctx.user.role === "advisor") && !selectedStudent) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const plans = await db
      .select()
      .from(studyPlans)
      .where(eq(studyPlans.studentId, targetStudentId))
      .limit(1);
    const enrollments = await db
      .select({
        id: studentCourses.id,
        courseId: studentCourses.courseId,
        semester: studentCourses.semester,
        grade: studentCourses.grade,
        gradePoints: studentCourses.gradePoints,
        status: studentCourses.status,
        code: courses.code,
        name: courses.name,
        nameAr: courses.nameAr,
        credits: courses.credits,
      })
      .from(studentCourses)
      .leftJoin(courses, eq(studentCourses.courseId, courses.id))
      .where(eq(studentCourses.studentId, targetStudentId));

    const completedCredits = enrollments
      .filter(course => course.status === "completed")
      .reduce((sum, course) => sum + Number(course.credits ?? 0), 0);
    const totalCredits = Number(plans[0]?.totalCredits ?? 0);
    const earnedCredits = Number(plans[0]?.completedCredits ?? completedCredits);
    const currentSemester =
      enrollments.reduce((max, course) => Math.max(max, course.semester), 0) || 0;
    const progress =
      totalCredits > 0 ? Math.round((earnedCredits / totalCredits) * 100) : 0;

    // Advisor-created data for student dashboard
    const advisorAlerts = await db
      .select()
      .from(academicAlerts)
      .where(and(eq(academicAlerts.studentId, targetStudentId), eq(academicAlerts.isResolved, false)))
      .orderBy(desc(academicAlerts.createdAt))
      .limit(5);
    const advisorRecommendations = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.studentId, targetStudentId))
      .orderBy(desc(recommendations.createdAt))
      .limit(5);
    const advisorAppointments = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.studentId, targetStudentId), gte(appointments.scheduledAt, new Date())))
      .orderBy(appointments.scheduledAt)
      .limit(5);
    const advisorNotesList = await db
      .select()
      .from(advisorNotes)
      .where(and(eq(advisorNotes.studentId, targetStudentId), eq(advisorNotes.isPrivate, false)))
      .orderBy(desc(advisorNotes.createdAt))
      .limit(5);

    // Deduplicate courses by courseId as a safety net
    const uniqueEnrollments = enrollments.filter(
      (item, index, self) => index === self.findIndex((t) => t.courseId === item.courseId)
    );

    const enhancedStudent = selectedStudent ? {
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
        universityId: formatUniversityIdServer(selectedStudent),
        earnedCredits,
        totalCredits,
        currentSemester,
        progress,
        semestersLeft:
          totalCredits > 0
            ? Math.max(0, Math.ceil((totalCredits - earnedCredits) / 15))
            : 0,
      },
      advisorAlerts,
      advisorRecommendations,
      advisorAppointments,
      advisorNotes: advisorNotesList,
    };
  }),

  myCourses: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return [];
      }

      // Get enrolled courses with course details and instructor
      const enrollments = await db
        .select({
          id: studentCourses.id,
          courseId: studentCourses.courseId,
          semester: studentCourses.semester,
          grade: studentCourses.grade,
          gradePoints: studentCourses.gradePoints,
          status: studentCourses.status,
          code: courses.code,
          name: courses.name,
          nameAr: courses.nameAr,
          credits: courses.credits,
          departmentId: courses.departmentId,
        })
        .from(studentCourses)
        .leftJoin(courses, eq(studentCourses.courseId, courses.id))
        .where(eq(studentCourses.studentId, targetStudentId));

      // Get department heads as proxy instructors
      const deptIds = [...new Set(enrollments.map(e => e.departmentId).filter((id): id is number => id !== null))];
      const deptHeads = deptIds.length
        ? await db
            .select({
              id: departments.id,
              headId: departments.headId,
            })
            .from(departments)
            .where(sql`${departments.id} IN (${sql.join(deptIds.map(id => sql`${id}`), sql`, `)})`)
        : [];

      const headUserIds = deptHeads.map(d => d.headId).filter((id): id is number => id !== null);
      const headUsers = headUserIds.length
        ? await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(sql`${users.id} IN (${sql.join(headUserIds.map(id => sql`${id}`), sql`, `)})`)
        : [];

      const headMap = new Map<number, string>();
      for (const d of deptHeads) {
        if (d.headId) {
          const u = headUsers.find(u => u.id === d.headId);
          if (u?.name) headMap.set(d.id, u.name);
        }
      }

      // Get attendance stats per course
      const attendanceRecords = await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentId, targetStudentId));

      // Get assignment stats per course
      const studentAssignmentRecords = await db
        .select({
          id: studentAssignments.id,
          assignmentId: studentAssignments.assignmentId,
          status: studentAssignments.status,
          score: studentAssignments.score,
          courseId: assignments.courseId,
          totalPoints: assignments.totalPoints,
        })
        .from(studentAssignments)
        .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .where(eq(studentAssignments.studentId, targetStudentId));

      // Calculate progress and attendance per course
      const coursesWithStats = enrollments.map(enrollment => {
        const courseAttendance = attendanceRecords.filter(
          a => a.courseId === enrollment.courseId
        );
        const totalAttendance = courseAttendance.length;
        const presentAttendance = courseAttendance.filter(
          a => a.status === "present" || a.status === "excused"
        ).length;
        const attendanceRate =
          totalAttendance > 0
            ? Math.round((presentAttendance / totalAttendance) * 100)
            : 100;

        const courseAssignments = studentAssignmentRecords.filter(
          a => a.courseId === enrollment.courseId
        );
        const totalAssignmentPoints = courseAssignments.reduce(
          (sum, a) => sum + (a.totalPoints || 0),
          0
        );
        const earnedAssignmentPoints = courseAssignments.reduce(
          (sum, a) => sum + (a.score || 0),
          0
        );
        const assignmentProgress =
          totalAssignmentPoints > 0
            ? Math.round((earnedAssignmentPoints / totalAssignmentPoints) * 100)
            : 0;

        // Combined progress: attendance (40%) + assignments (60%)
        const progress = enrollment.status === "completed"
          ? 100
          : Math.round(attendanceRate * 0.4 + assignmentProgress * 0.6);

        return {
          ...enrollment,
          attendance: attendanceRate,
          progress: Math.min(100, progress),
          totalAssignments: courseAssignments.length,
          completedAssignments: courseAssignments.filter(a => a.status === "submitted" || a.status === "graded").length,
          instructorName: headMap.get(enrollment.departmentId ?? 0) || "—",
          currentGrade: enrollment.grade ?? "—",
        };
      });

      return coursesWithStats;
    }),

  todaySchedule: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return [];
      }

      // Get current day of week (0=Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();

      // Get student's enrolled courses
      const enrollments = await db
        .select({ courseId: studentCourses.courseId })
        .from(studentCourses)
        .where(
          and(
            eq(studentCourses.studentId, targetStudentId),
            eq(studentCourses.status, "in_progress")
          )
        );

      const courseIds = enrollments.map(e => e.courseId);
      if (courseIds.length === 0) return [];

      // Get today's schedules for enrolled courses
      const schedules = await db
        .select({
          id: courseSchedules.id,
          courseId: courseSchedules.courseId,
          dayOfWeek: courseSchedules.dayOfWeek,
          startTime: courseSchedules.startTime,
          endTime: courseSchedules.endTime,
          roomId: courseSchedules.roomId,
          courseName: courses.name,
          courseNameAr: courses.nameAr,
          courseCode: courses.code,
          roomNumber: rooms.roomNumber,
          roomName: rooms.name,
          roomNameAr: rooms.nameAr,
          floor: rooms.floor,
          buildingName: buildings.name,
          buildingNameAr: buildings.nameAr,
          lecturerId: courseSchedules.instructorId,
        })
        .from(courseSchedules)
        .leftJoin(courses, eq(courseSchedules.courseId, courses.id))
        .leftJoin(rooms, eq(courseSchedules.roomId, rooms.id))
        .leftJoin(buildings, eq(rooms.buildingId, buildings.id))
        .where(
          and(
            eq(courseSchedules.dayOfWeek, dayOfWeek),
            sql`${courseSchedules.courseId} IN (${sql.join(courseIds.map(id => sql`${id}`), sql`, `)})`
          )
        );

      // Calculate status for each lecture
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      // Get lecturer names
      const lecturerIds = [...new Set(schedules.map(s => s.lecturerId).filter((id): id is number => id !== null))];
      const lecturerUsers = lecturerIds.length
        ? await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(sql`${users.id} IN (${sql.join(lecturerIds.map(id => sql`${id}`), sql`, `)})`)
        : [];
      const lecturerMap = new Map(lecturerUsers.map(u => [u.id, u.name || "—"]));

      return schedules.map(schedule => {
        const [startH, startM] = schedule.startTime.split(":").map(Number);
        const [endH, endM] = schedule.endTime.split(":").map(Number);
        const startTimeMinutes = startH * 60 + startM;
        const endTimeMinutes = endH * 60 + endM;

        let status: "upcoming" | "ongoing" | "completed";
        if (currentTime < startTimeMinutes) {
          status = "upcoming";
        } else if (currentTime >= startTimeMinutes && currentTime < endTimeMinutes) {
          status = "ongoing";
        } else {
          status = "completed";
        }

        // Countdown minutes for upcoming
        const countdownMinutes =
          status === "upcoming" ? startTimeMinutes - currentTime : 0;

        const code = (schedule.courseCode || "").toUpperCase().trim();
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
          locationOrPlatform: isTeams ? "Microsoft Teams Live" : isActivity ? "E-Learning Portal (Moodle)" : `${schedule.buildingName || "IT"} • ${schedule.roomNumber || ""}`,
          locationOrPlatformAr: isTeams ? "محاضرة مباشرة عبر مايكروسوفت تيمز" : isActivity ? "منصة التعلم الإلكتروني (Moodle)" : `${schedule.buildingNameAr || "كلية العلوم وتكنولوجيا المعلومات"} • قاعة ${schedule.roomNumber || ""}`,
          teamsUrl: isTeams ? `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${encodeURIComponent(code)}@thread.v2` : undefined,
          moodleUrl: isActivity ? "https://elearning.zuj.edu.jo" : undefined,
        };
      }).sort((a, b) => a.startMinutes - b.startMinutes);
    }),

  academicAlerts: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return [];
      }

      const now = new Date();

      // Get enrolled courses
      const enrollments = await db
        .select({
          courseId: studentCourses.courseId,
          status: studentCourses.status,
          grade: studentCourses.grade,
          gradePoints: studentCourses.gradePoints,
          code: courses.code,
          name: courses.name,
          nameAr: courses.nameAr,
          credits: courses.credits,
        })
        .from(studentCourses)
        .leftJoin(courses, eq(studentCourses.courseId, courses.id))
        .where(
          and(
            eq(studentCourses.studentId, targetStudentId),
            eq(studentCourses.status, "in_progress")
          )
        );

      // Get attendance records
      const attendanceRecords = await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentId, targetStudentId));

      // Get overdue/pending assignments
      const studentAssignmentRecords = await db
        .select({
          id: studentAssignments.id,
          status: studentAssignments.status,
          score: studentAssignments.score,
          courseId: assignments.courseId,
          title: assignments.title,
          titleAr: assignments.titleAr,
          dueDate: assignments.dueDate,
          totalPoints: assignments.totalPoints,
        })
        .from(studentAssignments)
        .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .where(eq(studentAssignments.studentId, targetStudentId));

      // Get study plan
      const plans = await db
        .select()
        .from(studyPlans)
        .where(eq(studyPlans.studentId, targetStudentId))
        .limit(1);

      const alerts: Array<{
        id: string;
        type: "warning" | "danger" | "info" | "success";
        title: string;
        titleAr: string;
        message: string;
        messageAr: string;
        priority: number;
        courseId?: number;
        action?: string;
        actionAr?: string;
      }> = [];

      let healthScore = 100;

      // Analyze each course
      for (const course of enrollments) {
        const courseAttendance = attendanceRecords.filter(
          a => a.courseId === course.courseId
        );
        const totalAttendance = courseAttendance.length;
        const presentAttendance = courseAttendance.filter(
          a => a.status === "present" || a.status === "excused"
        ).length;
        const attendanceRate =
          totalAttendance > 0
            ? (presentAttendance / totalAttendance) * 100
            : 100;

        // Low attendance warning
        if (attendanceRate < 75) {
          alerts.push({
            id: `attendance-${course.courseId}`,
            type: "danger",
            title: `Low Attendance: ${course.name}`,
            titleAr: `حضور منخفض: ${course.nameAr || course.name}`,
            message: `Your attendance is ${attendanceRate.toFixed(0)}%. Minimum required is 75%.`,
            messageAr: `نسبة حضورك ${attendanceRate.toFixed(0)}%. الحد الأدنى المطلوب 75%.`,
            priority: 10,
            courseId: course.courseId,
            action: "View attendance details",
            actionAr: "عرض تفاصيل الحضور",
          });
          healthScore -= 15;
        } else if (attendanceRate < 85) {
          alerts.push({
            id: `attendance-warning-${course.courseId}`,
            type: "warning",
            title: `Attendance Warning: ${course.name}`,
            titleAr: `تحذير الحضور: ${course.nameAr || course.name}`,
            message: `Your attendance is ${attendanceRate.toFixed(0)}%. Try to improve it.`,
            messageAr: `نسبة حضورك ${attendanceRate.toFixed(0)}%. حاول تحسينها.`,
            priority: 5,
            courseId: course.courseId,
          });
          healthScore -= 5;
        }

        // Assignment analysis
        const courseAssignments = studentAssignmentRecords.filter(
          a => a.courseId === course.courseId
        );
        const overdueAssignments = courseAssignments.filter(
          a =>
            a.status === "pending" &&
            a.dueDate &&
            new Date(a.dueDate) < now
        );

        for (const overdue of overdueAssignments) {
          alerts.push({
            id: `overdue-${overdue.id}`,
            type: "danger",
            title: `Overdue Assignment: ${overdue.title}`,
            titleAr: `واجب متأخر: ${overdue.titleAr || overdue.title}`,
            message: `Assignment was due on ${overdue.dueDate ? new Date(overdue.dueDate).toLocaleDateString() : "N/A"}. Submit immediately.`,
            messageAr: `كان تسليم الواجب في ${overdue.dueDate ? new Date(overdue.dueDate).toLocaleDateString() : "غير متوفر"}. سلّم فوراً.`,
            priority: 9,
            courseId: course.courseId,
            action: "Submit now",
            actionAr: "سلّم الآن",
          });
          healthScore -= 8;
        }

        // Low score warning
        const gradedAssignments = courseAssignments.filter(a => a.score !== null && a.score !== undefined);
        if (gradedAssignments.length > 0) {
          const avgScore =
            gradedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) /
            gradedAssignments.length;
          if (avgScore < 60) {
            alerts.push({
              id: `low-score-${course.courseId}`,
              type: "danger",
              title: `Low Performance: ${course.name}`,
              titleAr: `أداء ضعيف: ${course.nameAr || course.name}`,
              message: `Your average assignment score is ${avgScore.toFixed(1)}%. Seek academic help.`,
              messageAr: `متوسط درجات الواجبات ${avgScore.toFixed(1)}%. اطلب المساعدة الأكاديمية.`,
              priority: 8,
              courseId: course.courseId,
              action: "Contact advisor",
              actionAr: "تواصل مع المستشار",
            });
            healthScore -= 12;
          }
        }
      }

      // GPA warning
      const gpa = Number(plans[0]?.currentGPA ?? 0);
      if (gpa > 0 && gpa < 2.0) {
        alerts.push({
          id: "gpa-warning",
          type: "danger",
          title: "Low GPA Alert",
          titleAr: "تنبيه معدل تراكمي منخفض",
          message: `Your current GPA is ${gpa.toFixed(2)}. You are at academic risk.`,
          messageAr: `معدلك التراكمي الحالي ${gpa.toFixed(2)}. أنت في خطر أكاديمي.`,
          priority: 10,
          action: "Schedule advisor meeting",
          actionAr: "حدد موعد مع المستشار",
        });
        healthScore -= 20;
      } else if (gpa > 0 && gpa < 2.5) {
        alerts.push({
          id: "gpa-caution",
          type: "warning",
          title: "GPA Caution",
          titleAr: "تحذير المعدل التراكمي",
          message: `Your GPA is ${gpa.toFixed(2)}. Focus on improving your grades.`,
          messageAr: `معدلك ${gpa.toFixed(2)}. ركّز على تحسين درجاتك.`,
          priority: 6,
        });
        healthScore -= 10;
      }

      // Upcoming deadlines (within 3 days)
      const upcomingDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const upcomingAssignments = studentAssignmentRecords.filter(
        a =>
          a.status === "pending" &&
          a.dueDate &&
          new Date(a.dueDate) > now &&
          new Date(a.dueDate) <= upcomingDeadline
      );

      for (const upcoming of upcomingAssignments) {
        const daysLeft = Math.ceil(
          ((upcoming.dueDate ? new Date(upcoming.dueDate).getTime() : now.getTime()) - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        alerts.push({
          id: `upcoming-${upcoming.id}`,
          type: "info",
          title: `Upcoming Deadline: ${upcoming.title}`,
          titleAr: `موعد نهائي قريب: ${upcoming.titleAr || upcoming.title}`,
          message: `Due in ${daysLeft} day${daysLeft > 1 ? "s" : ""}. Don't forget to submit.`,
          messageAr: `التسليم خلال ${daysLeft} يوم. لا تنسَ التسليم.`,
          priority: 4,
          courseId: upcoming.courseId ?? undefined,
          action: "Start working",
          actionAr: "ابدأ العمل",
        });
      }

      // Positive reinforcement
      if (gpa >= 3.5) {
        alerts.push({
          id: "gpa-excellent",
          type: "success",
          title: "Excellent GPA!",
          titleAr: "معدل تراكمي ممتاز!",
          message: `Great job! Your GPA is ${gpa.toFixed(2)}. Keep it up!`,
          messageAr: `أداء رائع! معدلك ${gpa.toFixed(2)}. واصل التميز!`,
          priority: 1,
        });
      }

      // Sort by priority (highest first)
      alerts.sort((a, b) => b.priority - a.priority);

      return {
        healthScore: Math.max(0, Math.min(100, healthScore)),
        alerts: alerts.slice(0, 10),
        summary: {
          totalCourses: enrollments.length,
          lowAttendanceCount: alerts.filter(a => a.id.startsWith("attendance-")).length,
          overdueCount: alerts.filter(a => a.id.startsWith("overdue-")).length,
          upcomingCount: alerts.filter(a => a.id.startsWith("upcoming-")).length,
        },
      };
    }),

  overview: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return { upcomingAssignments: [], recentActivity: [], streak: { current: 0, best: 0 }, achievements: [], gpaHistory: [] };
      }

      const now = new Date();

      // Upcoming assignments (next 14 days)
      const upcomingDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const upcomingAssignments = await db
        .select({
          id: studentAssignments.id,
          assignmentId: studentAssignments.assignmentId,
          status: studentAssignments.status,
          score: studentAssignments.score,
          title: assignments.title,
          titleAr: assignments.titleAr,
          dueDate: assignments.dueDate,
          totalPoints: assignments.totalPoints,
          courseName: courses.name,
          courseCode: courses.code,
        })
        .from(studentAssignments)
        .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .leftJoin(courses, eq(assignments.courseId, courses.id))
        .where(
          and(
            eq(studentAssignments.studentId, targetStudentId),
            eq(studentAssignments.status, "pending"),
            gte(assignments.dueDate, now),
            lte(assignments.dueDate, upcomingDeadline)
          )
        )
        .orderBy(assignments.dueDate);

      // Recent activity (last 14 days) - attendance + submissions
      const activityWindow = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const recentAttendance = await db
        .select({
          id: attendance.id,
          courseId: attendance.courseId,
          date: attendance.date,
          status: attendance.status,
        })
        .from(attendance)
        .where(
          and(
            eq(attendance.studentId, targetStudentId),
            gte(attendance.date, activityWindow)
          )
        )
        .orderBy(desc(attendance.date))
        .limit(20);

      const recentSubmissions = await db
        .select({
          id: studentAssignments.id,
          assignmentId: studentAssignments.assignmentId,
          status: studentAssignments.status,
          score: studentAssignments.score,
          title: assignments.title,
          courseName: courses.name,
          updatedAt: studentAssignments.updatedAt,
        })
        .from(studentAssignments)
        .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .leftJoin(courses, eq(assignments.courseId, courses.id))
        .where(
          and(
            eq(studentAssignments.studentId, targetStudentId),
            gte(studentAssignments.updatedAt, activityWindow),
            sql`${studentAssignments.status} IN ('submitted', 'graded')`
          )
        )
        .orderBy(desc(studentAssignments.updatedAt))
        .limit(20);

      // Merge and sort activity by date
      const activity = [
        ...recentAttendance.map(a => ({
          id: `att-${a.id}`,
          type: "attendance" as const,
          date: a.date,
          status: a.status,
          courseId: a.courseId,
        })),
        ...recentSubmissions.map(s => ({
          id: `sub-${s.id}`,
          type: "submission" as const,
          date: s.updatedAt,
          status: s.status,
          score: s.score,
          title: s.title,
          courseName: s.courseName,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);

      // Study streak: consecutive days with attendance
      const allAttendance = await db
        .select({ date: attendance.date, status: attendance.status })
        .from(attendance)
        .where(eq(attendance.studentId, targetStudentId))
        .orderBy(desc(attendance.date));

      const attendanceDays = new Set(
        allAttendance
          .filter(a => a.status === "present" || a.status === "excused")
          .map(a => new Date(a.date).toDateString())
      );

      let streak = 0;
      const checkDate = new Date(now);
      while (attendanceDays.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Best streak
      let bestStreak = streak;
      const sortedDays = [...attendanceDays].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      let current = 0;
      let prevDate: Date | null = null;
      for (const dayStr of sortedDays) {
        const d = new Date(dayStr);
        if (prevDate) {
          const diff = (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) current++;
          else { bestStreak = Math.max(bestStreak, current); current = 1; }
        } else { current = 1; }
        prevDate = d;
      }
      bestStreak = Math.max(bestStreak, current);

      // Achievements derived from existing data
      const completedCourses = await db
        .select({
          courseId: studentCourses.courseId,
          gradePoints: studentCourses.gradePoints,
        })
        .from(studentCourses)
        .where(
          and(
            eq(studentCourses.studentId, targetStudentId),
            eq(studentCourses.status, "completed")
          )
        );

      const plans = await db
        .select()
        .from(studyPlans)
        .where(eq(studyPlans.studentId, targetStudentId))
        .limit(1);

      const gpa = Number(plans[0]?.currentGPA ?? 0);
      const completedCount = completedCourses.length;
      const totalCredits = Number(plans[0]?.totalCredits ?? 0);
      const earnedCredits = Number(plans[0]?.completedCredits ?? 0);
      const progress = totalCredits > 0 ? Math.round((earnedCredits / totalCredits) * 100) : 0;

      const achievements: Array<{
        id: string;
        title: string;
        titleAr: string;
        description: string;
        descriptionAr: string;
        icon: string;
        unlocked: boolean;
        unlockedAt?: string;
      }> = [
        {
          id: "first-course",
          title: "First Steps",
          titleAr: "أولى الخطوات",
          description: "Enrolled in your first course",
          descriptionAr: "سجّلت في أول دورة",
          icon: "BookOpen",
          unlocked: completedCount >= 1,
          unlockedAt: completedCount >= 1 ? new Date().toISOString() : undefined,
        },
        {
          id: "attendance-star",
          title: "Attendance Star",
          titleAr: "نجم الحضور",
          description: "Maintained 90%+ attendance",
          descriptionAr: "حافظت على حضور 90%+",
          icon: "CheckCircle2",
          unlocked: streak >= 7,
          unlockedAt: streak >= 7 ? new Date().toISOString() : undefined,
        },
        {
          id: "gpa-excellent",
          title: "Dean's List",
          titleAr: "قائمة العميد",
          description: "Achieved GPA of 3.5 or higher",
          descriptionAr: "حققت معدل 3.5 أو أعلى",
          icon: "Award",
          unlocked: gpa >= 3.5,
          unlockedAt: gpa >= 3.5 ? new Date().toISOString() : undefined,
        },
        {
          id: "halfway",
          title: "Halfway There",
          titleAr: "منتصف الطريق",
          description: "Completed 50% of your degree",
          descriptionAr: "أكملت 50% من درجتك",
          icon: "TrendingUp",
          unlocked: progress >= 50,
          unlockedAt: progress >= 50 ? new Date().toISOString() : undefined,
        },
        {
          id: "scholar",
          title: "Scholar",
          titleAr: "عالم",
          description: "Completed 10+ courses",
          descriptionAr: "أكملت 10+ دورات",
          icon: "GraduationCap",
          unlocked: completedCount >= 10,
          unlockedAt: completedCount >= 10 ? new Date().toISOString() : undefined,
        },
      ];

      // GPA history - per semester from completed courses
      const gpaHistory: { semester: number; gpa: number }[] = [];
      if (completedCourses.length > 0) {
        const semesterMap = new Map<number, number[]>();
        const allEnrollments = await db
          .select({ semester: studentCourses.semester, gradePoints: studentCourses.gradePoints })
          .from(studentCourses)
          .where(
            and(
              eq(studentCourses.studentId, targetStudentId),
              eq(studentCourses.status, "completed")
            )
          );
        for (const e of allEnrollments) {
          if (e.gradePoints != null) {
            const pts = Number(e.gradePoints);
            const list = semesterMap.get(e.semester) || [];
            list.push(pts);
            semesterMap.set(e.semester, list);
          }
        }
        const sortedSemesters = [...semesterMap.keys()].sort((a, b) => a - b);
        for (const sem of sortedSemesters) {
          const grades = semesterMap.get(sem)!;
          const avg = grades.reduce((s, v) => s + v, 0) / grades.length;
          gpaHistory.push({ semester: sem, gpa: Math.round(avg * 100) / 100 });
        }
      }

      return {
        upcomingAssignments: upcomingAssignments.map(a => ({
          ...a,
          daysLeft: a.dueDate ? Math.ceil((new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        })),
        recentActivity: activity,
        streak: { current: streak, best: bestStreak },
        achievements,
        gpaHistory,
      };
    }),

  courseDetails: protectedProcedure
    .input(z.object({ courseId: z.number(), studentId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return { course: null, enrollment: null, schedule: [], assignments: [], attendance: { records: [], rate: 0, total: 0, present: 0 } };
      }
      const [enrollment] = await db
        .select({
          id: studentCourses.id,
          semester: studentCourses.semester,
          grade: studentCourses.grade,
          gradePoints: studentCourses.gradePoints,
          status: studentCourses.status,
        })
        .from(studentCourses)
        .where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.courseId, input.courseId)))
        .limit(1);
      const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId)).limit(1);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      const schedule = await db
        .select({
          id: courseSchedules.id,
          dayOfWeek: courseSchedules.dayOfWeek,
          startTime: courseSchedules.startTime,
          endTime: courseSchedules.endTime,
          roomNumber: rooms.roomNumber,
          roomName: rooms.name,
          floor: rooms.floor,
          buildingName: buildings.name,
          buildingNameAr: buildings.nameAr,
          lecturerId: courseSchedules.instructorId,
        })
        .from(courseSchedules)
        .leftJoin(rooms, eq(courseSchedules.roomId, rooms.id))
        .leftJoin(buildings, eq(rooms.buildingId, buildings.id))
        .where(eq(courseSchedules.courseId, input.courseId));
      const lecturerIds = [...new Set(schedule.map(s => s.lecturerId).filter((id): id is number => id !== null))];
      const lecturerUsers = lecturerIds.length
        ? await db.select({ id: users.id, name: users.name }).from(users).where(sql`${users.id} IN (${sql.join(lecturerIds.map(id => sql`${id}`), sql`, `)})`)
        : [];
      const lecturerMap = new Map(lecturerUsers.map(u => [u.id, u.name || "—"]));
      const courseAssignments = await db
        .select({
          id: assignments.id,
          title: assignments.title,
          titleAr: assignments.titleAr,
          dueDate: assignments.dueDate,
          totalPoints: assignments.totalPoints,
          saStatus: studentAssignments.status,
          saScore: studentAssignments.score,
          saSubmittedAt: studentAssignments.submittedAt,
        })
        .from(assignments)
        .leftJoin(studentAssignments, and(eq(studentAssignments.assignmentId, assignments.id), eq(studentAssignments.studentId, targetStudentId)))
        .where(eq(assignments.courseId, input.courseId))
        .orderBy(assignments.dueDate);
      const attendanceRecords = await db
        .select({ id: attendance.id, date: attendance.date, status: attendance.status })
        .from(attendance)
        .where(and(eq(attendance.studentId, targetStudentId), eq(attendance.courseId, input.courseId)))
        .orderBy(desc(attendance.date));
      const totalAtt = attendanceRecords.length;
      const presentAtt = attendanceRecords.filter(a => a.status === "present" || a.status === "excused").length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;
      return {
        course,
        enrollment: enrollment ?? null,
        schedule: schedule.map(s => ({ ...s, lecturerName: lecturerMap.get(s.lecturerId ?? 0) || "—" })),
        assignments: courseAssignments,
        attendance: { records: attendanceRecords, rate: attendanceRate, total: totalAtt, present: presentAtt },
      };
    }),

  fullSchedule: protectedProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return [];
      }
      const enrollments = await db
        .select({ courseId: studentCourses.courseId })
        .from(studentCourses)
        .where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.status, "in_progress")));
      const courseIds = enrollments.map(e => e.courseId);
      if (courseIds.length === 0) return [];
      const schedules = await db
        .select({
          id: courseSchedules.id,
          courseId: courseSchedules.courseId,
          dayOfWeek: courseSchedules.dayOfWeek,
          startTime: courseSchedules.startTime,
          endTime: courseSchedules.endTime,
          roomNumber: rooms.roomNumber,
          roomName: rooms.name,
          floor: rooms.floor,
          buildingName: buildings.name,
          buildingNameAr: buildings.nameAr,
          courseName: courses.name,
          courseNameAr: courses.nameAr,
          courseCode: courses.code,
          lecturerId: courseSchedules.instructorId,
        })
        .from(courseSchedules)
        .leftJoin(courses, eq(courseSchedules.courseId, courses.id))
        .leftJoin(rooms, eq(courseSchedules.roomId, rooms.id))
        .leftJoin(buildings, eq(rooms.buildingId, buildings.id))
        .where(sql`${courseSchedules.courseId} IN (${sql.join(courseIds.map(id => sql`${id}`), sql`, `)})`)
        .orderBy(courseSchedules.dayOfWeek, courseSchedules.startTime);
      const lecturerIds = [...new Set(schedules.map(s => s.lecturerId).filter((id): id is number => id !== null))];
      const lecturerUsers = lecturerIds.length
        ? await db.select({ id: users.id, name: users.name }).from(users).where(sql`${users.id} IN (${sql.join(lecturerIds.map(id => sql`${id}`), sql`, `)})`)
        : [];
      const lecturerMap = new Map(lecturerUsers.map(u => [u.id, u.name || "—"]));
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
            locationOrPlatform: isTeams ? "Microsoft Teams Live" : isActivity ? "E-Learning Portal (Moodle)" : `${s.buildingName || "IT"} • ${s.roomNumber || ""}`,
            locationOrPlatformAr: isTeams ? "محاضرة مباشرة عبر مايكروسوفت تيمز" : isActivity ? "منصة التعلم الإلكتروني (Moodle)" : `${s.buildingNameAr || "كلية العلوم وتكنولوجيا المعلومات"} • قاعة ${s.roomNumber || ""}`,
            teamsUrl: isTeams ? `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${encodeURIComponent(code)}@thread.v2` : undefined,
            moodleUrl: isActivity ? "https://elearning.zuj.edu.jo" : undefined,
          });
        });
      }

      // Filter strictly to Sunday-Wednesday and sort by day & time
      return expandedSchedules
        .filter(s => s.dayOfWeek >= 0 && s.dayOfWeek <= 3)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
    }),

  assignments: protectedProcedure
    .input(z.object({ studentId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return [];
      }
      const conditions = [eq(studentAssignments.studentId, targetStudentId)];
      if (input?.status) conditions.push(eq(studentAssignments.status, input.status as any));
      const items = await db
        .select({
          id: studentAssignments.id,
          status: studentAssignments.status,
          score: studentAssignments.score,
          submittedAt: studentAssignments.submittedAt,
          assignmentId: studentAssignments.assignmentId,
          title: assignments.title,
          titleAr: assignments.titleAr,
          description: assignments.description,
          dueDate: assignments.dueDate,
          totalPoints: assignments.totalPoints,
          courseName: courses.name,
          courseCode: courses.code,
          courseId: courses.id,
        })
        .from(studentAssignments)
        .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
        .leftJoin(courses, eq(assignments.courseId, courses.id))
        .where(and(...conditions))
        .orderBy(assignments.dueDate);
      return items;
    }),

  attendance: protectedProcedure
    .input(z.object({ studentId: z.number().optional(), courseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { targetStudentId, authorized } = await resolveTargetStudent(db, ctx.user, input?.studentId);
      if (!authorized) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this student" });
      }
      if (!targetStudentId) {
        return [];
      }
      const conditions = [eq(attendance.studentId, targetStudentId)];
      if (input?.courseId) conditions.push(eq(attendance.courseId, input.courseId));
      const records = await db
        .select({
          id: attendance.id,
          date: attendance.date,
          status: attendance.status,
          courseName: courses.name,
          courseCode: courses.code,
          courseId: courses.id,
        })
        .from(attendance)
        .leftJoin(courses, eq(attendance.courseId, courses.id))
        .where(and(...conditions))
        .orderBy(desc(attendance.date));
      return records;
    }),

  studentAnnouncements: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const limit = input?.limit ?? 10;
      const items = await db
        .select({
          id: announcements.id,
          title: announcements.title,
          titleAr: announcements.titleAr,
          content: announcements.content,
          contentAr: announcements.contentAr,
          priority: announcements.priority,
          createdAt: announcements.createdAt,
        })
        .from(announcements)
        .where(and(eq(announcements.isActive, true), eq(announcements.targetRole, "student")))
        .orderBy(desc(announcements.createdAt))
        .limit(limit);
      return items;
    }),

  seed: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user.role !== "student") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only students can seed demo data" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const studentId = ctx.user.id;

      // Clean old seed data for this student to prevent duplicates
      await db.delete(studentCourses).where(eq(studentCourses.studentId, studentId));
      await db.delete(studentAssignments).where(eq(studentAssignments.studentId, studentId));
      await db.delete(attendance).where(eq(attendance.studentId, studentId));
      await db.delete(studyPlans).where(eq(studyPlans.studentId, studentId));

      // Seed study plan
      await db.insert(studyPlans).values({
        studentId,
        totalCredits: 132,
        completedCredits: 78,
        currentGPA: "3.68",
        status: "active",
      });

      const allCourses = await db.select().from(courses).limit(12);
      const grades = [
        { grade: "A", points: "4.00", status: "completed" },
        { grade: "B+", points: "3.33", status: "completed" },
        { grade: "A-", points: "3.67", status: "completed" },
        { grade: "B", points: "3.00", status: "completed" },
        { grade: "C+", points: "2.33", status: "completed" },
        { grade: "F", points: "0.00", status: "completed" },
        { grade: "B-", points: "2.67", status: "in_progress" },
        { grade: "C", points: "2.00", status: "in_progress" },
        { grade: "A", points: "4.00", status: "in_progress" },
        { grade: "B+", points: "3.33", status: "in_progress" },
      ];
      let enrolledCourseIds: number[] = [];
      for (let i = 0; i < Math.min(grades.length, allCourses.length); i++) {
        const c = allCourses[i];
        if (!c) continue;
        const g = grades[i];
        await db.insert(studentCourses).values({
          studentId,
          courseId: c.id,
          semester: c.semester,
          grade: g.grade,
          gradePoints: g.points,
          status: g.status as any,
        });
        enrolledCourseIds.push(c.id);
      }

      // Seed course schedules if none exist for enrolled courses
      const activeCourseIds = enrolledCourseIds.length > 0 ? enrolledCourseIds : [];
      if (activeCourseIds.length > 0) {
        const existingSchedules = await db.select({ count: sql`COUNT(*)` }).from(courseSchedules).where(sql`${courseSchedules.courseId} IN (${sql.join(activeCourseIds.map(id => sql`${id}`), sql`, `)})`);
        const scheduleCount = Number(existingSchedules[0]?.count ?? 0);
        if (scheduleCount === 0) {
          const roomsList = await db.select().from(rooms).limit(5);
          const dayTimeSlots = [
            { day: 0, start: "09:00", end: "10:30" },
            { day: 0, start: "11:00", end: "12:30" },
            { day: 1, start: "09:00", end: "10:30" },
            { day: 1, start: "13:00", end: "14:30" },
            { day: 2, start: "10:00", end: "11:30" },
            { day: 3, start: "09:00", end: "10:30" },
            { day: 3, start: "11:00", end: "12:30" },
            { day: 4, start: "09:00", end: "10:30" },
          ];
          for (let i = 0; i < Math.min(activeCourseIds.length * 2, dayTimeSlots.length); i++) {
            const slot = dayTimeSlots[i];
            const courseId = activeCourseIds[i % activeCourseIds.length];
            const roomId = roomsList.length > 0 ? roomsList[i % roomsList.length].id : 1;
            await db.insert(courseSchedules).values({
              courseId,
              dayOfWeek: slot.day,
              startTime: slot.start,
              endTime: slot.end,
              roomId,
            });
          }
        }
      }

      // Seed assignments for enrolled courses if none exist
      if (activeCourseIds.length > 0) {
        const existingAssignments = await db.select({ count: sql`COUNT(*)` }).from(assignments).where(sql`${assignments.courseId} IN (${sql.join(activeCourseIds.map(id => sql`${id}`), sql`, `)})`);
        const assignmentCount = Number(existingAssignments[0]?.count ?? 0);
        if (assignmentCount === 0) {
          const now = new Date();
          for (let ci = 0; ci < activeCourseIds.length; ci++) {
            const courseId = activeCourseIds[ci];
            const isOverdue = ci < 3;
            const courseAssignments = [
              { title: "Assignment 1", titleAr: "واجب 1", dueDate: new Date(now.getTime() + (isOverdue ? -3 : 3) * 24 * 60 * 60 * 1000), totalPoints: 100 },
              { title: "Assignment 2", titleAr: "واجب 2", dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), totalPoints: 100 },
              { title: "Midterm Project", titleAr: "مشروع منتصف الفصل", dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), totalPoints: 200 },
            ];
            for (const a of courseAssignments) {
              const [inserted] = await db.insert(assignments).values({
                courseId,
                title: a.title,
                titleAr: a.titleAr,
                dueDate: a.dueDate,
                totalPoints: a.totalPoints,
              });
              const assignmentId = inserted.insertId;
              if (assignmentId) {
                await db.insert(studentAssignments).values({
                  studentId,
                  assignmentId: Number(assignmentId),
                  status: "pending",
                });
              }
            }
          }
        }
      }

      // Seed attendance records
      if (activeCourseIds.length > 0) {
        const now = new Date();
        const statuses: Array<"present" | "absent" | "excused" | "late"> = ["present", "present", "absent", "present", "late", "absent", "present", "excused", "present", "absent", "present", "late", "present", "absent", "present", "present", "absent", "present", "late", "present"];
        for (let i = 0; i < 30; i++) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const courseId = activeCourseIds[i % activeCourseIds.length];
          await db.insert(attendance).values({
            studentId,
            courseId,
            scheduleId: 1,
            date,
            status: statuses[i % statuses.length],
          });
        }
      }

      // Seed announcements if none exist
      const existingAnnouncements = await db.select({ count: sql`COUNT(*)` }).from(announcements);
      const announcementCount = Number(existingAnnouncements[0]?.count ?? 0);
      if (announcementCount === 0) {
        await db.insert(announcements).values([
          {
            title: "Welcome to the new semester!",
            titleAr: "أهلاً بالفصل الدراسي الجديد!",
            content: "We hope you have a productive and successful semester. Check your study plan and course schedule.",
            contentAr: "نتمنى لكم فصلاً دراسياً منتجاً وناجحاً. راجع خطتك الدراسية وجدول المقررات.",
            createdBy: studentId,
            priority: "medium",
            targetRole: "all",
            isActive: true,
          },
          {
            title: "Exam Registration Deadline",
            titleAr: "موعد نهائي لتسجيل الامتحانات",
            content: "Make sure to register for your final exams before the deadline next Friday.",
            contentAr: "تأكد من تسجيل امتحاناتك النهائية قبل الموعد النهائي الجمعة القادمة.",
            createdBy: studentId,
            priority: "high",
            targetRole: "student",
            isActive: true,
          },
          {
            title: "Library Hours Extended",
            titleAr: "تمديد ساعات المكتبة",
            content: "The university library will now be open until midnight during exam weeks.",
            contentAr: "ستكون مكتبة الجامعة مفتوحة حتى منتصف الليل خلال أسابيع الامتحانات.",
            createdBy: studentId,
            priority: "low",
            targetRole: "all",
            isActive: true,
          },
        ]);
      }

      return { success: true };
    }),
});
