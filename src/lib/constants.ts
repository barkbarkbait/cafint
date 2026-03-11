import type { CafeConfig, CafeData, GaugeLevel, HourlyBaseline } from "./types";

export const CACHE_TTL_MS = 3_600_000; // 1 hour
export const MONUMENT_REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Cafe baselines: expected busyness % by hour (AEST, hours 7-17 only).
 * Derived from Google Maps Popular Times patterns for each venue type.
 * Observed readings accumulate in data/venue-stats.json and replace these over time.
 */

// Treasury Building — captive internal audience, highly predictable
const COFFERS_BASELINE: Record<number, HourlyBaseline> = {
   7: { mean: 30, stdDev: 12 },
   8: { mean: 64, stdDev: 14 },
   9: { mean: 38, stdDev: 11 },
  10: { mean: 50, stdDev: 13 },
  11: { mean: 44, stdDev: 12 },
  12: { mean: 80, stdDev: 12 },
  13: { mean: 70, stdDev: 13 },
  14: { mean: 42, stdDev: 13 },
  15: { mean: 26, stdDev: 10 },
  16: { mean: 16, stdDev:  8 },
  17: { mean: 10, stdDev:  6 },
};

// John Gorton Building — bistro, broader interagency clientele
const WILD_HONEY_BASELINE: Record<number, HourlyBaseline> = {
   7: { mean: 22, stdDev: 11 },
   8: { mean: 52, stdDev: 17 },
   9: { mean: 34, stdDev: 12 },
  10: { mean: 44, stdDev: 15 },
  11: { mean: 46, stdDev: 14 },
  12: { mean: 72, stdDev: 17 },
  13: { mean: 64, stdDev: 16 },
  14: { mean: 40, stdDev: 14 },
  15: { mean: 28, stdDev: 11 },
  16: { mean: 18, stdDev:  9 },
  17: { mean: 12, stdDev:  7 },
};

// West Block — heritage precinct, smaller venue, earlier close
const HERITAGE_BASELINE: Record<number, HourlyBaseline> = {
   7: { mean: 20, stdDev: 10 },
   8: { mean: 48, stdDev: 16 },
   9: { mean: 30, stdDev: 11 },
  10: { mean: 42, stdDev: 14 },
  11: { mean: 40, stdDev: 13 },
  12: { mean: 66, stdDev: 16 },
  13: { mean: 58, stdDev: 15 },
  14: { mean: 36, stdDev: 13 },
  15: { mean: 22, stdDev:  9 },
  16: { mean: 14, stdDev:  7 },
  17: { mean:  8, stdDev:  5 },
};

// Griffin Building — faces Constitution Ave, some passing foot traffic
const CATBIRD_BASELINE: Record<number, HourlyBaseline> = {
   7: { mean: 26, stdDev: 12 },
   8: { mean: 54, stdDev: 17 },
   9: { mean: 36, stdDev: 12 },
  10: { mean: 46, stdDev: 15 },
  11: { mean: 44, stdDev: 14 },
  12: { mean: 70, stdDev: 17 },
  13: { mean: 62, stdDev: 16 },
  14: { mean: 44, stdDev: 14 },
  15: { mean: 32, stdDev: 12 },
  16: { mean: 22, stdDev: 10 },
  17: { mean: 14, stdDev:  7 },
};

// National Library — public institution, researcher + tourist mix, open later
const BOOKPLATE_BASELINE: Record<number, HourlyBaseline> = {
   7: { mean: 14, stdDev:  8 },
   8: { mean: 28, stdDev: 13 },
   9: { mean: 36, stdDev: 14 },
  10: { mean: 48, stdDev: 16 },
  11: { mean: 52, stdDev: 16 },
  12: { mean: 62, stdDev: 18 },
  13: { mean: 58, stdDev: 17 },
  14: { mean: 48, stdDev: 15 },
  15: { mean: 42, stdDev: 14 },
  16: { mean: 36, stdDev: 14 },
  17: { mean: 28, stdDev: 12 },
};

// National Archives — public institution, researcher clientele, quieter overall
const CAFE_CONSTITUTION_BASELINE: Record<number, HourlyBaseline> = {
   7: { mean: 12, stdDev:  7 },
   8: { mean: 26, stdDev: 12 },
   9: { mean: 34, stdDev: 13 },
  10: { mean: 44, stdDev: 14 },
  11: { mean: 42, stdDev: 13 },
  12: { mean: 56, stdDev: 17 },
  13: { mean: 52, stdDev: 15 },
  14: { mean: 40, stdDev: 13 },
  15: { mean: 30, stdDev: 11 },
  16: { mean: 22, stdDev:  9 },
  17: { mean: 14, stdDev:  7 },
};

/**
 * Expected foot-traffic baseline for the Australian-American Memorial by hour (AEST).
 * Reflects patterns at a public landmark adjacent to Defence HQ Russell.
 * Update with real data as it accumulates.
 */
const EAGLE_BASELINE: Record<number, HourlyBaseline> = {
   0: { mean:  3, stdDev:  2 },
   1: { mean:  2, stdDev:  2 },
   2: { mean:  2, stdDev:  2 },
   3: { mean:  2, stdDev:  2 },
   4: { mean:  3, stdDev:  2 },
   5: { mean:  6, stdDev:  4 },
   6: { mean: 10, stdDev:  6 },
   7: { mean: 28, stdDev: 12 },
   8: { mean: 48, stdDev: 16 },
   9: { mean: 30, stdDev: 11 },
  10: { mean: 20, stdDev:  8 },
  11: { mean: 38, stdDev: 14 },
  12: { mean: 55, stdDev: 18 },
  13: { mean: 50, stdDev: 16 },
  14: { mean: 32, stdDev: 12 },
  15: { mean: 26, stdDev: 10 },
  16: { mean: 36, stdDev: 13 },
  17: { mean: 46, stdDev: 15 },
  18: { mean: 22, stdDev:  9 },
  19: { mean: 12, stdDev:  6 },
  20: { mean:  7, stdDev:  4 },
  21: { mean:  5, stdDev:  3 },
  22: { mean:  4, stdDev:  3 },
  23: { mean:  3, stdDev:  2 },
};

