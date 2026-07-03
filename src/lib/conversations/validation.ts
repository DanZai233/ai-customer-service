import { z } from "zod";

export const conversationPatchSchema = z
  .object({
    status: z.enum(["open", "pending", "resolved"]).optional(),
    priority: z.enum(["normal", "high"]).optional(),
    unread: z.number().int().min(0).max(9999).optional(),
    assignee: z.string().trim().min(1).max(80).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    aiManaged: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "至少需要提供一个可更新字段",
  });

export const newMessageSchema = z
  .object({
    role: z.enum(["customer", "assistant", "agent"]),
    content: z.string().trim().min(1).max(10000),
    sender: z.string().trim().min(1).max(80).optional(),
    externalId: z.string().trim().min(1).max(160).optional(),
  })
  .strict();
