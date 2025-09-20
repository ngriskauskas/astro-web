import type { IngressTiming } from "../../../hooks/timings/getTimings";
import {
  DateChip,
  PlanetChip,
  SectionSmall,
  SignChip,
} from "../../descriptions/Helpers";

export const IngressTimingCard = ({ ingress }: { ingress: IngressTiming }) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <PlanetChip planet={ingress.planet} />
          <span className="text-gray-500 text-sm tracking-wide font-semibold">
            enters
          </span>
          <SignChip sign={ingress.sign} />
        </div>
        <DateChip date={ingress.date} format />
      </div>
      <SectionSmall title="Description" startOpen={false}>
        some words
      </SectionSmall>
    </div>
  );
};
