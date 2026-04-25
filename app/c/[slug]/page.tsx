import Link from "next/link";

const SECTIONS = [
  "What they do",
  "Founders & key people",
  "Recent news",
  "Fundraising history",
  "Market & competitors",
  "Investment signals",
  "Risks & open questions",
];

function titleize(slug: string) {
  return slug
    .split("-")
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = titleize(decodeURIComponent(slug));

  return (
    <main className="relative min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-white/50 transition hover:text-white/90"
        >
          ← Back
        </Link>

        <header className="mt-10 flex items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">
              Company
            </p>
            <h1 className="mt-2 text-5xl font-medium tracking-tight sm:text-6xl">
              {name}
            </h1>
          </div>
          <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
            Brief generation lands in Phase 1
          </span>
        </header>

        <section className="mt-10 grid gap-4">
          {SECTIONS.map((title, i) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur transition hover:border-white/20"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
              <h2 className="text-xs font-medium uppercase tracking-wider text-white/50">
                {title}
              </h2>
              <div className="mt-4 space-y-3">
                <div
                  className="h-3 animate-pulse rounded bg-white/[0.05]"
                  style={{ width: `${85 - i * 5}%` }}
                />
                <div
                  className="h-3 animate-pulse rounded bg-white/[0.05]"
                  style={{ width: `${70 - i * 4}%`, animationDelay: "150ms" }}
                />
                <div
                  className="h-3 animate-pulse rounded bg-white/[0.05]"
                  style={{ width: `${55 - i * 3}%`, animationDelay: "300ms" }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
