import { PlanetsData } from "../../types/planet";
import type { PlanetaryHourDescriptionValue } from "../../types/planetaryHours";
import { formatTime } from "../../utils/funcs";
import { PlanetChip } from "../utils/PlanetChip";
import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";

export const PlanetaryHourPanel = ({ value }: { value: PlanetaryHourDescriptionValue }) => {
  const { hour, end } = value;
  const planet = PlanetsData[hour.ruler];
  const period = hour.period === "DAY" ? "Day" : "Night";

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between border-b border-gray-200 px-4 py-3"
        style={{ background: `linear-gradient(135deg, ${planet.color}, ${planet.color}66)` }}
      >
        <BackButton />
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="text-2xl">
            {planet.glyph}
          </span>
          <h2 className="truncate text-xl font-semibold">{planet.displayName} Hour</h2>
        </div>
        <CloseButton />
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-3">
        <Section title="Overview">
          <p className="rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">
            A planetary hour is one of the 24 unequal periods between local sunrise and the next
            sunrise. The hour&apos;s ruler follows the traditional planetary sequence.
          </p>
        </Section>
        <Section title="This hour">
          <dl className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-3 gap-y-3 text-sm">
            <dt className="text-gray-500">Hour</dt>
            <dd className="m-0 font-medium text-gray-900">
              {hour.hour} of 24 · {period}
            </dd>
            <dt className="text-gray-500">Ruler</dt>
            <dd className="m-0">
              <PlanetChip planet={hour.ruler} />
            </dd>
            <dt className="text-gray-500">Planetary day</dt>
            <dd className="m-0">
              <PlanetChip planet={hour.dayRuler} />
            </dd>
            <dt className="text-gray-500">Starts</dt>
            <dd className="m-0 tabular-nums">
              <time dateTime={hour.dateTime}>{formatTime(new Date(hour.dateTime).getTime())}</time>
            </dd>
            <dt className="text-gray-500">Ends</dt>
            <dd className="m-0 tabular-nums">
              <time dateTime={end.toISOString()}>{formatTime(end.getTime())}</time>
            </dd>
          </dl>
        </Section>
      </div>
    </div>
  );
};
