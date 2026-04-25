import type { Source } from "@/lib/ai/schemas";
import { ExternalLink } from "lucide-react";

export function SourceList({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-6 border-t border-white/[0.06] pt-4">
      <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
        Sources
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {sources.map((s, i) => {
          let host: string;
          try {
            host = new URL(s.url).hostname.replace(/^www\./, "");
          } catch {
            host = s.url;
          }
          return (
            <li key={`${i}-${s.url}`}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs text-white/55 transition hover:border-white/20 hover:text-white"
                title={s.title}
              >
                {host}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
