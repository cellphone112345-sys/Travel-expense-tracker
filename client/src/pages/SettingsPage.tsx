import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCurrentTrip } from "../hooks/useCurrentTrip";
import { useTrips } from "../hooks/useTrips";
import { exportApi } from "../api/endpoints";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: trips } = useTrips();
  const { currentTripId } = useCurrentTrip();
  const currentTrip = trips?.find((t) => t.id === currentTripId);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">設定</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="text-sm text-gray-500">帳號</div>
        <div className="mt-1 font-medium text-gray-900">{user?.name || user?.email}</div>
        <div className="text-sm text-gray-400">{user?.email}</div>
        <div className="mt-1 text-sm text-gray-400">預設本國幣別：{user?.homeCurrency}</div>
      </div>

      {currentTrip && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-700">匯出「{currentTrip.name}」報表</div>
          <div className="flex gap-2">
            <a
              href={exportApi.csvUrl(currentTrip.id)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              匯出 CSV
            </a>
            <a
              href={exportApi.pdfUrl(currentTrip.id)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              匯出 PDF
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => logout().then(() => navigate("/login"))}
        className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        登出
      </button>
    </div>
  );
}
