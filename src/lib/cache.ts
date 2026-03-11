import type { CafeData } from "./types";

interface VenueEntry {
  data: CafeData;
  fetchedAt: number;
}

const venueCache = new Map<string, VenueEntry>();

export function isVenueFresh(name: string, ttlMs: number): boolean {
  const entry = venueCache.get(name);
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < ttlMs;
}

export function getVenueCached(name: string): CafeData | undefined {
  return venueCache.get(name)?.data;
}

export function setVenueCache(data: CafeData): void {
  venueCache.set(data.name, { data, fetchedAt: Date.now() });
}

export function getVenueExpiry(name: string, ttlMs: number): number {
  const entry = venueCache.get(name);
  if (!entry) return Date.now(); // already expired
  return entry.fetchedAt + ttlMs;
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
