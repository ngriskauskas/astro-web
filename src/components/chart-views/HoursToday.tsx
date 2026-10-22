import { usePlanetaryHours } from "../../hooks/usePlanetaryHours";
import { PlanetsData } from "../../types/planet";
import { formatTime } from "../../utils/funcs";
import { currentPlanetaryHour } from "../../utils/planetaryHours";
import { useDesc } from "../../contexts/DescContext";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";
import { Widget, type WidgetProps } from "../widgets/Widget";

// The day's 24 planetary hours as a scannable list. The hour in progress is marked with
// aria-current and a tint, so the state is not carried by colour alone.
export const HoursToday = ({ className }: WidgetProps) => (
  <Widget id="hours-today" title="Planetary hours" tone="hours" className={className}>
    <HoursTodayBody />
  </Widget>
);

const HoursTodayBody = () => {
  const { status, data, now } = usePlanetaryHours();
  const { open } = useDesc();

  if (status === "loading") return <Spinner />;
  if (!data) return <LoadError message="Planetary hours are not available for this location today." />;

  const current = currentPlanetaryHour(data, now)?.hour;
  // The list leads with the previous day's night hours; only the requested day's 24 are shown.
  const today = data.hours.filter((hour) => hour.dayRuler === data.dayRuler);

  return (
    <>
      <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {today.map((hour) => {
          const planet = PlanetsData[hour.ruler];
          const isNow = hour === current;
          const nextHour = data.hours.find(
            (candidate) => new Date(candidate.dateTime).getTime() > new Date(hour.dateTime).getTime(),
          );
          const end = new Date(nextHour?.dateTime ?? data.dayEnd);
          return (
            <li
              key={hour.hour}
              aria-current={isNow ? "time" : undefined}
              className={`rounded-lg border transition-colors ${
                isNow ? "border-amber-500/60 bg-amber-500/10 font-medium text-gray-900" : "border-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              <button
                type="button"
                aria-label={`View ${planet.displayName} hour ${hour.hour} details`}
                onClick={() => open({ type: "planetaryHour", value: { hour, end } })}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-gray-500">{hour.hour}</span>
                <span aria-hidden="true" style={{ color: planet.color }} className="w-4 shrink-0 text-center text-base">
                  {planet.glyph}
                </span>
                <span className="min-w-0 leading-snug">
                  {planet.displayName}
                  <span className="sr-only">
                    {hour.period === "DAY" ? " daytime hour" : " night hour"}
                    {isNow ? ", now" : ""}
                  </span>
                </span>
                <span className="ml-auto shrink-0 text-xs tabular-nums text-gray-600">
                  {formatTime(new Date(hour.dateTime).getTime())}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
};

// The next three hours to start, with how long until each one. Fills the space beside the
// current hour, and answers "what's next" without opening the full list.
export const UpcomingHours = ({ className }: WidgetProps) => (
  <Widget id="coming-up" title="Coming up" tone="hours" className={className}>
    <UpcomingHoursBody />
  </Widget>
);

const UpcomingHoursBody = () => {
  const { status, data, now } = usePlanetaryHours();
  const { open } = useDesc();

  if (status === "loading") return <Spinner />;
  if (!data) return <LoadError message="Planetary hours are not available for this location today." />;

  const upcoming = data.hours
    .filter((hour) => new Date(hour.dateTime).getTime() > now.getTime())
    .slice(0, 3);

  return (
    <>
      <ol className="grid gap-2 sm:grid-cols-3">
        {upcoming.map((hour, index) => {
          const planet = PlanetsData[hour.ruler];
          const start = new Date(hour.dateTime).getTime();
          const nextHour =
            upcoming[index + 1] ??
            data.hours.find((candidate) => new Date(candidate.dateTime).getTime() > start);
          const end = new Date(nextHour?.dateTime ?? data.dayEnd);
          return (
            <li
              key={hour.hour}
              className="rounded-xl border border-gray-200 bg-white"
              style={{ background: `linear-gradient(135deg, ${planet.color}1a, transparent 80%)` }}
            >
              <button
                type="button"
                aria-label={`View ${planet.displayName} hour ${hour.hour} details`}
                onClick={() => open({ type: "planetaryHour", value: { hour, end } })}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${planet.color}2e`, color: planet.color }}
                >
                  {planet.glyph}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {planet.displayName}
                  </span>
                  <span className="block text-xs tabular-nums text-gray-600">
                    {formatTime(start)} · in {formatUntil(start - now.getTime())}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
};

const formatUntil = (milliseconds: number) => {
  const minutes = Math.max(1, Math.round(milliseconds / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};
