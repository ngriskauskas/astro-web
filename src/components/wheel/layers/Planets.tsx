import { PlanetsData } from "../../../constants/zodiac";
import { type Planet, type PlanetName } from "../../../contexts/ChartContext";
import { polarToCartesian } from "./Utils";

export interface PlanetAngle extends Planet {
  angle: number;
  glyphAngle: number;
}

interface PlanetProps {
  center: number;
  radius: number;
  angles: PlanetAngle[];
  onHoverPlanet: (name: PlanetName) => void;
  onLeavePlanet: () => void;
  hoverAspectedPlanets: PlanetName[];
}

export const Planets = ({
  radius,
  center,
  angles,
  onHoverPlanet,
  onLeavePlanet,
  hoverAspectedPlanets,
}: PlanetProps) => {
  const innerRadius = radius - 10;
  const outerRadius = radius;

  return (
    <g>
      {angles.map(({ name, angle, glyphAngle }) => {
        const { x: x1, y: y1 } = polarToCartesian(center, innerRadius, angle);
        const { x: x2, y: y2 } = polarToCartesian(center, outerRadius, angle);
        const { x: tx, y: ty } = polarToCartesian(
          center,
          outerRadius - 25,
          glyphAngle,
        );
        const isAspected = hoverAspectedPlanets.includes(name);
        const planetInfo = PlanetsData[name];
        return (
          <g key={name}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth={1}
            />
            <g
              key={name}
              className="group cursor-pointer transition-transform duration-200 ease-in-out 
              origin-[50%_50%] hover:scale-101"
              onMouseEnter={() => onHoverPlanet(name)}
              onMouseLeave={onLeavePlanet}
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
              {planetInfo.isSvg ? (
                <image
                  href={planetInfo.glyph}
                  x={tx - 15}
                  y={ty - 17}
                  width={25 * planetInfo.scale}
                  height={25 * planetInfo.scale}
                  className="transition duration-200 ease-in-out group-hover:brightness-150"
                />
              ) : (
                <text
                  x={tx}
                  y={ty}
                  fontSize={26 * planetInfo.scale}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily='"Segoe UI Symbol", "Noto Sans Symbols", sans-serif'
                  className="fill-current transition-transform duration-200 
                  ease-in-out group-hover:text-yellow-300"
                  pointerEvents="none"
                >
                  {planetInfo.glyph}
                </text>
              )}
            </g>
          </g>
        );
      })}
    </g>
  );
};
