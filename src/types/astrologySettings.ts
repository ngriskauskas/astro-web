import type { Ayanamsa } from "./ayanamsa";
import type { HouseSystem } from "./house-system";
import type { ZodiacSystem } from "./zodiac-system";

export interface AspectOptions {
  CONJUNCTION: {
    show: boolean;
    minOrb: number;
  };
  OPPOSITION: {
    show: boolean;
    minOrb: number;
  };
  TRINE: {
    show: boolean;
    minOrb: number;
  };
  SQUARE: {
    show: boolean;
    minOrb: number;
  };
  SEXTILE: {
    show: boolean;
    minOrb: number;
  };
}

export interface ObjectOptions {
  showChiron: boolean;
  showLilith: boolean;
}

export interface DisplayOptions {
  tickMarks: boolean;
  angleLabels: boolean;
}

export interface AstrologySettings {
  zodiacType: ZodiacSystem;
  houseSystem: HouseSystem;
  ayanamsa?: Ayanamsa;
  aspectOptions: AspectOptions;
  displayOptions: DisplayOptions;
  objectOptions: ObjectOptions;
}
