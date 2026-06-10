import { router, protectedProcedure, publicProcedure, advisorProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { faqs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const faqsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          isActive: z.boolean().optional(),
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
        if (input?.category) {
          conditions.push(eq(faqs.category, input.category));
        }
        if (input?.isActive !== undefined) {
          conditions.push(eq(faqs.isActive, input.isActive));
        }

        const page = input?.page || 1;
        const limit = input?.limit || 20;
        const offset = (page - 1) * limit;

        const query =
          conditions.length > 0
            ? db
                .select()
                .from(faqs)
                .where(and(...conditions))
            : db.select().from(faqs);

        const results = await query.limit(limit).offset(offset);

        // Get total count for pagination metadata
        const countQuery =
          conditions.length > 0
            ? db
                .select()
                .from(faqs)
                .where(and(...conditions))
            : db.select().from(faqs);
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
        console.error("[FAQs] Failed to list FAQs:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getById: publicProcedure.input(z.number()).query(async ({ input: faqId }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    try {
      const result = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, faqId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("[FAQs] Failed to get FAQ:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  create: advisorProcedure
    .input(
      z.object({
        question: z.string().min(10),
        questionAr: z.string().min(10),
        answer: z.string().min(20),
        answerAr: z.string().min(20),
        category: z.string(),
        categoryAr: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        await db.insert(faqs).values({
          question: input.question,
          questionAr: input.questionAr,
          answer: input.answer,
          answerAr: input.answerAr,
          category: input.category,
          categoryAr: input.categoryAr,
          createdBy: ctx.user.id,
          isActive: true,
        });

        // Sync with Runpod
        const runpodUrl = process.env.RUNPOD_API_URL;
        if (runpodUrl) {
          try {
            await fetch(`${runpodUrl.replace(/\/$/, '')}/add_faq`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: input.question,
                answer: input.answer
              }),
            });
          } catch (e) {
            console.error("[FAQs] Runpod sync failed:", e);
          }
        }

        return { success: true };
      } catch (error) {
        console.error("[FAQs] Failed to create FAQ:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  update: advisorProcedure
    .input(
      z.object({
        id: z.number(),
        question: z.string().optional(),
        questionAr: z.string().optional(),
        answer: z.string().optional(),
        answerAr: z.string().optional(),
        category: z.string().optional(),
        categoryAr: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const updateData: any = {};
        if (input.question !== undefined) updateData.question = input.question;
        if (input.questionAr !== undefined)
          updateData.questionAr = input.questionAr;
        if (input.answer !== undefined) updateData.answer = input.answer;
        if (input.answerAr !== undefined) updateData.answerAr = input.answerAr;
        if (input.category !== undefined) updateData.category = input.category;
        if (input.categoryAr !== undefined)
          updateData.categoryAr = input.categoryAr;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        await db.update(faqs).set(updateData).where(eq(faqs.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[FAQs] Failed to update FAQ:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  delete: advisorProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: faqId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        await db.delete(faqs).where(eq(faqs.id, faqId));
        return { success: true };
      } catch (error) {
        console.error("[FAQs] Failed to delete FAQ:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    try {
      const result = await db.select().from(faqs);
      const categoriesSet = new Set(result.map(f => f.category));
      const categories = Array.from(categoriesSet);
      return categories;
    } catch (error) {
      console.error("[FAQs] Failed to get categories:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
