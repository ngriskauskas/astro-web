import { useEffect, useState } from "react";
import {
  ZodiacSigns,
  type PlanetName,
  type SingleChart,
  type ZodiacSign,
} from "../../contexts/ChartContext";
import { Background } from "./layers/Background";
import { Signs } from "./layers/Signs";
import { Houses } from "./layers/Houses";
import { Planets, type PlanetAngle } from "./layers/Planets";
import { Aspects } from "./layers/Aspects";
import type { ZodiacWheelOptions } from "./ZodiacWheelSettings";

interface ZodiacWheelProps {
  chart: SingleChart;
  aspectMinOrb: number;
  options: ZodiacWheelOptions;
}

export const ZodiacWheel = ({
  chart,
  aspectMinOrb = 6,
  options,
}: ZodiacWheelProps) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetName | null>(null);
  const [hoverAspectedPlanets, setHoverAspectedPlanets] = useState<
    PlanetName[]
  >([]);

  const calcCuspAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps["cusp1"].position;

    return Object.entries(chart.cusps).map(([_key, cusp]) => ({
      ...cusp,
      angle: (cusp.position - ascPos + 360) % 360,
    }));
  };

  const calcPlanetAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps["cusp1"].position;

    const planetAngles = Object.entries(chart.planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: (planet.position - ascPos + 360) % 360,
      }))
      .sort((a, b) => a.angle - b.angle);

    const adjusted: PlanetAngle[] = [];
    planetAngles.forEach((planet, i) => {
      if (i === 0) {
        adjusted.push({ ...planet, glyphAngle: planet.angle });
      } else {
        const prev = adjusted[i - 1];
        const diff = planet.angle - prev.glyphAngle;
        const glyphAngle = diff <= 4 ? prev.glyphAngle + 5 : planet.angle;
        adjusted.push({ ...planet, glyphAngle });
      }
    });

    return adjusted;
  };

  const calcSignAngles = (chart: SingleChart) => {
    const ascSign = chart.cusps["cusp1"].sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -chart.cusps["cusp1"].deg_in_sign;
    return ZodiacSigns.map((s, i) => {
      const offset = (i - ascIndex + 12) % 12;
      const angle =
        Math.round(((startAngleFirstSign + offset * 30 + 360) % 360) * 100) /
        100;
      const sign = s as ZodiacSign;
      return { sign, angle };
    });
  };

  const planetAngles = calcPlanetAngles(chart);
  const signAngles = calcSignAngles(chart);
  const cuspAngles = calcCuspAngles(chart);
  const size = 700;
  const radius = size / 2;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <Background radius={radius} />
      <Houses center={radius} radius={radius - 55} angles={cuspAngles} />
      <Signs center={radius} radius={radius - 5} angles={signAngles} />
      <Planets
        center={radius}
        radius={radius - 55}
        angles={planetAngles}
        hoverAspectedPlanets={hoverAspectedPlanets}
        onHoverPlanet={(planet) => {
          setHoveredPlanet(planet);
          chart.aspects.forEach(({ planet1, planet2, orb }) => {
            if (orb > aspectMinOrb) return;
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
        angles={planetAngles}
        aspects={chart.aspects}
        minOrb={aspectMinOrb}
        hoveredPlanet={hoveredPlanet}
      />
    </svg>
  );
};
