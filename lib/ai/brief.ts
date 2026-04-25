import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL_DEEP } from "./claude";
import { resolveCompany } from "./resolver";
import { BriefSchema, type Brief, type ResolvedCompany } from "./schemas";
import { kvGet, kvSet } from "@/lib/kv";

const BRIEF_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const SYSTEM_PROMPT = `You produce a complete pre-meeting investment brief on a single company in one structured response.

The reader is a partner at a growth-stage VC firm — sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, and hedging language. Cite every factual claim with a source URL. Today's date will be in the user message — use it to determine what counts as "recent". Never invent.

Work from your training data only. You have no web access in this turn. For each claim, cite a stable URL you remember (company site, well-known publication). If you cannot confidently recall a fact, omit it — never fabricate. For the news section, only include events you confidently recall from training; if you can't, return an empty items array.

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

function isTransient(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  // 408 = client-set timeout from the SDK; we want to retry once on those too.
  return /\b(408|429|529|502|503|504)\b|overloaded|rate.?limit|ECONNRESET|ETIMEDOUT|fetch failed|timed?\s*out/i.test(
    msg,
  );
}

async function generateBrief(company: ResolvedCompany): Promise<Brief> {
  const today = new Date().toISOString().slice(0, 10);
  const callOnce = () =>
    anthropic.messages.parse(
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
        messages: [
          {
            role: "user",
            content: `Produce a complete pre-meeting investment brief on ${company.name}${company.domain ? ` (${company.domain})` : ""}. Today's date: ${today}.`,
          },
        ],
      },
      { timeout: 90_000 },
    );

  let response: Awaited<ReturnType<typeof callOnce>> | undefined;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await callOnce();
      break;
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === 1) throw err;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  if (!response) throw lastErr ?? new Error("no response");
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
  const key = `brief:${company.slug}`;

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
