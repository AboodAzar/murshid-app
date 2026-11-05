import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  longtext,
  index,
  serial,
  bigint,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Supports three roles: student, advisor, admin
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    name: text("name"),
    password: varchar("password", { length: 255 }),
    role: mysqlEnum("role", ["student", "advisor", "admin"])
      .default("student")
      .notNull(),
    advisorId: int("advisorId"), // for students: assigned advisor
    departmentId: int("departmentId"),
    profilePicture: varchar("profilePicture", { length: 500 }),
    bio: text("bio"),
    phone: varchar("phone", { length: 20 }),
    language: mysqlEnum("language", ["en", "ar"]).default("en").notNull(),
    isEmailVerified: boolean("isEmailVerified").default(false).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table: any) => ({
    emailIdx: index("idx_users_email").on(table.email),
    roleIdx: index("idx_users_role").on(table.role),
    advisorIdIdx: index("idx_users_advisorId").on(table.advisorId),
    departmentIdIdx: index("idx_users_departmentId").on(table.departmentId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Departments table
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
    submissionType: varchar("submissionType", { length: 50 }).default("all"),
    options: text("options"),
  headId: int("headId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Courses table
 */
export const courses = mysqlTable(
  "courses",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    nameAr: varchar("nameAr", { length: 255 }).notNull(),
    description: text("description"),
    descriptionAr: text("descriptionAr"),
    submissionType: varchar("submissionType", { length: 50 }).default("all"),
    options: text("options"),
    credits: int("credits").notNull(),
    departmentId: int("departmentId").notNull(),
    minGPA: decimal("minGPA", { precision: 3, scale: 2 }).default("0.00"),
    instructorId: int("instructorId"), // lecturer / instructor user id
    semester: int("semester").notNull(), // 1-8
    isRequired: boolean("isRequired").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    departmentIdIdx: index("idx_courses_departmentId").on(table.departmentId),
    semesterIdx: index("idx_courses_semester").on(table.semester),
  })
);

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Course prerequisites
 */
export const coursePrerequisites = mysqlTable("coursePrerequisites", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
    advisorId: int("advisorId"),
  prerequisiteId: int("prerequisiteId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoursePrerequisite = typeof coursePrerequisites.$inferSelect;
export type InsertCoursePrerequisite = typeof coursePrerequisites.$inferInsert;

/**
 * Study plans for students
 */
export const studyPlans = mysqlTable("studyPlans", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  advisorId: int("advisorId"),
  totalCredits: int("totalCredits").notNull(),
  completedCredits: int("completedCredits").default(0).notNull(),
  currentGPA: decimal("currentGPA", { precision: 3, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["active", "completed", "on_hold"])
    .default("active")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyPlan = typeof studyPlans.$inferSelect;
export type InsertStudyPlan = typeof studyPlans.$inferInsert;

/**
 * Student courses (enrollment)
 */
export const studentCourses = mysqlTable(
  "studentCourses",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    courseId: int("courseId").notNull(),
    semester: int("semester").notNull(),
    grade: varchar("grade", { length: 2 }),
    gradePoints: decimal("gradePoints", { precision: 3, scale: 2 }),
    status: mysqlEnum("status", ["completed", "in_progress", "planned"])
      .default("planned")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    studentIdIdx: index("idx_studentCourses_studentId").on(table.studentId),
    statusIdx: index("idx_studentCourses_status").on(table.status),
  })
);

export type StudentCourse = typeof studentCourses.$inferSelect;
export type InsertStudentCourse = typeof studentCourses.$inferInsert;

/**
 * AI Conversations for chatbot
 */
export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  title: varchar("title", { length: 255 }),
  context: text("context"), // RAG context used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;

/**
 * Chat messages
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: longtext("content").notNull(),
  tokens: int("tokens").default(0),
  feedback: mysqlEnum("feedback", ["up", "down", "none"]).default("none"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export const chatMessagesRelations = relations(
  chatMessages,
  ({ one }: { one: any }) => ({
    conversation: one(aiConversations, {
      fields: [chatMessages.conversationId],
      references: [aiConversations.id],
    }),
  })
);

/**
 * FAQs managed by advisors
 */
export const faqs = mysqlTable(
  "faqs",
  {
    id: int("id").autoincrement().primaryKey(),
    question: text("question").notNull(),
    questionAr: text("questionAr").notNull(),
    answer: longtext("answer").notNull(),
    answerAr: longtext("answerAr").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    categoryAr: varchar("categoryAr", { length: 100 }).notNull(),
    createdBy: int("createdBy").notNull(), // advisor ID
    views: int("views").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    isActiveIdx: index("idx_faqs_isActive").on(table.isActive),
  })
);

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;

/**
 * Documents uploaded by advisors for RAG
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  uploadedBy: int("uploadedBy").notNull(), // advisor ID
  content: longtext("content"), // extracted text for RAG
  category: varchar("category", { length: 100 }).notNull(),
  isProcessed: boolean("isProcessed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    titleAr: varchar("titleAr", { length: 255 }).notNull(),
    message: text("message").notNull(),
    messageAr: text("messageAr").notNull(),
    type: mysqlEnum("type", ["info", "warning", "success", "error"])
      .default("info")
      .notNull(),
    relatedId: int("relatedId"), // course, conversation, etc.
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    userIdIdx: index("idx_notifications_userId").on(table.userId),
    isReadIdx: index("idx_notifications_isRead").on(table.isRead),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Buildings on campus
 */
export const buildings = mysqlTable("buildings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
    submissionType: varchar("submissionType", { length: 50 }).default("all"),
    options: text("options"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = typeof buildings.$inferInsert;

/**
 * Rooms/Classrooms
 */
export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  buildingId: int("buildingId").notNull(),
  roomNumber: varchar("roomNumber", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  capacity: int("capacity").notNull(),
  type: mysqlEnum("type", [
    "classroom",
    "lab",
    "lecture_hall",
    "office",
    "other",
  ])
    .default("classroom")
    .notNull(),
  floor: int("floor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

/**
 * Announcements
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  content: longtext("content").notNull(),
  contentAr: longtext("contentAr").notNull(),
  createdBy: int("createdBy").notNull(), // admin or advisor
  priority: mysqlEnum("priority", ["low", "medium", "high"])
    .default("medium")
    .notNull(),
  targetRole: mysqlEnum("targetRole", ["student", "advisor", "admin", "all"])
    .default("all")
    .notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * AI Usage Statistics
 */
export const aiStatistics = mysqlTable("aiStatistics", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId"),
  totalConversations: int("totalConversations").default(0).notNull(),
  totalMessages: int("totalMessages").default(0).notNull(),
  totalTokensUsed: int("totalTokensUsed").default(0).notNull(),
  averageResponseTime: int("averageResponseTime").default(0), // ms
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIStatistic = typeof aiStatistics.$inferSelect;
export type InsertAIStatistic = typeof aiStatistics.$inferInsert;

/**
 * Relations
 */
export const usersRelations = relations(
  users,
  ({ many, one }: { many: any; one: any }) => ({
    studyPlans: many(studyPlans, { relationName: "studentStudyPlans" }),
    advisedStudyPlans: many(studyPlans, { relationName: "advisorStudyPlans" }),
    aiConversations: many(aiConversations),
    notifications: many(notifications),
    studentCourses: many(studentCourses),
    department: one(departments, {
      fields: [users.departmentId],
      references: [departments.id],
    }),
  })
);

export const departmentsRelations = relations(
  departments,
  ({ many, one }: { many: any; one: any }) => ({
    courses: many(courses),
    head: one(users, {
      fields: [departments.headId],
      references: [users.id],
    }),
  })
);

export const coursesRelations = relations(
  courses,
  ({ many, one }: { many: any; one: any }) => ({
    department: one(departments, {
      fields: [courses.departmentId],
      references: [departments.id],
    }),
    prerequisites: many(coursePrerequisites, { relationName: "coursePrerequisites" }),
    studentCourses: many(studentCourses),
  })
);

export const coursePrerequisitesRelations = relations(
  coursePrerequisites,
  ({ one }: { one: any }) => ({
    course: one(courses, {
      fields: [coursePrerequisites.courseId],
      references: [courses.id],
      relationName: "coursePrerequisites",
    }),
    prerequisite: one(courses, {
      fields: [coursePrerequisites.prerequisiteId],
      references: [courses.id],
      relationName: "prerequisiteCourse",
    }),
  })
);

export const studyPlansRelations = relations(
  studyPlans,
  ({ many, one }: { many: any; one: any }) => ({
    student: one(users, {
      fields: [studyPlans.studentId],
      references: [users.id],
      relationName: "studentStudyPlans",
    }),
    advisor: one(users, {
      fields: [studyPlans.advisorId],
      references: [users.id],
      relationName: "advisorStudyPlans",
    }),
  })
);

export const studentCoursesRelations = relations(
  studentCourses,
  ({ one }: { one: any }) => ({
    student: one(users, {
      fields: [studentCourses.studentId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [studentCourses.courseId],
      references: [courses.id],
    }),
  })
);

export const notificationsRelations = relations(
  notifications,
  ({ one }: { one: any }) => ({
    user: one(users, {
      fields: [notifications.userId],
      references: [users.id],
    }),
  })
);

export const aiConversationsRelations = relations(
  aiConversations,
  ({ many, one }: { many: any; one: any }) => ({
    student: one(users, {
      fields: [aiConversations.studentId],
      references: [users.id],
    }),
    messages: many(chatMessages),
  })
);

export const buildingsRelations = relations(
  buildings,
  ({ many }: { many: any }) => ({
    rooms: many(rooms),
  })
);

export const roomsRelations = relations(rooms, ({ one }: { one: any }) => ({
  building: one(buildings, {
    fields: [rooms.buildingId],
    references: [buildings.id],
  }),
}));

// Password reset tokens table
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }: { one: any }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
);

// Email verification tokens table
export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 10 }).notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailVerificationTokensRelations = relations(
  emailVerificationTokens,
  ({ one }: { one: any }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.userId],
      references: [users.id],
    }),
  })
);

/**
 * Course schedules (lecture times)
 */
export const courseSchedules = mysqlTable(
  "courseSchedules",
  {
    id: int("id").autoincrement().primaryKey(),
    courseId: int("courseId").notNull(),
    dayOfWeek: int("dayOfWeek").notNull(), // 0=Sunday, 1=Monday, ... 6=Saturday
    startTime: varchar("startTime", { length: 8 }).notNull(), // HH:MM format
    endTime: varchar("endTime", { length: 8 }).notNull(), // HH:MM format
    roomId: int("roomId").notNull(),
    instructorId: int("instructorId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    courseIdIdx: index("idx_courseSchedules_courseId").on(table.courseId),
    dayOfWeekIdx: index("idx_courseSchedules_dayOfWeek").on(table.dayOfWeek),
  })
);

export type CourseSchedule = typeof courseSchedules.$inferSelect;
export type InsertCourseSchedule = typeof courseSchedules.$inferInsert;

/**
 * Attendance records
 */
export const attendance = mysqlTable(
  "attendance",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    courseId: int("courseId").notNull(),
    scheduleId: int("scheduleId").notNull(),
    date: timestamp("date").notNull(),
    status: mysqlEnum("status", ["present", "absent", "excused", "late"])
      .default("present")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    studentIdIdx: index("idx_attendance_studentId").on(table.studentId),
    courseIdIdx: index("idx_attendance_courseId").on(table.courseId),
    dateIdx: index("idx_attendance_date").on(table.date),
  })
);

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Assignments
 */
