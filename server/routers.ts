import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { coursesRouter } from "./routers/courses";
import { notificationsRouter } from "./routers/notifications";
import { aiChatRouter } from "./routers/aiChat";
import { faqsRouter } from "./routers/faqs";
import { documentsRouter } from "./routers/documents";
import { preferencesRouter } from "./routers/preferences";
import { passwordResetRouter } from "./routers/passwordReset";
import { studentRouter } from "./routers/student";
import { announcementsRouter } from "./routers/announcements";
import { navigationRouter } from "./routers/navigation";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  system: systemRouter,

  auth: authRouter,

  courses: coursesRouter,

  notifications: notificationsRouter,

  aiChat: aiChatRouter,

  faqs: faqsRouter,

  documents: documentsRouter,

  preferences: preferencesRouter,

  passwordReset: passwordResetRouter,

  student: studentRouter,

  announcements: announcementsRouter,

  navigation: navigationRouter,

  admin: adminRouter,

  // Legacy logout endpoint for backward compatibility
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});

export type AppRouter = typeof appRouter;
