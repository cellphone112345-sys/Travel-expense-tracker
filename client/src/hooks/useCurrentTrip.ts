import { createContext, useContext } from "react";

export interface CurrentTripContextValue {
  currentTripId: string | null;
  setCurrentTripId: (id: string | null) => void;
}

export const CurrentTripContext = createContext<CurrentTripContextValue | undefined>(undefined);

export function useCurrentTrip(): CurrentTripContextValue {
  const ctx = useContext(CurrentTripContext);
  if (!ctx) throw new Error("useCurrentTrip must be used within CurrentTripProvider");
  return ctx;
}
