import CardinalSvg from "../assets/modality/cardinal.svg";
import MutableSvg from "../assets/modality/mutable.svg";
import FixedSvg from "../assets/modality/fixed.svg";

type Modality = "cardinal" | "fixed" | "mutable";

export type ModalityKey = Modality;

export interface ModalityInfo {
  name: string;
  glyph: string;
  // The general character of the modality, shown before anything about a particular chart.
  description: string;
}

export const ModalityData: Record<Modality, ModalityInfo> = {
  cardinal: {
    name: "Cardinal",
    glyph: CardinalSvg,
    description:
      "Cardinal signs start things. They set direction at the turn of each season, and are drawn to beginnings, leading and taking the first step.",
  },
  fixed: {
    name: "Fixed",
    glyph: FixedSvg,
    description:
      "Fixed signs hold and sustain. They stabilise what is in motion, persist with it and deepen it, and are slow to let go of what they have built.",
  },
  mutable: {
    name: "Mutable",
    glyph: MutableSvg,
    description:
      "Mutable signs adapt and connect. They change course as things change, translate between different things and move between roles.",
  },
};