export const assignments = mysqlTable(
  "assignments",
  {
    id: int("id").autoincrement().primaryKey(),
    courseId: int("courseId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    titleAr: varchar("titleAr", { length: 255 }).notNull(),
    description: text("description"),
    descriptionAr: text("descriptionAr"),
    submissionType: varchar("submissionType", { length: 50 }).default("all"),
    options: text("options"),
    dueDate: timestamp("dueDate").notNull(),
    totalPoints: int("totalPoints").notNull().default(100),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    courseIdIdx: index("idx_assignments_courseId").on(table.courseId),
    dueDateIdx: index("idx_assignments_dueDate").on(table.dueDate),
  })
);

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

/**
 * Student assignments (submissions)
 */
export const studentAssignments = mysqlTable(
  "studentAssignments",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    assignmentId: int("assignmentId").notNull(),
    status: mysqlEnum("status", ["submitted", "graded", "overdue", "pending"])
      .default("pending")
      .notNull(),
    score: int("score"),
    solutionText: text("solutionText"),
    solutionImageUrl: longtext("solutionImageUrl"),
    selectedOption: varchar("selectedOption", { length: 255 }),
    feedback: text("feedback"),
    gradedBy: int("gradedBy"),
    gradedAt: timestamp("gradedAt"),
    submittedAt: timestamp("submittedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    studentIdIdx: index("idx_studentAssignments_studentId").on(table.studentId),
    assignmentIdIdx: index("idx_studentAssignments_assignmentId").on(table.assignmentId),
  })
);

