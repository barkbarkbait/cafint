import type { CafeData } from "./types";
import { CACHE_TTL_MS } from "./constants";

interface CacheEntry {
  data: CafeData[];
  fetchedAt: number;
  previousData?: CafeData[];
}

let cache: CacheEntry | null = null;

export function getCached(): CacheEntry | null {
  return cache;
}

export function isFresh(): boolean {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

export function isStale(): boolean {
  // Stale = exists but older than TTL. We'll still serve it as fallback.
  return cache !== null && !isFresh();
}

export function setCache(data: CafeData[]): void {
  cache = {
    data,
    fetchedAt: Date.now(),
    previousData: cache?.data,
  };
}

export function calculateTrend(
  current: number,
  previous: number | undefined
): "rising" | "falling" | "stable" {
  if (previous === undefined) return "stable";
  const delta = ((current - previous) / Math.max(previous, 1)) * 100;
  if (delta > 5) return "rising";
  if (delta < -5) return "falling";
  return "stable";
}

export function getNextRefreshTime(): string {
  if (!cache) return new Date().toISOString();
  return new Date(cache.fetchedAt + CACHE_TTL_MS).toISOString();
}
