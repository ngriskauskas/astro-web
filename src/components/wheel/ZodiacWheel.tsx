import { useState } from "react";
import { Background } from "./layers/Background";
import { Signs } from "./layers/Signs";
import { Houses } from "./layers/Houses";
import { Planets } from "./layers/Planets";
import { Aspects } from "./layers/Aspects";
import { useWheel } from "../../hooks/useWheel";
import { ZodiacWheelSettings } from "./ZodiacWheelSettings";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { type PlanetName } from "../../types/planet";

export const ZodiacWheel = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetName | null>(null);
  const [hoverAspectedPlanets, setHoverAspectedPlanets] = useState<
    PlanetName[]
  >([]);

  const {
    aspects,
    planetAngles,
    cuspAngles,
    settings: { aspectOptions },
  } = useWheel() as SingleWheelContextType;

  const size = 700;
  const radius = size / 2;

  return (
    <div className="flex gap-5 items-center">
      <div className="flex-[3] flex-shrink-0 flex justify-center">
        {aspects ? (
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            height="auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <Background radius={radius} />
            <Houses
              angles={cuspAngles}
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
                aspects.forEach(({ planet1, planet2, orb, type }) => {
                  const { minOrb, show } = aspectOptions[type];
                  if (!show || orb > minOrb) return;
                  if (planet1.name === planet)
                    setHoverAspectedPlanets((prev) => [planet2.name, ...prev]);
                  else if (planet2.name === planet)
                    setHoverAspectedPlanets((prev) => [planet1.name, ...prev]);
                });
              }}
              onLeavePlanet={() => {
                setHoveredPlanet(null);
                setHoverAspectedPlanets([]);
              }}
            />
            <Aspects
              center={radius}
              radius={radius - 175}
              hoveredPlanet={hoveredPlanet}
            />
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        )}
      </div>
      <div className="flex-[1] max-h-[600px] overflow-y-auto my-5">
        <ZodiacWheelSettings />
      </div>
    </div>
  );
};
