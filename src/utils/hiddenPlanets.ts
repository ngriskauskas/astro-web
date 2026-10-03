import type { ObjectOptions } from "../types/astrologySettings";

// The optional objects the user has turned off in their chart settings.
export const hiddenPlanets = ({ showChiron, showLilith }: ObjectOptions): string[] => [
  ...(showChiron ? [] : ["CHIRON"]),
  ...(showLilith ? [] : ["LILITH"]),
];
