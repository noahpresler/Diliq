import { NextResponse } from "next/server";
import { isSectionId, runSectionById } from "@/lib/ai/sections";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; slug: string }> },
) {
  const { id, slug } = await params;
  if (!isSectionId(id)) {
    return NextResponse.json({ ok: false, error: `Unknown section: ${id}` }, { status: 400 });
  }
  try {
    const data = await runSectionById(id, decodeURIComponent(slug));
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
