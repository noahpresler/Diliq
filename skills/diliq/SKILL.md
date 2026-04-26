---
name: diliq
description: Generate a pre-meeting VC investment brief on a single company, rendered as an interactive React artifact in the Diliq design language. Use when the user asks for a brief, deep-dive, due-diligence summary, company research, or pre-meeting prep on a named company (e.g. "brief me on Anthropic", "/diliq Stripe", "what should I know before meeting Mercury", "research Brex for me"). Produces a single-file React component with four sections — what they do, founders & key people, recent news, competitive landscape — styled with Tailwind in a dark, glowy aesthetic. Best for VC partners, investors, BD, or anyone preparing for a high-stakes meeting with a company.
---

# Diliq — VC Pre-Meeting Brief (Interactive)

You produce a pre-meeting investment brief on a single company for a partner at a growth-stage venture firm. The output is a **React component artifact** rendered live in the Claude side panel, not markdown.

## Persona

The reader is sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, and hedging language. Cite every factual claim with a source URL. Never invent — if you can't verify a fact, omit it.

## Workflow

1. **Resolve the company.** If the user named one company clearly, use it. If ambiguous (e.g. "Apollo" — Apollo.io, Apollo GraphQL, Apollo PE), ask one short clarifying question OR pick the most prominent and note your assumption inline.

