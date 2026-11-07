import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { aiConversations, chatMessages, faqs, users, studyPlans, studentCourses, courses, coursePrerequisites, attendance, assignments, studentAssignments, academicAlerts } from "../../drizzle/schema";
import { eq, and, desc, inArray, sql, lt } from "drizzle-orm";
import { departments, documents } from "../../drizzle/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { generateLocalFallbackResponse, getAiServiceStatus } from "../utils/aiFallback";
import { buildOliverSystemPrompt } from "../utils/oliverSystemPrompt";
import { getCourseStudyStrategy, formatStudyStrategyToMarkdown } from "../utils/studyStrategyEngine";
import { buildFreeTimePlan, formatFreeTimePlanToMarkdown } from "../utils/freeTimePlanner";
import { searchDoctorCourseMaterialsRAG } from "../utils/courseMaterialKnowledgeRAG";

export const aiChatRouter = router({
  getStatus: publicProcedure.query(async () => {
    return await getAiServiceStatus();
  }),

  getCourseStudyStrategy: protectedProcedure
    .input(
      z.object({
        courseCode: z.string().optional(),
        courseName: z.string().optional(),
        query: z.string().optional(),
        language: z.enum(["ar", "en"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const strategy = await getCourseStudyStrategy({
        courseCode: input.courseCode,
        courseName: input.courseName,
        query: input.query,
        language: input.language,
      });
      const markdown = formatStudyStrategyToMarkdown(strategy);
      return {
        strategy,
        markdown,
      };
    }),

  generateFreeTimeStudyPlan: protectedProcedure
    .input(
      z.object({
        freeTimeStart: z.string().default("21:00"),
        freeTimeEnd: z.string().default("23:00"),
        workScheduleNote: z.string().optional(),
        selectedCourseCodes: z.array(z.string()).optional(),
        sessionStyle: z.enum(["pomodoro", "deep_work", "balanced"]).optional(),
        daysOfWeek: z.array(z.string()).optional(),
        language: z.enum(["ar", "en"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user || ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Fetch student courses & assignments (prioritizing current enrolled / in-progress & retakes)
      const enrollments = await db.select().from(studentCourses).where(eq(studentCourses.studentId, ctx.user.id));
      const activeEnrollments = enrollments.filter((e: any) => e.status === "in_progress" || e.status === "enrolled" || e.status === "failed" || e.grade === "F");
      const chosenEnrollments = activeEnrollments.length > 0 ? activeEnrollments : enrollments;
      const courseIds = chosenEnrollments.map((e: any) => e.courseId);
      const courseDetails = courseIds.length > 0 ? await db.select().from(courses).where(inArray(courses.id, courseIds)) : [];
      
      const studentAsgns = await db.select({
        title: assignments.title,
        status: studentAssignments.status,
        dueDate: assignments.dueDate,
        courseId: assignments.courseId,
      })
      .from(studentAssignments)
      .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
      .where(eq(studentAssignments.studentId, ctx.user.id));

      const assignmentsWithCode = studentAsgns.map(sa => {
        const c = courseDetails.find(cd => cd.id === sa.courseId);
        return {
          title: sa.title || "Assignment",
          courseCode: c?.code || "CS201",
          dueDate: sa.dueDate ? String(sa.dueDate) : undefined,
          status: sa.status || "pending",
        };
      });

      const plan = buildFreeTimePlan({
        input: {
          freeTimeStart: input.freeTimeStart,
          freeTimeEnd: input.freeTimeEnd,
          workScheduleNote: input.workScheduleNote,
          selectedCourseCodes: input.selectedCourseCodes,
          sessionStyle: input.sessionStyle,
          daysOfWeek: input.daysOfWeek,
          language: input.language,
        },
        studentContext: {
          name: ctx.user.name || undefined,
          courses: courseDetails.map(c => ({ code: c.code, name: c.name, credits: c.credits })),
          assignments: assignmentsWithCode,
        },
      });

      const markdown = formatFreeTimePlanToMarkdown(plan, input.language || "ar");

      return {
        success: true,
        plan,
        markdown,
      };
    }),

  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user || ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const result = await db.insert(aiConversations).values({
          studentId: ctx.user.id,
          title: input?.title || "New Conversation",
        });

        return { success: true, conversationId: result[0]?.insertId };
      } catch (error) {
        console.error("[AI Chat] Failed to create conversation:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    if (!ctx.user || ctx.user.role !== "student") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      return await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.studentId, ctx.user.id))
        .orderBy(aiConversations.updatedAt);
    } catch (error) {
      console.error("[AI Chat] Failed to get conversations:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  getMessages: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input: conversationId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user || ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Verify conversation belongs to user
        const conv = await db
          .select()
          .from(aiConversations)
          .where(
            and(
              eq(aiConversations.id, conversationId),
              eq(aiConversations.studentId, ctx.user.id)
            )
          );

        if (conv.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, conversationId))
          .orderBy(chatMessages.createdAt);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[AI Chat] Failed to get messages:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user || ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Verify conversation belongs to user
        const conv = await db
          .select()
          .from(aiConversations)
          .where(
            and(
              eq(aiConversations.id, input.conversationId),
              eq(aiConversations.studentId, ctx.user.id)
            )
          );

        if (conv.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Save user message
        await db.insert(chatMessages).values({
          conversationId: input.conversationId,
          role: "user" as const,
          content: input.message,
        });

        // Fetch chat history
        const history = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, input.conversationId))
          .orderBy(chatMessages.createdAt);
        
        const chat_history = history.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // Fetch student academic context for personalized AI responses
        const [student] = await db
          .select({ 
            id: users.id, 
            name: users.name, 
            email: users.email,
            major: departments.nameAr 
          })
          .from(users)
          .leftJoin(departments, eq(users.departmentId, departments.id))
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.studentId, ctx.user.id)).limit(1);
        const enrollments = await db.select().from(studentCourses).where(eq(studentCourses.studentId, ctx.user.id));
        const courseIds = enrollments.map((e: any) => e.courseId);
        const courseDetails = courseIds.length > 0 ? await db.select().from(courses).where(inArray(courses.id, courseIds)) : [];
        const attRows = await db.select({ status: attendance.status }).from(attendance).where(eq(attendance.studentId, ctx.user.id));
        const attTotal = attRows.length;
        const attPresent = attRows.filter((r: any) => r.status === "present" || r.status === "excused").length;
        const attRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;
        const pendingAssignments = await db.select({ id: studentAssignments.id, dueDate: assignments.dueDate, title: assignments.title })
          .from(studentAssignments)
          .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
          .where(and(eq(studentAssignments.studentId, ctx.user.id), eq(studentAssignments.status, "pending")));
        const activeAlerts = await db.select().from(academicAlerts)
          .where(and(eq(academicAlerts.studentId, ctx.user.id), eq(academicAlerts.isResolved, false)))
          .orderBy(desc(academicAlerts.createdAt))
          .limit(5);

        // Fetch Real-Time FAQs and Documents for the RAG AI
        const activeFaqs = await db.select({ q: faqs.questionAr, a: faqs.answerAr }).from(faqs).where(eq(faqs.isActive, true));
        const activeDocs = await db.select({ title: documents.title, category: documents.category }).from(documents);

        // Resolve Major with intelligent fallback
        let resolvedMajor = student?.major;
        if (!resolvedMajor || resolvedMajor === "غير محدد") {
          const hasCs = courseDetails.some((c: any) => c.code.startsWith("CS") || c.code.startsWith("SE") || c.code.startsWith("AI"));
          resolvedMajor = hasCs ? "علم الحاسوب وتكنولوجيا المعلومات (CS)" : "تكنولوجيا المعلومات (IT)";
        }

        // Calculate Academic Year & Semesters based on standard ZUJ thresholds
        const completedCr = plan?.completedCredits ?? 0;
        let academicYear = "السنة الأولى (Freshman)";
        if (completedCr >= 99) academicYear = "السنة الرابعة (Senior)";
        else if (completedCr >= 66) academicYear = "السنة الثالثة (Junior)";
        else if (completedCr >= 33) academicYear = "السنة الثانية (Sophomore)";

        const currentSemester = "الفصل الأول 2026/2027";
        const nextSemester = "الفصل الثاني 2026/2027";

        // Identify failed courses (F grades or failed status)
        const failedEnrollments = enrollments.filter((e: any) => e.grade === "F" || e.status === "failed");
        const failedCourses = failedEnrollments.map((e: any) => {
          const c = courseDetails.find((cd: any) => cd.id === e.courseId);
          return c ? `${c.code} - ${c.name} (${c.credits} ساعات معتمدة) [علامة راسبة F - أولوية إعادة لرفع المعدل]` : `مادة راسبة (${e.courseId})`;
        });

        // Compute recommended next courses from catalog
        const allCourses = await db.select().from(courses);
        const allPrereqs = await db.select().from(coursePrerequisites);

        const passedCourseIds = new Set(
          enrollments.filter((e: any) => e.status === "completed" && e.grade !== "F").map((e: any) => e.courseId)
        );
        const inProgressCourseIds = new Set(
          enrollments.filter((e: any) => e.status === "in_progress" || e.status === "enrolled").map((e: any) => e.courseId)
        );

        const recommendedNextCourses: string[] = [];
        // Add failed courses first
        for (const f of failedCourses) {
          recommendedNextCourses.push(f);
        }

        for (const c of allCourses) {
          if (passedCourseIds.has(c.id) || inProgressCourseIds.has(c.id)) continue;
          if (failedEnrollments.some((e: any) => e.courseId === c.id)) continue;

          const prereqs = allPrereqs.filter((p: any) => p.courseId === c.id);
          const prereqsSatisfied = prereqs.every((p: any) =>
            passedCourseIds.has(p.prerequisiteId) || inProgressCourseIds.has(p.prerequisiteId)
          );

          if (prereqsSatisfied) {
            recommendedNextCourses.push(`${c.code} - ${c.name} (${c.credits} ساعات معتمدة)`);
            if (recommendedNextCourses.length >= 5) break;
          }
        }

        const studentContext = {
          name: student?.name || "Student",
          major: resolvedMajor,
          academicYear,
          currentSemester,
          nextSemester,
          gpa: plan?.currentGPA ?? "0.00",
          completedCredits: completedCr,
          totalCredits: plan?.totalCredits ?? 133,
          attendanceRate: attRate,
          currentCourses: courseDetails.map((c: any) => ({ name: c.name, code: c.code, credits: c.credits, status: enrollments.find((e: any) => e.courseId === c.id)?.status ?? "planned" })),
          failedCourses,
          recommendedNextCourses,
          pendingAssignments: pendingAssignments.length,
          activeAlerts: activeAlerts.map((a: any) => ({ title: a.title, severity: a.severity })),
        };

        let aiMessage: string | null = null;
        let isOfflineFallback = true;
        let source: "faq" | "academic_rules" | "local_advisor" | "external_llm" = "local_advisor";

        const normMsg = input.message.toLowerCase();
        const arabicChars = (input.message.match(/[\u0600-\u06FF]/g) || []).length;
        const englishChars = (input.message.match(/[a-zA-Z]/g) || []).length;
        const isArabic = arabicChars > englishChars;
        const studentLang: "ar" | "en" = isArabic ? "ar" : "en";

        // 1. TOP PRIORITY (SCORE: 100+): Retrieve & Score Doctor Course Materials
        const doctorMaterialsRAG = await searchDoctorCourseMaterialsRAG({
          db,
          studentId: ctx.user.id,
          query: input.message,
          language: studentLang,
        });

        // Check for Free-Time Study Planning Intent (e.g. 9 PM - 11 PM working student)
        const isFreeTimeIntent =
          normMsg.includes("وقت فراغ") ||
          normMsg.includes("free time") ||
          normMsg.includes("9 - 11") ||
          normMsg.includes("9-11") ||
          normMsg.includes("9 to 11") ||
          normMsg.includes("9 حتى 11") ||
          normMsg.includes("21:00") ||
          (normMsg.includes("موظف") && normMsg.includes("وقت")) ||
          (normMsg.includes("طالب موظف") && normMsg.includes("جدول")) ||
          (normMsg.includes("work") && normMsg.includes("free") && normMsg.includes("plan"));

        // Check for Internet-Grounded Course Study Strategy Intent (e.g. videos, translated Russian articles, Reddit)
        const isStudyStrategyIntent =
          normMsg.includes("strategy") ||
          normMsg.includes("استراتيجية") ||
          normMsg.includes("طريقة دراسة") ||
          normMsg.includes("كيف ادرس") ||
          normMsg.includes("كيف أدرس") ||
          normMsg.includes("فيديو") ||
          normMsg.includes("مقالات") ||
          normMsg.includes("مصادر") ||
          normMsg.includes("مراجع") ||
          normMsg.includes("روسي") ||
          normMsg.includes("russian") ||
          normMsg.includes("best study") ||
          (normMsg.includes("شرح") && (normMsg.includes("مادة") || normMsg.includes("cs") || normMsg.includes("تراكيب") || normMsg.includes("فيزياء") || normMsg.includes("تفاضل")));

        if (isFreeTimeIntent) {
          const studentAsgns = await db.select({
            title: assignments.title,
            status: studentAssignments.status,
            dueDate: assignments.dueDate,
            courseId: assignments.courseId,
          })
          .from(studentAssignments)
          .leftJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
          .where(eq(studentAssignments.studentId, ctx.user.id));

          const assignmentsWithCode = studentAsgns.map(sa => {
            const c = courseDetails.find((cd: any) => cd.id === sa.courseId);
            return {
              title: sa.title || "Assignment",
              courseCode: c?.code || "CS201",
              dueDate: sa.dueDate ? String(sa.dueDate) : undefined,
              status: sa.status || "pending",
            };
          });

          const plan = buildFreeTimePlan({
            input: {
              freeTimeStart: "21:00",
              freeTimeEnd: "23:00",
              workScheduleNote: isArabic ? "طالب موظف نهاراً - وقت الفراغ 9:00 إلى 11:00 مساءً" : "Working student with dedicated 9:00 PM - 11:00 PM evening study window",
              language: studentLang,
            },
            studentContext: {
              name: student?.name || "Student",
              courses: (courseDetails.filter((c: any) => {
                const enroll: any = enrollments.find((e: any) => e.courseId === c.id);
                const s = String(enroll?.status || "");
                return s === "in_progress" || s === "enrolled" || s === "failed" || enroll?.grade === "F";
              }).length > 0 
                ? courseDetails.filter((c: any) => {
                    const enroll: any = enrollments.find((e: any) => e.courseId === c.id);
                    const s = String(enroll?.status || "");
                    return s === "in_progress" || s === "enrolled" || s === "failed" || enroll?.grade === "F";
                  })
                : courseDetails).map((c: any) => ({ code: c.code, name: c.name, credits: c.credits })),
              assignments: assignmentsWithCode,
            },
          });

          aiMessage = formatFreeTimePlanToMarkdown(plan, studentLang);
          source = "local_advisor";
          isOfflineFallback = false;
        } else if (isStudyStrategyIntent) {
          const strategy = await getCourseStudyStrategy({
            query: input.message,
            language: studentLang,
            doctorMaterials: doctorMaterialsRAG.matches,
          });

          aiMessage = formatStudyStrategyToMarkdown(strategy);
          source = "external_llm";
          isOfflineFallback = false;
        }

        // 1. Priority: Local Private Ollama on RTX 3050 (100% Data Privacy)
        if (!aiMessage) {
          const ollamaUrl = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";
          let targetModel = process.env.OLLAMA_MODEL || "oliver-zuj:latest";
          try {
          // Probe available models from Ollama to auto-select any installed model (prioritizing custom oliver-zuj)
          const tagsRes = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/tags`, {
            signal: AbortSignal.timeout(800),
          });
          if (tagsRes.ok) {
            const tags = (await tagsRes.json()) as any;
            const availableNames: string[] = (tags?.models || []).map((m: any) => m.name);
            if (availableNames.length > 0) {
              const oliverCustom = availableNames.find((n) => n.includes("oliver-zuj") || n.includes("oliver"));
              const matched = oliverCustom || availableNames.find((n) => n.startsWith(targetModel) || targetModel.startsWith(n));
              targetModel = matched || availableNames[0];
            }
          }

          let systemPrompt = buildOliverSystemPrompt(
            studentContext,
            activeFaqs,
            activeDocs
          );

          if (doctorMaterialsRAG.hasDoctorMatch) {
            systemPrompt = `${systemPrompt}\n\n${doctorMaterialsRAG.formattedContext}`;
          }

          const arabicChars = (input.message.match(/[\u0600-\u06FF]/g) || []).length;
          const englishChars = (input.message.match(/[a-zA-Z]/g) || []).length;
          const isArabic = arabicChars > englishChars;
          const langInstruction = isArabic
            ? "CRITICAL: The student wrote in Arabic. You must reply strictly in clean, natural Arabic (العربية الفصحى)."
            : "CRITICAL: The student wrote in English. You must reply strictly in clear, fluent English.";

          const ollamaMessages = [
            { role: "system", content: `${systemPrompt}\n\n${langInstruction}` },
            ...chat_history.slice(-4).map((h: any) => ({
              role: h.role === "assistant" ? "assistant" : "user",
              content: h.role === "assistant" && typeof h.content === "string" && h.content.length > 450
                ? h.content.slice(0, 450) + "..."
                : h.content,
            })),
            { role: "user", content: input.message },
          ];

          const ollamaRes = await fetch(ollamaUrl.replace(/\/$/, '') + "/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: targetModel,
              messages: ollamaMessages,
              stream: false,
              options: {
                temperature: 0.2, // Strict precision, prevents rambling and hallucination
                top_p: 0.85,
                repeat_penalty: 1.15,
                num_ctx: 4096, // Focused context for ultra-fast GPU processing
                num_predict: 600, // Crisp, complete response without cut-off
                stop: ["<|im_start|>", "<|im_end|>", "\n### حالتك الدراسية", "\nStudent Status:"],
              },
            }),
            signal: AbortSignal.timeout(45000),
          });

          if (ollamaRes.ok) {
            const ollamaData = await ollamaRes.json() as any;
            if (ollamaData?.message?.content) {
              let text = ollamaData.message.content as string;
              // Clean up any cross-lingual Cyrillic token leaks from base tokenizer (e.g. курсы -> المقررات)
              text = text.replace(/курсы/gi, "المقررات");
              aiMessage = text;
              isOfflineFallback = false;
              source = "external_llm";
            }
          }
        } catch {
          // Ollama offline or timed out, gracefully check Runpod or local fallback
        }
        }

        const runpodUrl = process.env.RUNPOD_API_URL;
        if (runpodUrl && process.env.AI_FORCE_LOCAL_FALLBACK !== "true") {
          try {
            const runpodPayload = {
              query: input.message,
              chat_history: chat_history,
              student_context: studentContext,
              db_faqs: activeFaqs,
              db_documents: activeDocs,
              uploaded_file_name: "None",
              uploaded_file_context: null,
            };

            const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/chat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(runpodPayload),
              signal: AbortSignal.timeout(1500),
            });

            if (response.ok) {
              const runpodData = await response.json();
              if (runpodData?.answer && typeof runpodData.answer === "string") {
                aiMessage = runpodData.answer;
                isOfflineFallback = false;
                source = "external_llm";
              }
            }
          } catch (fetchError: any) {
            console.warn("[AI Chat] Runpod request skipped or timed out (1500ms limit); engaging local fallback engine.", fetchError?.message);
          }
        }

        // If external model is offline, failed, or timed out, execute 3-tier local fallback engine
        if (!aiMessage) {
          const fallback = await generateLocalFallbackResponse({
            query: input.message,
            studentContext,
            dbFaqs: activeFaqs.map(f => ({
              question: f.q,
              questionAr: f.q,
              answer: f.a,
              answerAr: f.a,
            })),
            dbDocs: activeDocs,
          });

          aiMessage = fallback.response;
          isOfflineFallback = true;
          source = fallback.source;
        }

        // Save AI response to DB and touch conversation timestamp
        try {
          await db.insert(chatMessages).values({
            conversationId: input.conversationId,
            role: "assistant" as const,
            content: aiMessage,
            tokens: 0,
          });

          await db.update(aiConversations)
            .set({ updatedAt: new Date() })
            .where(eq(aiConversations.id, input.conversationId));
        } catch (dbError) {
          console.error("[AI Chat] Failed to save AI message to DB:", dbError);
        }

        return {
          success: true,
          response: aiMessage,
          isOfflineFallback,
          source,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("[AI Chat] Failed to send message:", error);
        return {
          success: false,
          response: "عذراً، حدث خطأ أثناء معالجة المحادثة. يرجى المحاولة مرة أخرى.",
          isOfflineFallback: true,
          source: "local_advisor" as const,
        };
      }
    }),

  rateMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        feedback: z.enum(["up", "down", "none"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (!ctx.user || ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Verify the message exists and belongs to the user's conversation
        const [msg] = await db
          .select({
            id: chatMessages.id,
            conversationId: chatMessages.conversationId,
            role: chatMessages.role,
            content: chatMessages.content,
            studentId: aiConversations.studentId,
          })
          .from(chatMessages)
          .innerJoin(aiConversations, eq(chatMessages.conversationId, aiConversations.id))
          .where(
            and(
              eq(chatMessages.id, input.messageId),
              eq(aiConversations.studentId, ctx.user.id)
            )
          )
          .limit(1);

        if (!msg) throw new TRPCError({ code: "NOT_FOUND" });

        // Update the feedback
        await db
          .update(chatMessages)
          .set({ feedback: input.feedback })
          .where(eq(chatMessages.id, input.messageId));

        // If feedback is provided, add to FAQs for review
        if (input.feedback === "up" || input.feedback === "down") {
          if (msg.role === "assistant") {
            // Find the preceding user question
            const [userMsg] = await db
              .select()
              .from(chatMessages)
              .where(
                and(
                  eq(chatMessages.conversationId, msg.conversationId),
                  eq(chatMessages.role, "user"),
                  lt(chatMessages.id, msg.id)
                )
              )
              // orderBy desc(id) to get the most recent before the assistant
              .orderBy(desc(chatMessages.id))
              .limit(1);

            if (userMsg) {
              // Check if we already added it
              const existing = await db
                .select()
                .from(faqs)
                .where(eq(faqs.question, userMsg.content))
                .limit(1);

              if (existing.length === 0) {
                await db.insert(faqs).values({
                  question: userMsg.content,
                  questionAr: userMsg.content,
                  answer: msg.content,
                  answerAr: msg.content,
                  category: "AI Feedback",
                  categoryAr: "تقييم الذكاء الاصطناعي",
                  createdBy: 1, // Fallback to an admin ID for system generated FAQs
                  isActive: false, // Keep it inactive for advisor review
                });
              }
            }
          }
        }
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[AI Chat] Failed to rate message:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  deleteConversation: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: conversationId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user || ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Verify conversation belongs to user
        const conv = await db
          .select()
          .from(aiConversations)
          .where(
            and(
              eq(aiConversations.id, conversationId),
              eq(aiConversations.studentId, ctx.user.id)
            )
          );

        if (conv.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Delete messages first
        await db
          .delete(chatMessages)
          .where(eq(chatMessages.conversationId, conversationId));

        // Delete conversation
        await db
          .delete(aiConversations)
          .where(eq(aiConversations.id, conversationId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[AI Chat] Failed to delete conversation:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

});
