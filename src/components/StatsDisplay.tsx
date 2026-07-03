"use client";

import { useEffect, useState } from "react";
import { FlameIcon, TrophyIcon } from "./icons";
import { TRACK_NAMES } from "@/lib/tracks";
import type { StatsResponse } from "@/app/api/stats/route";

type Filter = "all" | string;

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-edge bg-surface p-3.5">
      {icon}
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function DistributionBar({
  label,
  count,
  max,
  highlight,
  index,
}: {
  label: string;
  count: number;
  max: number;
  highlight: boolean;
  index: number;
}) {
  const pct = max > 0 ? Math.max((count / max) * 100, count > 0 ? 8 : 0) : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-right text-xs font-bold text-muted">
        {label}
      </span>
      <div className="flex flex-1 items-center">
        <div
          className="stat-bar flex items-center justify-end rounded-sm px-2 py-0.5 text-xs font-bold"
          style={
            {
              "--bar-width": `${pct}%`,
              "--bar-delay": `${index * 60}ms`,
              minWidth: count > 0 ? "1.5rem" : "0.5rem",
              background: highlight
                ? "var(--tile-correct)"
                : "var(--surface-raised)",
              color: highlight ? "#10130f" : "var(--muted)",
            } as React.CSSProperties
          }
        >
          {count}
        </div>
      </div>
    </div>
  );
}

export function StatsDisplay() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-edge border-t-brand" />
        <p className="text-xs">Loading stats…</p>
      </div>
    );
  }

  if (!stats || stats.totals.played === 0) {
    return (
      <div className="rounded-2xl border border-edge bg-surface p-6 text-center">
        <p className="font-display text-lg font-bold">No stats yet</p>
        <p className="mt-1 text-sm text-muted">
          Play your first game and your stats will show up here.
        </p>
      </div>
    );
  }

  const current =
    filter === "all"
      ? stats.totals
      : stats.tracks[filter] ?? {
          played: 0,
          won: 0,
          winPct: 0,
          distribution: new Array(7).fill(0),
        };

  const dist = current.distribution;
  const maxCount = Math.max(...dist);

  // Find the most common solve count (excluding losses at index 0).
  const bestBucket = dist
    .slice(1)
    .reduce(
      (best, count, i) => (count > (dist[best] ?? 0) ? i + 1 : best),
      1,
    );

  const availableTracks = Object.keys(stats.tracks);

  return (
    <div className="flex flex-col gap-4">
      {/* Track filter tabs */}
      {availableTracks.length > 1 && (
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "All" },
            ...availableTracks.map((t) => ({
              key: t,
              label: TRACK_NAMES[t] ?? t,
            })),
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === tab.key
                  ? "btn-primary"
                  : "chip-glass text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Played" value={current.played} />
        <StatCard label="Win %" value={`${current.winPct}%`} />
        <StatCard
          label="Streak"
          value={stats.totals.currentStreak}
          icon={
            stats.totals.currentStreak > 0 ? (
              <FlameIcon className="h-5 w-5 animate-flame text-gold" />
            ) : undefined
          }
        />
        <StatCard
          label="Best"
          value={stats.totals.bestStreak}
          icon={<TrophyIcon className="h-5 w-5 text-brand" />}
        />
      </div>

      {/* Guess distribution histogram */}
      <div className="rounded-2xl border border-edge bg-surface p-4">
        <h3 className="mb-3 text-sm font-bold">Guess Distribution</h3>
        <div className="flex flex-col gap-1.5">
          {dist.slice(1).map((count, i) => (
            <DistributionBar
              key={i + 1}
              label={String(i + 1)}
              count={count}
              max={maxCount}
              highlight={i + 1 === bestBucket && count > 0}
              index={i}
            />
          ))}
          {dist[0] > 0 && (
            <DistributionBar
              label="X"
              count={dist[0]}
              max={maxCount}
              highlight={false}
              index={6}
            />
          )}
        </div>
      </div>
    </div>
  );
}
