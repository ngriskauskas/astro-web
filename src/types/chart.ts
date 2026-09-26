import type { Aspect } from "./aspect";
import type { CuspType, Cusp, KeyAngle } from "./cusp";
import type { PlanetName, Planet } from "./planet";

export interface MultiChart {
  main: {
    planets: Record<PlanetName, Planet>;
    houses: Record<CuspType, Cusp>;
    keyAngles: Record<KeyType, KeyAngle>;
  };
  other: {
    planets: Record<PlanetName, Planet>;
    houses: Record<CuspType, Cusp>;
    keyAngles: Record<KeyType, KeyAngle>;
  };
  aspects: Aspect[];
}

export interface SingleChart {
  planets: Record<PlanetName, Planet>;
  houses: Record<CuspType, Cusp>;
  keyAngles: Record<KeyType, KeyAngle>;
  aspects: Aspect[];
}
