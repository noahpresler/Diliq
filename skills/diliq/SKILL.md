---
name: diliq
description: 'Generate a pre-meeting VC investment brief on a named company as an interactive artifact. Use when the user asks for a brief, deep-dive, due-diligence prep, or company research (e.g. brief me on Stripe, /diliq Anthropic, research Brex). Renders a two-tab artifact - Company Overview (thesis, founders, news, competitors, TAM, bull/bear/risks, diligence asks) and Diligence Insights (activates when the user shares decks, models, or memos).'
---

# Diliq — VC Pre-Meeting Brief (Interactive)

You produce a pre-meeting investment brief on a single company for a partner at a growth-stage venture firm.

## Output rules — read this first

**Always create an artifact.** Use the artifact creation capability available in this conversation. Never dump HTML, JSX, or code blocks directly into the chat reply. The chat reply should be a one-line confirmation pointing at the artifact ("Brief on [Company] — open the artifact in the side panel."), with everything else inside the artifact.

**Artifact type: `text/html`. Always.** The HTML template below is **fully self-contained** — no external CDN, no React, no Babel, no Tailwind, no remote fonts, no remote scripts. Inline CSS only, with minimal vanilla JS for tab switching. This works in every Claude environment that renders HTML at all (including Claude for Work / Cowork / "Milonis Cowork" / Enterprise tenants where iframe sandboxes block external resources).

**Why no React or external dependencies:** restricted artifact iframes silently block CDN script loads and the entire app fails to mount, leaving a black screen. The self-contained template guarantees the artifact renders identically whether it's in an inline live preview, an external Chrome tab, or any other artifact viewer.

**Hard rule: never emit raw HTML or code blocks inline in the chat.** If artifacts can't be created at all in this environment (extremely rare), fall through to the markdown fallback at the bottom of this file (prose, not code) and tell the user once: "Artifacts aren't enabled in your workspace, so I produced the brief as a markdown document instead."

## Persona

The reader is sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, hedging language. Cite every factual claim with a source URL. Never invent — if you can't verify a fact, omit it.

## Workflow

1. **Resolve the company.** If the user named one company clearly, use it. If ambiguous (e.g. "Apollo" — Apollo.io vs Apollo GraphQL vs Apollo PE), ask one short clarifying question OR pick the most prominent and surface your assumption in the optional company note line.

2. **Research with web_search.** 4–7 well-targeted queries should cover:
   - Current C-suite + founder backgrounds (titles change often)
   - Last 12 months of news (funding, exec moves, launches, customer wins, regulatory)
   - Current competitor lineup
   - Material thesis facts (TAM, unit economics if disclosed)
   - 3–4 thought leadership pieces from named operators / investors

3. **Synthesize the thesis.** Form your own bull case, bear case, key risks, and the highest-leverage diligence questions. Don't copy talking points — write the partner's-eye view. Write the **core thesis** as 2–3 sentences a partner would actually say in a Monday meeting for why they invested.

4. **Create a single `text/html` artifact** by copying the HTML template below and replacing the example data inline with the real researched data. The example data shows the exact patterns for every section — keep the structure, swap the values.

## Filling in the data

Replace the example values in the HTML template inline. Each field's expected content:

- **Company header** — title, domain (or omit the link line), `as of` date in `Mon DD, YYYY` form. Favicon URL pattern stays as `https://www.google.com/s2/favicons?domain={domain}&sz=128`; the inline `onerror` swap to gradient initials handles broken images.
- **Optional company note** — one line below the title for disambiguation ("Apollo (Apollo.io — sales engagement)"). Delete the `<p class="company-note">` element entirely if not needed.
- **Red flags** — **leave the `<section class="card card-redflag">` element OUT entirely unless there are MAJOR red flags.** Threshold is high: active litigation, regulatory action, fraud allegations, key-founder departure mid-round, material customer loss, security incident, accounting concerns. Routine bad news belongs in `news` or `bearCase`. **Every flag description must include an inline `<a>` link to the source AND the section's `<div class="sources">` block at the bottom must list each source.**
- **Core thesis** — 2–3 sentences. Concrete, opinionated, defensible — what a partner would say at a Monday meeting. No hedge-words. If the company is uninvestable, replace with a one-sentence "Pass — [reason]". **Keep the small "Synthesized from sources cited throughout the brief…" footer below the thesis text and link it to 2–3 of the strongest underpinning sources.**
- **What they do** — tagline ~10–15 words, 2–3 sentence summary, 1–2 paragraphs how-it-works. Specific, never generic. **Sources block at the bottom is required.**
- **Founders & key people** — 1–6 people. Include LinkedIn link only when verified via search; otherwise omit the link element entirely. Notable signal is optional — omit the chip element when null. **Sources block at the bottom is required** (founder LinkedIn URLs, biographical articles, press features, etc.).
- **Recent news** — max 8 items, newest first. Categories: `funding`, `product`, `people`, `press`, `other` — each maps to a CSS class `cat-funding` / etc. Skip routine PR fluff. **Each item already has its own source link inline (the `<a class="item-title">` URL plus source/publication metadata) — that's the citation; no separate sources block needed for this card.**
- **Thought leadership** — 3–4 max recent pieces from bona fide industry voices (founders, investors, named operators). Bar: "this person actually moves opinion in this space." Skip mainstream press / sell-side analysts. **Each item links to its own source — no separate sources block needed.**
- **Competitive landscape** — 3–5 most directly competitive companies. For each: scoreline (computed from the four chip verdicts) shows `{leads}` / `{lags}` / `{equal}` from the SUBJECT company's perspective, plus four chips, one per dimension (product, pricing, perception, leadership). Each chip's verdict label names the winner explicitly: "Anthropic leads", "OpenAI leads", or "Even". **Sources block at the bottom is required** — cite the comparison points (pricing pages, customer wins, exec announcements).
- **Market opportunity** — bottom-up TAM, with headline range, 1–2 paragraph analysis, side-by-side enterprise + mid-market segment cards (avg ACV, buyer count, implied TAM each), and a 5×5 sensitivity table where rows are ACVs and columns are buyer counts. Compute the cell values inline (`ACV × buyers`); shade darker for larger by adding inline `style="background:rgba(139,92,246,X)"` where X scales with relative size. **Sources block at the bottom is required** — cite the buyer-count source (Census / Gartner / segment report) and any cross-checks against top-down sizing.
- **Investment thesis** — bull case, bear case, key risks. 3–5 bullets each. Specific, no generic hedge-words. **Sources block at the bottom is required** — cite the inputs that drive each named claim (an OSS metric link for "14K stars", a press article for "AWS launches X", etc.).
- **Diligence priorities** — 4–6 numbered items. Each: area, why, 1–3 specific asks for the team / data room. **Each `why` paragraph should include an inline `<a>` link to whatever public reporting raised the question, AND the sources block at the bottom should list the primary references.**
- **Diligence Insights tab** — leave the empty-state element in place on the initial brief. Populate only after the user shares actual diligence artifacts (see "Follow-up mode" below). When populated, every analytical claim should reference either the shared artifact (e.g. "deck p. 12") inline or a public source.

## The complete HTML template

