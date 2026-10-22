import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useDesc } from "../../contexts/DescContext";
import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { useWheel } from "../../hooks/useWheel";
import { AngleData, HouseData } from "../../types/cusp";
import { PlanetsData } from "../../types/planet";
import { ZodiacData } from "../../types/zodiac";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";
import { Widget, type WidgetProps } from "../widgets/Widget";

// The Rising, Sun and Moon of the main birth chart: who you are, at a glance.
export const NatalSnapshot = ({
  className,
  link,
}: WidgetProps & { link?: { to: string; label: string } }) => {
  const { mainProfile } = useBirthProfiles();

  return (
    <Widget
      id="natal-snapshot"
      title="Your natal snapshot"
      subtitle={mainProfile && `${mainProfile.name}'s birth chart`}
      link={link}
      className={className}
    >
      <NatalSnapshotBody />
    </Widget>
  );
};

const NatalSnapshotBody = () => {
  const { planetAngles, keyAngles, status, timeUnknown } = useWheel() as SingleWheelContextType;
  const { open } = useDesc();
  if (status === "error") return <LoadError message="Could not load the birth chart." />;
  if (status === "loading" || planetAngles.length === 0) return <Spinner />;

  const keyPlacements = [
    ...keyAngles
      .filter(({ name }) => name === "ASC")
      .map(({ name, sign }) => ({ type: "angle" as const, name, sign })),
    ...planetAngles
      .filter(({ name }) => name === "SUN" || name === "MOON")
      .map(({ name, sign, house }) => ({ type: "planet" as const, name, sign, house })),
  ].sort(
    (left, right) =>
      ["ASC", "SUN", "MOON"].indexOf(left.name) - ["ASC", "SUN", "MOON"].indexOf(right.name),
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {keyPlacements.map((placement) => {
        const isPlanet = placement.type === "planet";
        const label = isPlanet ? PlanetsData[placement.name].displayName : "Rising";
        const name = placement.name;
        const sign = ZodiacData[placement.sign];
        const pointColor = isPlanet ? PlanetsData[placement.name].color : AngleData.ASC.color;
        return (
          <button
            key={name}
            type="button"
            onClick={() =>
              isPlanet
                ? open({ type: "planet", value: placement.name })
                : open({ type: "angle", value: "ASC" })
            }
            aria-label={`View natal ${label} details`}
            className="group relative isolate flex min-h-36 min-w-0 cursor-pointer flex-col items-start justify-between overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            style={{
              borderColor: `${sign.color}66`,
              background: `linear-gradient(145deg, white 8%, ${sign.color}18 100%)`,
            }}
          >
            <img
              src={sign.drawing}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-3 -top-4 -z-10 h-32 w-32 object-contain opacity-[0.13] transition duration-200 group-hover:scale-105 group-hover:opacity-20"
            />
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${
                  isPlanet ? "text-xl" : "text-[10px] font-bold tracking-tight"
                }`}
                style={{
                  color: "var(--color-gray-800)",
                  borderColor: `${pointColor}88`,
                  backgroundColor: `${pointColor}30`,
                }}
              >
                {isPlanet ? PlanetsData[placement.name].glyph : "ASC"}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  {isPlanet ? PlanetsData[placement.name].displayName : "Rising"}
                </span>
              </span>
            </div>
            <div className="relative mt-4 flex items-center gap-2">
              <img src={sign.glyph} alt="" className="h-7 w-7 object-contain" />
              <span className="text-xl font-semibold tracking-tight text-gray-900">
                {sign.displayName}
              </span>
            </div>
            {isPlanet && !timeUnknown && (
              <span className="mt-2 text-xs font-medium text-gray-600">
                {HouseData[placement.house].name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
