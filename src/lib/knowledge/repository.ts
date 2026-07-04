import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { knowledgeDocuments, knowledgeRetrievals } from "@/db/schema";
import { formatKnowledgeContext, rankKnowledgeDocuments } from "./search";
import type {
  KnowledgeDocument,
  KnowledgeDocumentStatus,
  KnowledgeMatch,
  KnowledgeRetrievalSource,
  KnowledgeStats,
} from "./types";

type KnowledgeRow = typeof knowledgeDocuments.$inferSelect;

function toKnowledgeDocument(row: KnowledgeRow): KnowledgeDocument {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    status: row.status,
    source: row.source,
    sourceUrl: row.sourceUrl,
    hitCount: row.hitCount,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listKnowledgeDocuments(
  organizationId: string,
  filters: {
    search?: string;
    status?: KnowledgeDocumentStatus;
  } = {},
) {
  const predicates = [eq(knowledgeDocuments.organizationId, organizationId)];
  if (filters.status) {
    predicates.push(eq(knowledgeDocuments.status, filters.status));
  }
  if (filters.search?.trim()) {
    const pattern = `%${filters.search.trim()}%`;
    const searchPredicate = or(
      ilike(knowledgeDocuments.title, pattern),
      ilike(knowledgeDocuments.category, pattern),
      ilike(knowledgeDocuments.content, pattern),
    );
    if (searchPredicate) predicates.push(searchPredicate);
  }

  const rows = await getDatabase()
    .select()
    .from(knowledgeDocuments)
    .where(and(...predicates))
    .orderBy(desc(knowledgeDocuments.updatedAt));

  return rows.map(toKnowledgeDocument);
}

export async function getKnowledgeDocument(
  organizationId: string,
  documentId: string,
) {
  const [row] = await getDatabase()
    .select()
    .from(knowledgeDocuments)
    .where(
      and(
        eq(knowledgeDocuments.organizationId, organizationId),
        eq(knowledgeDocuments.id, documentId),
      ),
    )
    .limit(1);
  return row ? toKnowledgeDocument(row) : null;
}

export async function getKnowledgeStats(
  organizationId: string,
): Promise<KnowledgeStats> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const db = getDatabase();
  const [totalResult, publishedResult, retrievalResult] = await Promise.all([
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.organizationId, organizationId)),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(knowledgeDocuments)
      .where(
        and(
          eq(knowledgeDocuments.organizationId, organizationId),
          eq(knowledgeDocuments.status, "published"),
        ),
      ),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(knowledgeRetrievals)
      .where(
        and(
          eq(knowledgeRetrievals.organizationId, organizationId),
          gte(knowledgeRetrievals.createdAt, monthStart),
        ),
      ),
  ]);

  return {
    total: totalResult[0]?.value ?? 0,
    published: publishedResult[0]?.value ?? 0,
    retrievalsThisMonth: retrievalResult[0]?.value ?? 0,
  };
}

export async function createKnowledgeDocument(
  organizationId: string,
  userId: string,
  input: { title: string; category: string; content: string },
) {
  const [row] = await getDatabase()
    .insert(knowledgeDocuments)
    .values({
      id: `kb-${crypto.randomUUID()}`,
      organizationId,
      title: input.title,
      category: input.category,
      content: input.content,
      status: "draft",
      source: "manual",
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();
  return toKnowledgeDocument(row);
}

export async function updateKnowledgeDocument(
  organizationId: string,
  documentId: string,
  userId: string,
  input: { title?: string; category?: string; content?: string },
) {
  const [row] = await getDatabase()
    .update(knowledgeDocuments)
    .set({ ...input, updatedBy: userId, updatedAt: new Date() })
    .where(
      and(
        eq(knowledgeDocuments.organizationId, organizationId),
        eq(knowledgeDocuments.id, documentId),
      ),
    )
    .returning();
  return row ? toKnowledgeDocument(row) : null;
}

export async function publishKnowledgeDocument(
  organizationId: string,
  documentId: string,
  userId: string,
) {
  const now = new Date();
  const [row] = await getDatabase()
    .update(knowledgeDocuments)
    .set({
      status: "published",
      publishedAt: now,
      updatedBy: userId,
      updatedAt: now,
    })
    .where(
      and(
        eq(knowledgeDocuments.organizationId, organizationId),
        eq(knowledgeDocuments.id, documentId),
      ),
    )
    .returning();
  return row ? toKnowledgeDocument(row) : null;
}

export async function archiveKnowledgeDocument(
  organizationId: string,
  documentId: string,
  userId: string,
) {
  const [row] = await getDatabase()
    .update(knowledgeDocuments)
    .set({
      status: "archived",
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(knowledgeDocuments.organizationId, organizationId),
        eq(knowledgeDocuments.id, documentId),
      ),
    )
    .returning();
  return row ? toKnowledgeDocument(row) : null;
}

export async function searchKnowledgeDocuments(
  organizationId: string,
  query: string,
  options: {
    limit?: number;
    source: KnowledgeRetrievalSource;
    record?: boolean;
  },
): Promise<KnowledgeMatch[]> {
  const documents = await listKnowledgeDocuments(organizationId, {
    status: "published",
  });
  const matches = rankKnowledgeDocuments(query, documents).slice(
    0,
    options.limit ?? 3,
  );
  if (matches.length === 0 || options.record === false) return matches;

  const db = getDatabase();
  await db.transaction(async (transaction) => {
    await transaction.insert(knowledgeRetrievals).values(
      matches.map(({ document, score }) => ({
        id: crypto.randomUUID(),
        organizationId,
        documentId: document.id,
        query,
        scoreBasisPoints: Math.round(score * 10_000),
        source: options.source,
      })),
    );

    for (const { document } of matches) {
      await transaction
        .update(knowledgeDocuments)
        .set({ hitCount: sql`${knowledgeDocuments.hitCount} + 1` })
        .where(
          and(
            eq(knowledgeDocuments.organizationId, organizationId),
            eq(knowledgeDocuments.id, document.id),
          ),
        );
    }
  });

  return matches.map((match) => ({
    ...match,
    document: { ...match.document, hitCount: match.document.hitCount + 1 },
  }));
}

export async function buildKnowledgeContext(
  organizationId: string,
  query: string,
) {
  if (!query.trim()) return "";
  const matches = await searchKnowledgeDocuments(organizationId, query, {
    source: "ai",
    limit: 3,
  });
  return formatKnowledgeContext(matches);
}
