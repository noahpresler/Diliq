import { Aurora } from "@/components/motion/aurora";

export const dynamic = "force-dynamic";

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/", error } = await searchParams;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
      <Aurora />

      <form
        action="/api/gate"
        method="POST"
        className="relative z-10 flex w-full max-w-sm flex-col items-stretch gap-4 text-center"
      >
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgb(139,92,246)]" />
          Private preview
        </span>

        <h1 className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-5xl font-medium tracking-tight text-transparent">
          Diliq
        </h1>

        <p className="text-sm text-white/60">
          Enter the password to continue.
        </p>

        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          autoFocus
          required
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white outline-none placeholder:text-white/35 focus:border-white/25"
        />

        {error ? (
          <p className="text-xs text-red-400">Incorrect password.</p>
        ) : null}

        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 px-5 py-3 text-sm font-medium text-white shadow-[0_0_24px_rgb(139_92_246_/_0.4)]"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
