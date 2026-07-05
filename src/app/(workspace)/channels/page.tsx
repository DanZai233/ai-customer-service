import { headers } from "next/headers";
import type { Metadata } from "next";

import { ChannelSettings } from "@/components/operations/channel-settings";
import { requirePageAuth } from "@/lib/auth/context";
import { getChannelDashboard } from "@/lib/channels/repository";

export const metadata: Metadata = {
  title: "渠道",
};
export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const { user } = await requirePageAuth("channels.manage");
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  return (
    <ChannelSettings
      dashboard={await getChannelDashboard(user.organizationId)}
      baseUrl={baseUrl}
    />
  );
}
