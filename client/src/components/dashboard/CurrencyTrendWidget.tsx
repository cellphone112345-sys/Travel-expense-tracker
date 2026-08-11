import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrencyTrend } from "../../hooks/useExchangeRates";

export function CurrencyTrendWidget({ baseCurrency, homeCurrency }: { baseCurrency: string; homeCurrency: string }) {
  const { data, isLoading } = useCurrencyTrend(homeCurrency, baseCurrency);

  if (baseCurrency === homeCurrency) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-gray-700">
        匯率走勢：1 {homeCurrency} ≈ {baseCurrency}
      </div>
      {isLoading && <p className="text-sm text-gray-400">載入中…</p>}
      {data && !data.available && (
        <p className="text-sm text-gray-400">
          {homeCurrency} 或 {baseCurrency} 不在免費匯率走勢資料的涵蓋範圍內，暫時無法顯示走勢圖。
        </p>
      )}
      {data && data.available && data.points.length > 0 && (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data.points.map((p) => ({ date: p.date.slice(5), rate: p.rate }))}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={50} domain={["auto", "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
