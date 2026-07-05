export type ChannelId = "web" | "wechat" | "email";

export type ChannelSummary = {
  id: ChannelId;
  name: string;
  nativeConnectorAvailable: boolean;
  conversationCount: number;
  unresolvedCount: number;
};

export type ChannelDashboard = {
  channels: ChannelSummary[];
  api: {
    activeWriteKeys: number;
    lastUsedAt: string | null;
  };
};
