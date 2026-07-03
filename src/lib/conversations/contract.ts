import type {
  Conversation,
  ConversationPatch,
  NewMessage,
} from "@/lib/conversations/types";

export class ConversationNotFoundError extends Error {
  constructor(conversationId: string) {
    super(`Conversation ${conversationId} was not found`);
    this.name = "ConversationNotFoundError";
  }
}

export interface ConversationRepository {
  list(organizationId: string): Promise<Conversation[]>;
  update(
    organizationId: string,
    conversationId: string,
    patch: ConversationPatch,
  ): Promise<Conversation>;
  addMessage(
    organizationId: string,
    conversationId: string,
    message: NewMessage,
  ): Promise<Conversation>;
}
