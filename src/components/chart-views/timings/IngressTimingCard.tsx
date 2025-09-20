import type { IngressTiming } from "../../../hooks/timings/getTimings";
import { DateChip, PlanetChip, SignChip } from "../../descriptions/Helpers";

export const IngressTimingCard = ({ ingress }: { ingress: IngressTiming }) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Ingress
      </h3>
      <div className="flex items-center gap-2 mb-2">
        <PlanetChip planet={ingress.planet} />
        <span className="text-gray-400">→</span>
        <SignChip sign={ingress.sign} />
      </div>
      <DateChip date={ingress.date} />
    </div>
  );
};
