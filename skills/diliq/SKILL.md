---
name: diliq
description: Generate a pre-meeting VC investment brief on a single company, rendered as an interactive React artifact in the Diliq design language. Use when the user asks for a brief, deep-dive, due-diligence summary, company research, or pre-meeting prep on a named company (e.g. "brief me on Anthropic", "/diliq Stripe", "what should I know before meeting Mercury", "research Brex for me"). Produces a single-file React component with two tabs — "Company Overview" (red flags, core thesis, what they do, founders, news, thought leadership, competitive landscape, market opportunity, investment thesis, diligence priorities) and "Diligence Insights" (initially empty; populates when the user shares diligence artifacts like decks, spreadsheets, or memos with takeaways, updated questions, updated flags, updated bull/bear/risks). Styled with Tailwind in a dark, glowy aesthetic with cursor-tracking glow, staggered entry animations, and a live "as of" pulse. Best for VC partners, investors, BD, or anyone preparing for a high-stakes meeting with a company.
---

# Diliq — VC Pre-Meeting Brief (Interactive)

You produce a pre-meeting investment brief on a single company for a partner at a growth-stage venture firm.

## Output rules — read this first

**Always create an artifact.** Use the artifact creation capability available to you in this conversation. Do **not** dump JSX, markdown, or code blocks directly into the chat response. The chat reply should be a one-line confirmation pointing at the artifact ("Brief on [Company] — open the artifact in the side panel."), with all the content living inside the artifact itself.

**Artifact type, in order of preference:**

1. **React** — `application/vnd.ant.react`. This is the intended output and what the embedded skeleton in this skill is written for.
2. **HTML** — `text/html`. If the workspace doesn't support React artifacts (some Claude for Work / Enterprise tenants disable the type), wrap the same JSX into a single self-contained `<!doctype html>` page that loads React + Tailwind from CDN. Same look, same data, same tab behavior.
3. **Markdown** — `text/markdown`. Last-resort fallback. Use only if both React and HTML artifacts fail. Same six-section structure described in the markdown fallback at the bottom of this file.

**Never emit JSX or large code blocks as plain text in the chat.** If for any reason artifacts can't be created at all in this environment, fall through to the markdown fallback (which is *prose*, not code) and tell the user once: "Artifacts aren't enabled in your workspace, so I produced the brief as a markdown document instead."

The output is a **React component artifact** rendered live in the Claude side panel.

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

4. **Create the artifact** using the artifact tool / capability available in this conversation. Default: a single React component (`type: application/vnd.ant.react`) with the data embedded inline. No external fetches. No file imports beyond `react` and `lucide-react`. If React artifacts aren't supported in this workspace, see the type-fallback ladder under "Output rules" above.

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
import { useRef, useState } from "react";
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
  Flag,
  Target,
  Sparkles,
  Lightbulb,
  FileText,
  Layers,
  Quote,
} from "lucide-react";

