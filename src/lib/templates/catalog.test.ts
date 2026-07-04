import { describe, expect, it } from "vitest";

import { industryTemplates } from "@/lib/templates/catalog";

describe("industry template catalog", () => {
  it("contains distinct, installable templates", () => {
    expect(industryTemplates.length).toBeGreaterThanOrEqual(8);
    expect(new Set(industryTemplates.map((template) => template.id)).size).toBe(
      industryTemplates.length,
    );
    for (const template of industryTemplates) {
      expect(template.documents.length).toBeGreaterThanOrEqual(3);
      expect(
        new Set(template.documents.map((document) => document.slug)).size,
      ).toBe(template.documents.length);
      expect(template.sampleQuestions.length).toBeGreaterThanOrEqual(3);
    }
  });
});
