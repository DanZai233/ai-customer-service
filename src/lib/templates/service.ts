import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { knowledgeDocuments } from "@/db/schema";
import {
  getIndustryTemplate,
  industryTemplates,
  type IndustryTemplate,
} from "@/lib/templates/catalog";

export type TemplateCatalogItem = IndustryTemplate & {
  installedDocuments: number;
  totalDocuments: number;
  installed: boolean;
};

function templateSourceUrl(templateId: string, documentSlug: string) {
  return `template://${templateId}/${documentSlug}`;
}

export async function listIndustryTemplates(
  organizationId: string,
): Promise<TemplateCatalogItem[]> {
  const rows = await getDatabase()
    .select({ sourceUrl: knowledgeDocuments.sourceUrl })
    .from(knowledgeDocuments)
    .where(
      and(
        eq(knowledgeDocuments.organizationId, organizationId),
        eq(knowledgeDocuments.source, "template"),
      ),
    );
  const installedUrls = new Set(rows.flatMap((row) => row.sourceUrl ?? []));

  return industryTemplates.map((template) => {
    const installedDocuments = template.documents.filter((document) =>
      installedUrls.has(templateSourceUrl(template.id, document.slug)),
    ).length;
    return {
      ...template,
      installedDocuments,
      totalDocuments: template.documents.length,
      installed: installedDocuments === template.documents.length,
    };
  });
}

export async function installIndustryTemplate(input: {
  organizationId: string;
  userId: string;
  templateId: string;
}) {
  const template = getIndustryTemplate(input.templateId);
  if (!template) return null;
  const now = new Date();
  const inserted = await getDatabase()
    .insert(knowledgeDocuments)
    .values(
      template.documents.map((document) => ({
        id: `kb-${crypto.randomUUID()}`,
        organizationId: input.organizationId,
        title: document.title,
        category: document.category,
        content: document.content,
        status: "draft" as const,
        source: "template" as const,
        sourceUrl: templateSourceUrl(template.id, document.slug),
        createdBy: input.userId,
        updatedBy: input.userId,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .onConflictDoNothing({
      target: [knowledgeDocuments.organizationId, knowledgeDocuments.sourceUrl],
    })
    .returning({ id: knowledgeDocuments.id });
  const catalog = await listIndustryTemplates(input.organizationId);
  return {
    template: catalog.find((item) => item.id === template.id)!,
    createdDocuments: inserted.length,
  };
}
