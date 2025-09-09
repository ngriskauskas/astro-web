export const ZODIAC_SYSTEMS = ["tropical", "sidereal"] as const;
export type ZodiacSystem = (typeof ZODIAC_SYSTEMS)[number];
