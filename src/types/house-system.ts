export const HOUSE_SYSTEMS = [
  "WHOLE_SIGN",
  "PLACIDUS",
  "KOCH",
  "EQUAL",
  "CAMPANUS",
  "REGIO",
] as const;
export type HouseSystem = (typeof HOUSE_SYSTEMS)[number];
