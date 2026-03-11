import { NextResponse } from "next/server";
import type { CafeConfig, CafeApiResponse } from "@/lib/types";
import { CAFE_CONFIGS, CACHE_TTL_MS } from "@/lib/constants";
import {
  isVenueFresh,
  getVenueCached,
  setVenueCache,
  getVenueExpiry,
} from "@/lib/cache";
import { fetchCafeStatus, createClosedFallback } from "@/lib/google-places";

export const dynamic = "force-dynamic";

async function resolveVenue(config: CafeConfig): Promise<void> {
  const ttl = config.refreshIntervalMs ?? CACHE_TTL_MS;

  if (config.isAlwaysOpen) {
    // Always-open: serve cache if fresh, otherwise fetch
    if (isVenueFresh(config.name, ttl)) return;
    setVenueCache((await fetchCafeStatus(config)) ?? createClosedFallback(config));
  } else {
    // Regular venue: fetchCafeStatus returns null when outside venueHours → no caching
    if (isVenueFresh(config.name, ttl)) return;
    const fresh = await fetchCafeStatus(config);
    if (fresh !== null) setVenueCache(fresh);
  }
}

export async function GET(): Promise<NextResponse<CafeApiResponse>> {
  const now = new Date().toISOString();

  await Promise.allSettled(CAFE_CONFIGS.map(resolveVenue));

  const cafes = CAFE_CONFIGS.map(
    (config) => getVenueCached(config.name) ?? createClosedFallback(config)
  );

  // Next refresh = earliest cache expiry across all venues
  const nextRefresh = new Date(
    Math.min(
      ...CAFE_CONFIGS.map((c) =>
        getVenueExpiry(c.name, c.refreshIntervalMs ?? CACHE_TTL_MS)
      )
    )
  ).toISOString();

  return NextResponse.json({
    cafes,
    fetchedAt: now,
    source: "live",
    nextRefresh,
  });
}
