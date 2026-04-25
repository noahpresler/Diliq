import type { ResolvedCompany } from "@/lib/ai/schemas";
import { ExternalLink } from "lucide-react";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function Hero({ company }: { company: ResolvedCompany }) {
  const today = new Date().toISOString().slice(0, 10);
  const initials = initialsOf(company.name) || "·";
  return (
    <header className="relative flex flex-col gap-6 border-b border-white/[0.08] pb-10 pt-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          {company.domain ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-500/30 to-cyan-400/30 text-xl font-medium text-white">
              {initials}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Company brief
          </p>
          <h1 className="mt-1 text-4xl font-medium tracking-tight sm:text-6xl">
            {company.name}
          </h1>
          {company.domain && (
            <a
              href={`https://${company.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
            >
              {company.domain}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <span className="self-start rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/45 sm:self-end">
        as of {today}
      </span>
    </header>
  );
}
