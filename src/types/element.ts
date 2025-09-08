import FireSvg from "../assets/elements/fire.svg";
import WaterSvg from "../assets/elements/water.svg";
import AirSvg from "../assets/elements/air.svg";
import EarthSvg from "../assets/elements/earth.svg";

type Element = "fire" | "water" | "air" | "earth";

export interface ElementInfo {
  name: string;
  color: string;
  glyph: string;
}

export const ElementData: Record<Element, ElementInfo> = {
  fire: {
    name: "Fire",
    color: "#FF6347",
    glyph: FireSvg,
  },
  water: {
    name: "Water",
    color: "#1EBDEB",
    glyph: WaterSvg,
  },
  air: {
    name: "Air",
    color: "#92A8D1",
    glyph: AirSvg,
  },
  earth: {
    name: "Earth",
    color: "#228B22",
    glyph: EarthSvg,
  },
};
