export interface HourlyBaseline {
  mean: number;
  stdDev: number;
}

export interface CafeConfig {
  name: string;
  location: string;
  distance: string;
  placeId: string;
  isInsideTreasury?: boolean;
  isAlwaysOpen?: boolean;
  refreshIntervalMs?: number;
  /** Expected busyness by hour (0-23) for σ deviation calculation */
  baseline?: Record<number, HourlyBaseline>;
  /** AEST open/close hours — replaces Google openNow check (Essentials IDs Only SKU) */
  venueHours?: { open: number; close: number };
}

export interface CafeData {
  name: string;
  location: string;
  distance: string;
  busyness: number;
  trend: "rising" | "falling" | "stable";
  lastUpdated: string;
  isInsideTreasury?: boolean;
  source: "live" | "cached" | "mock";
  /** Standard deviations from typical — only present when baseline is defined */
  deviation?: number;
  /** True when the venue is outside its operating hours */
  isClosed?: boolean;
}

export interface GaugeLevel {
  label: string;
  range: [number, number];
  color: string;
  description: string;
}

export interface CafeApiResponse {
  cafes: CafeData[];
  fetchedAt: string;
  source: "live" | "cached" | "mock";
  nextRefresh: string;
}
