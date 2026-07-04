import type { Metadata } from "next";

import { TemplateGallery } from "@/components/templates/template-gallery";
import { requirePageAuth } from "@/lib/auth/context";
import { can } from "@/lib/auth/permissions";
import { listIndustryTemplates } from "@/lib/templates/service";

export const metadata: Metadata = { title: "行业模板" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const { user } = await requirePageAuth("knowledge.read");
  return (
    <TemplateGallery
      initialTemplates={await listIndustryTemplates(user.organizationId)}
      canInstall={can(user.role, "knowledge.write")}
    />
  );
}
