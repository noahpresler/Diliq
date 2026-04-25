import { z } from "zod";

export const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
});
export type Source = z.infer<typeof SourceSchema>;

export const ResolvedCompanySchema = z.object({
  name: z.string().describe("Canonical company name as commonly written"),
  slug: z
    .string()
    .describe(
      "URL-safe lowercase kebab-case slug, e.g. 'anthropic' or 'mercury-tech'",
    ),
  domain: z
    .string()
    .nullable()
    .describe("Primary domain like 'anthropic.com', or null if unknown"),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe(
      "high if it's a well-known company, medium if reasonably likely, low if guessing",
    ),
});
export type ResolvedCompany = z.infer<typeof ResolvedCompanySchema>;

export const WhatSchema = z.object({
  tagline: z
    .string()
    .describe(
      "One concrete line, ~10-15 words. NOT buzzwordy. Bad: 'AI-powered platform.' Good: 'Anthropic builds Claude, an AI assistant aimed at safety-focused enterprises.'",
    ),
  summary: z
    .string()
    .describe(
      "2-3 sentences expanding the tagline — what problem they solve, who their customer is",
    ),
  howItWorks: z
    .string()
    .describe(
      "1-2 paragraphs on product mechanics, business model, and key differentiator. Specific, not generic SaaS-speak.",
    ),
  sources: z.array(SourceSchema).max(8),
});
export type WhatSection = z.infer<typeof WhatSchema>;

export const PersonSchema = z.object({
  name: z.string(),
  role: z
    .string()
    .describe("e.g. 'Co-founder & CEO', 'CTO', 'Head of Engineering'"),
  background: z
    .string()
    .describe(
      "1-2 sentences. Lead with the most impressive prior experience. Specific, not generic.",
    ),
  notableSignal: z
    .string()
    .nullable()
    .describe(
      "Optional standout: a notable exit, recognized award, distinctive credential. Use sparingly. null if nothing stands out.",
    ),
});
export type Person = z.infer<typeof PersonSchema>;

export const FoundersSchema = z.object({
  people: z.array(PersonSchema).min(1).max(6),
  sources: z.array(SourceSchema).max(8),
});
export type FoundersSection = z.infer<typeof FoundersSchema>;

export const NewsCategoryEnum = z.enum([
  "funding",
  "product",
  "people",
  "press",
  "other",
]);
export type NewsCategory = z.infer<typeof NewsCategoryEnum>;

export const NewsItemSchema = z.object({
  title: z.string(),
  summary: z
    .string()
    .describe("1-2 sentence takeaway — the so-what, not the lede"),
  url: z.string().url(),
  source: z
    .string()
    .describe("Publication name, e.g. 'TechCrunch', 'Bloomberg'"),
  date: z
    .string()
    .describe(
      "Publication date, ISO 8601 (YYYY-MM-DD) preferred, otherwise YYYY-MM",
    ),
  category: NewsCategoryEnum,
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const NewsSchema = z.object({
  items: z.array(NewsItemSchema).max(8),
});
export type NewsSection = z.infer<typeof NewsSchema>;
