import type { ReactNode } from "react";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import {
  getChartSource,
  useGeneratedDescriptions,
  type DistributionContext,
} from "../../hooks/descriptions/useGeneratedDescriptions";
import { ElementData, type ElementKey } from "../../types/element";
import { QuadrantData, type QuadrantKey } from "../../types/hemisphere";
import { ModalityData, type ModalityKey } from "../../types/modality";
import { PlanetsData } from "../../types/planet";
import { HouseData, type CuspType } from "../../types/cusp";
import { ZodiacData, ZodiacSigns, type ZodiacSign } from "../../types/zodiac";
import {
  CORE_ANGLES,
  CORE_PLANETS,
  quadrantOf,
} from "../../utils/natalSummary";

import { LoadError } from "../utils/LoadError";
import { Section, DescSection } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";

export type DistributionKind = "element" | "modality" | "quadrant";
type DistributionValue = ElementKey | ModalityKey | QuadrantKey;

// The quarter's number, counted from the Ascendant (1 to 4), as the chart code uses it.
const QUADRANT_NUMBER: Record<QuadrantKey, 1 | 2 | 3 | 4> = {
  personal: 1,
  private: 2,
  relational: 3,
  collective: 4,
};

// Each distribution's name, description and colour, and how its placements are phrased in a
// sentence ("in fire signs", "above the horizon").
const infoFor = (kind: DistributionKind, value: DistributionValue) => {
  switch (kind) {
    case "element": {
      const info = ElementData[value as ElementKey];
      return { name: info.name, description: info.description, glyph: info.glyph, color: info.color, place: `in ${info.name.toLowerCase()} signs` };
    }
    case "modality": {
      const info = ModalityData[value as ModalityKey];
      return { name: info.name, description: info.description, glyph: info.glyph, color: "#4f46e5", place: `in ${info.name.toLowerCase()} signs` };
    }
    case "quadrant": {
      const info = QuadrantData[value as QuadrantKey];
      return { name: info.name, description: info.description, glyph: undefined, color: info.color, place: `in the ${info.name.toLowerCase()} quarter` };
    }
  }
};

// The value as the reading names it: ABOVE, LOWER_EAST, and so on.
const contextValue = (kind: DistributionKind, value: DistributionValue) => {
  if (kind === "element" || kind === "modality") return infoFor(kind, value).name.toUpperCase();
  return (value as QuadrantKey).toUpperCase();
};

