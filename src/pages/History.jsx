import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

function scoreToColor(score) {
  if (score === null) return "#111114";
  if (score >= 80) return "#064e3b";
  if (score >= 60) return "#065f46";
  if (score >= 45) return "#854d0e";
  if (score >= 20) return "#7f1d1d";
  return "#450a0a";
}

function scoreToText(score) {
  if (score === null) return "#52525b";
  if (score >= 60) return "#6ee7b7";
  if (score >= 45) return "#fde68a";
  return "#fca5a5";
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded-lg ${className}`} />
  );
}

export default function History() {
  const { user } = useAuth();
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    api
      .getHistory(user.accessToken, 7)
      .then((data) => {
        const map = {};
        (data.data || []).forEach((d) => {
          const date = new Date(d.period);
          const dayIndex = date.getUTCDay();
          const day = DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
          const hour = date.getUTCHours();
          map[`${day}-${hour}`] = Math.round(d.avgScore);
        });
        setGrid(map);
      })
      .catch(() => {
        setError("Could not load history. Check your connection.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasData = Object.keys(grid).length > 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">History</h2>
        <p className="text-sm text-zinc-500 mt-1">
          7-day focus heatmap — click any cell to inspect
        </p>
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

      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <Skeleton className="h-6 w-48 mb-6" />
          {DAYS.map((d) => (
            <div key={d} className="flex items-center mb-2">
              <div className="w-14" />
              <Skeleton className="flex-1 h-7" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Hour labels */}
          <div className="flex mb-3">
            <div className="w-14" />
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-zinc-600"
                style={{ fontSize: 10 }}
              >
                {h % 4 === 0 ? `${h}h` : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day) => (
            <div key={day} className="flex items-center mb-2">
              <div className="w-14 text-sm text-zinc-400 font-medium shrink-0">
                {day}
              </div>
              {HOURS.map((hour) => {
                const key = `${day}-${hour}`;
                const val = grid[key] ?? null;
                const isSelected = selected === key;
                return (
                  <div key={hour} className="flex-1 mx-px">
                    <div
                      onClick={() => setSelected(isSelected ? null : key)}
                      className="w-full rounded cursor-pointer transition-all duration-200 hover:opacity-75 flex items-center justify-center"
                      style={{
                        height: 28,
                        background: scoreToColor(val),
                        outline: isSelected ? "2px solid #10b981" : "none",
                        outlineOffset: 1,
                      }}
                      title={
                        val != null
                          ? `${day} ${hour}:00 — Score: ${val}`
                          : "No data"
                      }
                    >
                      {isSelected && val != null && (
                        <span
                          style={{
                            fontSize: 9,
                            color: scoreToText(val),
                            fontWeight: 700,
                          }}
                        >
                          {val}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Empty state */}
          {!hasData && !error && (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">No history data yet</p>
              <p className="text-zinc-600 text-xs mt-1">
                Keep the extension running — data will appear here
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-zinc-800 flex-wrap">
            <span className="text-sm text-zinc-500">Focus level:</span>
            {[
              { color: "#064e3b", label: "Deep focus (80+)" },
              { color: "#065f46", label: "Engaged (60-79)" },
              { color: "#854d0e", label: "Drifting (45-59)" },
              { color: "#7f1d1d", label: "Distracted (<45)" },
              { color: "#111114", label: "No data", border: "#27272a" },
            ].map(({ color, label, border }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm border"
                  style={{ background: color, borderColor: border || color }}
                />
                <span className="text-sm text-zinc-400">{label}</span>
              </div>
            ))}
          </div>

          {selected && grid[selected] != null && (
            <div className="mt-6 p-5 bg-zinc-800 rounded-xl border border-zinc-700">
              <p className="text-base text-white font-medium">
                {selected.split("-")[0]} at {selected.split("-")[1]}:00
              </p>
              <p
                className="text-3xl font-semibold mt-1"
                style={{ color: scoreToText(grid[selected]) }}
              >
                Score: {grid[selected]}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
