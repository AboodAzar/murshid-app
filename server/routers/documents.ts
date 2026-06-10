import { router, protectedProcedure, advisorProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { documents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

export const documentsRouter = router({
  list: advisorProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
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

      try {
        const page = input?.page || 1;
        const limit = input?.limit || 20;
        const offset = (page - 1) * limit;

        // Admin sees all documents; advisors see only their own
        const isAdmin = ctx.user.role === "admin";
        const query = isAdmin
          ? db.select().from(documents)
          : db.select().from(documents).where(eq(documents.uploadedBy, ctx.user.id));
        const results = await query.limit(limit).offset(offset);

        // Get total count for pagination metadata
        const allResults = isAdmin
          ? await db.select().from(documents)
          : await db.select().from(documents).where(eq(documents.uploadedBy, ctx.user.id));
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
        console.error("[Documents] Failed to list documents:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  upload: advisorProcedure
    .input(
      z.object({
        title: z.string(),
        fileContent: z.string(), // base64 encoded
        fileType: z.enum(["pdf", "csv"]),
        category: z.string(),
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
        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileContent, "base64");

        // Sync to Runpod first
        const runpodUrl = process.env.RUNPOD_API_URL;
        if (runpodUrl) {
          const formData = new FormData();
          const filename = input.title.endsWith(`.${input.fileType}`) 
            ? input.title 
            : `${input.title}.${input.fileType}`;
            
          formData.append("file", new Blob([buffer]), filename);
          
          const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/upload_document`, {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Runpod upload failed: ${response.statusText}`,
            });
          }
        }

        // Upload to storage
        const { url, key } = await storagePut(
          `documents/${ctx.user.id}/${Date.now()}-${input.title}`,
          buffer,
          `application/${input.fileType}`
        );

        // Save metadata to database
        await db.insert(documents).values({
          title: input.title,
          fileType: input.fileType,
          fileUrl: url,
          fileKey: key,
          category: input.category,
          uploadedBy: ctx.user.id,
          isProcessed: true,
        });

        return { success: true, url, key };
      } catch (error) {
        console.error("[Documents] Failed to upload document:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  delete: advisorProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: documentId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        // Verify ownership (admin can delete any document)
        const doc = await db
          .select()
          .from(documents)
          .where(eq(documents.id, documentId))
          .limit(1);
        const isAdmin = ctx.user.role === "admin";
        if (!doc[0] || (!isAdmin && doc[0].uploadedBy !== ctx.user.id)) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Delete from database (storage cleanup happens automatically)
        await db.delete(documents).where(eq(documents.id, documentId));
        return { success: true };
      } catch (error) {
        console.error("[Documents] Failed to delete document:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getByCategory: advisorProcedure
    .input(z.string())
    .query(async ({ ctx, input: category }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const result = await db
          .select()
          .from(documents)
          .where(eq(documents.category, category));
        return result;
      } catch (error) {
        console.error(
          "[Documents] Failed to get documents by category:",
          error
        );
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