// The drawer for an element, a modality or a quarter of the chart: what it is in
// general, how much of this chart it makes up and which placements carry it, and what that
// emphasis means for this chart.
export const DistributionPanel = ({ kind, value }: { kind: DistributionKind; value: DistributionValue }) => {
  const { type, planetAngles, keyAngles } = useWheel() as SingleWheelContextType;
  const info = infoFor(kind, value);
  const { name, color } = info;
  const isSign = kind === "element" || kind === "modality";

  // The planets and, for signs only, the two angles. Signs count twelve placements; a quarter
  // counts the ten planets.
  const corePlanets = planetAngles.filter((planet) => CORE_PLANETS.includes(planet.name));
  const coreAngles = isSign ? keyAngles.filter((angle) => CORE_ANGLES.includes(angle.name)) : [];
  const total = corePlanets.length + coreAngles.length;

  const planetMatches = (planet: (typeof corePlanets)[number]) => {
    switch (kind) {
      case "element":
        return ZodiacData[planet.sign].info.element.name === name;
      case "modality":
        return ZodiacData[planet.sign].info.modality.name === name;
      case "quadrant":
        return quadrantOf(planet.house) === QUADRANT_NUMBER[value as QuadrantKey];
    }
  };
  const planetContributors = corePlanets.filter(planetMatches);
  const angleContributors = coreAngles.filter(
    (angle) => ZodiacData[angle.sign].info[kind === "element" ? "element" : "modality"].name === name,
  );
  const contributorCount = planetContributors.length + angleContributors.length;
  const share = total === 0 ? 0 : (contributorCount / total) * 100;

  // Rows: one per sign for elements and modalities, one per house for quarters.
  type Item = { key: string; glyph: string; label: string };
  const rows: { key: string; icon: ReactNode; title: string; items: Item[] }[] = isSign
    ? (ZodiacSigns as readonly ZodiacSign[]).flatMap((sign) => {
        const items: Item[] = [
          ...planetContributors
            .filter((planet) => planet.sign === sign)
            .map((planet) => ({ key: planet.name, glyph: PlanetsData[planet.name].glyph, label: PlanetsData[planet.name].displayName })),
          ...angleContributors
            .filter((angle) => angle.sign === sign)
            .map((angle) => ({ key: angle.name, glyph: "", label: angle.name })),
        ];
        if (items.length === 0) return [];
        const signInfo = ZodiacData[sign];
        return [
          {
            key: sign,
            title: signInfo.displayName,
            icon: <img src={signInfo.glyph} alt="" className="h-5 w-4 object-contain" />,
            items,
          },
        ];
      })
    : ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as CuspType[]).flatMap((house) => {
        const items: Item[] = planetContributors
          .filter((planet) => planet.house === house)
          .map((planet) => ({ key: planet.name, glyph: PlanetsData[planet.name].glyph, label: PlanetsData[planet.name].displayName }));
        if (items.length === 0) return [];
        return [
          {
            key: `house-${house}`,
            title: HouseData[house].name,
            icon: <span className="text-xs font-semibold tabular-nums text-gray-700">{house}</span>,
            items,
          },
        ];
      });

  const context: DistributionContext | null =
    total === 0
      ? null
      : {
          type: "distribution",
          chart: getChartSource(type),
          kind: kind.toUpperCase() as DistributionContext["kind"],
          value: contextValue(kind, value),
          count: contributorCount,
          total,
          contributors: [
            ...planetContributors.map((planet) => ({
              chart: getChartSource(type),
              point: { type: "planet" as const, name: planet.name },
              sign: planet.sign,
              house: planet.house,
              retrograde: planet.retrograde,
              stationary: planet.stationary,
            })),
            ...angleContributors.map((angle) => ({
              chart: getChartSource(type),
              point: { type: "keyAngle" as const, name: angle.name },
              sign: angle.sign,
            })),
          ],
        };
  const { loading, descriptions, error } = useGeneratedDescriptions([context]);

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between border-b border-gray-200 px-4 pb-3 pt-4"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}66)` }}
      >
        <BackButton />
        {info.glyph ? <img src={info.glyph} alt="" width={32} height={32} /> : <span className="h-8 w-8" aria-hidden="true" />}
        <h2 className="text-xl font-semibold">{name}</h2>
        <span className="h-8 w-8" aria-hidden="true" />
        <CloseButton />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3">
        <Section title="Overview">
          <p className="mb-1 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">{info.description}</p>
        </Section>

        <Section title="In this chart">
          <div className="flex flex-col gap-4">
            <div
              className="flex min-w-0 flex-col gap-2 rounded-xl border p-3"
              style={{ borderColor: `${color}55`, background: `linear-gradient(135deg, ${color}1f, transparent 80%)` }}
            >
              <div className="flex items-baseline gap-2">
                <span className="whitespace-nowrap text-2xl font-semibold tabular-nums text-gray-900">
                  {contributorCount} of {total}
                </span>
                <span className="text-sm text-gray-600">core placements {info.place}</span>
              </div>
              <span className="h-1.5 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${share}%`, backgroundColor: color }} />
              </span>
            </div>

            {contributorCount === 0 ? (
              <p className="text-sm text-gray-500">None of the core placements are {info.place}.</p>
            ) : (
              <ul
                aria-label={`Placements ${info.place}`}
                className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                {rows.map((row) => (
                  <li key={row.key} className="flex items-center gap-3 px-3 py-2.5">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${isSign ? ZodiacData[row.key as ZodiacSign].color : color}24` }}
                    >
                      {row.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-gray-900">{row.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-600">
                        {row.items.map((item, index) => (
                          <span key={item.key} className="inline-flex items-center gap-1">
                            {index > 0 && <span aria-hidden="true" className="text-gray-300">·</span>}
                            {item.glyph && <span aria-hidden="true" className="text-sm leading-none">{item.glyph}</span>}
                            {item.label}
                          </span>
                        ))}
                      </span>
                    </div>
                    <span className="tabular-nums text-xs text-gray-500">{row.items.length}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
