import FireSvg from "../assets/elements/fire.svg";
import WaterSvg from "../assets/elements/water.svg";
import AirSvg from "../assets/elements/air.svg";
import EarthSvg from "../assets/elements/earth.svg";

type Element = "fire" | "water" | "air" | "earth";

export type ElementKey = Element;

export interface ElementInfo {
  name: string;
  color: string;
  glyph: string;
  // The general character of the element, shown before anything about a particular chart.
  description: string;
}

export const ElementData: Record<Element, ElementInfo> = {
  fire: {
    name: "Fire",
    color: "#FF6347",
    glyph: FireSvg,
    description:
      "Fire signs act on instinct and enthusiasm. They move toward what they want with energy, initiative and a need to be seen doing it.",
  },
  water: {
    name: "Water",
    color: "#1EBDEB",
    glyph: WaterSvg,
    description:
      "Water signs work through feeling and intuition. They read what people need beneath the surface and are moved by emotional bonds.",
  },
  air: {
    name: "Air",
    color: "#92A8D1",
    glyph: AirSvg,
    description:
      "Air signs work through ideas, language and connection. They think by talking things through and find meaning in exchange between people.",
  },
  earth: {
    name: "Earth",
    color: "#228B22",
    glyph: EarthSvg,
    description:
      "Earth signs work through what is concrete. They care about the body, money, routine and things that last, and build steadily.",
  },
};
