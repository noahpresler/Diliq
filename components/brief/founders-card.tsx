import { runFounders } from "@/lib/ai/sections";
import { SectionCard } from "./section-card";
import { SourceList } from "./source-list";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export async function FoundersCard({ slug }: { slug: string }) {
  let data;
  try {
    data = await runFounders(slug);
  } catch (e) {
    return (
      <SectionCard
        title="Founders & key people"
        error={e instanceof Error ? e.message : "Unknown error"}
      />
    );
  }
  return (
    <SectionCard title="Founders & key people">
      <ul className="divide-y divide-white/[0.06]">
        {data.people.map((p, i) => (
          <li
            key={`${p.name}-${i}`}
            className="grid grid-cols-1 gap-x-6 gap-y-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(220px,1fr)_2fr]"
          >
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-400/20 text-xs font-medium text-white/85"
              >
                {initialsOf(p.name) || "·"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{p.name}</p>
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
      <SourceList sources={data.sources} />
    </SectionCard>
  );
}
