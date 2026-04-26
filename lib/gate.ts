export const GATE_COOKIE = "diliq_gate";

export async function gateToken(): Promise<string> {
  const pw = process.env.SITE_PASSWORD ?? "";
  const data = new TextEncoder().encode(`diliq:${pw}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
