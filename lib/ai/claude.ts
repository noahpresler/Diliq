import "server-only";
import Anthropic from "@anthropic-ai/sdk";

declare global {
  // eslint-disable-next-line no-var
  var __anthropic: Anthropic | undefined;
}

export const anthropic =
  globalThis.__anthropic ?? (globalThis.__anthropic = new Anthropic());

export const MODEL_DEEP =
  process.env.ANTHROPIC_MODEL_DEEP ?? "claude-opus-4-7";

export const MODEL_FAST =
  process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001";
