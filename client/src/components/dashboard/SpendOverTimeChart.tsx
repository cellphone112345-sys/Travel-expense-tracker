import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, minorToMajor } from "../../utils/money";
import type { TripSummary } from "../../types";

export function SpendOverTimeChart({ byDate, currency }: { byDate: TripSummary["byDate"]; currency: string }) {
  if (byDate.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 text-center text-sm text-gray-400 shadow-sm">
        還沒有花費紀錄，加一筆花費後這裡會顯示時間趨勢圖
      </div>
    );
  }

  const data = byDate.map((d) => ({
    date: d.date.slice(5),
    value: minorToMajor(d.totalMinor, currency),
    totalMinor: d.totalMinor,
  }));

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-gray-700">每日花費趨勢</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip formatter={(_value, _name, item) => formatMoney(item.payload.totalMinor, currency)} />
          <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
