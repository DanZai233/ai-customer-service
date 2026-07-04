import { z } from "zod";

export const createKnowledgeDocumentSchema = z.object({
  title: z.string().trim().min(3).max(160),
  category: z.string().trim().min(2).max(80),
  content: z.string().trim().min(20).max(20_000),
});

export const updateKnowledgeDocumentSchema = createKnowledgeDocumentSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "至少需要修改一个字段",
  });

export const searchKnowledgeSchema = z.object({
  query: z.string().trim().min(2).max(500),
  limit: z.number().int().min(1).max(10).default(3),
});