export type StudentAssignment = typeof studentAssignments.$inferSelect;
export type InsertStudentAssignment = typeof studentAssignments.$inferInsert;

/**
 * Relations for new tables
 */
export const courseSchedulesRelations = relations(
  courseSchedules,
  ({ one }: { one: any }) => ({
    course: one(courses, {
      fields: [courseSchedules.courseId],
      references: [courses.id],
    }),
    room: one(rooms, {
      fields: [courseSchedules.roomId],
      references: [rooms.id],
    }),
  })
);

export const attendanceRelations = relations(
  attendance,
  ({ one }: { one: any }) => ({
    student: one(users, {
      fields: [attendance.studentId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [attendance.courseId],
      references: [courses.id],
    }),
    schedule: one(courseSchedules, {
      fields: [attendance.scheduleId],
      references: [courseSchedules.id],
    }),
  })
);

export const assignmentsRelations = relations(
  assignments,
  ({ one, many }: { one: any; many: any }) => ({
    course: one(courses, {
      fields: [assignments.courseId],
      references: [courses.id],
    }),
    studentAssignments: many(studentAssignments),
  })
);

export const studentAssignmentsRelations = relations(
  studentAssignments,
  ({ one }: { one: any }) => ({
    student: one(users, {
      fields: [studentAssignments.studentId],
      references: [users.id],
    }),
    assignment: one(assignments, {
      fields: [studentAssignments.assignmentId],
      references: [assignments.id],
    }),
  })
);

/**
 * Achievements / Badges
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  icon: varchar("icon", { length: 64 }).notNull(),
  color: varchar("color", { length: 50 }).default("#3b82f6").notNull(),
  conditionType: mysqlEnum("conditionType", [
    "courses_completed",
    "gpa_reached",
    "attendance_streak",
    "assignments_submitted",
    "credits_earned",
    "semester_completed",
  ]).notNull(),
  conditionValue: int("conditionValue").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Student achievements (unlocks)
 */
export const studentAchievements = mysqlTable(
  "studentAchievements",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    achievementId: int("achievementId").notNull(),
    unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
    progress: int("progress").default(0).notNull(), // current progress toward unlock
    metadata: text("metadata"), // JSON string for extra data
  },
  (table: any) => ({
    studentIdIdx: index("idx_studentAchievements_studentId").on(table.studentId),
    achievementIdIdx: index("idx_studentAchievements_achievementId").on(table.achievementId),
  })
);

