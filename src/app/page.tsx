"use client";

import { useState, useEffect, useCallback } from "react";
import type { CafeData, CafeApiResponse, GaugeLevel } from "@/lib/types";
import { GAUGE_LEVELS, CAFE_CONFIGS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPrecinctAverage(cafes: CafeData[]): number {
  return Math.round(
    cafes.reduce((sum, c) => sum + c.busyness, 0) / cafes.length
  );
}

function getCurrentLevel(avg: number): GaugeLevel {
  for (const level of GAUGE_LEVELS) {
    if (avg >= level.range[0] && avg < level.range[1]) return level;
  }
  return GAUGE_LEVELS[GAUGE_LEVELS.length - 1];
}

function getTrendIcon(trend: "rising" | "falling" | "stable") {
  switch (trend) {
    case "rising":
      return "\u25B2";
    case "falling":
      return "\u25BC";
    case "stable":
      return "\u2014";
  }
}

function getTrendColor(trend: "rising" | "falling" | "stable") {
  switch (trend) {
    case "rising":
      return "text-red-600";
    case "falling":
      return "text-emerald-600";
    case "stable":
      return "text-tsy-gray";
  }
}

function getBusynessBarColor(busyness: number) {
  if (busyness < 25) return "#22c55e";
  if (busyness < 50) return "#eab308";
  if (busyness < 75) return "#f97316";
  return "#ef4444";
}

function getSourceLabel(source: "live" | "cached" | "mock"): string {
  switch (source) {
    case "live":
      return "Live Feed";
    case "cached":
      return "Cached";
    case "mock":
      return "Simulated";
  }
}

function getSourceColor(source: "live" | "cached" | "mock"): string {
  switch (source) {
    case "live":
      return "#22c55e";
    case "cached":
      return "#eab308";
    case "mock":
      return "#626262";
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CbrClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Australia/Sydney",
          hour12: false,
        })
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-sm text-white/90 tabular-nums">
      {time || "--:--:--"}
    </span>
  );
}

