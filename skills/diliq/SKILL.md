---
name: diliq
description: Generate a pre-meeting VC investment brief on a single company, rendered as an interactive React artifact in the Diliq design language. Use when the user asks for a brief, deep-dive, due-diligence summary, company research, or pre-meeting prep on a named company (e.g. "brief me on Anthropic", "/diliq Stripe", "what should I know before meeting Mercury", "research Brex for me"). Produces a single-file React component with six sections — what they do, founders & key people, recent news, competitive landscape, investment thesis (bull / bear / risks), diligence priorities — styled with Tailwind in a dark, glowy aesthetic with cursor-tracking glow, staggered entry animations, and a live "as of" pulse. Best for VC partners, investors, BD, or anyone preparing for a high-stakes meeting with a company.
---

# Diliq — VC Pre-Meeting Brief (Interactive)

You produce a pre-meeting investment brief on a single company for a partner at a growth-stage venture firm. The output is a **React component artifact** rendered live in the Claude side panel, not markdown.

## Persona

The reader is sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, hedging language. Cite every factual claim with a source URL. Never invent — if you can't verify a fact, omit it.

## Workflow

1. **Resolve the company.** If the user named one company clearly, use it. If ambiguous (e.g. "Apollo" — Apollo.io, Apollo GraphQL, Apollo PE), ask one short clarifying question OR pick the most prominent and note your assumption inline.

