import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL_DEEP } from "./claude";
import { resolveCompany } from "./resolver";
import {
  WhatSchema,
  FoundersSchema,
  NewsSchema,
  CompetitorsSchema,
  type WhatSection,
  type FoundersSection,
  type NewsSection,
  type CompetitorsSection,
  type ResolvedCompany,
} from "./schemas";

const SECTION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const VC_PERSONA = `The reader is a partner at a growth-stage VC firm — sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, and hedging language. Cite every factual claim. Today's date will be provided in the user message — use it to determine what counts as "recent".`;

const WHAT_SYSTEM = `You research what a company does for a venture investor's pre-meeting brief.

${VC_PERSONA}

Use web search to gather current, authoritative information.

Output structure:
- tagline: ~10-15 words. The one-line "what they are." Specific and concrete.
- summary: 2-3 sentences. The tagline plus context — problem, customer, why this matters.
- howItWorks: 1-2 paragraphs on product mechanics, business model, key differentiator.
- sources: every URL you cited (max 8).

Never invent. If you can't verify something via search, omit it.`;

const FOUNDERS_SYSTEM = `You research a company's founders and key leadership for a venture investor's pre-meeting brief.

${VC_PERSONA}

Use web search. Prioritize founders and C-suite. For executive teams, cap at 6 people.

For each person:
- name
- role: e.g. 'Co-founder & CEO', 'CTO'
- background: 1-2 sentences. Lead with their most impressive prior experience. Examples: "Previously led payments infrastructure at Stripe (engineering #15)" or "Y Combinator partner 2018-2022, prior founder of TextIO".
- notableSignal: optional. A standout fact — exit, recognized award, distinctive credential. Use sparingly. null if nothing stands out.
- linkedinUrl: their LinkedIn profile URL if you can verify it via search (e.g. 'https://www.linkedin.com/in/handle'). null if not found or uncertain — do not guess handles.

Never invent a credential, prior employer, or LinkedIn URL.`;

const NEWS_SYSTEM = `You research recent news about a company for a venture investor's pre-meeting brief.

${VC_PERSONA}

Use web search. Prioritize the last 12 months. Skip routine PR fluff.

Prioritize, in order:
1. Funding announcements (round size, lead, valuation if known)
2. Executive hires/departures
3. Major product launches
4. Notable customer wins
5. Regulatory or legal events

For each item (max 8):
- title: original headline or accurate paraphrase
- summary: 1-2 sentences. The takeaway, not the lede.
- url: the actual article URL
- source: publication name (e.g. 'TechCrunch', 'The Information', 'Bloomberg')
- date: ISO 8601 (YYYY-MM-DD) if known, otherwise YYYY-MM
- category: one of 'funding', 'product', 'people', 'press', 'other'

Sort newest first. Never invent.`;

const COMPETITORS_SYSTEM = `You map a company's direct competitive landscape for a venture investor's pre-meeting brief.

${VC_PERSONA}

Use web search. Identify the 3–5 most directly competitive companies — same buyer, overlapping product wedge. Skip adjacent or aspirational comps. Order by how directly they compete, most relevant first.

For each competitor:
- name: canonical name
- slug: URL-safe lowercase kebab-case (the user can navigate /c/<slug>)
- domain: primary domain (e.g. 'openai.com'), or null if uncertain
- tagline: ~10–15 words, concrete one-liner
- chips: EXACTLY four chips, one per dimension in this order — product, pricing, perception, leadership.

For each chip:
- dimension: 'product' | 'pricing' | 'perception' | 'leadership'
- verdict: from the SUBJECT company's perspective vs. THIS competitor.
  - 'lead'  → subject is meaningfully ahead on this axis
  - 'lag'   → competitor is meaningfully ahead on this axis
  - 'equal' → roughly comparable; use when there's no honest edge either way
- description: ONE sentence with concrete evidence. Reference real features, real prices, named customers, named execs, recognized awards. No hedging buzzwords ('innovative', 'best-in-class').

How to think about each dimension:
- product: capability, depth, breadth, quality, differentiation, technical moat
- pricing: list price, packaging, value-for-money, free tier, enterprise contract terms
- perception: brand strength, analyst/press positioning, developer/customer love, market share narrative
- leadership: founder/exec calibre, prior wins, recognized depth of bench

Default to 'equal' when you cannot defend a clear lead/lag with a specific fact. Better honest than puffy. Never invent customers, prices, or executives.

Also output marketSummary: 1–2 sentences framing how competition actually plays out (e.g. "incumbents compete on enterprise distribution; new entrants on model quality").`;

