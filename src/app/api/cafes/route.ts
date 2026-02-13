import { NextResponse } from "next/server";
import type { CafeApiResponse } from "@/lib/types";
import { CAFE_CONFIGS, MOCK_CAFES } from "@/lib/constants";
import {
  getCached,
  isFresh,
  setCache,
  getNextRefreshTime,
} from "@/lib/cache";
import { fetchAllCafes, createClosedFallback } from "@/lib/google-places";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<CafeApiResponse>> {
  const now = new Date().toISOString();

  // 1. Try fresh cache first
  if (isFresh()) {
    const cached = getCached()!;
    return NextResponse.json({
      cafes: cached.data,
      fetchedAt: new Date(cached.fetchedAt).toISOString(),
      source: cached.data.some((c) => c.source === "live") ? "live" : "cached",
      nextRefresh: getNextRefreshTime(),
    });
  }

  // 2. Try fetching live data
  try {
    const { cafes, source } = await fetchAllCafes();
    setCache(cafes);

    return NextResponse.json({
      cafes,
      fetchedAt: now,
      source,
      nextRefresh: getNextRefreshTime(),
    });
  } catch {
    // 3. Fall back to stale cache
    const stale = getCached();
    if (stale) {
      return NextResponse.json({
        cafes: stale.data,
        fetchedAt: new Date(stale.fetchedAt).toISOString(),
        source: "cached",
        nextRefresh: now, // retry next request
      });
    }

    // 4. Final fallback: hold at 0%
    const closedCafes = CAFE_CONFIGS.map((config) => createClosedFallback(config));
    return NextResponse.json({
      cafes: closedCafes,
      fetchedAt: now,
      source: "live",
      nextRefresh: now,
    });
  }
}
