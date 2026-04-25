"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = toSlug(value);
    if (!slug) return;
    router.push(`/c/${slug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-2xl">
      <motion.div
        aria-hidden
        className="absolute -inset-1 rounded-2xl blur-xl"
        style={{
          background: "linear-gradient(90deg, #8B5CF6, #22D3EE, #8B5CF6)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          opacity: focused ? 0.6 : 0.15,
          backgroundPosition: ["0% 0%", "100% 0%"],
        }}
        transition={{
          opacity: { duration: 0.4 },
          backgroundPosition: {
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      />

      <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2 backdrop-blur-xl transition-colors focus-within:border-white/25">
        <Search className="h-5 w-5 shrink-0 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search any company…"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent py-3 text-lg text-white placeholder:text-white/35 outline-none"
        />
        <kbd className="hidden rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-white/50 sm:inline-block">
          ⌘K
        </kbd>
        <button
          type="submit"
          aria-label="Search"
          disabled={!value.trim()}
          className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_0_24px_rgb(139_92_246_/_0.4)] transition disabled:opacity-30 disabled:shadow-none"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
