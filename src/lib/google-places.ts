import type { CafeConfig, CafeData } from "./types";
import { CAFE_CONFIGS } from "./constants";
import { calculateTrend, getCached } from "./cache";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

function getTimeString(): string {
  return new Date().toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
  }) + " AEDT";
}

function getTimeBusyness(config: CafeConfig): number {
  const hour = new Date().toLocaleString("en-AU", {
    hour: "numeric",
    hour12: false,
    timeZone: "Australia/Sydney",
  });
  const h = parseInt(hour, 10);

  let base: number;
  if (h < 7 || h >= 18) {
    base = 10 + Math.floor(Math.random() * 15);
  } else if (h >= 7 && h < 9) {
    base = 50 + Math.floor(Math.random() * 30);
  } else if (h >= 11 && h < 14) {
    base = 55 + Math.floor(Math.random() * 35);
  } else if (h >= 14 && h < 16) {
    base = 40 + Math.floor(Math.random() * 25);
  } else {
    base = 30 + Math.floor(Math.random() * 25);
  }

  if (config.isInsideTreasury) {
    base = Math.min(100, base + 10);
  }

  return base;
}

export function createMockFallback(config: CafeConfig): CafeData {
  const busyness = getTimeBusyness(config);
  const cached = getCached();
  const previousBusyness = cached?.data.find(
    (c) => c.name === config.name
  )?.busyness;

  return {
    name: config.name,
    location: config.location,
    distance: config.distance,
    busyness,
    trend: calculateTrend(busyness, previousBusyness),
    lastUpdated: getTimeString(),
    isInsideTreasury: config.isInsideTreasury,
    source: "mock",
  };
}

async function fetchCafeStatus(
  config: CafeConfig
): Promise<CafeData | null> {
  if (!API_KEY) return null;

  try {
    const url = `https://places.googleapis.com/v1/places/${config.placeId}`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "id,regularOpeningHours.openNow,rating,userRatingCount",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const isOpen = data.regularOpeningHours?.openNow ?? false;

    // If closed, busyness is 0. If open, use time-of-day estimate.
    const busyness = isOpen ? getTimeBusyness(config) : 0;

    const cached = getCached();
    const previousBusyness = cached?.data.find(
      (c) => c.name === config.name
    )?.busyness;

    return {
      name: config.name,
      location: config.location,
      distance: config.distance,
      busyness,
      trend: calculateTrend(busyness, previousBusyness),
      lastUpdated: getTimeString(),
      isInsideTreasury: config.isInsideTreasury,
      source: "live",
    };
  } catch {
    return null;
  }
}

export async function fetchAllCafes(): Promise<{
  cafes: CafeData[];
  source: "live" | "mock";
}> {
  const results = await Promise.allSettled(
    CAFE_CONFIGS.map((config) => fetchCafeStatus(config))
  );

  let liveCount = 0;
  const cafes: CafeData[] = CAFE_CONFIGS.map((config, i) => {
    const result = results[i];
    if (result.status === "fulfilled" && result.value !== null) {
      liveCount++;
      return result.value;
    }
    return createMockFallback(config);
  });

  return {
    cafes,
    source: liveCount > 0 ? "live" : "mock",
  };
}
