import { useEffect, useState } from "react";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import { CHIP_BASE, CHIP_NEUTRAL, chipTint } from "../utils/chipStyles";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";

// One retrograde period: where the planet turns back, and where it turns direct again.
// stationDirect is null while the planet is still retrograde at the end of the search window.
interface RetrogradePeriod {
  stationRetrograde: string;
  stationDirect: string | null;
}

// The server's answer: the planet's retrograde history around a reference date, in local time.
interface PlanetCyclesResponse {
  retrogradeNow: boolean;
  previous: RetrogradePeriod | null;
  next: RetrogradePeriod | null;
  periods: RetrogradePeriod[];
}

type CyclesState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: PlanetCyclesResponse };

// When the planet turns retrograde and direct again, around today. The last and next periods
// sit as tiles, and any others in the search window are listed below them.
export const PlanetCycles = ({ planet }: { planet: PlanetName }) => {
  const [state, setState] = useState<CyclesState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch("/timing/cycles", {
      method: "POST",
      body: JSON.stringify({ planet, date: getLocalISODate() }),
    })
      .then((data: PlanetCyclesResponse) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [planet]);

  if (state.status === "error") return <LoadError message="Could not load the cycles." />;
  if (state.status === "loading") return <Spinner />;

  const { retrogradeNow, previous, next, periods } = state.data;
  const info = PlanetsData[planet];

  // Sun, Moon, the nodes and Lilith never turn retrograde, so the search finds nothing.
  if (periods.length === 0 && !retrogradeNow) {
    return <p className="text-sm text-gray-600">{info.displayName} does not turn retrograde.</p>;
  }

  // The tiles already show the last and next period; the list is for any others in view.
  const shown = [previous?.stationRetrograde, next?.stationRetrograde];
  const others = periods.filter((period) => !shown.includes(period.stationRetrograde));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-800">
        {retrogradeNow ? `${info.displayName} is retrograde now.` : `${info.displayName} is direct now.`}
      </p>
      <dl className="grid grid-cols-2 gap-3">
        <PeriodTile label="Last" period={previous} color={info.color} glyph={info.glyph} />
        <PeriodTile label="Next" period={next} color={info.color} glyph={info.glyph} />
      </dl>
      {others.length > 0 && (
        <ul aria-label="Other retrogrades in view" className="flex flex-col gap-1.5">
          {others.map((period) => (
            <li key={period.stationRetrograde} className={`${CHIP_BASE} ${CHIP_NEUTRAL} tabular-nums`}>
              {formatPeriod(period)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// One period as a tile: the planet's glyph in its colour, then the retrograde and direct dates.
const PeriodTile = ({
  label,
  period,
  color,
  glyph,
}: {
  label: string;
  period: RetrogradePeriod | null;
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
      <dt className="text-[10px] font-semibold uppercase text-gray-500">{label} retrograde</dt>
      <dd className="m-0 text-sm font-medium tabular-nums leading-tight text-gray-900">
        {period ? formatPeriod(period) : "None found"}
      </dd>
    </div>
  </div>
);

// Two dates: the station retrograde and the station direct, or "still retrograde" if the
// period runs past the end of the window.
const formatPeriod = (period: RetrogradePeriod) => {
  const start = formatLocal(period.stationRetrograde);
  if (period.stationDirect === null) return `${start} – still retrograde`;
  return `${start} – ${formatLocal(period.stationDirect)}`;
};

// The server sends a local wall-clock time without an offset; the browser reads it as local time.
const formatLocal = (time: string) =>
  new Date(time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
