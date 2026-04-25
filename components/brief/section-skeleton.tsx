"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "./section-card";

const STAGES = [
  "Searching the web",
  "Reading sources",
  "Drafting brief",
  "Almost there",
];

export function SectionSkeleton({ title }: { title: string }) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
    }, 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <SectionCard title={title}>
      <div className="space-y-3">
        <div
          className="h-3 w-3/4 animate-pulse rounded bg-white/[0.06]"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <p className="mt-4 inline-flex items-center gap-2 text-xs text-white/30">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
        </span>
        <span
          key={stageIdx}
          className="animate-[fadeIn_400ms_ease-out] tabular-nums"
        >
          {STAGES[stageIdx]}…
        </span>
      </p>
    </SectionCard>
  );
}
