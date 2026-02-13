export interface CafeConfig {
  name: string;
  location: string;
  distance: string;
  placeId: string;
  isInsideTreasury?: boolean;
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
