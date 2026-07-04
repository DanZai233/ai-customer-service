import { isDatabaseConfigured } from "@/db/client";
import type { ConversationRepository } from "@/lib/conversations/contract";
export { ConversationNotFoundError } from "@/lib/conversations/contract";
import { createDemoConversationRepository } from "@/lib/conversations/demo-repository";
import { createPostgresConversationRepository } from "@/lib/conversations/postgres-repository";
import { conversations as demoConversations } from "@/lib/demo-data";

export const defaultOrganizationId = "org-luma";

const demoRepository = createDemoConversationRepository(demoConversations);

export function getConversationRepository(): ConversationRepository {
  return isDatabaseConfigured()
    ? createPostgresConversationRepository()
    : demoRepository;
}

export function getDataMode() {
  return isDatabaseConfigured() ? "postgres" : "demo";
}
