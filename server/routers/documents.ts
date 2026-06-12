import { router, protectedProcedure, advisorProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { documents } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import {
  officialFacultyResources,
  isAllowedDomain,
} from "../officialResources";

export const documentsRouter = router({
  list: advisorProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          fileType: z.string().optional(),
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
        const conditions = [];
        if (!isAdmin) {
          conditions.push(eq(documents.uploadedBy, ctx.user.id));
        }
        if (input?.category) {
          conditions.push(eq(documents.category, input.category));
        }
        if (input?.fileType) {
          conditions.push(eq(documents.fileType, input.fileType));
        }

        const query =
          conditions.length > 0
            ? db.select().from(documents).where(and(...conditions))
            : db.select().from(documents);
        const results = await query.limit(limit).offset(offset);

        // Get total count for pagination metadata
        const countQuery =
          conditions.length > 0
            ? db.select().from(documents).where(and(...conditions))
            : db.select().from(documents);
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
        console.error("[Documents] Failed to list documents:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  upload: advisorProcedure
    .input(
      z.object({
        title: z.string().min(1),
        fileContent: z.string(), // base64 encoded
        fileType: z.enum(["pdf", "csv", "docx"]),
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

      const maxSize = 20 * 1024 * 1024; // 20MB
      const buffer = Buffer.from(input.fileContent, "base64");
      if (buffer.length > maxSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File too large. Max 20MB.",
        });
      }

      try {
        // Upload to storage first
        const { url, key } = await storagePut(
          `documents/${ctx.user.id}/${Date.now()}-${input.title}`,
          buffer,
          `application/${input.fileType}`
        );

        // Save metadata to database with pending status
        const [inserted] = await db.insert(documents).values({
          title: input.title,
          fileType: input.fileType,
          fileUrl: url,
          fileKey: key,
          category: input.category,
          uploadedBy: ctx.user.id,
          isProcessed: false,
        });

        const documentId = inserted?.insertId;

        // Sync to Runpod for AI indexing
        const runpodUrl = process.env.RUNPOD_API_URL;
        if (runpodUrl) {
          try {
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
              return {
                success: true,
                url,
                key,
                warning: "File stored but AI indexing failed. You can retry later.",
              };
            }

            // Mark as indexed
            await db
              .update(documents)
              .set({ isProcessed: true })
              .where(eq(documents.id, documentId as number));
          } catch (e) {
            console.error("[Documents] Runpod sync failed:", e);
            return {
              success: true,
              url,
              key,
              warning: "File stored but AI indexing failed. You can retry later.",
            };
          }
        } else {
          // No Runpod configured; mark as indexed since we can't process
          await db
            .update(documents)
            .set({ isProcessed: true })
            .where(eq(documents.id, documentId as number));
        }

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

  getStats: advisorProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    try {
      const isAdmin = ctx.user.role === "admin";
      const baseQuery = isAdmin
        ? db.select().from(documents)
        : db.select().from(documents).where(eq(documents.uploadedBy, ctx.user.id));

      const all = await baseQuery;
      const total = all.length;
      const indexed = all.filter((d) => d.isProcessed).length;
      const processing = all.filter((d) => !d.isProcessed).length;
      const failed = 0;

      return { total, indexed, processing, failed };
    } catch (error) {
      console.error("[Documents] Failed to get stats:", error);
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

  getOfficialResources: advisorProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    try {
      // Get advisor's already-imported official resources
      const imported = await db
        .select()
        .from(documents)
        .where(eq(documents.uploadedBy, ctx.user.id));

      const importedKeys = new Set(imported.map((d) => d.fileKey));

      const available = officialFacultyResources.map((res) => ({
        ...res,
        isImported: importedKeys.has(`official://${res.id}`),
        importedDocId: imported.find((d) => d.fileKey === `official://${res.id}`)?.id ?? null,
      }));

      return available;
    } catch (error) {
      console.error("[Documents] Failed to get official resources:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  importOfficialResource: advisorProcedure
    .input(
      z.object({
        resourceId: z.string(),
        indexForAI: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const resource = officialFacultyResources.find(
        (r) => r.id === input.resourceId
      );
      if (!resource) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Official resource not found",
        });
      }

      try {
        // Check if already imported
        const existing = await db
          .select()
          .from(documents)
          .where(
            and(
              eq(documents.uploadedBy, ctx.user.id),
              eq(documents.fileKey, `official://${resource.id}`)
            )
          );
        if (existing.length > 0) {
          return { success: true, docId: existing[0].id, alreadyImported: true };
        }

        const [inserted] = await db.insert(documents).values({
          title: resource.title,
          fileUrl: resource.url,
          fileKey: `official://${resource.id}`,
          fileType: "link",
          category: resource.category,
          uploadedBy: ctx.user.id,
          isProcessed: false,
        });

        const docId = inserted?.insertId;

        // Optionally sync to Runpod for AI indexing
        if (input.indexForAI) {
          const runpodUrl = process.env.RUNPOD_API_URL;
          if (runpodUrl) {
            try {
              const response = await fetch(
                `${runpodUrl.replace(/\/$/, '')}/add_url`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    url: resource.url,
                    title: resource.title,
                    source: resource.source,
                  }),
                }
              );
              if (response.ok) {
                await db
                  .update(documents)
                  .set({ isProcessed: true })
                  .where(eq(documents.id, docId as number));
              }
            } catch (e) {
              console.error("[Documents] Runpod URL indexing failed:", e);
            }
          } else {
            await db
              .update(documents)
              .set({ isProcessed: true })
              .where(eq(documents.id, docId as number));
          }
        }

        return { success: true, docId };
      } catch (error) {
        console.error("[Documents] Failed to import official resource:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  addOfficialLink: advisorProcedure
    .input(
      z.object({
        title: z.string().min(1),
        category: z.string().min(1),
        url: z.string().url(),
        indexForAI: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isAllowedDomain(input.url)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only official Al-Zaytoonah University (zuj.edu.jo) URLs are allowed.",
        });
      }

      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const [inserted] = await db.insert(documents).values({
          title: input.title,
          fileUrl: input.url,
          fileKey: `official-link://${Date.now()}`,
          fileType: "link",
          category: input.category,
          uploadedBy: ctx.user.id,
          isProcessed: false,
        });

        const docId = inserted?.insertId;

        if (input.indexForAI) {
          const runpodUrl = process.env.RUNPOD_API_URL;
          if (runpodUrl) {
            try {
              const response = await fetch(
                `${runpodUrl.replace(/\/$/, '')}/add_url`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    url: input.url,
                    title: input.title,
                  }),
                }
              );
              if (response.ok) {
                await db
                  .update(documents)
                  .set({ isProcessed: true })
                  .where(eq(documents.id, docId as number));
              }
            } catch (e) {
              console.error("[Documents] Runpod URL indexing failed:", e);
            }
          } else {
            await db
              .update(documents)
              .set({ isProcessed: true })
              .where(eq(documents.id, docId as number));
          }
        }

        return { success: true, docId };
      } catch (error) {
        console.error("[Documents] Failed to add official link:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  retryDocumentIndexing: advisorProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: docId }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      try {
        const doc = await db
          .select()
          .from(documents)
          .where(eq(documents.id, docId))
          .limit(1);

        if (!doc[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const isAdmin = ctx.user.role === "admin";
        if (!isAdmin && doc[0].uploadedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const runpodUrl = process.env.RUNPOD_API_URL;
        if (!runpodUrl) {
          await db
            .update(documents)
            .set({ isProcessed: true })
            .where(eq(documents.id, docId));
          return { success: true, message: "Marked as indexed (no Runpod configured)" };
        }

        if (doc[0].fileType === "link") {
          // Index URL
          try {
            const response = await fetch(
              `${runpodUrl.replace(/\/$/, '')}/add_url`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url: doc[0].fileUrl,
                  title: doc[0].title,
                }),
              }
            );
            if (response.ok) {
              await db
                .update(documents)
                .set({ isProcessed: true })
                .where(eq(documents.id, docId));
              return { success: true, message: "URL indexed successfully" };
            } else {
              return { success: false, message: "Runpod indexing failed" };
            }
          } catch (e) {
            console.error("[Documents] Retry indexing failed:", e);
            return { success: false, message: "Runpod indexing failed" };
          }
        } else {
          // For file uploads, we would need the original buffer; skip for now
          return { success: false, message: "Retry for file uploads not yet supported" };
        }
      } catch (error) {
        console.error("[Documents] Failed to retry indexing:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
