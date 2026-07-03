import type { Metadata } from "next";

import { SystemSettings } from "@/components/operations/system-settings";
import { getAiProviderStatus } from "@/lib/ai/provider";
import { getDataMode } from "@/lib/conversations/repository";

export const metadata: Metadata = {
  title: "设置",
};

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <SystemSettings
      systemStatus={{ ai: getAiProviderStatus(), dataMode: getDataMode() }}
    />
  );
}
