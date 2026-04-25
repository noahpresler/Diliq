import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  children,
  className,
  error,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur transition hover:border-white/[0.15]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
        {title}
      </h2>
      <div className="mt-5">
        {error ? (
          <p className="text-sm text-amber-300/70">
            Couldn&apos;t generate this section: {error}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
