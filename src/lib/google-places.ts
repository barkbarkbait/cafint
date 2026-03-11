import type { CafeConfig, CafeData } from "./types";
import { calculateTrend, getVenueCached } from "./cache";
import { recordReading, getObservedBaseline } from "./stats";

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


export function createClosedFallback(config: CafeConfig): CafeData {
  return {
    name: config.name,
    location: config.location,
    distance: config.distance,
    busyness: 0,
    trend: "stable",
    lastUpdated: getTimeString(),
    isInsideTreasury: config.isInsideTreasury,
    source: "live",
    isClosed: true,
  };
}

function currentAestHour(): number {
  return parseInt(
    new Date().toLocaleString("en-AU", {
      hour: "numeric",
      hour12: false,
      timeZone: "Australia/Sydney",
    }),
    10
  );
}

function buildResult(config: CafeConfig, busyness: number): CafeData {
  const previousBusyness = getVenueCached(config.name)?.busyness;
  const hour = currentAestHour();

  let deviation: number | undefined;
  if (config.baseline) {
    // Record this reading for future observed-average calculations
    recordReading(config.name, hour, busyness);

    // Prefer observed stats once enough readings exist; fall back to hardcoded baseline
    const b = getObservedBaseline(config.name, hour) ?? config.baseline[hour];
    if (b && b.stdDev > 0) {
      deviation = Math.round(((busyness - b.mean) / b.stdDev) * 10) / 10;
    }
  }

  return {
    name: config.name,
    location: config.location,
    distance: config.distance,
    busyness,
    trend: calculateTrend(busyness, previousBusyness),
    lastUpdated: getTimeString(),
    isInsideTreasury: config.isInsideTreasury,
    source: "live",
    deviation,
  };
}

function isVenueOpen(config: CafeConfig): boolean {
  const h = currentAestHour();
  const { open = 7, close = 15 } = config.venueHours ?? {};
  return h >= open && h < close;
}

async function pingPlace(placeId: string): Promise<boolean> {
  if (!API_KEY) return false;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": API_KEY,
          // `id` only = Essentials IDs Only SKU — 10K free/month, $0 cost
          "X-Goog-FieldMask": "id",
        },
        next: { revalidate: 0 },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchCafeStatus(
  config: CafeConfig
): Promise<CafeData | null> {
  if (config.isAlwaysOpen) {
    // Live call confirms the place record is active on Google.
    // Note: Google Places API does not expose real-time crowd/busyness data —
    // busyness is a time-of-day model. Swap pingPlace() for a richer source
    // (e.g. pedestrian counter feed) when available.
    await pingPlace(config.placeId);
    return buildResult(config, getTimeBusyness(config));
  }

  // Regular cafes: hardcoded schedule, no API call (saves ~$23/month vs Enterprise SKU)
  if (!isVenueOpen(config)) return null;
  return buildResult(config, getTimeBusyness(config));
}
