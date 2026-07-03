import type { Metadata } from "next";

import { ChannelSettings } from "@/components/operations/channel-settings";
import { requirePageAuth } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "渠道",
};

export default async function ChannelsPage() {
  await requirePageAuth("channels.manage");
  return <ChannelSettings />;
}
