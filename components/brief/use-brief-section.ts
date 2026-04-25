"use client";

import { useEffect, useState } from "react";
import type { Brief } from "@/lib/ai/schemas";

type State<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: string };

const STATIC_KEYS = ["what", "competitors"] as const;
type StaticKey = (typeof STATIC_KEYS)[number];

function endpointFor(key: keyof Brief): "static" | "fresh" {
  return (STATIC_KEYS as readonly string[]).includes(key) ? "static" : "fresh";
}

const inflight = new Map<string, Promise<Record<string, unknown>>>();
const resolved = new Map<string, Record<string, unknown>>();
const failed = new Map<string, string>();

function cacheKey(slug: string, endpoint: "static" | "fresh") {
  return `${endpoint}:${slug}`;
}

function fetchPart(
  slug: string,
  endpoint: "static" | "fresh",
): Promise<Record<string, unknown>> {
  const ck = cacheKey(slug, endpoint);
  let p = inflight.get(ck);
  if (p) return p;
  p = fetch(`/api/brief/${endpoint}/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  })
    .then(async (res) => {
      const body = (await res.json().catch(() => null)) as
        | { ok: true; data: Record<string, unknown> }
        | { ok: false; error: string }
        | null;
      if (!body) throw new Error(`HTTP ${res.status}`);
      if (!body.ok) throw new Error(body.error);
      resolved.set(ck, body.data);
      return body.data;
    })
    .catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      failed.set(ck, msg);
      throw err;
    })
    .finally(() => {
      inflight.delete(ck);
    });
  inflight.set(ck, p);
  return p;
}

export function useBriefSection<K extends keyof Brief>(
  slug: string,
  key: K,
): State<Brief[K]> {
  const endpoint = endpointFor(key);
  const ck = cacheKey(slug, endpoint);

  const [state, setState] = useState<State<Brief[K]>>(() => {
    const r = resolved.get(ck);
    if (r) return { status: "ok", data: r[key as string] as Brief[K] };
    const f = failed.get(ck);
    if (f) return { status: "error", error: f };
    return { status: "loading" };
  });

  useEffect(() => {
    let cancelled = false;

    const r = resolved.get(ck);
    if (r) {
      setState({ status: "ok", data: r[key as string] as Brief[K] });
      return;
    }
    const f = failed.get(ck);
    if (f) {
      setState({ status: "error", error: f });
      return;
    }

    setState({ status: "loading" });

    const timer = setTimeout(() => {
      fetchPart(slug, endpoint)
        .then((part) => {
          if (!cancelled)
            setState({ status: "ok", data: part[key as string] as Brief[K] });
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
  }, [slug, key, endpoint, ck]);

  return state;
}
