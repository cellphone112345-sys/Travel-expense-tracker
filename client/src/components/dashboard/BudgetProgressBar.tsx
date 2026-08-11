import { formatMoney } from "../../utils/money";

export function BudgetProgressBar({
  label,
  spentMinor,
  budgetMinor,
  currency,
}: {
  label: string;
  spentMinor: number;
  budgetMinor: number;
  currency: string;
}) {
  const pct = budgetMinor > 0 ? Math.min(100, (spentMinor / budgetMinor) * 100) : 0;
  const isOver = spentMinor > budgetMinor;
  const barColor = isOver ? "bg-red-500" : pct >= 90 ? "bg-amber-500" : "bg-brand";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>
          {formatMoney(spentMinor, currency)} / {formatMoney(budgetMinor, currency)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
