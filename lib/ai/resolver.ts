import "server-only";
import { unstable_cache } from "next/cache";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL_FAST } from "./claude";
import { ResolvedCompanySchema, type ResolvedCompany } from "./schemas";

const SYSTEM_PROMPT = `You resolve a user's company query into the canonical company identity.

Return:
- name: the company's canonical name as commonly written (e.g. "Anthropic", "Stripe", "Brex")
- slug: lowercase kebab-case URL slug (e.g. "anthropic", "mercury-tech")
- domain: primary public domain (e.g. "anthropic.com"), or null if you don't know
- confidence: high (well-known company), medium (reasonably likely match), low (guessing)

If the input is ambiguous (e.g. "Apollo" — could be Apollo.io, Apollo GraphQL, Apollo PE), prefer the most prominent/largest company by that name and mark confidence medium.

Never invent a domain you aren't sure about — return null instead.`;

function isTransient(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(429|529|502|503|504)\b|overloaded|rate.?limit|ECONNRESET|ETIMEDOUT|fetch failed/i.test(
    msg,
  );
}

async function _resolve(querySlug: string): Promise<ResolvedCompany> {
  const query = querySlug.replace(/-/g, " ").trim();
  const callOnce = () =>
    anthropic.messages.parse({
      model: MODEL_FAST,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        format: zodOutputFormat(ResolvedCompanySchema as never),
      },
      messages: [{ role: "user", content: `Resolve this company: "${query}"` }],
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
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  if (!response) throw lastErr ?? new Error("no response");
  if (!response.parsed_output) {
    throw new Error(
      `Resolver could not parse output for "${query}" (stop_reason=${response.stop_reason})`,
    );
  }
  return response.parsed_output;
}

export const resolveCompany = unstable_cache(_resolve, ["resolve-company"], {
  revalidate: 60 * 60 * 24 * 7, // 7 days — canonical names are stable
});
