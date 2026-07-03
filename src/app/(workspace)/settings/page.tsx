import type { Metadata } from "next";

import { SystemSettings } from "@/components/operations/system-settings";
import { getAiProviderStatus } from "@/lib/ai/provider";
import { requirePageAuth } from "@/lib/auth/context";
import { getDataMode } from "@/lib/conversations/repository";

export const metadata: Metadata = {
  title: "设置",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user } = await requirePageAuth("settings.read");
  return (
    <SystemSettings
      systemStatus={{
        ai: await getAiProviderStatus(user.organizationId),
        dataMode: getDataMode(),
      }}
    />
  );
}
