import { useDesc } from "../../contexts/DescContext";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { AspectData } from "../../types/aspect";
import { ElementData, type ElementKey } from "../../types/element";
import { ModalityData, type ModalityKey } from "../../types/modality";
import { PlanetsData } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import {
  CORE_ANGLES,
  CORE_PLANETS,
  elementTally,
  modalityTally,
  tightestPlanetAspects,
  type Tally,
} from "../../utils/natalSummary";
import { CHIP_BASE, chipTint } from "../utils/chipStyles";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";

// The shape of a birth chart at a glance: which elements and modalities dominate, and the
// three tightest planet-to-planet aspects.
export const NatalSummary = () => {
  const { planetAngles, keyAngles, status } = useWheel() as SingleWheelContextType;
  const { open } = useDesc();
  if (status === "error") return <LoadError message="Could not load the birth chart." />;
  if (status === "loading" || planetAngles.length === 0) return <Spinner />;

  // Ten planets and the two angles: twelve placements in all.
  const signs = [
    ...planetAngles
      .filter((planet) => CORE_PLANETS.includes(planet.name))
      .map((planet) => planet.sign as ZodiacSign),
    ...keyAngles
      .filter((angle) => CORE_ANGLES.includes(angle.name))
      .map((angle) => angle.sign as ZodiacSign),
  ];

  return (
    <div className="flex flex-col gap-5">
      <TallySection
        title="Elements"
        tallies={elementTally(signs)}
        tint={(name) => Object.values(ElementData).find((element) => element.name === name)?.color}
        glyph={(name) => Object.values(ElementData).find((element) => element.name === name)?.glyph}
        onSelect={(name) => {
          const key = (Object.keys(ElementData) as ElementKey[]).find((k) => ElementData[k].name === name);
          if (key) open({ type: "element", value: key });
        }}
      />
      <TallySection
        title="Modalities"
        tallies={modalityTally(signs)}
        glyph={(name) => Object.values(ModalityData).find((modality) => modality.name === name)?.glyph}
        onSelect={(name) => {
          const key = (Object.keys(ModalityData) as ModalityKey[]).find((k) => ModalityData[k].name === name);
          if (key) open({ type: "modality", value: key });
        }}
      />
      <section aria-labelledby="tight-aspects-heading">
        <TightestAspects limit={3} />
      </section>
    </div>
  );
};

// A count per element or modality as a tile, the largest first. Each tile is tinted by its
// colour, and a thin bar shows its share of the core planets, like the hour progress bar.
const TallySection = ({
  title,
  tallies,
  tint,
  glyph,
  onSelect,
}: {
  title: string;
  tallies: Tally[];
  tint?: (name: string) => string | undefined;
  glyph: (name: string) => string | undefined;
  onSelect: (name: string) => void;
}) => {
  const total = tallies.reduce((sum, tally) => sum + tally.count, 0);
  const top = tallies[0];
  const headingId = `${title.toLowerCase()}-summary-heading`;
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="mb-2 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-gray-900">
        {title}
        {top && <span className="text-xs font-normal text-gray-500">Mostly {top.name} ({top.count} of {total})</span>}
      </h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tallies.map((tally) => {
          const color = tint?.(tally.name) ?? "#4f46e5";
          const share = (tally.count / total) * 100;
          return (
            <li key={tally.name}>
            <button
              type="button"
              onClick={() => onSelect(tally.name)}
              aria-label={`${tally.name}: ${tally.count} of ${total}, view details`}
              className="flex w-full min-w-0 cursor-pointer flex-col gap-2 rounded-xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              style={{
                borderColor: `${color}55`,
                background: `linear-gradient(135deg, ${color}1f, transparent 80%)`,
              }}
            >
              <div className="flex items-center gap-2">
                {glyph(tally.name) && (
                  <img src={glyph(tally.name)} alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
                )}
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{tally.name}</span>
              </div>
              <span className="text-xl font-semibold tabular-nums leading-none text-gray-900">{tally.count}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                <span
                  className="block h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${share}%`, backgroundColor: color }}
                />
              </span>
            </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

// The planet-to-planet aspects with the smallest orbs, each as a chip in its aspect's colour.
export const TightestAspects = ({
  limit,
  headingId = "tight-aspects-heading",
}: {
  limit: number;
  headingId?: string;
}) => {
  const { chartAspects } = useWheel() as SingleWheelContextType;
  const aspects = tightestPlanetAspects(chartAspects, limit);
  return (
    <>
      <h3 id={headingId} className="mb-2 text-sm font-semibold text-gray-900">
        Tightest aspects
      </h3>
      {aspects.length === 0 ? (
        <p className="text-sm text-gray-500">No aspects between planets in this chart.</p>
      ) : (
        <ol className="flex flex-wrap gap-2">
          {aspects.map((aspect, index) => {
            const first = PlanetsData[aspect.point1.value.name];
            const second = PlanetsData[aspect.point2.value.name];
            const type = AspectData[aspect.type];
            return (
              <li key={index}>
                <span className={`${CHIP_BASE} gap-2`} style={chipTint(type.color)}>
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className="text-sm leading-none">{first.glyph}</span>
                    <span>{first.displayName}</span>
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 items-center justify-center rounded-full text-xs leading-none"
                      style={{ backgroundColor: `${type.color}33`, color: type.color }}
                    >
                      {type.glyph}
                    </span>
                    <span className="sr-only">{type.name}</span>
                    <span aria-hidden="true" className="text-sm leading-none">{second.glyph}</span>
                    <span>{second.displayName}</span>
                  </span>
                  <span className="font-normal tabular-nums text-gray-600">{aspect.orb.toFixed(1)}°</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
};
