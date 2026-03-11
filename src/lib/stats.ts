/**
 * Accumulates observed busyness readings per venue per hour.
 * Persists to disk so statistics survive server restarts.
 * Once a slot has MIN_READINGS, observed stats replace the hardcoded baseline.
 */
import fs from "fs";
import path from "path";

const STATS_FILE = path.join(process.cwd(), "data", "venue-stats.json");
const MIN_READINGS = 5; // slots below this fall back to hardcoded baseline

interface SlotStats {
  count: number;
  sum: number;
  sumSq: number; // enables online variance: Var = (sumSq/n) - mean²
}

type VenueStats = Partial<Record<number, SlotStats>>; // hour 0-23
type AllStats = Record<string, VenueStats>;

let db: AllStats = {};

function load() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      db = JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
    }
  } catch {
    db = {};
  }
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(STATS_FILE), { recursive: true });
    fs.writeFileSync(STATS_FILE, JSON.stringify(db, null, 2));
  } catch {
    // non-critical — stats still work in-memory this session
  }
}

load();

export function recordReading(venue: string, hour: number, busyness: number) {
  db[venue] ??= {};
  db[venue][hour] ??= { count: 0, sum: 0, sumSq: 0 };

  const slot = db[venue][hour]!;
  slot.count += 1;
  slot.sum   += busyness;
  slot.sumSq += busyness * busyness;

  persist();
}

/** Returns observed mean + stdDev for the slot, or null if not enough data yet. */
export function getObservedBaseline(
  venue: string,
  hour: number
): { mean: number; stdDev: number; count: number } | null {
  const slot = db[venue]?.[hour];
  if (!slot || slot.count < MIN_READINGS) return null;

  const mean     = slot.sum / slot.count;
  const variance = slot.sumSq / slot.count - mean * mean;
  const stdDev   = Math.sqrt(Math.max(0, variance));

  return {
    mean:   Math.round(mean   * 10) / 10,
    stdDev: Math.max(1, Math.round(stdDev * 10) / 10),
    count:  slot.count,
  };
}
