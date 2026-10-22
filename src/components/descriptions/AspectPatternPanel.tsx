import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import {
  getChartSource,
  useGeneratedDescriptions,
  type PatternContext,
  type PointPlacementContext,
} from "../../hooks/descriptions/useGeneratedDescriptions";
import { isMulti, useWheel } from "../../hooks/useWheel";
import { AspectPatternData, type AspectPatternDescriptionValue } from "../../types/aspectPattern";
import { HouseData } from "../../types/cusp";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { ZodiacData } from "../../types/zodiac";
import { PlanetChip } from "../utils/PlanetChip";
import { LoadError } from "../utils/LoadError";
import { Section, DescSection } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";

// The drawer for one shape: what it is in general, which planets it is made of and where they
// sit, and what the shape means in this chart.
export const AspectPatternPanel = ({ value }: { value: AspectPatternDescriptionValue }) => {
  const ctx = useWheel();
  const { pattern, owner = "main" } = value;
  const info = AspectPatternData[pattern.type];

  const placements = isMulti(ctx)
    ? owner === "other"
      ? (ctx as MultiWheelContextType).otherPlanetAngles
      : (ctx as MultiWheelContextType).mainPlanetAngles
    : (ctx as SingleWheelContextType).planetAngles;
  const chart = getChartSource(ctx.type, owner);
  const toContext = (name: PlanetName): PointPlacementContext => {
    const planet = placements.find((candidate) => candidate.name === name);
    return {
      chart,
      point: { type: "planet", name },
      sign: planet?.sign ?? null,
      house: planet?.house ?? null,
      retrograde: planet?.retrograde ?? null,
      stationary: planet?.stationary ?? null,
    };
  };

  const context: PatternContext = {
    type: "pattern",
    chart,
    kind: pattern.type,
    planets: pattern.planets.map(toContext),
    focus: pattern.focus.map(toContext),
    sign: pattern.sign,
  };
  const { loading, descriptions, error } = useGeneratedDescriptions([context]);
  const headline = pattern.sign ? `${info.name} in ${ZodiacData[pattern.sign].displayName}` : info.name;

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between border-b border-gray-200 px-4 pb-3 pt-4"
        style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}66)` }}
      >
        <BackButton />
        <span className="h-8 w-8" aria-hidden="true" />
        <h2 className="text-center text-xl font-semibold">{headline}</h2>
        <span className="h-8 w-8" aria-hidden="true" />
        <CloseButton />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3">
        <Section title="Overview">
          <p className="mb-1 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">{info.description}</p>
        </Section>

        <Section title="In this chart">
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {pattern.planets.map((name) => {
              const planet = placements.find((candidate) => candidate.name === name);
              const focus = pattern.focus.includes(name);
              return (
                <li key={name} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                  <PlanetChip planet={name} owner={owner} />
                  {planet && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <img src={ZodiacData[planet.sign].glyph} alt="" className="h-3.5 w-3.5" />
                      {ZodiacData[planet.sign].displayName}
                      {!pattern.sign && <span aria-hidden="true">·</span>}
                      {!pattern.sign && HouseData[planet.house].name}
                    </span>
                  )}
                  {focus && <span className="ml-auto text-xs font-medium text-gray-700">Focus</span>}
                  {!planet && <span className="text-xs text-gray-500">{PlanetsData[name].displayName}</span>}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="What it means here" loading={loading}>
          {error ? (
            <LoadError message="Could not load this description." />
          ) : (
            <DescSection desc={descriptions[0] ?? ""} startOpen />
          )}
        </Section>
      </div>
    </div>
  );
};
