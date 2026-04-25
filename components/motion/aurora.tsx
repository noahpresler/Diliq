"use client";

import { motion } from "framer-motion";

export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #8B5CF6 0%, transparent 65%)",
        }}
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10rem] top-[20%] h-[36rem] w-[36rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #22D3EE 0%, transparent 65%)",
        }}
        animate={{ x: [0, -100, 60, 0], y: [0, 80, -40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10rem] left-1/3 h-[32rem] w-[32rem] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #F59E0B 0%, transparent 65%)",
        }}
        animate={{ x: [0, 60, -80, 0], y: [0, -40, 60, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* fine grain noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      {/* vignette to anchor content */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,10,15,0.7)_100%)]" />
    </div>
  );
}
