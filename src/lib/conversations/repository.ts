import type { ConversationRepository } from "@/lib/conversations/contract";
export { ConversationNotFoundError } from "@/lib/conversations/contract";
import { createPostgresConversationRepository } from "@/lib/conversations/postgres-repository";

export const defaultOrganizationId = "org-luma";

export function getConversationRepository(): ConversationRepository {
  return createPostgresConversationRepository();
}

export function getDataMode() {
  return "postgres" as const;
}
