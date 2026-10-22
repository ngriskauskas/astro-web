import { createContext, useContext } from "react";
import type { PlanetaryHoursType } from "../types/planetaryHours";

// "unavailable": the sun does not rise or set at the user's location on this date, so
// there are no planetary hours to show. "error": the request failed for any other reason.
export type PlanetaryHoursStatus = "loading" | "ready" | "unavailable" | "error";

interface PlanetaryHoursContextType {
  status: PlanetaryHoursStatus;
  data: PlanetaryHoursType | null;
  // The current time, moved on every minute. Everything that shows planetary hours reads
  // this one clock, so the widget and the timeline always agree on the current hour.
  now: Date;
}

export const PlanetaryHoursContext = createContext<PlanetaryHoursContextType | undefined>(
  undefined,
);

export const usePlanetaryHours = () => {
  const context = useContext(PlanetaryHoursContext);
  if (!context) {
    throw new Error("usePlanetaryHours must be used inside PlanetaryHoursProvider");
  }
  return context;
};
