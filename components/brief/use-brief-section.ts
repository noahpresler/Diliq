"use client";

import { useEffect, useState } from "react";
import type { Brief } from "@/lib/ai/schemas";

type State<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: string };

const inflight = new Map<string, Promise<Brief>>();
const resolved = new Map<string, Brief>();
const failed = new Map<string, string>();

function fetchBrief(slug: string): Promise<Brief> {
  let p = inflight.get(slug);
  if (p) return p;
  p = fetch(`/api/brief/${encodeURIComponent(slug)}`, { cache: "no-store" })
    .then(async (res) => {
      const body = (await res.json().catch(() => null)) as
        | { ok: true; data: Brief }
        | { ok: false; error: string }
        | null;
      if (!body) throw new Error(`HTTP ${res.status}`);
      if (!body.ok) throw new Error(body.error);
      resolved.set(slug, body.data);
      return body.data;
    })
    .catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      failed.set(slug, msg);
      throw err;
    })
    .finally(() => {
      inflight.delete(slug);
    });
  inflight.set(slug, p);
  return p;
}

export function useBriefSection<K extends keyof Brief>(
  slug: string,
  key: K,
): State<Brief[K]> {
  const [state, setState] = useState<State<Brief[K]>>(() => {
    const r = resolved.get(slug);
    if (r) return { status: "ok", data: r[key] };
    const f = failed.get(slug);
    if (f) return { status: "error", error: f };
    return { status: "loading" };
  });

  useEffect(() => {
    let cancelled = false;

    const r = resolved.get(slug);
    if (r) {
      setState({ status: "ok", data: r[key] });
      return;
    }
    const f = failed.get(slug);
    if (f) {
      setState({ status: "error", error: f });
      return;
    }

    setState({ status: "loading" });

    // Engagement gate: a back-button bounce within 500ms cancels the timer
    // before fetchBrief runs, so we never pay for users who didn't stick.
    const timer = setTimeout(() => {
      fetchBrief(slug)
        .then((brief) => {
          if (!cancelled) setState({ status: "ok", data: brief[key] });
        })
        .catch((err) => {
          if (!cancelled)
            setState({
              status: "error",
              error: err instanceof Error ? err.message : String(err),
            });
        });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, key]);

  return state;
}
