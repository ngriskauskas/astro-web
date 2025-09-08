import CardinalSvg from "../assets/modality/cardinal.svg";
import MutableSvg from "../assets/modality/mutable.svg";
import FixedSvg from "../assets/modality/fixed.svg";

type Modality = "cardinal" | "fixed" | "mutable";

export interface ModalityInfo {
  name: string;
  glyph: string;
}

export const ModalityData: Record<Modality, ModalityInfo> = {
  cardinal: {
    name: "Cardinal",
    glyph: CardinalSvg,
  },
  fixed: {
    name: "Fixed",
    glyph: FixedSvg,
  },
  mutable: {
    name: "Mutable",
    glyph: MutableSvg,
  },
};
