import type { Planet } from "./planet";

export type MoonPhase =
  | "new moon"
  | "waxing crescent"
  | "first quarter"
  | "waxing gibbous"
  | "full moon"
  | "waning gibbous"
  | "last quarter"
  | "waning crescent";

export const MOON_PHASES: MoonPhase[] = [
  "new moon",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full moon",
  "waning gibbous",
  "last quarter",
  "waning crescent",
];

export type MoonPhaseDirection = "waxing" | "waning" | "full" | "new";

export interface MoonPhaseTiming {
  phase: string | { name?: string; ordinal?: number };
  waxing: boolean;
  planet: Planet;
  dateTime: string;
}

export interface MoonTimingsType {
  currentPhase: MoonPhaseTiming;
  phaseLoop: MoonPhaseTiming[];
}

export interface MoonPhaseDescriptionValue {
  phase: MoonPhase;
  timing?: MoonPhaseTiming;
}

export const getMoonPhase = (value?: MoonPhaseTiming["phase"]): MoonPhase | undefined => {
  if (value === undefined) return undefined;

  const name = typeof value === "string" ? value : value.name;
  const normalized = name?.toLowerCase().replace(/[_-]+/g, " ").trim() ?? "";
  const phaseName = normalized.replace(/^moon phase\s+/, "");
  const withoutMoon = phaseName.replace(/\s+moon$/, "");
  const knownPhase = MOON_PHASES.find(
    (phase) => phase === phaseName || phase.replace(/\s+moon$/, "") === withoutMoon,
  );
  if (knownPhase) return knownPhase;

  const ordinal = typeof value === "string" ? undefined : value.ordinal;
  return ordinal !== undefined ? MOON_PHASES[ordinal] : undefined;
};

interface MoonPhaseInfo {
  glyph: string;
  info: {
    description: string;
  };
}

export const MoonPhasesData: Record<MoonPhase, MoonPhaseInfo> = {
  "new moon": {
    glyph: "🌑",
    info: {
      description:
        "A time for new beginnings and setting intentions, planting the seeds of future growth.",
    },
  },
  "waxing crescent": {
    glyph: "🌒",
    info: {
      description:
        "A phase of momentum and hope, encouraging small steps and steady progress toward your goals.",
    },
  },
  "first quarter": {
    glyph: "🌓",
    info: {
      description:
        "A turning point that calls for action, decision-making, and overcoming early challenges.",
    },
  },
  "waxing gibbous": {
    glyph: "🌔",
    info: {
      description:
        "A period of refinement and preparation, fine-tuning efforts before they come to fruition.",
    },
  },
  "full moon": {
    glyph: "🌕",
    info: {
      description:
        "A peak of illumination and energy, bringing clarity, celebration, and heightened emotions.",
    },
  },
  "waning gibbous": {
    glyph: "🌖",
    info: {
      description:
        "A reflective phase of sharing wisdom, expressing gratitude, and beginning the process of release.",
    },
  },
  "last quarter": {
    glyph: "🌗",
    info: {
      description:
        "A time of release and letting go, clearing away what no longer serves before renewal.",
    },
  },
  "waning crescent": {
    glyph: "🌘",
    info: {
      description:
        "A phase of rest and quiet introspection, offering closure and spiritual renewal before the cycle restarts.",
    },
  },
};
