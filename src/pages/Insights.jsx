import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const CAT_COLORS = {
  social: "#ef4444",
  entertainment: "#f97316",
  news: "#3b82f6",
  other: "#6b7280",
  work: "#10b981",
};

function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded-lg ${className}`} />
  );
}

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    api
      .getInsights(user.accessToken, 7)
      .then(setInsights)
      .catch(() => setError("Could not load insights. Check your connection."))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const peakData = (insights?.peakFocusHours || []).map((h) => ({
    hour: `${h.hour}:00`,
    score: Math.round(h.avgScore),
  }));

  const distractionData = (insights?.topDistractions || []).map((d) => ({
    name: d.triggerCategory,
    count: d.eventCount,
    residue: Math.round(d.totalResidue),
  }));

  const {
    residueMinutesRemaining = 0,
    minutesProtected = 0,
    distractionCount = 0,
  } = insights?.residueStats || {};

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Insights</h2>
        <p className="text-sm text-zinc-500 mt-1">Last 7 days</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <span className="text-red-400 text-sm">{error}</span>
          <button
            onClick={loadData}
            className="text-sm text-red-400 underline hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            {[
              {
                label: "Minutes protected",
                value: Math.round(minutesProtected),
                unit: "min",
                color: "#10b981",
              },
              {
                label: "Residue remaining",
                value: Math.round(residueMinutesRemaining),
                unit: "min",
                color: "#f59e0b",
              },
              {
                label: "Distraction events",
                value: distractionCount,
                unit: "",
                color: "#ef4444",
              },
            ].map(({ label, value, unit, color }) => (
              <div
                key={label}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  {label}
                </p>
                <p
                  className="text-4xl font-semibold tabular-nums"
                  style={{ color }}
                >
                  {value}
                  <span className="text-lg text-zinc-500 font-normal ml-2">
                    {unit}
                  </span>
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak focus hours */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
            Peak focus hours
          </p>
          {loading ? (
            <Skeleton className="h-52" />
          ) : peakData.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={peakData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: "#52525b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#52525b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#10b981" }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {peakData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.score >= 70
                            ? "#10b981"
                            : entry.score >= 45
                              ? "#f59e0b"
                              : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2">
              <p className="text-zinc-500 text-sm">No peak hours data yet</p>
              <p className="text-zinc-600 text-xs">
                Use the extension for a few hours first
              </p>
            </div>
          )}
        </div>

        {/* Distraction breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
            Distraction breakdown
          </p>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : distractionData.length > 0 ? (
            <div className="space-y-5">
              {distractionData.map((d, i) => {
                const maxCount = Math.max(
                  ...distractionData.map((x) => x.count),
                );
                const pct = Math.round((d.count / maxCount) * 100);
                const color = CAT_COLORS[d.name] || CAT_COLORS.other;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-300 capitalize font-medium">
                        {d.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {d.count} events · +{d.residue} min residue
                      </span>
                    </div>
                    <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2">
              <p className="text-zinc-500 text-sm">No distraction data yet</p>
              <p className="text-zinc-600 text-xs">
                Keep browsing — patterns will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