Copy this entire document as the content of a `text/html` artifact and replace example values inline. The example data illustrates every section type with realistic content — match the structure when filling in real data.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Acme — Pre-Meeting Brief</title>
<style>
:root {
  --bg:#000; --text:rgba(255,255,255,0.92); --t2:rgba(255,255,255,0.65); --t3:rgba(255,255,255,0.45); --t4:rgba(255,255,255,0.30);
  --border:rgba(255,255,255,0.08); --border2:rgba(255,255,255,0.05);
  --surface:rgba(255,255,255,0.02); --surface2:rgba(255,255,255,0.04);
  --violet:#8b5cf6; --cyan:#22d3ee; --amber:#f59e0b;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);min-height:100%;color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
body{padding:2.5rem 1.5rem;position:relative;overflow-x:hidden}
a{color:inherit}
ul{list-style:none}
.container{position:relative;max-width:64rem;margin:0 auto;z-index:1}

/* Aurora */
.aurora{position:fixed;inset:-2rem -2rem auto -2rem;height:36rem;pointer-events:none;filter:blur(60px);opacity:.7;z-index:0;
  background:radial-gradient(ellipse 60% 50% at 20% 0%,rgba(139,92,246,.20),transparent 70%),radial-gradient(ellipse 50% 50% at 80% 10%,rgba(34,211,238,.14),transparent 70%);
  animation:fadeIn 1200ms ease-out both}
@keyframes fadeIn{from{opacity:0}to{opacity:.7}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes ping{0%,100%{transform:scale(1);opacity:.6}75%{transform:scale(2.4);opacity:0}}

/* Hero */
.hero{display:flex;align-items:flex-end;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;padding-bottom:2.5rem;border-bottom:1px solid var(--border);animation:fadeUp 520ms cubic-bezier(.22,1,.36,1) both}
.hero-id{display:flex;align-items:center;gap:1.25rem}
.hero-logo{position:relative;width:4rem;height:4rem;flex-shrink:0}
.hero-logo-halo{position:absolute;inset:-.5rem;border-radius:1.5rem;background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(34,211,238,.20));filter:blur(20px);opacity:.5}
.hero-logo-frame{position:relative;width:4rem;height:4rem;border-radius:1rem;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);overflow:hidden;display:grid;place-items:center}
.hero-logo-frame::after{content:'';position:absolute;inset:0;border-radius:1rem;box-shadow:inset 0 0 0 1px rgba(255,255,255,.10);pointer-events:none}
.hero-logo-frame img{width:100%;height:100%;object-fit:cover;display:block}
.logo-fallback{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(34,211,238,.30));color:#fff;font-size:1.125rem;font-weight:500}
.eyebrow{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.22em;color:var(--t3)}
.hero-title{margin-top:.375rem;font-size:clamp(2.25rem,6vw,3.75rem);font-weight:500;letter-spacing:-.025em;line-height:1.05;background:linear-gradient(135deg,#fff,rgba(255,255,255,.6));-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-link{display:inline-flex;align-items:center;gap:.375rem;margin-top:.5rem;font-size:.875rem;color:var(--t2);text-decoration:none;transition:color 200ms}
.hero-link:hover{color:#fff}
.hero-link svg{width:12px;height:12px}
.company-note{margin-top:.75rem;max-width:42rem;font-size:.875rem;color:var(--t2)}
.as-of{display:inline-flex;align-items:center;gap:.5rem;padding:.25rem .75rem;border-radius:9999px;border:1px solid var(--border);background:var(--surface);font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;color:var(--t2);align-self:flex-start;backdrop-filter:blur(8px)}
.pulse{position:relative;display:inline-flex;width:6px;height:6px;flex-shrink:0}
.pulse::before{content:'';position:absolute;inset:-2px;border-radius:50%;background:rgba(139,92,246,.6);animation:ping 1.6s cubic-bezier(0,0,.2,1) infinite}
.pulse::after{content:'';position:absolute;inset:0;border-radius:50%;background:var(--violet);box-shadow:0 0 8px rgba(139,92,246,.6)}

/* Tabs (CSS-only via radio inputs) */
input[name="diliq-tab"]{position:absolute;opacity:0;pointer-events:none}
.tabs{display:inline-flex;align-items:center;gap:.25rem;margin-top:2rem;padding:.25rem;border-radius:9999px;border:1px solid var(--border);background:var(--surface);backdrop-filter:blur(8px)}
.tab{display:inline-flex;align-items:center;gap:.5rem;padding:.375rem 1rem;font-size:12px;font-weight:500;letter-spacing:.025em;color:var(--t2);border-radius:9999px;cursor:pointer;transition:all 300ms;user-select:none;border:1px solid transparent}
.tab:hover{color:rgba(255,255,255,.85)}
.tab svg{width:14px;height:14px}
#diliq-tab-overview:checked~.container .tab[for="diliq-tab-overview"],
#diliq-tab-diligence:checked~.container .tab[for="diliq-tab-diligence"]{
  background:linear-gradient(to right,rgba(139,92,246,.25),rgba(34,211,238,.20));color:#fff;border-color:rgba(255,255,255,.15);box-shadow:0 0 20px rgba(139,92,246,.18)}

.diligence-pip{display:none;margin-left:.125rem;width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan)}
.has-insights .tab[for="diliq-tab-diligence"] .diligence-pip{display:inline-block}
#diliq-tab-diligence:checked~.container .tab[for="diliq-tab-diligence"] .diligence-pip{display:none}

/* Tab panes */
.pane{display:none;margin-top:1.75rem;gap:1.25rem}
#diliq-tab-overview:checked~.container .pane-overview,
#diliq-tab-diligence:checked~.container .pane-diligence{display:grid}

/* Cards */
.card{position:relative;overflow:hidden;padding:1.5rem;border:1px solid var(--border);border-radius:1rem;background:var(--surface);backdrop-filter:blur(8px);transition:border-color 300ms,background 300ms;animation:fadeUp 520ms cubic-bezier(.22,1,.36,1) both;animation-delay:80ms}
@media (min-width:640px){.card{padding:1.75rem}}
.card:hover{border-color:rgba(255,255,255,.16);background:rgba(255,255,255,.025)}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,rgba(255,255,255,.25),transparent);opacity:0;transition:opacity 300ms}
.card:hover::before{opacity:1}
.card::after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(380px circle at 50% 0%,rgba(139,92,246,.10),rgba(34,211,238,.05) 35%,transparent 60%);opacity:0;transition:opacity 300ms}
.card:hover::after{opacity:1}
.pane > *:nth-child(1){animation-delay:80ms}
.pane > *:nth-child(2){animation-delay:160ms}
.pane > *:nth-child(3){animation-delay:240ms}
.pane > *:nth-child(4){animation-delay:320ms}
.pane > *:nth-child(5){animation-delay:400ms}
.pane > *:nth-child(6){animation-delay:480ms}
.pane > *:nth-child(7){animation-delay:560ms}
.pane > *:nth-child(8){animation-delay:640ms}
.pane > *:nth-child(9){animation-delay:720ms}
.pane > *:nth-child(10){animation-delay:800ms}
.card-title{position:relative;display:flex;align-items:center;gap:.5rem;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.2em;color:var(--t3)}
.card-body{position:relative;margin-top:1.25rem}