export const GAUGE_LEVELS: GaugeLevel[] = [
  {
    label: "Flex Friday",
    range: [0, 25],
    color: "#22c55e",
    description:
      "Negligible activity. Consistent with approved flex arrangements or public holiday.",
  },
  {
    label: "Brief Due COB",
    range: [25, 50],
    color: "#eab308",
    description:
      "Standard operational tempo. Routine briefings and BAU workload across the department.",
  },
  {
    label: "Cabinet Crunch",
    range: [50, 75],
    color: "#f97316",
    description:
      "Elevated caffeine demand. Queue extending past the napkin station.",
  },
  {
    label: "Budget Surge",
    range: [75, 100],
    color: "#ef4444",
    description:
      "Maximum tempo. All cafes at capacity. Keep cups arriving in bulk. Something is happening.",
  },
];

export const CAFE_CONFIGS: CafeConfig[] = [
  {
    name: "Coffers Cafe",
    location: "Treasury Building, 1 Langton Crescent",
    distance: "0m",
    placeId: "ChIJU7Hk21KsF2sR93lmIo1DaU4",
    isInsideTreasury: true,
    baseline: COFFERS_BASELINE,
    venueHours: { open: 7, close: 15 },
  },
  {
    name: "Wild Honey Bistro",
    location: "John Gorton Building, King Edward Terrace",
    distance: "~300m",
    placeId: "ChIJQdPdShpNFmsRMvi5PXL6Yu0",
    baseline: WILD_HONEY_BASELINE,
    venueHours: { open: 7, close: 15 },
  },
  {
    name: "Heritage Cafe",
    location: "West Block, 21 Queen Victoria Terrace",
    distance: "~400m",
    placeId: "ChIJbx9hm0JNFmsREyj0MN4UaQA",
    baseline: HERITAGE_BASELINE,
    venueHours: { open: 8, close: 15 },
  },
  {
    name: "Catbird",
    location: "44 Constitution Ave, Griffin Building",
    distance: "~500m",
    placeId: "ChIJ4UDLCABNFmsRZr24D3IR9ug",
    baseline: CATBIRD_BASELINE,
    venueHours: { open: 7, close: 16 },
  },
  {
    name: "Bookplate",
    location: "National Library of Australia",
    distance: "~600m",
    placeId: "ChIJLylmCBdNFmsRMo64BJmkO6A",
    baseline: BOOKPLATE_BASELINE,
    venueHours: { open: 8, close: 17 },
  },
  {
    name: "Cafe Constitution",
    location: "National Archives of Australia",
    distance: "~700m",
    placeId: "ChIJNwCafM5NFmsRX8XG5hgPaPg",
    baseline: CAFE_CONSTITUTION_BASELINE,
    venueHours: { open: 9, close: 16 },
  },
  {
    name: "Australian-American Memorial 'The Eagle'",
    location: "Blamey Square, Russell",
    distance: "~1.2km",
    placeId: "ChIJycCZ8qBNFmsRyGVBjO-hGpo",
    isAlwaysOpen: true,
    refreshIntervalMs: MONUMENT_REFRESH_INTERVAL_MS,
    baseline: EAGLE_BASELINE,
  },
];

export const MOCK_CAFES: CafeData[] = [
  {
    name: "Coffers Cafe",
    location: "Treasury Building, 1 Langton Crescent",
    distance: "0m",
    busyness: 72,
    trend: "rising",
    lastUpdated: "14:32 AEDT",
    isInsideTreasury: true,
    source: "mock",
  },
  {
    name: "Wild Honey Bistro",
    location: "John Gorton Building, King Edward Terrace",
    distance: "~300m",
    busyness: 58,
    trend: "stable",
    lastUpdated: "14:28 AEDT",
    source: "mock",
  },
  {
    name: "Heritage Cafe",
    location: "West Block, 21 Queen Victoria Terrace",
    distance: "~400m",
    busyness: 45,
    trend: "falling",
    lastUpdated: "14:30 AEDT",
    source: "mock",
  },
  {
    name: "Catbird",
    location: "44 Constitution Ave, Griffin Building",
    distance: "~500m",
    busyness: 63,
    trend: "rising",
    lastUpdated: "14:25 AEDT",
    source: "mock",
  },
  {
    name: "Bookplate",
    location: "National Library of Australia",
    distance: "~600m",
    busyness: 34,
    trend: "stable",
    lastUpdated: "14:22 AEDT",
    source: "mock",
  },
  {
    name: "Cafe Constitution",
    location: "National Archives of Australia",
    distance: "~700m",
    busyness: 28,
    trend: "falling",
    lastUpdated: "14:20 AEDT",
    source: "mock",
  },
  {
    name: "Australian-American Memorial 'The Eagle'",
    location: "Blamey Square, Russell",
    distance: "~1.2km",
    busyness: 41,
    trend: "stable",
    lastUpdated: "14:18 AEDT",
    source: "mock",
  },
];
