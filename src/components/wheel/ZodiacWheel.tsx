import { useState } from "react";
import { Background } from "./layers/Background";
import { Signs } from "./layers/Signs";
import { Houses } from "./layers/Houses";
import { Planets } from "./layers/Planets";
import { Aspects } from "./layers/Aspects";
import { useWheel } from "../../hooks/useWheel";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { type PlanetName } from "../../types/planet";

export const ZodiacWheel = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetName | null>(null);
  const [hoverAspectedPlanets, setHoverAspectedPlanets] = useState<PlanetName[]>([]);

  const { aspects, planetAngles, cuspAngles, keyAngles } = useWheel() as SingleWheelContextType;

  const size = 700;
  const radius = size / 2;

  return (
    <div>
      {aspects ? (
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" preserveAspectRatio="xMidYMid meet">
          <Background radius={radius} />
          <Houses
            angles={cuspAngles}
            keyAngles={keyAngles}
            center={radius}
            radius={radius - 55}
            innerRadius={radius - 175}
          />
          <Signs center={radius} radius={radius - 5} />
          <Planets
            angles={planetAngles}
            center={radius}
            radius={radius - 55}
            hoverAspectedPlanets={hoverAspectedPlanets}
            onHoverPlanet={(planet) => {
              setHoveredPlanet(planet);
              aspects.forEach(({ point1, point2 }) => {
                if (
                  point1.type === "Planet" &&
                  point2.type === "Planet" &&
                  point1.value.name === planet
                )
                  setHoverAspectedPlanets((prev) => [point2.value.name, ...prev]);
                else if (
                  point1.type === "Planet" &&
                  point2.type === "Planet" &&
                  point2.value.name === planet
                )
                  setHoverAspectedPlanets((prev) => [point1.value.name, ...prev]);
              });
            }}
            onLeavePlanet={() => {
              setHoveredPlanet(null);
              setHoverAspectedPlanets([]);
            }}
          />
          <Aspects center={radius} radius={radius - 175} hoveredPlanet={hoveredPlanet} />
        </svg>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
      )}
    </div>
  );
};
