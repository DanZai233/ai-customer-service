import { headers } from "next/headers";
import type { Metadata } from "next";

import { DeveloperConsole } from "@/components/developer/developer-console";
import { requirePageAuth } from "@/lib/auth/context";
import { can } from "@/lib/auth/permissions";
import { listApiKeys } from "@/lib/developer/api-keys";

export const metadata: Metadata = { title: "开发者中心" };
export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const { user } = await requirePageAuth("settings.read");
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  return (
    <DeveloperConsole
      initialKeys={await listApiKeys(user.organizationId)}
      canManage={can(user.role, "settings.manage")}
      baseUrl={baseUrl}
    />
  );
}
