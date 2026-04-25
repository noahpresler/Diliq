import { runNews } from "@/lib/ai/sections";
import { SectionCard } from "./section-card";
import { ExternalLink } from "lucide-react";
import type { NewsCategory } from "@/lib/ai/schemas";

const CATEGORY_STYLES: Record<NewsCategory, string> = {
  funding: "border-amber-300/30 bg-amber-300/[0.08] text-amber-200",
  product: "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-200",
  people: "border-violet-300/30 bg-violet-300/[0.08] text-violet-200",
  press: "border-white/15 bg-white/[0.04] text-white/75",
  other: "border-white/10 bg-white/[0.02] text-white/55",
};

const MONTHS = [
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

function fmtDate(s: string) {
  const parts = s.split("-").map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return s;
  const [y, m, d] = parts;
  const month = MONTHS[m - 1] ?? "";
  return d ? `${month} ${d}, ${y}` : `${month} ${y}`;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
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
        <p className="text-sm text-white/55">
          No notable news found in the last 12 months.
        </p>
      ) : (
        <ul className="-mx-2 divide-y divide-white/[0.06]">
          {data.items.map((item, i) => (
            <li
              key={`${i}-${item.url}`}
              className="rounded-lg px-2 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-white/[0.015]"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                <span className="tabular-nums">{fmtDate(item.date)}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${CATEGORY_STYLES[item.category]}`}
                >
                  {item.category}
                </span>
                <span className="text-white/25">·</span>
                <span className="text-white/55">{item.source}</span>
                {hostOf(item.url) && (
                  <span className="text-white/30">{hostOf(item.url)}</span>
                )}
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/news mt-2 inline-flex items-start gap-1.5 text-base font-medium leading-snug text-white transition hover:text-white/85"
              >
                {item.title}
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 opacity-40 transition group-hover/news:opacity-90" />
              </a>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                {item.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
