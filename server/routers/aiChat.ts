import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { aiConversations, chatMessages, faqs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";

export const aiChatRouter = router({
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

        // Generate AI response via Runpod
        const runpodUrl = process.env.RUNPOD_API_URL;
        if (!runpodUrl) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "RUNPOD_API_URL is not configured",
          });
        }

        const runpodPayload = {
          query: input.message,
          chat_history: chat_history,
          uploaded_file_name: "None",
          uploaded_file_context: null
        };

        const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(runpodPayload),
        });

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Runpod API error: ${response.statusText}`,
          });
        }

        let runpodData;
        try {
          const textResponse = await response.text();
          try {
            runpodData = JSON.parse(textResponse);
          } catch (e) {
            console.error("Runpod returned non-JSON:", textResponse);
            runpodData = { answer: "Error: Runpod returned an invalid response format. Check the local console." };
          }
        } catch (e) {
           runpodData = { answer: "Error: Failed to read Runpod response." };
        }
        
        const aiMessage = runpodData.answer || "I apologize, I could not generate a response.";

        // Save AI response
        try {
          await db.insert(chatMessages).values({
            conversationId: input.conversationId,
            role: "assistant" as const,
            content: aiMessage as string,
            tokens: 0,
          });
        } catch (dbError) {
          console.error("Failed to save AI message to DB:", dbError);
          // Don't throw, we still want to show the message to the user!
        }

        return { success: true, response: aiMessage };
      } catch (error) {
        console.error("[AI Chat] Failed to send message:", error);
        return { success: false, response: "An internal server error occurred while contacting the AI." };
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
        console.error("[AI Chat] Failed to delete conversation:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
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
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      if (!ctx.user || ctx.user.role !== "student") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await db
          .update(chatMessages)
          .set({ feedback: input.feedback })
          .where(eq(chatMessages.id, input.messageId));

        return { success: true };
      } catch (error) {
        console.error("[AI Chat] Failed to rate message:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
