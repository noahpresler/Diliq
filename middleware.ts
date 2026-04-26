import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(GATE_COOKIE)?.value;
  const expected = await gateToken();
  if (cookie && cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  const next = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/gate";
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!gate|api/gate|skill|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
