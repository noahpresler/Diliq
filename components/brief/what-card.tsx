"use client";

import type { WhatSection } from "@/lib/ai/schemas";
import { SectionCard } from "./section-card";
import { SectionSkeleton } from "./section-skeleton";
import { SourceList } from "./source-list";
import { useSection } from "./use-section";

const TITLE = "What they do";

export function WhatCard({ slug }: { slug: string }) {
  const state = useSection<WhatSection>("what", slug);

  if (state.status === "loading") return <SectionSkeleton title={TITLE} />;
  if (state.status === "error")
    return <SectionCard title={TITLE} error={state.error} />;

  const data = state.data;
  return (
    <SectionCard title={TITLE}>
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
