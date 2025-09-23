import type { IngressTiming } from "../../../hooks/timings/useTimings";
import {
  DateChip,
  PlanetChip,
  SectionSmall,
  SignChip,
} from "../../descriptions/Helpers";
import { useState } from "react";
import { useIngressDesc } from "../../../hooks/useDescData";

export const IngressTimingCard = ({ ingress }: { ingress: IngressTiming }) => {
  const [descOpen, setDescOpen] = useState(false);

  const { loading, ingressDesc } = useIngressDesc(
    { planet: ingress.planet, sign: ingress.sign },
    descOpen,
  );

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <PlanetChip planet={ingress.planet} />
          <span className="text-gray-500 text-sm tracking-wide font-semibold">
            enters
          </span>
          <SignChip sign={ingress.sign} />
        </div>
        <DateChip date={ingress.date} format />
      </div>
      <SectionSmall
        title="Description"
        startOpen={false}
        loading={loading}
        onOpen={() => setDescOpen(true)}
      >
        {!loading && ingressDesc?.description}
      </SectionSmall>
    </div>
  );
};
