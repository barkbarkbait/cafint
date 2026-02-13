import type { CafeConfig, CafeData, GaugeLevel } from "./types";

export const CACHE_TTL_MS = 3_600_000; // 1 hour

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
  },
  {
    name: "Wild Honey Bistro",
    location: "John Gorton Building, King Edward Terrace",
    distance: "~300m",
    placeId: "ChIJQdPdShpNFmsRMvi5PXL6Yu0",
  },
  {
    name: "Heritage Cafe",
    location: "West Block, 21 Queen Victoria Terrace",
    distance: "~400m",
    placeId: "ChIJbx9hm0JNFmsREyj0MN4UaQA",
  },
  {
    name: "Catbird",
    location: "44 Constitution Ave, Griffin Building",
    distance: "~500m",
    placeId: "ChIJ4UDLCABNFmsRZr24D3IR9ug",
  },
  {
    name: "Bookplate",
    location: "National Library of Australia",
    distance: "~600m",
    placeId: "ChIJLylmCBdNFmsRMo64BJmkO6A",
  },
  {
    name: "Cafe Constitution",
    location: "National Archives of Australia",
    distance: "~700m",
    placeId: "ChIJNwCafM5NFmsRX8XG5hgPaPg",
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
];