2. **Research with web_search.** 4–7 well-targeted queries should cover:
   - Current C-suite + founder backgrounds (titles change often; don't trust training)
   - Last 12 months of news (funding, exec moves, launches, customer wins, regulatory)
   - Current competitor lineup
   - Material thesis facts (TAM, growth rate, differentiation, unit economics if disclosed)
   - Anything you don't already know confidently

3. **Synthesize the thesis.** After research, form your own bull case, bear case, key risks, and the highest-leverage diligence questions. Don't copy talking points — write the partner's-eye view.

4. **Produce a single React component artifact** (`type: application/vnd.ant.react`) with the data embedded inline. No external fetches. No file imports beyond `react` and `lucide-react`.

## Output: the React artifact

### Design language

- **Canvas**: pure `bg-black` with explicit `min-h-screen`. The component must be visually airtight even if rendered against a white parent — no transparency leaks.
- **Aurora**: soft radial gradient at the top using violet `#8B5CF6` → cyan `#22D3EE`. `pointer-events-none`, blurred, low opacity.
- **Cards**: `rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur` with a cursor-tracking radial glow (see GlowCard pattern below) and a subtle top-edge highlight that fades in on hover.
- **Entry animation**: cards stagger in with a 8px lift + fade, eased with `cubic-bezier(0.22,1,0.36,1)`, ~80ms between each.
- **Hero**: company favicon (use `https://www.google.com/s2/favicons?domain=DOMAIN&sz=128`) with a soft violet/cyan halo behind it; gradient text on the company name; live "as of" badge with a pulsing violet dot.
- **Accent palette**:
  - Primary: violet `#8B5CF6` → cyan `#22D3EE` gradient
  - Funding / "new" signal: amber `#F59E0B` (sparingly)
  - Bull / positive: emerald `text-emerald-200`
  - Bear / negative: rose `text-rose-200`
  - Risk: amber `text-amber-200`
- **Type scale**: section titles `text-[11px] font-medium uppercase tracking-[0.2em] text-white/40`. Primary body `text-white/85`, secondary `text-white/65`, tertiary `text-white/45`. Display headlines tight tracking, large clamp.
- **Icons**: `lucide-react`. Use `ExternalLink`, `ArrowUpRight`, `ArrowDownRight`, `Minus`, `Linkedin`, `TrendingUp`, `TrendingDown`, `AlertTriangle`, `Search`.

### Component skeleton

This is the structural starting point — keep all the styling, animation, and helper code intact. Only replace the `BRIEF` constant with researched data. The aesthetic is a feature; do not strip it.

```jsx
import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Linkedin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
} from "lucide-react";

const BRIEF = {
  company: {
    name: "Acme",
    domain: "acme.com",
    asOf: "2026-04-25",
    note: null, // optional disambiguation note, null otherwise
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
  thesis: {
    bullCase: [
      "3-5 punchy bullets. Each one a specific reason the deal could 10x. Concrete metric, customer, or moat — not 'large TAM'.",
    ],
    bearCase: [
      "3-5 punchy bullets. The pushback a sharp partner would actually voice. Specific. Naming names if relevant.",
    ],
    keyRisks: [
      "3-5 bullets. Distinct from bear case — these are operational, regulatory, market, or execution risks that could materialize regardless of thesis.",
    ],
  },
  diligence: {
    priorities: [
      // 4-6 entries. Each a specific area to harden in DD with one or two
      // example questions or asks the partner would put on the team.
      {
        area: "Net revenue retention",
        why: "Public commentary suggests strength but no disclosed number; gross retention vs net unclear.",
        asks: [
          "Cohort NRR by segment for last 8 quarters",
          "Top-10 customer concentration and churn risk in those accounts",
        ],
      },
    ],
  },
};

// ============================================================================
// Style maps + helpers
// ============================================================================

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

// ============================================================================
// Animation primitives (no framer-motion required)
// ============================================================================

const ENTRY_KEYFRAMES = `
  @keyframes diliqFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes diliqFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes diliqShimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <div
      className={className}
      style={{
        animation: "diliqFadeUp 520ms cubic-bezier(0.22,1,0.36,1) both",
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Card with cursor-following violet/cyan glow + top edge highlight on hover
function GlowCard({ title, accent, children, delay = 0 }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: -200, y: -200, active: false });
  return (
    <FadeUp delay={delay}>
      <div
        ref={ref}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
        }}
        onMouseLeave={() => setPos((p) => ({ ...p, active: false }))}
        className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur transition-colors duration-300 hover:border-white/[0.16]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: pos.active ? 1 : 0,
            background: `radial-gradient(380px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.14), rgba(34,211,238,0.06) 35%, transparent 60%)`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative p-6 sm:p-7">
          <div className="flex items-center gap-2">
            {accent && <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />}
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">{title}</h2>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </FadeUp>
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
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 transition hover:text-white/85">
              {s.title || hostOf(s.url)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BulletList({ items, accentColor, Icon }) {
  return (
    <ul className="space-y-2.5">
      {items.map((b, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/80">
          {Icon && (
            <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
          )}
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// Main component
// ============================================================================

export default function Brief() {
  const { company, what, founders, news, competitors, thesis, diligence } = BRIEF;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white antialiased">
      <style>{ENTRY_KEYFRAMES}</style>

      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(139,92,246,0.20), transparent 70%), radial-gradient(ellipse 50% 50% at 80% 10%, rgba(34,211,238,0.14), transparent 70%)",
          animation: "diliqFadeIn 1200ms ease-out both",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Hero */}
        <FadeUp>
          <header className="relative flex flex-col gap-6 border-b border-white/[0.08] pb-10 pt-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative h-16 w-16 shrink-0">
                <div
                  aria-hidden
                  className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/30 to-cyan-400/20 opacity-50 blur-xl"
                />
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  {company.domain ? (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-500/30 to-cyan-400/30 text-xl font-medium text-white">
                      {initialsOf(company.name) || "·"}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
                  Pre-meeting brief
                </p>
                <h1 className="mt-1.5 bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-4xl font-medium tracking-tight text-transparent sm:text-6xl">
                  {company.name}
                </h1>
                {company.domain && (
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white"
                  >
                    {company.domain}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {company.note && (
                  <p className="mt-3 max-w-prose text-sm text-white/55">{company.note}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[11px] text-white/55 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/60 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
                </span>
                as of {fmtDate(company.asOf)}
              </span>
            </div>
          </header>
        </FadeUp>

        <section className="mt-10 grid gap-5">
          {/* What */}
          <GlowCard title="What they do" delay={80}>
            <p className="text-2xl font-medium leading-snug tracking-tight text-white">{what.tagline}</p>
            <p className="mt-5 text-base leading-relaxed text-white/80">{what.summary}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">{what.howItWorks}</p>
            <SourceList sources={what.sources} />
          </GlowCard>

          {/* Founders */}
          <GlowCard title="Founders & key people" delay={160}>
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
          </GlowCard>

          {/* News */}
          <GlowCard title="Recent news" delay={240}>
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
          </GlowCard>

          {/* Competitors */}
          <GlowCard title="Competitive landscape" delay={320}>
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
                        <div key={j} className="rounded-lg border border-white/[0.05] bg-black/30 p-3">
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
          </GlowCard>

          {/* Investment thesis: bull / bear / risks */}
          <GlowCard title="Investment thesis" delay={400}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] p-5">
                <div className="flex items-center gap-2 text-emerald-200">
                  <TrendingUp className="h-4 w-4" />
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Bull case</p>
                </div>
                <div className="mt-4">
                  <BulletList items={thesis.bullCase} accentColor="rgb(110,231,183)" Icon={ArrowUpRight} />
                </div>
              </div>
              <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.03] p-5">
                <div className="flex items-center gap-2 text-rose-200">
                  <TrendingDown className="h-4 w-4" />
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Bear case</p>
                </div>
                <div className="mt-4">
                  <BulletList items={thesis.bearCase} accentColor="rgb(251,113,133)" Icon={ArrowDownRight} />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.03] p-5">
              <div className="flex items-center gap-2 text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Key risks</p>
              </div>
              <div className="mt-4">
                <BulletList items={thesis.keyRisks} accentColor="rgb(252,211,77)" Icon={AlertTriangle} />
              </div>
            </div>
          </GlowCard>

          {/* Diligence priorities */}
          <GlowCard title="Diligence priorities" accent="#22d3ee" delay={480}>
            <p className="text-sm leading-relaxed text-white/65">
              Areas worth hardening before a term sheet — what to ask the team and which data to request.
            </p>
            <ul className="mt-5 space-y-4">
              {diligence.priorities.map((d, i) => (
                <li key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/[0.12] text-[11px] font-medium text-cyan-200">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-medium text-white">{d.area}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/65">{d.why}</p>
                      {d.asks?.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {d.asks.map((q, j) => (
                            <li key={j} className="flex gap-2 text-sm text-white/75">
                              <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300/70" />
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </GlowCard>
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

- `company.name` / `company.domain` / `company.asOf` (today YYYY-MM-DD) / `company.note` (1-line disambiguation if needed; null otherwise)
- `what.{tagline, summary, howItWorks, sources}` per the persona section above (max 8 sources)
- `founders[]` — 1–6 people. `notableSignal` and `linkedinUrl` are nullable. Don't guess LinkedIn handles.
- `news[]` — max 8, newest first, prioritized funding > exec > launches > customer > regulatory. Skip PR fluff. Categories: 'funding' | 'product' | 'people' | 'press' | 'other'.
- `competitors.list[]` — 3–5 most directly competitive. Each gets exactly four chips in dimension order: product, pricing, perception, leadership. Verdicts from the SUBJECT COMPANY's perspective: 'lead' / 'lag' / 'equal'. Default to 'equal' when you can't defend a clear lead/lag with a specific fact.
- `thesis.bullCase[]` — 3–5 punchy bullets, each a specific reason this could 10x. Concrete metric, customer, or moat — not generic ("large TAM" is a fail).
- `thesis.bearCase[]` — 3–5 bullets a sharp partner would actually voice. Specific. Naming names if relevant.
- `thesis.keyRisks[]` — 3–5 bullets distinct from bear case: operational, regulatory, market, or execution risks that could materialize regardless of thesis.
- `diligence.priorities[]` — 4–6 entries. Each `{ area, why, asks: [string] }`. The highest-leverage things to harden in DD: revenue quality, retention, concentration, regulatory exposure, key person risk, gross margin trajectory, etc. Each should have 1–3 specific asks (data requests or questions for the team).

If a section legitimately has nothing — early-stage company, no public news — pass an empty array. The component handles empty news gracefully. Don't fabricate.

## Guardrails

- **Never invent**: a credential, prior employer, funding number, customer name, LinkedIn URL, competitor, or specific metric.
- If uncertain about a fact, omit it. If sources disagree, surface the disagreement in one line.
- For thesis content (bull / bear / risks / diligence): synthesize from the facts you gathered. Be opinionated but grounded — every claim should trace back to something you searched. No "could" / "might" / "potentially" hedge-words; if it's speculative, say so explicitly with "speculative:" prefix.
- Date-stamp via `company.asOf`.
- For non-public or pre-seed companies where most data is unknown: produce the artifact with empty arrays where appropriate, plus a `company.note` flagging the limited public data, and a thesis/diligence focused on the unknowns themselves.
- The component must be a single self-contained file. Only `react` and `lucide-react` imports. No external fetches at runtime (the favicon `<img>` is fine — that's just an image URL).

## Follow-up mode

After producing the artifact, the user may ask follow-ups about that company — "what would you push back on?", "draft 5 questions for the CEO", "what's their gross margin profile likely to be?", "compare them to <competitor>", "what's the bear case?". Answer concisely in chat (don't regenerate the artifact unless asked for an updated brief). For questions that need fresh data, search again.

If the user names a *new* company in a follow-up ("now do Mercury"), produce a fresh full artifact.

## Fallback

If for any reason React artifacts aren't supported in the current Claude environment, fall back to producing the brief as inline markdown using the same six-section structure and the same content guidelines. Tell the user once that the rich artifact wasn't available so they know what they're missing.
