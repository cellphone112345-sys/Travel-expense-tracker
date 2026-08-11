import { useQuery } from "@tanstack/react-query";
import { exchangeRatesApi } from "../api/endpoints";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function useCurrencyTrend(base: string, target: string, days = 14) {
  return useQuery({
    queryKey: ["exchange-rates", "history", base, target, days],
    queryFn: () => exchangeRatesApi.history(base, target, isoDaysAgo(days), isoDaysAgo(0)),
    enabled: !!base && !!target && base !== target,
    staleTime: 60 * 60 * 1000,
  });
}
