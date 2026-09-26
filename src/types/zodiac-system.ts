export const ZODIAC_SYSTEMS = ["TROPICAL", "SIDEREAL"] as const;
export type ZodiacSystem = (typeof ZODIAC_SYSTEMS)[number];
