import { useEffect, useState } from "react";
import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import { CHIP_BASE, CHIP_NEUTRAL, chipTint } from "../utils/chipStyles";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";

// The server's answer: the planet's return times around a reference date, in local time.
interface PlanetReturnsResponse {
  previous: string | null;
  next: string | null;
  returns: string[];
}

type ReturnsState =
  | { status: "loading" }
  | { status: "no-profile" }
  | { status: "error" }
  | { status: "ready"; data: PlanetReturnsResponse };

// When the main profile's planet returns to its birth degree. The last and next returns sit
// either side of a bar that shows how far through the cycle today is, like the hour bar.
export const PlanetReturns = ({ planet }: { planet: PlanetName }) => {
  const { mainProfile } = useBirthProfiles();
  const profileId = mainProfile?.id;
  const [state, setState] = useState<ReturnsState>({ status: "loading" });

  useEffect(() => {
    if (profileId === undefined) {
      setState({ status: "no-profile" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch("/timing/returns", {
      method: "POST",
      body: JSON.stringify({ birthProfileId: profileId, planet, date: getLocalISODate() }),
    })
      .then((data: PlanetReturnsResponse) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, planet]);

  if (state.status === "no-profile") {
    return <LoadError message="Add a birth profile to see when this planet returns." />;
  }
  if (state.status === "error") return <LoadError message="Could not load the returns." />;
  if (state.status === "loading") return <Spinner />;

  const { previous, next, returns } = state.data;
  const info = PlanetsData[planet];
  const progress = previous && next ? cycleProgress(previous, next) : undefined;
  // The tiles already show the last and next return; the list is for any others in view.
  const others = returns.filter((time) => time !== previous && time !== next);

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-3">
        <ReturnTile label="Last" time={previous} color={info.color} glyph={info.glyph} />
        <ReturnTile label="Next" time={next} color={info.color} glyph={info.glyph} />
      </dl>
      {progress !== undefined && (
        <div
          role="progressbar"
          aria-label={`Through the cycle from the last ${info.displayName} return to the next`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="h-1.5 overflow-hidden rounded-full bg-gray-200"
        >
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: info.color }}
          />
        </div>
      )}
      {others.length > 0 && (
        <ul aria-label="Other returns in view" className="flex flex-wrap gap-1.5">
          {others.map((time) => (
            <li key={time} className={`${CHIP_BASE} ${CHIP_NEUTRAL} tabular-nums`}>
              {formatLocal(time)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// One return as a tile: the planet's glyph in its colour, then the label and the date.
const ReturnTile = ({
  label,
  time,
  color,
  glyph,
}: {
  label: string;
  time: string | null;
  color: string;
  glyph: string;
}) => (
  <div
    className="flex min-w-0 items-center gap-3 rounded-xl border p-3"
    style={{ borderColor: `${color}55`, background: `linear-gradient(135deg, ${color}1f, transparent 80%)` }}
  >
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-gray-800"
      style={chipTint(color)}
      aria-hidden="true"
    >
      {glyph}
    </span>
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="m-0 text-sm font-medium tabular-nums leading-tight text-gray-900">
        {time ? formatLocal(time) : "None found"}
      </dd>
    </div>
  </div>
);

// How far, from 0 to 100, the reference moment is between the last and next returns.
const cycleProgress = (previous: string, next: string) => {
  const start = new Date(previous).getTime();
  const end = new Date(next).getTime();
  const now = Date.now();
  if (end <= start) return undefined;
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
};

// The server sends a local wall-clock time without an offset; the browser reads it as local time.
const formatLocal = (time: string) =>
  new Date(time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
