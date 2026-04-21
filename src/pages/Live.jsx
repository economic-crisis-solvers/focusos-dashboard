import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useFocus } from "../context/FocusContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const CIRC = 263.9;

const STATE_CFG = {
  deep_focus: { label: "Deep Focus", color: "#10b981", ring: "#10b981" },
  engaged: { label: "Engaged", color: "#10b981", ring: "#10b981" },
  drifting: { label: "Drifting", color: "#f59e0b", ring: "#f59e0b" },
  distracted: { label: "Distracted", color: "#f97316", ring: "#f97316" },
  collapsed: { label: "Collapsed", color: "#ef4444", ring: "#ef4444" },
};

function ScoreRing({ score, state }) {
  const cfg = STATE_CFG[state] || STATE_CFG.engaged;
  const offset = score != null ? CIRC - (score / 100) * CIRC : CIRC;
  const glowId = "ring-glow";

  return (
    <div className="relative" style={{ width: 240, height: 240 }}>
      <svg
        viewBox="0 0 100 100"
        width={240}
        height={240}
        style={{
          transform: "rotate(-90deg)",
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.5"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#1a1a1f"
          strokeWidth="7"
        />

        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={cfg.ring}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          opacity="0.35"
          style={{
            transition:
              "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1), stroke 1s ease",
            filter: "blur(4px)",
          }}
        />

        {/* Main arc */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={cfg.ring}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1), stroke 1s ease",
          }}
        />
      </svg>

      {/* Score text — centered over SVG */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-semibold tabular-nums"
          style={{
            fontSize: 64,
            lineHeight: 1,
            color: cfg.ring,
            transition: "color 1s ease",
          }}
        >
          {score ?? "--"}
        </span>
        <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2">
          focus score
        </span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
      <div className="text-white font-medium">Score: {payload[0].value}</div>
      <div className="text-zinc-500 mt-0.5">{payload[0].payload.time}</div>
    </div>
  );
}

function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded-lg ${className}`} />
  );
}

export default function Live() {
  const { score, state, lastUpdated, residueMinutes } = useFocus();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blink, setBlink] = useState(true);

  const cfg = STATE_CFG[state] || STATE_CFG.engaged;

  const loadData = useCallback(() => {
    if (!user) return;
    setError(null);
    Promise.all([
      api.getHistory(user.accessToken, 1),
      api.getInsights(user.accessToken, 7),
    ])
      .then(([histData, insightsData]) => {
        const rows = (histData.data || []).map((d) => ({
          time: new Date(d.period).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          score: Math.round(d.avgScore),
        }));
        setHistory(rows);
        setInsights(insightsData);
      })
      .catch((err) => {
        setError("Could not load data. Check your connection.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 900);
    return () => clearInterval(id);
  }, []);

  const protected_min = Math.round(
    insights?.residueStats?.minutesProtected ?? 0,
  );
  const residue = Math.round(
    residueMinutes ?? insights?.residueStats?.residueMinutesRemaining ?? 0,
  );

  const updatedStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-semibold text-white">Live score</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Updates every 30s from Chrome extension
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
          <span
            className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 transition-all duration-400"
            style={{ background: blink ? "#10b981" : "transparent" }}
          />
          Live · {updatedStr}
        </div>
      </div>

      {/* Error banner */}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Score ring card — overflow visible so glow isn't clipped */}
        <div
          className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-10 flex flex-col items-center gap-6"
          style={{ overflow: "visible" }}
        >
          <ScoreRing score={score} state={state} />
          <span
            className="font-semibold px-6 py-2 rounded-full border-2 tracking-wide"
            style={{
              fontSize: 15,
              color: cfg.color,
              borderColor: cfg.color + "66",
              background: cfg.color + "11",
              transition: "all 1s ease",
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Stats + timeline */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                    Protected today
                  </p>
                  <p
                    className="font-semibold text-emerald-400 tabular-nums"
                    style={{ fontSize: 40 }}
                  >
                    {protected_min}
                    <span className="text-lg text-zinc-500 font-normal ml-2">
                      min
                    </span>
                  </p>
                </div>
                <div
                  className="rounded-xl p-6 border transition-all duration-700"
                  style={{
                    background: residue > 20 ? "#ef444411" : "#18181b",
                    borderColor: residue > 20 ? "#ef444466" : "#27272a",
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-wider mb-3 transition-colors duration-700"
                    style={{ color: residue > 20 ? "#ef4444" : "#71717a" }}
                  >
                    Residue remaining
                  </p>
                  <p
                    className="font-semibold tabular-nums transition-colors duration-700"
                    style={{
                      fontSize: 40,
                      color: residue > 20 ? "#ef4444" : "#ffffff",
                    }}
                  >
                    {residue}
                    <span
                      className="text-lg font-normal ml-2 transition-colors duration-700"
                      style={{ color: residue > 20 ? "#ef4444aa" : "#71717a" }}
                    >
                      min
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
              24-hour focus timeline
            </p>
            {loading ? (
              <Skeleton className="h-40" />
            ) : history.length > 0 ? (
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={history}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="focusGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: "#52525b" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#52525b" }}
                      tickLine={false}
                      axisLine={false}
                      ticks={[0, 45, 100]}
                    />
                    <ReferenceLine
                      y={45}
                      stroke="#f59e0b"
                      strokeDasharray="4 3"
                      strokeOpacity={0.6}
                      label={{
                        value: "threshold",
                        position: "right",
                        fontSize: 10,
                        fill: "#f59e0b",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#focusGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-3 text-center"
                style={{ height: 160 }}
              >
                <p className="text-zinc-500 text-sm">No data yet</p>
                <p className="text-zinc-600 text-xs">
                  Make sure the Chrome extension is installed and you're logged
                  in
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Distraction events */}
      {loading ? (
        <Skeleton className="h-32" />
      ) : insights?.topDistractions?.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-5">
            Top distraction sources
          </p>
          <div className="space-y-4">
            {insights.topDistractions.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 capitalize font-medium">
                    {d.triggerCategory}
                  </span>
                  <span className="text-base text-zinc-300">
                    {d.eventCount} events
                  </span>
                </div>
                <span className="text-sm text-zinc-500">
                  +{Math.round(d.totalResidue)} min residue
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
