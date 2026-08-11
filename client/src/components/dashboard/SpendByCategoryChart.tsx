import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney, minorToMajor } from "../../utils/money";
import type { TripSummary } from "../../types";

export function SpendByCategoryChart({
  byCategory,
  currency,
}: {
  byCategory: TripSummary["byCategory"];
  currency: string;
}) {
  if (byCategory.length === 0) {
    return <EmptyState />;
  }

  const data = byCategory.map((c) => ({
    name: c.name,
    value: minorToMajor(c.totalMinor, currency),
    color: c.color,
    totalMinor: c.totalMinor,
  }));

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-gray-700">分類佔比</div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(_value, _name, item) => formatMoney(item.payload.totalMinor, currency)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-5 text-center text-sm text-gray-400 shadow-sm">
      還沒有花費紀錄，加一筆花費後這裡會顯示分類佔比圖
    </div>
  );
}
