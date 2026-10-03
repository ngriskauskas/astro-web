import { useState } from "react";
import { Background } from "./layers/Background";
import { Signs } from "./layers/Signs";
import { Houses } from "./layers/Houses";
import { Planets } from "./layers/Planets";
import { MultiAspects } from "./layers/MultiAspects";
import { useWheel } from "../../hooks/useWheel";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { type PlanetName } from "../../types/planet";
import { LoadError } from "../utils/LoadError";

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
    status,
  } = useWheel() as MultiWheelContextType;

  const size = 800;
  const radius = size / 2;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[760px]">
        {status === "error" ? (
          <LoadError message="Could not load the chart." />
        ) : mainPlanetAngles.length > 0 ? (
          <svg
            role="group"
            aria-label="Chart wheel"
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            preserveAspectRatio="xMidYMid meet"
          >
            <Background radius={radius} />
            <Houses
              center={radius}
              radius={radius - 55}
              innerRadius={radius - 145}
              angles={otherCuspAngles}
              keyAngles={otherKeyAngles}
              owner="other"
            />
            <Houses
              center={radius}
              radius={radius - 145}
              innerRadius={radius - 240}
              angles={mainCuspAngles}
              keyAngles={mainKeyAngles}
              owner="main"
            />
            <Signs center={radius} radius={radius - 5} />
            <Planets
              owner="other"
              center={radius}
              radius={radius - 55}
              angles={otherPlanetAngles}
              hoverAspectedPlanets={
                hoverAspectedPlanets?.profile === "other" ? hoverAspectedPlanets.planets : []
              }
              onHoverPlanet={(planet) => {
                setHoveredPlanet({ planet, profile: "other" });
                aspects.forEach(({ point1, point2 }) => {
                  if (
                    point1.type === "Planet" &&
                    point2.type === "Planet" &&
                    point2.value.name === planet
                  )
                    setHoverAspectedPlanets((prev) => ({
                      planets: [point1.value.name, ...(prev?.planets || [])],
                      profile: "main",
                    }));
                });
              }}
              onLeavePlanet={() => {
                setHoveredPlanet(null);
                setHoverAspectedPlanets(null);
              }}
            />

            <Planets
              owner="main"
              center={radius}
              radius={radius - 145}
              angles={mainPlanetAngles}
              hoverAspectedPlanets={
                hoverAspectedPlanets?.profile === "main" ? hoverAspectedPlanets.planets : []
              }
              onHoverPlanet={(planet) => {
                setHoveredPlanet({ planet, profile: "main" });
                aspects.forEach(({ point1, point2 }) => {
                  if (
                    point1.type === "Planet" &&
                    point2.type === "Planet" &&
                    point1.value.name === planet
                  )
                    setHoverAspectedPlanets((prev) => ({
                      planets: [point2.value.name, ...(prev?.planets || [])],
                      profile: "other",
                    }));
                });
              }}
              onLeavePlanet={() => {
                setHoveredPlanet(null);
                setHoverAspectedPlanets(null);
              }}
            />
            <MultiAspects center={radius} radius={radius - 240} hoveredPlanet={hoveredPlanet} />
          </svg>
        ) : (
          <div
            role="status"
            aria-label="Loading"
            className="flex items-center justify-center h-full text-gray-500"
          >
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};
