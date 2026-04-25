import { Aurora } from "@/components/motion/aurora";
import { SearchBar } from "@/components/search-bar";

const TRENDING = [
  "Anthropic",
  "Ramp",
  "Figma",
  "Cursor",
  "Mercury",
  "Linear",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
      <Aurora />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgb(139,92,246)]" />
          AI-native company intelligence
        </span>

        <h1 className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-6xl font-medium tracking-tight text-transparent sm:text-8xl">
          Diliq
        </h1>

        <p className="mt-6 max-w-xl text-balance text-lg text-white/60">
          Search any company. Get an instant, source-cited investment brief —
          founders, fundraising, signals, risks.
        </p>

        <div className="mt-12 w-full">
          <SearchBar />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-white/30">Trending</span>
          {TRENDING.map((name) => (
            <a
              key={name}
              href={`/c/${name.toLowerCase()}`}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-white/70 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              {name}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
