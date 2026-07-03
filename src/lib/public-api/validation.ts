import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const createPublicConversationSchema = z
  .object({
    externalId: optionalText(100),
    channel: z.enum(["web", "wechat", "email"]).default("web"),
    customer: z.object({
      externalId: optionalText(100),
      name: z.string().trim().min(1).max(80),
      email: z.string().trim().email().max(160).optional(),
      phone: optionalText(40),
      city: optionalText(80),
      plan: optionalText(80),
    }),
    message: z.object({
      content: z.string().trim().min(1).max(10_000),
      externalId: optionalText(120),
    }),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  })
  .refine(({ customer }) => Boolean(customer.externalId || customer.email), {
    path: ["customer"],
    message: "客户 externalId 和 email 至少提供一个",
  });

export const createPublicMessageSchema = z.object({
  content: z.string().trim().min(1).max(10_000),
  externalId: optionalText(120),
  sender: optionalText(80),
});
