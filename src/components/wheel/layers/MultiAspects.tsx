import { polarToCartesian } from "./Utils";
import type { PlanetName } from "../../../types/zodiac";
import { useWheel } from "../../../hooks/useWheel";
import type { MultiWheelContextType } from "../../../contexts/MultiWheelContext";

const aspectColors: Record<string, string> = {
  conjunction: "#FFD700",
  opposition: "#FF0000",
  trine: "#00FF00",
  square: "#FF0000",
  sextile: "#00FF00",
};

interface MultiAspectProps {
  center: number;
  radius: number;
  hoveredPlanet: { planet: PlanetName; profile: "main" | "other" } | null;
}

export const MultiAspects = ({
  radius,
  center,
  hoveredPlanet,
}: MultiAspectProps) => {
  const {
    mainPlanetAngles,
    otherPlanetAngles,
    aspects,
    settings: { objectOptions, aspectOptions },
  } = useWheel() as MultiWheelContextType;

  return (
    <g>
      {aspects.map(({ type, orb, planet1, planet2 }, i) => {
        const { minOrb, show } = aspectOptions[type];
        if (!show || orb > minOrb) return;

        if (
          !objectOptions.showChiron &&
          (planet1.name === "chiron" || planet2.name === "chiron")
        )
          return;
        if (
          !objectOptions.showLilith &&
          (planet1.name === "lilith" || planet2.name === "lilith")
        )
          return;

        const isHighlighted =
          hoveredPlanet &&
          ((hoveredPlanet.profile === "main" &&
            planet1.name === hoveredPlanet.planet) ||
            (hoveredPlanet.profile === "other" &&
              planet2.name === hoveredPlanet.planet));

        const planet1Angle = mainPlanetAngles.find(
          ({ name }) => name === planet1.name,
        )!.angle;
        const planet2Angle = otherPlanetAngles.find(
          ({ name }) => name === planet2.name,
        )!.angle;
        const { x: x1, y: y1 } = polarToCartesian(center, radius, planet1Angle);
        const { x: x2, y: y2 } = polarToCartesian(center, radius, planet2Angle);
        return (
          <line
            className={`transition-colors duration-200 ${isHighlighted ? "opacity-100" : "opacity-50"
              }`}
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={aspectColors[type]}
            strokeDasharray={orb > 5 ? "4 2" : undefined}
            strokeWidth={isHighlighted ? 3.5 : orb < 2 ? 1.5 : 1}
          />
        );
      })}
    </g>
  );
};
