import {
  ConversationNotFoundError,
  type ConversationRepository,
} from "@/lib/conversations/contract";
import type { Conversation } from "@/lib/conversations/types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createDemoConversationRepository(
  seedConversations: Conversation[],
): ConversationRepository {
  let state = clone(seedConversations);

  function findConversation(conversationId: string) {
    const conversation = state.find((item) => item.id === conversationId);
    if (!conversation) throw new ConversationNotFoundError(conversationId);
    return conversation;
  }

  return {
    async list() {
      return clone(state);
    },

    async update(_organizationId, conversationId, patch) {
      const current = findConversation(conversationId);
      const updated: Conversation = { ...current, ...patch };
      state = state.map((item) =>
        item.id === conversationId ? updated : item,
      );
      return clone(updated);
    },

    async addMessage(_organizationId, conversationId, message) {
      const current = findConversation(conversationId);
      const now = new Date();
      const updated: Conversation = {
        ...current,
        lastMessage: message.content,
        updatedAt: "刚刚",
        messages: [
          ...current.messages,
          {
            id: `msg-${crypto.randomUUID()}`,
            role: message.role,
            content: message.content,
            sender: message.sender,
            time: new Intl.DateTimeFormat("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).format(now),
          },
        ],
      };
      state = state.map((item) =>
        item.id === conversationId ? updated : item,
      );
      return clone(updated);
    },
  };
}
