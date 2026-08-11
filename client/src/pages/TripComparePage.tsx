import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTripCompare, useTrips } from "../hooks/useTrips";
import { formatMoney, minorToMajor } from "../utils/money";

export function TripComparePage() {
  const { data: trips } = useTrips();
  const [selected, setSelected] = useState<string[]>([]);
  const { data: rows, isLoading } = useTripCompare(selected);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-xl font-bold">多趟旅程比較</h1>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm">
        {trips?.map((t) => (
          <label key={t.id} className="flex items-center gap-1.5 text-sm">
            <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} />
            {t.name}
          </label>
        ))}
        {!trips?.length && <p className="text-sm text-gray-400">還沒有旅程可以比較</p>}
      </div>

      {selected.length === 0 && <p className="text-gray-400">請選擇至少一趟旅程進行比較</p>}
      {isLoading && <p className="text-gray-500">載入中…</p>}

      {rows && rows.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows.map((r) => ({ name: r.name, value: minorToMajor(r.totalHomeMinor, r.homeCurrency), row: r }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip formatter={(_v, _n, item) => formatMoney(item.payload.row.totalHomeMinor, item.payload.row.homeCurrency)} />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <ul className="mt-4 divide-y divide-gray-100 text-sm">
            {rows.map((r) => (
              <li key={r.tripId} className="flex justify-between py-2">
                <span>{r.name}</span>
                <span className="font-medium">
                  {formatMoney(r.totalHomeMinor, r.homeCurrency)}（{r.expenseCount} 筆）
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
