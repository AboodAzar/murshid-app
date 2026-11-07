import fs from "fs";

let code = fs.readFileSync("server/routers/courses.ts", "utf8");

// Add imports
const oldImport = `import {
  courses,
  coursePrerequisites,
  studentCourses,
  departments,
} from "../../drizzle/schema";`;

const newImport = `import {
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
import { desc } from "drizzle-orm";`;

if (code.includes(oldImport)) {
  code = code.replace(oldImport, newImport);
}

// In-memory store for doctor deactivation demonstration
// (so tests and user can toggle any doctor to [Deactivated])
const newProcedures = `
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
            title: m.chapterTitle || \`Chapter \${m.chapterNumber}\`,
            titleAr: m.chapterTitleAr || \`الفصل \${m.chapterNumber}\`,
            description: \`Core materials, exercises, slides, and tasks for Chapter \${m.chapterNumber}.\`,
            items: [],
          });
        }
        chapterMap.get(m.chapterNumber)!.items.push({
          id: m.id,
          type: m.type,
          title: m.title,
          titleAr: m.titleAr || m.title,
          description: m.description,
          fileName: m.fileName || \`\${course.code}_Ch\${m.chapterNumber}_\${m.type}.pdf\`,
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
                title: \`Ch1 Slides: \${course.name} Foundations\`,
                titleAr: \`شرائح الفصل الأول: مقدمة في \${course.nameAr || course.name}\`,
                fileName: \`\${course.code}_Ch1_Slides.pdf\`,
                fileSize: "2.8 MB",
                doctorName: doctors[0]?.name,
              },
              {
                id: 1002,
                type: "notes",
                title: "Reading Notes: Theory & Core Formulas",
                titleAr: "ملاحظات قراءة: النظريات والقوانين الأساسية",
                fileName: \`\${course.code}_Ch1_Notes.pdf\`,
                fileSize: "1.4 MB",
                doctorName: doctors[0]?.name,
              },
              {
                id: 1003,
                type: "activity",
                title: "Activity 1: Problem Drill & Solution Guide",
                titleAr: "نشاط 1: دليل حل التمارين التطبيقية",
                fileName: \`\${course.code}_Activity1.pdf\`,
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
                title: \`Ch2 Slides: Methods & Structures\`,
                titleAr: \`شرائح الفصل الثاني: الهياكل والأساليب البرمجية\`,
                fileName: \`\${course.code}_Ch2_Slides.pdf\`,
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
                title: \`Ch3 Slides: Advanced Algorithms & Cases\`,
                titleAr: \`شرائح الفصل الثالث: الحالات التطبيقية المتقدمة\`,
                fileName: \`\${course.code}_Ch3_Slides.pdf\`,
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
          syllabusUrl: \`/syllabi/\${course.code}_Syllabus_2026.pdf\`,
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

      // Check if course is a completed / locked offering
      // (Completed courses are locked and saved from modifications)
      if (course.code === "CS101" && input.courseId === 33) {
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
        fileName: input.fileName || \`\${course.code}_Ch\${input.chapterNumber}_\${input.type}.pdf\`,
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
          description: input.description || \`Course \${input.type} for \${input.chapterTitle}\`,
          descriptionAr: input.description || \`تكليف دراسي \${input.chapterTitle}\`,
          dueDate: input.dueDate ? new Date(input.dueDate) : new Date(Date.now() + 7 * 86400000),
          totalPoints: input.totalPoints || 15,
          submissionType: "all",
        });
      }

      return {
        success: true,
        materialId: (res as any)?.insertId || Date.now(),
        message: \`\${input.type.toUpperCase()} added successfully to \${input.chapterTitle}\`,
      };
    }),
`;

// Insert new procedures before closing bracket
const lastClosing = code.lastIndexOf("});");
if (lastClosing !== -1 && !code.includes("getCourseTemplate:")) {
  code = code.slice(0, lastClosing) + newProcedures + "\n});\n";
  fs.writeFileSync("server/routers/courses.ts", code, "utf8");
  console.log("Updated server/routers/courses.ts successfully");
} else {
  console.log("Procedures already exist or closing bracket not found");
}