2. **Research with web_search.** 3–6 well-targeted queries should cover:
   - Current C-suite + founder backgrounds (titles change often; don't trust training)
   - Last 12 months of news (funding, exec moves, launches, customer wins, regulatory)
   - Current competitor lineup
   - Anything you don't already know confidently

3. **Produce a single React component artifact** (`type: application/vnd.ant.react`) with the data embedded inline. No external fetches. No file imports beyond `react` and `lucide-react`.

## Output: the React artifact

### Design language

- **Canvas**: `bg-[#0A0A0F]` near-black, full height.
- **Aurora**: a soft radial gradient at the top using violet `#8B5CF6` → cyan `#22D3EE`. `pointer-events-none`, blurred, low opacity.
- **Type**: tight tracking on display sizes, generous line-height on body. Use system font stack (Tailwind default).
- **Cards**: `rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-7`. On hover: lift opacity to `border-white/[0.14]` with a faint inner glow.
- **Accent**: violet→cyan gradient for the company name; amber `#F59E0B` reserved for funding / "new" signal moments only.
- **Text scale**: section titles are `text-[11px] font-medium uppercase tracking-[0.2em] text-white/40`. Primary body is `text-white/85`, secondary `text-white/65`, tertiary `text-white/45`.
- **Icons**: from `lucide-react`. Use `ExternalLink`, `ArrowUpRight`, `ArrowDownRight`, `Minus`, `ArrowRight` for navigation/verdict cues.

### Component skeleton

Use this as the structural starting point. Fill in `BRIEF` with the researched data. Keep the styling close to this — the user is paying for the design feel, not just the facts.

```jsx
import { ExternalLink, ArrowUpRight, ArrowDownRight, Minus, Linkedin } from "lucide-react";

const BRIEF = {
  company: {
    name: "Acme",
    domain: "acme.com",
    asOf: "2026-04-25",
    note: null, // optional disambiguation note like "Apollo (Apollo.io — sales engagement); chose this over Apollo GraphQL given context"
  },
  what: {
    tagline: "10-15 words; concrete; what they ARE not what they 'enable'",
    summary: "2-3 sentences expanding the tagline — problem, customer, why it matters.",
    howItWorks: "1-2 paragraphs on product mechanics, business model, key differentiator.",
    sources: [{ url: "https://...", title: "..." }],
  },
  founders: [
    {
      name: "Jane Doe",
      role: "Co-founder & CEO",
      background: "Lead with the most impressive prior experience — concrete.",
      notableSignal: "Optional standout — exit, recognized award. null if nothing.",
      linkedinUrl: "https://www.linkedin.com/in/janedoe", // verified, or null
    },
  ],
  news: [
    {
      title: "Headline or accurate paraphrase",
      summary: "1-2 sentence takeaway — the so-what.",
      url: "https://...",
      source: "TechCrunch",
      date: "2026-03-12",
      category: "funding", // 'funding' | 'product' | 'people' | 'press' | 'other'
    },
  ],
  competitors: {
    marketSummary: "1-2 sentences on how competition actually plays out.",
    list: [
      {
        name: "Competitor Co",
        domain: "competitor.com",
        tagline: "10-15 word concrete tagline",
        chips: [
          { dimension: "product",    verdict: "lead",  description: "specific evidence" },
          { dimension: "pricing",    verdict: "lag",   description: "specific evidence" },
          { dimension: "perception", verdict: "equal", description: "specific evidence" },
          { dimension: "leadership", verdict: "lead",  description: "specific evidence" },
        ],
      },
    ],
    sources: [{ url: "https://...", title: "..." }],
  },
};

const CATEGORY_STYLES = {
  funding: "border-amber-300/30 bg-amber-300/[0.08] text-amber-200",
  product: "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-200",
  people: "border-violet-300/30 bg-violet-300/[0.08] text-violet-200",
  press: "border-white/15 bg-white/[0.04] text-white/75",
  other: "border-white/10 bg-white/[0.02] text-white/55",
};

const VERDICT = {
  lead:  { chip: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200", label: "Leads",  Icon: ArrowUpRight },
  lag:   { chip: "border-rose-400/30 bg-rose-400/[0.08] text-rose-200",          label: "Lags",   Icon: ArrowDownRight },
  equal: { chip: "border-white/15 bg-white/[0.04] text-white/65",                 label: "On par", Icon: Minus },
};

const DIMENSION_LABEL = { product: "Product", pricing: "Pricing", perception: "Perception", leadership: "Leadership" };

function initialsOf(name) {
  return name.split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() ?? "").join("");
}

function fmtDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (!m) return s;
  return d ? `${months[m-1]} ${d}, ${y}` : `${months[m-1]} ${y}`;
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-7 transition-colors hover:border-white/[0.14] hover:bg-white/[0.025]">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function SourceList({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-6 border-t border-white/[0.06] pt-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">Sources</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {sources.map((s, i) => (
          <li key={i}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 transition hover:text-white/80">
              {s.title || hostOf(s.url)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Brief() {
  const { company, what, founders, news, competitors } = BRIEF;
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0F] px-6 py-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(139,92,246,0.18), transparent 70%), radial-gradient(ellipse 50% 50% at 80% 10%, rgba(34,211,238,0.12), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        {/* Hero */}
        <header className="mt-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Pre-meeting brief</p>
          <h1 className="mt-3 bg-gradient-to-r from-violet-300 via-white to-cyan-200 bg-clip-text text-5xl font-medium tracking-tight text-transparent sm:text-6xl">
            {company.name}
          </h1>
          {company.domain && <p className="mt-2 font-mono text-sm text-white/40">{company.domain}</p>}
          <p className="mt-2 text-xs text-white/35">as of {fmtDate(company.asOf)}</p>
          {company.note && <p className="mt-3 text-sm text-white/55">{company.note}</p>}
        </header>

        <section className="mt-10 grid gap-5">
          {/* What */}
          <Card title="What they do">
            <p className="text-2xl font-medium leading-snug tracking-tight text-white">{what.tagline}</p>
            <p className="mt-5 text-base leading-relaxed text-white/80">{what.summary}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">{what.howItWorks}</p>
            <SourceList sources={what.sources} />
          </Card>

          {/* Founders */}
          <Card title="Founders & key people">
            <ul className="divide-y divide-white/[0.06]">
              {founders.map((p, i) => (
                <li key={i} className="grid grid-cols-1 gap-x-6 gap-y-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(220px,1fr)_2fr]">
                  <div className="flex items-center gap-3">
                    <div aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-400/20 text-xs font-medium text-white/85">
                      {initialsOf(p.name) || "·"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-medium text-white">{p.name}</p>
                        {p.linkedinUrl && (
                          <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on LinkedIn`} className="shrink-0 text-white/40 transition-colors hover:text-[#0a66c2]">
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="truncate text-sm text-white/50">{p.role}</p>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-white/75">
                    {p.background}
                    {p.notableSignal && (
                      <span className="mt-2 block">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-2.5 py-0.5 text-[11px] text-amber-200/95">
                          <span className="h-1 w-1 rounded-full bg-amber-300 shadow-[0_0_6px_rgb(245,158,11)]" />
                          {p.notableSignal}
                        </span>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* News */}
          <Card title="Recent news">
            {news.length === 0 ? (
              <p className="text-sm text-white/55">No notable news found in the last 12 months.</p>
            ) : (
              <ul className="-mx-2 divide-y divide-white/[0.06]">
                {news.map((item, i) => (
                  <li key={i} className="rounded-lg px-2 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-white/[0.015]">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                      <span className="tabular-nums">{fmtDate(item.date)}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${CATEGORY_STYLES[item.category]}`}>
                        {item.category}
                      </span>
                      <span className="text-white/25">·</span>
                      <span className="text-white/55">{item.source}</span>
                      {hostOf(item.url) && <span className="text-white/30">{hostOf(item.url)}</span>}
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-start gap-1.5 text-base font-medium leading-snug text-white transition hover:text-white/85">
                      {item.title}
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 opacity-40" />
                    </a>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">{item.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Competitors */}
          <Card title="Competitive landscape">
            <p className="text-sm leading-relaxed text-white/70">{competitors.marketSummary}</p>
            <ul className="mt-6 space-y-4">
              {competitors.list.map((c, i) => (
                <li key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.025]">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-base font-medium text-white">{c.name}</p>
                    {c.domain && <span className="font-mono text-[11px] text-white/30">{c.domain}</span>}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{c.tagline}</p>
                  <dl className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {c.chips.map((chip, j) => {
                      const v = VERDICT[chip.verdict];
                      return (
                        <div key={j} className="rounded-lg border border-white/[0.05] bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">{DIMENSION_LABEL[chip.dimension]}</dt>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${v.chip}`}>
                              <v.Icon className="h-3 w-3" />
                              {v.label}
                            </span>
                          </div>
                          <dd className="mt-2 text-xs leading-relaxed text-white/70">{chip.description}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </li>
              ))}
            </ul>
            <SourceList sources={competitors.sources} />
          </Card>
        </section>

        <footer className="mt-16 border-t border-white/[0.06] pt-6 text-center text-xs text-white/30">
          Generated with web search · cited where possible · always verify facts before acting
        </footer>
      </div>
    </main>
  );
}
```

### Filling in the data

Replace `BRIEF` with the real researched data. Specifically:
- `company.name`: canonical name
- `company.domain`: primary domain (or null)
- `company.asOf`: today's date YYYY-MM-DD
- `company.note`: optional 1-line disambiguation if needed; null otherwise
- `what.{tagline, summary, howItWorks}`: per the persona section above
- `what.sources`: every URL you cited for "what they do" (max 8)
- `founders[]`: 1–6 people. `notableSignal` and `linkedinUrl` are optional (null if unknown — don't guess LinkedIn handles)
- `news[]`: max 8, newest first, prioritized funding > exec > launches > customer > regulatory. Skip PR fluff. Categories: 'funding' | 'product' | 'people' | 'press' | 'other'
- `competitors.list[]`: 3–5 most directly competitive. Each gets exactly four chips in dimension order: product, pricing, perception, leadership. Verdicts from the SUBJECT COMPANY's perspective: 'lead' / 'lag' / 'equal'. Default to 'equal' when you can't defend a clear lead/lag with a specific fact.

If a section legitimately has nothing — e.g. an early-stage company with no public news — pass an empty array (`news: []`). The component already handles empty news gracefully. For founders, if you genuinely can't find anyone, leave the array empty rather than fabricating.

## Guardrails

- **Never invent**: a credential, prior employer, funding number, customer name, LinkedIn URL, or competitor that doesn't exist.
- If uncertain about a fact, omit it. If sources disagree, surface it in the relevant `description`.
- Date-stamp via `company.asOf` so the reader knows freshness.
- For non-public or pre-seed companies where most data is unknown: produce the artifact with empty arrays where appropriate, plus a one-line `company.note` like "Pre-seed; most public data limited — see What we couldn't verify section." (You can add your own extra section if helpful, but match the styling.)
- The component must be a single self-contained file. No imports beyond `react` and `lucide-react`. No external fetches.

## Follow-up mode

After producing the artifact, the user may ask follow-ups about that company — "what would you push back on?", "draft 5 questions for the CEO", "what's their gross margin profile likely to be?", "compare them to <competitor>", "what's the bear case?". Answer concisely in chat (don't regenerate the artifact unless the user asks for an updated brief). For questions that need fresh data, search again.

If the user names a *new* company in a follow-up ("now do Mercury"), produce a fresh full artifact.

## Fallback

If for any reason React artifacts aren't supported in the current Claude environment (e.g. the artifact tool is disabled), fall back to producing the brief as inline markdown using the same four-section structure and the same content guidelines. Tell the user once that the rich artifact wasn't available so they know what they're missing.