/* Red flags */
.card-redflag{border-color:rgba(244,63,94,.30);background:linear-gradient(135deg,rgba(76,5,25,.6),rgba(64,7,21,.3),rgba(76,5,25,.6))}
.card-redflag::before{background:linear-gradient(to right,transparent,rgba(252,165,165,.40),transparent);opacity:1}
.card-redflag::after{background:radial-gradient(ellipse 60% 80% at 50% 0%,rgba(244,63,94,.30),transparent 70%);opacity:.5}
.card-redflag .card-title{color:rgba(254,205,211,1)}
.flag-list{display:grid;gap:1rem}
.flag-item{display:flex;gap:.75rem}
.flag-item svg{flex-shrink:0;width:16px;height:16px;margin-top:2px;color:rgba(252,165,165,1)}
.flag-title{font-size:1rem;font-weight:500;color:rgba(255,228,230,1)}
.flag-desc{margin-top:.25rem;font-size:.875rem;line-height:1.6;color:rgba(254,205,211,.75)}

/* Core thesis */
.card-thesis{border-color:rgba(255,255,255,.10);background:linear-gradient(135deg,rgba(139,92,246,.06),rgba(255,255,255,.02),rgba(34,211,238,.06));padding:1.75rem}
@media (min-width:640px){.card-thesis{padding:2.25rem}}
.card-thesis::before{opacity:1}
.card-thesis::after{background:radial-gradient(ellipse 60% 80% at 50% 0%,rgba(139,92,246,.20),rgba(34,211,238,.10) 60%,transparent 80%);opacity:.6}
.thesis-title{color:rgba(255,255,255,.55)}
.thesis-title svg{color:rgba(196,181,253,1);width:14px;height:14px}
.thesis-text{margin-top:1.25rem;font-size:clamp(1.5rem,3vw,1.875rem);font-weight:500;line-height:1.35;letter-spacing:-.015em;background:linear-gradient(135deg,#fff,rgba(255,255,255,.65));-webkit-background-clip:text;background-clip:text;color:transparent}

/* What */
.tagline{font-size:1.5rem;font-weight:500;line-height:1.3;letter-spacing:-.015em;color:#fff}
.summary{margin-top:1.25rem;font-size:1rem;line-height:1.6;color:rgba(255,255,255,.80)}
.how-it-works{margin-top:1rem;font-size:.875rem;line-height:1.65;color:var(--t2)}

/* Sources */
.sources{margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border2)}
.sources-label{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.18em;color:rgba(255,255,255,.35)}
.sources-list{display:flex;flex-wrap:wrap;gap:.25rem 1rem;margin-top:.5rem}
.sources-list a{font-size:12px;color:rgba(255,255,255,.50);text-decoration:none;transition:color 200ms}
.sources-list a:hover{color:rgba(255,255,255,.85)}

/* Founders */
.founders{display:grid}
.founder{display:grid;gap:.75rem;padding:1.25rem 0;border-top:1px solid var(--border2)}
.founder:first-child{padding-top:0;border-top:0}
.founder:last-child{padding-bottom:0}
@media (min-width:640px){.founder{grid-template-columns:minmax(220px,1fr) 2fr;gap:1.5rem}}
.founder-id{display:flex;align-items:center;gap:.75rem;min-width:0}
.founder-avatar{width:2.5rem;height:2.5rem;flex-shrink:0;display:grid;place-items:center;border-radius:50%;border:1px solid rgba(255,255,255,.10);background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(34,211,238,.20));font-size:11px;font-weight:500;color:rgba(255,255,255,.85)}
.founder-meta{min-width:0}
.founder-name-row{display:flex;align-items:center;gap:.375rem}
.founder-name{font-weight:500;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.linkedin-link{flex-shrink:0;color:rgba(255,255,255,.40);transition:color 200ms;display:inline-flex}
.linkedin-link:hover{color:#0a66c2}
.linkedin-link svg{width:14px;height:14px}
.founder-role{font-size:.875rem;color:rgba(255,255,255,.50);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.founder-bg{font-size:.875rem;line-height:1.6;color:rgba(255,255,255,.75)}
.notable-signal{display:inline-flex;align-items:center;gap:.375rem;margin-top:.5rem;padding:.125rem .625rem;border-radius:9999px;border:1px solid rgba(252,211,77,.25);background:rgba(252,211,77,.06);font-size:11px;color:rgba(254,243,199,.95)}
.notable-dot{width:4px;height:4px;border-radius:50%;background:#fcd34d;box-shadow:0 0 6px var(--amber)}

/* News */
.news,.tl{margin:0 -.5rem}
.news-item,.tl-item{padding:1rem .5rem;border-top:1px solid var(--border2);border-radius:.5rem;transition:background 200ms}
.news-item:first-child,.tl-item:first-child{padding-top:0;border-top:0}
.news-item:last-child,.tl-item:last-child{padding-bottom:0}
.news-item:hover,.tl-item:hover{background:rgba(255,255,255,.015)}
.item-meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;font-size:12px;color:rgba(255,255,255,.50)}
.tabular{font-variant-numeric:tabular-nums}
.dot-sep{color:rgba(255,255,255,.25)}
.cat{padding:0 .5rem;border-radius:9999px;border:1px solid;font-size:10px;text-transform:uppercase;letter-spacing:.05em;line-height:1.6}
.cat-funding{border-color:rgba(252,211,77,.30);background:rgba(252,211,77,.08);color:rgba(254,243,199,1)}
.cat-product{border-color:rgba(103,232,249,.30);background:rgba(103,232,249,.08);color:rgba(207,250,254,1)}
.cat-people{border-color:rgba(196,181,253,.30);background:rgba(196,181,253,.08);color:rgba(237,233,254,1)}
.cat-press{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:rgba(255,255,255,.75)}
.cat-other{border-color:rgba(255,255,255,.10);background:rgba(255,255,255,.02);color:rgba(255,255,255,.55)}
.item-title{display:inline-flex;align-items:flex-start;gap:.375rem;margin-top:.5rem;font-size:1rem;font-weight:500;line-height:1.35;color:#fff;text-decoration:none;transition:color 200ms}
.item-title:hover{color:rgba(255,255,255,.85)}
.item-title svg{width:14px;height:14px;margin-top:3px;flex-shrink:0;opacity:.4}
.item-summary{margin-top:.375rem;font-size:.875rem;line-height:1.6;color:rgba(255,255,255,.70)}

/* Thought leadership */
.tl-author{display:inline-flex;align-items:center;gap:.375rem;padding:.125rem .625rem;border-radius:9999px;border:1px solid rgba(196,181,253,.25);background:rgba(196,181,253,.06);color:rgba(237,233,254,.95);font-size:11px}
.tl-author svg{width:12px;height:12px;color:rgba(196,181,253,1)}

/* Competitors */
.market-summary{font-size:.875rem;line-height:1.6;color:rgba(255,255,255,.70)}
.competitors{margin-top:1.5rem;display:grid;gap:1rem}
.comp{padding:1.25rem;border:1px solid rgba(255,255,255,.07);border-radius:.75rem;background:rgba(255,255,255,.015);transition:all 300ms}
.comp:hover{border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.025)}
.comp-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem}
.comp-id{display:flex;align-items:center;gap:.625rem;min-width:0}
.comp-logo{width:2.25rem;height:2.25rem;flex-shrink:0;border-radius:.5rem;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);overflow:hidden;display:grid;place-items:center;position:relative}
.comp-logo::after{content:'';position:absolute;inset:0;border-radius:.5rem;box-shadow:inset 0 0 0 1px rgba(255,255,255,.10);pointer-events:none}
.comp-logo img{width:100%;height:100%;object-fit:cover;display:block}
.comp-logo .logo-fallback{font-size:11px}
.comp-name{font-size:1rem;font-weight:500;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.comp-domain{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;color:var(--t4)}
.comp-tagline{margin-top:.5rem;font-size:.875rem;line-height:1.6;color:rgba(255,255,255,.60)}
.scoreline{display:flex;flex-wrap:wrap;align-items:center;gap:.375rem .75rem;margin-top:1rem;padding:.5rem .75rem;border:1px solid var(--border2);background:rgba(0,0,0,.20);border-radius:.5rem;font-size:11px}
.scoreline-label{font-family:ui-monospace,'SF Mono',Menlo,monospace;text-transform:uppercase;letter-spacing:.16em;color:var(--t3)}
.score-pip{display:inline-flex;align-items:center;gap:.25rem}
.score-pip svg{width:12px;height:12px}
.score-pip.lead{color:rgba(167,243,208,1)}
.score-pip.lag{color:rgba(254,205,211,1)}
.score-pip.equal{color:rgba(255,255,255,.55)}
.score-pip-count{font-family:ui-monospace,monospace;font-variant-numeric:tabular-nums}
.score-pip-text{color:var(--t2)}
.score-pip.equal .score-pip-text{color:rgba(255,255,255,.55)}
.chips{display:grid;gap:.625rem;margin-top:.75rem}
@media (min-width:640px){.chips{grid-template-columns:repeat(2,1fr)}}
.chip{padding:.75rem;border:1px solid var(--border2);border-radius:.5rem;background:rgba(0,0,0,.30)}
.chip-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.25rem .5rem}
.chip-dim{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.18em;color:var(--t3)}
.chip-verdict{display:inline-flex;align-items:center;gap:.25rem;max-width:100%;padding:.125rem .5rem;border-radius:9999px;border:1px solid;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chip-verdict svg{width:12px;height:12px;flex-shrink:0}
.chip-verdict.lead{border-color:rgba(110,231,183,.30);background:rgba(110,231,183,.08);color:rgba(167,243,208,1)}
.chip-verdict.lag{border-color:rgba(251,113,133,.30);background:rgba(251,113,133,.08);color:rgba(254,205,211,1)}
.chip-verdict.equal{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:rgba(255,255,255,.65)}
.chip-winner{font-weight:600}
.chip-leads{opacity:.7}
.chip-evidence{margin-top:.5rem;font-size:12px;line-height:1.6;color:var(--t2)}

/* TAM */
.tam-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:1rem}
.tam-head-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.2em;color:var(--t3)}
.tam-num{margin-top:.5rem;font-size:clamp(1.75rem,4vw,2.25rem);font-weight:500;letter-spacing:-.02em;background:linear-gradient(to right,rgba(196,181,253,1),#fff,rgba(165,243,252,1));-webkit-background-clip:text;background-clip:text;color:transparent}
.tam-method{display:inline-flex;align-items:center;gap:.375rem;padding:.25rem .75rem;border-radius:9999px;border:1px solid var(--border);background:var(--surface);font-size:11px;color:var(--t2);align-self:flex-start}
.tam-method svg{width:12px;height:12px}
.tam-analysis{margin-top:1.25rem;font-size:.875rem;line-height:1.65;color:rgba(255,255,255,.75)}
.segments{display:grid;gap:1rem;margin-top:1.5rem}
@media (min-width:640px){.segments{grid-template-columns:repeat(2,1fr)}}
.seg{padding:1.25rem;border-radius:.75rem;border:1px solid}
.seg-ent{border-color:rgba(196,181,253,.15);background:rgba(196,181,253,.03)}
.seg-mid{border-color:rgba(103,232,249,.15);background:rgba(103,232,249,.03)}
.seg-label{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.18em}
.seg-ent .seg-label{color:rgba(196,181,253,.85)}
.seg-mid .seg-label{color:rgba(103,232,249,.85)}
.seg-desc{margin-top:.75rem;font-size:.875rem;line-height:1.6;color:rgba(255,255,255,.75)}
.seg-stats{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:1rem;font-size:12px}
.seg-stat-label{color:var(--t3)}
.seg-stat-val{margin-top:.125rem;font-family:ui-monospace,monospace;font-size:1rem;color:#fff}
.seg-implied{margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--border2);font-size:12px;color:rgba(255,255,255,.5)}
.seg-implied-num{font-family:ui-monospace,monospace;color:rgba(255,255,255,.85)}
.sens{margin-top:1.75rem}
.sens-label{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.18em;color:var(--t3)}
.sens-wrap{margin-top:.75rem;border:1px solid var(--border);border-radius:.75rem;overflow:hidden}
.sens-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}
.sens-table thead{background:rgba(255,255,255,.03)}
.sens-table th,.sens-table td{padding:.5rem .75rem}
.sens-table th{text-align:right;font-family:ui-monospace,monospace;color:rgba(255,255,255,.65);font-weight:500}
.sens-table th.col-label{text-align:left;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;font-family:inherit}
.sens-table tbody tr:nth-child(even){background:rgba(255,255,255,.01)}
.sens-table tbody th{text-align:left}
.sens-table td{text-align:right;font-family:ui-monospace,monospace;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.85)}
.sens-note{margin-top:.5rem;font-size:11px;color:rgba(255,255,255,.35)}

/* Bull/bear/risks */
.bb-grid{display:grid;gap:1.25rem}
@media (min-width:640px){.bb-grid{grid-template-columns:repeat(2,1fr)}}
.bb{padding:1.25rem;border-radius:.75rem;border:1px solid}
.bb-bull{border-color:rgba(110,231,183,.15);background:rgba(110,231,183,.03)}
.bb-bear{border-color:rgba(251,113,133,.15);background:rgba(251,113,133,.03)}
.bb-risk{border-color:rgba(252,211,77,.15);background:rgba(252,211,77,.03);margin-top:1.25rem}
.bb-head{display:flex;align-items:center;gap:.5rem}
.bb-head svg{width:16px;height:16px}
.bb-bull .bb-head{color:rgba(167,243,208,1)}
.bb-bear .bb-head{color:rgba(254,205,211,1)}
.bb-risk .bb-head{color:rgba(254,243,199,1)}
.bb-head-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.2em}
.bb-list{margin-top:1rem;display:grid;gap:.625rem}
.bb-list li{display:flex;gap:.75rem;font-size:.875rem;line-height:1.6;color:rgba(255,255,255,.80)}
.bb-list svg{flex-shrink:0;width:14px;height:14px;margin-top:3px}
.bb-bull .bb-list svg{color:rgba(110,231,183,1)}
.bb-bear .bb-list svg{color:rgba(251,113,133,1)}
.bb-risk .bb-list svg{color:rgba(252,211,77,1)}

