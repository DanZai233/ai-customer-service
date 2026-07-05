import type { Metadata } from "next";

import { SystemSettings } from "@/components/operations/system-settings";
import { requirePageAuth } from "@/lib/auth/context";
import { can } from "@/lib/auth/permissions";
import {
  getPublicAiProviderSettings,
  getWorkspaceSettings,
} from "@/lib/settings/service";

export const metadata: Metadata = {
  title: "设置",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user } = await requirePageAuth("settings.read");
  const [workspace, ai] = await Promise.all([
    getWorkspaceSettings(user.organizationId),
    getPublicAiProviderSettings(user.organizationId),
  ]);

  return (
    <SystemSettings
      initialSettings={{ workspace, ai }}
      canManage={can(user.role, "settings.manage")}
    />
  );
}
