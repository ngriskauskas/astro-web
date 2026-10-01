import { type PlanetName, type Planet, PlanetsData } from "../../../types/planet";
import { useDesc } from "../../../contexts/DescContext";
import { polarToCartesian } from "./Utils";
import type { OwnerType } from "../../../contexts/MultiWheelContext";
import { formatDegMin } from "../../../utils/funcs";
import { useChartSettings } from "../../../contexts/ChartSettingsContext";

export interface PlanetAngle extends Planet {
  angle: number;
  glyphAngle: number;
}

interface PlanetProps {
  center: number;
  radius: number;
  onHoverPlanet: (name: PlanetName) => void;
  onLeavePlanet: () => void;
  hoverAspectedPlanets: PlanetName[];
  angles: PlanetAngle[];
  owner?: OwnerType;
}

export const Planets = ({
  radius,
  center,
  onHoverPlanet,
  onLeavePlanet,
  hoverAspectedPlanets,
  angles,
  owner,
}: PlanetProps) => {
  const {
    settings: {
      displayOptions: { angleLabels: showAngleLabels },
      objectOptions: options,
    },
  } = useChartSettings();

  const { open } = useDesc();

  const innerRadius = radius - 10;
  const outerRadius = radius;
  return (
    <g>
      {angles.map((planet) => {
        const {
          name,
          angle,
          glyphAngle,
          retrograde,
          position: { degMin },
        } = planet;
        if (name === "CHIRON" && !options.showChiron) return;
        if (name === "LILITH" && !options.showLilith) return;

        const { x: x1, y: y1 } = polarToCartesian(center, innerRadius, angle);
        const { x: x2, y: y2 } = polarToCartesian(center, outerRadius, angle);
        const { x: tx, y: ty } = polarToCartesian(center, outerRadius - 25, glyphAngle);
        const { x: dx, y: dy } = polarToCartesian(center, outerRadius - 60, glyphAngle);

        const isAspected = hoverAspectedPlanets.includes(name);
        const planetInfo = PlanetsData[name];
        return (
          <g key={name}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={1} />
            <g
              key={name}
              className="group cursor-pointer transition-transform duration-200 ease-in-out 
              origin-[50%_50%] hover:scale-101"
              onMouseEnter={() => onHoverPlanet(name)}
              onMouseLeave={onLeavePlanet}
              onClick={() => open({ type: "planet", value: planet.name, owner })}
            >
              <circle
                cx={tx}
                cy={ty - 2}
                r={14}
                fill="transparent"
                className={`transition-all duration-200 ease-in-out
                  ${isAspected ? "stroke-white" : ""} 
                  group-hover:stroke-yellow-300`}
              />
              <text
                x={tx}
                y={ty}
                fontSize={26 * planetInfo.scale}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current transition-transform duration-200 
                  ease-in-out group-hover:text-yellow-300"
                pointerEvents="none"
              >
                {planetInfo.glyph}
              </text>
              {retrograde && (
                <text
                  x={tx + 9}
                  y={ty + 10}
                  fontSize={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-current transition-transform duration-200 
                    ease-in-out group-hover:text-yellow-300"
                  pointerEvents="none"
                >
                  ℞
                </text>
              )}
              {showAngleLabels && (
                <text
                  x={dx}
                  y={dy}
                  fontSize={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {formatDegMin(degMin)}
                </text>
              )}
            </g>
          </g>
        );
      })}
    </g>
  );
};
