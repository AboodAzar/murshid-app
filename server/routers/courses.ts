import path from "path";
import fs from "fs";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  courses,
  coursePrerequisites,
  studentCourses,
  departments,
  courseMaterials,
  users,
  courseSchedules,
  rooms,
  buildings,
  attendance,
  assignments,
  studentAssignments,
} from "../../drizzle/schema";
import { desc } from "drizzle-orm";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const coursesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          departmentId: z.number().optional(),
          semester: z.number().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const conditions = [];
        if (input?.departmentId) {
          conditions.push(eq(courses.departmentId, input.departmentId));
        }
        if (input?.semester) {
          conditions.push(eq(courses.semester, input.semester));
        }

        const page = input?.page || 1;
        const limit = input?.limit || 20;
        const offset = (page - 1) * limit;

        const query =
          conditions.length > 0
            ? db
                .select()
                .from(courses)
                .where(and(...conditions))
            : db.select().from(courses);

        const results = await query.limit(limit).offset(offset);

        // Get total count for pagination metadata
        const countQuery =
          conditions.length > 0
            ? db
                .select()
                .from(courses)
                .where(and(...conditions))
            : db.select().from(courses);
        const allResults = await countQuery;
        const total = allResults.length;

        return {
          data: results,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Courses] Failed to list courses:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input: courseId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const result = await db
          .select()
          .from(courses)
          .where(eq(courses.id, courseId))
          .limit(1);
        return result[0] || null;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Courses] Failed to get course:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getPrerequisites: publicProcedure
    .input(z.number())
    .query(async ({ input: courseId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const prereqs = await db
          .select()
          .from(coursePrerequisites)
          .where(eq(coursePrerequisites.courseId, courseId));
        const prerequisiteIds = prereqs.map(p => p.prerequisiteId);

        if (prerequisiteIds.length === 0) return [];

        return await db
          .select()
          .from(courses)
          .where(inArray(courses.id, prerequisiteIds));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Courses] Failed to get prerequisites:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getAllPrerequisites: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    try {
      const prereqs = await db
        .select({
          courseId: coursePrerequisites.courseId,
          prerequisiteId: coursePrerequisites.prerequisiteId,
          prerequisiteCode: courses.code,
          prerequisiteName: courses.name,
          prerequisiteNameAr: courses.nameAr,
        })
        .from(coursePrerequisites)
        .innerJoin(courses, eq(coursePrerequisites.prerequisiteId, courses.id));

      return prereqs;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("[Courses] Failed to get all prerequisites:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  getStudentCourses: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["completed", "in_progress", "planned"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Allow students, advisors, and admins to view student courses
      if (ctx.user.role !== "student" && ctx.user.role !== "advisor" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const conditions = [eq(studentCourses.studentId, ctx.user.id)];
        if (input?.status) {
          conditions.push(eq(studentCourses.status, input.status));
        }

        return await db
          .select()
          .from(studentCourses)
          .where(and(...conditions));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Courses] Failed to get student courses:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  enrollCourse: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        semester: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Allow only students to enroll courses
      if (ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Verify course exists
        const [targetCourse] = await db
          .select()
          .from(courses)
          .where(eq(courses.id, input.courseId))
          .limit(1);

        if (!targetCourse) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found",
          });
        }

        // Check if student is already enrolled or completed this course
        const existing = await db
          .select()
          .from(studentCourses)
          .where(
            and(
              eq(studentCourses.studentId, ctx.user.id),
              eq(studentCourses.courseId, input.courseId)
            )
          );

        if (existing.length > 0) {
          const isCompleted = existing.some(e => e.status === "completed");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: isCompleted
              ? "Cannot enroll: Course has already been completed"
              : "Already enrolled in this course",
          });
        }

        // Prerequisite verification: check if all required prerequisites are completed
        const prereqs = await db
          .select()
          .from(coursePrerequisites)
          .where(eq(coursePrerequisites.courseId, input.courseId));

        if (prereqs.length > 0) {
          const prereqIds = prereqs.map(p => p.prerequisiteId);

          const completedCourses = await db
            .select({ courseId: studentCourses.courseId })
            .from(studentCourses)
            .where(
              and(
                eq(studentCourses.studentId, ctx.user.id),
                eq(studentCourses.status, "completed"),
                inArray(studentCourses.courseId, prereqIds)
              )
            );

          const completedPrereqIds = new Set(completedCourses.map(c => c.courseId));
          const missingPrereqIds = prereqIds.filter(pid => !completedPrereqIds.has(pid));

          if (missingPrereqIds.length > 0) {
            const missingCourses = await db
              .select({ code: courses.code, name: courses.name })
              .from(courses)
              .where(inArray(courses.id, missingPrereqIds));

            const missingCodes = missingCourses.map(c => c.code || c.name);
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Cannot enroll: Missing prerequisite course(s): ${missingCodes.join(", ")}`,
            });
          }
        }

        const semesterToAssign = input.semester ?? targetCourse.semester ?? 1;

        await db.insert(studentCourses).values({
          studentId: ctx.user.id,
          courseId: input.courseId,
          semester: semesterToAssign,
          status: "planned",
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Courses] Failed to enroll course:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Allow students, advisors, and admins to view recommendations
    if (ctx.user.role !== "student" && ctx.user.role !== "advisor" && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      // Get student's completed courses
      const completedCourses = await db
        .select()
        .from(studentCourses)
        .where(
          and(
            eq(studentCourses.studentId, ctx.user.id),
            eq(studentCourses.status, "completed")
          )
        );

      const completedCourseIds = completedCourses.map(c => c.courseId);

      // Get all courses
      const allCourses = await db.select().from(courses);

      // Filter courses that have all prerequisites completed
      const recommendations = allCourses.filter(course => {
        // Don't recommend already enrolled courses
        if (completedCourses.some(c => c.courseId === course.id)) return false;

        // Check GPA requirement (simplified - would need actual GPA calculation)
        if (ctx.user?.role === "student") {
          // In a real app, fetch actual GPA from study plan
          return true;
        }
        return false;
      });

      return recommendations.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("[Courses] Failed to get recommendations:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * getCourseTemplate:
   * Unified Course Page Template (matching real ZUJ E-Learning platform)
   * Includes:
   * - Course info, syllabus & cover image
   * - Doctor profile info (office number, email, phone)
   * - Deactivated doctor handling: shows [Deactivated] and hides contact details
   * - Chapters with slides, notes, assignments, quizzes, and exams
   * - Attendance records & Article 14 absence counter
   * - Completed course locking & preservation
   */
  getCourseTemplate: protectedProcedure
    .input(z.object({ courseId: z.number(), studentId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const targetStudentId = input.studentId || ctx.user?.id || 1;

      // 1. Fetch Course details
      const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId)).limit(1);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });

      // 2. Fetch Enrollment status (detect if course is completed & locked)
      const [enrollment] = await db
        .select()
        .from(studentCourses)
        .where(and(eq(studentCourses.studentId, targetStudentId), eq(studentCourses.courseId, input.courseId)))
        .limit(1);

      const isCompleted = enrollment?.status === "completed";
      const isLocked = isCompleted; // Completed courses are locked and saved
      const grade = enrollment?.grade || (isCompleted ? "A" : null);

      // 3. Resolve Course Instructors & Doctor Profile
      // Check if this course has a deactivated instructor flag
      // e.g. for historical completed course CS101 or when instructor departed
      const isHistoricalDeactivated = course.code === "CS101" || course.code === "MATH101" || (course as any).isDoctorDeactivated;

      let doctors: Array<{
        id: number;
        name: string;
        nameAr: string;
        title: string;
        email: string | null;
        officeNumber: string | null;
        phone: string | null;
        isActive: boolean;
        isDeactivated: boolean;
        contactNotice?: string;
        avatarUrl?: string;
      }> = [];

      if (isHistoricalDeactivated) {
        // Faculty member departed from university
        doctors = [
          {
            id: 999,
            name: "Dr. Samir Al-Najjar",
            nameAr: "د. سمير النجار",
            title: "Former Assistant Professor of Computer Science",
            email: null, // Hidden & unavailable
            officeNumber: null, // Hidden & unavailable
            phone: null, // Hidden & unavailable
            isActive: false,
            isDeactivated: true,
            contactNotice: "Faculty member has moved from the university / instructor account deactivated. Contact details unavailable.",
          }
        ];
      } else {
        // Active instructor based on course discipline
        if (course.code.startsWith("CS201") || course.code.startsWith("CS202")) {
          doctors = [
            {
              id: 101,
              name: "Dr. Ahmad Khalil",
              nameAr: "د. أحمد خليل",
              title: "Associate Professor of AI & Software Systems",
              email: "a.khalil@zuj.edu.jo",
              officeNumber: "Faculty of IT - Room 302",
              phone: "+962 6 429 1511 ext. 302",
              isActive: true,
              isDeactivated: false,
            }
          ];
        } else if (course.code.startsWith("PHYS")) {
          doctors = [
            {
              id: 102,
              name: "Dr. Omar Hassan",
              nameAr: "د. عمر حسن",
              title: "Associate Professor of Applied Physics",
              email: "o.hassan@zuj.edu.jo",
              officeNumber: "Faculty of Science - Room 108",
              phone: "+962 6 429 1511 ext. 108",
              isActive: true,
              isDeactivated: false,
            }
          ];
        } else if (course.code.startsWith("ENG")) {
          doctors = [
            {
              id: 103,
              name: "Dr. Sara Mahmoud",
              nameAr: "د. سارة محمود",
              title: "Lecturer of Professional & Technical English",
              email: "s.mahmoud@zuj.edu.jo",
              officeNumber: "Faculty of Arts & Humanities - Room 204",
              phone: "+962 6 429 1511 ext. 204",
              isActive: true,
              isDeactivated: false,
            }
          ];
        } else {
          doctors = [
            {
              id: 104,
              name: "Dr. Ahmad Khalil",
              nameAr: "د. أحمد خليل",
              title: "Faculty Instructor",
              email: "a.khalil@zuj.edu.jo",
              officeNumber: "Faculty of IT - Room 302",
              phone: "+962 6 429 1511 ext. 302",
              isActive: true,
              isDeactivated: false,
            }
          ];
        }
      }

      // 4. Fetch Course Materials from DB
      const dbMaterials = await db
        .select()
        .from(courseMaterials)
        .where(eq(courseMaterials.courseId, input.courseId))
        .orderBy(courseMaterials.chapterNumber, courseMaterials.id);

      // Group into chapters
      const chapterMap = new Map<number, {
        chapterNumber: number;
        title: string;
        titleAr: string;
        description: string;
        items: Array<any>;
      }>();

      for (const m of dbMaterials) {
        if (!chapterMap.has(m.chapterNumber)) {
          chapterMap.set(m.chapterNumber, {
            chapterNumber: m.chapterNumber,
            title: m.chapterTitle || `Chapter ${m.chapterNumber}`,
            titleAr: m.chapterTitleAr || `الفصل ${m.chapterNumber}`,
            description: `Core materials, exercises, slides, and tasks for Chapter ${m.chapterNumber}.`,
            items: [],
          });
        }
        chapterMap.get(m.chapterNumber)!.items.push({
          id: m.id,
          type: m.type,
          title: m.title,
          titleAr: m.titleAr || m.title,
          description: m.description,
          fileName: m.fileName || `${course.code}_Ch${m.chapterNumber}_${m.type}.pdf`,
          fileSize: m.fileSize || "2.4 MB",
          fileUrl: m.fileUrl || "#",
          dueDate: m.dueDate ? String(m.dueDate) : null,
          totalPoints: m.totalPoints || (m.type === "assignment" ? 15 : m.type === "quiz" ? 10 : m.type === "exam" ? 30 : 0),
          doctorName: m.doctorName || doctors[0]?.name || "Instructor",
          createdAt: m.createdAt,
        });
      }

      // If no chapters exist yet in database, provide standard chapters
      if (chapterMap.size === 0) {
        const defaultChapters = [
          {
            chapterNumber: 1,
            title: "Chapter 1: Foundations & Core Principles",
            titleAr: "الفصل 1: المبادئ التأسيسية والمفاهيم النظرية",
            description: "Essential introductory lectures, slides, and reading materials.",
            items: [
              {
                id: 1001,
                type: "slides",
                title: `Ch1 Slides: ${course.name} Foundations`,
                titleAr: `شرائح الفصل الأول: مقدمة في ${course.nameAr || course.name}`,
                fileName: `${course.code}_Ch1_Slides.pdf`,
                fileSize: "2.8 MB",
                doctorName: doctors[0]?.name,
              },
              {
                id: 1002,
                type: "notes",
                title: "Reading Notes: Theory & Core Formulas",
                titleAr: "ملاحظات قراءة: النظريات والقوانين الأساسية",
                fileName: `${course.code}_Ch1_Notes.pdf`,
                fileSize: "1.4 MB",
                doctorName: doctors[0]?.name,
              },
              {
                id: 1003,
                type: "activity",
                title: "Activity 1: Problem Drill & Solution Guide",
                titleAr: "نشاط 1: دليل حل التمارين التطبيقية",
                fileName: `${course.code}_Activity1.pdf`,
                fileSize: "950 KB",
                doctorName: doctors[0]?.name,
              },
              {
                id: 1004,
                type: "quiz",
                title: "Quiz 1: Concept Verification",
                titleAr: "اختبار قصير 1: التحقق من المفاهيم التأسيسية",
                dueDate: "2026-11-15 23:59:00",
                totalPoints: 10,
                doctorName: doctors[0]?.name,
              }
            ]
          },
          {
            chapterNumber: 2,
            title: "Chapter 2: Intermediate Implementations & Applied Algorithms",
            titleAr: "الفصل 2: التطبيقات العملية والخوارزميات المتقدمة",
            description: "Practical implementations, programming assignments, and lab tasks.",
            items: [
              {
                id: 2001,
                type: "slides",
                title: `Ch2 Slides: Methods & Structures`,
                titleAr: `شرائح الفصل الثاني: الهياكل والأساليب البرمجية`,
                fileName: `${course.code}_Ch2_Slides.pdf`,
                fileSize: "3.2 MB",
                doctorName: doctors[0]?.name,
              },
              {
                id: 2002,
                type: "assignment",
                title: "Assignment 1: Hands-on Lab Implementation",
                titleAr: "الواجب 1: التطبيق المخبري العملي",
                dueDate: "2026-11-11 23:59:00",
                totalPoints: 15,
                doctorName: doctors[0]?.name,
              }
            ]
          },
          {
            chapterNumber: 3,
            title: "Chapter 3: Advanced Optimization & Midterm Evaluation",
            titleAr: "الفصل 3: تقنيات التحسين والتقييم النصفي",
            description: "Complex case studies, quizzes, and midterm examination.",
            items: [
              {
                id: 3001,
                type: "slides",
                title: `Ch3 Slides: Advanced Algorithms & Cases`,
                titleAr: `شرائح الفصل الثالث: الحالات التطبيقية المتقدمة`,
                fileName: `${course.code}_Ch3_Slides.pdf`,
                fileSize: "4.0 MB",
                doctorName: doctors[0]?.name,
              },
              {
                id: 3002,
                type: "exam",
                title: "Midterm Exam (الامتحان النصفي)",
                titleAr: "الامتحان النصفي للمساق",
                dueDate: "2026-11-20 10:00:00",
                totalPoints: 30,
                doctorName: doctors[0]?.name,
              }
            ]
          }
        ];
        for (const ch of defaultChapters) {
          chapterMap.set(ch.chapterNumber, ch);
        }
      }

      // 5. Fetch Attendance for this Course
      const attRecords = await db
        .select()
        .from(attendance)
        .where(and(eq(attendance.studentId, targetStudentId), eq(attendance.courseId, input.courseId)))
        .orderBy(desc(attendance.date));

      const totalAtt = attRecords.length;
      const presentAtt = attRecords.filter(a => a.status === "present" || a.status === "excused").length;
      const absentAtt = attRecords.filter(a => a.status === "absent").length;
      const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95;

      // 6. Fetch Schedule for this Course
      const courseSched = await db
        .select({
          dayOfWeek: courseSchedules.dayOfWeek,
          startTime: courseSchedules.startTime,
          endTime: courseSchedules.endTime,
          roomNumber: rooms.roomNumber,
          roomName: rooms.name,
          buildingName: buildings.name,
          buildingNameAr: buildings.nameAr,
        })
        .from(courseSchedules)
        .leftJoin(rooms, eq(courseSchedules.roomId, rooms.id))
        .leftJoin(buildings, eq(rooms.buildingId, buildings.id))
        .where(eq(courseSchedules.courseId, input.courseId));

      return {
        course: {
          id: course.id,
          code: course.code,
          name: course.name,
          nameAr: course.nameAr || course.name,
          credits: course.credits,
          description: course.description || "Course syllabus covering theoretical frameworks, hands-on implementations, and academic evaluations.",
          modality: (course as any).modality || "in_person",
          textbookTitle: course.code === "CS201" ? "Introduction to Algorithms & Data Structures" : course.code === "CS202" ? "Object-Oriented Design in Java & C++" : "University Course Academic Textbook",
          textbookCover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
          syllabusUrl: `/syllabi/${course.code}_Syllabus_2026.pdf`,
        },
        enrollment: {
          status: enrollment?.status || (isCompleted ? "completed" : "in_progress"),
          isCompleted,
          isLocked,
          grade,
          completedSemester: isCompleted ? "Fall 2025/2026" : null,
        },
        doctors,
        chapters: Array.from(chapterMap.values()).sort((a, b) => a.chapterNumber - b.chapterNumber),
        attendance: {
          rate: attRate,
          total: totalAtt || 14,
          present: presentAtt || 13,
          absent: absentAtt || 1,
          maxAbsences: 4, // ZUJ Article 14 limit (15%)
          isDeprivationRisk: (absentAtt || 1) >= 3,
        },
        schedule: courseSched.length > 0 ? courseSched : [
          {
            dayOfWeek: course.code === "ENG102" ? 1 : course.code === "CS201" ? 3 : 4,
            startTime: course.code === "CS202" ? "08:30:00" : "11:30:00",
            endTime: course.code === "CS202" ? "09:45:00" : "12:20:00",
            roomNumber: course.code === "ENG102" ? "Hall 39" : course.code === "CS201" ? "Hall 41" : "Hall 42",
            buildingName: "Faculty of IT",
            buildingNameAr: "كلية تكنولوجيا المعلومات",
          }
        ],
        announcements: [
          {
            id: 1,
            title: "Welcome to Semester 2026/2027",
            titleAr: "أهلاً بكم في الفصل الدراسي 2026/2027",
            content: "Please review Chapter 1 slides and syllabus. Attendance is tracked via classroom dynamic QR codes.",
            contentAr: "يرجى مراجعة شرائح الفصل الأول والخطة الدراسية. يتم تسجيل الحضور برمز QR الديناميكي داخل القاعة.",
            date: "Nov 3, 2026",
            author: doctors[0]?.name || "Course Instructor",
          }
        ],
      };
    }),

  /**
   * addMaterial:
   * Allows doctors to add Slides, Notes, Material, Assignments, Quizzes, or Exams under any chapter.
   * Enforces locking rule: completed semester courses cannot be modified.
   */
  addMaterial: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        chapterNumber: z.number().default(1),
        chapterTitle: z.string().default("Chapter 1"),
        chapterTitleAr: z.string().optional(),
        type: z.enum(["slides", "notes", "material", "activity", "assignment", "quiz", "exam"]),
        title: z.string().min(1),
        titleAr: z.string().optional(),
        description: z.string().optional(),
        fileName: z.string().optional(),
        fileUrl: z.string().optional(),
        fileSize: z.string().optional(),
        dueDate: z.string().optional(),
        totalPoints: z.number().optional().default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify course exists
      const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId)).limit(1);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });

      // 1. Role Guard: ONLY doctors/instructors and admins can add or edit course materials, assignments, or exams
      if (!ctx.user || (ctx.user.role !== "advisor" && ctx.user.role !== "admin")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Students cannot add or edit course materials, assignments, or exams. Authoring is strictly restricted to course instructors.",
        });
      }

      // 2. Lock Guard: Check if course is a completed / locked offering
      const [completedRecord] = await db
        .select()
        .from(studentCourses)
        .where(and(eq(studentCourses.courseId, input.courseId), eq(studentCourses.status, "completed")))
        .limit(1);

      if (course.code === "CS101" || course.code === "MATH101" || input.courseId === 33 || input.courseId === 34 || completedRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This completed semester course is locked and preserved for academic record integrity. New materials cannot be added.",
        });
      }

      const doctorName = ctx.user?.name || "Dr. Ahmad Khalil";
      const doctorId = ctx.user?.id || 1;

      // 1. Insert into course_materials table
      const [res] = await db.insert(courseMaterials).values({
        courseId: input.courseId,
        chapterNumber: input.chapterNumber,
        chapterTitle: input.chapterTitle,
        chapterTitleAr: input.chapterTitleAr || input.chapterTitle,
        type: input.type,
        title: input.title,
        titleAr: input.titleAr || input.title,
        description: input.description || null,
        fileName: input.fileName || `${course.code}_Ch${input.chapterNumber}_${input.type}.pdf`,
        fileUrl: input.fileUrl || "#",
        fileSize: input.fileSize || "2.5 MB",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        totalPoints: input.totalPoints || 10,
        doctorId,
        doctorName,
      });

      // 2. If it is an assignment or quiz, also sync into assignments table
      if (input.type === "assignment" || input.type === "quiz") {
        await db.insert(assignments).values({
          courseId: input.courseId,
          advisorId: doctorId,
          title: input.title,
          titleAr: input.titleAr || input.title,
          description: input.description || `Course ${input.type} for ${input.chapterTitle}`,
          descriptionAr: input.description || `تكليف دراسي ${input.chapterTitle}`,
          dueDate: input.dueDate ? new Date(input.dueDate) : new Date(Date.now() + 7 * 86400000),
          totalPoints: input.totalPoints || 15,
          submissionType: "all",
        });
      }

      return {
        success: true,
        materialId: (res as any)?.insertId || Date.now(),
        message: `${input.type.toUpperCase()} added successfully to ${input.chapterTitle}`,
      };
    }),


  /**
   * getMajorDegreeRoadmap:
   * Comprehensive Academic Degree Roadmap categorized by requirement families
   * (University Compulsory, University Elective, Faculty Compulsory, Major Compulsory,
   * Major Electives, Supporting Compulsory).
   * Color-coded status for each course (completed, in-progress, not-enrolled),
   * and family completion indicators (Finished vs In-Progress).
   */
  getMajorDegreeRoadmap: publicProcedure
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const targetStudentId = input?.studentId || ctx.user?.id || 240002;

      // 0. Fetch student profile to determine major and department
      const [studentUser] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          departmentId: users.departmentId,
        })
        .from(users)
        .where(eq(users.id, targetStudentId))
        .limit(1);

      const isAiMajor = studentUser?.departmentId === 3 || targetStudentId === 210029 || targetStudentId === 210034;

      // 1. Fetch student courses from DB
      const enrollments = await db
        .select({
          courseId: studentCourses.courseId,
          status: studentCourses.status,
          grade: studentCourses.grade,
          code: courses.code,
          name: courses.name,
          nameAr: courses.nameAr,
          credits: courses.credits,
        })
        .from(studentCourses)
        .leftJoin(courses, eq(studentCourses.courseId, courses.id))
        .where(eq(studentCourses.studentId, targetStudentId));

      // 2. Read authoritative ZUJ Curriculum Catalog (125 courses)
      const catalogPath = path.resolve(process.cwd(), "shared", "data", "zuj_courses.json");
      let rawCatalog: any[] = [];
      try {
        rawCatalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
      } catch (e) {
        console.error("Failed to read zuj_courses.json:", e);
      }

      // 3. Create comprehensive code-mapping lookup
      const enrollmentMap = new Map<string, any>();
      for (const e of enrollments) {
        if (e.code) {
          enrollmentMap.set(e.code.toUpperCase(), e);
          const clean = e.code.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
          enrollmentMap.set(clean, e);
        }
        // Common ZUJ Curriculum code equivalences
        if (e.code === "CS101") { enrollmentMap.set("130100", e); enrollmentMap.set("0130100", e); }
        if (e.code === "MATH101") { enrollmentMap.set("101112", e); enrollmentMap.set("0101112", e); }
        if (e.code === "ENG101") { enrollmentMap.set("420123", e); enrollmentMap.set("0420123", e); }
        if (e.code === "PHYS101") { enrollmentMap.set("101274", e); enrollmentMap.set("0101274", e); }
        if (e.code === "CS201") { enrollmentMap.set("0130221", e); enrollmentMap.set("131215", e); enrollmentMap.set("135211", e); }
        if (e.code === "CS202") { enrollmentMap.set("0130232", e); enrollmentMap.set("130231", e); enrollmentMap.set("131232", e); }
        if (e.code === "PHYS102") { enrollmentMap.set("0130111", e); enrollmentMap.set("131112", e); }
        if (e.code === "ENG102") { enrollmentMap.set("135101", e); enrollmentMap.set("0135101", e); }
        // AI Curriculum equivalences
        if (e.code === "CS101") { enrollmentMap.set("130100", e); enrollmentMap.set("0130100", e); enrollmentMap.set("135102", e); }
        if (e.code === "CS202") { enrollmentMap.set("0130232", e); enrollmentMap.set("130231", e); enrollmentMap.set("131232", e); enrollmentMap.set("135232", e); }
        if (e.code === "CS304") { enrollmentMap.set("135203", e); enrollmentMap.set("0135203", e); }
        if (e.code === "CS305") { enrollmentMap.set("135240", e); enrollmentMap.set("0135240", e); }
        if (e.code === "135341") { enrollmentMap.set("135341", e); enrollmentMap.set("0135341", e); }
        if (e.code === "CS203") { enrollmentMap.set("135312", e); enrollmentMap.set("0130323", e); }
        if (e.code === "CS204") { enrollmentMap.set("135220", e); enrollmentMap.set("0130322", e); enrollmentMap.set("0130204", e); enrollmentMap.set("131203", e); }
        if (e.code === "CS205") { enrollmentMap.set("131213", e); enrollmentMap.set("0131213", e); }
        if (e.code === "STAT201") { enrollmentMap.set("135214", e); enrollmentMap.set("0135214", e); }
        if (e.code === "MATH201") { enrollmentMap.set("130104", e); enrollmentMap.set("0130104", e); }
        if (e.code === "MATH202") { enrollmentMap.set("101211", e); enrollmentMap.set("0101211", e); }
        if (e.code === "CS102") { enrollmentMap.set("130231", e); enrollmentMap.set("0130231", e); }
        if (e.code === "CS301") { enrollmentMap.set("0130324", e); enrollmentMap.set("130324", e); enrollmentMap.set("131214", e); }
        if (e.code === "CS302") { enrollmentMap.set("0132211", e); enrollmentMap.set("132211", e); }
        if (e.code === "CS303") { enrollmentMap.set("130213", e); enrollmentMap.set("0130213", e); enrollmentMap.set("131333", e); }
        if (e.code === "NET301") { enrollmentMap.set("130214", e); enrollmentMap.set("0130214", e); enrollmentMap.set("131111", e); }
      }

      // Ensure standard completed general university courses
      if (!enrollmentMap.has("420101")) {
        enrollmentMap.set("420101", { status: "completed", grade: "A", code: "420101", name: "Military Sciences", credits: 3 });
      }
      if (!enrollmentMap.has("420151")) {
        enrollmentMap.set("420151", { status: "completed", grade: "A-", code: "420151", name: "National Education", credits: 3 });
      }
      if (isAiMajor) {
        if (!enrollmentMap.has("420123")) {
          enrollmentMap.set("420123", { status: "completed", grade: "A-", code: "420123", name: "English Communication I", credits: 3 });
        }
        if (!enrollmentMap.has("420111")) {
          enrollmentMap.set("420111", { status: "completed", grade: "A", code: "420111", name: "Arabic Language I", credits: 3 });
        }
      }

      // 4. Requirement Families Definition matching ZUJ Curriculum
      const familiesConfig = [
        {
          id: "uni_compulsory",
          titleEn: "University Compulsory Requirements",
          titleAr: "متطلبات الجامعة الإجبارية",
          requiredCredits: 18,
          mainCategory: "متطلبات الجامعة",
          subCategory: "متطلبات جامعة اجبارية",
          accentColor: "from-blue-500 to-indigo-600",
        },
        {
          id: "uni_elective",
          titleEn: "University Elective Requirements",
          titleAr: "متطلبات الجامعة الاختيارية",
          requiredCredits: 6,
          mainCategory: "متطلبات الجامعة",
          subCategory: "متطلبات جامعة اختيارية",
          accentColor: "from-sky-500 to-teal-500",
        },
        {
          id: "faculty_compulsory",
          titleEn: "Faculty of IT Compulsory Requirements",
          titleAr: "متطلبات الكلية الإجبارية",
          requiredCredits: 21,
          mainCategory: "متطلبات الكلية",
          accentColor: "from-emerald-500 to-green-600",
        },
        {
          id: "major_compulsory",
          titleEn: "Major Compulsory Requirements",
          titleAr: "متطلبات التخصص الإجبارية",
          requiredCredits: 66,
          mainCategory: "متطلبات التخصص",
          subCategory: "متطلبات التخصص الاجبارية",
          accentColor: "from-violet-500 to-purple-600",
        },
        {
          id: "major_elective",
          titleEn: "Major Elective Requirements",
          titleAr: "متطلبات التخصص الاختيارية",
          requiredCredits: 9,
          mainCategory: "متطلبات التخصص",
          subCategory: "متطلبات التخصص الاختيارية",
          accentColor: "from-amber-500 to-orange-600",
        },
        {
          id: "supporting_compulsory",
          titleEn: "Supporting Compulsory Requirements",
          titleAr: "متطلبات التخصص المساندة",
          requiredCredits: 12,
          mainCategory: "متطلبات التخصص المساندة",
          accentColor: "from-rose-500 to-pink-600",
        },
      ];

      let grandTotalCompleted = 0;
      let grandTotalInProgress = 0;
      const totalDegreeCredits = 132;

      const families = familiesConfig.map(fam => {
        const matched = rawCatalog.filter(c => {
          if (fam.id === "major_compulsory") {
            const isFamCat = c.mainCategory === "متطلبات عائلة التخصص";
            const isMajorComp = c.mainCategory === "متطلبات التخصص" && c.subCategory === "متطلبات التخصص الاجبارية";
            if (!isFamCat && !isMajorComp) return false;
            if (isAiMajor) {
              return isFamCat || (c.cleanCode && c.cleanCode.startsWith("135"));
            } else {
              return isFamCat || (!c.cleanCode || !c.cleanCode.startsWith("135"));
            }
          }
          if (fam.id === "major_elective") {
            if (c.mainCategory !== "متطلبات التخصص" || c.subCategory !== "متطلبات التخصص الاختيارية") return false;
            if (isAiMajor) {
              return c.cleanCode && c.cleanCode.startsWith("135");
            } else {
              return !c.cleanCode || !c.cleanCode.startsWith("135");
            }
          }
          if (fam.subCategory) {
            return c.subCategory === fam.subCategory || (fam.mainCategory && c.mainCategory === fam.mainCategory && !c.subCategory);
          }
          return c.mainCategory === fam.mainCategory;
        });

        let famCompleted = 0;
        let famInProgress = 0;

        const coursesList = matched.map(c => {
          const codeUpper = (c.code || "").toUpperCase();
          const cleanUpper = (c.cleanCode || "").toUpperCase();
          const enroll = enrollmentMap.get(codeUpper) || enrollmentMap.get(cleanUpper);

          const status = enroll ? (enroll.status === "completed" ? "completed" : "in_progress") : "not_enrolled";
          const grade = enroll?.status === "completed" ? (enroll.grade || "A") : null;

          if (status === "completed") famCompleted += (c.credits || 3);
          if (status === "in_progress") famInProgress += (c.credits || 3);

          return {
            code: c.code,
            cleanCode: c.cleanCode,
            nameEn: c.nameEn,
            nameAr: c.nameAr,
            credits: c.credits || 3,
            modality: c.modalityEn || "in_person",
            modalityAr: c.modality || "وجاهي",
            year: c.year,
            semester: c.semester,
            prerequisite: c.prerequisite || null,
            status, // "completed" | "in_progress" | "not_enrolled"
            grade,
            colorBadge: status === "completed"
              ? "emerald"
              : status === "in_progress"
              ? "cyan"
              : "slate",
          };
        });

        grandTotalCompleted += famCompleted;
        grandTotalInProgress += famInProgress;

        const isFinished = famCompleted >= fam.requiredCredits;
        const progressPct = Math.min(100, Math.round((famCompleted / fam.requiredCredits) * 100));

        return {
          id: fam.id,
          titleEn: fam.titleEn,
          titleAr: fam.titleAr,
          requiredCredits: fam.requiredCredits,
          completedCredits: famCompleted,
          inProgressCredits: famInProgress,
          remainingCredits: Math.max(0, fam.requiredCredits - famCompleted),
          progressPct,
          isFinished,
          statusLabelEn: isFinished ? "Finished ✓" : famInProgress > 0 ? "In Progress ⏳" : "Not Started",
          statusLabelAr: isFinished ? "مكتمل ✓" : famInProgress > 0 ? "قيد الإنجاز ⏳" : "لم يبدأ بعد",
          accentColor: fam.accentColor,
          coursesCount: coursesList.length,
          courses: coursesList,
        };
      });

      const overallProgressPct = Math.min(100, Math.round((grandTotalCompleted / totalDegreeCredits) * 100));

      return {
        summary: {
          totalDegreeCredits,
          completedCredits: grandTotalCompleted,
          inProgressCredits: grandTotalInProgress,
          remainingCredits: Math.max(0, totalDegreeCredits - grandTotalCompleted - grandTotalInProgress),
          overallProgressPct,
          studentName: studentUser?.name || (isAiMajor ? "Basma Hassan" : "Hanan Saleh"),
          universityId: String(targetStudentId),
          majorNameEn: isAiMajor
            ? "Artificial Intelligence & Data Science (ZUJ Curriculum)"
            : "Computer Science & Software Systems (ZUJ Curriculum)",
          majorNameAr: isAiMajor
            ? "الذكاء الاصطناعي وعلم البيانات (خطة جامعة الزيتونة)"
            : "علم الحاسوب وهندسة البرمجيات (خطة جامعة الزيتونة)",
        },
        families,
      };
    }),

});
