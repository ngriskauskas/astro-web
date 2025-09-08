type Polarity = "masculine" | "feminine";

export interface PolarityInfo {
  name: string;
  glyph: string;
}

export const PolarityData: Record<Polarity, PolarityInfo> = {
  masculine: {
    name: "Masculine",
    glyph: "⊕",
  },
  feminine: {
    name: "Feminine",
    glyph: "⊖",
  },
};
