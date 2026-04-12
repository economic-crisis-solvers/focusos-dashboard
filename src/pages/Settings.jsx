import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded-lg ${className}`} />
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState(45);
  const [whitelist, setWhitelist] = useState("");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    api
      .getSettings(user.accessToken)
      .then((data) => {
        setThreshold(data.focusThreshold ?? 45);
        setWhitelist((data.whitelist || []).join(", "));
        setQuietStart(data.quietHours?.start || "22:00");
        setQuietEnd(data.quietHours?.end || "07:00");
      })
      .catch(() => setError("Could not load settings."))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const whitelistArr = whitelist
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.putSettings(user.accessToken, {
        focusThreshold: threshold,
        whitelist: whitelistArr,
        quietHours: { start: quietStart, end: quietEnd },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const thresholdState =
    threshold >= 60 ? "Engaged" : threshold >= 45 ? "Drifting" : "Distracted";
  const thresholdColor =
    threshold >= 60 ? "#10b981" : threshold >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Configure your focus preferences
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Focus threshold */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-medium text-white mb-1">
              Focus threshold
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              Focus Shield activates when score drops below this value
            </p>
            <div className="flex items-center gap-5">
              <input
                type="range"
                min="20"
                max="70"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="flex-1 accent-emerald-500 h-2"
              />
              <div className="text-right w-24">
                <span
                  className="text-3xl font-semibold tabular-nums"
                  style={{ color: thresholdColor }}
                >
                  {threshold}
                </span>
                <p className="text-xs mt-0.5" style={{ color: thresholdColor }}>
                  {thresholdState}
                </p>
              </div>
            </div>
          </div>

          {/* Whitelist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-medium text-white mb-1">
              Urgent contacts whitelist
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              Notifications from these contacts bypass Focus Shield
            </p>
            <input
              type="text"
              value={whitelist}
              onChange={(e) => setWhitelist(e.target.value)}
              placeholder="mom, boss, emergency (comma separated)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Quiet hours */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-medium text-white mb-1">
              Quiet hours
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              Focus Shield stays active during these hours regardless of score
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  Start
                </label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  End
                </label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-4 rounded-xl text-base font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: saved ? "#065f46" : "#059669", color: "#fff" }}
          >
            {saved
              ? "✓ Settings saved"
              : saving
                ? "Saving..."
                : "Save settings"}
          </button>
        </div>
      )}
    </div>
  );
}