interface SectionSpec<T> {
  id: string;
  schema: z.ZodType<T>;
  systemPrompt: string;
  userPrompt(company: ResolvedCompany, today: string): string;
}

const WHAT_SPEC: SectionSpec<WhatSection> = {
  id: "what",
  schema: WhatSchema,
  systemPrompt: WHAT_SYSTEM,
  userPrompt: (c, today) =>
    `Research what ${c.name}${c.domain ? ` (${c.domain})` : ""} does. Today's date: ${today}.`,
};

const FOUNDERS_SPEC: SectionSpec<FoundersSection> = {
  id: "founders",
  schema: FoundersSchema,
  systemPrompt: FOUNDERS_SYSTEM,
  userPrompt: (c, today) =>
    `Research the founders and key leadership of ${c.name}${c.domain ? ` (${c.domain})` : ""}. Today's date: ${today}.`,
};

const NEWS_SPEC: SectionSpec<NewsSection> = {
  id: "news",
  schema: NewsSchema,
  systemPrompt: NEWS_SYSTEM,
  userPrompt: (c, today) =>
    `Research recent news (last 12 months) about ${c.name}${c.domain ? ` (${c.domain})` : ""}. Today's date: ${today}.`,
};

const COMPETITORS_SPEC: SectionSpec<CompetitorsSection> = {
  id: "competitors",
  schema: CompetitorsSchema,
  systemPrompt: COMPETITORS_SYSTEM,
  userPrompt: (c, today) =>
    `Identify and compare the 3-5 most direct competitors of ${c.name}${c.domain ? ` (${c.domain})` : ""}. For each, deliver the four-dimension chip comparison from ${c.name}'s perspective. Today's date: ${today}.`,
};

function isTransient(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(429|529|502|503|504)\b|overloaded|rate.?limit|ECONNRESET|ETIMEDOUT|fetch failed/i.test(
    msg,
  );
}

async function runSection<T>(
  spec: SectionSpec<T>,
  company: ResolvedCompany,
): Promise<T> {
  const today = new Date().toISOString().slice(0, 10);
  const callOnce = () =>
    anthropic.messages.parse({
    model: MODEL_DEEP,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: spec.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: { format: zodOutputFormat(spec.schema as never) },
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 5,
      },
    ],
    messages: [{ role: "user", content: spec.userPrompt(company, today) }],
  });

  let response: Awaited<ReturnType<typeof callOnce>> | undefined;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await callOnce();
      break;
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  if (!response) throw lastErr ?? new Error("no response");
  if (!response.parsed_output) {
    throw new Error(
      `Section "${spec.id}" produced no parsed output (stop_reason=${response.stop_reason})`,
    );
  }
  return response.parsed_output;
}

const cachedWhat = unstable_cache(
  async (slug: string) => {
    const company = await resolveCompany(slug);
    return runSection(WHAT_SPEC, company);
  },
  ["section-what"],
  { revalidate: SECTION_TTL_SECONDS },
);

const cachedFounders = unstable_cache(
  async (slug: string) => {
    const company = await resolveCompany(slug);
    return runSection(FOUNDERS_SPEC, company);
  },
  ["section-founders-v2"],
  { revalidate: SECTION_TTL_SECONDS },
);

const cachedNews = unstable_cache(
  async (slug: string) => {
    const company = await resolveCompany(slug);
    return runSection(NEWS_SPEC, company);
  },
  ["section-news"],
  { revalidate: SECTION_TTL_SECONDS },
);

const cachedCompetitors = unstable_cache(
  async (slug: string) => {
    const company = await resolveCompany(slug);
    return runSection(COMPETITORS_SPEC, company);
  },
  ["section-competitors"],
  { revalidate: SECTION_TTL_SECONDS },
);

export const runWhat = (slug: string) => cachedWhat(slug);
export const runFounders = (slug: string) => cachedFounders(slug);
export const runNews = (slug: string) => cachedNews(slug);
export const runCompetitors = (slug: string) => cachedCompetitors(slug);
