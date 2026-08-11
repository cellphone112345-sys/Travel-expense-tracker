import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tripsApi, type TripInput } from "../api/endpoints";

export function useTrips() {
  return useQuery({ queryKey: ["trips"], queryFn: tripsApi.list });
}

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => tripsApi.get(tripId!),
    enabled: !!tripId,
  });
}

export function useTripSummary(tripId: string | undefined) {
  return useQuery({
    queryKey: ["trips", tripId, "summary"],
    queryFn: () => tripsApi.summary(tripId!),
    enabled: !!tripId,
  });
}

export function useBudgetStatus(tripId: string | undefined) {
  return useQuery({
    queryKey: ["trips", tripId, "budget-status"],
    queryFn: () => tripsApi.budgetStatus(tripId!),
    enabled: !!tripId,
  });
}

export function useTripCompare(tripIds: string[]) {
  return useQuery({
    queryKey: ["trips", "compare", tripIds],
    queryFn: () => tripsApi.compare(tripIds),
    enabled: tripIds.length > 0,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TripInput) => tripsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TripInput> }) => tripsApi.update(id, data),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["trips", variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => tripsApi.remove(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}
