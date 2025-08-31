import { useEffect } from "react";
import {
  ZodiacSigns,
  type SingleChart,
  type ZodiacSign,
} from "../../contexts/ChartContext";
import { Background } from "./layers/Background";
import { Signs } from "./layers/Signs";
import { Houses } from "./layers/Houses";
import { Planets } from "./layers/Planets";

interface ZodiacWheelProps {
  chart: SingleChart;
  showAspects: true;
}

export const ZodiacWheel = ({ chart, showAspects }: ZodiacWheelProps) => {
  const calcCuspAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps["cusp1"].position;

    return Object.entries(chart.cusps).map(([_key, cusp]) => ({
      ...cusp,
      angle: (cusp.position - ascPos + 360) % 360,
    }));
  };

  const calcPlanetAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps["cusp1"].position;

    return Object.entries(chart.planets).map(([_key, planet]) => ({
      ...planet,
      angle: (planet.position - ascPos + 360) % 360,
    }));
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

  const size = 700;
  const radius = size / 2;
  return (
    <svg width={size} height={size}>
      <Background radius={radius} />
      <Signs
        center={radius}
        radius={radius - 5}
        angles={calcSignAngles(chart)}
      />
      <Houses
        center={radius}
        radius={radius - 120}
        angles={calcCuspAngles(chart)}
      />
      <Planets
        center={radius}
        radius={radius - 200}
        angles={calcPlanetAngles(chart)}
      />
    </svg>
  );
};
