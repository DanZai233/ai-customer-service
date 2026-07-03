export type Channel = "web" | "wechat" | "email";

export type ConversationStatus = "open" | "pending" | "resolved";

export type MessageRole = "customer" | "assistant" | "agent" | "system";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  time: string;
  sender?: string;
};

export type Conversation = {
  id: string;
  customer: {
    name: string;
    initials: string;
    phone: string;
    email: string;
    city: string;
    plan: string;
    since: string;
  };
  channel: Channel;
  status: ConversationStatus;
  priority: "normal" | "high";
  unread: number;
  lastMessage: string;
  updatedAt: string;
  assignee: string;
  tags: string[];
  aiManaged: boolean;
  order?: {
    id: string;
    amount: string;
    status: string;
    placedAt: string;
  };
  messages: Message[];
};

export type ConversationPatch = Partial<
  Pick<
    Conversation,
    "status" | "priority" | "unread" | "assignee" | "tags" | "aiManaged"
  >
>;

export type NewMessage = Pick<Message, "role" | "content" | "sender"> & {
  externalId?: string;
};
