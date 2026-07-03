import type { KnowledgeDocument, KnowledgeMatch } from "./types";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:\s]/g, "")
    .trim();
}

function uniqueCharacters(value: string) {
  return Array.from(new Set(normalize(value).split(""))).filter(Boolean);
}

function bigrams(value: string) {
  const normalized = normalize(value);
  return Array.from(
    new Set(
      Array.from({ length: Math.max(0, normalized.length - 1) }, (_, index) =>
        normalized.slice(index, index + 2),
      ),
    ),
  );
}

export function rankKnowledgeDocuments(
  query: string,
  documents: KnowledgeDocument[],
): KnowledgeMatch[] {
  const normalizedQuery = normalize(query);
  const queryCharacters = uniqueCharacters(query);
  const queryBigrams = bigrams(query);
  if (!normalizedQuery || queryCharacters.length === 0) return [];

  return documents
    .filter((document) => document.status === "published")
    .map((document) => {
      const normalizedTitle = normalize(document.title);
      const corpus = normalize(
        `${document.title}${document.category}${document.content}`,
      );
      const characterRatio =
        queryCharacters.filter((character) => corpus.includes(character))
          .length / queryCharacters.length;
      const bigramRatio =
        queryBigrams.length > 0
          ? queryBigrams.filter((bigram) => corpus.includes(bigram)).length /
            queryBigrams.length
          : 0;
      const titleRatio =
        queryCharacters.filter((character) =>
          normalizedTitle.includes(character),
        ).length / queryCharacters.length;
      const titleBigramMatches = queryBigrams.filter((bigram) =>
        normalizedTitle.includes(bigram),
      ).length;
      const titleKeywordBonus = Math.min(0.24, titleBigramMatches * 0.16);
      const phraseBonus = corpus.includes(normalizedQuery) ? 0.2 : 0;
      const score = Math.min(
        0.99,
        characterRatio * 0.42 +
          bigramRatio * 0.4 +
          titleRatio * 0.18 +
          titleKeywordBonus +
          phraseBonus,
      );

      return { document, score };
    })
    .filter((match) => match.score >= 0.2)
    .sort((a, b) => b.score - a.score);
}

export function formatKnowledgeContext(matches: KnowledgeMatch[]) {
  return matches
    .map(
      ({ document }, index) =>
        `[资料 ${index + 1}] ${document.title}\n${document.content}`,
    )
    .join("\n\n");
}
