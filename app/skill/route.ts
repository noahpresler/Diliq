import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "skills", "diliq", "SKILL.md");
    const content = await readFile(filePath, "utf-8");
    return new Response(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("skill not found", { status: 404 });
  }
}
