import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";

import { ConversationWorkspace } from "@/components/inbox/conversation-workspace";
import { requirePageAuth } from "@/lib/auth/context";
import { getConversationRepository } from "@/lib/conversations/repository";

export const metadata: Metadata = {
  title: "会话工作台",
};

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { user } = await requirePageAuth("conversation.read");
  const conversations = await getConversationRepository().list(
    user.organizationId,
  );

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/15 p-6 text-center">
        <div>
          <MessageSquareText className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-3 text-sm font-semibold">还没有会话</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            新的客户消息会出现在这里。
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConversationWorkspace
      initialConversations={conversations}
      agentName={user.name}
    />
  );
}
