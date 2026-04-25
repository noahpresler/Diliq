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
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-12 -top-24 -z-10 h-64 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(139,92,246,0.18), transparent 70%), radial-gradient(ellipse 50% 70% at 80% 50%, rgba(34,211,238,0.12), transparent 70%)",
        }}
      />

      <div className="flex items-center gap-5">
        <div className="relative h-16 w-16 shrink-0">
          <div
            aria-hidden
            className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/30 to-cyan-400/20 opacity-50 blur-xl"
          />
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
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
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
            Company brief
          </p>
          <h1 className="mt-1.5 bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-4xl font-medium tracking-tight text-transparent sm:text-6xl">
            {company.name}
          </h1>
          {company.domain && (
            <a
              href={`https://${company.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white"
            >
              {company.domain}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-end">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[11px] text-white/55 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/60 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
          </span>
          as of {today}
        </span>
      </div>
    </header>
  );
}
