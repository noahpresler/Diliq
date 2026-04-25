import { NextResponse } from "next/server";
import { getBrief } from "@/lib/ai/brief";

export const runtime = "nodejs";
export const maxDuration = 120;

const CACHE_HEADERS = {
  "Cache-Control":
    "public, s-maxage=86400, stale-while-revalidate=604800",
} as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const data = await getBrief(decodeURIComponent(slug));
    return NextResponse.json({ ok: true, data }, { headers: CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
