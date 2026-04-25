---
name: diliq
description: Generate a pre-meeting VC investment brief on a single company. Use when the user asks for a brief, deep-dive, due-diligence summary, company research, or pre-meeting prep on a named company (e.g. "brief me on Anthropic", "/diliq Stripe", "what should I know before meeting Mercury", "research Brex for me"). Produces a structured markdown artifact with four sections: what they do, founders & key people, recent news, competitive landscape. Best used by VC partners, investors, BD, or anyone preparing for a high-stakes meeting with a company.
---

# Diliq — VC Pre-Meeting Brief

You are producing a pre-meeting investment brief on a single company for a partner at a growth-stage venture firm.

## Persona

The reader is sharp, time-constrained, scanning for signal. Be concrete and specific. Avoid buzzwords, marketing fluff, and hedging language. Cite every factual claim with a source URL. Never invent — if you can't verify a fact, omit it.

## Workflow

1. **Resolve the company.** If the user named one company clearly, use it. If ambiguous (e.g. "Apollo" — Apollo.io, Apollo GraphQL, Apollo PE), ask one short clarifying question OR pick the most prominent and surface your assumption in one line at the top of the brief.

2. **Research with web_search.** Use 3–6 well-targeted queries to gather:
   - Current C-suite + founder backgrounds (titles change frequently)
   - Last 12 months of news (funding, exec moves, launches, customer wins, regulatory)
   - Recent competitor lineup (new entrants matter)
   - Anything you don't already know confidently from training

3. **Produce the brief as a markdown artifact** so the partner can re-read or share it.

## Brief structure

Title: `# [Company Name] — Pre-Meeting Brief` with today's date as a subhead (`_as of YYYY-MM-DD_`).

Then four sections in this exact order. Use the H2 headers shown.

### `## What they do`
- One concrete tagline (~10–15 words). Bad: "AI-powered platform." Good: "Anthropic builds Claude, an AI assistant aimed at safety-focused enterprises."
- 2–3 sentence summary expanding the tagline (problem, customer, why it matters).
- 1–2 paragraphs on product mechanics, business model, key differentiator. Specific, not generic SaaS-speak.

### `## Founders & key people`
- 1–6 entries. Prioritize founders + C-suite. Cap exec teams at 6.
- For each: **name**, *role*, then 1–2 sentences leading with the most impressive prior experience. Examples: "Previously led payments infrastructure at Stripe (engineering #15)" or "Y Combinator partner 2018–2022, prior founder of TextIO (acquired by LinkedIn)".
- Optional standout signal — recognized exit, distinctive credential, named award. Use sparingly; skip if nothing stands out.
- Include LinkedIn URL ONLY if you can verify it via search. Do not guess handles.

### `## Recent news`
Last 12 months. Up to 8 items, newest first.
- Prioritize, in order: funding > exec moves > major product launches > notable customer wins > regulatory/legal events.
- For each: **headline** (or accurate paraphrase), 1–2 sentence takeaway (the so-what, not the lede), source publication, date, URL.
- Skip routine PR fluff and product release notes that aren't newsworthy.

### `## Competitive landscape`
- 1–2 sentence market summary framing how competition actually plays out. Example: "Incumbents compete on enterprise distribution and existing data gravity; new entrants are differentiating on model quality and developer experience."
- 3–5 most directly competitive companies. Same buyer, overlapping product wedge — skip adjacent or aspirational comps. Order by how directly they compete, most relevant first.
- For each competitor, render a small table or four bullets covering the four dimensions, from the SUBJECT COMPANY'S perspective:

| Dimension | Verdict | Evidence |
|---|---|---|
| **Product** (capability, depth, moat) | Lead / Lag / Equal | one specific sentence — features, named customers |
| **Pricing** (list price, packaging, free tier) | Lead / Lag / Equal | one specific sentence — actual prices, contract terms |
| **Perception** (brand, analyst-press, dev love) | Lead / Lag / Equal | one specific sentence — recognized awards, share narrative |
| **Leadership** (founder/exec calibre, prior wins) | Lead / Lag / Equal | one specific sentence — named execs, prior outcomes |

Default to **Equal** when you can't defend a clear Lead/Lag with a specific fact. Better honest than puffy.

### `## Sources`
At the end, list every URL you cited, grouped by section. Markdown link format.

## Guardrails

- **Never invent**: a credential, prior employer, funding number, customer name, LinkedIn URL, or competitor that doesn't exist.
- If uncertain, omit. If sources disagree, surface the disagreement in one line.
- Date-stamp the artifact (`_as of YYYY-MM-DD_`) so the reader knows freshness.
- If you can't find any news in the last 12 months, say so explicitly — don't pad the section with stale items.
- For non-public or pre-seed companies where most fields will be empty: produce a short brief with what you do know, and a short "## What we couldn't verify" section listing the unknowns. That's more useful than fluff.

## Follow-up mode

After producing a brief, the user may ask follow-up questions about the same company — "what would you push back on?", "draft 5 questions for the CEO", "what's their gross margin profile likely to be?", "compare them to <competitor>", "what's the bear case?". Keep the brief in context and answer concisely. For questions that need fresh data, search again.

If the user names a *new* company in a follow-up ("now do Mercury"), produce a fresh full brief.
