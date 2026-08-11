import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useTrips } from "../../hooks/useTrips";
import { CurrentTripContext } from "../../hooks/useCurrentTrip";

const STORAGE_KEY = "travel-expense-tracker:currentTripId";

const NAV_ITEMS = [
  { to: "/trips", label: "旅程", icon: "🧳" },
  { to: "/dashboard", label: "總覽", icon: "📊" },
  { to: "/expenses", label: "花費", icon: "🧾" },
  { to: "/categories", label: "分類", icon: "🏷️" },
  { to: "/settings", label: "設定", icon: "⚙️" },
];

const SECONDARY_NAV_ITEMS = [{ to: "/compare", label: "旅程比較", icon: "⚖️" }];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: trips } = useTrips();
  const [currentTripId, setCurrentTripIdState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  );

  function setCurrentTripId(id: string | null) {
    setCurrentTripIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }

  useEffect(() => {
    if (!trips) return;
    if (currentTripId && !trips.some((t) => t.id === currentTripId)) {
      setCurrentTripId(trips[0]?.id ?? null);
    } else if (!currentTripId && trips.length > 0) {
      setCurrentTripId(trips[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips]);

  return (
    <CurrentTripContext.Provider value={{ currentTripId, setCurrentTripId }}>
      <div className="flex h-screen flex-col md:flex-row">
        {/* Desktop side nav */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
          <div className="px-4 py-5 text-lg font-bold text-brand">✈️ 旅遊記帳</div>
          <nav className="flex-1 space-y-1 px-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-brand/10 text-brand" : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-gray-100" />
            {SECONDARY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-brand/10 text-brand" : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
            <div className="mb-2 truncate">{user?.email}</div>
            <button
              onClick={() => logout().then(() => navigate("/login"))}
              className="font-medium text-red-600 hover:underline"
            >
              登出
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Top bar with trip switcher */}
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <div className="text-base font-semibold text-gray-800 md:hidden">✈️ 旅遊記帳</div>
            <select
              className="ml-auto rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
              value={currentTripId ?? ""}
              onChange={(e) => setCurrentTripId(e.target.value || null)}
            >
              {!trips || trips.length === 0 ? (
                <option value="">尚無旅程</option>
              ) : (
                trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                  isActive ? "text-brand" : "text-gray-500"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </CurrentTripContext.Provider>
  );
}
