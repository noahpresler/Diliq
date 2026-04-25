import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL_DEEP } from "./claude";
import { resolveCompany } from "./resolver";
import { BriefSchema, type Brief, type ResolvedCompany } from "./schemas";
import { kvGet, kvSet } from "@/lib/kv";

const BRIEF_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const SYSTEM_PROMPT = `You produce a complete pre-meeting investment brief on a single company in one structured response.

The reader is a partner at a growth-stage VC firm — sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, and hedging language. Cite every factual claim with a source URL. Today's date will be in the user message — use it to determine what counts as "recent". Never invent.

Use the web_search tool actively for two sections specifically:
- **founders**: search to confirm the current C-suite, current titles, and LinkedIn URLs. Founders + key leadership change frequently — your training data is often months stale.
- **news**: you cannot rely on training for last-12-months news. Search for recent funding rounds, exec moves, product launches, customer wins, regulatory events.

For **what** and **competitors**, prefer training data — use search only if you genuinely don't recognize the company or want to verify a recent competitor entry.

Budget your searches: typically 1-2 well-targeted queries cover founders + news together. Never invent a fact you can't cite.

The brief has four sections — produce all four in a single structured output.

## what — what they do
- tagline: ~10-15 words. The one-line "what they are." Specific and concrete. Bad: 'AI-powered platform.' Good: 'Anthropic builds Claude, an AI assistant aimed at safety-focused enterprises.'
- summary: 2-3 sentences expanding the tagline — problem, customer, why it matters.
- howItWorks: 1-2 paragraphs on product mechanics, business model, and key differentiator. Specific, not generic SaaS-speak.
- sources: every URL you cited for this section (max 8).

## founders — founders & key leadership
- people: 1-6 entries. Prioritize founders and C-suite. Cap executive teams at 6.
- For each person:
  - name
  - role (e.g. 'Co-founder & CEO', 'CTO')
  - background: 1-2 sentences. Lead with the most impressive prior experience. Specific, not generic.
  - notableSignal: optional standout — exit, recognized award, distinctive credential. Use sparingly. null if nothing stands out.
  - linkedinUrl: their LinkedIn profile URL ONLY if you can verify it via search. null if not found or uncertain — do not guess handles.
- sources: every URL cited for this section (max 8).

## news — recent news
Last 12 months, prioritized: funding > exec moves > major launches > customer wins > regulatory. Skip routine PR fluff.
- items: max 8, sorted newest first. For each: title, summary (1-2 sentences — the takeaway, not the lede), url, source (publication name like 'TechCrunch'), date (ISO 8601 YYYY-MM-DD if known else YYYY-MM), category (one of 'funding' | 'product' | 'people' | 'press' | 'other').

## competitors — competitive landscape
- marketSummary: 1-2 sentences framing how competition actually plays out (e.g. "incumbents compete on enterprise distribution; new entrants on model quality").
- competitors: 3-5 most directly competitive companies (same buyer, overlapping wedge — skip adjacent or aspirational). Order by how directly they compete, most relevant first.
  - name, slug (URL-safe lowercase kebab-case), domain (or null), tagline (~10-15 concrete words).
  - chips: EXACTLY four chips, one per dimension in order — product, pricing, perception, leadership.
    - dimension: 'product' | 'pricing' | 'perception' | 'leadership'
    - verdict: from THE SUBJECT COMPANY's perspective vs. THIS competitor — 'lead' (subject ahead), 'lag' (competitor ahead), 'equal' (roughly comparable). Default to 'equal' when you cannot defend a clear lead/lag with a specific fact.
    - description: ONE sentence with concrete evidence — features, prices, named customers, named execs. No hedging buzzwords.
- sources: every URL cited for this section (max 8).

Dimension semantics:
- product: capability, depth, breadth, quality, technical moat
- pricing: list price, packaging, value-for-money, free tier, enterprise terms
- perception: brand strength, analyst/press positioning, developer/customer love, market share narrative
- leadership: founder/exec calibre, prior wins, depth of bench`;

const HARD_TIMEOUT_MS = 90_000;

async function generateBrief(company: ResolvedCompany): Promise<Brief> {
  const today = new Date().toISOString().slice(0, 10);
  const callOnce = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HARD_TIMEOUT_MS);
    try {
      return await anthropic.messages.parse(
        {
          model: MODEL_DEEP,
          max_tokens: 5000,
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          output_config: { format: zodOutputFormat(BriefSchema as never) },
          tools: [
            {
              type: "web_search_20260209",
              name: "web_search",
              max_uses: 2,
            },
          ],
          messages: [
            {
              role: "user",
              content: `Produce a complete pre-meeting investment brief on ${company.name}${company.domain ? ` (${company.domain})` : ""}. Today's date: ${today}.`,
            },
          ],
        },
        { signal: controller.signal },
      );
    } finally {
      clearTimeout(timer);
    }
  };

  const response = await callOnce();
  if (!response.parsed_output) {
    throw new Error(
      `Brief produced no parsed output (stop_reason=${response.stop_reason})`,
    );
  }
  return response.parsed_output;
}

const inflight = new Map<string, Promise<Brief>>();

export async function getBrief(slug: string): Promise<Brief> {
  const company = await resolveCompany(slug);
  const key = `brief:v2:${company.slug}`;

  const cached = await kvGet<Brief>(key);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    const brief = await generateBrief(company);
    await kvSet(key, brief, BRIEF_TTL_SECONDS);
    return brief;
  })().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