/* Diligence priorities */
.dil-intro{font-size:.875rem;line-height:1.6;color:var(--t2)}
.dil-list{margin-top:1.25rem;display:grid;gap:1rem}
.dil-item{padding:1.25rem;border:1px solid rgba(255,255,255,.07);border-radius:.75rem;background:rgba(255,255,255,.015)}
.dil-row{display:flex;align-items:flex-start;gap:.75rem}
.dil-num{width:1.5rem;height:1.5rem;flex-shrink:0;margin-top:.25rem;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(34,211,238,.12);color:rgba(165,243,252,1);font-size:11px;font-weight:500;font-family:ui-monospace,monospace}
.dil-area{font-size:1rem;font-weight:500;color:#fff}
.dil-why{margin-top:.25rem;font-size:.875rem;line-height:1.6;color:var(--t2)}
.dil-asks{margin-top:.75rem;display:grid;gap:.375rem}
.dil-asks li{display:flex;gap:.5rem;font-size:.875rem;color:rgba(255,255,255,.75)}
.dil-asks svg{flex-shrink:0;width:14px;height:14px;margin-top:3px;color:rgba(165,243,252,.7)}

/* Diligence empty state */
.dil-empty{position:relative;overflow:hidden;padding:3rem 1.5rem;border:1px dashed rgba(255,255,255,.10);border-radius:1rem;background:rgba(255,255,255,.015);text-align:center}
.dil-empty::before{content:'';position:absolute;left:-3rem;right:-3rem;top:-6rem;height:12rem;pointer-events:none;filter:blur(60px);opacity:.4;background:radial-gradient(ellipse 60% 80% at 50% 0%,rgba(34,211,238,.20),transparent 70%)}
.dil-empty-icon{position:relative;display:inline-grid;place-items:center;width:3rem;height:3rem;border-radius:.75rem;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:rgba(165,243,252,.80)}
.dil-empty-icon svg{width:20px;height:20px}
.dil-empty-title{position:relative;margin-top:1.25rem;font-size:1rem;font-weight:500;color:rgba(255,255,255,.85)}
.dil-empty-body{position:relative;margin:.5rem auto 0;max-width:30rem;font-size:.875rem;line-height:1.6;color:var(--t2)}

/* Footer */
footer{margin-top:4rem;padding-top:1.5rem;border-top:1px solid var(--border2);text-align:center;font-size:12px;color:rgba(255,255,255,.30)}

/* Inline icons */
.icon{display:inline-block;vertical-align:-2px}

/* Logo broken-image fallback wiring */
.hero-logo-frame img.broken,.comp-logo img.broken{display:none}
.logo-fallback{display:none}
.hero-logo-frame img.broken+.logo-fallback,.comp-logo img.broken+.logo-fallback{display:grid}
.no-domain .logo-fallback{display:grid}
</style>
</head>
<body>

<!-- Tab radio inputs (CSS-only tabs; live BEFORE the container so sibling selectors work) -->
<input type="radio" name="diliq-tab" id="diliq-tab-overview" checked>
<input type="radio" name="diliq-tab" id="diliq-tab-diligence">

<div class="aurora" aria-hidden="true"></div>

<main class="container">

  <!-- ============================================================ HERO -->
  <header class="hero">
    <div class="hero-id">
      <div class="hero-logo">
        <div class="hero-logo-halo"></div>
        <div class="hero-logo-frame">
          <!-- If no domain, add class="no-domain" to .hero-logo-frame and remove the <img>. -->
          <img src="https://www.google.com/s2/favicons?domain=acme.com&sz=128" alt="" referrerpolicy="no-referrer" onerror="this.classList.add('broken')">
          <div class="logo-fallback">AC</div>
        </div>
      </div>
      <div>
        <p class="eyebrow">Pre-meeting brief</p>
        <h1 class="hero-title">Acme</h1>
        <a class="hero-link" href="https://acme.com" target="_blank" rel="noopener noreferrer">acme.com
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
        </a>
        <!-- Optional disambiguation note. Delete this <p> if not needed. -->
        <p class="company-note">Apollo (Apollo.io — sales engagement); chose this over Apollo GraphQL given the VC context.</p>
      </div>
    </div>
    <span class="as-of">
      <span class="pulse"></span>
      as of Apr 26, 2026
    </span>
  </header>

  <!-- ============================================================ TABS -->
  <nav class="tabs" aria-label="Brief sections">
    <label class="tab" for="diliq-tab-overview">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
      Company Overview
    </label>
    <label class="tab" for="diliq-tab-diligence">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
      Diligence Insights
      <span class="diligence-pip" aria-hidden="true"></span>
    </label>
  </nav>

  <!-- ============================================================ COMPANY OVERVIEW PANE -->
  <section class="pane pane-overview">

    <!-- Red flags (OMIT this entire <section> when there are no MAJOR red flags) -->
    <section class="card card-redflag">
      <div class="card-title">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        Red flags
      </div>
      <ul class="card-body flag-list">
        <li class="flag-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <div>
            <div class="flag-title">DOJ inquiry opened Feb 2026</div>
            <div class="flag-desc"><a href="https://www.reuters.com/legal/doj-acme-inquiry" target="_blank" rel="noopener noreferrer" style="color:rgba(254,205,211,0.95);text-decoration:underline;text-decoration-color:rgba(254,205,211,0.4)">Reuters</a> reports an antitrust review of Acme's pricing practices in mid-market accounts; subpoenas issued to two largest customers.</div>
          </div>
        </li>
      </ul>
      <div class="sources">
        <div class="sources-label">Sources</div>
        <ul class="sources-list">
          <li><a href="https://www.reuters.com/legal/doj-acme-inquiry" target="_blank" rel="noopener noreferrer">Reuters — DOJ inquiry</a></li>
        </ul>
      </div>
    </section>

    <!-- Core thesis -->
    <section class="card card-thesis">
      <div class="card-title thesis-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
        Core thesis
      </div>
      <p class="thesis-text">Acme is the only vendor in the workflow-automation category that owns both the runtime and the IDE — every other player is one or the other. That ownership lets them collect the proprietary execution traces that compound into a structural moat as agentic workloads scale. We're betting on a 3-year window before incumbents stitch the two halves together.</p>
      <p style="position:relative;margin-top:1.25rem;font-size:11px;color:rgba(255,255,255,0.40)">Synthesized from sources cited throughout the brief — see <a href="https://www.sequoiacap.com/article/agent-runtime-thesis" target="_blank" rel="noopener noreferrer" style="color:rgba(196,181,253,0.85);text-decoration:none">Sequoia thesis</a>, <a href="https://www.theinformation.com/articles/acme-series-c" target="_blank" rel="noopener noreferrer" style="color:rgba(196,181,253,0.85);text-decoration:none">Series C reporting</a>, and the competitive landscape below.</p>
    </section>

    <!-- What -->
    <section class="card">
      <div class="card-title">What they do</div>
      <div class="card-body">
        <p class="tagline">Acme runs and observes long-running AI agent workflows for enterprise customers.</p>
        <p class="summary">Founded by ex-Stripe infra engineers, Acme handles the operational pain of putting agentic AI into production: durable execution, replay, observability, and human-in-the-loop checkpoints. Customers are platform teams at Fortune 500s who tried homegrown LangChain stacks and hit reliability ceilings.</p>
        <p class="how-it-works">The core is a workflow engine (open-source, Apache-2) plus a managed cloud that adds traces, eval harness, and SOC 2 compliance. Pricing is consumption-based on workflow steps with enterprise tiers gated on SLAs. Key differentiator: the runtime serializes every model call and tool result so any failure can be replayed deterministically from any step — Temporal-for-LLMs without the framework lock-in.</p>
        <div class="sources">
          <div class="sources-label">Sources</div>
          <ul class="sources-list">
            <li><a href="https://acme.com" target="_blank" rel="noopener noreferrer">acme.com</a></li>
            <li><a href="https://github.com/acme/runtime" target="_blank" rel="noopener noreferrer">GitHub - acme/runtime</a></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Founders -->
    <section class="card">
      <div class="card-title">Founders & key people</div>
      <ul class="card-body founders">
        <li class="founder">
          <div class="founder-id">
            <div class="founder-avatar">JD</div>
            <div class="founder-meta">
              <div class="founder-name-row">
                <span class="founder-name">Jane Doe</span>
                <a class="linkedin-link" href="https://www.linkedin.com/in/janedoe" target="_blank" rel="noopener noreferrer" aria-label="Jane Doe on LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z"/></svg>
                </a>
              </div>
              <div class="founder-role">Co-founder & CEO</div>
            </div>
          </div>
          <div class="founder-bg">
            Previously led payments infrastructure at Stripe (engineering #15); built the Connect platform from zero to $30B GMV.
            <span class="notable-signal"><span class="notable-dot"></span>Forbes 30 Under 30 — Enterprise Tech, 2023</span>
          </div>
        </li>
      </ul>
      <div class="sources">
        <div class="sources-label">Sources</div>
        <ul class="sources-list">
          <li><a href="https://www.linkedin.com/in/janedoe" target="_blank" rel="noopener noreferrer">Jane Doe — LinkedIn</a></li>
          <li><a href="https://stripe.com/blog/connect-platform-history" target="_blank" rel="noopener noreferrer">Stripe blog — Connect history</a></li>
          <li><a href="https://www.forbes.com/30-under-30/enterprise-tech/2023" target="_blank" rel="noopener noreferrer">Forbes 30 Under 30 — Enterprise Tech 2023</a></li>
        </ul>
      </div>
    </section>

    <!-- News -->
    <section class="card">
      <div class="card-title">Recent news</div>
      <ul class="card-body news">
        <li class="news-item">
          <div class="item-meta">
            <span class="tabular">Mar 12, 2026</span>
            <span class="cat cat-funding">funding</span>
            <span class="dot-sep">·</span>
            <span>The Information</span>
            <span>theinformation.com</span>
          </div>
          <a class="item-title" href="https://www.theinformation.com/articles/acme-series-c" target="_blank" rel="noopener noreferrer">
            Acme raises $180M Series C led by Sequoia at $1.4B valuation
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
          <p class="item-summary">3.2x markup from the Series B 14 months ago; Sequoia's Sonya Huang led; existing investors Index and Greylock both followed at full pro-rata.</p>
        </li>
      </ul>
    </section>

    <!-- Thought leadership -->
    <section class="card">
      <div class="card-title">Thought leadership</div>
      <p class="card-body market-summary">Recent pieces from operators and investors shaping how the market thinks about this space.</p>
      <ul class="tl">
        <li class="tl-item">
          <div class="item-meta">
            <span class="tl-author">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              Sonya Huang
            </span>
            <span class="dot-sep">·</span>
            <span>Partner, Sequoia</span>
            <span class="dot-sep">·</span>
            <span>Sequoia Capital blog</span>
            <span class="dot-sep">·</span>
            <span class="tabular">Mar 4, 2026</span>
          </div>
          <a class="item-title" href="https://www.sequoiacap.com/article/agent-runtime-thesis" target="_blank" rel="noopener noreferrer">
            The agent runtime is the new database
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
          <p class="item-summary">Argues durable execution will become the foundational layer for agentic systems the way Postgres became the default for transactional data; names Acme and one competitor as the credible plays.</p>
        </li>
      </ul>
    </section>

    <!-- Competitive landscape -->
    <section class="card">
      <div class="card-title">Competitive landscape</div>
      <p class="card-body market-summary">Incumbents (Temporal, Airflow) compete on enterprise distribution and existing data-pipeline gravity; new entrants like Acme differentiate on developer experience and LLM-native primitives.</p>
      <ul class="competitors">
        <li class="comp">
          <div class="comp-head">
            <div class="comp-id">
              <div class="comp-logo">
                <img src="https://www.google.com/s2/favicons?domain=temporal.io&sz=64" alt="" referrerpolicy="no-referrer" onerror="this.classList.add('broken')">
                <div class="logo-fallback">T</div>
              </div>
              <span class="comp-name">Temporal</span>
            </div>
            <span class="comp-domain">temporal.io</span>
          </div>
          <p class="comp-tagline">Durable workflow engine; deepest enterprise adoption in non-AI workflows.</p>
          <div class="scoreline">
            <span class="scoreline-label">vs Acme</span>
            <span class="dot-sep">·</span>
            <span class="score-pip lead">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
              <span class="score-pip-count">2</span>
              <span class="score-pip-text">Acme leads</span>
            </span>
            <span class="score-pip lag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>
              <span class="score-pip-count">1</span>
              <span class="score-pip-text">Temporal leads</span>
            </span>
            <span class="score-pip equal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
              <span class="score-pip-count">1</span>
              <span class="score-pip-text">even</span>
            </span>
          </div>
          <ul class="chips">
            <li class="chip">
              <div class="chip-head">
                <span class="chip-dim">Product</span>
                <span class="chip-verdict lead">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                  <span class="chip-winner">Acme</span> <span class="chip-leads">leads</span>
                </span>
              </div>
              <p class="chip-evidence">LLM-native primitives (token streaming, structured output retries, tool-use replay) ship out of the box; on Temporal you build them.</p>
            </li>
            <li class="chip">
              <div class="chip-head">
                <span class="chip-dim">Pricing</span>
                <span class="chip-verdict lag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>
                  <span class="chip-winner">Temporal</span> <span class="chip-leads">leads</span>
                </span>
              </div>
              <p class="chip-evidence">Temporal Cloud has 5+ years of pricing iteration and tiered enterprise contracts; Acme's consumption model triggers sticker shock at &gt;10M workflow steps.</p>
            </li>
            <li class="chip">
              <div class="chip-head">
                <span class="chip-dim">Perception</span>
                <span class="chip-verdict equal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                  Even
                </span>
              </div>
              <p class="chip-evidence">Both have strong dev-tools mindshare; Temporal known for reliability, Acme for the AI angle.</p>
            </li>
            <li class="chip">
              <div class="chip-head">
                <span class="chip-dim">Leadership</span>
                <span class="chip-verdict lead">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                  <span class="chip-winner">Acme</span> <span class="chip-leads">leads</span>
                </span>
              </div>
              <p class="chip-evidence">Stripe-trained founding team; Temporal's CEO is technical-strong but has no prior enterprise GTM exit.</p>
            </li>
          </ul>
        </li>
      </ul>
      <div class="sources">
        <div class="sources-label">Sources</div>
        <ul class="sources-list">
          <li><a href="https://temporal.io" target="_blank" rel="noopener noreferrer">temporal.io</a></li>
        </ul>
      </div>
    </section>

    <!-- Market opportunity -->
    <section class="card">
      <div class="card-title">Market opportunity</div>
      <div class="card-body">
        <div class="tam-head">
          <div>
            <p class="tam-head-label">Headline TAM</p>
            <p class="tam-num">$8B – $18B</p>
          </div>
          <span class="tam-method">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            bottom-up
          </span>
        </div>
        <p class="tam-analysis">Bottom-up: ~4,000 enterprise platform teams running production AI workloads at $250K ACV (today's reality), plus ~60,000 mid-market teams adopting at $35K ACV as agentic patterns mature. Range bracket reflects (a) penetration ceiling assumption and (b) ACV trajectory if observability gets unbundled. Upside: enterprise ACV doubles as agent workloads grow; downside: hyperscalers ship "good enough" durable execution natively.</p>
        <div class="segments">
          <div class="seg seg-ent">
            <p class="seg-label">Enterprise</p>
            <p class="seg-desc">Platform engineering at Fortune 1000s shipping AI features to production. Buys via VP-Engineering / CTO; replaces homegrown LangChain stacks and Airflow pipelines.</p>
            <dl class="seg-stats">
              <div><dt class="seg-stat-label">Avg ACV</dt><dd class="seg-stat-val">$250K</dd></div>
              <div><dt class="seg-stat-label">Buyers</dt><dd class="seg-stat-val">4.0K</dd></div>
            </dl>
            <p class="seg-implied">Implied: <span class="seg-implied-num">$1.0B</span></p>
          </div>
          <div class="seg seg-mid">
            <p class="seg-label">Mid-market</p>
            <p class="seg-desc">Series B-D AI-native startups and digital-first mid-market companies. Buys via founding engineer or first platform hire; PLG motion through OSS adoption.</p>
            <dl class="seg-stats">
              <div><dt class="seg-stat-label">Avg ACV</dt><dd class="seg-stat-val">$35K</dd></div>
              <div><dt class="seg-stat-label">Buyers</dt><dd class="seg-stat-val">60K</dd></div>
            </dl>
            <p class="seg-implied">Implied: <span class="seg-implied-num">$2.1B</span></p>
          </div>
        </div>
        <div class="sens">
          <p class="sens-label">Sensitivity — TAM = ACV × buyers</p>
          <div class="sens-wrap">
            <table class="sens-table">
              <thead>
                <tr>
                  <th class="col-label">ACV ↓ / Buyers →</th>
                  <th>500</th><th>2.5K</th><th>10K</th><th>25K</th><th>75K</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>$25K</th>
                  <td style="background:rgba(139,92,246,0.04)">$13M</td>
                  <td style="background:rgba(139,92,246,0.06)">$63M</td>
                  <td style="background:rgba(139,92,246,0.08)">$250M</td>
                  <td style="background:rgba(139,92,246,0.12)">$625M</td>
                  <td style="background:rgba(139,92,246,0.18)">$1.9B</td>
                </tr>
                <tr>
                  <th>$75K</th>
                  <td style="background:rgba(139,92,246,0.05)">$38M</td>
                  <td style="background:rgba(139,92,246,0.08)">$188M</td>
                  <td style="background:rgba(139,92,246,0.12)">$750M</td>
                  <td style="background:rgba(139,92,246,0.18)">$1.9B</td>
                  <td style="background:rgba(139,92,246,0.24)">$5.6B</td>
                </tr>
                <tr>
                  <th>$150K</th>
                  <td style="background:rgba(139,92,246,0.06)">$75M</td>
                  <td style="background:rgba(139,92,246,0.10)">$375M</td>
                  <td style="background:rgba(139,92,246,0.16)">$1.5B</td>
                  <td style="background:rgba(139,92,246,0.22)">$3.8B</td>
                  <td style="background:rgba(139,92,246,0.26)">$11B</td>
                </tr>
                <tr>
                  <th>$300K</th>
                  <td style="background:rgba(139,92,246,0.08)">$150M</td>
                  <td style="background:rgba(139,92,246,0.14)">$750M</td>
                  <td style="background:rgba(139,92,246,0.20)">$3.0B</td>
                  <td style="background:rgba(139,92,246,0.24)">$7.5B</td>
                  <td style="background:rgba(139,92,246,0.26)">$22B</td>
                </tr>
                <tr>
                  <th>$600K</th>
                  <td style="background:rgba(139,92,246,0.10)">$300M</td>
                  <td style="background:rgba(139,92,246,0.18)">$1.5B</td>
                  <td style="background:rgba(139,92,246,0.24)">$6.0B</td>
                  <td style="background:rgba(139,92,246,0.26)">$15B</td>
                  <td style="background:rgba(139,92,246,0.26)">$45B</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="sens-note">Cells shaded by relative TAM — darker = larger.</p>
        </div>
        <div class="sources">
          <div class="sources-label">Sources</div>
          <ul class="sources-list">
            <li><a href="https://www.census.gov/programs-surveys/cbp.html" target="_blank" rel="noopener noreferrer">US Census — County Business Patterns (buyer count)</a></li>
            <li><a href="https://www.gartner.com/en/documents/agentic-ai-market" target="_blank" rel="noopener noreferrer">Gartner — Agentic AI Market sizing (sanity check)</a></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Investment thesis -->
    <section class="card">
      <div class="card-title">Investment thesis</div>
      <div class="card-body">
        <div class="bb-grid">
          <div class="bb bb-bull">
            <div class="bb-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>
              <span class="bb-head-label">Bull case</span>
            </div>
            <ul class="bb-list">
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>OSS distribution: 14K GitHub stars in 9 months, organic adoption at Notion + Vercel + Ramp before any sales motion.</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>Replay/observability is the wedge to upsell into a full agent platform — most adjacent to evals, prompt management, agent-mesh.</li>
            </ul>
          </div>
          <div class="bb bb-bear">
            <div class="bb-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17 13.5 8.5 8.5 13.5 2 7"/><path d="M16 17h6v-6"/></svg>
              <span class="bb-head-label">Bear case</span>
            </div>
            <ul class="bb-list">
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>AWS Step Functions + Bedrock Agents could own this if Amazon decides to ship LLM-native primitives.</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>Open-source forks could commoditize the runtime; cloud business compresses to thin margins on hosting.</li>
            </ul>
          </div>
        </div>
        <div class="bb bb-risk">
          <div class="bb-head">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <span class="bb-head-label">Key risks</span>
          </div>
          <ul class="bb-list">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>Single-vendor concentration risk: ~40% of paid revenue from top 3 customers per public commentary.</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>Active DOJ inquiry (see red flag) could chill enterprise sales cycles for 12-18 months.</li>
          </ul>
        </div>
        <div class="sources">
          <div class="sources-label">Sources</div>
          <ul class="sources-list">
            <li><a href="https://github.com/acme/runtime/stargazers" target="_blank" rel="noopener noreferrer">GitHub — Acme star history</a></li>
            <li><a href="https://aws.amazon.com/step-functions/" target="_blank" rel="noopener noreferrer">AWS Step Functions</a></li>
            <li><a href="https://www.theinformation.com/articles/acme-customer-concentration" target="_blank" rel="noopener noreferrer">The Information — concentration commentary</a></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Diligence priorities -->
    <section class="card">
      <div class="card-title">Diligence priorities</div>
      <p class="card-body dil-intro">Areas worth hardening before a term sheet — what to ask the team and which data to request.</p>
      <ul class="dil-list">
        <li class="dil-item">
          <div class="dil-row">
            <span class="dil-num">1</span>
            <div>
              <p class="dil-area">Net revenue retention</p>
              <p class="dil-why"><a href="https://www.theinformation.com/articles/acme-retention-commentary" target="_blank" rel="noopener noreferrer" style="color:rgba(255,255,255,0.75);text-decoration:underline;text-decoration-color:rgba(255,255,255,0.25)">Public commentary</a> suggests strength but no disclosed number; gross retention vs net unclear.</p>
              <ul class="dil-asks">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>Cohort NRR by segment for last 8 quarters</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>Top-10 customer concentration and churn risk in those accounts</li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
      <div class="sources">
        <div class="sources-label">Sources</div>
        <ul class="sources-list">
          <li><a href="https://www.theinformation.com/articles/acme-retention-commentary" target="_blank" rel="noopener noreferrer">The Information — retention commentary</a></li>
        </ul>
      </div>
    </section>

  </section>

  <!-- ============================================================ DILIGENCE INSIGHTS PANE -->
  <section class="pane pane-diligence">

    <!-- EMPTY STATE: keep this on initial brief. Replace with the populated structure
         (see "Follow-up mode" in the SKILL.md prompt) once the user shares diligence
         materials. -->
    <div class="dil-empty">
      <div class="dil-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
      </div>
      <p class="dil-empty-title">Share key diligence artifacts and data with Claude to activate this tab.</p>
      <p class="dil-empty-body">Drop in the data-room deck, financial model, customer references, cohort data, or investor memo — anything you'd review before a term sheet. Claude reads it, then refreshes this tab with takeaways, updated questions, flags, and a refined thesis.</p>
    </div>

  </section>

  <footer>Generated with web search · cited where possible · always verify facts before acting</footer>
</main>

</body>
</html>
```

## Diligence Insights — populated structure

When the user shares diligence artifacts, regenerate the artifact with the diligence pane populated. Replace the `<div class="dil-empty">` block with content like this (use the same patterns as the Overview tab cards so the visual language is consistent):

```html
<section class="card">
  <div class="card-title">Artifacts analyzed</div>
  <ul class="card-body" style="display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0;margin-top:1rem">
    <li><span class="cat cat-press" style="display:inline-flex;align-items:center;gap:.375rem">📄 Series B deck (PDF)</span></li>
    <li><span class="cat cat-press" style="display:inline-flex;align-items:center;gap:.375rem">📊 Financial model (XLSX)</span></li>
  </ul>
</section>

<section class="card card-thesis">
  <div class="card-title thesis-title">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    Synthesis
  </div>
  <p class="thesis-text" style="font-size:1.125rem">[1-2 paragraph eloquent synthesis of what the new info changed about your view, what it confirmed, what it overturned. Written like the lead paragraph of a partner memo update.]</p>
</section>

<!-- Then standard cards for: Key takeaways (bullets like bb-list), Updated flags
     (use card-redflag pattern), Updated bull/bear/risks (use bb-grid pattern),
     Updated diligence questions (use dil-list pattern), What we still don't know
     (use bb-list pattern). -->
```

Keep the original Overview tab data unchanged when re-emitting the artifact — only the Diligence Insights pane changes. Add `class="has-insights"` to the `<main class="container">` element so the cyan pip indicator shows on the Diligence tab when the user is on the Overview tab.

## Guardrails

- **Cite every factual claim.** Every section that asserts a fact must either (a) link to its source inline (an `<a>` tag inside the prose where the claim is made) or (b) end with a `<div class="sources">` block listing the URLs that back the section's claims, or both. Sections in the template that have a `<div class="sources">` block at the bottom must NEVER ship with that block empty — populate it or remove the section. Empty sources blocks are unacceptable.
- **Never invent**: a credential, prior employer, funding number, customer name, LinkedIn URL, competitor, specific metric, or URL. A fabricated source URL is worse than no citation. If you can't find a real link to back a claim, drop the claim.
- If uncertain about a fact, omit it. If sources disagree, surface the disagreement in one line.
- For thesis content (core thesis / bull / bear / risks / diligence): synthesize from the facts you gathered. Be opinionated but grounded — every claim should trace back to something you searched. No "could" / "might" / "potentially" hedge-words; if it's speculative, say so explicitly with "speculative:" prefix.
- The **core thesis** is the most important paragraph in the brief. Spend disproportionate care on it. It should pass the "would a partner actually say this in a meeting?" test — concrete, opinionated, defensible. Vague generic theses ("they're well-positioned to capture a large market") are a fail.
- For TAM: build bottom-up. Show your work in the analysis. Cite buyer-count sources. The headline range should bracket reasonable enterprise + mid-market combinations — not a single point estimate.
- For red flags: bar is HIGH. Active litigation, regulatory action, fraud allegations, key-person departure mid-round, material customer churn, security incident, accounting irregularities. Default to omitting the section entirely.
- The artifact must be a single self-contained HTML document. No external CDN, no remote scripts, no remote stylesheets. Inline everything.

## Follow-up mode

After producing the artifact, the user may ask follow-up questions about the company. Treat the **entire brief as your operative context** — every section is in your head when answering.

How to respond:

- **Voice and stance.** Always answer as a thesis-driven but financially diligent investor — opinionated, specific, willing to commit to a view. Reference the brief explicitly when relevant ("the bear case in the brief flags X; here's how that interacts with your question…"). Avoid hedge-words; if something is uncertain, name what would resolve the uncertainty.
- **Do additional reasoning.** Connect dots: pricing × gross margin × scale curves; competitive moves × hiring patterns × roadmap; TAM segments × motion economics × ramp. Show your work in 1–3 short paragraphs unless the question is binary.
- **Do additional research when helpful.** If the question needs fresh data the brief doesn't cover, use web_search and cite what you find.
- **Honest disagreements.** If the question's framing is wrong or there's a better question to be asking, say so first, then answer.
- **Format.** Conversational chat by default. Tight bullets when the answer is naturally a list. Don't regenerate the artifact for chat answers.

### When the user shares diligence artifacts (Tab B)

If the user shares structured diligence material — a data-room deck, financial model spreadsheet, customer references, investor memo, cohort tables — **regenerate the artifact** with the **diligence pane populated** (see "Diligence Insights — populated structure" above). Replace the `<div class="dil-empty">` block with cards covering:

- **Artifacts analyzed** — list of what you reviewed.
- **Synthesis** — 1–2 paragraph eloquent summary of what the data changed about your view.
- **Key takeaways** — 4–8 bullets.
- **New flags** — any red flags surfaced by the data (use the `card-redflag` pattern).
- **Updated bull / bear / key risks** — refined in light of the data (use the `bb-grid` + `bb-risk` pattern).
- **Updated diligence questions** — refined for the team given what the data revealed and didn't (use the `dil-list` pattern).
- **What we still don't know** — gaps the artifacts didn't fill.

Keep all Overview tab data unchanged when re-emitting. Add `class="has-insights"` to `<main class="container">` so the cyan pip indicator appears on the Diligence tab. Reply in chat with a 1-paragraph summary of the most important shift the new data caused, then point at the updated Diligence tab.

If the user names a *new* company in a follow-up ("now do Mercury"), produce a fresh full artifact (with the empty-state diligence pane).

## Markdown fallback

Only use this if the artifact tool is entirely unavailable (extremely rare; tell the user once: "Artifacts aren't enabled in your workspace, so I produced the brief as a markdown document instead"). Output the brief as inline markdown:

```markdown
# [Company] — Pre-Meeting Brief
_as of YYYY-MM-DD_

> [Optional disambiguation note]

## ⚠ Red flags  (omit section if no MAJOR flags)
- **[Title]** — [description]

## Core thesis
[2-3 sentence reasoned bet]

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
[Date] · [category] · [Source] — **[[Title]](url)** — [1-2 sentence takeaway]

## Thought leadership
**[Author], [Role]** · [Source] · [Date] — [[Title]](url) — [1-2 sentence summary]

## Competitive landscape
[Market summary]

### [Competitor] · [domain]
[Tagline]

| Dimension | Verdict | Evidence |
|---|---|---|
| Product | Acme leads / OpenAI leads / Even | [evidence] |
| Pricing | … | … |
| Perception | … | … |
| Leadership | … | … |

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
| $A1 | … |
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

---
**Diligence Insights**
_Share key diligence artifacts and data with Claude to activate this section._
```
