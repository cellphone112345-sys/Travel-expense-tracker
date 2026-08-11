import type { BudgetStatus } from "../../types";
import { formatMoney } from "../../utils/money";
import { BudgetProgressBar } from "./BudgetProgressBar";

export function BudgetAlertBanner({ status }: { status: BudgetStatus }) {
  if (status.totalBudget === null && status.dailyBudget === null) {
    return null;
  }

  const showOverAlert = status.isOverTotalBudget || status.isOverDailyBudget;

  return (
    <div className={`rounded-2xl p-5 shadow-sm ${showOverAlert ? "bg-red-50" : "bg-white"}`}>
      {showOverAlert && (
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-600">
          <span>⚠️</span>
          <span>
            {status.isOverTotalBudget && "已超出總預算！"}
            {status.isOverTotalBudget && status.isOverDailyBudget && " "}
            {status.isOverDailyBudget && "今日花費已超出每日預算！"}
          </span>
        </div>
      )}
      <div className="space-y-3">
        {status.totalBudget !== null && (
          <BudgetProgressBar
            label="總預算"
            spentMinor={status.totalSpentMinor}
            budgetMinor={status.totalBudget}
            currency={status.homeCurrency}
          />
        )}
        {status.dailyBudget !== null && (
          <BudgetProgressBar
            label="今日預算"
            spentMinor={status.todaySpentMinor}
            budgetMinor={status.dailyBudget}
            currency={status.homeCurrency}
          />
        )}
        {status.totalRemainingMinor !== null && !status.isOverTotalBudget && (
          <div className="text-xs text-gray-500">
            剩餘 {formatMoney(status.totalRemainingMinor, status.homeCurrency)}
          </div>
        )}
      </div>
    </div>
  );
}
