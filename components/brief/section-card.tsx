import type { ReactNode } from "react";
import { GlowCard } from "./glow-card";

export function friendlyError(raw: string): {
  headline: string;
  detail?: string;
} {
  if (/credit balance|insufficient.+credit|billing/i.test(raw))
    return {
      headline: "Anthropic credits exhausted.",
      detail:
        "Add credits at console.anthropic.com → Plans & Billing, then refresh.",
    };
  if (/529|overloaded/i.test(raw))
    return {
      headline: "Anthropic is briefly overloaded.",
      detail: "Refresh in a moment to retry — your other sections are fine.",
    };
  if (/429|rate.?limit/i.test(raw))
    return {
      headline: "Rate limit reached.",
      detail: "Wait a minute and refresh.",
    };
  if (/parsed/i.test(raw))
    return {
      headline: "Couldn't structure the result.",
      detail:
        "Refresh — Claude sometimes needs a second pass on a tricky brief.",
    };
  if (/network|fetch|timeout|ECONN/i.test(raw))
    return {
      headline: "Network hiccup talking to Anthropic.",
      detail: "Check your connection and refresh.",
    };
  return {
    headline: "This section couldn't render.",
    detail: raw.length < 160 ? raw : raw.slice(0, 160) + "…",
  };
}

export function SectionCard({
  title,
  children,
  error,
}: {
  title: string;
  children?: ReactNode;
  error?: string;
}) {
  return (
    <GlowCard>
      <div className="p-6 sm:p-7">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
          {title}
        </h2>
        <div className="mt-5">
          {error ? (() => {
            const { headline, detail } = friendlyError(error);
            return (
              <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
                <p className="text-sm font-medium text-amber-100/95">
                  {headline}
                </p>
                {detail && (
                  <p className="mt-1 text-xs text-amber-100/55">{detail}</p>
                )}
              </div>
            );
          })() : (
            children
          )}
        </div>
      </div>
    </GlowCard>
  );
}
