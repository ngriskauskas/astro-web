// The four quarters of a chart, named for what each one is about. Each has a plain description of
// what the emphasis means before anything about a particular chart.

export type QuadrantKey = "personal" | "private" | "relational" | "collective";

export interface QuadrantInfo {
  name: string;
  houses: string;
  // The quarter's colour, the same as the element it resembles in the app.
  color: string;
  // What the quarter is about, in a few words, for the sentence under the chart.
  focus: string;
  description: string;
}

// Keyed by quarter, from the Ascendant round to the Ascendant again.
export const QuadrantData: Record<QuadrantKey, QuadrantInfo> = {
  personal: {
    name: "Personal",
    houses: "Houses 1 to 3",
    color: "#4f46e5",
    focus: "identity and first impressions shape the picture",
    description:
      "From the Ascendant down to the IC. This quarter is the self being formed: identity, first impressions and the early foundations of who a person is.",
  },
  private: {
    name: "Private",
    houses: "Houses 4 to 6",
    color: "#228B22",
    focus: "home, roots and daily routine take centre stage",
    description:
      "From the IC up to the Descendant. This quarter is roots and daily life: home, family, work done steadily and the habits that keep a person going.",
  },
  relational: {
    name: "Relational",
    houses: "Houses 7 to 9",
    color: "#1EBDEB",
    focus: "partnership and growth take centre stage",
    description:
      "From the Descendant up to the Midheaven. This quarter is relationship and growth: partners, commitments and the wider horizons a person seeks out.",
  },
  collective: {
    name: "Collective",
    houses: "Houses 10 to 12",
    color: "#FF6347",
    focus: "public purpose and reputation take centre stage",
    description:
      "From the Midheaven round to the Ascendant. This quarter is public purpose: vocation, reputation and the way a person contributes to the world beyond themselves.",
  },
};
