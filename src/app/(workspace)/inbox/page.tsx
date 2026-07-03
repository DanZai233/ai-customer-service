import type { Metadata } from "next";

import { ConversationWorkspace } from "@/components/inbox/conversation-workspace";

export const metadata: Metadata = {
  title: "会话工作台",
};

export default function InboxPage() {
  return <ConversationWorkspace />;
}
