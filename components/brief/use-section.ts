"use client";

import { useEffect, useState } from "react";
import type { SectionId } from "@/lib/ai/sections";

type State<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: string };

export function useSection<T>(id: SectionId, slug: string): State<T> {
  const [state, setState] = useState<State<T>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    fetch(`/api/section/${id}/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => null)) as
          | { ok: true; data: T }
          | { ok: false; error: string }
          | null;
        if (controller.signal.aborted) return;
        if (!body) {
          setState({ status: "error", error: `HTTP ${res.status}` });
          return;
        }
        setState(
          body.ok
            ? { status: "ok", data: body.data }
            : { status: "error", error: body.error },
        );
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          error: e instanceof Error ? e.message : "Network error",
        });
      });

    return () => controller.abort();
  }, [id, slug]);

  return state;
}