const BRIEF = {
  company: {
    name: "Acme",
    domain: "acme.com",
    asOf: "2026-04-25",
    note: null, // optional disambiguation note, null otherwise
  },
  // Optional. Only populate if there are MAJOR red flags worth raising
  // before the meeting (e.g. active litigation, founder departure, regulatory
  // action, fraud allegations). Empty array if none — the component skips
  // the banner entirely.
  redFlags: [
    // { title: "DOJ inquiry opened Feb 2026", description: "1-2 sentence factual summary with source." },
  ],
  // 2-3 sentences. The reasoned, concise thesis a partner would actually
  // state at a Monday meeting for why they would invest. Specific, opinionated,
  // and grounded in what you researched. Not a tagline — a bet.
  coreThesis:
    "2-3 sentences a partner would say to explain why they invested. Concrete, opinionated, defensible.",
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
  // 3-4 recent thought leadership pieces from bona fide industry voices —
  // founders, investors, or named operators in the space. Skip mainstream
  // press and analyst reports; the bar is "this person actually moves
  // opinion in this market." Keep summaries punchy.
  thoughtLeadership: [
    {
      title: "Title of the essay / podcast / talk",
      summary: "1-2 sentence summary of the core argument or insight.",
      author: "Author name",
      role: "Their role/affiliation, e.g. 'Founder, Stripe' or 'Partner, Sequoia'",
      source: "Stratechery / Substack / Lenny's Newsletter / a16z / ... ",
      url: "https://...",
      date: "2026-02-20",
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
  tam: {
    // Headline TAM range — bottom-up. Numbers are USD; the formatter
    // renders "$X.XB" / "$XM" automatically.
    headline: { low: 8_000_000_000, high: 18_000_000_000 },
    // 1–2 paragraph analysis — how you got there, the structural
    // assumptions, what would expand or compress the range.
    analysis:
      "1-2 paragraphs explaining the bottom-up build, assumptions, and what would expand/contract the range.",
    enterprise: {
      description:
        "1-2 sentences: who the enterprise buyer is, why they buy, what motion reaches them.",
      avgAcv: 250_000, // representative ACV
      buyerCount: 4_000, // addressable buyers in the segment
    },
    midMarket: {
      description:
        "1-2 sentences: who the mid-market buyer is, why they buy, what motion reaches them.",
      avgAcv: 35_000,
      buyerCount: 60_000,
    },
    // Sensitivity table — rows are ACV options, columns are buyer-count
    // options. Cells are computed (ACV × buyers) automatically.
    sensitivity: {
      acvs: [25_000, 75_000, 150_000, 300_000, 600_000],
      buyerCounts: [500, 2_500, 10_000, 25_000, 75_000],
    },
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
  // Tab B content. STARTS AS null. Populated only after the user shares
  // diligence artifacts (deck, financial model, customer references,
  // investor memo, etc.) and Claude re-emits the artifact.
  diligenceInsights: null,
  // When populated, the shape is:
  // diligenceInsights: {
  //   artifactsAnalyzed: ["Series B deck (PDF)", "Financial model (XLSX)", ...],
  //   summary: "1-2 paragraph eloquent synthesis of what the new info changes about our view.",
  //   keyTakeaways: ["bullet 1", "bullet 2", ...],
  //   updatedQuestions: [{ area, why, asks: [string] }, ...],
  //   updatedFlags: [{ title, description }, ...],          // any new red flags surfaced
  //   updatedBullCase: ["bullet 1", "..."],                 // refined bull case in light of new data
  //   updatedBearCase: ["bullet 1", "..."],                 // refined bear case
  //   updatedKeyRisks: ["bullet 1", "..."],                 // refined risks
  //   stillNeed: ["thing 1", "thing 2", ...],                // gaps the new artifacts didn't fill
  // }
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

function fmtMoney(n) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v >= 10 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v >= 10 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtCount(n) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `${n}`;
}

// Resilient logo renderer. Tries the favicon API, falls back to gradient
// initials on error (broken image, blocked domain, no domain set).
function CompanyLogo({ name, domain }) {
  const [errored, setErrored] = useState(false);
  const initials = initialsOf(name) || "·";
  const showFallback = !domain || errored;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <div
        aria-hidden
        className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/30 to-cyan-400/20 opacity-50 blur-xl"
      />
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        {showFallback ? (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-500/30 to-cyan-400/30 text-xl font-medium text-white">
            {initials}
          </div>
        ) : (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      </div>
    </div>
  );
}

// Smaller logo for competitor cards. Same favicon → initials fallback; no
// halo at this size (too busy).
function CompetitorLogo({ name, domain }) {
  const [errored, setErrored] = useState(false);
  const initials = initialsOf(name) || "·";
  const showFallback = !domain || errored;
  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
      {showFallback ? (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-500/25 to-cyan-400/25 text-[11px] font-medium text-white/85">
          {initials}
        </div>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
    </div>
  );
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

function TabBar({ active, onChange, hasInsights }) {
  const tabs = [
    { id: "overview", label: "Company Overview", Icon: Layers },
    { id: "diligence", label: "Diligence Insights", Icon: FileText },
  ];
  return (
    <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] p-1 backdrop-blur">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const showDot = id === "diligence" && hasInsights && !isActive;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-violet-500/25 to-cyan-400/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.18)] ring-1 ring-inset ring-white/15"
                : "text-white/55 hover:text-white/85"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
            {showDot && (
              <span className="ml-0.5 inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgb(34,211,238)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function DiligenceEmptyState() {
  return (
    <FadeUp delay={80}>
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.015] p-12 text-center backdrop-blur">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-12 -top-24 h-48 opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(34,211,238,0.18), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <FileText className="h-5 w-5 text-cyan-300/80" />
          </div>
          <p className="mt-5 text-base font-medium text-white/85">
            Share key diligence artifacts and data with Claude to activate this tab.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/55">
            Drop in the data room deck, financial model, customer references,
            cohort data, investor memo — anything you'd review before a term
            sheet. Claude reads it, then refreshes this tab with takeaways,
            updated questions, flags, and a refined thesis.
          </p>
        </div>
      </div>
    </FadeUp>
  );
}

function DiligenceInsightsContent({ insights }) {
  return (
    <>
      {insights.artifactsAnalyzed?.length > 0 && (
        <FadeUp delay={40}>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Artifacts analyzed</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {insights.artifactsAnalyzed.map((a, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/70"
                >
                  <FileText className="h-3 w-3 text-cyan-300/80" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>
      )}

      {insights.summary && (
        <FadeUp delay={100}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-gradient-to-br from-cyan-500/[0.05] via-white/[0.02] to-violet-500/[0.05] p-7 backdrop-blur">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-12 -top-24 h-48 opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(34,211,238,0.18), rgba(139,92,246,0.10) 60%, transparent 80%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-cyan-200">
                <Quote className="h-3.5 w-3.5" />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Synthesis</p>
              </div>
              <p className="mt-4 text-base leading-relaxed text-white/85">{insights.summary}</p>
            </div>
          </div>
        </FadeUp>
      )}

      {insights.keyTakeaways?.length > 0 && (
        <GlowCard title="Key takeaways" delay={160}>
          <BulletList items={insights.keyTakeaways} accentColor="rgb(167,139,250)" Icon={Sparkles} />
        </GlowCard>
      )}

      {insights.updatedFlags?.length > 0 && (
        <FadeUp delay={220}>
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/60 via-rose-900/30 to-rose-950/60 p-6 sm:p-7 backdrop-blur">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-12 -top-24 h-48 opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(244,63,94,0.30), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-rose-200">
                <Flag className="h-4 w-4" />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em]">New flags from data</p>
              </div>
              <ul className="mt-5 space-y-4">
                {insights.updatedFlags.map((rf, i) => (
                  <li key={i} className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                    <div className="min-w-0">
                      <p className="text-base font-medium text-rose-50">{rf.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-rose-100/75">{rf.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeUp>
      )}

      {(insights.updatedBullCase?.length > 0 ||
        insights.updatedBearCase?.length > 0 ||
        insights.updatedKeyRisks?.length > 0) && (
        <GlowCard title="Updated thesis" delay={280}>
          <p className="text-xs text-white/45">
            Refined in light of the new artifacts. Where the original brief and the data conflict, this view trusts the data.
          </p>
          {(insights.updatedBullCase?.length > 0 || insights.updatedBearCase?.length > 0) && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {insights.updatedBullCase?.length > 0 && (
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] p-5">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Bull case</p>
                  </div>
                  <div className="mt-4">
                    <BulletList items={insights.updatedBullCase} accentColor="rgb(110,231,183)" Icon={ArrowUpRight} />
                  </div>
                </div>
              )}
              {insights.updatedBearCase?.length > 0 && (
                <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.03] p-5">
                  <div className="flex items-center gap-2 text-rose-200">
                    <TrendingDown className="h-4 w-4" />
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Bear case</p>
                  </div>
                  <div className="mt-4">
                    <BulletList items={insights.updatedBearCase} accentColor="rgb(251,113,133)" Icon={ArrowDownRight} />
                  </div>
                </div>
              )}
            </div>
          )}
          {insights.updatedKeyRisks?.length > 0 && (
            <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.03] p-5">
              <div className="flex items-center gap-2 text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Key risks</p>
              </div>
              <div className="mt-4">
                <BulletList items={insights.updatedKeyRisks} accentColor="rgb(252,211,77)" Icon={AlertTriangle} />
              </div>
            </div>
          )}
        </GlowCard>
      )}

      {insights.updatedQuestions?.length > 0 && (
        <GlowCard title="Updated diligence questions" accent="#22d3ee" delay={340}>
          <p className="text-sm leading-relaxed text-white/65">
            Refined questions for the team given what the new artifacts revealed and what they didn't.
          </p>
          <ul className="mt-5 space-y-4">
            {insights.updatedQuestions.map((d, i) => (
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
      )}

      {insights.stillNeed?.length > 0 && (
        <GlowCard title="What we still don't know" delay={400}>
          <BulletList items={insights.stillNeed} accentColor="rgb(148,163,184)" Icon={Search} />
        </GlowCard>
      )}
    </>
  );
}

export default function Brief() {
  const { company, redFlags, coreThesis, what, founders, news, thoughtLeadership, competitors, tam, thesis, diligence, diligenceInsights } = BRIEF;
  const [activeTab, setActiveTab] = useState("overview");
  const hasInsights = !!diligenceInsights && Object.keys(diligenceInsights).length > 0;

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
              <CompanyLogo name={company.name} domain={company.domain} />
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

        <TabBar active={activeTab} onChange={setActiveTab} hasInsights={hasInsights} />

        <section key={activeTab} className="mt-7 grid gap-5">
          {activeTab === "diligence" && (
            hasInsights ? (
              <DiligenceInsightsContent insights={diligenceInsights} />
            ) : (
              <DiligenceEmptyState />
            )
          )}
          {activeTab === "overview" && (<>

          {/* Red flags — only renders if MAJOR flags present */}
          {redFlags && redFlags.length > 0 && (
            <FadeUp delay={40}>
              <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/60 via-rose-900/30 to-rose-950/60 p-6 sm:p-7 backdrop-blur">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-12 -top-24 h-48 opacity-60 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(244,63,94,0.35), transparent 70%)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent"
                />
                <div className="relative">
                  <div className="flex items-center gap-2 text-rose-200">
                    <Flag className="h-4 w-4" />
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Red flags</p>
                  </div>
                  <ul className="mt-5 space-y-4">
                    {redFlags.map((rf, i) => (
                      <li key={i} className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <div className="min-w-0">
                          <p className="text-base font-medium text-rose-50">{rf.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-rose-100/75">{rf.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeUp>
          )}

          {/* Core thesis — the punchy 2-3 sentence why-we-invested */}
          {coreThesis && (
            <FadeUp delay={80}>
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-gradient-to-br from-violet-500/[0.06] via-white/[0.02] to-cyan-500/[0.06] p-7 sm:p-9 backdrop-blur">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-12 -top-24 h-48 opacity-60 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(139,92,246,0.20), rgba(34,211,238,0.10) 60%, transparent 80%)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <div className="relative">
                  <div className="flex items-center gap-2 text-white/55">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em]">Core thesis</p>
                  </div>
                  <p className="mt-5 bg-gradient-to-br from-white via-white to-white/65 bg-clip-text text-2xl font-medium leading-snug tracking-tight text-transparent sm:text-3xl">
                    {coreThesis}
                  </p>
                </div>
              </div>
            </FadeUp>
          )}

          {/* What */}
          <GlowCard title="What they do" delay={140}>
            <p className="text-2xl font-medium leading-snug tracking-tight text-white">{what.tagline}</p>
            <p className="mt-5 text-base leading-relaxed text-white/80">{what.summary}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">{what.howItWorks}</p>
            <SourceList sources={what.sources} />
          </GlowCard>

          {/* Founders */}
          <GlowCard title="Founders & key people" delay={220}>
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
          <GlowCard title="Recent news" delay={300}>
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

          {/* Thought leadership */}
          {thoughtLeadership && thoughtLeadership.length > 0 && (
            <GlowCard title="Thought leadership" delay={360}>
              <p className="text-sm leading-relaxed text-white/65">
                Recent pieces from operators and investors shaping how the market thinks about this space.
              </p>
              <ul className="mt-5 -mx-2 divide-y divide-white/[0.06]">
                {thoughtLeadership.map((p, i) => (
                  <li key={i} className="rounded-lg px-2 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-white/[0.015]">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/25 bg-violet-300/[0.06] px-2.5 py-0.5 text-[11px] text-violet-100/95">
                        <Lightbulb className="h-3 w-3 text-violet-200" />
                        {p.author}
                      </span>
                      <span className="text-white/40">{p.role}</span>
                      <span className="text-white/25">·</span>
                      <span className="text-white/45">{p.source}</span>
                      <span className="text-white/25">·</span>
                      <span className="tabular-nums text-white/45">{fmtDate(p.date)}</span>
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-start gap-1.5 text-base font-medium leading-snug text-white transition hover:text-white/85"
                    >
                      {p.title}
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 opacity-40" />
                    </a>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">{p.summary}</p>
                  </li>
                ))}
              </ul>
            </GlowCard>
          )}

          {/* Competitors */}
          <GlowCard title="Competitive landscape" delay={420}>
            <p className="text-sm leading-relaxed text-white/70">{competitors.marketSummary}</p>
            <ul className="mt-6 space-y-4">
              {competitors.list.map((c, i) => (
                <li key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.025]">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <CompetitorLogo name={c.name} domain={c.domain} />
                      <p className="truncate text-base font-medium text-white">{c.name}</p>
                    </div>
                    {c.domain && <span className="font-mono text-[11px] text-white/30">{c.domain}</span>}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{c.tagline}</p>
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

          {/* Market opportunity (TAM) */}
          <GlowCard title="Market opportunity" delay={500}>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Headline TAM</p>
                <p className="mt-2 bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-4xl font-medium tracking-tight text-transparent">
                  {fmtMoney(tam.headline.low)} – {fmtMoney(tam.headline.high)}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[11px] text-white/55">
                <Target className="h-3 w-3" />
                bottom-up
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/75">{tam.analysis}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.03] p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-200/85">Enterprise</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{tam.enterprise.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-white/40">Avg ACV</dt>
                    <dd className="mt-0.5 font-mono text-base text-white">{fmtMoney(tam.enterprise.avgAcv)}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Buyers</dt>
                    <dd className="mt-0.5 font-mono text-base text-white">{fmtCount(tam.enterprise.buyerCount)}</dd>
                  </div>
                </dl>
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs text-white/50">
                  Implied: <span className="font-mono text-white/85">{fmtMoney(tam.enterprise.avgAcv * tam.enterprise.buyerCount)}</span>
                </p>
              </div>
              <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200/85">Mid-market</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{tam.midMarket.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-white/40">Avg ACV</dt>
                    <dd className="mt-0.5 font-mono text-base text-white">{fmtMoney(tam.midMarket.avgAcv)}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Buyers</dt>
                    <dd className="mt-0.5 font-mono text-base text-white">{fmtCount(tam.midMarket.buyerCount)}</dd>
                  </div>
                </dl>
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs text-white/50">
                  Implied: <span className="font-mono text-white/85">{fmtMoney(tam.midMarket.avgAcv * tam.midMarket.buyerCount)}</span>
                </p>
              </div>
            </div>

            {/* Sensitivity table: ACV (rows) × buyer count (cols) */}
            {(() => {
              const max =
                tam.sensitivity.acvs[tam.sensitivity.acvs.length - 1] *
                tam.sensitivity.buyerCounts[tam.sensitivity.buyerCounts.length - 1];
              return (
                <div className="mt-7">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
                    Sensitivity — TAM = ACV × buyers
                  </p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.06]">
                    <table className="w-full table-fixed border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/[0.03] text-white/45">
                          <th className="px-3 py-2 text-left font-medium uppercase tracking-wider">
                            ACV ↓ / Buyers →
                          </th>
                          {tam.sensitivity.buyerCounts.map((b) => (
                            <th key={b} className="px-3 py-2 text-right font-mono text-white/65">
                              {fmtCount(b)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tam.sensitivity.acvs.map((a, ri) => (
                          <tr key={a} className={ri % 2 === 0 ? "bg-white/[0.01]" : ""}>
                            <th className="px-3 py-2 text-left font-mono text-white/65">{fmtMoney(a)}</th>
                            {tam.sensitivity.buyerCounts.map((b) => {
                              const v = a * b;
                              const t = Math.min(1, v / max);
                              const intensity = 0.04 + t * 0.22;
                              return (
                                <td
                                  key={b}
                                  className="px-3 py-2 text-right font-mono tabular-nums text-white/85"
                                  style={{
                                    background: `linear-gradient(135deg, rgba(139,92,246,${intensity}) 0%, rgba(34,211,238,${intensity * 0.7}) 100%)`,
                                  }}
                                >
                                  {fmtMoney(v)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[11px] text-white/35">
                    Cells shaded by relative TAM — darker = larger.
                  </p>
                </div>
              );
            })()}

            <SourceList sources={tam.sources} />
          </GlowCard>

          {/* Investment thesis: bull / bear / risks */}
          <GlowCard title="Investment thesis" delay={580}>
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
          <GlowCard title="Diligence priorities" accent="#22d3ee" delay={660}>
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
          </>)}
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
- `redFlags[]` — **leave as `[]` unless there are MAJOR red flags worth raising before the meeting.** Threshold: active litigation, regulatory action, fraud allegations, key-founder departure mid-round, material customer loss, security incident, accounting concerns. Routine "competitive pressure" or "high burn" do NOT qualify — those belong in the bear case. Each entry: `{ title, description }`. If there is anything here, it renders FIRST so the partner sees it before anything else.
- `coreThesis` — **2–3 sentences, no more.** Write it as if a partner is closing the Monday meeting and saying out loud the reasoned bet that justifies leading this round. Specific. Opinionated. Defensible. No hedge words. Reference the wedge, the why-now, and what compounds — the things that would make this a 10x outcome, in plain language. This is the one piece of writing in the brief that captures the *bet*; the rest is supporting evidence. If the company is genuinely uninvestable, set this to a one-sentence "Pass — [reason]" rather than dressing it up.
- `what.{tagline, summary, howItWorks, sources}` per the persona section above (max 8 sources)
- `founders[]` — 1–6 people. `notableSignal` and `linkedinUrl` are nullable. Don't guess LinkedIn handles.
- `news[]` — max 8, newest first, prioritized funding > exec > launches > customer > regulatory. Skip PR fluff. Categories: 'funding' | 'product' | 'people' | 'press' | 'other'.
- `thoughtLeadership[]` — **3–4 max.** Recent (last ~12 months) essays, podcasts, talks, or memos on this market from bona fide industry voices: founders, investors, named operators. Bar is "this person actually moves opinion in this space" — skip mainstream press, sell-side analysts, generic newsletters. Each entry: `title`, `summary` (1–2 sentences capturing the actual argument), `author`, `role` (e.g. "Partner, a16z" or "Founder, Stripe"), `source` (publication or platform name), `url`, `date`. If you genuinely can't find 3, return fewer; don't pad with mediocre links.
- `competitors.list[]` — 3–5 most directly competitive. Each gets exactly four chips in dimension order: product, pricing, perception, leadership. Verdicts from the SUBJECT COMPANY's perspective: 'lead' / 'lag' / 'equal'. Default to 'equal' when you can't defend a clear lead/lag with a specific fact.
- `tam.headline` — `{ low, high }` headline TAM as raw USD numbers (e.g. `8_000_000_000`). Bottom-up: ACV × addressable buyers, summed across enterprise + mid-market, with a reasonable multiplier range to cover assumptions. Don't paste an analyst report's top-down number.
- `tam.analysis` — 1–2 paragraphs explaining the bottom-up build, the structural assumptions (penetration ceiling, ACV trajectory, motion shift), and what would expand or compress the range.
- `tam.enterprise` and `tam.midMarket` — `{ description, avgAcv, buyerCount }`. ACVs and buyer counts as raw integers. Be specific about who the buyer actually is in each segment and why they buy. `description` should make the segment feel real (named buyer personas, named example customers if any, why the motion fits).
- `tam.sensitivity` — `{ acvs: number[], buyerCounts: number[] }`. Pick 5 ACVs spanning a realistic range (low / typical / high / stretch / aspirational) and 5 buyer counts spanning a realistic range. The component computes the cells (ACV × buyers) and shades them as a heat map automatically.
- `tam.sources[]` — every URL you cited for the market sizing.
- `thesis.bullCase[]` — 3–5 punchy bullets, each a specific reason this could 10x. Concrete metric, customer, or moat — not generic ("large TAM" is a fail).
- `thesis.bearCase[]` — 3–5 bullets a sharp partner would actually voice. Specific. Naming names if relevant.
- `thesis.keyRisks[]` — 3–5 bullets distinct from bear case: operational, regulatory, market, or execution risks that could materialize regardless of thesis.
- `diligence.priorities[]` — 4–6 entries. Each `{ area, why, asks: [string] }`. The highest-leverage things to harden in DD: revenue quality, retention, concentration, regulatory exposure, key person risk, gross margin trajectory, etc. Each should have 1–3 specific asks (data requests or questions for the team).
- `diligenceInsights` — **leave as `null` on the initial brief.** This populates Tab B only after the user shares actual diligence artifacts (deck, financial model, customer references, investor memo, etc.) in a follow-up turn. See "Diligence Insights tab" below.

If a section legitimately has nothing — early-stage company, no public news — pass an empty array. The component handles empty news gracefully. Don't fabricate.

## Guardrails

- **Never invent**: a credential, prior employer, funding number, customer name, LinkedIn URL, competitor, or specific metric.
- If uncertain about a fact, omit it. If sources disagree, surface the disagreement in one line.
- For thesis content (core thesis / bull / bear / risks / diligence): synthesize from the facts you gathered. Be opinionated but grounded — every claim should trace back to something you searched. No "could" / "might" / "potentially" hedge-words; if it's speculative, say so explicitly with "speculative:" prefix.
- The **core thesis** is the most important paragraph in the brief. Spend disproportionate care on it. It should pass the "would a partner actually say this in a meeting?" test — concrete, opinionated, defensible. Vague generic theses ("they're well-positioned to capture a large market") are a fail.
- For TAM: build bottom-up. Show your work in `tam.analysis`. Cite buyer-count sources (industry counts, employee thresholds, IRS / Census / Statista numbers). The headline range should bracket reasonable enterprise + mid-market combinations — not a single point estimate. If credible top-down sources exist, use them as a sanity check on the bottom-up, not as the headline number.
- For red flags: the bar is HIGH. Active litigation, regulatory action, fraud allegations, key-person departure mid-round, material customer churn, security incident, accounting irregularities. Routine bad news (missed quarter, layoff round, competitive loss) belongs in `news` or `bearCase`, NOT `redFlags`. Default to empty array.
- Date-stamp via `company.asOf`.
- For non-public or pre-seed companies where most data is unknown: produce the artifact with empty arrays where appropriate, plus a `company.note` flagging the limited public data, and a thesis/diligence focused on the unknowns themselves.
- The component must be a single self-contained file. Only `react` and `lucide-react` imports. No external fetches at runtime (the favicon `<img>` is fine — that's just an image URL).

## Follow-up mode

After producing the artifact, the user may ask follow-up questions about the company. Treat the **entire brief artifact as your operative context**: the core thesis, founders, news, competitors, TAM build, thought leadership, bull/bear/risks, diligence priorities, and any populated Diligence Insights are all in your head when you answer.

How to respond:

- **Voice and stance.** Always answer as a thesis-driven but financially diligent investor — opinionated, specific, willing to commit to a view. Reference the brief explicitly when it's relevant ("the bear case in the brief flags X; here's how that interacts with your question…"). Avoid hedge-words; if something is genuinely uncertain, name what would resolve the uncertainty.
- **Do additional reasoning.** Don't just retrieve from the brief. Connect dots: pricing × gross margin × scale curves; competitive moves × hiring patterns × roadmap; TAM segments × motion economics × ramp. Show your work in 1–3 short paragraphs unless the question is binary.
- **Do additional research when helpful.** If the question needs fresh data the brief doesn't cover (specific metrics, recent announcements, new competitor moves, regulatory developments, customer references), use web_search. Cite what you find.
- **Honest disagreements.** If the question's framing is wrong or there's a better question to be asking, say so first, then answer. A partner would.
- **Format.** Conversational chat by default. Tight bullets when the answer is naturally a list (questions for the CEO, top risks, etc.). Don't regenerate the artifact for chat answers.

Common follow-ups and how to handle them:
- *"What would you push back on?"* — Pick the 2–3 weakest claims in the bull case or the most credulous parts of the founder narrative; argue them.
- *"Draft N questions for the CEO."* — Specific, opinionated, designed to surface the things the brief flagged as unknown. No softball questions.
- *"What's the bear case in one paragraph?"* — Synthesize the bear-case bullets into a flowing argument with the strongest single thread.
- *"Compare them to <competitor>."* — Pull the existing competitor card if present; extend with deeper analysis. If the competitor isn't in the brief, search and answer fresh.
- *"What metrics matter most?"* — Tie back to the diligence priorities; rank.

### When the user shares diligence artifacts (Tab B)

If the user shares structured diligence material — a data-room deck, a financial model spreadsheet, customer references, an investor memo, cohort tables, anything they'd review before signing a term sheet — **regenerate the artifact** with the **`diligenceInsights` field populated**. This switches the Diligence Insights tab from the empty state to the analytical view, and the tab indicator shows a small live dot so the user knows there's new content there.

Populate `diligenceInsights` with this shape:

- `artifactsAnalyzed: string[]` — names / brief descriptions of what you reviewed.
- `summary: string` — 1–2 paragraphs. Eloquent. The headline: what the data changed about your view, what it confirmed, what it overturned. Written like the lead paragraph of a partner memo update.
- `keyTakeaways: string[]` — 4–8 bullets. The crisp list of things the data revealed.
- `updatedFlags: { title, description }[]` — any new red flags the data surfaces. Empty array if none.
- `updatedBullCase: string[]` — refined bull case in light of the data. Strengthen what the data supports; drop or rewrite what it weakens. If the bull case is unchanged, return the original bullets.
- `updatedBearCase: string[]` — same treatment for the bear case.
- `updatedKeyRisks: string[]` — same for risks. The data may surface new ones (e.g. concentration risk visible in the customer table).
- `updatedQuestions: { area, why, asks }[]` — refined diligence questions. The data resolves some old questions and raises new ones.
- `stillNeed: string[]` — gaps the artifacts didn't fill. Concrete and specific.

Keep all other fields (the original `what`, `founders`, `news`, etc.) **as-is** when re-emitting the artifact — only change `diligenceInsights`. The user wants the original brief preserved and the new analysis layered on.

Reply in chat with a 1-paragraph summary of the most important shift the new data caused, then point them at the updated Diligence Insights tab.

If the user names a *new* company in a follow-up ("now do Mercury"), produce a fresh full artifact (with `diligenceInsights: null`).

## Fallbacks when React artifacts aren't available

Some Claude for Work / Enterprise workspaces disable React artifacts or all artifacts entirely. Detect this by attempting the artifact creation; if you receive an error or know from environment cues that the artifact tool isn't available, walk down this ladder:

### Tier 1 — HTML artifact (`text/html`)

Create a single self-contained HTML page that delivers the same brief. Load React, ReactDOM, Tailwind, and Babel from CDN, and inline the same JSX as a `<script type="text/babel">` block. The visual result is identical to the React artifact. Skeleton:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>[Company] — Pre-Meeting Brief</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body{margin:0;background:#000}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-presets="react">
      const { useState, useRef } = React;
      // Inline the SAME BRIEF object, helpers, and components from the React skeleton above.
      // Replace the lucide-react icons with inline <svg> equivalents (or use a single
      // <Icon name="..." /> wrapper) since you can't import lucide-react in a CDN setup.
      // ReactDOM.createRoot(document.getElementById("root")).render(<Brief />);
    </script>
  </body>
</html>
```

Same data shape, same look. The only adjustment is icons: replace `lucide-react` imports with inline SVG paths or a tiny `<Icon>` helper that renders one of the icons inline.

### Tier 2 — Markdown artifact (`text/markdown`)

If even HTML artifacts are blocked, create a markdown artifact with the brief as prose. Section structure:

```markdown
# [Company Name] — Pre-Meeting Brief
_as of YYYY-MM-DD_

> [Optional 1-line disambiguation note if needed]

## ⚠ Red flags
[Only if there are MAJOR flags — same threshold as the React skeleton. Skip section entirely if none.]
- **[Title]** — [description]

## Core thesis
[2-3 sentence reasoned bet a partner would say in a Monday meeting]

## What they do
**Tagline:** [10-15 words]

[2-3 sentence summary]

[1-2 paragraph how-it-works]

_Sources: [name](url), [name](url)_

## Founders & key people
- **[Name]** — [Role] — [LinkedIn](url)
  [Background]
  _Notable: [signal]_

## Recent news
[Date] · [funding/product/people/press/other] · [Source]
**[[Title]](url)**
[1-2 sentence takeaway]

## Thought leadership
**[Author], [Role]** · [Source] · [Date]
[[Title]](url)
[1-2 sentence summary]

## Competitive landscape
[Market summary]

### [Competitor name] · [domain]
[Tagline]

| Dimension | Verdict | Evidence |
|---|---|---|
| Product | Lead/Lag/Equal | [evidence] |
| Pricing | Lead/Lag/Equal | [evidence] |
| Perception | Lead/Lag/Equal | [evidence] |
| Leadership | Lead/Lag/Equal | [evidence] |

## Market opportunity
**Headline TAM:** $X – $Y (bottom-up)

[1-2 paragraph analysis]

| Segment | Avg ACV | Buyers | Implied TAM |
|---|---|---|---|
| Enterprise | $X | N | $Y |
| Mid-market | $X | N | $Y |

**Sensitivity (TAM = ACV × buyers):**

| ACV \ Buyers | N1 | N2 | N3 | N4 | N5 |
|---|---|---|---|---|---|
| $A1 | … | … | … | … | … |
| $A2 | … | … | … | … | … |
[etc — 5 ACV rows × 5 buyer columns]

## Investment thesis

**Bull case:**
- …

**Bear case:**
- …

**Key risks:**
- …

## Diligence priorities
1. **[Area]** — [why it matters]
   - Ask: [specific question]
   - Ask: [specific question]
[etc, 4-6 entries]

---
**Diligence Insights**
_Share key diligence artifacts and data with Claude to activate this section._
```

When the user later shares diligence artifacts, regenerate the markdown artifact and append a populated **Diligence Insights** section with the same structure as the React tab (synthesis, key takeaways, updated flags, updated bull/bear/risks, updated questions, what we still don't know).

### Tier 3 — Hard refusal

If no artifact tool of any kind is available (extremely rare), tell the user once: "Artifacts aren't enabled in your workspace, so I'll produce the brief inline." Then output the markdown brief directly in the chat. **Never output the React JSX as inline code in chat — that's the worst-of-all-worlds outcome.**
