export const HOUSE_SYSTEMS = [
  "whole_sign",
  "placidus",
  "koch",
  "equal",
  "campanus",
  "regio",
] as const;
export type HouseSystem = (typeof HOUSE_SYSTEMS)[number];
