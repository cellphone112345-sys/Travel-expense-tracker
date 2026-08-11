import { Link } from "react-router-dom";
import { useCurrentTrip } from "../hooks/useCurrentTrip";
import { useBudgetStatus, useTripSummary } from "../hooks/useTrips";
import { TotalSpendCard } from "../components/dashboard/TotalSpendCard";
import { SpendByCategoryChart } from "../components/dashboard/SpendByCategoryChart";
import { SpendOverTimeChart } from "../components/dashboard/SpendOverTimeChart";
import { BudgetAlertBanner } from "../components/dashboard/BudgetAlertBanner";
import { CurrencyTrendWidget } from "../components/dashboard/CurrencyTrendWidget";

export function TripDashboardPage() {
  const { currentTripId } = useCurrentTrip();
  const { data: summary, isLoading } = useTripSummary(currentTripId ?? undefined);
  const { data: budgetStatus } = useBudgetStatus(currentTripId ?? undefined);

  if (!currentTripId) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center text-gray-500">
        <p className="mb-4">請先選擇或建立一趟旅程</p>
        <Link to="/trips" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">
          前往旅程列表
        </Link>
      </div>
    );
  }

  if (isLoading || !summary) {
    return <p className="text-gray-500">載入中…</p>;
  }

  const currency = summary.trip.homeCurrency;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <h1 className="text-xl font-bold">{summary.trip.name} 總覽</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <TotalSpendCard totalMinor={summary.totalHomeMinor} currency={currency} expenseCount={summary.expenseCount} />
        {budgetStatus && <BudgetAlertBanner status={budgetStatus} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SpendByCategoryChart byCategory={summary.byCategory} currency={currency} />
        <SpendOverTimeChart byDate={summary.byDate} currency={currency} />
      </div>

      <CurrencyTrendWidget baseCurrency={summary.trip.baseCurrency} homeCurrency={currency} />
    </div>
  );
}
