import "server-only";
import { Redis } from "@upstash/redis";

let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    _redis = null;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

type Entry = { value: unknown; expiresAt: number };
const memCache = new Map<string, Entry>();

export async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    const v = await redis.get<T>(key);
    return v ?? null;
  }
  const entry = memCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export async function kvSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function kvIsConfigured(): boolean {
  return getRedis() !== null;
}
