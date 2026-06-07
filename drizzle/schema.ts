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
    departmentId: int("departmentId"),
    profilePicture: varchar("profilePicture", { length: 500 }),
    bio: text("bio"),
    phone: varchar("phone", { length: 20 }),
    language: mysqlEnum("language", ["en", "ar"]).default("en").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table: any) => ({
    emailIdx: index("idx_users_email").on(table.email),
    roleIdx: index("idx_users_role").on(table.role),
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
    credits: int("credits").notNull(),
    departmentId: int("departmentId").notNull(),
    minGPA: decimal("minGPA", { precision: 3, scale: 2 }).default("0.00"),
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

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
    studyPlans: many(studyPlans),
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
    prerequisites: many(coursePrerequisites),
    studentCourses: many(studentCourses),
  })
);

export const studyPlansRelations = relations(
  studyPlans,
  ({ many, one }: { many: any; one: any }) => ({
    student: one(users, {
      fields: [studyPlans.studentId],
      references: [users.id],
    }),
    advisor: one(users, {
      fields: [studyPlans.advisorId],
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
