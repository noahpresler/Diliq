import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const nextRaw = String(form.get("next") ?? "/");
  const safeNext =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  const expected = process.env.SITE_PASSWORD ?? "";
  if (!expected || password !== expected) {
    return NextResponse.redirect(
      new URL(
        `/gate?error=1&next=${encodeURIComponent(safeNext)}`,
        req.url,
      ),
      303,
    );
  }

  const res = NextResponse.redirect(new URL(safeNext, req.url), 303);
  res.cookies.set(GATE_COOKIE, await gateToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
