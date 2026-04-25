import { runWhat } from "@/lib/ai/sections";
import { SectionCard } from "./section-card";
import { SourceList } from "./source-list";

export async function WhatCard({ slug }: { slug: string }) {
  let data;
  try {
    data = await runWhat(slug);
  } catch (e) {
    return (
      <SectionCard
        title="What they do"
        error={e instanceof Error ? e.message : "Unknown error"}
      />
    );
  }
  return (
    <SectionCard title="What they do">
      <p className="text-2xl font-medium leading-snug tracking-tight text-white">
        {data.tagline}
      </p>
      <p className="mt-5 text-base leading-relaxed text-white/80">
        {data.summary}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-white/65">
        {data.howItWorks}
      </p>
      <SourceList sources={data.sources} />
    </SectionCard>
  );
}
