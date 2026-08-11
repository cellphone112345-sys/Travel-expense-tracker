import { formatMoney } from "../../utils/money";

export function TotalSpendCard({
  totalMinor,
  currency,
  expenseCount,
}: {
  totalMinor: number;
  currency: string;
  expenseCount: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-xs text-gray-500">總花費</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{formatMoney(totalMinor, currency)}</div>
      <div className="mt-1 text-xs text-gray-400">共 {expenseCount} 筆花費</div>
    </div>
  );
}
