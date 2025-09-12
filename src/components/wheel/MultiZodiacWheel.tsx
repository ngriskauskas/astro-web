import { useState } from "react";
import { Background } from "./layers/Background";
import { Signs } from "./layers/Signs";
import { Houses } from "./layers/Houses";
import { Planets } from "./layers/Planets";
import { ZodiacWheelSettings } from "./ZodiacWheelSettings";
import { MultiAspects } from "./layers/MultiAspects";
import { useWheel } from "../../hooks/useWheel";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { type PlanetName } from "../../types/planet";

export const MultiZodiacWheel = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState<{
    planet: PlanetName;
    profile: "main" | "other";
  } | null>(null);
  const [hoverAspectedPlanets, setHoverAspectedPlanets] = useState<{
    planets: PlanetName[];
    profile: "main" | "other";
  } | null>(null);

  const {
    mainCuspAngles,
    otherCuspAngles,
    mainPlanetAngles,
    otherPlanetAngles,
    mainKeyAngles,
    otherKeyAngles,
    aspects,
    settings: { aspectOptions },
  } = useWheel() as MultiWheelContextType;

  const size = 800;
  const radius = size / 2;

  return (
    <div className="flex gap-5 items-center">
      <div className="flex-[3] flex-shrink-0 flex justify-center">
        {mainPlanetAngles ? (
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            height="auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <Background radius={radius} />
            <Houses
              center={radius}
              radius={radius - 55}
              innerRadius={radius - 145}
              angles={mainCuspAngles}
              keyAngles={mainKeyAngles}
              owner="main"
            />
            <Houses
              center={radius}
              radius={radius - 145}
              innerRadius={radius - 240}
              angles={otherCuspAngles}
              keyAngles={otherKeyAngles}
              owner="other"
            />
            <Signs center={radius} radius={radius - 5} />
            <Planets
              owner="main"
              center={radius}
              radius={radius - 55}
              angles={mainPlanetAngles}
              hoverAspectedPlanets={
                hoverAspectedPlanets?.profile === "main"
                  ? hoverAspectedPlanets.planets
                  : []
              }
              onHoverPlanet={(planet) => {
                setHoveredPlanet({ planet, profile: "main" });
                aspects.forEach(({ planet1, planet2, orb, type }) => {
                  const { minOrb, show } = aspectOptions[type];
                  if (!show || orb > minOrb) return;
                  if (planet1.name === planet)
                    setHoverAspectedPlanets((prev) => ({
                      planets: [planet2.name, ...(prev?.planets || [])],
                      profile: "other",
                    }));
                });
              }}
              onLeavePlanet={() => {
                setHoveredPlanet(null);
                setHoverAspectedPlanets(null);
              }}
            />

            <Planets
              owner="other"
              center={radius}
              radius={radius - 145}
              angles={otherPlanetAngles}
              hoverAspectedPlanets={
                hoverAspectedPlanets?.profile === "other"
                  ? hoverAspectedPlanets.planets
                  : []
              }
              onHoverPlanet={(planet) => {
                setHoveredPlanet({ planet, profile: "other" });
                aspects.forEach(({ planet1, planet2, orb, type }) => {
                  const { minOrb, show } = aspectOptions[type];
                  if (!show || orb > minOrb) return;
                  if (planet2.name === planet)
                    setHoverAspectedPlanets((prev) => ({
                      planets: [planet1.name, ...(prev?.planets || [])],
                      profile: "main",
                    }));
                });
              }}
              onLeavePlanet={() => {
                setHoveredPlanet(null);
                setHoverAspectedPlanets(null);
              }}
            />
            <MultiAspects
              center={radius}
              radius={radius - 240}
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
