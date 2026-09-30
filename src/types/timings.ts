import type { KeyAngle } from "./cusp";
import type { Aspect } from "./aspect";
import type { Planet } from "./planet";

export interface PlanetTimingValue {
  planet: Planet;
  dateTime: string;
}

export type TimingAspect = Aspect;

export interface AspectTimingValue {
  aspect: TimingAspect;
  dateTime: string;
}

export interface AspectTiming {
  aspect: TimingAspect;
  startAspect: AspectTimingValue;
  endAspect: AspectTimingValue;
  exactDateRanges: AspectTimingValue[];
}

export interface RetrogradeTiming {
  planet: Planet;
  startPlanet: PlanetTimingValue;
  endPlanet: PlanetTimingValue;
}

export interface IngressTiming {
  planet: Planet;
  startPlanet: PlanetTimingValue;
  endPlanet: PlanetTimingValue;
}

export interface StationaryTiming {
  planet: Planet;
  startPlanet: PlanetTimingValue;
  exactStationPlanet: PlanetTimingValue;
  endPlanet: PlanetTimingValue;
}

export interface CurrentTimingsType {
  retrogrades: RetrogradeTiming[];
  ingresses: IngressTiming[];
  aspects: AspectTiming[];
  stations: StationaryTiming[];
}

export interface TransitTimingsType {
  aspects: AspectTiming[];
}

export interface AngleTiming {
  angle: KeyAngle;
  dateTime: string;
}

export interface DailyTimingsType {
  aspects: AspectTiming[];
  angleTimings: AngleTiming[];
}

export type TimingEvent =
  | {
      date: string;
      event: "start" | "end" | "exact";
      type: "aspect";
      data: AspectTiming;
    }
  | {
      date: string;
      event: "start" | "end";
      type: "retrograde";
      data: RetrogradeTiming;
    }
  | {
      date: string;
      event: "exact";
      type: "ingress";
      data: IngressTiming;
    }
  | {
      date: string;
      event: "exact";
      type: "station";
      data: StationaryTiming;
    };
