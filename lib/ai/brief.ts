import "server-only";
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL_DEEP } from "./claude";
import { resolveCompany } from "./resolver";
import {
  WhatSchema,
  FoundersSchema,
  NewsSchema,
  CompetitorsSchema,
  type ResolvedCompany,
} from "./schemas";
import { kvGet, kvSet } from "@/lib/kv";

const PART_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const VC_PERSONA = `The reader is a partner at a growth-stage VC firm — sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, and hedging language. Cite every factual claim with a source URL. Today's date will be in the user message — use it to determine what counts as "recent". Never invent.`;

const STATIC_PROMPT = `You produce two sections of a pre-meeting investment brief — what the company does, and its competitive landscape — in one structured response.

${VC_PERSONA}

Work from your training data only. You have no web access in this turn. For each claim, cite a stable URL you remember (company site, well-known publication). If you cannot confidently recall a fact, omit it.

## what — what they do
- tagline: ~10-15 words. The one-line "what they are." Specific and concrete. Bad: 'AI-powered platform.' Good: 'Anthropic builds Claude, an AI assistant aimed at safety-focused enterprises.'
- summary: 2-3 sentences expanding the tagline — problem, customer, why it matters.
- howItWorks: 1-2 paragraphs on product mechanics, business model, key differentiator. Specific, not generic SaaS-speak.
- sources: every URL you cited (max 8).

## competitors — competitive landscape
- marketSummary: 1-2 sentences framing how competition actually plays out.
- competitors: 3-5 most directly competitive companies (same buyer, overlapping wedge). Order by how directly they compete, most relevant first.
  - name, slug (URL-safe lowercase kebab-case), domain (or null), tagline (~10-15 concrete words).
  - chips: EXACTLY four chips, one per dimension in order — product, pricing, perception, leadership.
    - dimension: 'product' | 'pricing' | 'perception' | 'leadership'
    - verdict: from THE SUBJECT COMPANY's perspective vs. THIS competitor — 'lead', 'lag', or 'equal'. Default to 'equal' when you cannot defend a clear lead/lag with a specific fact.
    - description: ONE sentence with concrete evidence — features, prices, named customers, named execs.
- sources: every URL cited (max 8).

Dimension semantics: product = capability/depth/moat; pricing = list price/packaging/free tier; perception = brand/analyst-press/dev-love; leadership = founder/exec calibre.`;

const FRESH_PROMPT = `You produce two sections of a pre-meeting investment brief — current founders & key leadership, and recent news — in one structured response.

${VC_PERSONA}

USE THE web_search TOOL ACTIVELY. Both sections need fresh data:
- founders: search to confirm the current C-suite, current titles, and verify LinkedIn URLs. Leadership changes frequently — your training is often months stale.
- news: you cannot rely on training for last-12-months news. Search recent funding rounds, exec moves, product launches, customer wins, regulatory events.

Budget your searches: 2-3 well-targeted queries should cover both sections. Never invent — omit a fact if you can't cite it.

## founders
- people: 1-6 entries. Prioritize founders and C-suite. Cap exec teams at 6.
  - name, role (e.g. 'Co-founder & CEO'), background (1-2 sentences leading with the most impressive prior experience).
  - notableSignal: optional standout — exit, recognized award, distinctive credential. null if nothing stands out.
  - linkedinUrl: only if verified via search. null if uncertain — do not guess handles.
- sources: every URL cited (max 8).

## news
Last 12 months, prioritized: funding > exec moves > major launches > customer wins > regulatory. Skip routine PR fluff.
- items: max 8, sorted newest first. For each: title, summary (1-2 sentences — the takeaway, not the lede), url, source (publication name like 'TechCrunch'), date (ISO 8601 YYYY-MM-DD if known else YYYY-MM), category (one of 'funding' | 'product' | 'people' | 'press' | 'other').`;

export const StaticPartSchema = z.object({
  what: WhatSchema,
  competitors: CompetitorsSchema,
});
export type StaticPart = z.infer<typeof StaticPartSchema>;

export const FreshPartSchema = z.object({
  founders: FoundersSchema,
  news: NewsSchema,
});
export type FreshPart = z.infer<typeof FreshPartSchema>;

async function callPart<T>(
  systemPrompt: string,
  schema: z.ZodType<T>,
  userPrompt: string,
  withSearch: boolean,
  hardTimeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), hardTimeoutMs);
  try {
    const response = await anthropic.messages.parse(
      {
        model: MODEL_DEEP,
        max_tokens: 4000,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        output_config: { format: zodOutputFormat(schema as never) },
        ...(withSearch
          ? {
              tools: [
                {
                  type: "web_search_20260209" as const,
                  name: "web_search",
                  max_uses: 3,
                },
              ],
            }
          : {}),
        messages: [{ role: "user", content: userPrompt }],
      },
      { signal: controller.signal },
    );
    if (!response.parsed_output) {
      throw new Error(
        `Part produced no parsed output (stop_reason=${response.stop_reason})`,
      );
    }
    return response.parsed_output as T;
  } finally {
    clearTimeout(timer);
  }
}

function userPromptFor(company: ResolvedCompany) {
  const today = new Date().toISOString().slice(0, 10);
  const id = `${company.name}${company.domain ? ` (${company.domain})` : ""}`;
  return `Subject company: ${id}. Today's date: ${today}.`;
}

const inflightStatic = new Map<string, Promise<StaticPart>>();
const inflightFresh = new Map<string, Promise<FreshPart>>();

export async function getStaticPart(slug: string): Promise<StaticPart> {
  const company = await resolveCompany(slug);
  const key = `brief:v3:static:${company.slug}`;

  const cached = await kvGet<StaticPart>(key);
  if (cached) return cached;

  const existing = inflightStatic.get(key);
  if (existing) return existing;

  const p = (async () => {
    const data = await callPart(
      STATIC_PROMPT,
      StaticPartSchema,
      userPromptFor(company),
      false,
      50_000,
    );
    await kvSet(key, data, PART_TTL_SECONDS);
    return data;
  })().finally(() => inflightStatic.delete(key));
  inflightStatic.set(key, p);
  return p;
}

export async function getFreshPart(slug: string): Promise<FreshPart> {
  const company = await resolveCompany(slug);
  const key = `brief:v3:fresh:${company.slug}`;

  const cached = await kvGet<FreshPart>(key);
  if (cached) return cached;

  const existing = inflightFresh.get(key);
  if (existing) return existing;

  const p = (async () => {
    const data = await callPart(
      FRESH_PROMPT,
      FreshPartSchema,
      userPromptFor(company),
      true,
      170_000,
    );
    await kvSet(key, data, PART_TTL_SECONDS);
    return data;
  })().finally(() => inflightFresh.delete(key));
  inflightFresh.set(key, p);
  return p;
}
