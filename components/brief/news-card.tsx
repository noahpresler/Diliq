import { runNews } from "@/lib/ai/sections";
import { SectionCard } from "./section-card";
import { ExternalLink } from "lucide-react";
import type { NewsCategory } from "@/lib/ai/schemas";

const CATEGORY_STYLES: Record<NewsCategory, string> = {
  funding: "border-amber-300/30 bg-amber-300/[0.08] text-amber-200",
  product: "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-200",
  people: "border-violet-300/30 bg-violet-300/[0.08] text-violet-200",
  press: "border-white/15 bg-white/[0.04] text-white/70",
  other: "border-white/10 bg-white/[0.02] text-white/50",
};

function fmtDate(s: string) {
  // Accepts YYYY-MM-DD or YYYY-MM. Render as 'MMM d, yyyy' / 'MMM yyyy'.
  const parts = s.split("-").map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return s;
  const [y, m, d] = parts;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[m - 1] ?? "";
  return d ? `${month} ${d}, ${y}` : `${month} ${y}`;
}

export async function NewsCard({ slug }: { slug: string }) {
  let data;
  try {
    data = await runNews(slug);
  } catch (e) {
    return (
      <SectionCard
        title="Recent news"
        error={e instanceof Error ? e.message : "Unknown error"}
      />
    );
  }
  return (
    <SectionCard title="Recent news">
      {data.items.length === 0 ? (
        <p className="text-sm text-white/50">
          No notable news found in the last 12 months.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {data.items.map((item, i) => (
            <li key={`${i}-${item.url}`} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
                <span>{fmtDate(item.date)}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${CATEGORY_STYLES[item.category]}`}
                >
                  {item.category}
                </span>
                <span>·</span>
                <span>{item.source}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-start gap-1.5 text-base font-medium text-white transition hover:text-white/80"
              >
                {item.title}
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 opacity-50" />
              </a>
              <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                {item.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