export type StudentAchievement = typeof studentAchievements.$inferSelect;
export type InsertStudentAchievement = typeof studentAchievements.$inferInsert;

/**
 * Advisor notes about students
 */
export const advisorNotes = mysqlTable(
  "advisorNotes",
  {
    id: int("id").autoincrement().primaryKey(),
    advisorId: int("advisorId").notNull(),
    studentId: int("studentId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: mysqlEnum("category", [
      "general",
      "academic",
      "behavioral",
      "career",
      "attendance",
      "gpa",
    ]).default("general").notNull(),
    isPrivate: boolean("isPrivate").default(false).notNull(), // if true, only advisor sees it
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    advisorIdIdx: index("idx_advisorNotes_advisorId").on(table.advisorId),
    studentIdIdx: index("idx_advisorNotes_studentId").on(table.studentId),
    categoryIdx: index("idx_advisorNotes_category").on(table.category),
  })
);

export type AdvisorNote = typeof advisorNotes.$inferSelect;
export type InsertAdvisorNote = typeof advisorNotes.$inferInsert;

/**
 * Academic alerts / warnings created by advisors for students
 */
export const academicAlerts = mysqlTable(
  "academicAlerts",
  {
    id: int("id").autoincrement().primaryKey(),
    advisorId: int("advisorId").notNull(),
    studentId: int("studentId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    severity: mysqlEnum("severity", ["low", "medium", "high", "critical"])
      .default("medium")
      .notNull(),
    type: mysqlEnum("type", [
      "attendance",
      "gpa_drop",
      "missing_assignments",
      "at_risk",
      "probation",
      "custom",
    ]).default("custom").notNull(),
    isResolved: boolean("isResolved").default(false).notNull(),
    resolvedAt: timestamp("resolvedAt"),
    resolvedBy: int("resolvedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    advisorIdIdx: index("idx_academicAlerts_advisorId").on(table.advisorId),
    studentIdIdx: index("idx_academicAlerts_studentId").on(table.studentId),
    severityIdx: index("idx_academicAlerts_severity").on(table.severity),
    isResolvedIdx: index("idx_academicAlerts_isResolved").on(table.isResolved),
  })
);

export type AcademicAlert = typeof academicAlerts.$inferSelect;
export type InsertAcademicAlert = typeof academicAlerts.$inferInsert;

/**
 * Course / study recommendations from advisors to students
 */
export const recommendations = mysqlTable(
  "recommendations",
  {
    id: int("id").autoincrement().primaryKey(),
    advisorId: int("advisorId").notNull(),
    studentId: int("studentId").notNull(),
    courseId: int("courseId"), // optional: specific course recommendation
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high"])
      .default("medium")
      .notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "rejected", "completed"])
      .default("pending")
      .notNull(),
    dueDate: timestamp("dueDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    advisorIdIdx: index("idx_recommendations_advisorId").on(table.advisorId),
    studentIdIdx: index("idx_recommendations_studentId").on(table.studentId),
    statusIdx: index("idx_recommendations_status").on(table.status),
  })
);

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * Appointments between advisors and students
 */
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("id").autoincrement().primaryKey(),
    advisorId: int("advisorId").notNull(),
    studentId: int("studentId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    scheduledAt: timestamp("scheduledAt").notNull(),
    durationMinutes: int("durationMinutes").default(30).notNull(),
    location: varchar("location", { length: 255 }), // office, online, etc.
    meetingLink: varchar("meetingLink", { length: 500 }),
    status: mysqlEnum("status", ["scheduled", "confirmed", "completed", "cancelled", "no_show"])
      .default("scheduled")
      .notNull(),
    notes: text("notes"), // post-meeting notes
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    advisorIdIdx: index("idx_appointments_advisorId").on(table.advisorId),
    studentIdIdx: index("idx_appointments_studentId").on(table.studentId),
    scheduledAtIdx: index("idx_appointments_scheduledAt").on(table.scheduledAt),
    statusIdx: index("idx_appointments_status").on(table.status),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Advisor-generated academic reports
 */
export const advisorReports = mysqlTable(
  "advisorReports",
  {
    id: int("id").autoincrement().primaryKey(),
    advisorId: int("advisorId").notNull(),
    studentId: int("studentId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    gpaAtReport: decimal("gpaAtReport", { precision: 3, scale: 2 }),
    creditsAtReport: int("creditsAtReport"),
    attendanceRateAtReport: decimal("attendanceRateAtReport", { precision: 5, scale: 2 }),
    riskLevel: mysqlEnum("riskLevel", ["none", "low", "medium", "high"])
      .default("none")
      .notNull(),
    semester: int("semester"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    advisorIdIdx: index("idx_advisorReports_advisorId").on(table.advisorId),
    studentIdIdx: index("idx_advisorReports_studentId").on(table.studentId),
  })
);

export type AdvisorReport = typeof advisorReports.$inferSelect;
export type InsertAdvisorReport = typeof advisorReports.$inferInsert;
