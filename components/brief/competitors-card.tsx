import Link from "next/link";
import { ArrowUpRight, ArrowRight, Minus, ArrowDownRight } from "lucide-react";
import { runCompetitors } from "@/lib/ai/sections";
import type {
  CompareChip,
  CompareDimension,
  CompareVerdict,
} from "@/lib/ai/schemas";
import { SectionCard } from "./section-card";
import { SourceList } from "./source-list";

const DIMENSION_LABEL: Record<CompareDimension, string> = {
  product: "Product",
  pricing: "Pricing",
  perception: "Perception",
  leadership: "Leadership",
};

const DIMENSION_ORDER: CompareDimension[] = [
  "product",
  "pricing",
  "perception",
  "leadership",
];

const VERDICT_STYLES: Record<
  CompareVerdict,
  { chip: string; dot: string; label: string }
> = {
  lead: {
    chip: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgb(52,211,153)]",
    label: "Leads",
  },
  lag: {
    chip: "border-rose-400/30 bg-rose-400/[0.08] text-rose-200",
    dot: "bg-rose-400 shadow-[0_0_8px_rgb(251,113,133)]",
    label: "Lags",
  },
  equal: {
    chip: "border-white/15 bg-white/[0.04] text-white/65",
    dot: "bg-white/55",
    label: "On par",
  },
};

const VERDICT_ICON: Record<CompareVerdict, typeof ArrowUpRight> = {
  lead: ArrowUpRight,
  lag: ArrowDownRight,
  equal: Minus,
};

function chipFor(
  chips: CompareChip[],
  dimension: CompareDimension,
): CompareChip | undefined {
  return chips.find((c) => c.dimension === dimension);
}

export async function CompetitorsCard({ slug }: { slug: string }) {
  let data;
  try {
    data = await runCompetitors(slug);
  } catch (e) {
    return (
      <SectionCard
        title="Competitive landscape"
        error={e instanceof Error ? e.message : "Unknown error"}
      />
    );
  }

  return (
    <SectionCard title="Competitive landscape">
      <p className="text-sm leading-relaxed text-white/70">
        {data.marketSummary}
      </p>

      <ul className="mt-6 space-y-4">
        {data.competitors.map((competitor, i) => (
          <li
            key={`${competitor.slug}-${i}`}
            className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.025]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <Link
                href={`/c/${competitor.slug}`}
                className="group/comp inline-flex items-center gap-1.5 text-base font-medium text-white transition hover:text-white/85"
              >
                {competitor.name}
                <ArrowRight className="h-3.5 w-3.5 -rotate-45 opacity-40 transition group-hover/comp:translate-x-0.5 group-hover/comp:-translate-y-0.5 group-hover/comp:opacity-90" />
              </Link>
              {competitor.domain && (
                <span className="font-mono text-[11px] text-white/30">
                  {competitor.domain}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/60">
              {competitor.tagline}
            </p>

            <dl className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {DIMENSION_ORDER.map((dim) => {
                const chip = chipFor(competitor.chips, dim);
                if (!chip) return null;
                const v = VERDICT_STYLES[chip.verdict];
                const Icon = VERDICT_ICON[chip.verdict];
                return (
                  <div
                    key={dim}
                    className="rounded-lg border border-white/[0.05] bg-black/20 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                        {DIMENSION_LABEL[dim]}
                      </dt>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${v.chip}`}
                      >
                        <Icon className="h-3 w-3" />
                        {v.label}
                      </span>
                    </div>
                    <dd className="mt-2 text-xs leading-relaxed text-white/70">
                      {chip.description}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>

      <SourceList sources={data.sources} />
    </SectionCard>
  );
}
