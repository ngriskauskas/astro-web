import { useState } from "react";
import {
  ZodiacSigns,
  type MultiChart,
  type PlanetName,
  type SingleChart,
  type ZodiacSign,
} from "../../contexts/ChartContext";
import { Background } from "./layers/Background";
import { Signs } from "./layers/Signs";
import { Houses } from "./layers/Houses";
import { Planets, type PlanetAngle } from "./layers/Planets";
import type { ZodiacWheelOptions } from "./ZodiacWheelSettings";
import { MultiAspects } from "./layers/MultiAspects";

interface MultiZodiacWheelProps {
  chart: MultiChart;
  options: ZodiacWheelOptions;
}

export const MultiZodiacWheel = ({ chart, options }: MultiZodiacWheelProps) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<{
    planet: PlanetName;
    profile: "main" | "other";
  } | null>(null);
  const [hoverAspectedPlanets, setHoverAspectedPlanets] = useState<{
    planets: PlanetName[];
    profile: "main" | "other";
  } | null>(null);

  const calcCuspAngles = (chart: MultiChart) => {
    const ascPos = chart.main.cusps["cusp1"].position;

    const mainCuspAngles = Object.entries(chart.main.cusps).map(
      ([_key, cusp]) => ({
        ...cusp,
        angle: (cusp.position - ascPos + 360) % 360,
      }),
    );
    const otherCuspAngles = Object.entries(chart.other.cusps).map(
      ([_key, cusp]) => ({
        ...cusp,
        angle: (cusp.position - ascPos + 360) % 360,
      }),
    );

    return { mainCuspAngles, otherCuspAngles };
  };

  const calcPlanetAngles = (chart: MultiChart) => {
    const ascPos = chart.main.cusps["cusp1"].position;

    const rawMainPlanetAngles = Object.entries(chart.main.planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: (planet.position - ascPos + 360) % 360,
      }))
      .sort((a, b) => a.angle - b.angle);

    const rawOtherPlanetAngles = Object.entries(chart.other.planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: (planet.position - ascPos + 360) % 360,
      }))
      .sort((a, b) => a.angle - b.angle);

    const mainPlanetAngles: PlanetAngle[] = [];
    rawMainPlanetAngles.forEach((planet, i) => {
      if (i === 0) {
        mainPlanetAngles.push({ ...planet, glyphAngle: planet.angle });
      } else {
        const prev = mainPlanetAngles[i - 1];
        const diff = planet.angle - prev.glyphAngle;
        const glyphAngle = diff <= 4 ? prev.glyphAngle + 5 : planet.angle;
        mainPlanetAngles.push({ ...planet, glyphAngle });
      }
    });

    const otherPlanetAngles: PlanetAngle[] = [];
    rawOtherPlanetAngles.forEach((planet, i) => {
      if (i === 0) {
        otherPlanetAngles.push({ ...planet, glyphAngle: planet.angle });
      } else {
        const prev = otherPlanetAngles[i - 1];
        const diff = planet.angle - prev.glyphAngle;
        const glyphAngle = diff <= 4 ? prev.glyphAngle + 5 : planet.angle;
        otherPlanetAngles.push({ ...planet, glyphAngle });
      }
    });

    return { mainPlanetAngles, otherPlanetAngles };
  };

  const calcSignAngles = (chart: MultiChart) => {
    const ascSign = chart.main.cusps["cusp1"].sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -chart.main.cusps["cusp1"].deg_in_sign;
    return ZodiacSigns.map((s, i) => {
      const offset = (i - ascIndex + 12) % 12;
      const angle =
        Math.round(((startAngleFirstSign + offset * 30 + 360) % 360) * 100) /
        100;
      const sign = s as ZodiacSign;
      return { sign, angle };
    });
  };

  const { mainPlanetAngles, otherPlanetAngles } = calcPlanetAngles(chart);
  const { mainCuspAngles, otherCuspAngles } = calcCuspAngles(chart);
  const signAngles = calcSignAngles(chart);
  const size = 800;
  const radius = size / 2;

  return (
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
        showAngleLabels={options.displayOptions.angleLabels}
      />
      <Houses
        center={radius}
        radius={radius - 145}
        innerRadius={radius - 240}
        angles={otherCuspAngles}
        showAngleLabels={options.displayOptions.angleLabels}
      />
      <Signs
        center={radius}
        radius={radius - 5}
        angles={signAngles}
        showTickMarks={options.displayOptions.tickMarks}
      />
      <Planets
        center={radius}
        radius={radius - 55}
        angles={mainPlanetAngles}
        hoverAspectedPlanets={
          hoverAspectedPlanets?.profile === "main"
            ? hoverAspectedPlanets.planets
            : []
        }
        options={options.objectOptions}
        showAngleLabels={options.displayOptions.angleLabels}
        onHoverPlanet={(planet) => {
          setHoveredPlanet({ planet, profile: "main" });
          chart.aspects.forEach(({ planet1, planet2, orb, type }) => {
            const { minOrb, show } = options.aspectOptions[type];
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
        center={radius}
        radius={radius - 145}
        angles={otherPlanetAngles}
        hoverAspectedPlanets={
          hoverAspectedPlanets?.profile === "other"
            ? hoverAspectedPlanets.planets
            : []
        }
        options={options.objectOptions}
        showAngleLabels={options.displayOptions.angleLabels}
        onHoverPlanet={(planet) => {
          setHoveredPlanet({ planet, profile: "other" });
          chart.aspects.forEach(({ planet1, planet2, orb, type }) => {
            const { minOrb, show } = options.aspectOptions[type];
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
        mainAngles={mainPlanetAngles}
        otherAngles={otherPlanetAngles}
        aspects={chart.aspects}
        options={options.aspectOptions}
        objectOptions={options.objectOptions}
        hoveredPlanet={hoveredPlanet}
      />
    </svg>
  );
};
