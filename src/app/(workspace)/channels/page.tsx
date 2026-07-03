import type { Metadata } from "next";

import { ChannelSettings } from "@/components/operations/channel-settings";

export const metadata: Metadata = {
  title: "渠道",
};

export default function ChannelsPage() {
  return <ChannelSettings />;
}
