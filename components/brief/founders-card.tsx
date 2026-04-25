import { runFounders } from "@/lib/ai/sections";
import { SectionCard } from "./section-card";
import { SourceList } from "./source-list";

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
            className="grid grid-cols-1 gap-x-6 gap-y-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(180px,1fr)_2fr]"
          >
            <div>
              <p className="font-medium text-white">{p.name}</p>
              <p className="text-sm text-white/45">{p.role}</p>
            </div>
            <div className="text-sm leading-relaxed text-white/70">
              {p.background}
              {p.notableSignal && (
                <span className="mt-2 block">
                  <span className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2 py-0.5 text-[11px] text-amber-200/90">
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
