import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  announcements,
  courses,
  departments,
  documents,
  faqs,
  users,
} from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  dashboard: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select().from(users);
    const departmentRows = await db.select().from(departments);
    const courseRows = await db.select().from(courses);
    const faqRows = await db.select().from(faqs);
    const documentRows = await db.select().from(documents);
    const announcementRows = await db.select().from(announcements);

    return {
      stats: {
        totalUsers: userRows.length,
        totalStudents: userRows.filter(user => user.role === "student").length,
        totalAdvisors: userRows.filter(user => user.role === "advisor").length,
        totalAdmins: userRows.filter(user => user.role === "admin").length,
        totalDepartments: departmentRows.length,
        totalCourses: courseRows.length,
        totalFAQs: faqRows.length,
        totalDocuments: documentRows.length,
        totalAnnouncements: announcementRows.length,
      },
      users: userRows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      })),
      departments: departmentRows,
      courses: courseRows,
      faqs: faqRows,
      documents: documentRows,
      announcements: announcementRows,
    };
  }),
});
