import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFocus } from "../context/FocusContext";

const STATE_COLOR = {
  deep_focus: "#10b981",
  engaged: "#10b981",
  drifting: "#f59e0b",
  distracted: "#f97316",
  collapsed: "#ef4444",
};

const NAV = [
  { to: "/", label: "Live" },
  { to: "/history", label: "History" },
  { to: "/insights", label: "Insights" },
  { to: "/settings", label: "Settings" },
];

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const { score, state } = useFocus();
  const dotColor = STATE_COLOR[state] || "#10b981";

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex">
      <aside className="w-60 shrink-0 border-r border-zinc-800 flex flex-col py-8 px-5">
        <div className="mb-10 px-1">
          <h1 className="text-base font-semibold tracking-widest text-white uppercase">
            FocusOS
          </h1>
          <div className="flex items-center gap-2 mt-4">
            <span
              className="w-2.5 h-2.5 rounded-full transition-colors duration-700 shrink-0"
              style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
            />
            <span className="text-sm font-medium" style={{ color: dotColor }}>
              {score != null ? `Score: ${score}` : "Connecting..."}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-1 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 mb-3 truncate">{user?.email}</p>
          <button
            onClick={logout}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