function Header() {
  return (
    <header className="bg-tsy-navy border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-6 py-2 flex items-center justify-between">
        <span className="text-[9px] font-mono text-white/30 tracking-[0.15em] uppercase">
          <span className="text-white">CAFINT</span> // Open Source Intelligence // SEC:UNCLASSIFIED
        </span>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-white/40 text-[9px] font-mono uppercase tracking-wider">
              CBR Local
            </div>
            <CbrClock />
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-right">
            <div className="text-white/40 text-[9px] font-mono uppercase tracking-wider">
              Locations
            </div>
            <span className="font-mono text-sm text-white/90">6 monitored</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function PageTitle({
  dateStr,
  timeStr,
}: {
  dateStr: string;
  timeStr: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-tsy-navy mb-2">
        Treasury Activity Monitor
      </h1>
      <p className="text-tsy-gray max-w-2xl mb-4">
        Cafe-based operational tempo assessment for the Department of the Treasury.
      </p>
      <span className="text-xs text-tsy-gray/60">
        Last updated: {dateStr}, {timeStr} AEDT
      </span>
    </div>
  );
}

function GaugeMeter({ value }: { value: number }) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const needleRotation = -90 + (clampedValue / 100) * 180;
  const currentLevel = getCurrentLevel(clampedValue);

  return (
    <div className="bg-white border border-tsy-border">
      <div className="border-b border-tsy-border px-5 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-tsy-navy">
          The &quot;Just Routine Briefings&quot; Index
        </h2>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse-dot"
            style={{ backgroundColor: currentLevel.color }}
          />
          <span className="text-xs font-semibold" style={{ color: currentLevel.color }}>
            {currentLevel.label}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col items-center">
          {/* SVG Gauge */}
          <div className="relative w-64 h-36 mb-4">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              {GAUGE_LEVELS.map((level, i) => {
                const startAngle = 180 + (i / 4) * 180;
                const endAngle = 180 + ((i + 1) / 4) * 180;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const r = 80;
                const cx = 100;
                const cy = 95;
                return (
                  <path
                    key={level.label}
                    d={`M ${cx + r * Math.cos(startRad)} ${cy + r * Math.sin(startRad)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(endRad)} ${cy + r * Math.sin(endRad)}`}
                    stroke={level.color}
                    strokeWidth="18"
                    fill="none"
                    strokeLinecap="butt"
                    opacity={currentLevel.label === level.label ? 1 : 0.25}
                  />
                );
              })}

              {/* Tick marks */}
              {[0, 25, 50, 75, 100].map((tick) => {
                const angle = 180 + (tick / 100) * 180;
                const rad = (angle * Math.PI) / 180;
                const cx = 100;
                const cy = 95;
                return (
                  <line
                    key={tick}
                    x1={cx + 66 * Math.cos(rad)}
                    y1={cy + 66 * Math.sin(rad)}
                    x2={cx + 72 * Math.cos(rad)}
                    y2={cy + 72 * Math.sin(rad)}
                    stroke="#313131"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Needle */}
              <g
                style={
                  {
                    transformOrigin: "100px 95px",
                    "--needle-rotation": `${needleRotation}deg`,
                  } as React.CSSProperties
                }
                className="animate-sweep"
              >
                <line
                  x1="100"
                  y1="95"
                  x2="100"
                  y2="22"
                  stroke="#00293c"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="95" r="6" fill="#00293c" />
                <circle cx="100" cy="95" r="2.5" fill="white" />
              </g>

              {/* Center value */}
              <text
                x="100"
                y="85"
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill="#626262"
              >
                {clampedValue}%
              </text>
            </svg>
          </div>

          {/* Current level */}
          <div
            className="w-full text-center px-4 py-3 mb-5"
            style={{
              backgroundColor: currentLevel.color + "12",
              borderLeft: `4px solid ${currentLevel.color}`,
            }}
          >
            <div className="font-bold text-tsy-charcoal text-base">
              {currentLevel.label}
            </div>
            <div className="text-xs text-tsy-gray mt-1">
              {currentLevel.description}
            </div>
          </div>

          {/* Scale legend */}
          <div className="w-full grid grid-cols-4 gap-0">
            {GAUGE_LEVELS.map((level) => (
              <div key={level.label} className="text-center">
                <div
                  className="h-3"
                  style={{
                    backgroundColor: level.color,
                    opacity:
                      currentLevel.label === level.label ? 1 : 0.2,
                  }}
                />
                <div className="text-[10px] text-tsy-gray mt-1.5 leading-tight font-medium">
                  {level.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function CafeCard({ cafe }: { cafe: CafeData }) {
  const barColor = getBusynessBarColor(cafe.busyness);
  const sourceColor = getSourceColor(cafe.source);

  return (
    <div
      className={`bg-white border overflow-hidden ${
        cafe.isInsideTreasury ? "border-tsy-teal border-2" : "border-tsy-border"
      }`}
    >
      {cafe.isInsideTreasury && (
        <div className="bg-tsy-teal-light text-tsy-teal text-xs font-semibold px-4 py-2 tracking-wide uppercase border-b border-tsy-teal/20">
          CAFINT source
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-tsy-charcoal">{cafe.name}</h3>
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-source-pulse"
              style={{ backgroundColor: sourceColor }}
              title={getSourceLabel(cafe.source)}
            />
          </div>
          <div className="text-2xl font-mono font-bold text-tsy-navy ml-3">
            {cafe.busyness}%
          </div>
        </div>
        <p className="text-xs text-tsy-gray">{cafe.location}</p>
        <p className="text-xs text-tsy-teal font-medium mt-0.5">
          {cafe.distance} from Treasury
        </p>

        {/* Bar */}
        <div className="mt-3 mb-2">
          <div className="h-2 bg-tsy-gray-light overflow-hidden">
            <div
              className="h-full animate-fill-bar"
              style={
                {
                  "--bar-width": `${cafe.busyness}%`,
                  width: `${cafe.busyness}%`,
                  backgroundColor: barColor,
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-mono font-medium ${getTrendColor(cafe.trend)}`}
          >
            {getTrendIcon(cafe.trend)} {cafe.trend}
          </span>
          <span className="text-[11px] text-tsy-gray font-mono">
            {cafe.lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
}

function MethodologySection() {
  return (
    <div className="bg-white border border-tsy-border">
      <div className="border-b border-tsy-border px-5 py-3">
        <h2 className="text-sm font-semibold text-tsy-navy">Methodology</h2>
      </div>
      <div className="p-5 text-sm text-tsy-gray leading-relaxed space-y-3">
        <p>
          CAFINT monitors foot traffic at six cafe venues within a 700-metre
          radius of the Department of the Treasury. Activity data is derived
          from Google Maps &quot;Popular
          Times&quot; indicators, which reflect aggregated and anonymised
          location signals from mobile devices.
        </p>
        <p>
          The underlying hypothesis &mdash; that elevated cafe patronage
          correlates with increased departmental activity &mdash;
          is modelled on the{" "}
          <a href="https://pizzint.watch" target="_blank" rel="noopener noreferrer" className="font-semibold text-tsy-teal hover:text-tsy-teal-hover">
            Pentagon Pizza Index
          </a>
          , which tracks pizza delivery patterns near the Pentagon as a proxy
          for US military operational tempo.
        </p>
        <p className="text-xs text-tsy-gray/70 border-t border-tsy-border pt-3">
          This is a satirical project. CAFINT does not have access to any
          classified, protected, or internal government information. All data
          sources are publicly available.
        </p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-tsy-navy mt-12">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-white/10">
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">CAFINT</h3>
            <p className="text-white/50 text-xs leading-relaxed">
              An open-source satirical project monitoring cafe traffic in
              the Australian Treasury.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">
              Data source
            </h3>
            <ul className="space-y-1.5 text-xs text-white/50">
              <li>Google Maps Popular Times</li>
              <li><a href="https://pizzint.watch" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">Inspired by PizzINT / Pentagon Pizza Index</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 text-[11px] text-white/30 leading-relaxed">
          <p>
            This site is satire. Not affiliated with the Australian
            Government or the Department of the Treasury. No actual
            intelligence methods, classified information, or government
            systems are involved. If you are from AGSVA, please note we are
            joking. If you are from Treasury, please get some rest.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const REFRESH_INTERVAL_MS = 3_600_000; // 1 hour

export default function Home() {
  const [cafes, setCafes] = useState<CafeData[]>(
    CAFE_CONFIGS.map((c) => ({
      name: c.name,
      location: c.location,
      distance: c.distance,
      busyness: 0,
      trend: "stable" as const,
      lastUpdated: "",
      isInsideTreasury: c.isInsideTreasury,
      source: "live" as const,
    }))
  );
  const [dataSource, setDataSource] = useState<"live" | "cached" | "mock">("mock");
  const [mounted, setMounted] = useState(false);

  const fetchCafes = useCallback(async () => {
    try {
      const res = await fetch("/api/cafes");
      if (!res.ok) return;
      const data: CafeApiResponse = await res.json();
      setCafes(data.cafes);
      setDataSource(data.source);
    } catch {
      // Keep existing data on network error
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchCafes();

    const interval = setInterval(fetchCafes, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCafes]);

  const avg = getPrecinctAverage(cafes);
  const currentLevel = getCurrentLevel(avg);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Australia/Sydney",
  });
  const timeStr = now.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-tsy-gray text-sm animate-pulse">
          Connecting to cafe network...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <PageTitle
          dateStr={dateStr}
          timeStr={timeStr}
        />

        {/* Main content: Gauge */}
        <div className="mb-8">
          <GaugeMeter value={avg} />
        </div>

        {/* Monitored venues heading */}
        <div className="border-b-2 border-tsy-navy pb-2 mb-4">
          <h2 className="text-lg font-bold text-tsy-navy">
            Monitored venues
          </h2>
          <p className="text-xs text-tsy-gray mt-1">
            {cafes.length} monitored venues active
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
          {cafes.map((cafe) => (
            <CafeCard key={cafe.name} cafe={cafe} />
          ))}
        </div>

        {/* Methodology */}
        <MethodologySection />
      </main>

      <Footer />
    </div>
  );
}
