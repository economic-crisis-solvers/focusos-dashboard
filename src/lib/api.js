const API_BASE = "https://backend-production-d113.up.railway.app";

async function request(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getLiveScore: (token) => request("/api/score/live", {}, token),
  getHistory: (token, days = 7) =>
    request(`/api/score/history?days=${days}&granularity=hour`, {}, token).then(
      (d) => ({ data: d }),
    ),
  getInsights: (token, days = 7) =>
    request(`/api/insights?days=${days}`, {}, token),
  getSettings: (token) => request("/api/settings", {}, token),
  putSettings: (token, body) =>
    request(
      "/api/settings",
      { method: "PUT", body: JSON.stringify(body) },
      token,
    ),
  postOverride: (token) =>
    request(
      "/api/override",
      {
        method: "POST",
        body: JSON.stringify({ reason: "user manual override" }),
      },
      token,
    ),
};
